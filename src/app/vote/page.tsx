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
import { calculateAge } from '@/utils/age';
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
    Paper,
    Tabs,
    Tab
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

import { useElection } from '@/hooks/useElection';
import { getHangulInitial, ALPHABET_TABS } from '@/utils/hangul';

export default function VotePage() {
    const router = useRouter();
    const { activeElectionId, loading: electionLoading } = useElection(); // Add Hook

    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Changed maxVotes to a map
    const [maxVotesMap, setMaxVotesMap] = useState<{ [pos: string]: number }>({
        '장로': 5,
        '권사': 5,
        '안수집사': 5
    });

    const [rounds, setRounds] = useState<{ [pos: string]: number }>({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [voterName, setVoterName] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Filter & Sort State
    const [activeTab, setActiveTab] = useState('ALL');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    // Sequential Voting State
    const [votingQueue, setVotingQueue] = useState<string[]>([]);
    const [currentPosition, setCurrentPosition] = useState<string>('');
    const POSITION_ORDER = ['장로', '안수집사', '권사'];

    // --- FILTER & SORT LOGIC ---
    const filteredCandidates = candidates.filter(c => {
        if (activeTab === 'ALL') return true;
        return getHangulInitial(c.name) === activeTab;
    }).sort((a, b) => {
        const comparison = a.name.localeCompare(b.name, 'ko');
        return sortOrder === 'asc' ? comparison : -comparison;
    });

    const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
        setActiveTab(newValue);
    };

    const toggleSortOrder = () => {
        setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    };

    useEffect(() => {
        if (electionLoading) return; // Wait for election ID
        if (!activeElectionId) {
            console.log("No active election");
            return;
        }

        // 1. Check Auth
        const storedVoterId = sessionStorage.getItem('voterId');
        const storedName = sessionStorage.getItem('voterName');
        const storedElectionId = sessionStorage.getItem('electionId');

        if (!storedVoterId) {
            router.replace('/');
            return;
        }

        // Safety check: Needs to match current election
        // However, we might rely on the voterId being valid in the current collection.
        // Better store electionId in session too during login (TODO)

        setVoterName(storedName || 'Unknown');

        // 2. Fetch Data
        const initData = async () => {
            try {
                // Fetch Settings from Active Election
                const settingsSnap = await getDoc(doc(db, `elections/${activeElectionId}/settings`, 'config'));
                if (settingsSnap.exists()) {
                    const data = settingsSnap.data();

                    // Handle Legacy maxVotes (number) vs New maxVotes (map)
                    if (typeof data.maxVotes === 'number') {
                        setMaxVotesMap({
                            '장로': data.maxVotes,
                            '권사': data.maxVotes,
                            '안수집사': data.maxVotes
                        });
                    } else if (data.maxVotes) {
                        setMaxVotesMap(data.maxVotes);
                    }

                    setRounds(data.rounds || { '장로': 1, '권사': 1, '안수집사': 1 });
                }

                // Fetch Candidates from Active Election
                const querySnapshot = await getDocs(collection(db, `elections/${activeElectionId}/candidates`));
                const loadedCandidates: Candidate[] = [];
                const currentSettings = settingsSnap.exists() ? settingsSnap.data().rounds : { '장로': 1, '권사': 1, '안수집사': 1 };

                querySnapshot.forEach((doc) => {
                    const c = { id: doc.id, ...doc.data() } as Candidate;
                    // Filter: Candidate Round MUST match System Round for their position
                    const targetRound = currentSettings[c.position] || 1;
                    if (c.round === targetRound) {
                        loadedCandidates.push(c);
                    }
                });

                // 3. Determine Voting Queue
                const voterRef = doc(db, `elections/${activeElectionId}/voters`, storedVoterId);
                const voterSnap = await getDoc(voterRef);
                const participated = voterSnap.exists() ? voterSnap.data().participated || {} : {};
                const queue: string[] = [];

                POSITION_ORDER.forEach(pos => {
                    const roundForPos = currentSettings[pos] || 1;
                    const key = `${pos}_${roundForPos}`;
                    if (!participated[key]) {
                        queue.push(pos);
                    }
                });

                setVotingQueue(queue);
                if (queue.length > 0) {
                    setCurrentPosition(queue[0]);
                } else {
                    setSuccess(true); // Already finished everything
                }

                setCandidates(loadedCandidates);

            } catch (err) {
                console.error(err);
                setError('데이터를 불러오는 중 오류가 발생했습니다.');
            } finally {
                setLoading(false);
            }
        };

        initData();
    }, [router, activeElectionId, electionLoading]);

    const handleToggle = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(prev => prev.filter(cId => cId !== id));
        } else {
            // Check maxVotes for CURRENT POSITION
            const currentLimit = maxVotesMap[currentPosition] || 5;

            if (selectedIds.length >= currentLimit) {
                alert(`'${currentPosition}' 직분은 최대 ${currentLimit}명까지만 선택할 수 있습니다.`);
                return;
            }
            setSelectedIds(prev => [...prev, id]);
        }
    };



    const handleSubmitVote = async () => {
        if (selectedIds.length === 0) {
            if (!confirm("아무도 선택하지 않으셨습니다. 이 단계(직분)를 건너뛰시겠습니까?")) return;
        } else {
            if (!confirm(`${selectedIds.length}명에게 투표하시겠습니까? 제출 후에는 수정할 수 없습니다.`)) return;
        }

        setSubmitting(true);
        const voterId = sessionStorage.getItem('voterId');

        if (!voterId || !activeElectionId) {
            setError("인증 정보가 만료되었습니다. 다시 로그인해주세요.");
            return;
        }

        try {
            await runTransaction(db, async (transaction) => {
                // --- READ PHASE ---
                // 1. Read Voter
                const voterRef = doc(db, `elections/${activeElectionId}/voters`, voterId);
                const voterSnap = await transaction.get(voterRef);

                if (!voterSnap.exists()) throw "선거인 정보를 찾을 수 없습니다.";
                const voterData = voterSnap.data();

                // Validate Current Step
                const roundForThisPos = rounds[currentPosition] || 1;
                const groupKey = `${currentPosition}_${roundForThisPos}`;

                if (voterData.participated?.[groupKey]) {
                    throw "이미 이 단계의 투표에 참여하셨습니다.";
                }

                // Multi-Round Check Per Position
                // Instead of global block, we check if the user is voting for candidates 
                // in positions they already voted for IN THIS ROUND.

                // 1. Identify which "Position_Round" tuples are being voted on

                // ... Moving Logic to Step 2 ... 

                // Legacy Check Removal (or adapt if needed)
                // if (!voterData.participatedRounds && currentRound === 1 && voterData.hasVoted) ...
                // -> Let's treat legacy 'hasVoted' as "Round 1 Global" if we need to.
                // For now, assume fresh start or robust new data.

                // 2. Read All Candidates
                // 2. Read All Candidates & Validate Group Voting Status
                const candidateSnaps = [];
                // const groupsToUpdate = new Set<string>(); // No longer needed, we validate currentPosition's groupKey

                for (const candidateId of selectedIds) {
                    const candidateRef = doc(db, `elections/${activeElectionId}/candidates`, candidateId);
                    const candidateSnap = await transaction.get(candidateRef);
                    if (!candidateSnap.exists()) throw "후보자 정보가 변경되었습니다.";

                    const cData = candidateSnap.data() as Candidate;
                    // const groupKey = `${cData.position}_${cData.round || 1}`; // No longer needed here

                    // CHECK: Has voter already voted for this group? (Moved to before candidate loop)
                    // if (voterData.participated?.[groupKey]) {
                    //     throw `이미 '${cData.position} ${cData.round || 1}차' 투표에 참여하셨습니다.`;
                    // }

                    // groupsToUpdate.add(groupKey); // No longer needed
                    candidateSnaps.push({ ref: candidateRef, snap: candidateSnap, data: cData });
                }

                // --- WRITE PHASE ---
                // --- WRITE PHASE ---
                // 3. Update Candidates
                for (const { ref, data } of candidateSnaps) {
                    const newTotal = (data.voteCount || 0) + 1;
                    const cRound = data.round || 1;

                    // Update votesByRound
                    const votesByRound = data.votesByRound || {};
                    votesByRound[cRound] = (votesByRound[cRound] || 0) + 1;

                    transaction.update(ref, {
                        voteCount: newTotal,
                        votesByRound: votesByRound
                    });
                }

                // 4. Update Voter Participation
                const newParticipated = voterData.participated || {};
                newParticipated[groupKey] = true;

                transaction.update(voterRef, {
                    participated: newParticipated,
                    votedAt: Date.now(),
                    hasVoted: false
                });
            });

            // On Success: Move to next step
            const remainingQueue = votingQueue.slice(1);
            console.log(`[DEBUG] Vote submitted. Current: ${currentPosition}, Remaining: ${remainingQueue}`);

            setVotingQueue(remainingQueue);
            setSelectedIds([]); // Reset selection
            window.scrollTo(0, 0);

            if (remainingQueue.length > 0) {
                setCurrentPosition(remainingQueue[0]);
            } else {
                setSuccess(true);
                // Do NOT clear session here. Wait for user to click "Exit".
                // sessionStorage.clear(); 
            }

        } catch (err: any) {
            console.error(err);
            alert(typeof err === 'string' ? err : '투표 제출 실패');
        } finally {
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
                <Button variant="contained" onClick={() => {
                    sessionStorage.clear();
                    router.push('/');
                }}>
                    메인으로 돌아가기
                </Button>
            </Container>
        );
    }

    // Filter & Sort Candidates
    const finalCandidates = candidates
        .filter(c => c.position === currentPosition)
        .filter(c => {
            if (activeTab === 'ALL') return true;
            return getHangulInitial(c.name) === activeTab;
        })
        .sort((a, b) => {
            const comparison = a.name.localeCompare(b.name, 'ko');
            return sortOrder === 'asc' ? comparison : -comparison;
        });

    return (
        <Box sx={{ pb: 8, bgcolor: '#f8f9fa', minHeight: '100vh' }}>
            {/* Header */}
            <AppBar position="sticky" color="default" elevation={1} sx={{ bgcolor: 'white' }}>
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                        {currentPosition} 투표 ({rounds[currentPosition] || 1}차)
                    </Typography>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" display="block" color="text.secondary">
                            안녕하세요, {voterName}님
                        </Typography>
                        <Typography variant="body2" color="primary" fontWeight="bold">
                            {selectedIds.length} / {maxVotesMap[currentPosition] || 5} 명 선택됨
                        </Typography>
                    </Box>
                </Toolbar>

                {/* Tabs for Alphabet Filtering */}
                <Box sx={{ bgcolor: 'white', overflowX: 'auto', borderTop: '1px solid #eee' }}>
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        variant="scrollable"
                        scrollButtons="auto"
                        allowScrollButtonsMobile
                        aria-label="candidate filter tabs"
                        sx={{ minHeight: 48 }}
                    >
                        {ALPHABET_TABS.map((tab) => (
                            <Tab key={tab} label={tab === 'ALL' ? '전체' : tab} value={tab} sx={{ minWidth: 50 }} />
                        ))}
                    </Tabs>
                </Box>
            </AppBar>

            <Container maxWidth="md" sx={{ mt: 3 }}>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {/* Progress Indicator */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        남은 투표: {votingQueue.map((q, i) => (
                            <span key={q} style={{ fontWeight: i === 0 ? 'bold' : 'normal', color: i === 0 ? '#1976d2' : '#999' }}>
                                {q}{i < votingQueue.length - 1 ? ' > ' : ''}
                            </span>
                        ))}
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" fontWeight="bold">
                        후보자 목록 ({finalCandidates.length}명)
                    </Typography>
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={toggleSortOrder}
                        startIcon={sortOrder === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
                    >
                        {sortOrder === 'asc' ? '가나다순' : '역순'}
                    </Button>
                </Box>

                <Grid container spacing={2}>
                    {finalCandidates.length === 0 ? (
                        <Box sx={{ p: 4, width: '100%', textAlign: 'center' }}>
                            <Typography color="text.secondary">해당 조건의 후보자가 없습니다.</Typography>
                        </Box>
                    ) : finalCandidates.map((candidate) => {
                        const isSelected = selectedIds.includes(candidate.id!);
                        return (
                            <Grid size={{ xs: 12, sm: 6 }} key={candidate.id}>
                                <Card
                                    sx={{
                                        position: 'relative',
                                        cursor: 'pointer',
                                        border: isSelected ? '2px solid #1976d2' : '1px solid #eee',
                                        transition: 'all 0.2s',
                                        transform: isSelected ? 'scale(1.02)' : 'none',
                                        display: 'flex', // Horizontal Layout
                                        height: '100%',
                                        minHeight: 180,
                                        alignItems: 'stretch'
                                    }}
                                    onClick={() => handleToggle(candidate.id!)}
                                >
                                    {/* Left Side: Image & Basic Info (40% width) */}
                                    <Box sx={{ width: '40%', display: 'flex', flexDirection: 'column', borderRight: '1px solid #f0f0f0' }}>
                                        <CardMedia
                                            component="img"
                                            image={`/images/candidates/${encodeURIComponent(candidate.name)}.jpg`}
                                            alt={candidate.name}
                                            sx={{ height: 120, objectFit: 'cover' }}
                                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=No+Image'; }}
                                        />
                                        <CardContent sx={{ p: 1, textAlign: 'center', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                            <Typography variant="h6" component="div" fontWeight="bold" sx={{ fontSize: '1.1rem' }}>
                                                {candidate.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {calculateAge(candidate.birthdate, candidate.age)}세
                                            </Typography>
                                            <Chip
                                                label={`${candidate.position} ${candidate.round || 1}차`}
                                                size="small"
                                                color="secondary"
                                                sx={{ mt: 0.5, fontSize: '0.7rem', alignSelf: 'center' }}
                                            />
                                        </CardContent>
                                    </Box>

                                    {/* Right Side: Service History (60% width) */}
                                    <Box sx={{ width: '60%', p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', bgcolor: '#fafafa' }}>
                                        <Typography variant="caption" color="text.secondary" fontWeight="bold" gutterBottom>
                                            주요 봉사 이력
                                        </Typography>
                                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem', lineHeight: 1.5 }}>
                                            {candidate.profileDesc || "이력이 없습니다."}
                                        </Typography>
                                    </Box>

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
                                            borderRadius: '50%',
                                            zIndex: 10
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
                        disabled={submitting}
                        onClick={handleSubmitVote}
                        sx={{ py: 1.5, fontSize: '1.1rem', fontWeight: 'bold' }}
                    >
                        {submitting ? '제출 중...' : (votingQueue.length > 1 ? `다음 단계 (${votingQueue[1]} 투표로 이동)` : '투표 최종 완료')}
                    </Button>
                </Container>
            </Paper>
        </Box >
    );
}
