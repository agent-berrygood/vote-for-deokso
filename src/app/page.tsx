'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Voter } from '@/types';
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
// import { sendKakaoAuthCode } from '@/lib/kakaoService';

// Mock function inlined to avoid build errors with gitignored files
const sendKakaoAuthCode = async (phone: string, name: string, authKey: string): Promise<boolean> => {
  console.log(`[MOCK KAKAO] Sending AuthCode '${authKey}' to ${name} (${phone})`);
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  return true;
};

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
  const [matchedVoter, setMatchedVoter] = useState<Voter | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    if (!activeElectionId) return;

    // Basic Validation
    if (!name || !phone || !birthdate) {
      setError('모든 정보를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Find voter in DB
      const votersRef = collection(db, `elections/${activeElectionId}/voters`);
      // Note: Firestore querying with multiple fields requires an index. 
      // If we query just by 'name' and filter in client, it might be safer for now to avoid Index creation errors during dev.
      // But let's try strict query. If index error, I'll switch to client filtering.

      const q = query(
        votersRef,
        where('name', '==', name.trim()),
        where('phone', '==', phone.trim()),
        where('birthdate', '==', birthdate.trim())
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // Fallback: Try querying by Name only and check fields manually (to handle loose matching or debug)
        const nameQ = query(votersRef, where('name', '==', name.trim()));
        const nameSnap = await getDocs(nameQ);

        if (nameSnap.empty) {
          setError('선거인 명부에 존재하지 않는 사용자입니다. (이름 확인)');
          setLoading(false);
          return;
        } else {
          // Name exists but other fields didn't match
          setError('입력하신 정보(전화번호/생년월일)가 명부와 일치하지 않습니다.');
          setLoading(false);
          return;
        }
      }

      const voterDoc = querySnapshot.docs[0];
      const voterData = voterDoc.data() as Voter;

      console.log(`[DEBUG] Found Voter: ${voterData.name}, Key: ${voterData.authKey}`);

      // Send Kakao Mock
      const sent = await sendKakaoAuthCode(voterData.phone || phone, voterData.name, voterData.authKey);

      if (sent) {
        setMatchedVoter(voterData);
        setStep(2);
        alert(`[인증번호 전송됨]\n(데모) 카카오톡으로 인증번호 [${voterData.authKey}] 가 전송되었습니다.`);
      } else {
        setError('인증번호 전송에 실패했습니다.');
      }

    } catch (err) {
      console.error(err);
      setError('서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchedVoter) return;

    if (inputAuthKey.trim() === matchedVoter.authKey) {
      // Success
      sessionStorage.setItem('voterId', matchedVoter.id || '');
      sessionStorage.setItem('voterName', matchedVoter.name);
      sessionStorage.setItem('electionId', activeElectionId || ''); // Store current election ID context

      router.push('/vote');
    } else {
      setError('인증번호가 올바르지 않습니다.');
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

        <Paper sx={{ p: 4, width: '100%' }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {scheduleStatus !== 'open' && (
            <Alert severity="warning" sx={{ mb: 2, fontWeight: 'bold' }}>
              {scheduleMessage}
            </Alert>
          )}

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
                  sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1.1rem' }}
                  disabled={loading || scheduleStatus !== 'open'}
                >
                  {loading ? '확인 중...' : '인증번호 받기'}
                </Button>
              </fieldset>
            </form>
          ) : (
            <form onSubmit={handleVerify}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold" color="primary">
                인증번호 확인
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                카카오톡으로 전송된 7자리 인증번호를 입력해주세요.
              </Typography>
              <TextField
                margin="normal"
                required
                fullWidth
                label="인증번호"
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
