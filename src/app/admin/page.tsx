'use client';

import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { collection, writeBatch, doc, getDoc, setDoc } from 'firebase/firestore';
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

    useEffect(() => {
        // Fetch current settings
        const fetchSettings = async () => {
            try {
                const docRef = doc(db, 'settings', 'config');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setMaxVotes(docSnap.data().maxVotes || 0);
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
            await setDoc(doc(db, 'settings', 'config'), { maxVotes });
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

                    candidates.forEach((row) => {
                        if (!row.Name) return;

                        const newDocRef = doc(collectionRef);
                        const candidateData: Candidate = {
                            id: newDocRef.id,
                            name: row.Name,
                            position: row.Position || '',
                            age: Number(row.Age) || 0,
                            photoUrl: getDriveImageUrl(row.PhotoLink || ''),
                            voteCount: 0
                        };

                        batch.set(newDocRef, candidateData);
                    });

                    await batch.commit();
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
                    />
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
            <Paper sx={{ p: 4 }}>
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
        </Container>
    );
}
