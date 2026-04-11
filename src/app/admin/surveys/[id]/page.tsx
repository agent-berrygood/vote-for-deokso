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
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import SaveIcon from '@mui/icons-material/Save';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
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
    deleteSurveySectionAction,
    listSurveyResponsesAction,
    getSurveyResponseByNamePhoneAction,
    deleteSurveyResponseAction
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
    maxChoices?: number | null;
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
    const [qMaxChoices, setQMaxChoices] = useState<number>(1);
    
    // Scale settings
    const [scaleMin, setScaleMin] = useState(1);
    const [scaleMax, setScaleMax] = useState(5);
    const [scaleMinLabel, setScaleMinLabel] = useState('');
    const [scaleMaxLabel, setScaleMaxLabel] = useState('');
    
    // Grid settings
    const [gridRows, setGridRows] = useState<string[]>(['']);
    const [gridCols, setGridCols] = useState<string[]>(['']);

    const [logicQuestionId, setLogicQuestionId] = useState('');
    const [logicValue, setLogicValue] = useState('');

    // 응답 관리 상태
    const [responses, setResponses] = useState<any[]>([]);
    const [responsesLoading, setResponsesLoading] = useState(false);
    const [searchName, setSearchName] = useState('');
    const [searchPhone, setSearchPhone] = useState('');
    const [searchResults, setSearchResults] = useState<any[] | null>(null);

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

    const fetchResponses = useCallback(async () => {
        setResponsesLoading(true);
        try {
            const res = await listSurveyResponsesAction(surveyId);
            if (res.success) setResponses(res.data as any[]);
        } finally {
            setResponsesLoading(false);
        }
    }, [surveyId]);

    const handleSearchByNamePhone = async () => {
        if (!searchName.trim() || !searchPhone.trim()) {
            setMsg({ type: 'error', text: '이름과 전화번호를 모두 입력해주세요.' });
            return;
        }
        setResponsesLoading(true);
        try {
            const res = await getSurveyResponseByNamePhoneAction({
                surveyId,
                name: searchName.trim(),
                phone: searchPhone.trim()
            });
            if (res.success) setSearchResults(res.data as any[]);
            else setMsg({ type: 'error', text: res.error || '조회 실패' });
        } finally {
            setResponsesLoading(false);
        }
    };

    const handleDeleteResponse = async (id: string, label: string) => {
        if (!window.confirm(`${label}의 응답을 삭제하시겠습니까?`)) return;
        setSubmitting(true);
        try {
            const res = await deleteSurveyResponseAction(id);
            if (res.success) {
                setMsg({ type: 'success', text: '응답이 삭제되었습니다.' });
                await fetchResponses();
                setSearchResults(prev => prev ? prev.filter(r => r.id !== id) : null);
            } else {
                setMsg({ type: 'error', text: res.error || '삭제 실패' });
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleResetAllResponses = async () => {
        if (!window.confirm(`이 설문의 응답 ${responses.length}건을 모두 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) return;
        setSubmitting(true);
        try {
            let failCount = 0;
            for (const r of responses) {
                const res = await deleteSurveyResponseAction(r.id);
                if (!res.success) failCount++;
            }
            if (failCount === 0) {
                setMsg({ type: 'success', text: '모든 응답이 초기화되었습니다.' });
            } else {
                setMsg({ type: 'error', text: `${failCount}건 삭제 실패. 나머지는 삭제되었습니다.` });
            }
            await fetchResponses();
            setSearchResults(null);
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        fetchData();
        fetchResponses();
    }, [fetchData, fetchResponses]);

    const handleOpenDialog = (q: Question | null = null) => {
        if (q) {
            setEditingQuestion(q);
            setQText(q.text);
            setQType(q.type);
            setQOptions(q.options ? JSON.parse(q.options) : []);
            setQSectionId(q.sectionId || '');
            setQLogic(q.logic || '');
            setQMaxChoices(q.maxChoices || 1);

            // Parse scale/grid options
            if (q.options) {
                try {
                    const parsed = JSON.parse(q.options);
                    if (q.type === 'SCALE') {
                        setScaleMin(parsed.min || 1);
                        setScaleMax(parsed.max || 5);
                        setScaleMinLabel(parsed.minLabel || '');
                        setScaleMaxLabel(parsed.maxLabel || '');
                    } else if (q.type === 'GRID_CHOICE' || q.type === 'GRID_CHECK') {
                        setGridRows(parsed.rows || ['']);
                        setGridCols(parsed.columns || ['']);
                    }
                } catch (e) {}
            }
            
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
            setQMaxChoices(1);
            setScaleMin(1);
            setScaleMax(5);
            setScaleMinLabel('');
            setScaleMaxLabel('');
            setGridRows(['']);
            setGridCols(['']);
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
        
        const filteredOptions = (qType === 'MULTIPLE_CHOICE' || qType === 'MULTIPLE_SELECT' || qType === 'DROPDOWN')
            ? JSON.stringify(qOptions.map(o => o.trim()).filter(o => o !== ''))
            : qType === 'SCALE'
                ? JSON.stringify({ min: scaleMin, max: scaleMax, minLabel: scaleMinLabel.trim(), maxLabel: scaleMaxLabel.trim() })
                : (qType === 'GRID_CHOICE' || qType === 'GRID_CHECK')
                    ? JSON.stringify({ rows: gridRows.map(r => r.trim()).filter(r => r !== ''), columns: gridCols.map(c => c.trim()).filter(c => c !== '') })
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
                    options: filteredOptions, // null to clear if changed to TEXT
                    maxChoices: qType === 'MULTIPLE_SELECT' ? qMaxChoices : 1,
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
                    maxChoices: qType === 'MULTIPLE_SELECT' ? qMaxChoices : 1,
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
                            [...sections, { id: 'none', title: '섹션 없음' }].map((section) => {
                                const sectionQuestions = questions.filter(q => 
                                    section.id === 'none'
                                        ? !sections.some(s => s.id === q.sectionId)
                                        : q.sectionId === section.id
                                );
                                if (sectionQuestions.length === 0 && section.id !== 'none') return null;
                                
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
                                                                <Chip label={
                                                                    q.type === 'MULTIPLE_CHOICE' ? '객관식' : 
                                                                    q.type === 'MULTIPLE_SELECT' ? `체크박스 (${q.maxChoices}개)` : 
                                                                    q.type === 'TEXT_SHORT' ? '단답형' :
                                                                    q.type === 'TEXT_LONG' ? '장문형' :
                                                                    q.type === 'DROPDOWN' ? '드롭다운' :
                                                                    q.type === 'SCALE' ? '선형 배율' :
                                                                    q.type === 'GRID_CHOICE' ? '객관식 그리드' :
                                                                    q.type === 'GRID_CHECK' ? '체크박스 그리드' :
                                                                    q.type === 'DATE' ? '날짜' :
                                                                    q.type === 'TIME' ? '시간' : '주관식'
                                                                } size="small" variant="outlined" />
                                                                {q.logic && <Chip label="분기 로직 있음" size="small" color="warning" variant="filled" />}
                                                            </Box>
                                                        }
                                                        secondary={
                                                            <Box>
                                                                {(q.type === 'MULTIPLE_CHOICE' || q.type === 'MULTIPLE_SELECT') && q.options && (
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

                {/* 응답 관리 패널 */}
                <Paper sx={{ p: 4, mb: 4, borderRadius: 3, border: '1px solid #ffcdd2', bgcolor: '#fff8f8' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Box>
                            <Typography variant="h6" fontWeight="bold" color="error.main">응답 관리</Typography>
                            <Typography variant="body2" color="text.secondary">
                                총 {responsesLoading ? '...' : responses.length}건의 응답
                            </Typography>
                        </Box>
                        <Button
                            variant="contained"
                            color="error"
                            startIcon={<DeleteSweepIcon />}
                            disabled={submitting || responses.length === 0}
                            onClick={handleResetAllResponses}
                        >
                            전체 응답 초기화
                        </Button>
                    </Box>

                    {/* 이름+전화 검색 삭제 */}
                    <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, border: '1px solid #eee', mb: 3 }}>
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>🔍 특정 응답 찾아 삭제</Typography>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="flex-start">
                            <TextField
                                size="small"
                                label="이름"
                                value={searchName}
                                onChange={e => setSearchName(e.target.value)}
                                sx={{ minWidth: 120 }}
                            />
                            <TextField
                                size="small"
                                label="전화번호"
                                placeholder="010-0000-0000"
                                value={searchPhone}
                                onChange={e => setSearchPhone(e.target.value)}
                                sx={{ minWidth: 160 }}
                            />
                            <Button
                                variant="outlined"
                                color="primary"
                                startIcon={<SearchIcon />}
                                onClick={handleSearchByNamePhone}
                                disabled={responsesLoading}
                            >
                                검색
                            </Button>
                        </Stack>

                        {searchResults !== null && (
                            <Box sx={{ mt: 2 }}>
                                {searchResults.length === 0 ? (
                                    <Typography variant="body2" color="text.secondary">해당 조건의 응답이 없습니다.</Typography>
                                ) : (
                                    <List dense>
                                        {searchResults.map(r => (
                                            <ListItem key={r.id} divider secondaryAction={
                                                <Button
                                                    size="small"
                                                    color="error"
                                                    variant="outlined"
                                                    startIcon={<DeleteIcon />}
                                                    onClick={() => handleDeleteResponse(r.id, r.member?.name || '응답')}
                                                    disabled={submitting}
                                                >
                                                    삭제
                                                </Button>
                                            }>
                                                <ListItemText
                                                    primary={`${r.member?.name || '이름 없음'} (${r.member?.phone || ''})`}
                                                    secondary={`제출: ${new Date(r.submittedAt).toLocaleString('ko-KR')}`}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                )}
                            </Box>
                        )}
                    </Box>

                    {/* 전체 응답 목록 */}
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>전체 응답 목록</Typography>
                    {responsesLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}><CircularProgress size={24} /></Box>
                    ) : responses.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>제출된 응답이 없습니다.</Typography>
                    ) : (
                        <List dense>
                            {responses.map((r, idx) => (
                                <ListItem key={r.id} divider secondaryAction={
                                    <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => handleDeleteResponse(r.id, r.member?.name || '응답')}
                                        disabled={submitting}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                }>
                                    <ListItemText
                                        primary={`${idx + 1}. ${r.member?.name || '이름 없음'} (${r.member?.phone || ''})`}
                                        secondary={new Date(r.submittedAt).toLocaleString('ko-KR')}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    )}
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

                        <FormControl fullWidth sx={{ mt: 1 }}>
                            <InputLabel id="q-type-label">문항 타입</InputLabel>
                            <Select
                                labelId="q-type-label"
                                value={qType}
                                label="문항 타입"
                                onChange={(e) => setQType(e.target.value as string)}
                            >
                                <MenuItem value="TEXT_SHORT">단답형</MenuItem>
                                <MenuItem value="TEXT_LONG">장문형</MenuItem>
                                <MenuItem value="MULTIPLE_CHOICE">객관식 (단일 선택)</MenuItem>
                                <MenuItem value="MULTIPLE_SELECT">다중 선택형 (체크박스)</MenuItem>
                                <MenuItem value="DROPDOWN">드롭다운</MenuItem>
                                <MenuItem value="SCALE">선형 배율</MenuItem>
                                <MenuItem value="GRID_CHOICE">객관식 그리드</MenuItem>
                                <MenuItem value="GRID_CHECK">체크박스 그리드</MenuItem>
                                <MenuItem value="DATE">날짜</MenuItem>
                                <MenuItem value="TIME">시간</MenuItem>
                            </Select>
                        </FormControl>

                        {qType === 'MULTIPLE_SELECT' && (
                            <TextField
                                label="최대 선택 가능 개수"
                                type="number"
                                fullWidth
                                variant="outlined"
                                value={qMaxChoices}
                                onChange={(e) => setQMaxChoices(parseInt(e.target.value) || 1)}
                                inputProps={{ min: 1 }}
                                helperText="사용자가 몇 개의 보기까지 선택할 수 있는지 설정합니다."
                            />
                        )}

                        {qType === 'SCALE' && (
                            <Box sx={{ border: '1px solid', borderColor: 'divider', p: 2, borderRadius: 2 }}>
                                <Typography variant="subtitle2" gutterBottom color="text.secondary">배율 설정</Typography>
                                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                    <TextField label="최소값" type="number" value={scaleMin} onChange={(e) => setScaleMin(parseInt(e.target.value))} size="small" />
                                    <TextField label="최대값" type="number" value={scaleMax} onChange={(e) => setScaleMax(parseInt(e.target.value))} size="small" />
                                </Box>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <TextField label="최소 라벨 (예: 전혀 아님)" fullWidth value={scaleMinLabel} onChange={(e) => setScaleMinLabel(e.target.value)} size="small" />
                                    <TextField label="최대 라벨 (예: 매우 만족)" fullWidth value={scaleMaxLabel} onChange={(e) => setScaleMaxLabel(e.target.value)} size="small" />
                                </Box>
                            </Box>
                        )}

                        {(qType === 'GRID_CHOICE' || qType === 'GRID_CHECK') && (
                            <Box sx={{ border: '1px solid', borderColor: 'divider', p: 2, borderRadius: 2 }}>
                                <Typography variant="subtitle2" gutterBottom color="text.secondary">그리드 설정 (행/열)</Typography>
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="caption" fontWeight="bold">행 (가로 문항들)</Typography>
                                    {gridRows.map((row, idx) => (
                                        <Box key={idx} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                            <TextField fullWidth size="small" value={row} onChange={(e) => {
                                                const newR = [...gridRows]; newR[idx] = e.target.value; setGridRows(newR);
                                            }} />
                                            <IconButton size="small" onClick={() => setGridRows(gridRows.filter((_, i) => i !== idx))} disabled={gridRows.length === 1}><DeleteIcon /></IconButton>
                                        </Box>
                                    ))}
                                    <Button size="small" startIcon={<AddIcon />} onClick={() => setGridRows([...gridRows, ''])}>행 추가</Button>
                                </Box>
                                <Box>
                                    <Typography variant="caption" fontWeight="bold">열 (세로 선택지들)</Typography>
                                    {gridCols.map((col, idx) => (
                                        <Box key={idx} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                            <TextField fullWidth size="small" value={col} onChange={(e) => {
                                                const newC = [...gridCols]; newC[idx] = e.target.value; setGridCols(newC);
                                            }} />
                                            <IconButton size="small" onClick={() => setGridCols(gridCols.filter((_, i) => i !== idx))} disabled={gridCols.length === 1}><DeleteIcon /></IconButton>
                                        </Box>
                                    ))}
                                    <Button size="small" startIcon={<AddIcon />} onClick={() => setGridCols([...gridCols, ''])}>열 추가</Button>
                                </Box>
                            </Box>
                        )}

                        {(qType === 'MULTIPLE_CHOICE' || qType === 'MULTIPLE_SELECT' || qType === 'DROPDOWN') && (
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
                                            .filter(oq => {
                                                // If creating new: can select any existing question
                                                if (!editingQuestion) return true;
                                                // If editing: only questions with smaller orderIdx
                                                return oq.orderIdx < editingQuestion.orderIdx;
                                            })
                                            .sort((a, b) => a.orderIdx - b.orderIdx)
                                            .map((oq, idx) => (
                                                <MenuItem key={oq.id} value={oq.id}>
                                                    {idx + 1}. {oq.text.length > 30 ? oq.text.substring(0, 30) + '...' : oq.text}
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
