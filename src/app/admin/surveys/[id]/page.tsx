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
    Stack,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { 
    getSurveyAction, 
    listSurveyQuestionsAction, 
    createSurveyQuestionAction, 
    updateSurveyQuestionAction, 
    deleteSurveyQuestionAction,
    updateSurveyAction,
    listSurveySectionsAction,
    createSurveySectionAction,
    updateSurveySectionAction,
    deleteSurveySectionAction
} from '@/app/actions/data';

interface Section {
    id: string;
    title: string;
    description?: string | null;
    orderIdx: number;
}

interface Question {
    id: string;
    sectionId?: string | null;
    text: string;
    type: string;
    options?: string | null;
    logic?: string | null;
    orderIdx: number;
}

export default function SurveyQuestionEditorPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const surveyId = resolvedParams.id;

    const [survey, setSurvey] = useState<any | null>(null);
    const [sections, setSections] = useState<Section[]>([]);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Survey Editing State
    const [isSurveyEditOpen, setSurveyEditOpen] = useState(false);
    const [surveyTitle, setSurveyTitle] = useState('');
    const [surveyDesc, setSurveyDesc] = useState('');

    // Section Dialog State
    const [isSectionDialogOpen, setSectionDialogOpen] = useState(false);
    const [editingSection, setEditingSection] = useState<Section | null>(null);
    const [sTitle, setSTitle] = useState('');
    const [sDesc, setSDesc] = useState('');

    // Question Dialog state
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [qText, setQText] = useState('');
    const [qType, setQType] = useState('MULTIPLE_CHOICE');
    const [qOptions, setQOptions] = useState<string[]>([]);
    const [qSectionId, setQSectionId] = useState<string>('');
    const [qLogic, setQLogic] = useState('');
    const [logicQuestionId, setLogicQuestionId] = useState('');
    const [logicValue, setLogicValue] = useState('');

    useEffect(() => {
        if (logicQuestionId) {
            const newLogic = JSON.stringify({
                showIf: {
                    questionId: logicQuestionId,
                    value: logicValue
                }
            });
            // Only update if actually different to avoid redundant re-renders
            if (qLogic !== newLogic) {
                setQLogic(newLogic);
            }
        } else if (logicQuestionId === '' && qLogic.includes('showIf')) {
            // Only clear if it was previously a showIf logic
            setQLogic('');
        }
    }, [logicQuestionId, logicValue]);
    const [submitting, setSubmitting] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [surveyRes, sectionsRes, questionsRes] = await Promise.all([
                getSurveyAction({ id: surveyId }),
                listSurveySectionsAction(surveyId),
                listSurveyQuestionsAction(surveyId)
            ]);

            if (surveyRes.success && surveyRes.data) {
                setSurvey(surveyRes.data);
                setSurveyTitle(surveyRes.data.title);
                setSurveyDesc(surveyRes.data.description || '');
            }
            if (sectionsRes.success) {
                console.log('Fetched sections:', sectionsRes.data);
                setSections(sectionsRes.data as any);
            }
            if (questionsRes.success) {
                console.log('Fetched questions:', questionsRes.data);
                setQuestions(questionsRes.data as any);
            }
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
            setQSectionId(q.sectionId || '');
            setQLogic(q.logic || '');
            
            // Parse logic for builder
            if (q.logic) {
                try {
                    const parsed = JSON.parse(q.logic);
                    if (parsed.showIf) {
                        setLogicQuestionId(parsed.showIf.questionId || '');
                        setLogicValue(parsed.showIf.value || '');
                    } else {
                        setLogicQuestionId('');
                        setLogicValue('');
                    }
                } catch (e) {
                    setLogicQuestionId('');
                    setLogicValue('');
                }
            } else {
                setLogicQuestionId('');
                setLogicValue('');
            }
        } else {
            setEditingQuestion(null);
            setQText('');
            setQType('MULTIPLE_CHOICE');
            setQOptions(['']); 
            setQSectionId('');
            setQLogic('');
            setLogicQuestionId('');
            setLogicValue('');
        }
        setDialogOpen(true);
    };

    const handleOpenSectionDialog = (s: Section | null = null) => {
        if (s) {
            setEditingSection(s);
            setSTitle(s.title);
            setSDesc(s.description || '');
        } else {
            setEditingSection(null);
            setSTitle('');
            setSDesc('');
        }
        setSectionDialogOpen(true);
    };

    const handleSaveSurveyInfo = async () => {
        if (!surveyTitle.trim()) {
            setMsg({ type: 'error', text: '설문 제목을 입력해주세요.' });
            return;
        }
        setSubmitting(true);
        try {
            const res = await updateSurveyAction({
                id: surveyId,
                title: surveyTitle,
                description: surveyDesc,
                isActive: survey?.isActive ?? true // Preserve current state
            });
            if (res.success) {
                setMsg({ type: 'success', text: '설문 정보가 수정되었습니다.' });
                setSurveyEditOpen(false);
                fetchData();
            } else {
                console.error('Update survey failed:', res.error);
                setMsg({ type: 'error', text: `수정 실패: ${res.error}` });
            }
        } catch (e) {
            console.error('handleSaveSurveyInfo catch error:', e);
            setMsg({ type: 'error', text: '예상치 못한 오류가 발생했습니다.' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleSaveSection = async () => {
        if (!sTitle.trim()) return;
        setSubmitting(true);
        try {
            if (editingSection) {
                const res = await updateSurveySectionAction({
                    surveyId,
                    id: editingSection.id,
                    title: sTitle.trim(),
                    description: sDesc.trim() || undefined
                });
                if (res.success) setMsg({ type: 'success', text: '섹션이 수정되었습니다.' });
            } else {
                const res = await createSurveySectionAction({
                    surveyId,
                    title: sTitle.trim(),
                    description: sDesc.trim() || undefined,
                    orderIdx: sections.length > 0 ? Math.max(...sections.map(s => s.orderIdx)) + 1 : 1
                });
                if (res.success) {
                    setMsg({ type: 'success', text: '새 섹션이 추가되었습니다.' });
                    setSectionDialogOpen(false);
                    fetchData();
                } else {
                    setMsg({ type: 'error', text: `섹션 추가 실패: ${res.error}` });
                }
            }
        } catch (e) {
            setMsg({ type: 'error', text: '오류가 발생했습니다.' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteSection = async (id: string) => {
        if (!window.confirm('이 섹션을 삭제하시겠습니까? 섹션 내 문항들의 섹션 지정이 해제됩니다.')) return;
        setSubmitting(true);
        try {
            const res = await deleteSurveySectionAction(id, surveyId);
            if (res.success) {
                setMsg({ type: 'success', text: '섹션이 삭제되었습니다.' });
                fetchData();
            } else {
                setMsg({ type: 'error', text: `섹션 삭제 실패: ${res.error}` });
            }
        } catch (e) { } finally { setSubmitting(false); }
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
                    surveyId,
                    id: editingQuestion.id,
                    sectionId: qSectionId || null,
                    text: qText.trim(),
                    type: qType,
                    options: filteredOptions || undefined,
                    logic: qLogic || null
                });
                if (res.success) {
                    setMsg({ type: 'success', text: '문항이 수정되었습니다.' });
                    setDialogOpen(false);
                    fetchData();
                } else {
                    setMsg({ type: 'error', text: res.error || '문항 수정 실패' });
                }
            } else {
                const res = await createSurveyQuestionAction({
                    surveyId,
                    sectionId: qSectionId || undefined,
                    text: qText.trim(),
                    type: qType,
                    options: filteredOptions || undefined,
                    logic: qLogic || undefined,
                    orderIdx: questions.length > 0 ? Math.max(...questions.map(q => q.orderIdx)) + 1 : 1
                });
                if (res.success) {
                    setMsg({ type: 'success', text: '새 문항이 추가되었습니다.' });
                    setDialogOpen(false);
                    fetchData();
                } else {
                    setMsg({ type: 'error', text: res.error || '문항 추가 실패' });
                }
            }
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
            const res = await deleteSurveyQuestionAction(id, surveyId);
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
        <>
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
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h4" component="h1" fontWeight="bold" color="secondary">
                            {survey?.title || '설문조사'} 문항 편집
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            {survey?.description}
                        </Typography>
                    </Box>
                    <Button 
                        variant="outlined" 
                        color="secondary" 
                        startIcon={<EditIcon />}
                        onClick={(e) => { e.currentTarget.blur(); setSurveyEditOpen(true); }}
                    >
                        설문 정보 수정
                    </Button>
                </Box>

                {msg && (
                    <Alert severity={msg.type} sx={{ mb: 3 }} onClose={() => setMsg(null)}>
                        {msg.text}
                    </Alert>
                )}

                <Paper sx={{ p: 4, mb: 4, borderRadius: 3, border: '1px solid #e1bee7' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6" fontWeight="bold">섹션 관리</Typography>
                        <Button 
                            variant="contained" 
                            color="primary" 
                            startIcon={<AddIcon />}
                            onClick={(e) => { e.currentTarget.blur(); handleOpenSectionDialog(); }}
                        >
                            섹션 추가
                        </Button>
                    </Box>
                    <List>
                        {sections.length === 0 ? (
                            <Typography variant="body2" color="text.secondary" align="center">등록된 섹션이 없습니다.</Typography>
                        ) : (
                            sections.map((s, idx) => (
                                <ListItem key={s.id} divider secondaryAction={
                                    <Stack direction="row" spacing={1}>
                                        <IconButton size="small" onClick={(e) => { e.currentTarget.blur(); handleOpenSectionDialog(s); }}><EditIcon fontSize="small" color="primary" /></IconButton>
                                        <IconButton size="small" onClick={() => handleDeleteSection(s.id)}><DeleteIcon fontSize="small" color="error" /></IconButton>
                                    </Stack>
                                }>
                                    <ListItemText primary={`${idx + 1}. ${s.title}`} secondary={s.description} />
                                </ListItem>
                            ))
                        )}
                    </List>
                </Paper>

                <Paper sx={{ p: 4, mb: 4, borderRadius: 3, border: '1px solid #e1bee7' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6" fontWeight="bold">문항 목록</Typography>
                        <Button 
                            variant="contained" 
                            color="secondary" 
                            startIcon={<AddIcon />}
                            onClick={(e) => { e.currentTarget.blur(); handleOpenDialog(); }}
                            disabled={submitting}
                        >
                            문항 추가
                        </Button>
                    </Box>

                    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                        {questions.length === 0 ? (
                            <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
                                등록된 문항이 없습니다.
                            </Typography>
                        ) : (
                            // Group questions by section
                            [...sections, { id: '', title: '섹션 없음' }].map((section) => {
                                const sectionQuestions = questions.filter(q => (q.sectionId || '') === section.id);
                                if (sectionQuestions.length === 0 && section.id !== '') return null;
                                
                                return (
                                    <Box key={section.id || 'none'} sx={{ mb: 4 }}>
                                        <Typography variant="subtitle1" fontWeight="bold" color="secondary" sx={{ bgcolor: '#f3e5f5', p: 1, borderRadius: 1, mb: 1 }}>
                                            {section.title}
                                        </Typography>
                                        {sectionQuestions.map((q, idx) => (
                                            <Box key={q.id}>
                                                <ListItem 
                                                    alignItems="flex-start"
                                                    sx={{ borderRadius: 2, mb: 1, '&:hover': { bgcolor: '#f5f5f5' } }}
                                                    secondaryAction={
                                                        <Stack direction="row" spacing={1}>
                                                            <IconButton edge="end" onClick={(e) => { e.currentTarget.blur(); handleOpenDialog(q); }}><EditIcon color="primary" /></IconButton>
                                                            <IconButton edge="end" onClick={() => handleDeleteQuestion(q.id)}><DeleteIcon color="error" /></IconButton>
                                                        </Stack>
                                                    }
                                                >
                                                    <ListItemText
                                                        primary={
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <Typography variant="subtitle1" fontWeight="bold">{idx + 1}. {q.text}</Typography>
                                                                <Chip label={q.type === 'MULTIPLE_CHOICE' ? '객관식' : '주관식'} size="small" variant="outlined" />
                                                                {q.logic && <Chip label="분기 로직 있음" size="small" color="warning" variant="filled" />}
                                                            </Box>
                                                        }
                                                        secondary={
                                                            <Box>
                                                                {q.type === 'MULTIPLE_CHOICE' && q.options && (
                                                                    <Box sx={{ mt: 1, pl: 2 }}>
                                                                        {JSON.parse(q.options).map((opt: string, i: number) => (
                                                                            <Typography key={i} variant="body2" color="text.secondary">○ {opt}</Typography>
                                                                        ))}
                                                                    </Box>
                                                                )}
                                                                {q.logic && (
                                                                    <Typography variant="caption" display="block" color="warning.main" sx={{ mt: 1, fontFamily: 'monospace' }}>
                                                                        Logic: {q.logic}
                                                                    </Typography>
                                                                )}
                                                            </Box>
                                                        }
                                                    />
                                                </ListItem>
                                                <Divider component="li" />
                                            </Box>
                                        ))}
                                    </Box>
                                );
                            })
                        )}
                    </List>
                </Paper>
            </Container>

            {/* 설문 정보 수정 다이얼로그 */}
            <Dialog open={isSurveyEditOpen} onClose={() => !submitting && setSurveyEditOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle fontWeight="bold">설문 정보 수정</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField autoFocus label="제목" fullWidth value={surveyTitle} onChange={(e) => setSurveyTitle(e.target.value)} />
                        <TextField label="설명" fullWidth multiline rows={4} value={surveyDesc} onChange={(e) => setSurveyDesc(e.target.value)} />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setSurveyEditOpen(false)}>취소</Button>
                    <Button onClick={handleSaveSurveyInfo} variant="contained" color="secondary" disabled={submitting}>저장</Button>
                </DialogActions>
            </Dialog>

            {/* 섹션 추가/수정 다이얼로그 */}
            <Dialog open={isSectionDialogOpen} onClose={() => !submitting && setSectionDialogOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle fontWeight="bold">{editingSection ? '섹션 수정' : '새 섹션 추가'}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField autoFocus label="섹션 제목" fullWidth value={sTitle} onChange={(e) => setSTitle(e.target.value)} />
                        <TextField label="섹션 설명 (선택)" fullWidth value={sDesc} onChange={(e) => setSDesc(e.target.value)} />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setSectionDialogOpen(false)}>취소</Button>
                    <Button onClick={handleSaveSection} variant="contained" color="primary" disabled={submitting}>저장</Button>
                </DialogActions>
            </Dialog>

            {/* 문항 추가/수정 다이얼로그 */}
            <Dialog open={isDialogOpen} onClose={() => !submitting && setDialogOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle fontWeight="bold">
                    {editingQuestion ? '문항 수정' : '새 문항 추가'}
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <FormControl fullWidth>
                            <InputLabel id="q-section-label">섹션 선택</InputLabel>
                            <Select
                                labelId="q-section-label"
                                value={qSectionId}
                                label="섹션 선택"
                                onChange={(e) => setQSectionId(e.target.value as string)}
                            >
                                <MenuItem value="">섹션 없음</MenuItem>
                                {sections.map(s => <MenuItem key={s.id} value={s.id}>{s.title}</MenuItem>)}
                            </Select>
                        </FormControl>

                        <TextField
                            autoFocus
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

                        <Box sx={{ mt: 1, p: 2, bgcolor: 'rgba(0,0,0,0.03)', borderRadius: 2 }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="secondary">
                                🔀 조건부 노출 (분기 로직)
                            </Typography>
                            <Stack spacing={2}>
                                <FormControl fullWidth size="small">
                                    <InputLabel id="logic-q-label">기준 질문 선택</InputLabel>
                                    <Select
                                        labelId="logic-q-label"
                                        value={logicQuestionId}
                                        label="기준 질문 선택"
                                        onChange={(e) => {
                                            setLogicQuestionId(e.target.value as string);
                                            setLogicValue(''); // Reset value when question changes
                                        }}
                                    >
                                        <MenuItem value="">사용 안 함</MenuItem>
                                        {questions
                                            .filter(oq => oq.id !== editingQuestion?.id)
                                            .map(oq => (
                                                <MenuItem key={oq.id} value={oq.id}>
                                                    {oq.text.length > 30 ? oq.text.substring(0, 30) + '...' : oq.text}
                                                </MenuItem>
                                            ))
                                        }
                                    </Select>
                                </FormControl>

                                {logicQuestionId && (
                                    <>
                                        {(() => {
                                            const sourceQ = questions.find(q => q.id === logicQuestionId);
                                            if (sourceQ?.type === 'MULTIPLE_CHOICE') {
                                                const opts = sourceQ.options ? JSON.parse(sourceQ.options) : [];
                                                return (
                                                    <FormControl fullWidth size="small">
                                                        <InputLabel id="logic-v-label">선택될 답변 값</InputLabel>
                                                        <Select
                                                            labelId="logic-v-label"
                                                            value={logicValue}
                                                            label="선택될 답변 값"
                                                            onChange={(e) => setLogicValue(e.target.value as string)}
                                                        >
                                                            {opts.map((opt: string, i: number) => (
                                                                <MenuItem key={i} value={opt}>{opt}</MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                );
                                            } else {
                                                return (
                                                    <TextField
                                                        fullWidth
                                                        size="small"
                                                        label="입력될 답변 값 (정확히 일치해야 함)"
                                                        value={logicValue}
                                                        onChange={(e) => setLogicValue(e.target.value)}
                                                    />
                                                );
                                            }
                                        })()}
                                        <Typography variant="caption" color="text.secondary">
                                            위 질문에서 해당 답변이 선택된 경우에만 이 문항이 노출됩니다.
                                        </Typography>
                                    </>
                                )}
                            </Stack>
                        </Box>

                        <Accordion elevation={0} sx={{ '&:before': { display: 'none' }, border: '1px solid rgba(0,0,0,0.1)', borderRadius: 1 }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="caption" color="text.secondary">고급 설정 (JSON 상세 로직)</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <TextField
                                    label="로직 코드"
                                    fullWidth
                                    variant="outlined"
                                    multiline
                                    rows={2}
                                    value={qLogic}
                                    onChange={(e) => setQLogic(e.target.value)}
                                    helperText="비주얼 빌더 사용 시 자동으로 생성되지만, 직접 수정도 가능합니다."
                                    sx={{ mt: 1 }}
                                />
                            </AccordionDetails>
                        </Accordion>
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
        </>
    );
}
