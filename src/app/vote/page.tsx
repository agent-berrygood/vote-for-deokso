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
    Checkbox,
    Button,
    AppBar,
    Alert,
    CircularProgress,
    Paper,
    Tabs,
    Tab,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import PersonIcon from '@mui/icons-material/Person';

import { useElection } from '@/hooks/useElection';
import { getHangulInitial, ALPHABET_TABS } from '@/utils/hangul';

// Constants
const POSITION_ORDER = ['장로', '안수집사', '권사'];
const TABS = [...POSITION_ORDER, '최종 확인'];
const ADMIN_VOTER_NAME = '관리자';

// Separate component to handle image error state independently
const CandidateImage = ({ name, photoUrl }: { name: string, photoUrl?: string }) => {
    const [hasError, setHasError] = useState(false);
    const initialSrc = photoUrl || `/images/candidates/${encodeURIComponent(name)}.jpg`;

    if (hasError) {
        return (
            <Box sx={{ height: 120, width: '100%', bgcolor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #eee' }}>
                <PersonIcon sx={{ color: 'text.secondary', fontSize: 40 }} />
            </Box>
        );
    }

    return (
        <CardMedia
            component="img"
            image={initialSrc}
            alt={name}
            sx={{ height: 120, objectFit: 'cover', width: '100%' }}
            onError={() => setHasError(true)}
        />
    );
};

export default function VotePage() {
    const router = useRouter();
    const { activeElectionId, loading: electionLoading } = useElection();

    const [candidates, setCandidates] = useState<Candidate[]>([]);

    // State: Votes per position
    const [votes, setVotes] = useState<Record<string, string[]>>({});

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

    // Navigation State
    const [activePositionTab, setActivePositionTab] = useState(0); // Index of POSITION_ORDER or SPECIAL TABS
    const [activeAlphabetTab, setActiveAlphabetTab] = useState('ALL');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    useEffect(() => {
        if (electionLoading) return;
        if (!activeElectionId) {
            console.log("No active election");
            return;
        }

        const storedVoterId = sessionStorage.getItem('voterId');
        const storedName = sessionStorage.getItem('voterName');

        if (!storedVoterId) {
            router.replace('/');
            return;
        }

        setVoterName(storedName || 'Unknown');

        // Initialize Data
        const initData = async () => {
            try {
                // Fetch Settings
                const settingsSnap = await getDoc(doc(db, `elections/${activeElectionId}/settings`, 'config'));
                if (settingsSnap.exists()) {
                    const data = settingsSnap.data();
                    if (data.maxVotes) {
                        setMaxVotesMap(typeof data.maxVotes === 'number'
                            ? { '장로': data.maxVotes, '권사': data.maxVotes, '안수집사': data.maxVotes }
                            : data.maxVotes
                        );
                    }
                    setRounds(data.rounds || { '장로': 1, '권사': 1, '안수집사': 1 });
                }

                // Fetch Candidates
                const querySnapshot = await getDocs(collection(db, `elections/${activeElectionId}/candidates`));
                const loadedCandidates: Candidate[] = [];
                const currentSettings = settingsSnap.exists() ? settingsSnap.data().rounds : { '장로': 1, '권사': 1, '안수집사': 1 };

                querySnapshot.forEach((doc) => {
                    const c = { id: doc.id, ...doc.data() } as Candidate;
                    const targetRound = currentSettings[c.position] || 1;
                    if (c.round === targetRound) {
                        loadedCandidates.push(c);
                    }
                });

                setCandidates(loadedCandidates);

                // Initialize votes state
                const initialVotes: Record<string, string[]> = {};
                POSITION_ORDER.forEach(pos => {
                    initialVotes[pos] = [];
                });
                setVotes(initialVotes);

                // Check invalidation/participation logic could go here if needed per-position
                // But for now we allow re-voting until final submission if not implementing partial updates.

            } catch (err) {
                console.error(err);
                setError('데이터를 불러오는 중 오류가 발생했습니다.');
            } finally {
                setLoading(false);
            }
        };

        initData();
    }, [router, activeElectionId, electionLoading]);

    const handlePositionTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActivePositionTab(newValue);
        setActiveAlphabetTab('ALL'); // Reset filter on tab change
        window.scrollTo(0, 0);
    };

    const handleAlphabetTabChange = (event: React.SyntheticEvent, newValue: string) => {
        setActiveAlphabetTab(newValue);
    };

    const toggleSortOrder = () => {
        setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    };

    const handleToggleVote = (candidateId: string, position: string) => {
        setVotes(prev => {
            const currentList = prev[position] || [];
            const isSelected = currentList.includes(candidateId);
            const limit = maxVotesMap[position] || 5;

            if (isSelected) {
                return {
                    ...prev,
                    [position]: currentList.filter(id => id !== candidateId)
                };
            } else {
                if (currentList.length >= limit) {
                    alert(`'${position}' 직분은 최대 ${limit}명까지만 선택할 수 있습니다.`);
                    return prev;
                }
                return {
                    ...prev,
                    [position]: [...currentList, candidateId]
                };
            }
        });
    };

    const handleSubmitAll = async () => {
        if (!confirm("모든 투표를 완료하시겠습니까? 제출 후에는 수정할 수 없습니다.")) return;

        setSubmitting(true);
        const voterId = sessionStorage.getItem('voterId');

        if (!voterId || !activeElectionId) {
            setError("인증 정보가 만료되었습니다. 다시 로그인해주세요.");
            return;
        }

        try {
            await runTransaction(db, async (transaction) => {
                // 1. Read Voter
                const voterRef = doc(db, `elections/${activeElectionId}/voters`, voterId);
                const voterSnap = await transaction.get(voterRef);

                if (!voterSnap.exists()) throw "선거인 정보를 찾을 수 없습니다.";
                const voterData = voterSnap.data();

                // 2. Process ALL votes
                const allSelectedIds: string[] = [];
                const participatedUpdates: Record<string, boolean> = {};

                for (const pos of POSITION_ORDER) {
                    const selectedForPos = votes[pos] || [];
                    if (selectedForPos.length === 0) continue; // Skip empty votes? Or mark as participated with 0?

                    // Logic: If user selected 0, we assume they skipped or didn't vote for that position.
                    // But if they clicked submit, we process what they have.
                    // IMPORTANT: Should we mark them as participated even if 0 votes? 
                    // Let's assume yes, to prevent re-voting.

                    const round = rounds[pos] || 1;
                    const groupKey = `${pos}_${round}`;

                    const isAdmin = voterData.name === ADMIN_VOTER_NAME;

                    if (!isAdmin && voterData.participated?.[groupKey]) {
                        throw `이미 '${pos}' 투표에 참여하셨습니다.`;
                    }

                    participatedUpdates[groupKey] = true;
                    allSelectedIds.push(...selectedForPos);
                }

                if (allSelectedIds.length === 0 && Object.keys(participatedUpdates).length === 0) {
                    // If absolutely nothing selected
                    if (!confirm("선택된 후보가 없습니다. 정말로 아무도 선택하지 않고 종료하시겠습니까?")) {
                        throw "취소됨";
                    }
                }

                // 3. Read Candidates (Batch)
                for (const candidateId of allSelectedIds) {
                    const candidateRef = doc(db, `elections/${activeElectionId}/candidates`, candidateId);
                    const candidateSnap = await transaction.get(candidateRef);

                    if (!candidateSnap.exists()) throw "후보자 정보가 변경되었습니다.";

                    const cData = candidateSnap.data() as Candidate;
                    const newTotal = (cData.voteCount || 0) + 1;
                    const cRound = cData.round || 1;
                    const votesByRound = cData.votesByRound || {};
                    votesByRound[cRound] = (votesByRound[cRound] || 0) + 1;

                    transaction.update(candidateRef, {
                        voteCount: newTotal,
                        votesByRound: votesByRound
                    });
                }

                // 4. Update Voter (Skip for Admin to allow infinite voting)
                const isAdmin = voterData.name === ADMIN_VOTER_NAME;
                if (!isAdmin) {
                    const newParticipated = { ...voterData.participated, ...participatedUpdates };
                    transaction.update(voterRef, {
                        participated: newParticipated,
                        votedAt: Date.now(),
                        hasVoted: true // Legacy support
                    });
                }
            });

            setSuccess(true);
            window.scrollTo(0, 0);

        } catch (err: unknown) {
            console.error(err);
            if (err !== "취소됨") {
                const errorMessage = err instanceof Error ? err.message : String(err);
                alert(errorMessage || '투표 제출 실패');
            }
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
                }} size="large">
                    메인으로 돌아가기
                </Button>
            </Container>
        );
    }

    const currentTabName = TABS[activePositionTab];
    const isReviewTab = currentTabName === '최종 확인';
    const currentPosition = isReviewTab ? 'REVIEW' : currentTabName;

    // Filter Candidates for Current Tab
    const filteredCandidates = candidates
        .filter(c => c.position === currentPosition)
        .filter(c => {
            if (activeAlphabetTab === 'ALL') return true;
            return getHangulInitial(c.name) === activeAlphabetTab;
        })
        .sort((a, b) => {
            const comparison = a.name.localeCompare(b.name, 'ko');
            return sortOrder === 'asc' ? comparison : -comparison;
        });

    return (
        <Box sx={{ pb: 10, bgcolor: '#f8f9fa', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header with Tabs */}
            <AppBar position="sticky" color="default" elevation={1} sx={{ bgcolor: 'white' }}>
                <Box sx={{ p: 2, pb: 0 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6" fontWeight="bold">
                            {voterName}님의 투표
                        </Typography>
                        <Box>
                            {/* Mini stats if needed */}
                        </Box>
                    </Box>
                    <Tabs
                        value={activePositionTab}
                        onChange={handlePositionTabChange}
                        variant="fullWidth"
                        aria-label="position tabs"
                        sx={{ borderBottom: 1, borderColor: 'divider' }}
                    >
                        {TABS.map((label, index) => (
                            <Tab key={label} label={label} sx={{ fontWeight: activePositionTab === index ? 'bold' : 'normal' }} />
                        ))}
                    </Tabs>
                </Box>

                {/* Secondary Alphabet Filter (Only visible if NOT Review Tab) */}
                {!isReviewTab && (
                    <Box sx={{ bgcolor: 'white', overflowX: 'auto', borderBottom: '1px solid #eee' }}>
                        <Tabs
                            value={activeAlphabetTab}
                            onChange={handleAlphabetTabChange}
                            variant="scrollable"
                            scrollButtons="auto"
                            allowScrollButtonsMobile
                            sx={{ minHeight: 40 }}
                        >
                            {ALPHABET_TABS.map((tab) => (
                                <Tab key={tab} label={tab === 'ALL' ? '전체' : tab} value={tab} sx={{ minWidth: 50, py: 1, minHeight: 40 }} />
                            ))}
                        </Tabs>
                    </Box>
                )}
            </AppBar>

            <Container maxWidth="md" sx={{ mt: 3, flexGrow: 1 }}>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {isReviewTab ? (
                    // --- REVIEW TAB CONTENT ---
                    <Box>
                        <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                            최종 선택 확인
                        </Typography>
                        <Alert severity="info" sx={{ mb: 3 }}>
                            각 직분별 선택한 후보를 확인해주세요. &apos;투표 제출하기&apos;를 누르면 수정할 수 없습니다.
                        </Alert>

                        {POSITION_ORDER.map(pos => {
                            const selectedForPos = votes[pos] || [];
                            const selectedCandidates = candidates.filter(c => selectedForPos.includes(c.id!));

                            return (
                                <Paper key={pos} sx={{ mb: 3, p: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, borderBottom: '1px solid #eee', pb: 1 }}>
                                        <Typography variant="h6" fontWeight="bold">{pos}</Typography>
                                        <Typography variant="body2" color={selectedForPos.length > 0 ? 'primary' : 'text.secondary'}>
                                            {selectedForPos.length} / {maxVotesMap[pos]} 명 선택
                                        </Typography>
                                    </Box>

                                    {selectedCandidates.length === 0 ? (
                                        <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                                            선택된 후보가 없습니다.
                                        </Typography>
                                    ) : (
                                        <List dense>
                                            {selectedCandidates.map(c => (
                                                <ListItem key={c.id}>
                                                    <ListItemAvatar>
                                                        <Avatar src={c.photoUrl} alt={c.name}><PersonIcon /></Avatar>
                                                    </ListItemAvatar>
                                                    <ListItemText
                                                        primary={`${c.name} (${calculateAge(c.birthdate, c.age)}세)`}
                                                        secondary={c.churchTitle || '교인'}
                                                    />
                                                </ListItem>
                                            ))}
                                        </List>
                                    )}
                                </Paper>
                            );
                        })}
                    </Box>
                ) : (
                    // --- VOTING TAB CONTENT ---
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="body1" fontWeight="bold" color="primary">
                                {currentPosition} 후보 선택 ({votes[currentPosition]?.length || 0}/{maxVotesMap[currentPosition]}명)
                            </Typography>
                            <Button
                                variant="text"
                                size="small"
                                onClick={toggleSortOrder}
                                startIcon={sortOrder === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
                            >
                                {sortOrder === 'asc' ? '가나다순' : '역순'}
                            </Button>
                        </Box>

                        <Grid container spacing={2}>
                            {filteredCandidates.length === 0 ? (
                                <Box sx={{ p: 4, width: '100%', textAlign: 'center' }}>
                                    <Typography color="text.secondary">해당 조건의 후보자가 없습니다.</Typography>
                                </Box>
                            ) : filteredCandidates.map((candidate) => {
                                const isSelected = (votes[currentPosition] || []).includes(candidate.id!);
                                return (
                                    <Grid size={{ xs: 12, sm: 6 }} key={candidate.id}>
                                        <Card
                                            sx={{
                                                position: 'relative',
                                                cursor: 'pointer',
                                                border: isSelected ? '2px solid #1976d2' : '1px solid #eee',
                                                transition: 'all 0.2s',
                                                transform: isSelected ? 'scale(1.02)' : 'none',
                                                display: 'flex',
                                                height: '100%',
                                                minHeight: 160,
                                            }}
                                            onClick={() => handleToggleVote(candidate.id!, currentPosition)}
                                        >
                                            <Box sx={{ width: '35%', display: 'flex', flexDirection: 'column', borderRight: '1px solid #f0f0f0' }}>
                                                <CandidateImage name={candidate.name} photoUrl={candidate.photoUrl} />
                                                <Box sx={{ p: 1, textAlign: 'center', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', bgcolor: isSelected ? '#e3f2fd' : 'transparent' }}>
                                                    <Typography variant="subtitle2" fontWeight="bold">
                                                        {candidate.name}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {calculateAge(candidate.birthdate, candidate.age)}세
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            <Box sx={{ width: '65%', p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem', color: '#555' }}>
                                                    {candidate.profileDesc || "이력이 없습니다."}
                                                </Typography>
                                            </Box>

                                            <Checkbox
                                                checked={isSelected}
                                                sx={{
                                                    position: 'absolute',
                                                    top: 4,
                                                    right: 4,
                                                    color: isSelected ? 'primary.main' : 'action.disabled',
                                                    bgcolor: 'rgba(255,255,255,0.9)',
                                                    '&:hover': { bgcolor: '#fff' },
                                                    borderRadius: '50%',
                                                    p: 0.5
                                                }}
                                            />
                                        </Card>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    </Box>
                )}
            </Container>

            {/* Sticky Bottom Action Bar */}
            <Paper
                sx={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    p: 2,
                    zIndex: 1000,
                    borderTop: '1px solid #ddd',
                    bgcolor: 'white'
                }}
                elevation={6}
            >
                <Container maxWidth="md">
                    {isReviewTab ? (
                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            size="large"
                            disabled={submitting}
                            onClick={handleSubmitAll}
                            sx={{ py: 1.5, fontSize: '1.2rem', fontWeight: 'bold', boxShadow: 3 }}
                        >
                            {submitting ? '제출 중...' : '투표 제출하기 (수정 불가)'}
                        </Button>
                    ) : (
                        <Button
                            fullWidth
                            variant="contained"
                            color="inherit" // Neutral color for next step
                            size="large"
                            onClick={() => {
                                const nextTab = activePositionTab + 1;
                                if (nextTab < TABS.length) {
                                    handlePositionTabChange({} as React.SyntheticEvent, nextTab);
                                }
                            }}
                            sx={{ py: 1.5, fontSize: '1.1rem', bgcolor: '#333', color: 'white', '&:hover': { bgcolor: '#555' } }}
                        >
                            다음 단계 ({TABS[activePositionTab + 1]})
                        </Button>
                    )}
                </Container>
            </Paper>
        </Box >
    );
}
