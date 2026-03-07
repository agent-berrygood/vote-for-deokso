'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useElection } from '@/hooks/useElection';
import {
    Container,
    Typography,
    Paper,
    Box,
    Button,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface AuditLog {
    id: string;
    action: string;
    voterId: string;
    voterName: string;
    approvedBy: string;
    timestamp: Date | null;
}

export default function AuditLogsPage() {
    const router = useRouter();
    const { activeElectionId } = useElection();
    const [loading, setLoading] = useState(true);
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<string>('전체');

    useEffect(() => {
        if (!activeElectionId) {
            setLoading(false);
            return;
        }

        const fetchLogs = async () => {
            setLoading(true);
            try {
                const logsRef = collection(db, `elections/${activeElectionId}/audit_logs`);
                const q = query(logsRef, orderBy('timestamp', 'desc'));
                const snapshot = await getDocs(q);

                const fetched: AuditLog[] = [];
                snapshot.forEach(doc => {
                    const data = doc.data();
                    let dateObj = null;
                    if (data.timestamp?.toDate) {
                        dateObj = data.timestamp.toDate();
                    }
                    fetched.push({
                        id: doc.id,
                        action: data.action || '',
                        voterId: data.voterId || '',
                        voterName: data.voterName || '',
                        approvedBy: data.approvedBy || '알수없음',
                        timestamp: dateObj,
                    });
                });
                setLogs(fetched);
            } catch (err) {
                console.error(err);
                setError('승인 내역을 불러오는데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, [activeElectionId]);

    const formatTimestamp = (date: Date | null) => {
        if (!date) return '시간 기록 없음';
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    };

    // Extract unique approvers
    const approvers = ['전체', ...Array.from(new Set(logs.map(log => log.approvedBy)))];

    const filteredLogs = activeTab === '전체'
        ? logs
        : logs.filter(log => log.approvedBy === activeTab);

    if (!activeElectionId && !loading) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Alert severity="warning">현재 활성화된 선거가 없어 내역을 조회할 수 없습니다.</Alert>
                <Button sx={{ mt: 2 }} startIcon={<ArrowBackIcon />} onClick={() => router.back()}>
                    돌아가기
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Button startIcon={<ArrowBackIcon />} onClick={() => router.back()} sx={{ mr: 2 }}>
                    뒤로가기
                </Button>
                <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
                    선관위 현장 투표 승인 내역 (Audit Logs)
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
            )}

            <Paper sx={{ width: '100%', mb: 4 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                        value={activeTab}
                        onChange={(_, newValue) => setActiveTab(newValue)}
                        variant="scrollable"
                        scrollButtons="auto"
                    >
                        {approvers.map(approver => (
                            <Tab key={approver} label={approver} value={approver} />
                        ))}
                    </Tabs>
                </Box>

                <Box sx={{ p: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {activeTab === '전체'
                            ? '모든 위원'
                            : `'${activeTab}' 위원`}
                        의 문자인증 우회 통과 기록입니다. (총 {filteredLogs.length}건)
                    </Typography>

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : filteredLogs.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 5, color: 'text.secondary' }}>
                            기록된 현장 투표 승인 내역이 없습니다.
                        </Box>
                    ) : (
                        <TableContainer>
                            <Table size="small">
                                <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>승인 일시</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>담당 위원</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>통과된 선거인</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredLogs.map((log) => (
                                        <TableRow key={log.id} hover>
                                            <TableCell>{formatTimestamp(log.timestamp)}</TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color="primary" fontWeight="bold">
                                                    {log.approvedBy}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>{log.voterName}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Box>
            </Paper>
        </Container>
    );
}
