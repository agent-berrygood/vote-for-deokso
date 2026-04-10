'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
    Box, 
    Container, 
    Typography, 
    Paper, 
    Button, 
    TextField, 
    RadioGroup, 
    FormControlLabel, 
    Radio, 
    CircularProgress,
    Alert,
    LinearProgress,
    Divider
} from '@mui/material';
import { useElection } from '@/hooks/useElection';
import { getSurveyAction, listSurveySectionsAction, listSurveyQuestionsAction } from '@/app/actions/data';

interface Question {
    id: string;
    sectionId?: string | null;
    text: string;
    type: string;
    options?: string | null;
    logic?: string | null;
    orderIdx: number;
}

interface Section {
    id: string;
    title: string;
    description?: string | null;
    orderIdx: number;
}

export default function SurveyPage() {
    const router = useRouter();
    const { activeSurveyId, loading: sysLoading } = useElection();
    
    const [survey, setSurvey] = useState<any>(null);
    const [sections, setSections] = useState<Section[]>([]);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [submitted, setSubmitted] = useState(false);

    const [memberName, setMemberName] = useState('');

    useEffect(() => {
        const name = sessionStorage.getItem('memberName');
        if (!name) {
            router.push('/');
            return;
        }
        setMemberName(name);
    }, [router]);

    useEffect(() => {
        if (sysLoading) return;
        if (!activeSurveyId) {
            setError('진행 중인 설문조사가 없습니다.');
            setLoading(false);
            return;
        }

        const fetchSurvey = async () => {
            try {
                const [surveyRes, sectionsRes, questionsRes] = await Promise.all([
                    getSurveyAction({ id: activeSurveyId }),
                    listSurveySectionsAction(activeSurveyId),
                    listSurveyQuestionsAction(activeSurveyId)
                ]);

                if (surveyRes.success) setSurvey(surveyRes.data);
                if (sectionsRes.success) setSections(sectionsRes.data as any);
                if (questionsRes.success) setQuestions(questionsRes.data as any);
                
                if (!surveyRes.success) {
                    setError(surveyRes.error || '설문 정보를 불러오지 못했습니다.');
                }
            } catch (e) {
                setError('오류가 발생했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchSurvey();
    }, [activeSurveyId, sysLoading]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // [TODO] SubmitSurveyResponse action integration
            // 현재는 UI 데모를 위해 성공 처리
            setTimeout(() => {
                setSubmitted(true);
                setLoading(false);
            }, 1000);
        } catch (e) {
            setError('제출 중 오류가 발생했습니다.');
            setLoading(false);
        }
    };

    if (sysLoading || (loading && !survey)) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
                <CircularProgress color="secondary" />
                <Typography sx={{ mt: 2 }}>설문지를 불러오고 있습니다...</Typography>
            </Box>
        );
    }

    if (submitted) {
        return (
            <Container maxWidth="xs" sx={{ py: 8 }}>
                <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 4 }}>
                    <Typography variant="h4" sx={{ mb: 2 }}>🙏</Typography>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>응답이 제출되었습니다</Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                        소중한 고견을 주셔서 감사합니다.<br />
                        주신 의견은 교회 발전을 위해 <br />귀하게 사용하겠습니다.
                    </Typography>
                    <Button variant="contained" color="secondary" fullWidth onClick={() => router.push('/')}>
                        닫기
                    </Button>
                </Paper>
            </Container>
        );
    }

    return (
        <Container maxWidth="sm" sx={{ py: 4 }}>
            <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold" color="secondary" gutterBottom>
                    📋 교회 설문조사
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    {memberName} 성도님, 평안하신지요?<br />
                    아래 설문에 응답해 주시면 큰 도움이 되겠습니다.
                </Typography>
            </Box>

            {error && <Alert severity="warning" sx={{ mb: 3 }}>{error}</Alert>}

            {survey && (
                <form onSubmit={handleSubmit}>
                    <Paper sx={{ p: 4, borderRadius: 3, mb: 3 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            {survey.title}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 3, whiteSpace: 'pre-wrap' }}>
                            {survey.description}
                        </Typography>
                        
                        <Divider sx={{ my: 3 }} />

                        {/* Dynamic Questions by Section */}
                        {(sections.length > 0 ? sections : [{ id: '', title: '', description: '' }]).map((section, sIdx) => {
                            const sectionQuestions = questions.filter(q => (q.sectionId || '') === section.id);
                            if (sectionQuestions.length === 0) return null;

                            return (
                                <Box key={section.id || 'none'} sx={{ mb: 6 }}>
                                    {section.title && (
                                        <Box sx={{ mb: 3 }}>
                                            <Typography variant="h6" fontWeight="bold" color="secondary">
                                                {section.title}
                                            </Typography>
                                            {section.description && (
                                                <Typography variant="body2" color="text.secondary">
                                                    {section.description}
                                                </Typography>
                                            )}
                                            <Divider sx={{ mt: 1 }} />
                                        </Box>
                                    )}

                                    {sectionQuestions.map((q, qIdx) => {
                                        // Branching Logic check
                                        if (q.logic) {
                                            try {
                                                const logic = JSON.parse(q.logic);
                                                if (logic.showIf) {
                                                    const { questionId, value } = logic.showIf;
                                                    if (answers[questionId] !== value) return null;
                                                }
                                            } catch (e) {}
                                        }

                                        return (
                                            <Box key={q.id} sx={{ mb: 4 }}>
                                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                                    {qIdx + 1}. {q.text}
                                                </Typography>
                                                
                                                {q.type === 'MULTIPLE_CHOICE' ? (
                                                    <RadioGroup 
                                                        value={answers[q.id] || ''} 
                                                        onChange={(e) => setAnswers({...answers, [q.id]: e.target.value})}
                                                    >
                                                        {q.options && JSON.parse(q.options).map((opt: string, i: number) => (
                                                            <FormControlLabel key={i} value={opt} control={<Radio color="secondary" />} label={opt} />
                                                        ))}
                                                    </RadioGroup>
                                                ) : (
                                                    <TextField
                                                        fullWidth
                                                        multiline
                                                        rows={3}
                                                        placeholder="응답을 입력하세요..."
                                                        variant="outlined"
                                                        value={answers[q.id] || ''}
                                                        onChange={(e) => setAnswers({...answers, [q.id]: e.target.value})}
                                                    />
                                                )}
                                            </Box>
                                        );
                                    })}
                                </Box>
                            );
                        })}
                    </Paper>

                    <Button 
                        type="submit" 
                        variant="contained" 
                        color="secondary" 
                        fullWidth 
                        size="large"
                        sx={{ py: 1.5, borderRadius: 2, fontSize: '1.1rem', fontWeight: 'bold' }}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : '설문 제출하기'}
                    </Button>
                </form>
            )}
        </Container>
    );
}
