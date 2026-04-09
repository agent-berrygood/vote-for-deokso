'use client';

import { useState, useEffect } from 'react';
import { listAllCandidates, deleteCandidate, updateCandidate } from '@/lib/dataconnect';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
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
    Alert
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import ConfirmDialog from './ConfirmDialog';

export default function CandidateManager() {
    const { activeElectionId } = useElection();
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteTarget, setDeleteTarget] = useState<Candidate | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning', text: string } | null>(null);

    const [uploadingId, setUploadingId] = useState<string | null>(null);

    const fetchCandidates = async () => {
        if (!activeElectionId) return;
        setLoading(true);
        try {
            const res = await listAllCandidates({ electionId: activeElectionId });
            const allCandidates = res.data.candidates as Candidate[];
            
            // Sort by name (keeping the current UI behavior)
            const sorted = [...allCandidates].sort((a, b) => a.name.localeCompare(b.name));
            setCandidates(sorted);
        } catch (err) {
            console.error("Error fetching SQL candidates:", err);
            setMessage({ type: 'error', text: '후보자 목록을 불러오지 못했습니다.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCandidates();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeElectionId]);

    const handleDelete = async () => {
        if (!activeElectionId || !deleteTarget || !deleteTarget.id) return;

        try {
            // Delete from SQL
            await deleteCandidate({ id: deleteTarget.id });

            // Log action
            await logAdminAction({
                adminId: 'system',
                electionId: activeElectionId,
                actionType: 'DELETE_CANDIDATE',
                description: `'${deleteTarget.name}' 후보 삭제(사퇴) 처리`
            });

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

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, candidate: Candidate) => {
        const file = event.target.files?.[0];
        const candidateId = candidate.id;
        if (!file || !activeElectionId || !candidateId) return;

        setUploadingId(candidateId);
        try {
            // Options for compression
            const options = {
                maxSizeMB: 0.05, // 50KB
                maxWidthOrHeight: 300, // Reasonable size for avatar
                useWebWorker: true,
            };

            const compressedFile = await imageCompression(file, options);

            // Upload to Firebase Storage
            const storageRef = ref(storage, `elections/${activeElectionId}/candidates/${candidateId}/profile.jpg`);
            await uploadBytes(storageRef, compressedFile);
            const downloadURL = await getDownloadURL(storageRef);

            // Update SQL DB
            await updateCandidate({ 
                id: candidateId, 
                name: candidate.name,
                photoUrl: downloadURL 
            });

            // Update local state
            setCandidates(prev => prev.map(c =>
                c.id === candidateId ? { ...c, photoUrl: downloadURL } : c
            ));

            setMessage({ type: 'success', text: '사진이 성공적으로 업로드되었습니다.' });
        } catch (error) {
            console.error("Error uploading image:", error);
            setMessage({ type: 'error', text: '사진 업로드 중 오류가 발생했습니다.' });
        } finally {
            setUploadingId(null);
            // Reset file input
            event.target.value = '';
        }
    };

    const handleBulkImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0 || !activeElectionId) return;

        setLoading(true);
        setMessage(null);

        let successCount = 0;
        let failCount = 0;
        const failedNames: string[] = [];

        try {
            const options = {
                maxSizeMB: 0.05,
                maxWidthOrHeight: 300,
                useWebWorker: true,
            };

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                // Expected format: Name.jpg/png
                const filename = file.name;
                // Remove extension and trim
                const rawName = filename.substring(0, filename.lastIndexOf('.'));
                const name = rawName.normalize('NFC').trim();

                console.log(`[BulkUpload Debug] Processing file: ${filename} -> Parsed Name: '${name}' (Normalized)`);

                if (!name) {
                    failCount++;
                    failedNames.push(`${filename} (No Name)`);
                    continue;
                }

                // Find candidate by Name only (normalized)
                const matchedCandidates = candidates.filter(c => c.name.normalize('NFC').trim() === name);

                if (matchedCandidates.length === 0) {
                    console.warn(`[BulkUpload] No match found for '${name}'. Candidate names available (first 5):`, candidates.slice(0, 5).map(c => c.name));
                    failCount++;
                    failedNames.push(`${filename} (No Match)`);
                    continue;
                }

                try {
                    const compressedFile = await imageCompression(file, options);

                    // Upload for EACH matched candidate (if duplicates exist)
                    // Usually just 1
                        for (const candidate of matchedCandidates) {
                        if (!candidate.id) continue;

                        const storageRef = ref(storage, `elections/${activeElectionId}/candidates/${candidate.id}/profile.jpg`);
                        await uploadBytes(storageRef, compressedFile);
                        const downloadURL = await getDownloadURL(storageRef);

                        await updateCandidate({ 
                            id: candidate.id, 
                            name: candidate.name,
                            photoUrl: downloadURL 
                        });

                        // Update local state immediately
                        setCandidates(prev => prev.map(c =>
                            c.id === candidate.id ? { ...c, photoUrl: downloadURL } : c
                        ));
                    }

                    successCount++;
                } catch (err) {
                    console.error(`Error uploading ${filename}:`, err);
                    failCount++;
                    failedNames.push(`${filename} (Upload Error)`);
                }
            }

            if (failCount > 0) {
                setMessage({
                    type: 'warning',
                    text: `Upload Complete. Success: ${successCount}, Failed: ${failCount}. Failed Files: ${failedNames.join(', ')}`
                });
            } else {
                setMessage({ type: 'success', text: `Successfully uploaded ${successCount} images!` });
            }

        } catch (err) {
            console.error("Bulk upload error:", err);
            setMessage({ type: 'error', text: 'Bulk upload failed.' });
        } finally {
            setLoading(false);
            event.target.value = '';
        }
    };

    const filteredCandidates = candidates.filter(c =>
        c.name.includes(searchTerm) || c.position.includes(searchTerm)
    );

    return (
        <Paper sx={{ p: 4, mb: 4 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
                👤 후보자 관리 (사퇴 처리 및 사진 업로드)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                후보자를 검색하여 목록에서 삭제하거나 사진을 업로드할 수 있습니다.
            </Typography>

            {message && (
                <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage(null)}>
                    {message.text}
                </Alert>
            )}

            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                <TextField
                    label="이름 검색"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="small"
                    sx={{ flexGrow: 1 }}
                    placeholder="홍길동"
                />
                <Button variant="outlined" onClick={fetchCandidates} disabled={loading}>
                    새로고침
                </Button>
                <Button
                    component="label"
                    variant="contained"
                    color="primary"
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
                    disabled={loading}
                >
                    일괄 사진 업로드 (Bulk)
                    <input
                        type="file"
                        hidden
                        multiple
                        accept="image/*"
                        onChange={handleBulkImageUpload}
                    />
                </Button>
            </Box>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                * 일괄 업로드 파일명 형식: <strong>이름.jpg</strong> (예: 홍길동.jpg) - 이름이 일치하는 후보자에게 자동 적용됩니다.
            </Typography>

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
                                        <Avatar
                                            src={candidate.photoUrl || `/images/candidates/${encodeURIComponent(candidate.name)}.jpg`}
                                            alt={candidate.name}
                                            imgProps={{ onError: (e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=No+Image'; } }}
                                        >
                                            {candidate.name[0]}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={`${candidate.name} (${candidate.position})`}
                                        secondary={
                                            <>
                                                <Typography component="span" variant="body2" color="text.primary">
                                                    {calculateAge(candidate.birthdate, candidate.age)}세 | 현재 득표: {candidate.voteCount}
                                                </Typography>
                                                <br />
                                                <Typography component="span" variant="caption" color="text.secondary">
                                                    교구: {candidate.district?.replace(/\//g, '') || "미입력"} | {candidate.profileDesc?.replace(/\\n/g, '\n') || "이력 없음"}
                                                </Typography>
                                                {candidate.volunteerInfo && (
                                                    <Typography component="span" variant="caption" color="primary" sx={{ display: 'block', mt: 0.5, whiteSpace: 'pre-line' }}>
                                                        {candidate.volunteerInfo.replace(/\\n/g, '\n')}
                                                    </Typography>
                                                )}
                                            </>
                                        }
                                    />
                                    <ListItemSecondaryAction sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Button
                                            component="label"
                                            variant="outlined"
                                            size="small"
                                            disabled={uploadingId === candidate.id}
                                            startIcon={uploadingId === candidate.id ? <CircularProgress size={16} /> : <CloudUploadIcon />}
                                        >
                                            사진
                                            <input
                                                type="file"
                                                hidden
                                                accept="image/*"
                                                onChange={(e) => handleImageUpload(e, candidate)}
                                            />
                                        </Button>
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
                description={`'${deleteTarget?.name}' 후보를 정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없으며, 득표 기록도 사라질 수 있습니다. 계속하려면 관리자 비밀번호를 입력하세요.`}
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
                requireReAuth
            />
        </Paper>
    );
}
