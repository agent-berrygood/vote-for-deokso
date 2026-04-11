'use client';

import { useState, useEffect, useCallback } from 'react';
import { Member } from '@/types';
import {
    listMembersAction,
    createMemberAction,
    updateMemberAction,
    deleteMemberAction
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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import RefreshIcon from '@mui/icons-material/Refresh';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import * as XLSX from 'xlsx';
import ConfirmDialog from './ConfirmDialog';

export default function MemberManager() {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Pagination
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(20);

    // State for Editing
    const [editTarget, setEditTarget] = useState<Member | null>(null);
    const [editName, setEditName] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [editBirthdate, setEditBirthdate] = useState('');
    const [editIsSelfRegistered, setEditIsSelfRegistered] = useState(false);
    const [updating, setUpdating] = useState(false);

    // Form State for New Member
    const [newName, setNewName] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [newBirthdate, setNewBirthdate] = useState('');
    const [adding, setAdding] = useState(false);

    const fetchMembers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await listMembersAction();
            if (!res.success || !res.data) throw new Error(res.error || '교인 데이터를 불러오지 못했습니다.');
            setMembers(res.data as Member[]);
        } catch (err) {
            console.error("Error fetching SQL members:", err);
            setMessage({ type: 'error', text: '교인 명부를 불러오지 못했습니다.' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) {
            setMessage({ type: 'error', text: '이름을 입력해주세요.' });
            return;
        }

        setAdding(true);
        try {
            const createRes = await createMemberAction({
                name: newName.trim(),
                phone: newPhone.trim(),
                birthdate: newBirthdate.trim(),
                isSelfRegistered: false // 관리자가 직접 추가하는 경우는 자가등록 아님
            });
            if (!createRes.success) throw new Error(createRes.error);

            setMessage({ type: 'success', text: `'${newName}' 교인이 추가되었습니다.` });

            // Reset Form
            setNewName('');
            setNewPhone('');
            setNewBirthdate('');

            // Refresh
            fetchMembers();
        } catch (err) {
            console.error("Error adding SQL member:", err);
            setMessage({ type: 'error', text: '교인 추가 중 오류가 발생했습니다.' });
        } finally {
            setAdding(false);
        }
    };

    const handleEditOpen = (member: Member) => {
        setEditTarget(member);
        setEditName(member.name);
        setEditPhone(member.phone || '');
        setEditBirthdate(member.birthdate || '');
        setEditIsSelfRegistered(member.isSelfRegistered);
    };

    const handleUpdateMember = async () => {
        if (!editTarget || !editTarget.id) return;
        if (!editName.trim()) {
            setMessage({ type: 'error', text: '이름을 입력해주세요.' });
            return;
        }

        setUpdating(true);
        try {
            const updateRes = await updateMemberAction({
                id: editTarget.id,
                name: editName.trim(),
                phone: editPhone.trim(),
                birthdate: editBirthdate.trim(),
                isSelfRegistered: editIsSelfRegistered
            });
            if (!updateRes.success) throw new Error(updateRes.error);

            setMessage({ type: 'success', text: `'${editName}' 교인 정보가 수정되었습니다.` });
            setEditTarget(null);
            fetchMembers();
        } catch (err) {
            console.error("Error updating SQL member:", err);
            setMessage({ type: 'error', text: '교인 정보 수정 중 오류가 발생했습니다.' });
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget || !deleteTarget.id) return;

        try {
            const deleteRes = await deleteMemberAction(deleteTarget.id);
            if (!deleteRes.success) throw new Error(deleteRes.error);

            setMembers(prev => prev.filter(m => m.id !== deleteTarget.id));
            setMessage({ type: 'success', text: `'${deleteTarget.name}' 교인이 삭제되었습니다.` });
        } catch (err) {
            console.error("Error deleting SQL member:", err);
            setMessage({ type: 'error', text: '교인 삭제 중 오류가 발생했습니다.' });
        } finally {
            setDeleteTarget(null);
        }
    };

    const handleDownloadExcel = async () => {
        setLoading(true);
        try {
            const data = members.map(m => ({
                '이름': m.name,
                '생년월일': m.birthdate || '',
                '전화번호': m.phone || '',
                '자가등록여부': m.isSelfRegistered ? 'Y' : 'N',
                '원본ID': m.originalId || ''
            }));

            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "교인명부");

            const dateStr = new Date().toISOString().split('T')[0];
            const filename = `교인명부_${dateStr}.xlsx`;

            XLSX.writeFile(wb, filename);

            setMessage({ type: 'success', text: '교인명부 엑셀 파일이 생성되었습니다.' });
        } catch (err) {
            console.error("Error exporting excel:", err);
            setMessage({ type: 'error', text: '엑셀 다운로드 중 오류가 발생했습니다.' });
        } finally {
            setLoading(false);
        }
    };

    const filteredMembers = members.filter(m =>
        m.name.includes(searchTerm) ||
        m.phone?.includes(searchTerm) ||
        m.birthdate?.includes(searchTerm)
    );

    const paginatedMembers = rowsPerPage === -1
        ? filteredMembers
        : filteredMembers.slice((page - 1) * rowsPerPage, page * rowsPerPage);

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
                            <PersonAddIcon color="primary" /> 교인 개별 추가
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <form onSubmit={handleAddMember}>
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
                                <Button type="submit" variant="contained" color="primary" disabled={adding} fullWidth>
                                    {adding ? <CircularProgress size={24} /> : '교인 등록'}
                                </Button>
                            </Box>
                        </form>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                            <Typography variant="h6" fontWeight="bold">
                                통합 교인 명부 ({filteredMembers.length}명)
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <TextField
                                    placeholder="이름/번호 검색"
                                    value={searchTerm}
                                    onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
                                    size="small"
                                    sx={{ width: 180 }}
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
                                    disabled={loading || members.length === 0}
                                    size="small"
                                >
                                    엑셀
                                </Button>
                                <IconButton onClick={fetchMembers} disabled={loading}>
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
                                        <TableCell align="center">구분</TableCell>
                                        <TableCell align="center">관리</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {loading ? (
                                        <TableRow><TableCell colSpan={5} align="center" sx={{ py: 3 }}><CircularProgress /></TableCell></TableRow>
                                    ) : paginatedMembers.length === 0 ? (
                                        <TableRow><TableCell colSpan={5} align="center" sx={{ py: 3 }}>데이터가 없습니다.</TableCell></TableRow>
                                    ) : (
                                        paginatedMembers.map((m) => (
                                            <TableRow key={m.id} hover>
                                                <TableCell sx={{ fontWeight: 'bold' }}>{m.name}</TableCell>
                                                <TableCell>{m.birthdate || '-'}</TableCell>
                                                <TableCell>{m.phone || '-'}</TableCell>
                                                <TableCell align="center">
                                                    {m.isSelfRegistered ? (
                                                        <Tooltip title="설문 참여 시 직접 등록한 사용자">
                                                            <Chip label="자가등록" color="warning" size="small" variant="outlined" />
                                                        </Tooltip>
                                                    ) : (
                                                        <Chip label="기존명부" color="default" size="small" variant="outlined" />
                                                    )}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                                                        <IconButton color="primary" size="small" onClick={() => handleEditOpen(m)}>
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                        <IconButton color="error" size="small" onClick={() => setDeleteTarget(m)}>
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
                                count={Math.ceil(filteredMembers.length / rowsPerPage)}
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
                title="교인 삭제"
                description={`'${deleteTarget?.name}' 교인을 명부에서 삭제하시겠습니까? 관련 설문 응답이 있을 경우 문제가 발생할 수 있습니다.`}
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />

            <Dialog open={!!editTarget} onClose={() => setEditTarget(null)} fullWidth maxWidth="xs">
                <DialogTitle fontWeight="bold">교인 정보 수정</DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        <TextField autoFocus label="이름" value={editName} onChange={e => setEditName(e.target.value)} size="small" fullWidth required />
                        <TextField label="휴대폰" value={editPhone} onChange={e => setEditPhone(e.target.value)} size="small" fullWidth />
                        <TextField label="생년월일" value={editBirthdate} onChange={e => setEditBirthdate(e.target.value)} size="small" fullWidth />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2">자가 등록 여부:</Typography>
                            <Chip 
                                label={editIsSelfRegistered ? "Y" : "N"} 
                                color={editIsSelfRegistered ? "warning" : "default"}
                                onClick={() => setEditIsSelfRegistered(!editIsSelfRegistered)}
                                sx={{ cursor: 'pointer' }}
                            />
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditTarget(null)}>취소</Button>
                    <Button onClick={handleUpdateMember} variant="contained" disabled={updating}>수정</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
