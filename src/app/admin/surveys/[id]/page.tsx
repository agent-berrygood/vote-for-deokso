'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { 
    Box, 
    Container, 
    Typography, 
    Paper, 
    Button, 
    IconButton, 
    Breadcrumbs, 
    Link, 
    List, 
    ListItem, 
    ListItemText, 
    Divider, 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    TextField, 
    FormControl, 
    InputLabel, 
    Select, 
    MenuItem, 
    Chip, 
    CircularProgress, 
    Alert,
    Stack
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import { 
    getSurveyAction, 
    listSurveyQuestionsAction, 
    createSurveyQuestionAction, 
    updateSurveyQuestionAction, 
    deleteSurveyQuestionAction 
} from '@/app/actions/data';

interface Question {
    id: string;
    text: string;
    type: string;
    options?: string | null;
    orderIdx: number;
}

export default function SurveyQuestionEditorPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const surveyId = resolvedParams.id;

    const [survey, setSurvey] = useState<any | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Dialog state
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [qText, setQText] = useState('');
    const [qType, setQType] = useState('MULTIPLE_CHOICE');
    const [qOptions, setQOptions] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [surveyRes, questionsRes] = await Promise.all([
                getSurveyAction({ id: surveyId }),
                listSurveyQuestionsAction(surveyId)
            ]);

            if (surveyRes.success && surveyRes.data) setSurvey(surveyRes.data);
            if (questionsRes.success) setQuestions(questionsRes.data || []);
        } catch (e) {
            console.error(e);
            setMsg({ type: 'error', text: '데이터를 불러오는 중 오류가 발생했습니다.' });
        } finally {
            setLoading(false);
        }
    }, [surveyId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleOpenDialog = (q: Question | null = null) => {
        if (q) {
            setEditingQuestion(q);
            setQText(q.text);
            setQType(q.type);
            setQOptions(q.options ? JSON.parse(q.options) : []);
        } else {
            setEditingQuestion(null);
            setQText('');
            setQType('MULTIPLE_CHOICE');
            setQOptions(['']); 
        }
        setDialogOpen(true);
    };

    const handleAddOption = () => {
        setQOptions([...qOptions, '']);
    };

    const handleOptionChange = (index: number, value: string) => {
        const newOpts = [...qOptions];
        newOpts[index] = value;
        setQOptions(newOpts);
    };

    const handleRemoveOption = (index: number) => {
        setQOptions(qOptions.filter((_, i) => i !== index));
    };

    const handleSaveQuestion = async () => {
        if (!qText.trim()) return;
        
        const filteredOptions = qType === 'MULTIPLE_CHOICE' 
            ? JSON.stringify(qOptions.map(o => o.trim()).filter(o => o !== ''))
            : null;

        setSubmitting(true);
        try {
            if (editingQuestion) {
                const res = await updateSurveyQuestionAction({
                    id: editingQuestion.id,
                    text: qText.trim(),
                    type: qType,
                    options: filteredOptions || undefined
                });
                if (res.success) {
                    setMsg({ type: 'success', text: '문항이 수정되었습니다.' });
                } else {
                    setMsg({ type: 'error', text: res.error || '문항 수정 실패' });
                }
            } else {
                const res = await createSurveyQuestionAction({
                    surveyId,
                    text: qText.trim(),
                    type: qType,
                    options: filteredOptions || undefined,
                    orderIdx: questions.length > 0 ? Math.max(...questions.map(q => q.orderIdx)) + 1 : 1
                });
                if (res.success) {
                    setMsg({ type: 'success', text: '새 문항이 추가되었습니다.' });
                } else {
                    setMsg({ type: 'error', text: res.error || '문항 추가 실패' });
                }
            }
            setDialogOpen(false);
            fetchData();
        } catch (e) {
            console.error(e);
            setMsg({ type: 'error', text: '저장 중 오류가 발생했습니다.' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteQuestion = async (id: string) => {
        if (!window.confirm('이 문항을 삭제하시겠습니까?')) return;
        setSubmitting(true);
        try {
            const res = await deleteSurveyQuestionAction(id);
            if (res.success) {
                setMsg({ type: 'success', text: '문항이 삭제되었습니다.' });
                fetchData();
            } else {
                setMsg({ type: 'error', text: res.error || '문항 삭제 실패' });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading && !survey) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress color="secondary" />
            </Box>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                <Link underline="hover" color="inherit" href="/admin" onClick={(e) => { e.preventDefault(); router.push('/admin'); }} sx={{ cursor: 'pointer' }}>
                    어드민
                </Link>
                <Typography color="text.primary">설문 문항 관리</Typography>
            </Breadcrumbs>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                <IconButton onClick={() => router.push('/admin')}>
                    <ArrowBackIcon />
                </IconButton>
                <Box>
                    <Typography variant="h4" component="h1" fontWeight="bold" color="secondary">
                        {survey?.title || '설문조사'} 문항 편집
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        {survey?.description}
                    </Typography>
                </Box>
            </Box>

            {msg && (
                <Alert severity={msg.type} sx={{ mb: 3 }} onClose={() => setMsg(null)}>
                    {msg.text}
                </Alert>
            )}

            <Paper sx={{ p: 4, mb: 4, borderRadius: 3, border: '1px solid #e1bee7' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" fontWeight="bold">
                        총 {questions.length}개 문항
                    </Typography>
                    <Button 
                        variant="contained" 
                        color="secondary" 
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenDialog()}
                        disabled={submitting}
                    >
                        문항 추가
                    </Button>
                </Box>

                <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                    {questions.length === 0 ? (
                        <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
                            등록된 문항이 없습니다. 오른쪽 상단의 &apos;문항 추가&apos;를 눌러 시작하세요.
                        </Typography>
                    ) : (
                        questions.map((q, idx) => (
                            <Box key={q.id}>
                                <ListItem 
                                    alignItems="flex-start"
                                    sx={{ 
                                        borderRadius: 2, 
                                        mb: 1, 
                                        '&:hover': { bgcolor: '#f3e5f5' },
                                        transition: 'background-color 0.2s'
                                    }}
                                    secondaryAction={
                                        <Stack direction="row" spacing={1}>
                                            <IconButton edge="end" aria-label="edit" onClick={() => handleOpenDialog(q)}>
                                                <EditIcon color="primary" />
                                            </IconButton>
                                            <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteQuestion(q.id)}>
                                                <DeleteIcon color="error" />
                                            </IconButton>
                                        </Stack>
                                    }
                                >
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography variant="subtitle1" fontWeight="bold">
                                                    {idx + 1}. {q.text}
                                                </Typography>
                                                <Chip 
                                                    label={q.type === 'MULTIPLE_CHOICE' ? '객관식' : '주관식'} 
                                                    size="small" 
                                                    color={q.type === 'MULTIPLE_CHOICE' ? 'info' : 'success'}
                                                    variant="outlined"
                                                />
                                            </Box>
                                        }
                                        secondary={
                                            q.type === 'MULTIPLE_CHOICE' && q.options && (
                                                <Box sx={{ mt: 1, pl: 2 }}>
                                                    {JSON.parse(q.options).map((opt: string, i: number) => (
                                                        <Typography key={i} variant="body2" color="text.secondary">
                                                            ○ {opt}
                                                        </Typography>
                                                    ))}
                                                </Box>
                                            )
                                        }
                                    />
                                </ListItem>
                                {idx < questions.length - 1 && <Divider component="li" />}
                            </Box>
                        ))
                    )}
                </List>
            </Paper>

            {/* 문항 추가/수정 다이얼로그 */}
            <Dialog open={isDialogOpen} onClose={() => !submitting && setDialogOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle fontWeight="bold">
                    {editingQuestion ? '문항 수정' : '새 문항 추가'}
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <TextField
                            label="질문 내용"
                            fullWidth
                            variant="outlined"
                            multiline
                            rows={2}
                            value={qText}
                            onChange={(e) => setQText(e.target.value)}
                            required
                        />

                        <FormControl fullWidth>
                            <InputLabel id="q-type-label">문항 타입</InputLabel>
                            <Select
                                labelId="q-type-label"
                                value={qType}
                                label="문항 타입"
                                onChange={(e) => setQType(e.target.value as string)}
                            >
                                <MenuItem value="MULTIPLE_CHOICE">객관식 (선택형)</MenuItem>
                                <MenuItem value="TEXT">주관식 (서술형)</MenuItem>
                            </Select>
                        </FormControl>

                        {qType === 'MULTIPLE_CHOICE' && (
                            <Box>
                                <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                                    보기 설정
                                </Typography>
                                <Stack spacing={1}>
                                    {qOptions.map((opt, index) => (
                                        <Box key={index} sx={{ display: 'flex', gap: 1 }}>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                placeholder={`보기 ${index + 1}`}
                                                value={opt}
                                                onChange={(e) => handleOptionChange(index, e.target.value)}
                                            />
                                            <IconButton 
                                                size="small" 
                                                color="error" 
                                                onClick={() => handleRemoveOption(index)}
                                                disabled={qOptions.length <= 1}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    ))}
                                    <Button 
                                        variant="outlined" 
                                        size="small" 
                                        startIcon={<AddIcon />} 
                                        onClick={handleAddOption}
                                        sx={{ alignSelf: 'flex-start', mt: 1 }}
                                    >
                                        보기 추가
                                    </Button>
                                </Stack>
                            </Box>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setDialogOpen(false)} disabled={submitting}>취소</Button>
                    <Button 
                        onClick={handleSaveQuestion} 
                        variant="contained" 
                        color="secondary"
                        startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                        disabled={submitting || !qText.trim() || (qType === 'MULTIPLE_CHOICE' && qOptions.every(o => !o.trim()))}
                    >
                        저장하기
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
