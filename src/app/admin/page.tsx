'use client';

import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { collection, writeBatch, doc, getDoc, setDoc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Candidate, Voter } from '@/types';
import { getDriveImageUrl } from '@/utils/driveLinkParser';
import {
    Box,
    Button,
    Container,
    Typography,
    Paper,
    Alert,
    CircularProgress,
    TextField,
    Divider
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SaveIcon from '@mui/icons-material/Save';

import { useElection } from '@/hooks/useElection';

export default function AdminPage() {
    const { activeElectionId, electionList, createElection, switchElection, getElectionPath, loading: electionLoading } = useElection();
    const [newElectionId, setNewElectionId] = useState('');

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    // Changed maxVotes to a map
    const [maxVotesMap, setMaxVotesMap] = useState<{ [pos: string]: number }>({
        '장로': 5,
        '권사': 5,
        '안수집사': 5
    });

    const [settingLoading, setSettingLoading] = useState(false);

    const [roundSettings, setRoundSettings] = useState<{ [key: string]: number }>({
        '장로': 1,
        '권사': 1,
        '안수집사': 1
    });

    // Upload Filters
    const [uploadRound, setUploadRound] = useState<number>(1);
    const [uploadPosition, setUploadPosition] = useState<string>('장로');

    useEffect(() => {
        if (!activeElectionId) return;

        // Fetch current settings for the ACTIVE election
        const fetchSettings = async () => {
            try {
                // Config is now under the election path
                // "elections/{id}/config/settings" or just "elections/{id}/config" doc in "settings" collection?
                // Let's use: elections/{id}/config (doc) in 'meta' collection? 
                // Or simpler: getElectionPath('meta') -> doc 'config'
                // Let's stick to strict subcollections: elections/{id}/settings/config

                // Construct path manually or use helper?
                // getElectionPath returns "elections/{id}/{collectionName}"
                // So for config: elections/{id}/settings/config
                const configRef = doc(db, `elections/${activeElectionId}/settings`, 'config');

                const docSnap = await getDoc(configRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    // ... (Config loading logic)
                    if (data.maxVotes) {
                        if (typeof data.maxVotes === 'number') {
                            setMaxVotesMap({
                                '장로': data.maxVotes,
                                '권사': data.maxVotes,
                                '안수집사': data.maxVotes
                            });
                        } else {
                            setMaxVotesMap(data.maxVotes);
                        }
                    }
                    if (data.rounds) setRoundSettings(data.rounds);
                } else {
                    // Reset to defaults if new election
                    setMaxVotesMap({ '장로': 5, '권사': 5, '안수집사': 5 });
                    setRoundSettings({ '장로': 1, '권사': 1, '안수집사': 1 });
                }
            } catch (err) {
                console.error("Error fetching settings:", err);
            }
        };
        fetchSettings();
    }, [activeElectionId]);

    const handleCreateElection = async () => {
        if (!newElectionId.trim()) return;
        await createElection(newElectionId);
        setNewElectionId('');
        setMessage({ type: 'success', text: `Election '${newElectionId}' created!` });
    };

    const handleSaveSettings = async () => {
        if (!activeElectionId) return;
        setSettingLoading(true);
        try {
            await setDoc(doc(db, `elections/${activeElectionId}/settings`, 'config'), {
                maxVotes: maxVotesMap,
                rounds: roundSettings
            });
            setMessage({ type: 'success', text: 'System settings saved successfully!' });
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: 'Error saving settings.' });
        } finally {
            setSettingLoading(false);
        }
    };

    const handleCandidateUpload = (event: React.ChangeEvent<HTMLInputElement>, position: string) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (!activeElectionId) {
            setMessage({ type: 'error', text: 'No active election selected.' });
            return;
        }

        setLoading(true);
        setMessage(null);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                try {
                    const candidates = results.data as any[];
                    const batch = writeBatch(db);
                    // Use dynamic path
                    const collectionRef = collection(db, `elections/${activeElectionId}/candidates`);

                    console.log(`[DEBUG] Found ${candidates.length} rows.`);

                    candidates.forEach((row, index) => {
                        if (!row.Name) return;

                        const newDocRef = doc(collectionRef);
                        const candidateData: Candidate = {
                            id: newDocRef.id,
                            name: row.Name,
                            position: position, // Force the selected position
                            age: Number(row.Age) || 0,
                            photoUrl: getDriveImageUrl(row.PhotoLink || ''),
                            voteCount: 0,
                            votesByRound: { [uploadRound]: 0 },
                            round: uploadRound
                        };

                        batch.set(newDocRef, candidateData);
                    });

                    await batch.commit();
                    setMessage({ type: 'success', text: `Successfully uploaded ${candidates.length} ${position} candidates!` });
                } catch (error) {
                    console.error(error);
                    setMessage({ type: 'error', text: 'Error uploading candidates.' });
                } finally {
                    setLoading(false);
                }
            },
            error: (error) => {
                console.error(error);
                setMessage({ type: 'error', text: 'CSV Parsing Error' });
                setLoading(false);
            }
        });
    };

    const handleVoterUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (!activeElectionId) {
            setMessage({ type: 'error', text: 'No active election selected.' });
            return;
        }

        setLoading(true);
        setMessage(null);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                try {
                    const voters = results.data as any[];
                    const batch = writeBatch(db);
                    // Use dynamic path
                    const collectionRef = collection(db, `elections/${activeElectionId}/voters`);

                    voters.forEach((row) => {
                        if (!row.Name || !row.AuthKey) return;

                        const newDocRef = doc(collectionRef);
                        const voterData: Voter = {
                            id: newDocRef.id,
                            name: row.Name,
                            authKey: String(row.AuthKey).trim(),
                            hasVoted: false,
                            votedAt: null
                        };

                        batch.set(newDocRef, voterData);
                    });

                    await batch.commit();
                    setMessage({ type: 'success', text: `Successfully uploaded ${voters.length} voters!` });
                } catch (error) {
                    console.error(error);
                    setMessage({ type: 'error', text: 'Error uploading voters.' });
                } finally {
                    setLoading(false);
                }
            },
            error: (error) => {
                console.error(error);
                setMessage({ type: 'error', text: 'CSV Parsing Error' });
                setLoading(false);
            }
        });
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                Admin Dashboard
            </Typography>

            {message && (
                <Alert severity={message.type} sx={{ mb: 3 }}>
                    {message.text}
                </Alert>
            )}

            {/* Election Management Section */}
            <Paper sx={{ p: 4, mb: 4, bgcolor: '#f0f7ff' }}>
                <Typography variant="h6" gutterBottom fontWeight="bold" color="primary">
                    🗳 Election Management
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <TextField
                        select
                        label="Active Election"
                        value={activeElectionId || ''}
                        onChange={(e) => switchElection(e.target.value)}
                        size="small"
                        SelectProps={{ native: true }}
                        sx={{ width: 250 }}
                        disabled={electionLoading}
                    >
                        {electionList.map((id) => (
                            <option key={id} value={id}>
                                {id} {id === activeElectionId ? '(Active)' : ''}
                            </option>
                        ))}
                    </TextField>
                    <Typography variant="body2" color="text.secondary">
                        Currently Managing: <strong>{activeElectionId}</strong>
                    </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <TextField
                        label="New Election ID (e.g., 2027-vote)"
                        value={newElectionId}
                        onChange={(e) => setNewElectionId(e.target.value)}
                        size="small"
                        sx={{ width: 250 }}
                        placeholder="Enter unique ID"
                    />
                    <Button
                        variant="contained"
                        onClick={handleCreateElection}
                        disabled={!newElectionId.trim()}
                    >
                        Create New Election
                    </Button>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ p: 2, border: '1px solid #f44336', borderRadius: 1, bgcolor: '#fff5f5' }}>
                    <Typography variant="subtitle2" color="error" fontWeight="bold" gutterBottom>
                        ⚠ Danger Zone
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        This will delete ALL candidates and voters for the active election <strong>({activeElectionId})</strong>. This action cannot be undone.
                    </Typography>
                    <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={async () => {
                            if (!activeElectionId) return;
                            if (!confirm(`Are you sure you want to RESET data for '${activeElectionId}'? This cannot be undone.`)) return;

                            const userInput = prompt(`Type '${activeElectionId}' to confirm reset:`);
                            if (userInput !== activeElectionId) {
                                alert('Confirmation failed.');
                                return;
                            }

                            setLoading(true);
                            try {
                                // 1. Delete Candidates
                                const cQuery = await getDocs(collection(db, `elections/${activeElectionId}/candidates`));
                                const batch1 = writeBatch(db);
                                let count1 = 0;
                                cQuery.forEach(doc => {
                                    batch1.delete(doc.ref);
                                    count1++;
                                });
                                if (count1 > 0) await batch1.commit();

                                // 2. Delete Voters
                                const vQuery = await getDocs(collection(db, `elections/${activeElectionId}/voters`));
                                const batch2 = writeBatch(db);
                                let count2 = 0;
                                vQuery.forEach(doc => {
                                    batch2.delete(doc.ref);
                                    count2++;
                                });
                                if (count2 > 0) await batch2.commit();

                                setMessage({ type: 'success', text: `Reset complete. Deleted ${count1} candidates and ${count2} voters.` });
                            } catch (err) {
                                console.error(err);
                                setMessage({ type: 'error', text: 'Error resetting data.' });
                            } finally {
                                setLoading(false);
                            }
                        }}
                    >
                        Reset Election Data
                    </Button>
                </Box>
            </Paper>

            {/* System Settings */}
            <Paper sx={{ p: 4, mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                    System Settings ({activeElectionId})
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {/* Dynamic Max Votes Settings per Position */}
                    {Object.keys(maxVotesMap).map((pos) => (
                        <TextField
                            key={`max_${pos}`}
                            label={`${pos} 최대 투표수`}
                            type="number"
                            value={maxVotesMap[pos]}
                            onChange={(e) => setMaxVotesMap({
                                ...maxVotesMap,
                                [pos]: Number(e.target.value)
                            })}
                            size="small"
                            sx={{ width: 140 }}
                        />
                    ))}
                    {/* Dynamic Round Settings per Position */}
                    {Object.keys(roundSettings).map((pos) => (
                        <TextField
                            key={pos}
                            label={`${pos} 차수`}
                            type="number"
                            value={roundSettings[pos]}
                            onChange={(e) => setRoundSettings({
                                ...roundSettings,
                                [pos]: Number(e.target.value)
                            })}
                            size="small"
                            sx={{ width: 120 }}
                        />
                    ))}
                    <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={handleSaveSettings}
                        disabled={settingLoading}
                    >
                        Save Config
                    </Button>
                </Box>
            </Paper>

            {/* Global Round Select for Uploads (Could be per card, but global is easier for now) */}
            <Paper sx={{ p: 4, mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                    1. Select Upload Round
                </Typography>
                <TextField
                    select
                    label="Target Round"
                    value={uploadRound}
                    onChange={(e) => setUploadRound(Number(e.target.value))}
                    size="small"
                    SelectProps={{ native: true }}
                    sx={{ width: 200 }}
                    helperText="Files uploaded below will be assigned to this round."
                >
                    <option value={1}>1차 후보</option>
                    <option value={2}>2차 후보</option>
                    <option value={3}>3차 후보</option>
                </TextField>
            </Paper>

            <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                {/* 1. Elder Upload */}
                <Paper sx={{ p: 3, flex: 1, borderTop: '4px solid #1976d2' }}>
                    <Typography variant="h6" gutterBottom color="primary">
                        장로 후보 업로드
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        (Position: 장로)
                    </Typography>
                    <Button
                        component="label"
                        variant="contained"
                        fullWidth
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
                        disabled={loading}
                    >
                        Upload CSV
                        <input type="file" hidden accept=".csv" onChange={(e) => handleCandidateUpload(e, '장로')} />
                    </Button>
                </Paper>

                {/* 2. Deacon Upload */}
                <Paper sx={{ p: 3, flex: 1, borderTop: '4px solid #2e7d32' }}>
                    <Typography variant="h6" gutterBottom color="success.main">
                        안수집사 후보 업로드
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        (Position: 안수집사)
                    </Typography>
                    <Button
                        component="label"
                        variant="contained"
                        color="success"
                        fullWidth
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
                        disabled={loading}
                    >
                        Upload CSV
                        <input type="file" hidden accept=".csv" onChange={(e) => handleCandidateUpload(e, '안수집사')} />
                    </Button>
                </Paper>

                {/* 3. Kwonsa Upload */}
                <Paper sx={{ p: 3, flex: 1, borderTop: '4px solid #ed6c02' }}>
                    <Typography variant="h6" gutterBottom color="warning.main">
                        권사 후보 업로드
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        (Position: 권사)
                    </Typography>
                    <Button
                        component="label"
                        variant="contained"
                        color="warning"
                        fullWidth
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
                        disabled={loading}
                    >
                        Upload CSV
                        <input type="file" hidden accept=".csv" onChange={(e) => handleCandidateUpload(e, '권사')} />
                    </Button>
                </Paper>
            </Box>

            {/* Voter Upload */}
            <Paper sx={{ p: 4, mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                    Upload Voters
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    CSV Format: Name, AuthKey (Birthday/Phone)
                </Typography>
                <Button
                    component="label"
                    variant="contained"
                    color="secondary"
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
                    disabled={loading}
                >
                    Select Voter CSV
                    <input type="file" hidden accept=".csv" onChange={handleVoterUpload} />
                </Button>
            </Paper>

            {/* Voting Results */}
            <VotingResultsSection />
        </Container>
    );
}

function VotingResultsSection() {
    // Add hook here too
    const { activeElectionId } = useElection();

    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalVotes, setTotalVotes] = useState(0);
    const [viewRound, setViewRound] = useState<number>(1);

    // Filter candidates by Position
    const [viewPosition, setViewPosition] = useState<string>('ALL');

    const fetchResults = async () => {
        if (!activeElectionId) return;

        setLoading(true);
        try {
            // Use dynamic path
            const querySnapshot = await getDocs(collection(db, `elections/${activeElectionId}/candidates`));
            const loaded: Candidate[] = [];
            let total = 0;
            querySnapshot.forEach((doc: any) => {
                const data = doc.data() as Candidate;
                loaded.push(data);
                // Calculate total for THIS round
                const roundVotes = data.votesByRound?.[viewRound] || 0;
                total += roundVotes;
            });

            // Sort by THIS round's vote count descending
            loaded.sort((a, b) => (b.votesByRound?.[viewRound] || 0) - (a.votesByRound?.[viewRound] || 0));

            setCandidates(loaded);
            setTotalVotes(total);
        } catch (err) {
            console.error("Error fetching results:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResults();
    }, [viewRound, activeElectionId]); // Add activeElectionId dep

    const filteredCandidates = viewPosition === 'ALL'
        ? candidates
        : candidates.filter(c => c.position === viewPosition);

    const maxVoteCount = candidates.length > 0 ? (candidates[0].votesByRound?.[viewRound] || 0) : 0;

    const handleDownloadCSV = () => {
        const headers = ['Name', 'Position', 'Age', 'PhotoLink', `Votes_Round_${viewRound}`];
        const csvContent = [headers.join(',')];

        candidates.forEach(c => {
            if ((c.votesByRound?.[viewRound] || 0) >= 0) {
                const row = [
                    c.name,
                    c.position,
                    c.age,
                    c.photoUrl,
                    c.votesByRound?.[viewRound] || 0
                ];
                csvContent.push(row.join(','));
            }
        });

        const blob = new Blob(["\uFEFF" + csvContent.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${activeElectionId}_round_${viewRound}_results.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Paper sx={{ p: 4, bgcolor: '#fafafa' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" fontWeight="bold" color="primary">
                    📊 {viewRound}차 투표 득표 현황 ({activeElectionId})
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                        select
                        label="View Round"
                        value={viewRound}
                        onChange={(e) => setViewRound(Number(e.target.value))}
                        size="small"
                        SelectProps={{ native: true }}
                        sx={{ width: 120 }}
                    >
                        <option value={1}>1차 투표</option>
                        <option value={2}>2차 투표</option>
                        <option value={3}>3차 투표</option>
                    </TextField>

                    <TextField
                        select
                        label="Filter Position"
                        value={viewPosition}
                        onChange={(e) => setViewPosition(e.target.value)}
                        size="small"
                        SelectProps={{ native: true }}
                        sx={{ width: 120 }}
                    >
                        <option value="ALL">전체 보기</option>
                        <option value="장로">장로</option>
                        <option value="권사">권사</option>
                        <option value="안수집사">안수집사</option>
                    </TextField>

                    <Button variant="outlined" onClick={fetchResults} disabled={loading}>
                        새로고침
                    </Button>
                    <Button variant="contained" color="success" onClick={handleDownloadCSV} disabled={loading || candidates.length === 0}>
                        엑셀 다운
                    </Button>
                </Box>
            </Box>

            <Typography variant="subtitle1" gutterBottom sx={{ mb: 3 }}>
                총 투표수 (단순 합계): <strong>{totalVotes}</strong>표
            </Typography>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {filteredCandidates.map((candidate, index) => {
                        const count = candidate.votesByRound?.[viewRound] || 0;
                        const percentage = maxVoteCount > 0 ? (count / maxVoteCount) * 100 : 0;
                        const isWinner = index === 0 && count > 0;

                        return (
                            <Box key={candidate.id} sx={{ position: 'relative' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5, alignItems: 'flex-end' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="h6" fontWeight="bold">
                                            {candidate.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {candidate.position}
                                        </Typography>
                                        {isWinner && <Typography variant="caption" color="error" fontWeight="bold">Current Leader 👑</Typography>}
                                    </Box>
                                    <Typography variant="h6" color="primary" fontWeight="bold">
                                        {count}표
                                    </Typography>
                                </Box>
                                <Box sx={{
                                    height: 24,
                                    bgcolor: '#e0e0e0',
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                    position: 'relative'
                                }}>
                                    <Box sx={{
                                        width: `${percentage}%`,
                                        height: '100%',
                                        bgcolor: isWinner ? '#f44336' : '#1976d2', // Winner distinct color
                                        transition: 'width 1s ease-in-out'
                                    }} />
                                </Box>
                            </Box>
                        );
                    })}
                </Box>
            )}
        </Paper>
    );
}
