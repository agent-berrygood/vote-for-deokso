'use client';

import { useState, useEffect, useCallback } from 'react';
import { Voter } from '@/types';
import { useElection } from '@/hooks/useElection';
import {
    listVotersAction,
    listVoterParticipationsAction,
    createVoterAction,
    updateVoterAction,
    deleteVoterAction,
    createAdminLogAction
} from '@/app/actions/data';
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
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
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
    const [rowsPerPage, setRowsPerPage] = useState(20);

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

    // Round Selection State
    const [selectedRound, setSelectedRound] = useState<number>(1);
    const [selectedPosition, setSelectedPosition] = useState<string>('장로');

    // Round Detail State
    const [detailTarget, setDetailTarget] = useState<Voter | null>(null);

    const fetchVoters = useCallback(async () => {
        if (!activeElectionId) return;
        setLoading(true);
        try {
            const vRes = await listVotersAction(activeElectionId);
            if (!vRes.success || !vRes.data) throw new Error(vRes.error || '선거인 데이터를 불러오지 못했습니다.');
            const loadedVoters = vRes.data as Voter[];

            const pRes = await listVoterParticipationsAction(activeElectionId);
            if (!pRes.success || !pRes.data) throw new Error(pRes.error || '참여 데이터를 불러오지 못했습니다.');
            const pList = pRes.data;

            const participationMap: Record<string, Record<string, boolean>> = {};
            pList.forEach((p: any) => {
                const voterId = p.voterId;
                if (!participationMap[voterId]) participationMap[voterId] = {};
                participationMap[voterId][`${p.position}_${p.roundNumber}`] = true;
            });

            const mergedVoters = loadedVoters.map(v => ({
                ...v,
                participated: v.id ? participationMap[v.id] || {} : {}
            }));

            setVoters(mergedVoters);
        } catch (err) {
            console.error("Error fetching SQL voters:", err);
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
            const authKey = generateAuthKey();
            const createRes = await createVoterAction({
                electionId: activeElectionId,
                name: newName.trim(),
                phone: newPhone.trim(),
                birthdate: newBirthdate.trim(),
                authKey: authKey
            });
            if (!createRes.success) throw new Error(createRes.error);

            await createAdminLogAction({
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
            console.error("Error adding SQL voter:", err);
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
            const updateRes = await updateVoterAction({
                id: editTarget.id,
                name: editName.trim(),
                phone: editPhone.trim(),
                birthdate: editBirthdate.trim()
            });
            if (!updateRes.success) throw new Error(updateRes.error);

            await createAdminLogAction({
                electionId: activeElectionId,
                actionType: 'OTHER',
                description: `선거인 정보 수정: '${editTarget.name}' -> '${editName}'`
            });

            setMessage({ type: 'success', text: `'${editName}' 선거인 정보가 수정되었습니다.` });
            setEditTarget(null);
            fetchVoters();
        } catch (err) {
            console.error("Error updating SQL voter:", err);
            setMessage({ type: 'error', text: '선거인 정보 수정 중 오류가 발생했습니다.' });
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (!activeElectionId || !deleteTarget || !deleteTarget.id) return;

        try {
            const deleteRes = await deleteVoterAction({ id: deleteTarget.id });
            if (!deleteRes.success) throw new Error(deleteRes.error);
            await createAdminLogAction({
                electionId: activeElectionId,
                actionType: 'OTHER',
                description: `선거인 '${deleteTarget.name}' (${deleteTarget.authKey}) 삭제`
            });

            setVoters(prev => prev.filter(v => v.id !== deleteTarget.id));
            setMessage({ type: 'success', text: `'${deleteTarget.name}' 선거인이 삭제되었습니다.` });
        } catch (err) {
            console.error("Error deleting SQL voter:", err);
            setMessage({ type: 'error', text: '선거인 삭제 중 오류가 발생했습니다.' });
        } finally {
            setDeleteTarget(null);
        }
    };

    const handleDownloadExcel = async () => {
        if (!activeElectionId) return;
        setLoading(true);
        try {
            const data = voters.map(v => {
                const baseInfo = {
                    '이름': v.name,
                    '생년월일': v.birthdate || '',
                    '전화번호': v.phone || '',
                    '인증키': v.authKey || '',
                };

                const participationInfo: { [key: string]: string } = {};
                const positions = ['장로', '권사', '안수집사'];
                for (const pos of positions) {
                    for (let r = 1; r <= 5; r++) {
                        participationInfo[`${pos}_${r}차`] = v.participated?.[`${pos}_${r}`] ? '참여' : '미참여';
                    }
                }

                return { ...baseInfo, ...participationInfo };
            });

            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "선거인명부");

            const dateStr = new Date().toISOString().split('T')[0];
            const filename = `선거인명부_SQL_${dateStr}.xlsx`;

            XLSX.writeFile(wb, filename);

            await createAdminLogAction({
                electionId: activeElectionId,
                actionType: 'DOWNLOAD_VOTERS',
                description: `선거인명부 엑셀 다운로드 (${voters.length}명)`
            });

            setMessage({ type: 'success', text: '선거인명부 엑셀 파일이 생성되었습니다.' });
        } catch (err) {
            console.error("Error exporting SQL excel:", err);
            setMessage({ type: 'error', text: '엑셀 다운로드 중 오류가 발생했습니다.' });
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('인증키가 복사되었습니다: ' + text);
    };

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
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PersonAddIcon color="secondary" /> 선거인 개별 추가 (SQL)
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
                            </Box>
                        </form>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper sx={{ p: 3 }}>
                        <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                <Typography variant="subtitle2" sx={{ mr: 1, fontWeight: 'bold' }}>차수 선택:</Typography>
                                {[1, 2, 3].map((r) => (
                                    <Button
                                        key={r}
                                        variant={selectedRound === r ? "contained" : "outlined"}
                                        size="small"
                                        onClick={() => setSelectedRound(r)}
                                    >
                                        {r}차
                                    </Button>
                                ))}
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                <Typography variant="subtitle2" sx={{ mr: 1, fontWeight: 'bold' }}>직분 선택:</Typography>
                                {['장로', '권사', '안수집사'].map((pos) => (
                                    <Button
                                        key={pos}
                                        variant={selectedPosition === pos ? "contained" : "outlined"}
                                        size="small"
                                        color="secondary"
                                        onClick={() => setSelectedPosition(pos)}
                                    >
                                        {pos}
                                    </Button>
                                ))}
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                            <Typography variant="h6" fontWeight="bold">
                                선거인 명부 ({filteredVoters.length}명)
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <TextField
                                    placeholder="검색"
                                    value={searchTerm}
                                    onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
                                    size="small"
                                    sx={{ width: 150 }}
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
                                    엑셀
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
                                        <TableCell align="center">{selectedPosition} {selectedRound}차</TableCell>
                                        <TableCell align="center">관리</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {loading ? (
                                        <TableRow><TableCell colSpan={6} align="center" sx={{ py: 3 }}><CircularProgress /></TableCell></TableRow>
                                    ) : paginatedVoters.length === 0 ? (
                                        <TableRow><TableCell colSpan={6} align="center" sx={{ py: 3 }}>데이터가 없습니다.</TableCell></TableRow>
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
                                                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
                                                        {v.participated?.[`${selectedPosition}_${selectedRound}`] ? (
                                                            <Chip label="참여" color="success" size="small" />
                                                        ) : (
                                                            <Chip label="미참여" color="default" size="small" variant="outlined" />
                                                        )}
                                                        <IconButton size="small" onClick={() => setDetailTarget(v)}>
                                                            <VisibilityIcon fontSize="inherit" />
                                                        </IconButton>
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                                                        <IconButton color="primary" size="small" onClick={(e) => { e.currentTarget.blur(); handleEditOpen(v); }}>
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                        <IconButton color="error" size="small" onClick={() => setDeleteTarget(v)}>
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                            <Pagination
                                count={Math.ceil(filteredVoters.length / rowsPerPage)}
                                page={page}
                                onChange={(e, p) => setPage(p)}
                                color="primary"
                                size="small"
                                disabled={rowsPerPage === -1}
                            />
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            <ConfirmDialog
                open={!!deleteTarget}
                title="선거인 삭제"
                description={`'${deleteTarget?.name}' 선거인을 삭제하시겠습니까?`}
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />

            <Dialog open={!!editTarget} onClose={() => setEditTarget(null)} fullWidth maxWidth="xs">
                <DialogTitle fontWeight="bold">선거인 정보 수정 (SQL)</DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        <TextField autoFocus label="이름" value={editName} onChange={e => setEditName(e.target.value)} size="small" fullWidth required />
                        <TextField label="휴대폰" value={editPhone} onChange={e => setEditPhone(e.target.value)} size="small" fullWidth />
                        <TextField label="생년월일" value={editBirthdate} onChange={e => setEditBirthdate(e.target.value)} size="small" fullWidth />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditTarget(null)}>취소</Button>
                    <Button onClick={handleUpdateVoter} variant="contained" disabled={updating}>수정</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={!!detailTarget} onClose={() => setDetailTarget(null)} fullWidth maxWidth="sm">
                <DialogTitle fontWeight="bold">상세 참여 현황</DialogTitle>
                <DialogContent dividers>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>구분</TableCell>
                                {[1, 2, 3, 4, 5].map(r => <TableCell key={r} align="center">{r}차</TableCell>)}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {['장로', '권사', '안수집사'].map(pos => (
                                <TableRow key={pos}>
                                    <TableCell sx={{ fontWeight: 'bold' }}>{pos}</TableCell>
                                    {[1, 2, 3, 4, 5].map(r => (
                                        <TableCell key={r} align="center">
                                            {detailTarget?.participated?.[`${pos}_${r}`] ? <CheckCircleIcon color="success" /> : <HelpOutlineIcon color="disabled" />}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDetailTarget(null)}>닫기</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
