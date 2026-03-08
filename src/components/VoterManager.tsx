'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, query, getDocs, doc, deleteDoc, setDoc, orderBy, limit, startAfter, where, query as firestoreQuery, QueryConstraint } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Voter } from '@/types';
import { useElection } from '@/hooks/useElection';
import { logAdminAction } from '@/lib/adminLogger';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    CircularProgress,
    Divider,
    Alert,
    Grid,
    InputAdornment,
    Pagination,
    Chip,
    Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import RefreshIcon from '@mui/icons-material/Refresh';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ConfirmDialog from './ConfirmDialog';

const generateAuthKey = () => Math.floor(1000000 + Math.random() * 9000000).toString();

export default function VoterManager() {
    const { activeElectionId } = useElection();
    const [voters, setVoters] = useState<Voter[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteTarget, setDeleteTarget] = useState<Voter | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Pagination (Simple client-side for now, but structured for query if needed)
    const [page, setPage] = useState(1);
    const rowsPerPage = 10;

    // Form State for New Voter
    const [newName, setNewName] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [newBirthdate, setNewBirthdate] = useState('');
    const [adding, setAdding] = useState(false);

    const fetchVoters = useCallback(async () => {
        if (!activeElectionId) return;
        setLoading(true);
        try {
            const vRef = collection(db, `elections/${activeElectionId}/voters`);
            const q = query(vRef, orderBy('name', 'asc'));
            const querySnapshot = await getDocs(q);
            const loadedVoters: Voter[] = [];
            querySnapshot.forEach((doc) => {
                loadedVoters.push({ id: doc.id, ...doc.data() } as Voter);
            });
            setVoters(loadedVoters);
        } catch (err) {
            console.error("Error fetching voters:", err);
            setMessage({ type: 'error', text: '선거인 명부를 불러오지 못했습니다.' });
        } finally {
            setLoading(false);
        }
    }, [activeElectionId]);

    useEffect(() => {
        fetchVoters();
    }, [fetchVoters]);

    const handleAddVoter = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeElectionId) return;
        if (!newName.trim()) {
            setMessage({ type: 'error', text: '이름을 입력해주세요.' });
            return;
        }

        setAdding(true);
        try {
            const voterRef = doc(collection(db, `elections/${activeElectionId}/voters`));
            const authKey = generateAuthKey();
            const newVoter: Voter = {
                id: voterRef.id,
                name: newName.trim(),
                phone: newPhone.trim(),
                birthdate: newBirthdate.trim(),
                authKey: authKey,
                hasVoted: false,
                votedAt: null
            };

            await setDoc(voterRef, newVoter);
            await logAdminAction({
                electionId: activeElectionId,
                actionType: 'ADD_SINGLE_VOTER',
                description: `선거인 '${newName}' 직접 추가 (인증키: ${authKey})`
            });

            setMessage({ type: 'success', text: `'${newName}' 선거인이 추가되었습니다. 인증키: ${authKey}` });

            // Reset Form
            setNewName('');
            setNewPhone('');
            setNewBirthdate('');

            // Refresh
            fetchVoters();
        } catch (err) {
            console.error("Error adding voter:", err);
            setMessage({ type: 'error', text: '선거인 추가 중 오류가 발생했습니다.' });
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = async () => {
        if (!activeElectionId || !deleteTarget || !deleteTarget.id) return;

        try {
            await deleteDoc(doc(db, `elections/${activeElectionId}/voters`, deleteTarget.id));
            await logAdminAction({
                electionId: activeElectionId,
                actionType: 'OTHER',
                description: `선거인 '${deleteTarget.name}' (${deleteTarget.authKey}) 삭제`
            });

            setVoters(prev => prev.filter(v => v.id !== deleteTarget.id));
            setMessage({ type: 'success', text: `'${deleteTarget.name}' 선거인이 삭제되었습니다.` });
        } catch (err) {
            console.error("Error deleting voter:", err);
            setMessage({ type: 'error', text: '선거인 삭제 중 오류가 발생했습니다.' });
        } finally {
            setDeleteTarget(null);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('인증키가 복사되었습니다: ' + text);
    };

    // Filter Logic
    const filteredVoters = voters.filter(v =>
        v.name.includes(searchTerm) ||
        v.phone?.includes(searchTerm) ||
        v.birthdate?.includes(searchTerm) ||
        v.authKey?.includes(searchTerm)
    );

    const paginatedVoters = filteredVoters.slice((page - 1) * rowsPerPage, page * rowsPerPage);

    return (
        <Box>
            {message && (
                <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage(null)}>
                    {message.text}
                </Alert>
            )}

            <Grid container spacing={3}>
                {/* 1. Add Voter Form */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PersonAddIcon color="secondary" /> 선거인 개별 추가
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <form onSubmit={handleAddVoter}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <TextField label="이름" value={newName} onChange={e => setNewName(e.target.value)} size="small" fullWidth required />
                                <TextField
                                    label="휴대폰 번호"
                                    value={newPhone}
                                    onChange={e => {
                                        const val = e.target.value.replace(/[^0-9]/g, '');
                                        let formatted = val;
                                        if (val.length > 3 && val.length <= 7) {
                                            formatted = `${val.slice(0, 3)}-${val.slice(3)}`;
                                        } else if (val.length > 7) {
                                            formatted = `${val.slice(0, 3)}-${val.slice(3, 7)}-${val.slice(7, 11)}`;
                                        }
                                        setNewPhone(formatted);
                                    }}
                                    size="small"
                                    fullWidth
                                    placeholder="010-0000-0000"
                                />
                                <TextField label="생년월일 (6자리)" value={newBirthdate} onChange={e => setNewBirthdate(e.target.value)} size="small" fullWidth placeholder="700101" />
                                <Button type="submit" variant="contained" color="secondary" disabled={adding} fullWidth>
                                    {adding ? <CircularProgress size={24} /> : '선거인 등록'}
                                </Button>
                                <Typography variant="caption" color="text.secondary">
                                    * 인증키는 등록 시 자동으로 생성됩니다.
                                </Typography>
                            </Box>
                        </form>
                    </Paper>
                </Grid>

                {/* 2. Voter List Table */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                            <Typography variant="h6" fontWeight="bold">
                                선거인 명부 ({filteredVoters.length}명)
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <TextField
                                    placeholder="이름, 번호, 생일, 인증키 검색"
                                    value={searchTerm}
                                    onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
                                    size="small"
                                    sx={{ width: 250 }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon fontSize="small" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                <IconButton onClick={fetchVoters} disabled={loading}>
                                    <RefreshIcon />
                                </IconButton>
                            </Box>
                        </Box>

                        <TableContainer sx={{ maxHeight: 600 }}>
                            <Table stickyHeader size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>이름</TableCell>
                                        <TableCell>생년월일</TableCell>
                                        <TableCell>전화번호</TableCell>
                                        <TableCell>인증키</TableCell>
                                        <TableCell align="center">참여여부</TableCell>
                                        <TableCell align="center">관리</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {loading ? (
                                        <TableRow><TableCell colSpan={6} align="center" sx={{ py: 3 }}><CircularProgress /></TableCell></TableRow>
                                    ) : paginatedVoters.length === 0 ? (
                                        <TableRow><TableCell colSpan={6} align="center" sx={{ py: 3 }}>선거인 데이터가 없습니다.</TableCell></TableRow>
                                    ) : (
                                        paginatedVoters.map((v) => (
                                            <TableRow key={v.id} hover>
                                                <TableCell sx={{ fontWeight: 'bold' }}>{v.name}</TableCell>
                                                <TableCell>{v.birthdate}</TableCell>
                                                <TableCell>{v.phone}</TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <code>{v.authKey}</code>
                                                        <IconButton size="small" onClick={() => copyToClipboard(v.authKey || '')}>
                                                            <ContentCopyIcon sx={{ fontSize: 14 }} />
                                                        </IconButton>
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="center">
                                                    {(v.participated && Object.keys(v.participated).length > 0) || v.hasVoted ? (
                                                        <Chip label="참여" color="success" size="small" variant="outlined" />
                                                    ) : (
                                                        <Chip label="미참여" color="default" size="small" variant="outlined" />
                                                    )}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Tooltip title="선거인 삭제">
                                                        <IconButton color="error" size="small" onClick={() => setDeleteTarget(v)}>
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                            <Pagination
                                count={Math.ceil(filteredVoters.length / rowsPerPage)}
                                page={page}
                                onChange={(e, p) => setPage(p)}
                                color="primary"
                                size="small"
                            />
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            <ConfirmDialog
                open={!!deleteTarget}
                title="선거인 삭제"
                description={`'${deleteTarget?.name}' 선거인을 명부에서 삭제하시겠습니까? 투표 기록이 있을 경우 함께 관리되지 않을 수 있습니다.`}
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
                requireReAuth
            />
        </Box>
    );
}
