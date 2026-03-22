import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Container, Typography, IconButton, Breadcrumbs, Link, ToggleButtonGroup, ToggleButton, Paper, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CandidatePositionManager from '@/components/CandidatePositionManager';

const POSITIONS = ['장로', '안수집사', '권사'];

function IntegratedCandidateManagerContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialPosition = searchParams.get('pos') || '장로';

    const [selectedPosition, setSelectedPosition] = useState(initialPosition);

    const handlePositionChange = (
        event: React.MouseEvent<HTMLElement>,
        newPosition: string | null,
    ) => {
        if (newPosition !== null) {
            setSelectedPosition(newPosition);
            const params = new URLSearchParams(searchParams.toString());
            params.set('pos', newPosition);
            window.history.replaceState(null, '', `?${params.toString()}`);
        }
    };

    return (
        <>
            <Box sx={{ mb: 4 }}>
                <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                    <Link underline="hover" color="inherit" href="/admin" onClick={(e) => { e.preventDefault(); router.push('/admin'); }} sx={{ cursor: 'pointer' }}>
                        어드민
                    </Link>
                    <Typography color="text.primary">후보자 정밀 관리</Typography>
                </Breadcrumbs>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <IconButton onClick={() => router.push('/admin')}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h4" component="h1" fontWeight="bold">
                        후보자 통합 정밀 관리
                    </Typography>
                </Box>

                <Paper sx={{ p: 1, display: 'inline-block', mb: 2 }}>
                    <ToggleButtonGroup
                        value={selectedPosition}
                        exclusive
                        onChange={handlePositionChange}
                        aria-label="position selection"
                        color="primary"
                    >
                        {POSITIONS.map((pos) => (
                            <ToggleButton key={pos} value={pos} sx={{ px: 4, fontWeight: 'bold' }}>
                                {pos}
                            </ToggleButton>
                        ))}
                    </ToggleButtonGroup>
                </Paper>
            </Box>

            <CandidatePositionManager position={selectedPosition} />
        </>
    );
}

export default function IntegratedCandidateManagerPage() {
    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Suspense fallback={
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                    <CircularProgress />
                </Box>
            }>
                <IntegratedCandidateManagerContent />
            </Suspense>
        </Container>
    );
}
