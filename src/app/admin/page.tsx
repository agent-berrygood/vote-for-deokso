'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Theme } from '@mui/material/styles';
import {
    getElectionSettings,
    updateElectionSettings,
    createElection as insertElection,
    deleteAllCandidates,
    deleteAllVoters,
    createCandidate,
    createVoter,
    createAdminLog,
    listVoters,
    listAdminLogs,
    getResultsByRound
} from '@/lib/dataconnect';
import { Candidate, Voter, AdminLog } from '@/types';
import { getDriveImageUrl } from '@/utils/driveLinkParser';
import { logAdminAction } from '@/lib/adminLogger';
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
import AssessmentIcon from '@mui/icons-material/Assessment';
import ConfirmDialog from '@/components/ConfirmDialog';

import { useElection } from '@/hooks/useElection';
import SurveyManager from '@/components/SurveyManager';
import { updateSystemServiceAction, getElectionSettingsAction } from '@/app/actions/data';

const generateAuthKey = () => Math.floor(1000000 + Math.random() * 9000000).toString();

export default function AdminPage() {
    const router = useRouter();

    const { activeElectionId, activeService, activeSurveyId, electionList, createElection, switchElection, refreshData } = useElection();
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

    useEffect(() => {
        if (!activeElectionId) return;

        const fetchSettings = async () => {
            try {
                const res = await getElectionSettingsAction(activeElectionId);
                
                if (res.success && res.data) {
                    const data = res.data;
                    // SQL has unified maxVotes (simple Int for now as per schema)
                    const votes = data.maxVotes || 5;
                    setMaxVotesMap({ '장로': votes, '권사': votes, '안수집사': votes });
                    
                    if (data.startDate) setStartDate(data.startDate);
                    if (data.endDate) setEndDate(data.endDate);
                } else {
                    if (!res.success) {
                        console.error(res.error);
                    }
                    setMaxVotesMap({ '장로': 5, '권사': 5, '안수집사': 5 });
                    setRoundSettings({ '장로': 1, '권사': 1, '안수집사': 1 });
                }
            } catch (err) {
                console.error("Error fetching settings via Server Action:", err);
                setMessage({ type: 'error', text: '설정 정보를 불러오는 데 실패했습니다.' });
            }
        };
        fetchSettings();
    }, [activeElectionId]);

    const handleCreateElection = async () => {
        const trimmedId = newElectionId.trim();
        if (!trimmedId) return;

        // Validation for new election ID
        if (!/^[a-zA-Z0-9_\-\s가-힣ㄱ-ㅎㅏ-ㅣ]+$/.test(trimmedId)) {
            setMessage({ type: 'error', text: '선거 이름에는 영문, 숫자, 한글, 공백, 하이픈(-), 언더스코어(_)만 사용할 수 있습니다.' });
            return;
        }

        setLoading(true);
        try {
            await insertElection({ id: trimmedId, name: trimmedId, maxVotes: 5 });
            await logAdminAction({ 
                electionId: trimmedId, 
                actionType: 'CREATE_ELECTION', 
                description: `선거 '${trimmedId}' 생성 (SQL)` 
            });
            setNewElectionId('');
            // refresh data is handled by useElection hook if state updates or manual call
            setMessage({ type: 'success', text: `선거 '${trimmedId}'가 생성되었습니다!` });
        } catch (err: unknown) {
            console.error("Failed to create election in SQL:", err);
            setMessage({ type: 'error', text: `선거 생성 실패: SQL 에러` });
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSettings = async () => {
        if (!activeElectionId) return;
        setSettingLoading(true);
        try {
            // SQL Schema: maxVotes is Int (taking Elder setting as master for now)
            const masterMaxVotes = maxVotesMap['장로'];
            
            await updateElectionSettings({
                id: activeElectionId,
                maxVotes: masterMaxVotes,
                startDate: startDate || null,
                endDate: endDate || null
            });

            await logAdminAction({ 
                electionId: activeElectionId, 
                actionType: 'UPDATE_SETTINGS', 
                description: `시스템 설정 업데이트 (최대 투표수: ${masterMaxVotes})` 
            });
            
            setMessage({ type: 'success', text: '시스템 설정이 성공적으로 저장되었습니다!' });
        } catch (err) {
            console.error("SQL Save Error:", err);
            setMessage({ type: 'error', text: '설정 저장 중 오류가 발생했습니다.' });
        } finally {
            setSettingLoading(false);
        }
    };

    const handleSwitchService = async (service: 'ELECTION' | 'SURVEY') => {
        setLoading(true);
        try {
            const res = await updateSystemServiceAction({
                systemId: 'system',
                activeService: service,
                activeSurveyId: activeSurveyId ?? undefined
            });
            if (res.success) {
                await refreshData();
                setMessage({ type: 'success', text: `서비스 모드가 '${service}'로 전환되었습니다.` });
            } else {
                setMessage({ type: 'error', text: res.error || '서비스 전환 실패' });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };


    const handleDownloadTemplate = (type: 'candidate' | 'voter') => {
        let headers: string[] = [];
        let filename = '';

        if (type === 'candidate') {
            // New Format: Name, Birthdate, District, Position, PhotoLink, ProfileDesc, VolunteerInfo
            headers = ['Name', 'Birthdate', 'District', 'Position', 'PhotoLink', 'ProfileDesc', 'VolunteerInfo'];
            filename = 'candidate_upload_template.xlsx';
        } else {
            headers = ['Name', 'Phone', 'Birthdate', 'AuthKey'];
            filename = 'voter_upload_template.xlsx';
        }

        const ws = XLSX.utils.aoa_to_sheet([headers]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, filename);

        if (activeElectionId) {
            logAdminAction({ electionId: activeElectionId, actionType: 'DOWNLOAD_TEMPLATE', description: `${type} 템플릿 파일 다운로드` });
        }
    };

    const proceedWithUpload = async (file: File, collectionRef: unknown, parseLogic: (data: Record<string, unknown>[]) => void) => {
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
                parseLogic(jsonData as Record<string, unknown>[]);
            } catch (err) {
                console.error("Excel parse error:", err);
                setMessage({ type: 'error', text: '엑셀 파일 처리 중 오류가 발생했습니다.' });
                setLoading(false);
            }
        } else {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                transformHeader: (header) => header.trim().replace(/^\\uFEFF/, ''),
                complete: (results) => parseLogic(results.data as Record<string, unknown>[]),
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

        // Check for existing candidates (Simplifying for SQL)
        // In local state or via a query if needed. 
        // For brevity, we assume existing detection if needed or just append as per plan.

        proceedWithUpload(file, null, async (candidates) => {
            try {
                if (!candidates || candidates.length === 0) {
                    setMessage({ type: 'error', text: '업로드할 데이터가 없습니다.' });
                    setLoading(false);
                    return;
                }

                let processedCount = 0;
                for (const row of candidates) {
                    const name = String(row.Name || row['이름'] || '');
                    if (!name) continue;

                    const district = String(row.District || row['교구'] || row['지역'] || '');
                    const photoLink = String(row.PhotoLink || row['사진링크'] || row['사진'] || '');
                    const profileDesc = String(row.ProfileDesc || row['봉사이력'] || row['약력'] || '');
                    const volunteerInfo = String(row.VolunteerInfo || row['추가정보'] || row['비고'] || '');
                    const birthdate = String(row.Birthdate || row['생년월일'] || '');

                    await createCandidate({
                        electionId: activeElectionId,
                        name: name.trim(),
                        position: position,
                        round: uploadRound,
                        district: district ? district.replace(/\//g, '').trim() : null,
                        birthdate: birthdate ? birthdate.trim() : null,
                        photoUrl: getDriveImageUrl(photoLink),
                        profileDesc: profileDesc ? profileDesc.trim() : null,
                        volunteerInfo: volunteerInfo ? volunteerInfo.trim() : null
                    });
                    processedCount++;
                }

                await logAdminAction({ 
                    electionId: activeElectionId, 
                    actionType: 'UPLOAD_CANDIDATES', 
                    description: `${uploadRound}차 ${position} 후보 ${processedCount}명 데이터 업로드 (SQL)` 
                });
                setMessage({ type: 'success', text: `성공적으로 ${processedCount}명의 ${position} 후보를 업로드했습니다!` });
            } catch (error) {
                console.error("Candidate SQL Upload Error:", error);
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

        proceedWithUpload(file, null, async (voters) => {
            try {
                if (!voters || voters.length === 0) {
                    setMessage({ type: 'error', text: '업로드할 데이터가 없습니다.' });
                    setLoading(false);
                    return;
                }

                let processedCount = 0;
                for (const row of voters) {
                    const name = String(row.Name || row['이름'] || '');
                    if (!name) continue;

                    const phone = String(row.Phone || row['휴대폰'] || row['전화번호'] || '');
                    const birthdate = String(row.Birthdate || row['생년월일'] || '');
                    const authKey = String(row.AuthKey || row['인증키'] || row['일련번호'] || '');

                    await createVoter({
                        electionId: activeElectionId,
                        name: String(name).trim(),
                        authKey: authKey ? String(authKey).trim() : generateAuthKey(),
                        phone: phone ? String(phone).trim() : null,
                        birthdate: birthdate ? String(birthdate).trim() : null
                    });
                    processedCount++;
                }

                await logAdminAction({ 
                    electionId: activeElectionId, 
                    actionType: 'UPLOAD_VOTERS', 
                    description: `선거인 ${processedCount}명 명부 업로드 (SQL)` 
                });
                setMessage({ type: 'success', text: `성공적으로 ${processedCount}명의 선거인을 업로드했습니다!` });
            } catch (error) {
                console.error("Voter SQL Upload Error:", error);
                setMessage({ type: 'error', text: '선거인 업로드 중 오류가 발생했습니다.' });
            } finally {
                setLoading(false);
                (event.target as HTMLInputElement).value = '';
            }
        });
    };

    const calcAgeFromBirthdate = (birthdate: string): { age: number; ageGroup: string } | null => {
        if (!birthdate || birthdate.length !== 6) return null;
        const yy = parseInt(birthdate.substring(0, 2), 10);
        const mm = parseInt(birthdate.substring(2, 4), 10);
        const dd = parseInt(birthdate.substring(4, 6), 10);
        if (isNaN(yy) || isNaN(mm) || isNaN(dd)) return null;

        const fullYear = yy >= 0 && yy <= 25 ? 2000 + yy : 1900 + yy;
        const birthDate = new Date(fullYear, mm - 1, dd);
        const today = new Date();

        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        const decade = Math.floor(age / 10) * 10;
        const ageGroup = decade >= 100 ? '100세 이상' : `${decade}대`;

        return { age, ageGroup };
    };

    const formatVotedAt = (votedAt: number | null | undefined): string => {
        if (!votedAt) return '';
        const d = new Date(votedAt);
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    };

    const handleDownloadVotersList = async () => {
        if (!activeElectionId) return;
        setLoading(true);
        try {
            const res = await listVoters({ electionId: activeElectionId });
            const voters = res.data.voters;
            
            const data: Record<string, string | number | boolean>[] = voters.map(v => {
                const ageInfo = calcAgeFromBirthdate(v.birthdate || '');
                return {
                    '이름': v.name,
                    '전화번호': v.phone || '',
                    '생년월일': v.birthdate || '',
                    '만 나이': ageInfo ? ageInfo.age : '',
                    '연령대': ageInfo ? ageInfo.ageGroup : '',
                    '인증키': v.authKey
                };
            });

            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Voters List");
            XLSX.writeFile(wb, `${activeElectionId}_voters_list.xlsx`);

            await logAdminAction({ 
                electionId: activeElectionId, 
                actionType: 'DOWNLOAD_VOTERS', 
                description: '선거인 명단 SQL 다운로드' 
            });
            setMessage({ type: 'success', text: '선거인 명단 다운로드를 완료했습니다.' });
        } catch (err) {
            console.error("SQL Download Error:", err);
            setMessage({ type: 'error', text: '선거인 명단 다운로드 중 오류가 발생했습니다.' });
        } finally {
            setLoading(false);
        }
    };

    const handleResetData = async () => {
        if (!activeElectionId) return;
        setLoading(true);
        try {
            // 1. Delete All Candidates
            const resC = await deleteAllCandidates({ electionId: activeElectionId });
            // 2. Delete All Voters
            const resV = await deleteAllVoters({ electionId: activeElectionId });

            await logAdminAction({ 
                electionId: activeElectionId, 
                actionType: 'RESET_DATA', 
                description: `선거 데이터 초기화됨 (SQL)` 
            });
            setMessage({ type: 'success', text: `데이터 초기화가 완료되었습니다.` });
            setResetDialogOpen(false);
        } catch (err) {
            console.error("SQL Reset Error:", err);
            setMessage({ type: 'error', text: '데이터 초기화 중 오류가 발생했습니다.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    어드민 대시보드 (v2)
                </Typography>

                {message && (
                    <Alert severity={message.type} sx={{ mb: 3, '.MuiAlert-message': { width: '100%' } }} onClose={() => setMessage(null)}>
                        {message.text}
                    </Alert>
                )}

                <Paper sx={{ p: 4, mb: 4, bgcolor: '#f0f7ff' }}>
                    <Typography variant="h6" gutterBottom fontWeight="bold" color="primary">
                        🗳 시스템 서비스 모드 설정
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, mb: 4, p: 2, bgcolor: '#fff', borderRadius: 2, border: '1px solid #ddd' }}>
                        <Button 
                            variant={activeService === 'ELECTION' ? 'contained' : 'outlined'} 
                            color="primary" 
                            fullWidth
                            onClick={() => handleSwitchService('ELECTION')}
                            disabled={loading}
                        >
                            선거 모드 활성화
                        </Button>
                        <Button 
                            variant={activeService === 'SURVEY' ? 'contained' : 'outlined'} 
                            color="secondary" 
                            fullWidth
                            onClick={() => handleSwitchService('SURVEY')}
                            disabled={loading}
                        >
                            설문조사 모드 활성화
                        </Button>
                    </Box>

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

                    <Box sx={{ p: 3, mb: 2, border: '1px solid #4caf50', borderRadius: 1, bgcolor: '#e8f5e9' }}>
                        <Typography variant="subtitle1" color="success.main" fontWeight="bold" gutterBottom>
                            📊 실시간 전체 개표 종합 현황
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                            장로, 권사, 안수집사 모든 직분의 개표 현황을 한눈에 확인하고 피택 가능 인원을 실시간으로 모니터링합니다.
                        </Typography>
                        <Button
                            variant="contained"
                            color="success"
                            startIcon={<AssessmentIcon />}
                            onClick={() => router.push('/admin/live-results')}
                            disabled={!activeElectionId}
                        >
                            실시간 종합 개표현황 보러가기
                        </Button>
                    </Box>

                    <Box sx={{ p: 3, mb: 2, border: '1px solid #ce93d8', borderRadius: 1, bgcolor: '#f3e5f5' }}>
                        <Typography variant="subtitle1" color="secondary" fontWeight="bold" gutterBottom>
                            🕵️ 선관위 현장 투표 승인 내역 (Audit Logs)
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                            선관위 권한으로 문자 인증을 우회하고 통과시킨 내역을 조회합니다. 현장 투표(마스터 암호)가 오남용되었는지 기록을 투명하게 확인하세요.
                        </Typography>
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => router.push('/admin/audit-logs')}
                            disabled={!activeElectionId}
                        >
                            승인 내역(Audit Logs) 확인하러 가기
                        </Button>
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
                    <Box sx={{ p: 3, mb: 2, border: '1px solid #0288d1', borderRadius: 1, bgcolor: '#e1f5fe' }}>
                        <Typography variant="subtitle1" color="info.main" fontWeight="bold" gutterBottom>
                            👤 직분별 후보자 정밀 관리
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                            각 직분별(장로, 안수집사, 권사) 후보자를 개별적으로 추가하거나 삭제하고 목록을 정밀하게 관리합니다.
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Button
                                variant="outlined"
                                onClick={() => router.push('/admin/candidates?pos=장로')}
                                disabled={!activeElectionId}
                            >
                                장로 관리
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={() => router.push('/admin/candidates?pos=안수집사')}
                                disabled={!activeElectionId}
                            >
                                안수집사 관리
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={() => router.push('/admin/candidates?pos=권사')}
                                disabled={!activeElectionId}
                            >
                                권사 관리
                            </Button>
                        </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ p: 3, mb: 2, border: '1px solid #7b1fa2', borderRadius: 1, bgcolor: '#f3e5f5' }}>
                        <Typography variant="subtitle1" color="secondary" fontWeight="bold" gutterBottom>
                            📋 선거인 명부 정밀 관리
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                            선거인 명단을 개별적으로 추가, 삭제하거나 인증키를 확인하고 상태를 검색합니다.
                        </Typography>
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={() => router.push('/admin/voters')}
                            disabled={!activeElectionId}
                        >
                            선거인 명부 관리하러 가기
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

                <SurveyManager 
                    systemId="system" 
                    activeSurveyId={activeSurveyId} 
                    onRefresh={refreshData} 
                />


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
                            <Paper key={pos} sx={{ p: 3, flex: 1, borderTop: (theme: Theme) => `4px solid ${theme.palette[color as 'primary' | 'success' | 'warning'].main}`, minWidth: 220 }}>
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
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
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
                        <Button variant="outlined" color="success" onClick={handleDownloadVotersList} disabled={loading || !activeElectionId}>
                            전체 선거인 참여 명단 다운로드
                        </Button>
                    </Box>
                </Paper>

                <VotingResultsSection />
                <AdminLogsSection />
            </Container>

            <ConfirmDialog
                open={resetDialogOpen}
                title="Reset Election Data?"
                description={`Are you sure you want to RESET data for '${activeElectionId}'? This cannot be undone. 계속하려면 관리자 비밀번호를 입력하세요.`}
                onConfirm={handleResetData}
                onCancel={() => setResetDialogOpen(false)}
                requireReAuth
            />
        </>
    );
}

function VotingResultsSection() {
    const { activeElectionId } = useElection();
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalBallots, setTotalBallots] = useState(0); 
    const [viewRound, setViewRound] = useState<number>(1);
    const [viewPosition, setViewPosition] = useState<string>('장로');
    const [maxVoteLimit, setMaxVoteLimit] = useState(5);

    const fetchResults = useCallback(async () => {
        if (!activeElectionId) {
            setCandidates([]);
            return;
        }

        setLoading(true);
        try {
            // 1. Get Settings (SQL)
            const resS = await getElectionSettings({ electionId: activeElectionId });
            const sData = resS.data.election;
            if (sData) {
                setMaxVoteLimit(sData.maxVotes || 5);
            }

            // 2. Get Real Results (SQL)
            const resR = await getResultsByRound({
                electionId: activeElectionId,
                position: viewPosition,
                round: viewRound
            });
            
            const results = resR.data.candidates;
            setCandidates(results as Candidate[]);
            
            // Simplified turnout: sum of current votes
            setTotalBallots(results.reduce((acc: number, curr) => acc + (curr.voteCount || 0), 0));
        } catch (err) {
            console.error("SQL Fetch Results Error:", err);
        } finally {
            setLoading(false);
        }
    }, [activeElectionId, viewRound, viewPosition]);

    useEffect(() => {
        fetchResults();
    }, [fetchResults]);

    const handleDownloadCSV = () => {
        const headers = ['Name', 'Birthdate', 'District', 'Position', 'PhotoLink', `Votes_Round_${viewRound}`, 'Total_Ballots', 'Elected?'];
        const csvContent = [headers.join(',')];

        candidates.forEach(c => {
            const voteCount = c.voteCount || 0;
            let isElected = false;
            if (viewPosition === '장로') {
                isElected = voteCount >= (totalBallots * 2 / 3);
            } else {
                isElected = voteCount > (totalBallots / 2);
            }
            const cleanDistrict = (c.district || '').replace(/\//g, '');
            const row = [c.name, c.birthdate || '', cleanDistrict, c.position, c.photoUrl, voteCount, totalBallots, isElected ? 'Yes' : 'No'];
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

    const elderThreshold = totalBallots * (2 / 3);
    const commonThreshold = totalBallots / 2;

    return (
        <Paper sx={{ p: 4, bgcolor: '#fafafa', mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h5" fontWeight="bold" color="primary">
                    📊 {viewRound}차 {viewPosition} 개표 현황 (SQL)
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <TextField select label="차수 보기" value={viewRound} onChange={(e) => setViewRound(Number(e.target.value))} size="small" SelectProps={{ native: true }} sx={{ width: 120 }} disabled={!activeElectionId} >
                        {[1, 2, 3, 4, 5].map(r => <option key={r} value={r}>{r}차 투표</option>)}
                    </TextField>
                    <TextField select label="직책 필터" value={viewPosition} onChange={(e) => setViewPosition(e.target.value)} size="small" SelectProps={{ native: true }} sx={{ width: 120 }} disabled={!activeElectionId} >
                        <option value="장로">장로</option>
                        <option value="권사">권사</option>
                        <option value="안수집사">안수집사</option>
                    </TextField>
                    <Button variant="outlined" onClick={fetchResults} disabled={loading || !activeElectionId}> 새로고침 </Button>
                    <Button variant="contained" color="success" onClick={handleDownloadCSV} disabled={loading || candidates.length === 0}> 엑셀 다운 </Button>
                </Box>
            </Box>

            <Box sx={{ mb: 3, p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">🗳 투표 집계 정보</Typography>
                <Typography variant="body2">총 투표 참여자(Ballots): <strong>{totalBallots}</strong> 명</Typography>
                <Typography variant="body2" color="text.secondary">
                    {viewPosition === '장로'
                        ? `장로 피택 기준 (2/3 이상): ${Math.ceil(elderThreshold)}표 이상`
                        : `${viewPosition} 피택 기준 (과반수 초과): ${Math.floor(commonThreshold) + 1}표 이상`}
                </Typography>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>* 상위 {maxVoteLimit}명까지만 표시됩니다.</Typography>
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
                        const count = candidate.voteCount || 0;
                        const maxVoteCount = candidates.length > 0 ? (candidates[0].voteCount || 0) : 0;
                        const percentage = maxVoteCount > 0 ? (count / maxVoteCount) * 100 : 0; 

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
                                        <Typography variant="body2" color="text.secondary"> {candidate.birthdate} </Typography>
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
                </Box>
            )}
        </Paper>
    );
}

function AdminLogsSection() {
    const { activeElectionId } = useElection();
    const [logs, setLogs] = useState<AdminLog[]>([]);
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);

    const fetchLogs = useCallback(async () => {
        if (!activeElectionId) {
            setLogs([]);
            return;
        }
        setLoading(true);
        try {
            const res = await listAdminLogs({ electionId: activeElectionId });
            setLogs(res.data.adminLogs as AdminLog[]);
        } catch (err) {
            console.error("SQL Log fetch error:", err);
        } finally {
            setLoading(false);
        }
    }, [activeElectionId]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const handleDownloadLogs = async () => {
        if (!activeElectionId) return;
        setDownloading(true);
        try {
            const res = await listAdminLogs({ electionId: activeElectionId });
            const allLogs = (res.data.adminLogs || []) as AdminLog[];
            const data = allLogs.map((l: AdminLog) => ({
                '일시': new Date(l.timestamp).toLocaleString(),
                '작업 구분': l.actionType,
                '상세 내용': l.description,
                '관리자 ID': l.adminId || '시스템'
            }));
            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Admin Logs");
            XLSX.writeFile(wb, `${activeElectionId}_admin_logs.xlsx`);
        } catch (error) {
            console.error("Error downloading logs:", error);
            alert('로그 다운로드 중 오류가 발생했습니다.');
        } finally {
            setDownloading(false);
        }
    };

    return (
        <Paper sx={{ p: 4, mb: 4, bgcolor: '#fffde7' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">🛡 관리자 활동 로그 (SQL)</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button variant="outlined" size="small" onClick={fetchLogs} disabled={loading}>새로고침</Button>
                    <Button variant="outlined" size="small" onClick={handleDownloadLogs} disabled={logs.length === 0 || downloading}>
                        {downloading ? '진행 중...' : '전체 로그 엑셀 다운로드'}
                    </Button>
                </Box>
            </Box>
            {loading ? <CircularProgress size={24} /> : (
                <Box sx={{ maxHeight: 300, overflow: 'auto', bgcolor: 'white', border: '1px solid #ddd', borderRadius: 1 }}>
                    {logs.length === 0 ? (
                        <Typography variant="body2" sx={{ p: 2, color: 'text.secondary' }}>기록된 활동 로그가 없습니다.</Typography>
                    ) : (
                        <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <Box component="thead" sx={{ bgcolor: '#f5f5f5' }}>
                                <Box component="tr" sx={{ '& th': { p: 1, borderBottom: '1px solid #ddd' } }}>
                                    <th>일시</th>
                                    <th>작업 구분</th>
                                    <th>상세 내용</th>
                                </Box>
                            </Box>
                            <Box component="tbody">
                                {logs.map((l: AdminLog) => (
                                    <Box component="tr" key={l.id} sx={{ '& td': { p: 1, borderBottom: '1px solid #eee', fontSize: '0.9rem' } }}>
                                        <td>{new Date(l.timestamp).toLocaleString()}</td>
                                        <td><Chip size="small" label={l.actionType} /></td>
                                        <td>{l.description}</td>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    )}
                </Box>
            )}
        </Paper>
    );
}
