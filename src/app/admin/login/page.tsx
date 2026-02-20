'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Button, Container, TextField, Typography, Paper } from '@mui/material';

export default function AdminLogin() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Simple hardcoded password for now, as per plan. 
        // In production, this should be an env var or Firebase Auth.
        const CORRECT_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'vote2026';

        if (password === CORRECT_PASSWORD) {
            sessionStorage.setItem('admin_auth', 'true');
            // Also set isAdmin for compatibility if needed, but my admin page uses admin_auth
            sessionStorage.setItem('isAdmin', 'true');
            router.push('/admin');
        } else {
            setError('Incorrect password');
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
                        />
                        <Button type="submit" variant="contained" size="large" fullWidth>
                            Login
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Container>
    );
}
