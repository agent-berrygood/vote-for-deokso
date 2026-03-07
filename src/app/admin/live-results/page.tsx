'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs, doc, getDoc, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useElection } from '@/hooks/useElection';
import { Candidate } from '@/types';
import {
    Box,
    Button,
    Container,
    Typography,
    Paper,
    Grid,
    CircularProgress,
    LinearProgress,
    Card,
    CardContent,
    Divider,
    Chip,
    Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RefreshIcon from '@mui/icons-material/Refresh';

const POSITIONS = ['장로', '권사', '안수집사'];

export default function LiveResultsPage() {
    const router = useRouter();
    const { activeElectionId } = useElection();
    const [loading, setLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [cooldown, setCooldown] = useState(0);

    const [stats, setStats] = useState({
        totalVoters: 0,
        totalBallots: 0
    });

    const [results, setResults] = useState<{ [pos: string]: { candidates: Candidate[], ballots: number, round: number, limit: number } }>({});

    const fetchData = useCallback(async () => {
        if (!activeElectionId) return;
        setLoading(true);

        try {
            // 1. Get Election Config
            const configRef = doc(db, `elections/${activeElectionId}/settings`, 'config');
            const configSnap = await getDoc(configRef);
            const configData = configSnap.exists() ? configSnap.data() : {};
            const rounds = configData.rounds || { '장로': 1, '권사': 1, '안수집사': 1 };
            const maxVotesMap = configData.maxVotes || { '장로': 5, '권사': 5, '안수집사': 5 };

            // 2. Get Total Voters Count
            const votersRef = collection(db, `elections/${activeElectionId}/voters`);
            const totalVotersSnap = await getDocs(votersRef);
            const totalVoters = totalVotersSnap.size;

            // 3. Get Results for each position
            const newResults: typeof results = {};
            let ballotsSum = 0;

            for (const pos of POSITIONS) {
                const round = rounds[pos] || 1;
                const limit = typeof maxVotesMap === 'number' ? maxVotesMap : (maxVotesMap[pos] || 5);

                // Count ballots for this pos_round
                const ballotQuery = query(votersRef, where(`participated.${pos}_${round}`, '==', true));
                const ballotSnap = await getDocs(ballotQuery);
                const posBallots = ballotSnap.size;
                ballotsSum += posBallots;

                // Get Candidates
                const candidateQuery = query(
                    collection(db, `elections/${activeElectionId}/candidates`),
                    where('position', '==', pos),
                    where('round', '==', round)
                );
                const candidateSnap = await getDocs(candidateQuery);
                const candidatesData: Candidate[] = [];
                candidateSnap.forEach(doc => {
                    candidatesData.push(doc.data() as Candidate);
                });

                // Sort by current round votes
                candidatesData.sort((a, b) => (b.votesByRound?.[round] || 0) - (a.votesByRound?.[round] || 0));

                newResults[pos] = {
                    candidates: candidatesData,
                    ballots: posBallots,
                    round,
                    limit
                };
            }

            setResults(newResults);
            setStats({
                totalVoters,
                totalBallots: ballotsSum // Note: This is sum of participants across buckets, might exceed totalVoters if simultaneous rounds
            });
            setLastUpdated(new Date());
            setCooldown(60); // 60 seconds cooldown
        } catch (err) {
            console.error("Error fetching live results:", err);
        } finally {
            setLoading(false);
        }
    }, [activeElectionId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Cooldown Timer
    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    const getThreshold = (pos: string, ballots: number) => {
        if (pos === '장로') return Math.ceil(ballots * (2 / 3));
        return Math.floor(ballots / 2) + 1;
    };

    if (!activeElectionId) {
        return (
            <Container sx={{ py: 4 }}>
                <Alert severity="warning">활성화된 선거가 없습니다.</Alert>
                <Button sx={{ mt: 2 }} onClick={() => router.push('/admin')}>어드민으로 돌아가기</Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button startIcon={<ArrowBackIcon />} onClick={() => router.push('/admin')}>
                        대시보드
                    </Button>
                    <Typography variant="h4" fontWeight="bold">
                        개표 종합 현황
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {lastUpdated && (
                        <Typography variant="body2" color="text.secondary">
                            최근 업데이트: {lastUpdated.toLocaleTimeString()}
                        </Typography>
                    )}
                    <Button
                        variant="contained"
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
                        onClick={fetchData}
                        disabled={loading || cooldown > 0}
                    >
                        {cooldown > 0 ? `새로고침 (${cooldown}s)` : '새로고침'}
                    </Button>
                </Box>
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card sx={{ bgcolor: '#e3f2fd' }}>
                        <CardContent>
                            <Typography color="primary" gutterBottom variant="overline" fontWeight="bold">
                                투표 참여율 (종합)
                            </Typography>
                            <Typography variant="h3" fontWeight="bold">
                                {stats.totalVoters > 0 ? ((results[POSITIONS[0]]?.ballots / stats.totalVoters) * 100).toFixed(1) : 0}%
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                전체 선거인 {stats.totalVoters}명 중 {results[POSITIONS[0]]?.ballots || 0}명 참여 (장로 기준)
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={stats.totalVoters > 0 ? (results[POSITIONS[0]]?.ballots / stats.totalVoters) * 100 : 0}
                                sx={{ mt: 2, height: 10, borderRadius: 5 }}
                            />
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card sx={{ bgcolor: '#fff3e0' }}>
                        <CardContent>
                            <Typography color="orange" gutterBottom variant="overline" fontWeight="bold">
                                실시간 투표수 (합계)
                            </Typography>
                            <Typography variant="h3" fontWeight="bold" sx={{ color: '#e65100' }}>
                                {Object.values(results).reduce((acc, curr) => acc + curr.ballots, 0)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                모든 직분/차수 합산 투표용지 수
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                {POSITIONS.map(pos => {
                    const data = results[pos];
                    if (!data) return null;
                    const threshold = getThreshold(pos, data.ballots);

                    return (
                        <Grid size={{ xs: 12 }} key={pos}>
                            <Paper sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Box>
                                        <Typography variant="h5" fontWeight="bold">
                                            {pos} ({data.round}차 투표)
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            유효 투표: {data.ballots}표 | 피택 기준: {threshold}표 이상
                                        </Typography>
                                    </Box>
                                    <Chip
                                        label={`${data.candidates.filter(c => (c.votesByRound?.[data.round] || 0) >= threshold).length}명 피택 가능`}
                                        color="success"
                                        variant="outlined"
                                        sx={{ fontWeight: 'bold' }}
                                    />
                                </Box>
                                <Divider sx={{ mb: 2 }} />
                                <Grid container spacing={2}>
                                    {data.candidates.slice(0, 10).map((c, idx) => {
                                        const votes = c.votesByRound?.[data.round] || 0;
                                        const isElected = votes >= threshold && votes > 0;
                                        const progress = data.ballots > 0 ? (votes / data.ballots) * 100 : 0;
                                        const thresholdProgress = data.ballots > 0 ? (threshold / data.ballots) * 100 : 0;

                                        return (
                                            <Grid size={{ xs: 12, md: 6 }} key={c.id}>
                                                <Box sx={{ p: 1.5, border: `1px solid ${isElected ? '#4caf50' : '#eee'}`, borderRadius: 1, bgcolor: isElected ? '#f1f8e9' : 'transparent' }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                        <Typography variant="body1" fontWeight={isElected ? "bold" : "normal"}>
                                                            {idx + 1}. {c.name} {isElected && '✅'}
                                                        </Typography>
                                                        <Typography variant="body1" fontWeight="bold" color={isElected ? "success.main" : "primary"}>
                                                            {votes}표
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ position: 'relative', height: 8, bgcolor: '#eee', borderRadius: 4, overflow: 'hidden' }}>
                                                        <Box sx={{
                                                            width: `${progress}%`,
                                                            height: '100%',
                                                            bgcolor: isElected ? '#4caf50' : '#2196f3',
                                                            transition: 'width 0.5s ease-in-out'
                                                        }} />
                                                        {/* Threshold marker */}
                                                        <Box sx={{
                                                            position: 'absolute',
                                                            left: `${thresholdProgress}%`,
                                                            top: 0,
                                                            bottom: 0,
                                                            width: 2,
                                                            bgcolor: 'red',
                                                            opacity: 0.5
                                                        }} />
                                                    </Box>
                                                </Box>
                                            </Grid>
                                        );
                                    })}
                                    {data.candidates.length > 10 && (
                                        <Grid size={{ xs: 12 }}>
                                            <Typography variant="caption" color="text.secondary" textAlign="center" display="block">
                                                ... 외 {data.candidates.length - 10}명 생략됨 ...
                                            </Typography>
                                        </Grid>
                                    )}
                                </Grid>
                            </Paper>
                        </Grid>
                    );
                })}
            </Grid>
        </Container>
    );
}
