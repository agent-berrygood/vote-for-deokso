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
    Link
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

            if (sRes.success) {
                setSurvey(sRes.data);
            }
            if (qRes.success) {
                setQuestions(qRes.data || []);
            }
            if (rRes.success) {
                setResponses(rRes.data || []);
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
        return questions.map(q => {
            if (['MULTIPLE_CHOICE', 'DROPDOWN', 'SCALE', 'MULTIPLE_SELECT'].includes(q.type)) {
                const distribution: { [key: string]: number } = {};
                
                // 보기 목록 가져오기
                let options: string[] = [];
                try {
                    if (q.type === 'SCALE') {
                        const scaleOpts = q.options ? JSON.parse(q.options) : { min: 1, max: 5 };
                        const min = scaleOpts.min ?? 1;
                        const max = scaleOpts.max ?? 5;
                        for (let i = min; i <= max; i++) options.push(String(i));
                    } else if (q.options) {
                        const parsed = JSON.parse(q.options);
                        options = Array.isArray(parsed) ? parsed : [];
                    }
                } catch (e) {
                    console.error('Options parsing error:', e, q);
                }

                // 초기화
                options.forEach(opt => distribution[opt] = 0);

                // 응답 집계
                responses.forEach(r => {
                    try {
                        const answers = r.answers ? JSON.parse(r.answers) : {};
                        const val = answers[q.id];
                        if (val !== undefined && val !== null) {
                            if (Array.isArray(val)) {
                                val.forEach(v => { 
                                    const vStr = String(v);
                                    distribution[vStr] = (distribution[vStr] || 0) + 1; 
                                });
                            } else {
                                const valStr = String(val);
                                distribution[valStr] = (distribution[valStr] || 0) + 1;
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
                    data: data.length > 0 ? data : null
                };
            }
            return { id: q.id, text: q.text, type: q.type, totalCount: 0, data: null };
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
                                    <Box sx={{ width: '100%', height: 320 }}>
                                        <ResponsiveContainer>
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
                                ) : (
                                    <Box sx={{ py: 6, textAlign: 'center', bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            {qData.type === 'TEXT_SHORT' || qData.type === 'TEXT_LONG' 
                                                ? '주관식 답변은 통계 차트를 제공하지 않습니다.' 
                                                : '응답 데이터가 없거나 지원되지 않는 형식입니다.'}
                                        </Typography>
                                    </Box>
                                )}
                            </CardContent>
                            {qData.data && (
                                <Box sx={{ px: 2, pb: 2, textAlign: 'right' }}>
                                    <Typography variant="caption" color="text.secondary">
                                        총 {qData.totalCount}건의 유효 응답
                                    </Typography>
                                </Box>
                            )}
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
}
