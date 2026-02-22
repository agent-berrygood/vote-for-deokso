'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Button, Container, TextField, Typography, Paper } from '@mui/material';
import { loginAdmin } from '@/app/actions/auth';

export default function AdminLogin() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await loginAdmin(password);

            if (res.success) {
                // Keep sessionStorage for backward compatibility with other parts if they exist
                sessionStorage.setItem('admin_auth', 'true');
                sessionStorage.setItem('isAdmin', 'true');

                // Force a hard refresh to ensure middleware and server components see the cookie
                window.location.href = '/admin';
            } else {
                setError(res.message || '로그인 실패');
            }
        } catch (err) {
            console.error(err);
            setError('서버 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100vh' }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h4" gutterBottom align="center" fontWeight="bold">
                    Admin Login
                </Typography>
                <form onSubmit={handleLogin}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <TextField
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            fullWidth
                            error={!!error}
                            helperText={error}
                            disabled={loading}
                        />
                        <Button type="submit" variant="contained" size="large" fullWidth disabled={loading}>
                            {loading ? '로그인 중...' : 'Login'}
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Container>
    );
}
