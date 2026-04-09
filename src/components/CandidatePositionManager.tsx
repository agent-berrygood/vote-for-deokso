'use client';

import { useState, useEffect, useCallback } from 'react';
import { Candidate } from '@/types';
import { calculateAge } from '@/utils/age';
import { useElection } from '@/hooks/useElection';
import {
    listCandidatesByPosition,
    createCandidate,
    updateCandidate,
    deleteCandidate,
    deleteCandidatesByRound,
    getResultsByRound,
    getElectionSettings,
    createAdminLog,
    listVoterParticipations
} from '@/lib/dataconnect';
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
    Chip,
    Tabs,
    Tab,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import RefreshIcon from '@mui/icons-material/Refresh';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import * as XLSX from 'xlsx';
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
    const [activeTab, setActiveTab] = useState(0);

    const [autoImportOpen, setAutoImportOpen] = useState(false);
    const [deleteAllConfirmOpen, setDeleteAllConfirmOpen] = useState(false);

    // Form State for New Candidate
    const [newName, setNewName] = useState('');
    const [newBirthdate, setNewBirthdate] = useState('');
    const [newDistrict, setNewDistrict] = useState('');
    const [newProfile, setNewProfile] = useState('');
    const [newVolunteer, setNewVolunteer] = useState('');
    const [newRound, setNewRound] = useState(1);
    const [newCandidateNumber, setNewCandidateNumber] = useState('');
    const [adding, setAdding] = useState(false);

    // Edit State
    const [editTarget, setEditTarget] = useState<Candidate | null>(null);
    const [editName, setEditName] = useState('');
    const [editBirthdate, setEditBirthdate] = useState('');
    const [editDistrict, setEditDistrict] = useState('');
    const [editProfile, setEditProfile] = useState('');
    const [editVolunteer, setEditVolunteer] = useState('');
    const [editRound, setEditRound] = useState(1);
    const [editCandidateNumber, setEditCandidateNumber] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setNewRound(activeTab + 1);
    }, [activeTab]);

    const fetchCandidates = useCallback(async () => {
        if (!activeElectionId) return;
        setLoading(true);
        try {
            const res = await listCandidatesByPosition({ electionId: activeElectionId, position });
            setCandidates(res.data.candidates as Candidate[]);
        } catch (err) {
            console.error("Error fetching SQL candidates:", err);
            setMessage({ type: 'error', text: '후보자 목록을 불러오지 못했습니다.' });
        } finally {
            setLoading(false);
        }
    }, [activeElectionId, position]);

    useEffect(() => {
        fetchCandidates();
    }, [fetchCandidates]);

    const handleAddCandidate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeElectionId) return;
        if (!newName.trim()) {
            setMessage({ type: 'error', text: '이름을 입력해주세요.' });
            return;
        }

        setAdding(true);
        try {
            const parsedCandNum = newCandidateNumber.trim() ? parseInt(newCandidateNumber.trim(), 10) : undefined;
            await createCandidate({
                electionId: activeElectionId,
                name: newName.trim(),
                position: position,
                round: newRound,
                district: newDistrict.trim(),
                birthdate: newBirthdate.trim(),
                profileDesc: newProfile.trim(),
                volunteerInfo: newVolunteer.trim(),
                candidateNumber: parsedCandNum
            });

            await createAdminLog({
                electionId: activeElectionId,
                actionType: 'ADD_SINGLE_CANDIDATE',
                description: `'${position}' 후보자 '${newName}' SQL 추가`
            });

            setMessage({ type: 'success', text: `'${newName}' 후보가 성공적으로 추가되었습니다.` });
            setNewName(''); setNewBirthdate(''); setNewDistrict(''); setNewProfile(''); setNewVolunteer(''); setNewCandidateNumber('');
            fetchCandidates();
        } catch (err) {
            console.error("Error adding SQL candidate:", err);
            setMessage({ type: 'error', text: '후보자 추가 중 오류가 발생했습니다.' });
        } finally {
            setAdding(false);
        }
    };

    const handleAutoImportFromPrevRound = async () => {
        if (!activeElectionId) return;
        setLoading(true);
        try {
            // 1. Get Election Config
            const settingsRes = await getElectionSettings({ electionId: activeElectionId });
            const roundsJson = JSON.parse(settingsRes.data.election?.rounds || '{}');
            const maxVotes = roundsJson[position]?.maxVotes || 5;

            // 2. Get Previous Round Data
            const sourceRound = activeTab; 
            const targetRound = activeTab + 1;

            // 3. Count Participations for Threshold
            const participationsRes = await listVoterParticipations({ electionId: activeElectionId });
            const ballots = participationsRes.data.voterParticipations.filter(p => p.position === position && p.roundNumber === sourceRound).length;

            let threshold = 999999;
            if (ballots > 0) {
                threshold = (position === '장로') ? Math.ceil(ballots * (2 / 3)) : (Math.floor(ballots / 2) + 1);
            }

            // 4. Fetch Prev Results
            const resultsRes = await getResultsByRound({ electionId: activeElectionId, position, round: sourceRound });
            const prevCandidates = resultsRes.data.candidates;

            // 5. Filter & Sort
            const notElected = prevCandidates.filter(c => (c.voteCount || 0) < threshold);
            const targetCount = Math.ceil(maxVotes * 1.5);
            const selectedCandidates = notElected.slice(0, targetCount);

            if (selectedCandidates.length === 0) {
                setMessage({ type: 'warning', text: `불러올 ${sourceRound}차 통과 후보가 없습니다.` });
                setAutoImportOpen(false); return;
            }

            // 6. Create Candidates (SQL Sequence)
            for (const c of selectedCandidates) {
                await createCandidate({
                    electionId: activeElectionId,
                    name: c.name,
                    position: c.position,
                    round: targetRound,
                    district: c.district || '',
                    birthdate: c.birthdate || '',
                    photoUrl: c.photoUrl,
                    profileDesc: c.profileDesc,
                    volunteerInfo: c.volunteerInfo
                });
            }

            await createAdminLog({
                electionId: activeElectionId,
                actionType: 'OTHER',
                description: `'${position}' ${targetRound}차 후보자 ${selectedCandidates.length}명 자동 생성`
            });

            setMessage({ type: 'success', text: `${selectedCandidates.length}명의 후보자가 자동 생성되었습니다.` });
            fetchCandidates();
        } catch (err) {
            console.error("Error SQL auto-import:", err);
            setMessage({ type: 'error', text: '후보자 자동 생성 중 오류가 발생했습니다.' });
        } finally {
            setLoading(false);
            setAutoImportOpen(false);
        }
    };

    const handleDelete = async () => {
        if (!activeElectionId || !deleteTarget || !deleteTarget.id) return;
        try {
            await deleteCandidate({ id: deleteTarget.id });
            await createAdminLog({
                electionId: activeElectionId,
                actionType: 'DELETE_CANDIDATE',
                description: `'${deleteTarget.name}' (${position}) 후보 삭제`
            });
            setMessage({ type: 'success', text: `'${deleteTarget.name}' 후보가 삭제되었습니다.` });
            fetchCandidates();
        } catch (err) {
            console.error("Error deleting SQL candidate:", err);
            setMessage({ type: 'error', text: '후보자 삭제 중 오류가 발생했습니다.' });
        } finally {
            setDeleteTarget(null);
        }
    };

    const handleDeleteAllCandidates = async () => {
        if (!activeElectionId) return;
        setLoading(true);
        try {
            const targetRound = activeTab + 1;
            await deleteCandidatesByRound({ electionId: activeElectionId, position, round: targetRound });
            await createAdminLog({
                electionId: activeElectionId,
                actionType: 'DELETE_CANDIDATE',
                description: `'${position}' ${targetRound}차 후보자 전체 삭제`
            });
            setMessage({ type: 'success', text: '현재 차수 후보자가 모두 삭제되었습니다.' });
            fetchCandidates();
        } catch (err) {
            console.error("Error SQL bulk delete:", err);
            setMessage({ type: 'error', text: '전체 삭제 중 오류가 발생했습니다.' });
        } finally {
            setLoading(false);
            setDeleteAllConfirmOpen(false);
        }
    };

    const handleEditSave = async () => {
        if (!activeElectionId || !editTarget || !editTarget.id) return;
        setIsSaving(true);
        try {
            const parsedCandNum = editCandidateNumber.trim() ? parseInt(editCandidateNumber.trim(), 10) : undefined;
            await updateCandidate({
                id: editTarget.id,
                name: editName.trim(),
                birthdate: editBirthdate.trim(),
                district: editDistrict.trim(),
                profileDesc: editProfile.trim(),
                volunteerInfo: editVolunteer.trim(),
                round: editRound,
                candidateNumber: parsedCandNum
            });

            await createAdminLog({
                electionId: activeElectionId,
                actionType: 'OTHER',
                description: `'${editName}' (${position}) 후보 정보 수정`
            });

            setMessage({ type: 'success', text: `'${editName}' 정보가 수정되었습니다.` });
            setEditTarget(null);
            fetchCandidates();
        } catch (err) {
            console.error("Error updating SQL candidate:", err);
            setMessage({ type: 'error', text: '후보자 수정 중 오류가 발생했습니다.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDownloadExcel = async () => {
        if (!activeElectionId) return;
        const selectedRound = activeTab + 1;
        const filtered = candidates.filter(c => c.round === selectedRound);
        const data = filtered.map(c => ({
            '이름': c.name, '생년월일': c.birthdate || '', '교구': c.district || '', '차수': `${c.round}차`, '봉사이력': c.profileDesc || ''
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "후보자명부");
        XLSX.writeFile(wb, `${position}_후보자명부.xlsx`);
    };

    const handleEditClick = (c: Candidate) => {
        setEditTarget(c); setEditName(c.name); setEditBirthdate(c.birthdate || '');
        setEditDistrict(c.district || ''); setEditProfile(c.profileDesc || '');
        setEditVolunteer(c.volunteerInfo || ''); setEditRound(c.round || activeTab + 1);
        setEditCandidateNumber(c.candidateNumber !== undefined ? String(c.candidateNumber) : '');
    };

    const filteredCandidates = candidates.filter(c => (c.round === activeTab + 1) && (c.name.includes(searchTerm) || c.district?.includes(searchTerm)));

    return (
        <Box sx={{ p: 0 }}>
            {message && <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage(null)}>{message.text}</Alert>}
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold"><PersonAddIcon /> 후보 추가 (SQL)</Typography>
                        <Divider sx={{ mb: 2 }} />
                        <form onSubmit={handleAddCandidate}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <TextField label="이름" value={newName} onChange={e => setNewName(e.target.value)} size="small" fullWidth required />
                                <TextField label="생년월일" value={newBirthdate} onChange={e => setNewBirthdate(e.target.value)} size="small" fullWidth />
                                <TextField label="교구" value={newDistrict} onChange={e => setNewDistrict(e.target.value)} size="small" fullWidth />
                                <TextField label="차수" type="number" value={newRound} onChange={e => setNewRound(Number(e.target.value))} size="small" fullWidth />
                                <TextField label="기호" type="number" value={newCandidateNumber} onChange={e => setNewCandidateNumber(e.target.value)} size="small" fullWidth />
                                <Button type="submit" variant="contained" disabled={adding} fullWidth>{adding ? '처리 중...' : '등록'}</Button>
                            </Box>
                        </form>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper sx={{ mb: 2 }}><Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} variant="fullWidth">
                        {[1, 2, 3, 4, 5].map(r => <Tab key={r} label={`${r}차`} />)}
                    </Tabs></Paper>
                    <Paper sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="h6" fontWeight="bold">{position} {activeTab + 1}차 목록</Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <TextField label="검색" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} size="small" sx={{ width: 150 }} />
                                {filteredCandidates.length === 0 && activeTab > 0 && <Button variant="contained" onClick={() => setAutoImportOpen(true)} size="small">자동 생성</Button>}
                                {filteredCandidates.length > 0 && <Button variant="contained" color="error" onClick={() => setDeleteAllConfirmOpen(true)} size="small">전체 삭제</Button>}
                                <IconButton onClick={fetchCandidates}><RefreshIcon /></IconButton>
                            </Box>
                        </Box>
                        <List>
                            {filteredCandidates.map(c => (
                                <ListItem key={c.id} divider>
                                    <ListItemAvatar><Avatar src={c.photoUrl}>{c.name[0]}</Avatar></ListItemAvatar>
                                    <ListItemText primary={`${c.name} (${calculateAge(c.birthdate, 0)}세)`} secondary={`${c.district} | 기호 ${c.candidateNumber || '-'}`} />
                                    <ListItemSecondaryAction>
                                        <IconButton onClick={() => handleEditClick(c)}><EditIcon /></IconButton>
                                        <IconButton onClick={() => setDeleteTarget(c)} color="error"><DeleteIcon /></IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                </Grid>
            </Grid>
            <ConfirmDialog open={!!deleteTarget} title="후보 삭제" description={`'${deleteTarget?.name}' 후보를 삭제하시겠습니까?`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
            <ConfirmDialog open={autoImportOpen} title="자동 후보 생성" description="이전 차수 결과를 기반으로 다음 차수 후보를 생성하시겠습니까?" onConfirm={handleAutoImportFromPrevRound} onCancel={() => setAutoImportOpen(false)} />
            <ConfirmDialog open={deleteAllConfirmOpen} title="전체 삭제" description="현재 차수의 모든 후보자를 삭제하시겠습니까?" onConfirm={handleDeleteAllCandidates} onCancel={() => setDeleteAllConfirmOpen(false)} />
            
            <Dialog open={!!editTarget} onClose={() => setEditTarget(null)} fullWidth maxWidth="xs">
                <DialogTitle>후보 수정</DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        <TextField label="이름" value={editName} onChange={e => setEditName(e.target.value)} size="small" fullWidth />
                        <TextField label="교구" value={editDistrict} onChange={e => setEditDistrict(e.target.value)} size="small" fullWidth />
                        <TextField label="기호" type="number" value={editCandidateNumber} onChange={e => setEditCandidateNumber(e.target.value)} size="small" fullWidth />
                        <TextField label="봉사 이력" value={editProfile} onChange={e => setEditProfile(e.target.value)} size="small" fullWidth multiline rows={3} />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditTarget(null)}>취소</Button>
                    <Button onClick={handleEditSave} variant="contained" disabled={isSaving}>저장</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
