'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Voter } from '@/types';
import {
  Box,
  Button,
  Container,
  Typography,
  TextField,
  Alert,
  Paper
} from '@mui/material';

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [authKey, setAuthKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const votersRef = collection(db, 'voters');
      const q = query(
        votersRef,
        where('name', '==', name.trim()),
        where('authKey', '==', authKey.trim())
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('이름 또는 식별번호가 일치하지 않습니다. (명부에 등록되었는지 확인해주세요)');
        setLoading(false);
        return;
      }

      const voterDoc = querySnapshot.docs[0];
      const voterData = voterDoc.data() as Voter;

      if (voterData.hasVoted) {
        setError('이미 투표에 참여하셨습니다.');
        setLoading(false);
        return;
      }

      // Store voter info in sessionStorage
      sessionStorage.setItem('voterId', voterDoc.id);
      sessionStorage.setItem('voterName', voterData.name);

      router.push('/vote');
    } catch (err) {
      console.error(err);
      setError('로그인 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
          덕소교회 항존직 선거
        </Typography>
        <Paper sx={{ p: 4, width: '100%' }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <form onSubmit={handleLogin}>
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
              label="식별번호 (생년월일/코드)"
              type="password"
              value={authKey}
              onChange={(e) => setAuthKey(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1.1rem' }}
              disabled={loading}
            >
              {loading ? '확인 중...' : '투표 입장'}
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
}
