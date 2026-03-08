'use client';

import { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, deleteDoc, updateDoc, setDoc, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import imageCompression from 'browser-image-compression';
import { Candidate } from '@/types';
import { calculateAge } from '@/utils/age';
import { useElection } from '@/hooks/useElection';
import { logAdminAction } from '@/lib/adminLogger';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    ListItemSecondaryAction,
    IconButton,
    CircularProgress,
    Divider,
    Alert,
    Grid,
    Card,
    CardContent,
    Chip
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import RefreshIcon from '@mui/icons-material/Refresh';
import ConfirmDialog from './ConfirmDialog';

interface Props {
    position: string; // '장로', '안수집사', '권사'
}

export default function CandidatePositionManager({ position }: Props) {
    const { activeElectionId } = useElection();
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteTarget, setDeleteTarget] = useState<Candidate | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning', text: string } | null>(null);
    const [uploadingId, setUploadingId] = useState<string | null>(null);

    // Form State for New Candidate
    const [newName, setNewName] = useState('');
    const [newBirthdate, setNewBirthdate] = useState('');
    const [newDistrict, setNewDistrict] = useState('');
    const [newProfile, setNewProfile] = useState('');
    const [newVolunteer, setNewVolunteer] = useState('');
    const [newRound, setNewRound] = useState(1);
    const [adding, setAdding] = useState(false);

    const fetchCandidates = async () => {
        if (!activeElectionId) return;
        setLoading(true);
        try {
            const q = query(
                collection(db, `elections/${activeElectionId}/candidates`),
                where('position', '==', position)
            );
            const querySnapshot = await getDocs(q);
            const loaded: Candidate[] = [];
            querySnapshot.forEach((doc) => {
                loaded.push({ id: doc.id, ...doc.data() } as Candidate);
            });
            // Sort by round then name
            loaded.sort((a, b) => {
                if (a.round !== b.round) return (a.round || 1) - (b.round || 1);
                return a.name.localeCompare(b.name, 'ko');
            });
            setCandidates(loaded);
        } catch (err) {
            console.error("Error fetching candidates:", err);
            setMessage({ type: 'error', text: '후보자 목록을 불러오지 못했습니다.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCandidates();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeElectionId, position]);

    const handleAddCandidate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeElectionId) return;
        if (!newName.trim()) {
            setMessage({ type: 'error', text: '이름을 입력해주세요.' });
            return;
        }

        setAdding(true);
        try {
            const candidateRef = doc(collection(db, `elections/${activeElectionId}/candidates`));
            const newCandidate: Candidate = {
                id: candidateRef.id,
                name: newName.trim(),
                position: position,
                birthdate: newBirthdate.trim(),
                district: newDistrict.trim(),
                profileDesc: newProfile.trim(),
                volunteerInfo: newVolunteer.trim(),
                round: newRound,
                voteCount: 0,
                votesByRound: { [newRound]: 0 },
                photoUrl: ''
            };

            await setDoc(candidateRef, newCandidate);
            await logAdminAction({
                electionId: activeElectionId,
                actionType: 'OTHER',
                description: `'${position}' 후보자 '${newName}' 직접 추가`
            });

            setMessage({ type: 'success', text: `'${newName}' 후보가 성공적으로 추가되었습니다.` });

            // Reset Form Code
            setNewName('');
            setNewBirthdate('');
            setNewDistrict('');
            setNewProfile('');
            setNewVolunteer('');

            // Refresh List
            fetchCandidates();
        } catch (err) {
            console.error("Error adding candidate:", err);
            setMessage({ type: 'error', text: '후보자 추가 중 오류가 발생했습니다.' });
        } finally {
            setAdding(true); // Temporary to show loading on button if needed, but we refresh anyway
            setAdding(false);
        }
    };

    const handleDelete = async () => {
        if (!activeElectionId || !deleteTarget || !deleteTarget.id) return;

        try {
            await deleteDoc(doc(db, `elections/${activeElectionId}/candidates`, deleteTarget.id));
            await logAdminAction({
                adminId: 'system',
                electionId: activeElectionId,
                actionType: 'DELETE_CANDIDATE',
                description: `'${deleteTarget.name}' (${position}) 후보 삭제`
            });

            setCandidates(prev => prev.filter(c => c.id !== deleteTarget.id));
            setMessage({ type: 'success', text: `'${deleteTarget.name}' 후보가 삭제되었습니다.` });
        } catch (err) {
            console.error("Error deleting candidate:", err);
            setMessage({ type: 'error', text: '후보자 삭제 중 오류가 발생했습니다.' });
        } finally {
            setDeleteTarget(null);
        }
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, candidateId: string) => {
        const file = event.target.files?.[0];
        if (!file || !activeElectionId) return;

        setUploadingId(candidateId);
        try {
            const options = { maxSizeMB: 0.05, maxWidthOrHeight: 300, useWebWorker: true };
            const compressedFile = await imageCompression(file, options);

            const storageRef = ref(storage, `elections/${activeElectionId}/candidates/${candidateId}/profile.jpg`);
            await uploadBytes(storageRef, compressedFile);
            const downloadURL = await getDownloadURL(storageRef);

            const candidateRef = doc(db, `elections/${activeElectionId}/candidates`, candidateId);
            await updateDoc(candidateRef, { photoUrl: downloadURL });

            setCandidates(prev => prev.map(c =>
                c.id === candidateId ? { ...c, photoUrl: downloadURL } : c
            ));

            setMessage({ type: 'success', text: '사진이 성공적으로 업로드되었습니다.' });
        } catch (error) {
            console.error("Error uploading image:", error);
            setMessage({ type: 'error', text: '사진 업로드 중 오류가 발생했습니다.' });
        } finally {
            setUploadingId(null);
            event.target.value = '';
        }
    };

    const filteredCandidates = candidates.filter(c =>
        c.name.includes(searchTerm) || c.district?.includes(searchTerm)
    );

    return (
        <Box sx={{ p: 0 }}>
            {message && (
                <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage(null)}>
                    {message.text}
                </Alert>
            )}

            <Grid container spacing={3}>
                {/* 1. Add Candidate Form */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 3, position: 'sticky', top: 80 }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PersonAddIcon color="primary" /> {position} 후보 직접 추가
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        <form onSubmit={handleAddCandidate}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <TextField label="이름" value={newName} onChange={e => setNewName(e.target.value)} size="small" fullWidth required />
                                <TextField label="생년월일 (6자리)" value={newBirthdate} onChange={e => setNewBirthdate(e.target.value)} size="small" fullWidth placeholder="700101" />
                                <TextField label="교구/구역" value={newDistrict} onChange={e => setNewDistrict(e.target.value)} size="small" fullWidth placeholder="1구역" />
                                <TextField label="투표 차수" type="number" value={newRound} onChange={e => setNewRound(Number(e.target.value))} size="small" fullWidth />
                                <TextField label="봉사 이력" value={newProfile} onChange={e => setNewProfile(e.target.value)} size="small" fullWidth multiline rows={3} placeholder="교회 봉사 이력을 입력하세요." />
                                <TextField label="추가 정보" value={newVolunteer} onChange={e => setNewVolunteer(e.target.value)} size="small" fullWidth multiline rows={2} placeholder="기타 참고 사항" />

                                <Button type="submit" variant="contained" disabled={adding} fullWidth sx={{ mt: 1 }}>
                                    {adding ? <CircularProgress size={24} /> : '후보자 추가하기'}
                                </Button>
                            </Box>
                        </form>
                    </Paper>
                </Grid>

                {/* 2. Candidate List */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" fontWeight="bold">
                                {position} 후보자 목록 ({filteredCandidates.length}명)
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <TextField
                                    label="검색 (이름, 교구)"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    size="small"
                                    sx={{ width: 200 }}
                                />
                                <IconButton onClick={fetchCandidates} disabled={loading}>
                                    <RefreshIcon />
                                </IconButton>
                            </Box>
                        </Box>

                        <Divider sx={{ mb: 1 }} />

                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
                        ) : (
                            <List sx={{ bgcolor: 'background.paper' }}>
                                {filteredCandidates.length === 0 ? (
                                    <Typography sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>후보자가 없습니다.</Typography>
                                ) : (
                                    filteredCandidates.map((c) => (
                                        <div key={c.id}>
                                            <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                                                <ListItemAvatar sx={{ mr: 1 }}>
                                                    <Box sx={{ position: 'relative' }}>
                                                        <Avatar
                                                            src={c.photoUrl}
                                                            alt={c.name}
                                                            sx={{ width: 60, height: 60, border: '1px solid #eee' }}
                                                        >
                                                            {c.name[0]}
                                                        </Avatar>
                                                        <IconButton
                                                            component="label"
                                                            size="small"
                                                            sx={{
                                                                position: 'absolute',
                                                                bottom: -5,
                                                                right: -5,
                                                                bgcolor: 'white',
                                                                boxShadow: 1,
                                                                '&:hover': { bgcolor: '#f5f5f5' }
                                                            }}
                                                        >
                                                            {uploadingId === c.id ? <CircularProgress size={16} /> : <CloudUploadIcon sx={{ fontSize: 16 }} />}
                                                            <input type="file" hidden accept="image/*" onChange={e => handleImageUpload(e, c.id!)} />
                                                        </IconButton>
                                                    </Box>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Typography fontWeight="bold">{c.name}</Typography>
                                                            <Typography variant="body2" color="text.secondary">({calculateAge(c.birthdate, c.age)}세)</Typography>
                                                            <Chip label={`${c.round}차`} size="small" variant="outlined" />
                                                            <Typography variant="caption" sx={{ bgcolor: '#f0f0f0', px: 1, borderRadius: 1 }}>{c.district}</Typography>
                                                        </Box>
                                                    }
                                                    secondary={
                                                        <Box sx={{ mt: 0.5 }}>
                                                            <Typography variant="body2" color="text.primary" sx={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem' }}>
                                                                {c.profileDesc}
                                                            </Typography>
                                                            {c.volunteerInfo && (
                                                                <Typography variant="caption" color="primary" display="block" sx={{ mt: 0.5 }}>
                                                                    참고: {c.volunteerInfo}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    }
                                                />
                                                <ListItemSecondaryAction>
                                                    <IconButton edge="end" color="error" onClick={() => setDeleteTarget(c)}>
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </ListItemSecondaryAction>
                                            </ListItem>
                                            <Divider variant="inset" component="li" />
                                        </div>
                                    ))
                                )}
                            </List>
                        )}
                    </Paper>
                </Grid>
            </Grid>

            <ConfirmDialog
                open={!!deleteTarget}
                title="후보자 삭제 확인"
                description={`'${deleteTarget?.name}' 후보를 목록에서 삭제하시겠습니까?`}
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
                requireReAuth
            />
        </Box>
    );
}
