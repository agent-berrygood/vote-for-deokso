'use client';

import { useRouter } from 'next/navigation';
import { Box, Container, Typography, IconButton, Breadcrumbs, Link } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VoterManager from '@/components/VoterManager';

export default function VoterManagementPage() {
    const router = useRouter();

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                    <Link underline="hover" color="inherit" href="/admin" onClick={(e) => { e.preventDefault(); router.push('/admin'); }} sx={{ cursor: 'pointer' }}>
                        어드민
                    </Link>
                    <Typography color="text.primary">선거인 명부 관리</Typography>
                </Breadcrumbs>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconButton onClick={() => router.push('/admin')}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h4" component="h1" fontWeight="bold">
                        선거인 명부 통합 관리
                    </Typography>
                </Box>
            </Box>

            <VoterManager />
        </Container>
    );
}
