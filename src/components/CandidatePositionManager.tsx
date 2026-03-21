'use client';

import { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, deleteDoc, updateDoc, setDoc, where, writeBatch, getDoc, deleteField } from 'firebase/firestore';
import { db } from '@/lib/firebase';
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
    Chip,
    Tabs,
    Tab
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import RefreshIcon from '@mui/icons-material/Refresh';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import * as XLSX from 'xlsx';
import ConfirmDialog from './ConfirmDialog';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

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
    const [activeTab, setActiveTab] = useState(0); // 0: 1차, 1: 2차 ...

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

    // Sync newRound with activeTab
    useEffect(() => {
        setNewRound(activeTab + 1);
    }, [activeTab]);

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
            const parsedCandNum = newCandidateNumber.trim() ? parseInt(newCandidateNumber.trim(), 10) : NaN;
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
                photoUrl: '',
                ...(!isNaN(parsedCandNum) && parsedCandNum > 0 ? { candidateNumber: parsedCandNum } : {})
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
            setNewCandidateNumber('');

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

    const handleAutoImportFromPrevRound = async () => {
        if (!activeElectionId) return;
        try {
            // 1. Get Election Config
            const configRef = doc(db, `elections/${activeElectionId}/settings`, 'config');
            const configSnap = await getDoc(configRef);
            const configData = configSnap.exists() ? configSnap.data() : {};
            const maxVotesMap = configData.maxVotes || { '장로': 5, '권사': 5, '안수집사': 5 };
            const maxVotes = typeof maxVotesMap === 'number' ? maxVotesMap : (maxVotesMap[position] || 5);

            // 2. Get Source Round (Previous Round) Data
            const sourceRound = activeTab; // e.g. if we are on tab 2 (3rd round), source is 2nd round
            const targetRound = activeTab + 1;

            const votersRef = collection(db, `elections/${activeElectionId}/voters`);
            const ballotQuery = query(votersRef, where(`participated.${position}_${sourceRound}`, '==', true));
            const ballotSnap = await getDocs(ballotQuery);
            const ballots = ballotSnap.size;

            // 3. Calculate Threshold
            let threshold = 999999;
            if (ballots > 0) {
                if (position === '장로') {
                    threshold = Math.ceil(ballots * (2 / 3));
                } else {
                    threshold = Math.floor(ballots / 2) + 1;
                }
            }

            // 4. Fetch Source Round Candidates
            const q = query(
                collection(db, `elections/${activeElectionId}/candidates`),
                where('position', '==', position),
                where('round', '==', sourceRound)
            );
            const querySnapshot = await getDocs(q);
            const prevCandidates: Candidate[] = [];
            querySnapshot.forEach((docSnap) => {
                prevCandidates.push({ id: docSnap.id, ...docSnap.data() } as Candidate);
            });

            // 5. Filter out elected (피택자 제외) and Sort
            const notElected = prevCandidates.filter(c => {
                const votes = c.votesByRound?.[sourceRound] || 0;
                return !(votes >= threshold && votes > 0);
            });

            notElected.sort((a, b) => (b.votesByRound?.[sourceRound] || 0) - (a.votesByRound?.[sourceRound] || 0));

            // 6. Select Top 1.5x (소수점 올림)
            const targetCount = Math.ceil(maxVotes * 1.5);
            const selectedCandidates = notElected.slice(0, targetCount);

            if (selectedCandidates.length === 0) {
                setMessage({ type: 'warning', text: `불러올 ${sourceRound}차 통과(비피택) 후보가 없거나 투표 기록이 부족합니다.` });
                setAutoImportOpen(false);
                return;
            }

            // 7. Batch Write to Target Round (activeTab + 1)
            const batch = writeBatch(db);

            selectedCandidates.forEach(c => {
                const newRef = doc(collection(db, `elections/${activeElectionId}/candidates`));
                const newCandidate: Candidate = {
                    id: newRef.id,
                    name: c.name,
                    position: c.position,
                    birthdate: c.birthdate || '',
                    district: c.district || '',
                    profileDesc: c.profileDesc || '',
                    volunteerInfo: c.volunteerInfo || '',
                    round: targetRound,
                    voteCount: 0,
                    votesByRound: { ...(c.votesByRound || {}), [targetRound]: 0 },
                    photoUrl: c.photoUrl || ''
                };
                batch.set(newRef, newCandidate);
            });

            await batch.commit();

            await logAdminAction({
                electionId: activeElectionId,
                actionType: 'OTHER',
                description: `'${position}' ${targetRound}차 후보자 ${selectedCandidates.length}명 자동 생성 (${sourceRound}차 기록 기반)`
            });

            setMessage({ type: 'success', text: `'${position}' ${targetRound}차 후보자 ${selectedCandidates.length}명이 ${sourceRound}차 결과를 토대로 성공적으로 자동 생성되었습니다.` });
            fetchCandidates();
        } catch (err) {
            console.error("Error auto-importing candidates:", err);
            setMessage({ type: 'error', text: '후보자 자동 생성 중 오류가 발생했습니다.' });
        } finally {
            setAutoImportOpen(false);
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

    const handleDeleteAllCandidates = async () => {
        if (!activeElectionId) return;
        setLoading(true);
        try {
            const targetRound = activeTab + 1;
            const q = query(
                collection(db, `elections/${activeElectionId}/candidates`),
                where('position', '==', position),
                where('round', '==', targetRound)
            );
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                setMessage({ type: 'warning', text: '삭제할 후보가 없습니다.' });
                setDeleteAllConfirmOpen(false);
                return;
            }

            const batch = writeBatch(db);
            snapshot.forEach(docSnap => {
                batch.delete(docSnap.ref);
            });

            await batch.commit();

            await logAdminAction({
                adminId: 'system',
                electionId: activeElectionId,
                actionType: 'DELETE_CANDIDATE',
                description: `'${position}' ${targetRound}차 후보자 전체 삭제 (${snapshot.size}명)`
            });

            setMessage({ type: 'success', text: `'${position}' ${targetRound}차 후보자 전체가 삭제되었습니다.` });
            fetchCandidates();
        } catch (err) {
            console.error("Error deleting all candidates:", err);
            setMessage({ type: 'error', text: '전체 삭제 중 오류가 발생했습니다.' });
        } finally {
            setLoading(false);
            setDeleteAllConfirmOpen(false);
        }
    };


    const handleEditClick = (candidate: Candidate) => {
        setEditTarget(candidate);
        setEditName(candidate.name);
        setEditBirthdate(candidate.birthdate || '');
        setEditDistrict(candidate.district || '');
        setEditProfile(candidate.profileDesc || '');
        setEditVolunteer(candidate.volunteerInfo || '');
        setEditRound(candidate.round || activeTab + 1);
        setEditCandidateNumber(candidate.candidateNumber !== undefined ? String(candidate.candidateNumber) : '');
    };

    const handleEditSave = async () => {
        if (!activeElectionId || !editTarget || !editTarget.id) return;
        if (!editName.trim()) {
            setMessage({ type: 'error', text: '이름을 입력해주세요.' });
            return;
        }

        setIsSaving(true);
        try {
            const candidateRef = doc(db, `elections/${activeElectionId}/candidates`, editTarget.id);
            const parsedCandNum = editCandidateNumber.trim() ? parseInt(editCandidateNumber.trim(), 10) : NaN;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const updatedData: Record<string, any> = {
                name: editName.trim(),
                birthdate: editBirthdate.trim(),
                district: editDistrict.trim(),
                profileDesc: editProfile.trim(),
                volunteerInfo: editVolunteer.trim(),
                round: editRound,
                candidateNumber: (!isNaN(parsedCandNum) && parsedCandNum > 0)
                    ? parsedCandNum
                    : deleteField(),
            };

            await updateDoc(candidateRef, updatedData);
            await logAdminAction({
                electionId: activeElectionId,
                actionType: 'OTHER',
                description: `'${editName}' (${position}) 후보 정보 수정`
            });

            setMessage({ type: 'success', text: `'${editName}' 후보 정보가 수정되었습니다.` });
            setEditTarget(null);
            fetchCandidates();
        } catch (err) {
            console.error("Error updating candidate:", err);
            setMessage({ type: 'error', text: '후보자 수정 중 오류가 발생했습니다.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDownloadExcel = async () => {
        if (!activeElectionId) return;
        setLoading(true);
        try {
            // Prepare data - all candidates for this position
            const data = candidates.map(c => ({
                '이름': c.name,
                '생년월일': c.birthdate || '',
                '교구/구역': c.district || '',
                '투표차수': `${c.round}차`,
                '봉사이력': c.profileDesc || '',
                '추가정보': c.volunteerInfo || ''
            }));

            // Create worksheet
            const ws = XLSX.utils.json_to_sheet(data);

            // Force "생년월일" column (index 1) to be text
            const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
            for (let R = range.s.r + 1; R <= range.e.r; ++R) {
                const cellRef = XLSX.utils.encode_cell({ r: R, c: 1 }); // Column B
                if (ws[cellRef]) {
                    ws[cellRef].t = 's';
                    ws[cellRef].z = '@';
                }
            }

            // Create workbook and append sheet
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "후보자명부");

            // Generate filename
            const dateStr = new Date().toISOString().split('T')[0];
            const filename = `${position}_후보자명부_${dateStr}.xlsx`;

            // Write and download
            XLSX.writeFile(wb, filename);

            await logAdminAction({
                electionId: activeElectionId,
                actionType: 'OTHER',
                description: `'${position}' 후보자명부 엑셀 다운로드 (${candidates.length}명)`
            });

            setMessage({ type: 'success', text: `${position} 후보자명부 엑셀 파일이 생성되었습니다.` });
        } catch (err) {
            console.error("Error exporting excel:", err);
            setMessage({ type: 'error', text: '엑셀 다운로드 중 오류가 발생했습니다.' });
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const filteredCandidates = candidates.filter(c =>
        (c.round === (activeTab + 1)) &&
        (c.name.includes(searchTerm) || c.district?.includes(searchTerm))
    );

    const getRoundCount = (r: number) => candidates.filter(c => c.round === r).length;

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
                                <TextField label="기호 번호 (선택)" type="number" value={newCandidateNumber} onChange={e => setNewCandidateNumber(e.target.value)} size="small" fullWidth placeholder="예: 1" inputProps={{ min: 1 }} />
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
                    <Paper sx={{ mb: 2 }}>
                        <Tabs
                            value={activeTab}
                            onChange={handleTabChange}
                            variant="fullWidth"
                            indicatorColor="primary"
                            textColor="primary"
                        >
                            {[1, 2, 3, 4, 5].map(r => (
                                <Tab
                                    key={r}
                                    label={`${r}차`}
                                    icon={<Chip label={getRoundCount(r)} size="small" variant="outlined" sx={{ pointerEvents: 'none' }} />}
                                    iconPosition="end"
                                    sx={{ minHeight: 64 }}
                                />
                            ))}
                        </Tabs>
                    </Paper>

                    <Paper sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" fontWeight="bold">
                                {position} {activeTab + 1}차 후보자 목록 ({filteredCandidates.length}명)
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <TextField
                                    label="검색 (이름, 교구)"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    size="small"
                                    sx={{ width: 200 }}
                                />
                                {activeTab > 0 && filteredCandidates.length === 0 && (
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        startIcon={<PersonAddIcon />}
                                        onClick={() => setAutoImportOpen(true)}
                                        disabled={loading}
                                        size="small"
                                    >
                                        {activeTab}차 결과 기준 자동 생성
                                    </Button>
                                )}
                                {activeTab > 0 && filteredCandidates.length > 0 && (
                                    <Button
                                        variant="contained"
                                        color="error"
                                        startIcon={<DeleteIcon />}
                                        onClick={() => setDeleteAllConfirmOpen(true)}
                                        disabled={loading}
                                        size="small"
                                    >
                                        현재 차수 후보 전체 삭제
                                    </Button>
                                )}
                                <Button
                                    variant="outlined"
                                    color="success"
                                    startIcon={<FileDownloadIcon />}
                                    onClick={handleDownloadExcel}
                                    disabled={loading || candidates.length === 0}
                                    size="small"
                                >
                                    엑셀 다운로드
                                </Button>
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
                                                    </Box>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Typography fontWeight="bold">{c.name}</Typography>
                                                            <Typography variant="body2" color="text.secondary">({calculateAge(c.birthdate, c.age)}세)</Typography>
                                                            <Chip label={`${c.round}차`} size="small" variant="outlined" />
                                                            {c.candidateNumber !== undefined && (
                                                                <Chip label={`기호 ${c.candidateNumber}번`} size="small" color="primary" />
                                                            )}
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
                                                    <IconButton edge="end" color="primary" onClick={() => handleEditClick(c)} sx={{ mr: 1 }}>
                                                        <EditIcon />
                                                    </IconButton>
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

            <ConfirmDialog
                open={autoImportOpen}
                title={`${position} ${activeTab + 1}차 후보 자동 생성`}
                description={`${activeTab}차 투표 결과 기록을 기반으로 피택자를 제외한 미피택자 중 득표수 상위 1.5배수(소수점 올림) 인원을 다음 차수 후보로 자동 복사합니다. 진행하시겠습니까?`}
                onConfirm={handleAutoImportFromPrevRound}
                onCancel={() => setAutoImportOpen(false)}
            />

            <ConfirmDialog
                open={deleteAllConfirmOpen}
                title={`${position} ${activeTab + 1}차 후보 전체 삭제`}
                description={`정말 '${position}'의 ${activeTab + 1}차 후보자를 모두 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
                onConfirm={handleDeleteAllCandidates}
                onCancel={() => setDeleteAllConfirmOpen(false)}
                requireReAuth
            />

            {/* 개별 수정 다이얼로그 */}
            <Dialog open={!!editTarget} onClose={() => setEditTarget(null)} fullWidth maxWidth="sm">
                <DialogTitle>후보자 정보 수정 ({editTarget?.position})</DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        <TextField label="이름" value={editName} onChange={e => setEditName(e.target.value)} size="small" fullWidth required />
                        <TextField label="생년월일 (6자리)" value={editBirthdate} onChange={e => setEditBirthdate(e.target.value)} size="small" fullWidth />
                        <TextField label="교구/구역" value={editDistrict} onChange={e => setEditDistrict(e.target.value)} size="small" fullWidth />
                        <TextField label="투표 차수" type="number" value={editRound} onChange={e => setEditRound(Number(e.target.value))} size="small" fullWidth />
                        <TextField label="기호 번호 (선택, 비워두면 삭제)" type="number" value={editCandidateNumber} onChange={e => setEditCandidateNumber(e.target.value)} size="small" fullWidth placeholder="예: 1" inputProps={{ min: 1 }} />
                        <TextField label="봉사 이력" value={editProfile} onChange={e => setEditProfile(e.target.value)} size="small" fullWidth multiline rows={3} />
                        <TextField label="추가 정보" value={editVolunteer} onChange={e => setEditVolunteer(e.target.value)} size="small" fullWidth multiline rows={2} />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditTarget(null)} color="inherit">취소</Button>
                    <Button onClick={handleEditSave} variant="contained" color="primary" startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />} disabled={isSaving}>
                        저장
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
