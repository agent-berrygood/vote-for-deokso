'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, query, getDocs, doc, deleteDoc, setDoc, updateDoc, orderBy, limit, startAfter, where, query as firestoreQuery, QueryConstraint } from 'firebase/firestore';
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
    Tooltip,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import RefreshIcon from '@mui/icons-material/Refresh';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import * as XLSX from 'xlsx';
import ConfirmDialog from './ConfirmDialog';

const generateAuthKey = () => Math.floor(1000000 + Math.random() * 9000000).toString();

export default function VoterManager() {
    const { activeElectionId } = useElection();
    const [voters, setVoters] = useState<Voter[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteTarget, setDeleteTarget] = useState<Voter | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Pagination
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(20); // Default to 20

    // State for Editing
    const [editTarget, setEditTarget] = useState<Voter | null>(null);
    const [editName, setEditName] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [editBirthdate, setEditBirthdate] = useState('');
    const [updating, setUpdating] = useState(false);

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

    const handleEditOpen = (voter: Voter) => {
        setEditTarget(voter);
        setEditName(voter.name);
        setEditPhone(voter.phone || '');
        setEditBirthdate(voter.birthdate || '');
    };

    const handleUpdateVoter = async () => {
        if (!activeElectionId || !editTarget || !editTarget.id) return;
        if (!editName.trim()) {
            setMessage({ type: 'error', text: '이름을 입력해주세요.' });
            return;
        }

        setUpdating(true);
        try {
            const voterRef = doc(db, `elections/${activeElectionId}/voters`, editTarget.id);
            const updatedData = {
                name: editName.trim(),
                phone: editPhone.trim(),
                birthdate: editBirthdate.trim()
            };

            await updateDoc(voterRef, updatedData);
            await logAdminAction({
                electionId: activeElectionId,
                actionType: 'OTHER',
                description: `선거인 정보 수정: '${editTarget.name}' -> '${editName}'`
            });

            setVoters(prev => prev.map(v => v.id === editTarget.id ? { ...v, ...updatedData } : v));
            setMessage({ type: 'success', text: `'${editName}' 선거인 정보가 수정되었습니다.` });
            setEditTarget(null);
        } catch (err) {
            console.error("Error updating voter:", err);
            setMessage({ type: 'error', text: '선거인 정보 수정 중 오류가 발생했습니다.' });
        } finally {
            setUpdating(false);
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

    const handleDownloadExcel = async () => {
        if (!activeElectionId) return;
        setLoading(true);
        try {
            // Prepare data
            const data = voters.map(v => ({
                '이름': v.name,
                '생년월일': v.birthdate || '',
                '전화번호': v.phone || '',
                '인증키': v.authKey || '',
                '참여여부': (v.participated && Object.keys(v.participated).length > 0) || v.hasVoted ? '참여' : '미참여'
            }));

            // Create worksheet
            const ws = XLSX.utils.json_to_sheet(data);

            // Force "생년월일" column (index 1) to be text to prevent scientific notation or numeric formatting
            // In XLSX, 'z' is the format code. '@' means text.
            const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
            for (let R = range.s.r + 1; R <= range.e.r; ++R) {
                const cellRef = XLSX.utils.encode_cell({ r: R, c: 1 }); // Column B
                if (ws[cellRef]) {
                    ws[cellRef].t = 's'; // Set type to string
                    ws[cellRef].z = '@'; // Set format to text
                }
            }

            // Create workbook and append sheet
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "선거인명부");

            // Generate filename with date
            const dateStr = new Date().toISOString().split('T')[0];
            const filename = `선거인명부_${dateStr}.xlsx`;

            // Write and download
            XLSX.writeFile(wb, filename);

            await logAdminAction({
                electionId: activeElectionId,
                actionType: 'DOWNLOAD_VOTERS',
                description: `선거인명부 엑셀 다운로드 (${voters.length}명)`
            });

            setMessage({ type: 'success', text: '선거인명부 엑셀 파일이 생성되었습니다.' });
        } catch (err) {
            console.error("Error exporting excel:", err);
            setMessage({ type: 'error', text: '엑셀 다운로드 중 오류가 발생했습니다.' });
        } finally {
            setLoading(false);
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

    const paginatedVoters = rowsPerPage === -1
        ? filteredVoters
        : filteredVoters.slice((page - 1) * rowsPerPage, page * rowsPerPage);

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
                                <Button
                                    variant="outlined"
                                    color="success"
                                    startIcon={<FileDownloadIcon />}
                                    onClick={handleDownloadExcel}
                                    disabled={loading || voters.length === 0}
                                    size="small"
                                >
                                    엑셀 다운로드
                                </Button>
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
                                                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                                                        <Tooltip title="정보 수정">
                                                            <IconButton color="primary" size="small" onClick={() => handleEditOpen(v)}>
                                                                <EditIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="선거인 삭제">
                                                            <IconButton color="error" size="small" onClick={() => setDeleteTarget(v)}>
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 3, gap: 3, flexWrap: 'wrap' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="caption" color="text.secondary">표시 인원:</Typography>
                                <Select
                                    value={rowsPerPage}
                                    onChange={(e) => {
                                        setRowsPerPage(Number(e.target.value));
                                        setPage(1);
                                    }}
                                    size="small"
                                    sx={{ height: 32, minWidth: 80, fontSize: '0.75rem' }}
                                >
                                    <MenuItem value={20}>20명</MenuItem>
                                    <MenuItem value={50}>50명</MenuItem>
                                    <MenuItem value={100}>100명</MenuItem>
                                    <MenuItem value={-1}>전체</MenuItem>
                                </Select>
                            </Box>

                            {rowsPerPage !== -1 && (
                                <Pagination
                                    count={Math.ceil(filteredVoters.length / rowsPerPage)}
                                    page={page}
                                    onChange={(e, p) => setPage(p)}
                                    color="primary"
                                    size="small"
                                />
                            )}
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

            {/* Edit Dialog */}
            <Dialog open={!!editTarget} onClose={() => setEditTarget(null)} fullWidth maxWidth="xs">
                <DialogTitle fontWeight="bold">선거인 정보 수정</DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        <TextField
                            label="이름"
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            size="small"
                            fullWidth
                            required
                        />
                        <TextField
                            label="휴대폰 번호"
                            value={editPhone}
                            onChange={e => {
                                const val = e.target.value.replace(/[^0-9]/g, '');
                                let formatted = val;
                                if (val.length > 3 && val.length <= 7) {
                                    formatted = `${val.slice(0, 3)}-${val.slice(3)}`;
                                } else if (val.length > 7) {
                                    formatted = `${val.slice(0, 3)}-${val.slice(3, 7)}-${val.slice(7, 11)}`;
                                }
                                setEditPhone(formatted);
                            }}
                            size="small"
                            fullWidth
                            placeholder="010-0000-0000"
                        />
                        <TextField
                            label="생년월일 (6자리)"
                            value={editBirthdate}
                            onChange={e => setEditBirthdate(e.target.value)}
                            size="small"
                            fullWidth
                            placeholder="700101"
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setEditTarget(null)} color="inherit">취소</Button>
                    <Button
                        onClick={handleUpdateVoter}
                        variant="contained"
                        color="primary"
                        disabled={updating}
                    >
                        {updating ? <CircularProgress size={24} /> : '수정 완료'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
