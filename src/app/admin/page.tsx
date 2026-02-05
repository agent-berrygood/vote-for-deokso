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

export default function AdminPage() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [maxVotes, setMaxVotes] = useState<number>(0);

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
        // Fetch current settings
        const fetchSettings = async () => {
            try {
                const docRef = doc(db, 'settings', 'config');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setMaxVotes(docSnap.data().maxVotes || 0);
                    if (docSnap.data().rounds) {
                        setRoundSettings(docSnap.data().rounds);
                    }
                }
            } catch (err) {
                console.error("Error fetching settings:", err);
            }
        };
        fetchSettings();
    }, []);

    const handleSaveSettings = async () => {
        setSettingLoading(true);
        try {
            await setDoc(doc(db, 'settings', 'config'), {
                maxVotes,
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

    const handleCandidateUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setMessage(null);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                try {
                    const candidates = results.data as any[];
                    const batch = writeBatch(db);
                    const collectionRef = collection(db, 'candidates');



                    console.log(`[DEBUG] Found ${candidates.length} rows.`);

                    candidates.forEach((row, index) => {
                        console.log(`[DEBUG] Row ${index}:`, row);
                        if (!row.Name) {
                            console.warn(`[DEBUG] Row ${index} missing Name, skipping.`);
                            return;
                        }

                        const newDocRef = doc(collectionRef);
                        const candidateData: Candidate = {
                            id: newDocRef.id,
                            name: row.Name,
                            position: row.Position || uploadPosition, // Use CSV position or fallback to selection
                            age: Number(row.Age) || 0,
                            photoUrl: getDriveImageUrl(row.PhotoLink || ''),
                            voteCount: 0,
                            votesByRound: { [uploadRound]: 0 },
                            round: uploadRound
                        };

                        batch.set(newDocRef, candidateData);
                    });

                    console.log('[DEBUG] Committing batch write...');
                    await batch.commit();
                    console.log('[DEBUG] Batch commit successful.');
                    setMessage({ type: 'success', text: `Successfully uploaded ${candidates.length} candidates!` });
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

        setLoading(true);
        setMessage(null);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                try {
                    const voters = results.data as any[];
                    const batch = writeBatch(db);
                    const collectionRef = collection(db, 'voters');

                    voters.forEach((row) => {
                        // Expect Name, AuthKey
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

                    console.log('[DEBUG] Committing voter batch write...');
                    await batch.commit();
                    console.log('[DEBUG] Voter batch commit successful.');
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

            {/* System Settings */}
            <Paper sx={{ p: 4, mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                    System Settings
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <TextField
                        label="Max Votes per Person"
                        type="number"
                        value={maxVotes}
                        onChange={(e) => setMaxVotes(Number(e.target.value))}
                        size="small"
                        sx={{ width: 150 }}
                    />
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

            {/* Candidate Upload */}
            <Paper sx={{ p: 4, mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                    Upload Candidates
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    CSV Format: Name, Position, Age, PhotoLink
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <TextField
                        select
                        label="Upload for Round"
                        value={uploadRound}
                        onChange={(e) => setUploadRound(Number(e.target.value))}
                        size="small"
                        SelectProps={{ native: true }}
                        sx={{ width: 150 }}
                    >
                        <option value={1}>1차 후보</option>
                        <option value={2}>2차 후보</option>
                        <option value={3}>3차 후보</option>
                    </TextField>

                    <TextField
                        select
                        label="Default Position"
                        value={uploadPosition}
                        onChange={(e) => setUploadPosition(e.target.value)}
                        size="small"
                        SelectProps={{ native: true }}
                        sx={{ width: 150 }}
                        helperText="Used if Position missing in CSV"
                    >
                        {Object.keys(roundSettings).map(pos => <option key={pos} value={pos}>{pos}</option>)}
                    </TextField>
                </Box>
                <Button
                    component="label"
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
                    disabled={loading}
                >
                    Select Candidate CSV
                    <input type="file" hidden accept=".csv" onChange={handleCandidateUpload} />
                </Button>
            </Paper>

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
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalVotes, setTotalVotes] = useState(0);
    const [viewRound, setViewRound] = useState<number>(1);

    // Filter candidates by Position
    const [viewPosition, setViewPosition] = useState<string>('ALL');

    const fetchResults = async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, 'candidates'));
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
    }, [viewRound]); // Re-fetch when round changes

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
        link.setAttribute('download', `candidates_round_${viewRound}_results.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Paper sx={{ p: 4, bgcolor: '#fafafa' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" fontWeight="bold" color="primary">
                    📊 {viewRound}차 투표 득표 현황
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
