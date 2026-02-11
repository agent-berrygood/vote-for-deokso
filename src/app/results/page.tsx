'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Candidate } from '@/types';
import { useElection } from '@/hooks/useElection';
import {
    Box,
    Container,
    Typography,
    Paper,
    CircularProgress,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Tabs,
    Tab,
    Avatar,
    Chip
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

export default function ResultsPage() {
    const { activeElectionId, loading: electionLoading } = useElection();
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(false);
    const [viewRound, setViewRound] = useState<number>(1);
    const [tabIndex, setTabIndex] = useState(0);

    // Positions to tabs mapping
    const POSITIONS = ['ALL', '장로', '안수집사', '권사'];

    const fetchResults = async () => {
        if (!activeElectionId) return;

        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, `elections/${activeElectionId}/candidates`));
            const loaded: Candidate[] = [];
            querySnapshot.forEach((doc) => {
                loaded.push(doc.data() as Candidate);
            });

            // Sort by votes in current round descending
            loaded.sort((a, b) => (b.votesByRound?.[viewRound] || 0) - (a.votesByRound?.[viewRound] || 0));
            setCandidates(loaded);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResults();
        const interval = setInterval(fetchResults, 10000); // Auto refresh every 10s
        return () => clearInterval(interval);
    }, [activeElectionId, viewRound]);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabIndex(newValue);
    };

    const filteredCandidates = tabIndex === 0
        ? candidates
        : candidates.filter(c => c.position === POSITIONS[tabIndex]);

    // Re-sort filtered list to ensure ranking is correct within category
    // (Global sort might not be enough if categories have different vote scales, though usually it is)
    const rankedCandidates = [...filteredCandidates].sort((a, b) => (b.votesByRound?.[viewRound] || 0) - (a.votesByRound?.[viewRound] || 0));

    if (electionLoading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;

    return (
        <Container maxWidth="lg" sx={{ py: 4, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h3" fontWeight="900" color="primary" gutterBottom>
                    🗳 {activeElectionId} 개표 현황
                </Typography>
                <Typography variant="h6" color="text.secondary">
                    실시간 득표 집계 (10초 자동 갱신)
                </Typography>
            </Box>

            <Paper sx={{ mb: 4, borderRadius: 2 }}>
                <Tabs
                    value={tabIndex}
                    onChange={handleTabChange}
                    centered
                    variant="fullWidth"
                    textColor="primary"
                    indicatorColor="primary"
                    sx={{ '& .MuiTab-root': { fontSize: '1.1rem', fontWeight: 'bold', py: 2 } }}
                >
                    {POSITIONS.map((pos) => (
                        <Tab key={pos} label={pos === 'ALL' ? '전체 보기' : pos} />
                    ))}
                </Tabs>
            </Paper>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4 }}>
                {[1, 2, 3].map(round => (
                    <Chip
                        key={round}
                        label={`${round}차 투표`}
                        color={viewRound === round ? 'primary' : 'default'}
                        onClick={() => setViewRound(round)}
                        sx={{ px: 2, py: 2.5, fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}
                    />
                ))}
            </Box>

            {loading && candidates.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}>
                    <CircularProgress size={60} />
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {rankedCandidates.map((candidate, index) => {
                        const voteCount = candidate.votesByRound?.[viewRound] || 0;
                        const isWinner = index < 3 && voteCount > 0; // Top 3 highlight

                        return (
                            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={candidate.id}>
                                <Card
                                    elevation={isWinner ? 8 : 2}
                                    sx={{
                                        height: '100%',
                                        position: 'relative',
                                        border: isWinner ? '2px solid #fdc500' : 'none',
                                        transform: isWinner ? 'scale(1.02)' : 'none',
                                        transition: 'transform 0.2s'
                                    }}
                                >
                                    {index < 3 && (
                                        <Box sx={{
                                            position: 'absolute',
                                            top: 10,
                                            left: 10,
                                            zIndex: 1,
                                            bgcolor: '#fdc500',
                                            color: '#000',
                                            px: 2,
                                            py: 0.5,
                                            borderRadius: 4,
                                            fontWeight: 'bold',
                                            boxShadow: 2,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 0.5
                                        }}>
                                            <EmojiEventsIcon fontSize="small" /> Rank {index + 1}
                                        </Box>
                                    )}

                                    <Box sx={{ pt: 3, display: 'flex', justifyContent: 'center' }}>
                                        <Avatar
                                            src={candidate.photoUrl}
                                            sx={{ width: 120, height: 120, mb: 1, border: '4px solid white', boxShadow: 3 }}
                                        />
                                    </Box>

                                    <CardContent sx={{ textAlign: 'center' }}>
                                        <Typography variant="h5" fontWeight="bold" gutterBottom>
                                            {candidate.name}
                                        </Typography>
                                        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                                            {candidate.position} (만 {candidate.age}세)
                                        </Typography>

                                        <Box sx={{ mt: 2, bgcolor: '#e3f2fd', p: 2, borderRadius: 2 }}>
                                            <Typography variant="h4" color="primary" fontWeight="900">
                                                {voteCount}표
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            )}
        </Container>
    );
}
