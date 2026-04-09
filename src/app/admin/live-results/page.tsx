'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useElection } from '@/hooks/useElection';
import { Candidate } from '@/types';
import {
    getElectionSettings,
    getResultsByRound
} from '@/lib/dataconnect';
import {
    Box,
    Button,
    Container,
    Typography,
    Paper,
    Grid,
    CircularProgress,
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
            // 1. Get Election Settings (SQL)
            const resS = await getElectionSettings({ electionId: activeElectionId });
            const sData = resS.data.election;
            if (!sData) throw new Error("Election settings not found");

            // Parse rounds from JSON string
            let roundsMap: Record<string, number> = { '장로': 1, '권사': 1, '안수집사': 1 };
            try {
                if (sData.rounds) {
                    roundsMap = JSON.parse(sData.rounds);
                }
            } catch (e) {
                console.error("Failed to parse rounds JSON:", e);
            }

            const maxVoteLimit = sData.maxVotes || 5;

            // 2. Get Results for each position (SQL)
            const newResults: typeof results = {};
            let ballotsSum = 0;

            for (const pos of POSITIONS) {
                const round = roundsMap[pos] || 1;
                const limit = maxVoteLimit;

                const resR = await getResultsByRound({
                    electionId: activeElectionId,
                    position: pos,
                    round: round
                });
                
                const candidatesData = resR.data.candidates as Candidate[];
                const posBallots = candidatesData.reduce((acc, curr) => acc + (curr.voteCount || 0), 0);
                ballotsSum += posBallots;

                newResults[pos] = {
                    candidates: candidatesData,
                    ballots: posBallots,
                    round,
                    limit
                };
            }

            setResults(newResults);
            setStats({
                totalVoters: 0, 
                totalBallots: ballotsSum
            });
            setLastUpdated(new Date());
            setCooldown(30); 
        } catch (err) {
            console.error("Error fetching live SQL results:", err);
        } finally {
            setLoading(false);
        }
    }, [activeElectionId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    const getThreshold = (pos: string, ballots: number) => {
        if (ballots <= 0) return 999999;
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
                        개표 종합 현황 (SQL)
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
                <Grid size={{ xs: 12 }}>
                    <Card sx={{ bgcolor: '#fff3e0' }}>
                        <CardContent>
                            <Typography color="orange" gutterBottom variant="overline" fontWeight="bold">
                                실시간 전체 득표수 (합계)
                            </Typography>
                            <Typography variant="h3" fontWeight="bold" sx={{ color: '#e65100' }}>
                                {stats.totalBallots}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                모든 직분/차수 유효 투표 합계
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
                                            총 득표 합계: {data.ballots}표 | 피택 기준: {threshold}표 이상
                                        </Typography>
                                    </Box>
                                    <Chip
                                        label={`${data.candidates.filter(c => {
                                            const v = c.voteCount || 0;
                                            return data.ballots > 0 && v >= threshold && v > 0;
                                        }).length}명 피택 가능`}
                                        color="success"
                                        variant="outlined"
                                        sx={{ fontWeight: 'bold' }}
                                    />
                                </Box>
                                <Divider sx={{ mb: 2 }} />
                                <Grid container spacing={2}>
                                    {data.candidates.slice(0, 10).map((c, idx) => {
                                        const votes = c.voteCount || 0;
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
