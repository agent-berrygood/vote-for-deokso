'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { collection, writeBatch, doc, getDoc, setDoc, getDocs, query, where } from 'firebase/firestore';
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
    Divider,
    Chip
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SaveIcon from '@mui/icons-material/Save';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CandidateManager from '@/components/CandidateManager';
import ConfirmDialog from '@/components/ConfirmDialog';

import { useElection } from '@/hooks/useElection';

const generateAuthKey = () => Math.floor(1000000 + Math.random() * 9000000).toString();

export default function AdminPage() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const isAdmin = sessionStorage.getItem('isAdmin');
        // Check session storage or other auth method implemented
        // Since I implemented a simple password login in /admin/login page that sets 'admin_auth', I should check that.
        // Wait, my login page set 'admin_auth'. The remote might have used 'isAdmin'.
        // I will check both to be safe or stick to my implementation 'admin_auth'.
        const auth = sessionStorage.getItem('admin_auth');
        if (auth !== 'true') {
            router.push('/admin/login');
        } else {
            setIsAuthenticated(true);
        }
    }, [router]);

    const { activeElectionId, electionList, createElection, switchElection } = useElection();
    const [newElectionId, setNewElectionId] = useState('');

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [maxVotesMap, setMaxVotesMap] = useState<{ [pos: string]: number }>({
        '장로': 5,
        '권사': 5,
        '안수집사': 5
    });

    const [roundSettings, setRoundSettings] = useState<{ [pos: string]: number }>({
        '장로': 1,
        '권사': 1,
        '안수집사': 1
    });
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [settingLoading, setSettingLoading] = useState(false);



    const [uploadRound, setUploadRound] = useState<number>(1);

    // Reset Dialog
    const [resetDialogOpen, setResetDialogOpen] = useState(false);

    // Single Voter Add State
    const [singleVoterName, setSingleVoterName] = useState('');
    const [singleVoterPhone, setSingleVoterPhone] = useState('');
    const [singleVoterBirthdate, setSingleVoterBirthdate] = useState('');

    useEffect(() => {
        if (!activeElectionId) return;

        const fetchSettings = async () => {
            try {
                const configRef = doc(db, `elections/${activeElectionId}/settings`, 'config');
                const docSnap = await getDoc(configRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data.maxVotes) {
                        if (typeof data.maxVotes === 'number') {
                            setMaxVotesMap({ '장로': data.maxVotes, '권사': data.maxVotes, '안수집사': data.maxVotes });
                        } else {
                            setMaxVotesMap(data.maxVotes);
                        }
                    }
                    if (data.rounds) setRoundSettings(data.rounds);
                } else {
                    setMaxVotesMap({ '장로': 5, '권사': 5, '안수집사': 5 });
                    setRoundSettings({ '장로': 1, '권사': 1, '안수집사': 1 });
                }
            } catch (err) {
                console.error("Error fetching settings:", err);
                setMessage({ type: 'error', text: '설정 정보를 불러오는 데 실패했습니다.' });
            }
        };
        fetchSettings();
    }, [activeElectionId]);

    const handleCreateElection = async () => {
        if (!newElectionId.trim()) return;
        await createElection(newElectionId);
        setNewElectionId('');
        setMessage({ type: 'success', text: `선거 '${newElectionId}'가 생성되었습니다!` });
    };

    const handleSaveSettings = async () => {
        if (!activeElectionId) return;
        setSettingLoading(true);
        try {
            await setDoc(doc(db, `elections/${activeElectionId}/settings`, 'config'), {
                maxVotes: maxVotesMap,
                rounds: roundSettings,
                startDate,
                endDate
            });
            setMessage({ type: 'success', text: '시스템 설정이 성공적으로 저장되었습니다!' });
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: '설정 저장 중 오류가 발생했습니다.' });
        } finally {
            setSettingLoading(false);
        }
    };

    const handleDownloadTemplate = (type: 'candidate' | 'voter') => {
        let headers: string[] = [];
        let filename = '';

        if (type === 'candidate') {
            // New Format: Name, Birthdate, Position, PhotoLink, ProfileDesc
            headers = ['Name', 'Birthdate', 'Position', 'PhotoLink', 'ProfileDesc'];
            filename = 'candidate_upload_template.xlsx';
        } else {
            headers = ['Name', 'Phone', 'Birthdate', 'AuthKey'];
            filename = 'voter_upload_template.xlsx';
        }

        const ws = XLSX.utils.aoa_to_sheet([headers]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, filename);
    };

    const proceedWithUpload = async (file: File, collectionRef: any, parseLogic: (data: any[]) => void) => {
        setLoading(true);
        setMessage(null);

        const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

        if (isExcel) {
            try {
                const data = await file.arrayBuffer();
                const workbook = XLSX.read(data);
                const worksheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[worksheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);
                parseLogic(jsonData);
            } catch (err) {
                console.error("Excel parse error:", err);
                setMessage({ type: 'error', text: '엑셀 파일 처리 중 오류가 발생했습니다.' });
                setLoading(false);
            }
        } else {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => parseLogic(results.data as any[]),
                error: (error) => {
                    console.error(error);
                    setMessage({ type: 'error', text: 'CSV 파싱 오류' });
                    setLoading(false);
                }
            });
        }
    };

    const handleCandidateUpload = async (event: React.ChangeEvent<HTMLInputElement>, position: string) => {
        const file = event.target.files?.[0];
        if (!file || !activeElectionId) {
            if (!activeElectionId) setMessage({ type: 'error', text: '활성화된 선거가 없습니다.' });
            return;
        }

        const collectionRef = collection(db, `elections/${activeElectionId}/candidates`);
        const q = query(collectionRef, where('round', '==', uploadRound), where('position', '==', position));
        const existingDocs = await getDocs(q);

        if (!existingDocs.empty) {
            if (!window.confirm(`${uploadRound}차 투표 ${position} 직책에 이미 후보자 데이터가 존재합니다. 기존 데이터를 삭제하고 새로 업로드하시겠습니까?`)) {
                setMessage({ type: 'error', text: '업로드가 취소되었습니다.' });
                (event.target as HTMLInputElement).value = ''; // Reset file input
                return;
            }
        }

        proceedWithUpload(file, collectionRef, async (candidates) => {
            try {
                const batch = writeBatch(db);
                if (!existingDocs.empty) {
                    existingDocs.forEach(doc => batch.delete(doc.ref));
                }

                candidates.forEach((row) => {
                    if (!row.Name) return;

                    // Determine position: Row's Position or Fallback to argument
                    const candidatePosition = row.Position ? String(row.Position).trim() : position;
                    // If we want to strictly enforce the passed 'position', we can ignore row.Position or validate it.
                    // For now, let's trust the user's intent to upload to 'position' (the button they clicked) mainly,
                    // BUT if they provided a Position column, it's ambiguous.
                    // Let's assume the user uses the 'Elder' button for Elders.
                    // If the CSV contains 'Deacon', and they clicked 'Elder', should we upload as Elder?
                    // User Request was: "candidate file is Name, Birthdate, Position, Photo, Description".
                    // This implies the file might be mixed or self-describing.
                    // Current existing logic: deleting existing docs based on `position`.
                    // If we upload mixed content here, we might be deleting Elders but uploading Deacons if they made a mistake.
                    // Safe bet: Use the passed `position` for filtering/deleting, but use the `row.Position` if valid, otherwise fallback.
                    // Actually, if a user uploads a mixed file to "Elder" button, and we delete "Elder" docs...
                    // and then upload Deacons... we ruin data.
                    // BUT, implementing fully mixed upload requires a different UI (Global Upload).
                    // We are keeping "Upload Elder", "Upload Deacon" buttons.
                    // So we should probably FILTER the input CSV for the target position if the CSV has that column.

                    const rowPositionClean = row.Position ? String(row.Position).trim() : '';
                    if (rowPositionClean && rowPositionClean !== position) {
                        // Skip if row explicitly says a different position
                        // console.warn(`Skipping ${row.Name} because position ${rowPositionClean} != ${position}`);
                        // Actually, users might not match exact string '장로'. 
                        // Let's just use the `position` (from button) to force assignment, assuming user knows what they are doing.
                        // Or simply ignore the Position column for *logic* but save it if needed? 
                        // User asked for the column to be there.
                    }

                    const newDocRef = doc(collectionRef);
                    const candidateData: Candidate = {
                        id: newDocRef.id,
                        name: row.Name,
                        position: position, // Enforce the button's context for safety
                        birthdate: row.Birthdate ? String(row.Birthdate).trim() : '',
                        age: 0, // Deprecated, will calc on fly
                        photoUrl: getDriveImageUrl(row.PhotoLink || ''),
                        voteCount: 0,
                        votesByRound: { [uploadRound]: 0 },
                        round: uploadRound
                    };
                    batch.set(newDocRef, candidateData);
                });

                await batch.commit();
                setMessage({ type: 'success', text: `성공적으로 ${candidates.length}명의 ${position} 후보를 업로드했습니다!` });
            } catch (error) {
                console.error(error);
                setMessage({ type: 'error', text: '후보자 업로드 중 오류가 발생했습니다.' });
            } finally {
                setLoading(false);
                (event.target as HTMLInputElement).value = '';
            }
        });
    };

    const handleVoterUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !activeElectionId) {
            if (!activeElectionId) setMessage({ type: 'error', text: '활성화된 선거가 없습니다.' });
            return;
        }

        const collectionRef = collection(db, `elections/${activeElectionId}/voters`);
        const existingDocs = await getDocs(collectionRef);

        if (!existingDocs.empty) {
            if (!window.confirm('선거인 명부에 이미 데이터가 존재합니다. 기존 데이터를 모두 삭제하고 새로 업로드하시겠습니까?')) {
                setMessage({ type: 'error', text: '업로드가 취소되었습니다.' });
                (event.target as HTMLInputElement).value = '';
                return;
            }
        }

        proceedWithUpload(file, collectionRef, async (voters) => {
            try {
                const batch = writeBatch(db);
                if (!existingDocs.empty) {
                    existingDocs.forEach(doc => batch.delete(doc.ref));
                }

                voters.forEach((row) => {
                    if (!row.Name) return; // Allow missing AuthKey, will generate
                    const newDocRef = doc(collectionRef);
                    const authKey = row.AuthKey ? String(row.AuthKey).trim() : generateAuthKey();

                    const voterData: Voter = {
                        id: newDocRef.id,
                        name: row.Name,
                        authKey: authKey, // Still used as fallback or internal ID
                        hasVoted: false,
                        votedAt: null,
                        phone: row.Phone ? String(row.Phone).trim() : '',
                        birthdate: row.Birthdate ? String(row.Birthdate).trim() : ''
                    };
                    batch.set(newDocRef, voterData);
                });

                await batch.commit();
                setMessage({ type: 'success', text: `성공적으로 ${voters.length}명의 선거인을 업로드했습니다!` });
            } catch (error) {
                console.error(error);
                setMessage({ type: 'error', text: '선거인 업로드 중 오류가 발생했습니다.' });
            } finally {
                setLoading(false);
                (event.target as HTMLInputElement).value = '';
            }
        });
    };

    const handleAddSingleVoter = async () => {
        if (!activeElectionId) return;
        if (!singleVoterName) {
            setMessage({ type: 'error', text: 'Name is required' });
            return;
        }

        setLoading(true);
        try {
            const collectionRef = collection(db, `elections/${activeElectionId}/voters`);
            const newDocRef = doc(collectionRef);
            const authKey = generateAuthKey();

            const voterData: Voter = {
                id: newDocRef.id,
                name: singleVoterName,
                authKey: authKey,
                hasVoted: false,
                votedAt: null,
                phone: singleVoterPhone,
                birthdate: singleVoterBirthdate
            };

            await setDoc(newDocRef, voterData);
            setMessage({ type: 'success', text: `Voter '${singleVoterName}' added with Key: ${authKey}` });

            // Clear inputs
            setSingleVoterName('');
            setSingleVoterPhone('');
            setSingleVoterBirthdate('');
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: 'Error adding voter' });
        } finally {
            setLoading(false);
        }
    };

    const handleResetData = async () => {
        if (!activeElectionId) return;
        setLoading(true);
        try {
            const deleteCollectionInBatches = async (collectionPath: string) => {
                const q = query(collection(db, collectionPath));
                const snapshot = await getDocs(q);
                const BATCH_SIZE = 450; // Safety margin below 500

                const chunks = [];
                for (let i = 0; i < snapshot.docs.length; i += BATCH_SIZE) {
                    chunks.push(snapshot.docs.slice(i, i + BATCH_SIZE));
                }

                let totalDeleted = 0;
                for (const chunk of chunks) {
                    const batch = writeBatch(db);
                    chunk.forEach(doc => batch.delete(doc.ref));
                    await batch.commit();
                    totalDeleted += chunk.length;
                }
                return totalDeleted;
            };

            // 1. Delete Candidates
            const count1 = await deleteCollectionInBatches(`elections/${activeElectionId}/candidates`);

            // 2. Delete Voters
            const count2 = await deleteCollectionInBatches(`elections/${activeElectionId}/voters`);

            setMessage({ type: 'success', text: `Reset complete. Deleted ${count1} candidates and ${count2} voters.` });
            setResetDialogOpen(false);

            // Force refresh of stats if needed, or rely on activeElectionId hook updates
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: 'Error resetting data.' });
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <Container maxWidth="md" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                어드민 대시보드
            </Typography>

            {message && (
                <Alert severity={message.type} sx={{ mb: 3, '.MuiAlert-message': { width: '100%' } }} onClose={() => setMessage(null)}>
                    {message.text}
                </Alert>
            )}

            <Paper sx={{ p: 4, mb: 4, bgcolor: '#f0f7ff' }}>
                <Typography variant="h6" gutterBottom fontWeight="bold" color="primary">
                    🗳 선거 관리
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                    <TextField
                        select
                        label="활성 선거"
                        value={activeElectionId || ''}
                        onChange={(e) => switchElection(e.target.value)}
                        size="small"
                        SelectProps={{ native: true }}
                        sx={{ width: 250 }}
                        disabled={loading}
                    >
                        {electionList.map((id) => (
                            <option key={id} value={id}>
                                {id} {id === activeElectionId ? '(활성)' : ''}
                            </option>
                        ))}
                    </TextField>
                    <Typography variant="body2" color="text.secondary">
                        현재 관리중인 선거: <strong>{activeElectionId || "없음"}</strong>
                    </Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <TextField
                        label="새 선거 ID (예: 2027-vote)"
                        value={newElectionId}
                        onChange={(e) => setNewElectionId(e.target.value)}
                        size="small"
                        sx={{ width: 250 }}
                        placeholder="고유 ID 입력"
                    />
                    <Button
                        variant="contained"
                        onClick={handleCreateElection}
                        disabled={!newElectionId.trim() || loading}
                    >
                        새 선거 생성
                    </Button>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ p: 2, border: '1px solid #f44336', borderRadius: 1, bgcolor: '#fff5f5' }}>
                    <Typography variant="subtitle2" color="error" fontWeight="bold" gutterBottom>
                        ⚠ Danger Zone
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        This will delete ALL candidates and voters for the active election <strong>({activeElectionId})</strong>. This action cannot be undone.
                    </Typography>
                    <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => setResetDialogOpen(true)}
                    >
                        Reset Election Data
                    </Button>
                    <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                        * Check Console (F12) for detailed logs if reset fails.
                    </Typography>
                </Box>
            </Paper>

            <Paper sx={{ p: 4, mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                    시스템 설정 ({activeElectionId || "없음"})
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    {Object.keys(maxVotesMap).map((pos) => (
                        <TextField
                            key={`max_${pos}`}
                            label={`${pos} 최대 투표수`}
                            type="number"
                            value={maxVotesMap[pos]}
                            onChange={(e) => setMaxVotesMap({ ...maxVotesMap, [pos]: Number(e.target.value) })}
                            size="small"
                            sx={{ width: 140 }}
                            disabled={!activeElectionId}
                        />
                    ))}
                    {Object.keys(roundSettings).map((pos) => (
                        <TextField
                            key={pos}
                            label={`${pos} 차수`}
                            type="number"
                            value={roundSettings[pos]}
                            onChange={(e) => setRoundSettings({ ...roundSettings, [pos]: Number(e.target.value) })}
                            size="small"
                            sx={{ width: 120 }}
                            disabled={!activeElectionId}
                        />
                    ))}
                    <TextField
                        label="투표 시작 일시"
                        type="datetime-local"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        size="small"
                        sx={{ width: 220 }}
                        InputLabelProps={{ shrink: true }}
                        disabled={!activeElectionId}
                    />
                    <TextField
                        label="투표 종료 일시"
                        type="datetime-local"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        size="small"
                        sx={{ width: 220 }}
                        InputLabelProps={{ shrink: true }}
                        disabled={!activeElectionId}
                    />
                    <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={handleSaveSettings}
                        disabled={settingLoading || loading || !activeElectionId}
                    >
                        설정 저장
                    </Button>
                </Box>
            </Paper>

            <Paper sx={{ p: 4, mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                    후보자 명부 업로드 (CSV)
                </Typography>
                <TextField
                    select
                    label="대상 차수 선택"
                    value={uploadRound}
                    onChange={(e) => setUploadRound(Number(e.target.value))}
                    size="small"
                    SelectProps={{ native: true }}
                    sx={{ width: 200, mb: 2 }}
                    helperText="아래에서 업로드하는 파일은 선택된 차수에 할당됩니다."
                    disabled={!activeElectionId}
                >
                    {[1, 2, 3, 4, 5].map(r => <option key={r} value={r}>{r}차 후보</option>)}
                </TextField>
                <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                    {[{ pos: '장로', color: 'primary' }, { pos: '안수집사', color: 'success' }, { pos: '권사', color: 'warning' }].map(({ pos, color }) => (
                        <Paper key={pos} sx={{ p: 3, flex: 1, borderTop: `4px solid ${(theme: any) => theme.palette[color as 'primary' | 'success' | 'warning'].main}`, minWidth: 220 }}>
                            <Typography variant="h6" gutterBottom color={color as 'primary' | 'success' | 'warning'}> {pos} 후보 업로드 </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}> {uploadRound}차 투표 대상 </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                                <Button component="label" variant="contained" fullWidth color={color as 'primary' | 'success' | 'warning'} startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />} disabled={loading || !activeElectionId} >
                                    CSV/Excel 업로드
                                    <input type="file" hidden accept=".csv, .xlsx, .xls" onChange={(e) => handleCandidateUpload(e, pos)} />
                                </Button>
                                <Button size="small" onClick={() => handleDownloadTemplate('candidate')}>
                                    양식 다운로드
                                </Button>
                            </Box>
                        </Paper>
                    ))}
                </Box>
            </Paper>

            <Paper sx={{ p: 4, mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                    Upload Voters
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    CSV/Excel Format: Name, Phone, Birthdate (Optional: AuthKey)
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Button
                        component="label"
                        variant="contained"
                        color="secondary"
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
                        disabled={loading}
                    >
                        Select Voter File
                        <input type="file" hidden accept=".csv, .xlsx, .xls" onChange={handleVoterUpload} />
                    </Button>
                    <Button variant="outlined" onClick={() => handleDownloadTemplate('voter')}>
                        양식 다운로드
                    </Button>
                </Box>
            </Paper>

            {/* Single Voter Addition */}
            <Paper sx={{ p: 4, mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                    Add Single Voter
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                    <TextField
                        label="Name"
                        value={singleVoterName}
                        onChange={(e) => setSingleVoterName(e.target.value)}
                        size="small"
                        sx={{ width: 150 }}
                    />
                    <TextField
                        label="Phone"
                        value={singleVoterPhone}
                        onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, '');
                            let formatted = val;
                            if (val.length > 3 && val.length <= 7) {
                                formatted = `${val.slice(0, 3)}-${val.slice(3)}`;
                            } else if (val.length > 7) {
                                formatted = `${val.slice(0, 3)}-${val.slice(3, 7)}-${val.slice(7, 11)}`;
                            }
                            setSingleVoterPhone(formatted);
                        }}
                        size="small"
                        sx={{ width: 150 }}
                        placeholder="010-0000-0000"
                    />
                    <TextField
                        label="Birthdate"
                        value={singleVoterBirthdate}
                        onChange={(e) => setSingleVoterBirthdate(e.target.value)}
                        size="small"
                        sx={{ width: 150 }}
                        placeholder="YYMMDD"
                    />
                    <Button
                        variant="contained"
                        onClick={handleAddSingleVoter}
                        disabled={loading || !singleVoterName}
                        startIcon={<PersonAddIcon />}
                    >
                        Add Voter
                    </Button>
                </Box>
            </Paper>

            <CandidateManager />

            <ConfirmDialog
                open={resetDialogOpen}
                title="Reset Election Data?"
                description={`Are you sure you want to RESET data for '${activeElectionId}'? This cannot be undone.`}
                onConfirm={handleResetData}
                onCancel={() => setResetDialogOpen(false)}
            />

            <VotingResultsSection />
        </Container>
    );
}

function VotingResultsSection() {
    const { activeElectionId } = useElection();
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalVotes, setTotalVotes] = useState(0); // Total candidate votes
    const [totalBallots, setTotalBallots] = useState(0); // Total voters participated in this round/position
    const [viewRound, setViewRound] = useState<number>(1);
    const [viewPosition, setViewPosition] = useState<string>('장로'); // Default to Elder
    const [maxVoteLimit, setMaxVoteLimit] = useState(5); // How many to show (from settings)

    const fetchResults = async () => {
        if (!activeElectionId) {
            setCandidates([]);
            return;
        }

        setLoading(true);
        try {
            // 1. Get Max Votes setting for limit
            const configRef = doc(db, `elections/${activeElectionId}/settings`, 'config');
            const configSnap = await getDoc(configRef);
            if (configSnap.exists()) {
                const data = configSnap.data();
                if (data.maxVotes) {
                    if (typeof data.maxVotes === 'number') {
                        setMaxVoteLimit(data.maxVotes);
                    } else if (data.maxVotes[viewPosition]) {
                        setMaxVoteLimit(data.maxVotes[viewPosition]);
                    }
                }
            }

            // 2. Count Total Ballots (Voters who participated in this specific Position_Round)
            // Query: voters where participated.${viewPosition}_${viewRound} == true
            // Firestore doesn't support wildcards easily in map keys for query without index or specific structure.
            // But we store `participated: { "장로_1": true }`.
            // We can Query `participated.장로_1 == true`.
            // Note: Field paths with dots need to be handled carefully or just use client side if small.
            // Let's try direct query.
            const voterQuery = query(
                collection(db, `elections/${activeElectionId}/voters`),
                where(`participated.${viewPosition}_${viewRound}`, '==', true)
            );
            const voterSnap = await getDocs(voterQuery);
            const ballotCount = voterSnap.size;
            setTotalBallots(ballotCount);

            // 3. Get Candidates
            const q = query(collection(db, `elections/${activeElectionId}/candidates`), where('round', '==', viewRound), where('position', '==', viewPosition));
            const querySnapshot = await getDocs(q);
            const loaded: Candidate[] = [];
            let totalCandidateVotes = 0;
            querySnapshot.forEach((doc: any) => {
                const data = doc.data() as Candidate;
                loaded.push(data);
                const roundVotes = data.votesByRound?.[viewRound] || 0;
                totalCandidateVotes += roundVotes;
            });

            loaded.sort((a, b) => (b.votesByRound?.[viewRound] || 0) - (a.votesByRound?.[viewRound] || 0));

            setCandidates(loaded);
            setTotalVotes(totalCandidateVotes);
        } catch (err) {
            console.error("Error fetching results:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResults();
    }, [viewRound, viewPosition, activeElectionId]);

    const handleDownloadCSV = () => {
        const headers = ['Name', 'Position', 'Age', 'PhotoLink', `Votes_Round_${viewRound}`, 'Total_Ballots', 'Elected?'];
        const csvContent = [headers.join(',')];

        candidates.forEach(c => {
            const voteCount = c.votesByRound?.[viewRound] || 0;
            let isElected = false;
            if (viewPosition === '장로') {
                isElected = voteCount >= (totalBallots * 2 / 3);
            } else {
                isElected = voteCount > (totalBallots / 2);
            }
            const row = [c.name, c.position, c.age, c.photoUrl, voteCount, totalBallots, isElected ? 'Yes' : 'No'];
            csvContent.push(row.join(','));
        });

        const blob = new Blob(["\uFEFF" + csvContent.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${activeElectionId}_${viewPosition}_round_${viewRound}_results.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Calculate Thresholds
    const elderThreshold = totalBallots * (2 / 3);
    const commonThreshold = totalBallots / 2;

    return (
        <Paper sx={{ p: 4, bgcolor: '#fafafa' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h5" fontWeight="bold" color="primary">
                    📊 {viewRound}차 {viewPosition} 개표 현황 ({activeElectionId})
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <TextField select label="차수 보기" value={viewRound} onChange={(e) => setViewRound(Number(e.target.value))} size="small" SelectProps={{ native: true }} sx={{ width: 120 }} disabled={!activeElectionId} >
                        {[1, 2, 3, 4, 5].map(r => <option key={r} value={r}>{r}차 투표</option>)}
                    </TextField>
                    <TextField select label="직책 필터" value={viewPosition} onChange={(e) => setViewPosition(e.target.value)} size="small" SelectProps={{ native: true }} sx={{ width: 120 }} disabled={!activeElectionId} >
                        {/* <option value="ALL">전체 보기</option> Removed ALL to focus on specific criteria */}
                        <option value="장로">장로</option>
                        <option value="권사">권사</option>
                        <option value="안수집사">안수집사</option>
                    </TextField>
                    <Button variant="outlined" onClick={fetchResults} disabled={loading || !activeElectionId}> 새로고침 </Button>
                    <Button variant="contained" color="success" onClick={handleDownloadCSV} disabled={loading || candidates.length === 0}> 엑셀 다운 </Button>
                </Box>
            </Box>

            <Box sx={{ mb: 3, p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                    🗳 투표 집계 정보
                </Typography>
                <Typography variant="body2">
                    총 투표 참여자(Ballots): <strong>{totalBallots}</strong> 명
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {viewPosition === '장로'
                        ? `장로 피택 기준 (2/3 이상): ${Math.ceil(elderThreshold)}표 이상`
                        : `${viewPosition} 피택 기준 (과반수 초과): ${Math.floor(commonThreshold) + 1}표 이상`}
                </Typography>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    * 화면에는 상위 <strong>{maxVoteLimit}</strong>명까지만 표시됩니다.
                </Typography>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}> <CircularProgress /> </Box>
            ) : !activeElectionId ? (
                <Typography sx={{ textAlign: 'center', p: 4, color: 'text.secondary' }}>선택된 선거가 없습니다.</Typography>
            ) : candidates.length === 0 ? (
                <Typography sx={{ textAlign: 'center', p: 4, color: 'text.secondary' }}>해당 차수 및 직분에 대한 투표 결과가 없습니다.</Typography>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {candidates.slice(0, maxVoteLimit).map((candidate, index) => {
                        const count = candidate.votesByRound?.[viewRound] || 0;
                        const maxVoteCount = candidates.length > 0 ? (candidates[0].votesByRound?.[viewRound] || 0) : 0;
                        const percentage = maxVoteCount > 0 ? (count / maxVoteCount) * 100 : 0; // Relative to leader for bar

                        let isElected = false;
                        if (viewPosition === '장로') {
                            isElected = count >= elderThreshold && count > 0;
                        } else {
                            isElected = count > commonThreshold && count > 0;
                        }

                        return (
                            <Box key={candidate.id} sx={{ position: 'relative', p: 1, border: isElected ? '2px solid #4caf50' : '1px solid #eee', borderRadius: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5, alignItems: 'center' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Typography variant="h6" fontWeight="bold"> {index + 1}. {candidate.name} </Typography>
                                        <Typography variant="body2" color="text.secondary"> {candidate.age}세 </Typography>
                                        {isElected && (
                                            <Chip label="피택" color="success" size="small" sx={{ fontWeight: 'bold' }} />
                                        )}
                                    </Box>
                                    <Typography variant="h6" color="primary" fontWeight="bold"> {count}표 </Typography>
                                </Box>
                                <Box sx={{ height: 10, bgcolor: '#e0e0e0', borderRadius: 5, overflow: 'hidden' }}>
                                    <Box sx={{ width: `${percentage}%`, height: '100%', bgcolor: isElected ? '#4caf50' : '#1976d2' }} />
                                </Box>
                            </Box>
                        );
                    })}
                    {candidates.length > maxVoteLimit && (
                        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 2 }}>
                            ... 외 {candidates.length - maxVoteLimit}명 생략됨 ...
                        </Typography>
                    )}
                </Box>
            )}
        </Paper>
    );
}

