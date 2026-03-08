'use client';

import { useParams, useRouter } from 'next/navigation';
import { Box, Container, Typography, IconButton, Breadcrumbs, Link } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CandidatePositionManager from '@/components/CandidatePositionManager';

export default function CandidatePositionPage() {
    const params = useParams();
    const router = useRouter();
    const position = decodeURIComponent(params.position as string);

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                    <Link underline="hover" color="inherit" href="/admin" onClick={(e) => { e.preventDefault(); router.push('/admin'); }} sx={{ cursor: 'pointer' }}>
                        어드민
                    </Link>
                    <Typography color="text.primary">{position} 후보 관리</Typography>
                </Breadcrumbs>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconButton onClick={() => router.push('/admin')}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h4" component="h1" fontWeight="bold">
                        {position} 후보자 통합 관리
                    </Typography>
                </Box>
            </Box>

            <CandidatePositionManager position={position} />
        </Container>
    );
}
