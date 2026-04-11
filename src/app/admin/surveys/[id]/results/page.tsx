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
            if (rRes.success) setResponses(rRes.data || []);
            else setError(rRes.error || '응답 데이터를 불러오지 못했습니다.');

        } catch (err) {
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
                if (q.type === 'SCALE') {
                    for (let i = q.scaleMin || 1; i <= (q.scaleMax || 5); i++) {
                        options.push(String(i));
                    }
                } else if (q.options) {
                    options = JSON.parse(q.options);
                }

                // 초기화
                options.forEach(opt => distribution[opt] = 0);

                // 응답 집계
                responses.forEach(r => {
                    const answers = r.answers ? JSON.parse(r.answers) : {};
                    const val = answers[q.id];
                    if (val) {
                        if (Array.isArray(val)) {
                            val.forEach(v => { distribution[v] = (distribution[v] || 0) + 1; });
                        } else {
                            distribution[val] = (distribution[val] || 0) + 1;
                        }
                    }
                });

                return {
                    id: q.id,
                    text: q.text,
                    type: q.type,
                    data: Object.keys(distribution).map(key => ({
                        name: key,
                        value: distribution[key]
                    }))
                };
            }
            return { id: q.id, text: q.text, type: q.type, data: null };
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
                    <Link underline="hover" color="inherit" onClick={() => router.push('/admin/surveys')} sx={{ cursor: 'pointer' }}>설문 목록</Link>
                    <Link underline="hover" color="inherit" onClick={() => router.push(`/admin/surveys/${surveyId}`)} sx={{ cursor: 'pointer' }}>설문 관리</Link>
                    <Typography color="text.primary">설문 결과</Typography>
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

            <Grid container spacing={4}>
                {chartData.map((qData, idx) => (
                    <Grid size={{ xs: 12, md: qData.data ? 6 : 12 }} key={qData.id}>
                        <Card sx={{ height: '100%', borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.05)' }}>
                            <CardContent>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                    <Chip label={`Q${idx + 1}`} size="small" color="primary" sx={{ fontWeight: 'bold' }} />
                                    {qData.text}
                                </Typography>
                                <Divider sx={{ my: 2, opacity: 0.5 }} />

                                {qData.data ? (
                                    <Box sx={{ width: '100%', height: 300, mt: 2 }}>
                                        <ResponsiveContainer>
                                            <BarChart data={qData.data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis dataKey="name" />
                                                <YAxis allowDecimals={false} />
                                                <Tooltip 
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                                                />
                                                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </Box>
                                ) : (
                                    <Box sx={{ py: 4, textAlign: 'center' }}>
                                        <Typography variant="body2" color="text.secondary">
                                            {qData.type === 'TEXT_SHORT' || qData.type === 'TEXT_LONG' 
                                                ? '주관식 답변은 통계 차트를 제공하지 않습니다. 응답 목록에서 개별 확인이 가능합니다.' 
                                                : '지원되지 않는 문항 타입입니다.'}
                                        </Typography>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
}
