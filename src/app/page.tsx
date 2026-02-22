'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import {
  Box,
  Button,
  Container,
  Typography,
  TextField,
  Alert,
  Paper,
  CircularProgress
} from '@mui/material';
import { useElection } from '@/hooks/useElection';
import { RecaptchaVerifier, ConfirmationResult } from 'firebase/auth';

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier | undefined;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const { activeElectionId, loading: electionLoading } = useElection();

  const [step, setStep] = useState<1 | 2>(1); // 1: Info Input, 2: Auth Verification

  // Step 1 Inputs
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthdate, setBirthdate] = useState('');

  // Step 2 Input
  const [inputAuthKey, setInputAuthKey] = useState('');

  // Internal State
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Firebase Auth State
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const recaptchaContainerRef = useRef<HTMLDivElement>(null);

  // Initialize Recaptcha
  useEffect(() => {
    // 1. Cleanup previous verifier if exists (important for SPA navigation)
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (e) {
        console.error("Failed to clear previous recaptcha", e);
      }
      window.recaptchaVerifier = undefined;
    }

    // 2. Initialize new verifier
    if (recaptchaContainerRef.current) {
      import('firebase/auth').then(({ RecaptchaVerifier }) => {
        if (recaptchaContainerRef.current) {
          try {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
              'size': 'invisible',
              'callback': () => {
                console.log("Recaptcha verified");
              },
              'expired-callback': () => {
                console.log("Recaptcha expired");
              }
            });
          } catch (e) {
            console.error("Recaptcha Init Error:", e);
          }
        }
      });
    }

    // Cleanup on unmount
    return () => {
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (e) {
          console.error(e);
        }
        window.recaptchaVerifier = undefined;
      }
    };
  }, [electionLoading]); // Run when loading finishes and DOM exists

  // Voting Schedule State
  const [scheduleStatus, setScheduleStatus] = useState<'open' | 'not_started' | 'ended'>('open');
  const [scheduleMessage, setScheduleMessage] = useState('');

  useEffect(() => {
    if (!activeElectionId) return;

    const checkSchedule = async () => {
      try {
        const settingsSnap = await getDoc(doc(db, `elections/${activeElectionId}/settings`, 'config'));
        if (settingsSnap.exists()) {
          const data = settingsSnap.data();
          const now = new Date();

          if (data.startDate) {
            const start = new Date(data.startDate);
            if (now < start) {
              setScheduleStatus('not_started');
              setScheduleMessage(`투표 시작 전입니다. (${start.toLocaleString()})`);
              return;
            }
          }

          if (data.endDate) {
            const end = new Date(data.endDate);
            if (now > end) {
              setScheduleStatus('ended');
              setScheduleMessage(`투표가 종료되었습니다. (${end.toLocaleString()})`);
              return;
            }
          }
        }
        setScheduleStatus('open');
        setScheduleMessage('');
      } catch (err) {
        console.error("Error checking schedule:", err);
      }
    };

    checkSchedule();
  }, [activeElectionId]);

  // Clear error on input change
  useEffect(() => { setError(''); }, [name, phone, birthdate, inputAuthKey]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    let formatted = rawValue;

    if (rawValue.length > 3 && rawValue.length <= 7) {
      formatted = `${rawValue.slice(0, 3)}-${rawValue.slice(3)}`;
    } else if (rawValue.length > 7) {
      formatted = `${rawValue.slice(0, 3)}-${rawValue.slice(3, 7)}-${rawValue.slice(7, 11)}`;
    }

    setPhone(formatted);
  };

  const handleRequestAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Button Clicked - v0.2");

    if (!activeElectionId) {
      console.log("No Active Election ID");
      setError('현재 진행 중인 선거가 없거나 설정을 불러오지 못했습니다.');
      return;
    }

    // Basic Validation
    const cleanName = name.trim();
    if (!cleanName || !phone || !birthdate) {
      console.log("Validation Failed:", { name, phone, birthdate });
      setError('모든 정보를 입력해주세요.');
      return;
    }

    if (cleanName.length > 20) {
      setError('이름은 20자를 초과할 수 없습니다.');
      return;
    }

    const phoneRegex = /^01[0-9]-\d{3,4}-\d{4}$/;
    if (!phoneRegex.test(phone)) {
      setError('올바른 휴대전화 번호 형식이 아닙니다.');
      return;
    }

    const birthdateRegex = /^\d{6}$/;
    if (!birthdateRegex.test(birthdate)) {
      setError('생년월일 6자리를 정확히 입력해주세요.');
      return;
    }

    // Format Phone for Firebase (+82)
    const formattedPhone = phone.replace(/-/g, '').replace(/^0/, '+82');

    setLoading(true);
    setError('');

    try {
      // 1. Check if user exists in Firestore
      const votersRef = collection(db, `elections/${activeElectionId}/voters`);
      const q = query(
        votersRef,
        where('name', '==', name.trim()),
        where('phone', '==', phone.trim()),
        where('birthdate', '==', birthdate.trim())
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setError('등록된 선거인 정보가 없습니다. (이름, 전화번호, 생년월일 확인)');
        setLoading(false);
        return;
      }

      const voterDoc = snapshot.docs[0];

      // 2. Send SMS via Firebase
      const { signInWithPhoneNumber } = await import('firebase/auth');

      // Ensure verifier exists (should be done in useEffect, but safe check)
      if (!window.recaptchaVerifier) {
        setError("보안 인증 초기화 중입니다. 잠시 후 다시 시도해주세요.");
        setLoading(false);
        return;
      }

      const appVerifier = window.recaptchaVerifier;

      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
      setStep(2);

      // Save voter ID for later use
      sessionStorage.setItem('tempVoterId', voterDoc.id);
      sessionStorage.setItem('tempVoterName', name);

    } catch (err: unknown) {
      console.error("Auth Error Object:", err);

      let errorCode = 'unknown';
      if (err && typeof err === 'object' && 'code' in err) {
        errorCode = (err as { code: string }).code;
      } else if (err instanceof Error) {
        errorCode = err.message;
      }

      if (errorCode === 'auth/invalid-phone-number') {
        setError('유효하지 않은 전화번호입니다.');
      } else if (errorCode === 'auth/too-many-requests') {
        setError('너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.');
      } else if (errorCode === 'auth/captcha-check-failed') {
        setError('로봇 인증에 실패했습니다. 다시 시도해주세요.');
      } else {
        setError(`인증 번호 발송 실패 (${errorCode}). 관리자에게 문의하세요.`);
      }

      // Reset Recaptcha on error if needed
      if (window.recaptchaVerifier) {
        try {
          // RecaptchaVerifier might not have render method exposed easily on window object typed as 'any' previously
          // But we can try to re-render or just let it be.
          // window.recaptchaVerifier.render().then((widgetId: any) => { });
          // Simply logging for now as reset is complex without widget ID stored
          console.log("Recaptcha might need reset");
        } catch (e) {
          console.error(e);
        }
      }

    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult && !inputAuthKey) return; // Should have result and input

    if (!inputAuthKey) {
      setError('인증번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      // 3. Confirm Code
      await confirmationResult?.confirm(inputAuthKey);

      // 4. Success -> Proceed
      const tempVoterId = sessionStorage.getItem('tempVoterId');
      const tempVoterName = sessionStorage.getItem('tempVoterName');

      if (tempVoterId && tempVoterName) {
        sessionStorage.setItem('voterId', tempVoterId);
        sessionStorage.setItem('voterName', tempVoterName);
        sessionStorage.setItem('electionId', activeElectionId || '');
        router.push('/vote');
      } else {
        setError("로그인 정보가 유실되었습니다. 처음부터 다시 시도해주세요.");
        setStep(1);
      }

    } catch (error: unknown) {
      console.error("Verification Error:", error);
      let errorCode = 'unknown';
      if (error && typeof error === 'object' && 'code' in error) {
        errorCode = (error as { code: string }).code;
      } else if (error instanceof Error) {
        errorCode = error.message;
      }

      if (errorCode.includes('invalid-verification-code')) {
        setError('인증번호가 올바르지 않습니다.');
      } else {
        setError(`인증 실패 (${errorCode}). 다시 시도해주세요.`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (electionLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  }

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
          높은뜻덕소교회 장로, 안수집사, 권사 선거
        </Typography>

        <Box sx={{ mt: 1, width: '100%' }}>
          <div ref={recaptchaContainerRef}></div>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {scheduleStatus !== 'open' && (
            <Alert severity="warning" sx={{ mb: 2, fontWeight: 'bold' }}>
              {scheduleMessage}
            </Alert>
          )}
        </Box>


        <Paper sx={{ p: 4, width: '100%' }}>
          {step === 1 ? (
            <form onSubmit={handleRequestAuth}>
              <fieldset disabled={scheduleStatus !== 'open'} style={{ border: 'none', padding: 0 }}>
                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                  선거인 본인 확인
                </Typography>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="이름"
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="전화번호"
                  placeholder="010-0000-0000"
                  value={phone}
                  onChange={handlePhoneChange}
                  inputProps={{ maxLength: 13 }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="생년월일 (6자리)"
                  placeholder="YYMMDD"
                  inputProps={{ maxLength: 6 }}
                  value={birthdate}
                  onChange={(e) => setBirthdate(e.target.value)}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2, bgcolor: '#333', '&:hover': { bgcolor: '#555' } }}
                  onClick={handleRequestAuth}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : '인증 확인'}
                </Button>
              </fieldset>
            </form>
          ) : (
            <form onSubmit={handleConfirmCode}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold" color="primary">
                인증번호 확인
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                문자로 전송된 6자리 인증번호를 입력해주세요.
              </Typography>
              <TextField
                margin="normal"
                required
                fullWidth
                label="인증번호 (6자리)"
                autoFocus
                value={inputAuthKey}
                onChange={(e) => setInputAuthKey(e.target.value)}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1.1rem' }}
                disabled={loading}
              >
                투표 입장
              </Button>
              <Button
                fullWidth
                variant="text"
                onClick={() => { setStep(1); setError(''); }}
              >
                뒤로 가기
              </Button>
            </form>
          )}

        </Paper>
      </Box>
    </Container>
  );
}
