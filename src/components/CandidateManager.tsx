'use client';

import { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Candidate } from '@/types';
import { useElection } from '@/hooks/useElection';
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
    Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ConfirmDialog from './ConfirmDialog';

export default function CandidateManager() {
    const { activeElectionId } = useElection();
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteTarget, setDeleteTarget] = useState<Candidate | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const fetchCandidates = async () => {
        if (!activeElectionId) return;
        setLoading(true);
        try {
            const q = query(collection(db, `elections/${activeElectionId}/candidates`));
            const querySnapshot = await getDocs(q);
            const loaded: Candidate[] = [];
            querySnapshot.forEach((doc) => {
                loaded.push({ id: doc.id, ...doc.data() } as Candidate);
            });
            // Sort by name
            loaded.sort((a, b) => a.name.localeCompare(b.name));
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
    }, [activeElectionId]);

    const handleDelete = async () => {
        if (!activeElectionId || !deleteTarget || !deleteTarget.id) return;

        try {
            // Delete from Firestore
            await deleteDoc(doc(db, `elections/${activeElectionId}/candidates`, deleteTarget.id));

            // Remove from local state
            setCandidates(prev => prev.filter(c => c.id !== deleteTarget.id));
            setMessage({ type: 'success', text: `'${deleteTarget.name}' 후보가 삭제(사퇴) 처리되었습니다.` });
        } catch (err) {
            console.error("Error deleting candidate:", err);
            setMessage({ type: 'error', text: '후보자 삭제 중 오류가 발생했습니다.' });
        } finally {
            setDeleteTarget(null);
        }
    };

    const filteredCandidates = candidates.filter(c =>
        c.name.includes(searchTerm) || c.position.includes(searchTerm)
    );

    return (
        <Paper sx={{ p: 4, mb: 4 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
                👤 후보자 관리 (사퇴 처리)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                후보자를 검색하여 목록에서 삭제(사퇴)할 수 있습니다.
            </Typography>

            {message && (
                <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage(null)}>
                    {message.text}
                </Alert>
            )}

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                    label="이름 검색"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="small"
                    fullWidth
                    placeholder="홍길동"
                />
                <Button variant="outlined" onClick={fetchCandidates} disabled={loading}>
                    새로고침
                </Button>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
            ) : (
                <List dense sx={{ maxHeight: 300, overflow: 'auto', bgcolor: '#f5f5f5', borderRadius: 1 }}>
                    {filteredCandidates.length === 0 ? (
                        <ListItem>
                            <ListItemText primary="검색 결과가 없습니다." />
                        </ListItem>
                    ) : (
                        filteredCandidates.map((candidate) => (
                            <div key={candidate.id}>
                                <ListItem>
                                    <ListItemAvatar>
                                        <Avatar src={candidate.photoUrl || ''} alt={candidate.name}>
                                            {candidate.name[0]}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={`${candidate.name} (${candidate.position})`}
                                        secondary={`${candidate.age}세 | 현재 득표: ${Object.values(candidate.votesByRound || {}).reduce((a, b) => a + b, 0)}`}
                                    />
                                    <ListItemSecondaryAction>
                                        <IconButton edge="end" aria-label="delete" color="error" onClick={() => setDeleteTarget(candidate)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                                <Divider component="li" />
                            </div>
                        ))
                    )}
                </List>
            )}

            <ConfirmDialog
                open={!!deleteTarget}
                title="후보자 삭제(사퇴) 확인"
                description={`'${deleteTarget?.name}' 후보를 정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없으며, 득표 기록도 사라질 수 있습니다.`}
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </Paper>
    );
}
