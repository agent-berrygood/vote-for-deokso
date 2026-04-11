'use client';

import { useState, useEffect, useMemo } from 'react';
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
    Checkbox,
    Select,
    MenuItem,
    FormControl,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Alert,
    LinearProgress,
    Divider,
    Stack
} from '@mui/material';
import { useElection } from '@/hooks/useElection';
import { getSurveyAction, listSurveySectionsAction, listSurveyQuestionsAction, submitSurveyResponseAction } from '@/app/actions/data';

interface Question {
    id: string;
    sectionId?: string | null;
    text: string;
    type: string;
    options?: string | null;
    maxChoices?: number | null;
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
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [submitted, setSubmitted] = useState(false);
    const [currentSectionId, setCurrentSectionId] = useState<string | null>(null);

    const [memberName, setMemberName] = useState('');
    const [memberId, setMemberId] = useState('');

    // Visibility Helper
    const isQuestionVisible = (q: Question) => {
        if (!q.logic) return true;
        try {
            const logic = JSON.parse(q.logic);
            if (logic.showIf) {
                const { questionId, value } = logic.showIf;
                return answers[questionId] === value;
            }
        } catch (e) {}
        return true;
    };

    // Calculate valid rendering groups (sections with at least one VISIBLE question)
    const renderGroups = useMemo(() => {
        const initialGroups = [
            ...(questions.filter(q => !sections.some(s => s.id === q.sectionId)).length > 0 
                ? [{ id: 'none', title: '기본 정보', description: '기본적인 설문 문항입니다.' }] 
                : []),
            ...sections
        ];

        return initialGroups.filter(section => {
            const sectionQuestions = questions.filter(q => 
                section.id === 'none' 
                    ? !sections.some(s => s.id === q.sectionId)
                    : q.sectionId === section.id
            );
            // Dynamic check: Has at least one question visible under current answers
            return sectionQuestions.some(q => isQuestionVisible(q));
        });
    }, [questions, sections, answers]);

    // Set initial section and handle dynamic visibility changes
    useEffect(() => {
        if (renderGroups.length > 0 && !currentSectionId) {
            setCurrentSectionId(renderGroups[0].id);
        } else if (currentSectionId && !renderGroups.some(g => g.id === currentSectionId)) {
            setCurrentSectionId(renderGroups[0]?.id || null);
        }
    }, [renderGroups, currentSectionId]);

    const currentPageIdx = useMemo(() => {
        const idx = renderGroups.findIndex(g => g.id === currentSectionId);
        return idx === -1 ? 0 : idx;
    }, [renderGroups, currentSectionId]);

    useEffect(() => {
        const name = sessionStorage.getItem('memberName');
        const id = sessionStorage.getItem('memberId');
        if (!name || !id) {
            router.push('/');
            return;
        }
        setMemberName(name);
        setMemberId(id);
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
        
        if (!activeSurveyId || !memberId) {
            setError('제출을 위한 정보가 부족합니다. 다시 로그인해 주세요.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Check if all required questions are answered (optional, but good for UX)
            // For now, we'll just submit whatever we have.

            const res = await submitSurveyResponseAction({
                surveyId: activeSurveyId,
                memberId: memberId,
                answers: JSON.stringify(answers)
            });

            if (res.success) {
                setSubmitted(true);
            } else {
                setError(res.error || '제출 중 오류가 발생했습니다.');
            }
        } catch (e) {
            console.error('Submit error:', e);
            setError('제출 중 오류가 발생했습니다.');
        } finally {
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
                        <Typography variant="body2" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                            {survey.description}
                        </Typography>
                        
                        {/* Progress Bar */}
                        <Box sx={{ width: '100%', mb: 4 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="caption" color="text.secondary">
                                    진행률: {renderGroups.length > 0 ? Math.round(((currentPageIdx + 1) / renderGroups.length) * 100) : 0}%
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {currentPageIdx + 1} / {renderGroups.length} 페이지
                                </Typography>
                            </Box>
                            <LinearProgress 
                                variant="determinate" 
                                value={renderGroups.length > 0 ? ((currentPageIdx + 1) / renderGroups.length) * 100 : 0} 
                                color="secondary"
                                sx={{ height: 8, borderRadius: 4 }}
                            />
                        </Box>

                        <Divider sx={{ my: 3 }} />

                        {/* Dynamic Questions by Section (Paged) */}
                        {(() => {
                            const section = renderGroups[currentPageIdx];
                            if (!section) return (
                                <Box sx={{ py: 4, textAlign: 'center' }}>
                                    <Typography color="text.secondary">표시할 문항이 없습니다.</Typography>
                                </Box>
                            );

                            const sectionQuestions = questions.filter(q => 
                                section.id === 'none' 
                                    ? !sections.some(s => s.id === q.sectionId)
                                    : q.sectionId === section.id
                            );

                            return (
                                <Box key={section.id} sx={{ mb: 2 }}>
                                    {section.title && (
                                        <Box sx={{ mb: 3 }}>
                                            <Typography variant="h5" fontWeight="bold" color="secondary">
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

                                    {sectionQuestions.map((q) => {
                                        // Branching Logic check
                                        if (!isQuestionVisible(q)) return null;

                                        return (
                                            <Box key={q.id} sx={{ mb: 4 }}>
                                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                                    {q.text}
                                                </Typography>
                                                
                                                {(() => {
                                                    const options = q.options ? JSON.parse(q.options) : null;
                                                    
                                                    switch (q.type) {
                                                        case 'MULTIPLE_CHOICE':
                                                            return (
                                                                <RadioGroup 
                                                                    value={answers[q.id] || ''} 
                                                                    onChange={(e) => setAnswers({...answers, [q.id]: e.target.value})}
                                                                >
                                                                    {(options || []).map((opt: string, i: number) => (
                                                                        <FormControlLabel key={i} value={opt} control={<Radio color="secondary" />} label={opt} />
                                                                    ))}
                                                                </RadioGroup>
                                                            );
                                                        
                                                        case 'MULTIPLE_SELECT':
                                                            const currentAnswers = Array.isArray(answers[q.id]) ? answers[q.id] : [];
                                                            const maxReached = currentAnswers.length >= (q.maxChoices || 1);
                                                            return (
                                                                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                                                    {(options || []).map((opt: string, i: number) => {
                                                                        const isChecked = currentAnswers.includes(opt);
                                                                        return (
                                                                            <FormControlLabel 
                                                                                key={i} 
                                                                                control={
                                                                                    <Checkbox 
                                                                                        color="secondary"
                                                                                        checked={isChecked}
                                                                                        disabled={!isChecked && maxReached}
                                                                                        onChange={(e) => {
                                                                                            let newAnswers;
                                                                                            if (e.target.checked) {
                                                                                                newAnswers = [...currentAnswers, opt];
                                                                                            } else {
                                                                                                newAnswers = currentAnswers.filter((a: string) => a !== opt);
                                                                                            }
                                                                                            setAnswers({...answers, [q.id]: newAnswers});
                                                                                        }}
                                                                                    />
                                                                                } 
                                                                                label={opt} 
                                                                            />
                                                                        );
                                                                    })}
                                                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                                                                        * 최대 {q.maxChoices || 1}개까지 선택 가능합니다.
                                                                    </Typography>
                                                                </Box>
                                                            );

                                                        case 'DROPDOWN':
                                                            return (
                                                                <FormControl fullWidth>
                                                                    <Select
                                                                        value={answers[q.id] || ''}
                                                                        onChange={(e) => setAnswers({...answers, [q.id]: e.target.value})}
                                                                        displayEmpty
                                                                    >
                                                                        <MenuItem value="" disabled>선택해 주세요</MenuItem>
                                                                        {(options || []).map((opt: string, i: number) => (
                                                                            <MenuItem key={i} value={opt}>{opt}</MenuItem>
                                                                        ))}
                                                                    </Select>
                                                                </FormControl>
                                                            );

                                                        case 'SCALE':
                                                            const scale = options || { min: 1, max: 5 };
                                                            const scaleItems = [];
                                                            for (let i = scale.min; i <= scale.max; i++) scaleItems.push(i);
                                                            return (
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                                                                    {scale.minLabel && <Typography variant="body2" color="text.secondary">{scale.minLabel}</Typography>}
                                                                    <RadioGroup 
                                                                        row 
                                                                        value={answers[q.id]?.toString() || ''}
                                                                        onChange={(e) => setAnswers({...answers, [q.id]: e.target.value})}
                                                                    >
                                                                        {scaleItems.map(val => (
                                                                            <FormControlLabel 
                                                                                key={val} 
                                                                                value={val.toString()} 
                                                                                control={<Radio color="secondary" />} 
                                                                                label={val.toString()}
                                                                                labelPlacement="bottom"
                                                                            />
                                                                        ))}
                                                                    </RadioGroup>
                                                                    {scale.maxLabel && <Typography variant="body2" color="text.secondary">{scale.maxLabel}</Typography>}
                                                                </Box>
                                                            );

                                                        case 'GRID_CHOICE':
                                                        case 'GRID_CHECK':
                                                            const gridOptions = options || { rows: [], columns: [] };
                                                            const columns = gridOptions.columns || [];
                                                            const rows = gridOptions.rows || [];
                                                            return (
                                                                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                                                                    <Table size="small">
                                                                        <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                                                                            <TableRow>
                                                                                <TableCell />
                                                                                {columns.map((col: string, i: number) => (
                                                                                    <TableCell key={i} align="center" sx={{ fontWeight: 'bold' }}>{col}</TableCell>
                                                                                ))}
                                                                            </TableRow>
                                                                        </TableHead>
                                                                        <TableBody>
                                                                            {rows.map((row: string, i: number) => (
                                                                                <TableRow key={i}>
                                                                                    <TableCell sx={{ fontWeight: 'bold' }}>{row}</TableCell>
                                                                                    {columns.map((col: string, j: number) => {
                                                                                        const gridAnswers = answers[q.id] || {};
                                                                                        const isChecked = q.type === 'GRID_CHOICE' 
                                                                                            ? gridAnswers[row] === col
                                                                                            : Array.isArray(gridAnswers[row]) && gridAnswers[row].includes(col);
                                                                                        
                                                                                        return (
                                                                                            <TableCell key={j} align="center">
                                                                                                {q.type === 'GRID_CHOICE' ? (
                                                                                                    <Radio 
                                                                                                        size="small"
                                                                                                        color="secondary"
                                                                                                        checked={isChecked}
                                                                                                        onChange={() => setAnswers({
                                                                                                            ...answers, 
                                                                                                            [q.id]: { ...gridAnswers, [row]: col }
                                                                                                        })}
                                                                                                    />
                                                                                                ) : (
                                                                                                    <Checkbox 
                                                                                                        size="small"
                                                                                                        color="secondary"
                                                                                                        checked={isChecked}
                                                                                                        onChange={(e) => {
                                                                                                            const rowAnswers = Array.isArray(gridAnswers[row]) ? gridAnswers[row] : [];
                                                                                                            const newRowAnswers = e.target.checked 
                                                                                                                ? [...rowAnswers, col]
                                                                                                                : rowAnswers.filter((a: string) => a !== col);
                                                                                                            setAnswers({
                                                                                                                ...answers,
                                                                                                                [q.id]: { ...gridAnswers, [row]: newRowAnswers }
                                                                                                            });
                                                                                                        }}
                                                                                                    />
                                                                                                )}
                                                                                            </TableCell>
                                                                                        );
                                                                                    })}
                                                                                </TableRow>
                                                                            ))}
                                                                        </TableBody>
                                                                    </Table>
                                                                </TableContainer>
                                                            );

                                                        default:
                                                            return (
                                                                <TextField
                                                                    fullWidth
                                                                    multiline={q.type === 'TEXT_LONG'}
                                                                    rows={q.type === 'TEXT_LONG' ? 4 : 1}
                                                                    type={q.type === 'DATE' ? 'date' : q.type === 'TIME' ? 'time' : 'text'}
                                                                    placeholder={q.type === 'DATE' ? '' : q.type === 'TIME' ? '' : "응답을 입력하세요..."}
                                                                    variant="outlined"
                                                                    value={answers[q.id] || ''}
                                                                    onChange={(e) => setAnswers({...answers, [q.id]: e.target.value})}
                                                                    InputLabelProps={{ shrink: true }}
                                                                />
                                                            );
                                                    }
                                                })()}
                                            </Box>
                                        );
                                    })}
                                </Box>
                            );
                        })()}
                    </Paper>

                    <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
                        {currentPageIdx > 0 && (
                            <Button 
                                variant="outlined" 
                                color="secondary" 
                                fullWidth 
                                size="large"
                                onClick={() => {
                                    const prevIdx = currentPageIdx - 1;
                                    if (prevIdx >= 0) {
                                        setCurrentSectionId(renderGroups[prevIdx].id);
                                        window.scrollTo(0, 0);
                                    }
                                }}
                                sx={{ py: 1.5, borderRadius: 2, fontWeight: 'bold' }}
                            >
                                이전
                            </Button>
                        )}
                        
                        {(() => {
                            const totalPages = renderGroups.length;
                            
                            if (currentPageIdx < totalPages - 1) {
                                return (
                                    <Button 
                                        variant="contained" 
                                        color="secondary" 
                                        fullWidth 
                                        size="large"
                                        onClick={() => {
                                            const nextIdx = currentPageIdx + 1;
                                            if (nextIdx < totalPages) {
                                                setCurrentSectionId(renderGroups[nextIdx].id);
                                                window.scrollTo(0, 0);
                                            }
                                        }}
                                        sx={{ py: 1.5, borderRadius: 2, fontWeight: 'bold' }}
                                    >
                                        다음
                                    </Button>
                                );
                            } else {
                                return (
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
                                );
                            }
                        })()}
                    </Stack>
                </form>
            )}
        </Container>
    );
}
