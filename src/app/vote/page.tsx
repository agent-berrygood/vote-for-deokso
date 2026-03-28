'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    collection,
    getDocs,
    doc,
    getDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Candidate } from '@/types';
import { calculateAge } from '@/utils/age';
import { submitVote } from '@/app/actions/vote';

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

    const availablePositions = useMemo(() => {
        return POSITION_ORDER.filter(pos => candidates.some(c => c.position === pos));
    }, [candidates]);

    const dynamicTabs = useMemo(() => {
        return [...availablePositions, '최종 확인'];
    }, [availablePositions]);

    // State: Votes per position
    const [votes, setVotes] = useState<Record<string, string[]>>({});

    const [maxVotesMap, setMaxVotesMap] = useState<{ [pos: string]: number }>({
        '장로': 5,
        '권사': 5,
        '안수집사': 5
    });

    const [rounds, setRounds] = useState<{ [pos: string]: number }>({});
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [isTimeUp, setIsTimeUp] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [voterName, setVoterName] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Navigation State
    const [activePositionTab, setActivePositionTab] = useState(0); // Index of POSITION_ORDER or SPECIAL TABS
    const [activeAlphabetTab, setActiveAlphabetTab] = useState('ALL');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    // Calculate candidate ranks (기호) for Round 2 and above
    const candidateRanks = useMemo(() => {
        const ranks: Record<string, number> = {};

        POSITION_ORDER.forEach(pos => {
            const currentRound = rounds[pos] ?? 1;
            if (currentRound >= 2) {
                const prevRound = currentRound - 1;
                const posCandidates = candidates.filter(c => c.position === pos);

                // Sort by prev round votes descending, then name ascending
                posCandidates.sort((a, b) => {
                    const aVotes = a.votesByRound?.[prevRound] ?? 0;
                    const bVotes = b.votesByRound?.[prevRound] ?? 0;
                    if (aVotes !== bVotes) {
                        return bVotes - aVotes;
                    }
                    return a.name.localeCompare(b.name, 'ko');
                });

                // Assign rank
                posCandidates.forEach((c, index) => {
                    if (c.id) {
                        ranks[c.id] = index + 1;
                    }
                });
            }
        });

        return ranks;
    }, [candidates, rounds]);

    useEffect(() => {
        if (!endDate) return;

        const checkTime = () => {
            if (new Date() > endDate) {
                setIsTimeUp(true);
            }
        };

        checkTime();
        const interval = setInterval(checkTime, 10000); // Check every 10s
        return () => clearInterval(interval);
    }, [endDate]);

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
                    if (data.endDate) {
                        const end = new Date(data.endDate);
                        setEndDate(end);
                        if (new Date() > end) setIsTimeUp(true);
                    }
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
        if (isTimeUp) {
            alert("투표 시간이 종료되어 선택을 변경할 수 없습니다.");
            return;
        }

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
        if (submitting) return; // 다중 클릭 방지 guard

        if (isTimeUp) {
            alert("투표 시간이 이미 종료되었습니다.");
            return;
        }

        if (!confirm("모든 투표를 완료하시겠습니까? 제출 후에는 수정할 수 없습니다.")) return;

        setSubmitting(true);
        setError('');

        try {
            const res = await submitVote(votes);

            if (!res.success) {
                throw new Error(res.message);
            }

            setSuccess(true);
            window.scrollTo(0, 0);

        } catch (err: unknown) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : String(err);
            setError(errorMessage || '투표 제출 중 오류가 발생했습니다. 다시 시도해주세요.');
            window.scrollTo(0, 0);
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

    const currentTabName = dynamicTabs[activePositionTab] || '최종 확인';
    const isReviewTab = currentTabName === '최종 확인';
    const currentPosition = isReviewTab ? 'REVIEW' : currentTabName;

    const isRound2 = !isReviewTab && (rounds[currentPosition] ?? 1) >= 2;

    // Filter Candidates for Current Tab
    const filteredCandidates = candidates
        .filter(c => c.position === currentPosition)
        .filter(c => {
            if (activeAlphabetTab === 'ALL') return true;
            return getHangulInitial(c.name) === activeAlphabetTab;
        })
        .sort((a, b) => {
            const aNum = a.candidateNumber;
            const bNum = b.candidateNumber;

            // 둘 다 candidateNumber 있으면 오름차순 우선 정렬
            if (aNum !== undefined && bNum !== undefined) {
                return aNum - bNum;
            }
            // 한쪽만 있으면 해당 후보 우선
            if (aNum !== undefined) return -1;
            if (bNum !== undefined) return 1;

            // 둘 다 없으면 기존 정렬 로직으로 폴백
            if (isRound2) {
                const prevRound = (rounds[currentPosition] ?? 1) - 1;
                const aVotes = a.votesByRound?.[prevRound] ?? 0;
                const bVotes = b.votesByRound?.[prevRound] ?? 0;
                if (aVotes !== bVotes) {
                    return sortOrder === 'asc' ? bVotes - aVotes : aVotes - bVotes;
                }
            }
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
                            {!isReviewTab && (
                                <Typography variant="body2" fontWeight="bold" color="primary" sx={{ bgcolor: '#e3f2fd', px: 1.5, py: 0.5, borderRadius: 2 }}>
                                    {votes[currentPosition]?.length || 0} / {maxVotesMap[currentPosition]}명 선택
                                </Typography>
                            )}
                        </Box>
                    </Box>
                    <Tabs
                        value={activePositionTab}
                        onChange={handlePositionTabChange}
                        variant="fullWidth"
                        aria-label="position tabs"
                        sx={{ borderBottom: 1, borderColor: 'divider' }}
                    >
                        {dynamicTabs.map((label, index) => (
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

                {isTimeUp && (
                    <Alert severity="error" sx={{ mb: 2, fontWeight: 'bold' }}>
                        투표 가능 시간이 종료되었습니다. 현재 화면을 더 이상 제출할 수 없습니다.
                    </Alert>
                )}
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

                        {availablePositions.map(pos => {
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
                                            {selectedCandidates.map(c => {
                                                const isR2 = (rounds[pos] ?? 1) >= 2;
                                                const rank = c.candidateNumber ?? (isR2 && c.id ? candidateRanks[c.id] : undefined);
                                                return (
                                                    <ListItem key={c.id}>
                                                        <ListItemAvatar>
                                                            <Avatar src={c.photoUrl} alt={c.name}><PersonIcon /></Avatar>
                                                        </ListItemAvatar>
                                                        <ListItemText
                                                            primary={rank !== undefined ? `[기호 ${rank}번] ${c.name} (${calculateAge(c.birthdate, c.age)}세)` : `${c.name} (${calculateAge(c.birthdate, c.age)}세)`}
                                                            secondary={c.churchTitle || '교인'}
                                                        />
                                                    </ListItem>
                                                );
                                            })}
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
                                {isRound2
                                    ? (sortOrder === 'asc' ? '득표 높은 순' : '득표 낮은 순')
                                    : (sortOrder === 'asc' ? '가나다순' : '역순')
                                }
                            </Button>
                        </Box>

                        <Grid container spacing={2}>
                            {filteredCandidates.length === 0 ? (
                                <Box sx={{ p: 4, width: '100%', textAlign: 'center' }}>
                                    <Typography color="text.secondary">해당 조건의 후보자가 없습니다.</Typography>
                                </Box>
                            ) : filteredCandidates.map((candidate) => {
                                const isSelected = (votes[currentPosition] || []).includes(candidate.id!);
                                const rank = candidate.candidateNumber ?? (isRound2 && candidate.id ? candidateRanks[candidate.id] : undefined);

                                return (
                                    <Grid size={{ xs: 12, sm: 6 }} key={candidate.id}>
                                        <Card
                                            sx={{
                                                position: 'relative',
                                                cursor: isTimeUp ? 'default' : 'pointer',
                                                border: isSelected ? '2px solid #1976d2' : '1px solid #eee',
                                                transition: 'all 0.2s',
                                                transform: isSelected ? 'scale(1.02)' : 'none',
                                                display: 'flex',
                                                height: '100%',
                                                minHeight: 160,
                                                opacity: isTimeUp ? 0.8 : 1
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

                                            <Box sx={{ width: '65%', p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                                                {rank !== undefined && (
                                                    <Box sx={{
                                                        display: 'inline-block',
                                                        alignSelf: 'flex-start',
                                                        bgcolor: 'primary.main',
                                                        color: 'white',
                                                        px: 1,
                                                        py: 0.25,
                                                        borderRadius: 1,
                                                        fontWeight: 'bold',
                                                        fontSize: '0.8rem',
                                                        mb: 1,
                                                    }}>
                                                        기호 {rank}번
                                                    </Box>
                                                )}
                                                {candidate.district && (
                                                    <Box sx={{
                                                        display: 'inline-block',
                                                        alignSelf: 'flex-start',
                                                        bgcolor: '#f5f5f5',
                                                        color: '#666',
                                                        px: 1,
                                                        py: 0.25,
                                                        borderRadius: 1,
                                                        fontWeight: '500',
                                                        fontSize: '0.75rem',
                                                        mb: 1,
                                                        border: '1px solid #e0e0e0',
                                                    }}>
                                                        {candidate.district}
                                                    </Box>
                                                )}
                                                {candidate.profileDesc && (
                                                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem', color: '#555' }}>
                                                        {candidate.profileDesc.replace(/\\n/g, '\n')}
                                                    </Typography>
                                                )}
                                                {candidate.volunteerInfo && (
                                                    <Typography variant="body2" color="primary" sx={{ mt: 1, whiteSpace: 'pre-line', fontSize: '0.8rem', fontWeight: 500 }}>
                                                        {candidate.volunteerInfo.replace(/\\n/g, '\n')}
                                                    </Typography>
                                                )}
                                            </Box>

                                            <Checkbox
                                                checked={isSelected}
                                                disabled={isTimeUp}
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
                            disabled={submitting || isTimeUp}
                            onClick={handleSubmitAll}
                            sx={{ py: 1.5, fontSize: '1.2rem', fontWeight: 'bold', boxShadow: 3 }}
                        >
                            {isTimeUp ? '투표 종료됨' : (submitting ? '제출 중...' : '투표 제출하기 (수정 불가)')}
                        </Button>
                    ) : (
                        <Button
                            fullWidth
                            variant="contained"
                            color="inherit"
                            size="large"
                            onClick={() => {
                                const nextTab = activePositionTab + 1;
                                if (nextTab < dynamicTabs.length) {
                                    handlePositionTabChange({} as React.SyntheticEvent, nextTab);
                                }
                            }}
                            sx={{ py: 1.5, fontSize: '1.1rem', bgcolor: '#333', color: 'white', '&:hover': { bgcolor: '#555' } }}
                        >
                            다음 단계 ({dynamicTabs[activePositionTab + 1]})
                        </Button>
                    )}
                </Container>
            </Paper>
        </Box >
    );
}
