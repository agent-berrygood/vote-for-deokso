'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Container,
    Typography,
    Box,
    Paper,
    Grid,
    CircularProgress,
    Alert,
    Button,
    IconButton,
    Divider,
    Card,
    CardContent,
    Stack,
    Chip,
    Breadcrumbs,
    Link,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend, 
    ResponsiveContainer, 
    PieChart, 
    Pie, 
    Cell 
} from 'recharts';
import { 
    getSurveyAction, 
    listSurveyQuestionsAction, 
    listSurveyResponsesAction 
} from '@/app/actions/data';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

export default function SurveyResultsPage() {
    const params = useParams();
    const router = useRouter();
    const surveyId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [survey, setSurvey] = useState<any>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [responses, setResponses] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [chartTypes, setChartTypes] = useState<Record<string, 'bar' | 'pie'>>({});

    useEffect(() => {
        fetchData();
    }, [surveyId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [sRes, qRes, rRes] = await Promise.all([
                getSurveyAction({ id: surveyId }),
                listSurveyQuestionsAction(surveyId),
                listSurveyResponsesAction(surveyId)
            ]);

            if (sRes.success) setSurvey(sRes.data);
            if (qRes.success) setQuestions(qRes.data || []);
            if (rRes.success) {
                const data = rRes.data || [];
                setResponses(data);
                
                // [DIAGNOSTIC] 전체 구조 로그
                if (data.length > 0) {
                    console.group('📊 [Survey Debug] Data Load Summary');
                    console.log('Total Responses:', data.length);
                    console.log('Sample Response Keys:', Object.keys(data[0] || {}));
                    try {
                        const sampleAnswers = JSON.parse(data[0].answers);
                        const finalAnswers = typeof sampleAnswers === 'string' ? JSON.parse(sampleAnswers) : sampleAnswers;
                        console.log('Sample Answers Structure:', finalAnswers);
                    } catch (e) {
                        console.log('Raw Answers String Sample:', data[0].answers);
                    }
                    console.groupEnd();
                }
            } else {
                setError(rRes.error || '응답 데이터를 불러오지 못했습니다.');
            }

        } catch (err) {
            console.error('fetchData error:', err);
            setError('데이터를 불러오는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 데이터 집합 생성
    const chartData = useMemo(() => {
        return questions.map((q, qIdx) => {
            // 이중 파싱 방어 로직을 포함한 헬퍼 함수
            const parseAnswers = (raw: string) => {
                try {
                    const parsed = JSON.parse(raw);
                    // 간혹 문자열이 따옴표로 한 번 더 싸여 있는 경우 대응
                    return typeof parsed === 'string' ? JSON.parse(parsed) : parsed;
                } catch (e) { return {}; }
            };

            if (['MULTIPLE_CHOICE', 'DROPDOWN', 'SCALE', 'MULTIPLE_SELECT'].includes(q.type)) {
                const distribution: { [key: string]: number } = {};
                
                // 보기 목록 가져오기 (각 항목 trim 처리)
                let options: string[] = [];
                try {
                    if (q.type === 'SCALE') {
                        const scaleOpts = q.options ? JSON.parse(q.options) : { min: 1, max: 5 };
                        const min = scaleOpts.min ?? 1;
                        const max = scaleOpts.max ?? 5;
                        for (let i = min; i <= max; i++) options.push(String(i));
                    } else if (q.options) {
                        const parsed = JSON.parse(q.options);
                        options = Array.isArray(parsed) ? parsed.map(o => String(o).trim()) : [];
                    }
                } catch (e) {
                    console.error('Options parsing error:', e, q);
                }

                // 초기화
                options.forEach(opt => distribution[opt] = 0);

                // 응답 집계
                responses.forEach((r, rIdx) => {
                    try {
                        const answers = parseAnswers(r.answers);
                        
                        // [DIAGNOSTIC] 상세 매칭 시도
                        let val = answers[q.id];
                        let matchType = 'UUID';

                        if (val === undefined || val === null) {
                            val = answers[q.text];
                            matchType = 'TEXT';
                        }
                        
                        // 백업: 질문 텍스트가 키인 경우 (공백/따옴표 미세 차이 보정)
                        if (val === undefined || val === null) {
                            const trimmedKey = Object.keys(answers).find(k => k.trim() === q.text.trim());
                            if (trimmedKey) {
                                val = answers[trimmedKey];
                                matchType = 'TRIMMED_TEXT';
                            }
                        }

                        if (rIdx === 0 || val !== undefined) {
                            console.log(`[Diagnostic] Q:${q.text.substring(0, 15)}... | Match Found: ${val !== undefined} (${matchType}) | Value:`, val);
                            if (val === undefined) {
                                console.log(`   Available Keys in Answers:`, Object.keys(answers));
                            }
                        }

                        if (val !== undefined && val !== null) {
                            if (Array.isArray(val)) {
                                val.forEach(v => { 
                                    const vStr = String(v).trim();
                                    if (vStr) distribution[vStr] = (distribution[vStr] || 0) + 1; 
                                });
                            } else {
                                const valStr = String(val).trim();
                                if (valStr) distribution[valStr] = (distribution[valStr] || 0) + 1;
                            }
                        }
                    } catch (e) {
                        console.error('Answer parsing error for response', r.id, e);
                    }
                });

                const data = Object.keys(distribution).map(key => ({
                    name: key,
                    value: distribution[key]
                }));

                const total = data.reduce((acc, curr) => acc + curr.value, 0);

                return {
                    id: q.id,
                    text: q.text,
                    type: q.type,
                    totalCount: total,
                    data: data.length > 0 ? data : null,
                    textResponses: null
                };
            }
            
            // 주관식 답변 처리
            const textResponses: any[] = [];
            responses.forEach(r => {
                const answers = parseAnswers(r.answers);
                const val = answers[q.id] || answers[q.text];
                if (val !== undefined && val !== null && String(val).trim() !== '') {
                    textResponses.push({
                        id: r.id,
                        memberName: r.member?.name || '익명',
                        answer: String(val).trim(),
                        submittedAt: r.submittedAt
                    });
                }
            });

            return { 
                id: q.id, 
                text: q.text, 
                type: q.type, 
                totalCount: textResponses.length, 
                data: null, 
                textResponses: textResponses.length > 0 ? textResponses : null 
            };
        });
    }, [questions, responses]);

    if (loading) return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: 2 }}>
            <CircularProgress size={60} thickness={4} />
            <Typography color="text.secondary">결과 데이터를 분석 중입니다...</Typography>
        </Box>
    );

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Breadcrumbs sx={{ mb: 2 }}>
                    <Stack direction="row" spacing={1}>
                        <Link component="button" variant="body2" underline="hover" color="inherit" onClick={() => router.push('/admin/surveys')}>설문 목록</Link>
                        <Typography variant="body2" color="text.disabled">/</Typography>
                        <Link component="button" variant="body2" underline="hover" color="inherit" onClick={() => router.push(`/admin/surveys/${surveyId}`)}>설문 관리</Link>
                        <Typography variant="body2" color="text.disabled">/</Typography>
                        <Typography variant="body2" color="text.primary">설문 결과</Typography>
                    </Stack>
                </Breadcrumbs>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <IconButton onClick={() => router.back()} color="primary" sx={{ bgcolor: 'rgba(0,0,0,0.05)' }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h4" fontWeight="bold">📊 설문 결과 통계</Typography>
                </Box>
                <Typography variant="h6" color="primary" gutterBottom>{survey?.title}</Typography>
                <Typography variant="body2" color="text.secondary">총 {responses.length}명이 응답에 참여했습니다.</Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <Grid container spacing={3}>
                {chartData.map((qData, idx) => (
                    <Grid size={{ xs: 12, md: qData.data ? 6 : 12 }} key={qData.id}>
                        <Card sx={{ height: '100%', borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                    <Typography variant="subtitle1" fontWeight="bold" sx={{ display: 'flex', gap: 1, alignItems: 'center', pr: 2 }}>
                                        <Chip label={`Q${idx + 1}`} size="small" color="primary" sx={{ fontWeight: 'bold', height: 24 }} />
                                        {qData.text}
                                    </Typography>
                                    
                                    {qData.data && (
                                        <Stack direction="row" spacing={0.5} sx={{ bgcolor: 'rgba(0,0,0,0.04)', p: 0.5, borderRadius: 2 }}>
                                            <Button 
                                                size="small" 
                                                variant={(!chartTypes[qData.id] || chartTypes[qData.id] === 'bar') ? 'contained' : 'text'}
                                                onClick={() => setChartTypes(prev => ({ ...prev, [qData.id]: 'bar' }))}
                                                sx={{ minWidth: 50, fontSize: '0.75rem', px: 1 }}
                                            >
                                                Bar
                                            </Button>
                                            <Button 
                                                size="small" 
                                                variant={chartTypes[qData.id] === 'pie' ? 'contained' : 'text'}
                                                onClick={() => setChartTypes(prev => ({ ...prev, [qData.id]: 'pie' }))}
                                                sx={{ minWidth: 50, fontSize: '0.75rem', px: 1 }}
                                            >
                                                Pie
                                            </Button>
                                        </Stack>
                                    )}
                                </Box>
                                <Divider sx={{ mb: 3, opacity: 0.5 }} />

                                {qData.data ? (
                                    <Box sx={{ height: 350, minHeight: 300, width: '100%' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            {chartTypes[qData.id] === 'pie' ? (
                                                <PieChart>
                                                    <Pie
                                                        data={qData.data}
                                                        cx="50%"
                                                        cy="50%"
                                                        labelLine={true}
                                                        label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                                                        outerRadius={100}
                                                        fill="#8884d8"
                                                        dataKey="value"
                                                    >
                                                        {qData.data.map((entry: any, index: number) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip 
                                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                                                    />
                                                    <Legend />
                                                </PieChart>
                                            ) : (
                                                <BarChart data={qData.data} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                    <XAxis dataKey="name" angle={-15} textAnchor="end" height={60} interval={0} fontSize={12} />
                                                    <YAxis allowDecimals={false} />
                                                    <Tooltip 
                                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                                                    />
                                                    <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40}>
                                                        {qData.data.map((entry: any, index: number) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            )}
                                        </ResponsiveContainer>
                                    </Box>
                                ) : qData.textResponses ? (
                                    <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 350, borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)' }}>
                                        <Table size="small" stickyHeader>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8fafc', width: '100px' }}>응답자</TableCell>
                                                    <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f8fafc' }}>답변 내용</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {qData.textResponses.map((tr: any) => (
                                                    <TableRow key={tr.id} hover>
                                                        <TableCell sx={{ fontSize: '0.875rem' }}>{tr.memberName}</TableCell>
                                                        <TableCell sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: '0.875rem' }}>{tr.answer}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                ) : (
                                    <Box sx={{ py: 6, textAlign: 'center', bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            {qData.type === 'TEXT_SHORT' || qData.type === 'TEXT_LONG' 
                                                ? '작성된 답변이 없습니다.' 
                                                : '응답 데이터가 없거나 지원되지 않는 형식입니다.'}
                                        </Typography>
                                    </Box>
                                )}
                            </CardContent>
                            <Box sx={{ px: 3, pb: 2, textAlign: 'right' }}>
                                <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 'bold', bgcolor: 'primary.light', px: 1, py: 0.5, borderRadius: 1, opacity: 0.8 }}>
                                    총 {qData.totalCount}건의 응답
                                </Typography>
                            </Box>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
}
