'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    collection,
    getDocs,
    doc,
    runTransaction,
    getDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Candidate } from '@/types';
import {
    Box,
    Container,
    Typography,
    Card,
    Grid,
    CardMedia,
    CardContent,
    CardActions,
    Checkbox,
    Button,
    AppBar,
    Toolbar,
    Chip,
    Alert,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Paper
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function VotePage() {
    const router = useRouter();
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [maxVotes, setMaxVotes] = useState<number>(5); // Default fallback
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [voterName, setVoterName] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        // 1. Check Auth
        const storedVoterId = sessionStorage.getItem('voterId');
        const storedName = sessionStorage.getItem('voterName');

        if (!storedVoterId) {
            router.replace('/');
            return;
        }
        setVoterName(storedName || 'Unknown');

        // 2. Fetch Data
        const initData = async () => {
            try {
                // Fetch Settings
                const settingsSnap = await getDoc(doc(db, 'settings', 'config'));
                if (settingsSnap.exists()) {
                    setMaxVotes(settingsSnap.data().maxVotes || 5);
                }

                // Fetch Candidates
                const querySnapshot = await getDocs(collection(db, 'candidates'));
                const loadedCandidates: Candidate[] = [];
                querySnapshot.forEach((doc) => {
                    loadedCandidates.push({ id: doc.id, ...doc.data() } as Candidate);
                });

                // 3. Sort by Name (Korean) using localeCompare
                loadedCandidates.sort((a, b) => a.name.localeCompare(b.name, 'ko-KR'));

                setCandidates(loadedCandidates);
            } catch (err) {
                console.error(err);
                setError('데이터를 불러오는 중 오류가 발생했습니다.');
            } finally {
                setLoading(false);
            }
        };

        initData();
    }, [router]);

    const handleToggle = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(prev => prev.filter(cId => cId !== id));
        } else {
            if (selectedIds.length >= maxVotes) {
                alert(`최대 ${maxVotes}명까지만 선택할 수 있습니다.`);
                return;
            }
            setSelectedIds(prev => [...prev, id]);
        }
    };

    const calculateAge = (birthYear: number) => {
        // If age is directly stored as number, return it. 
        // Or assuming 'age' field is actually age.
        return birthYear;
    };

    const handleSubmitVote = async () => {
        if (selectedIds.length === 0) {
            alert('최소 1명 이상 선택해주세요.');
            return;
        }

        if (!confirm(`${selectedIds.length}명에게 투표하시겠습니까? 제출 후에는 수정할 수 없습니다.`)) return;

        setSubmitting(true);
        const voterId = sessionStorage.getItem('voterId');

        if (!voterId) {
            setError("인증 정보가 만료되었습니다. 다시 로그인해주세요.");
            return;
        }

        try {
            await runTransaction(db, async (transaction) => {
                // 1. Re-check Voter Status
                const voterRef = doc(db, 'voters', voterId);
                const voterSnap = await transaction.get(voterRef);

                if (!voterSnap.exists()) throw "선거인 정보를 찾을 수 없습니다.";
                if (voterSnap.data().hasVoted) throw "이미 투표에 참여하셨습니다.";

                // 2. Increment Vote Counts
                for (const candidateId of selectedIds) {
                    const candidateRef = doc(db, 'candidates', candidateId);
                    const candidateSnap = await transaction.get(candidateRef);
                    if (!candidateSnap.exists()) throw "후보자 정보가 변경되었습니다.";

                    const newCount = (candidateSnap.data().voteCount || 0) + 1;
                    transaction.update(candidateRef, { voteCount: newCount });
                }

                // 3. Mark Voter as Voted
                transaction.update(voterRef, {
                    hasVoted: true,
                    votedAt: Date.now()
                });
            });

            setSuccess(true);
            sessionStorage.clear(); // Clear session
        } catch (err: any) {
            console.error(err);
            setError(typeof err === 'string' ? err : '투표 제출 중 오류가 발생했습니다.');
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (success) {
        return (
            <Container maxWidth="sm" sx={{ mt: 10, textAlign: 'center' }}>
                <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                <Typography variant="h4" gutterBottom fontWeight="bold">
                    투표 완료
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                    소중한 한 표가 정상적으로 처리되었습니다. <br />
                    참여해 주셔서 감사합니다.
                </Typography>
                <Button variant="contained" onClick={() => router.push('/')}>
                    메인으로 돌아가기
                </Button>
            </Container>
        );
    }

    return (
        <Box sx={{ pb: 8, bgcolor: '#f8f9fa', minHeight: '100vh' }}>
            {/* Header */}
            <AppBar position="sticky" color="default" elevation={1} sx={{ bgcolor: 'white' }}>
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                        투표하기
                    </Typography>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" display="block" color="text.secondary">
                            안녕하세요, {voterName}님
                        </Typography>
                        <Typography variant="body2" color="primary" fontWeight="bold">
                            {selectedIds.length} / {maxVotes} 명 선택됨
                        </Typography>
                    </Box>
                </Toolbar>
            </AppBar>

            <Container maxWidth="md" sx={{ mt: 3 }}>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                    후보자 목록
                </Typography>

                <Grid container spacing={2}>
                    {candidates.map((candidate) => {
                        const isSelected = selectedIds.includes(candidate.id!);
                        return (
                            <Grid size={{ xs: 6, sm: 4, md: 3 }} key={candidate.id}>
                                <Card
                                    sx={{
                                        position: 'relative',
                                        cursor: 'pointer',
                                        border: isSelected ? '2px solid #1976d2' : '1px solid #eee',
                                        transition: 'all 0.2s',
                                        transform: isSelected ? 'scale(1.02)' : 'none',
                                    }}
                                    onClick={() => handleToggle(candidate.id!)}
                                >
                                    <CardMedia
                                        component="img"
                                        image={candidate.photoUrl || 'https://via.placeholder.com/150?text=No+Image'}
                                        alt={candidate.name}
                                        sx={{ height: 180, objectFit: 'cover' }}
                                    />
                                    <CardContent sx={{ p: 1.5, pb: '1.5 !important', textAlign: 'center' }}>
                                        <Typography variant="h6" component="div" fontWeight="bold">
                                            {candidate.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {candidate.position} | {candidate.age}세
                                        </Typography>
                                    </CardContent>

                                    {/* Selection Overlay/Checkbox */}
                                    <Checkbox
                                        checked={isSelected}
                                        sx={{
                                            position: 'absolute',
                                            top: 4,
                                            right: 4,
                                            color: 'primary.main',
                                            bgcolor: 'rgba(255,255,255,0.8)',
                                            '&:hover': { bgcolor: 'rgba(255,255,255,1)' },
                                            borderRadius: '50%'
                                        }}
                                    />
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            </Container>

            {/* Floating Action Button for Submit (or Bottom Bar) */}
            <Paper
                sx={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    p: 2,
                    zIndex: 1000,
                    borderTop: '1px solid #ddd'
                }}
                elevation={3}
            >
                <Container maxWidth="md">
                    <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={selectedIds.length === 0 || submitting}
                        onClick={handleSubmitVote}
                        sx={{ py: 1.5, fontSize: '1.1rem', fontWeight: 'bold' }}
                    >
                        {submitting ? '제출 중...' : '투표 완료'}
                    </Button>
                </Container>
            </Paper>
        </Box>
    );
}
