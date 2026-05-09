'use client';

import { useState, useEffect, useCallback, use, useMemo } from 'react';
import { useRouter } from 'next/navigation';

import * as XLSX from 'xlsx';
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
    AccordionDetails,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    FormControlLabel,
    Checkbox,
    Slider
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import SaveIcon from '@mui/icons-material/Save';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import BarChartIcon from '@mui/icons-material/BarChart';
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
    deleteSurveyResponseAction
} from '@/app/actions/data';

// DND Kit Imports
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { GripVertical } from 'lucide-react';
import SimpleRichEditor from '@/components/SimpleRichEditor';



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

    // [New] Tracks deletions to perform them on final save
    const [deletedQuestionIds, setDeletedQuestionIds] = useState<string[]>([]);
    const [deletedSectionIds, setDeletedSectionIds] = useState<string[]>([]);

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
    const [qIsPrivate, setQIsPrivate] = useState(false);
    const [qIsRequired, setQIsRequired] = useState(false);
    const [qFontSize, setQFontSize] = useState<number>(1.1);
    const [qOptionFontSize, setQOptionFontSize] = useState<number>(1.0);

    
    
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

    const [responses, setResponses] = useState<any[]>([]);
    const [responsesLoading, setResponsesLoading] = useState(false);
    const [searchName, setSearchName] = useState('');
    const [searchPhone, setSearchPhone] = useState('');
    const [showOnlyNew, setShowOnlyNew] = useState(false);
    const [orderBy, setOrderBy] = useState('submittedAt');
    const [order, setOrder] = useState<'asc' | 'desc'>('desc');

    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // DND Sensors

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Prevent accidental drags
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );


    useEffect(() => {
        const logicObj: any = {};
        if (qLogic) {
            try {
                const existing = JSON.parse(qLogic);
                if (existing.isPrivate) logicObj.isPrivate = true;
                if (existing.isRequired) logicObj.isRequired = true;
                if (existing.fontSize) logicObj.fontSize = existing.fontSize;
            } catch(e) {}
        }

        if (qFontSize && qFontSize !== 1.1) {
            logicObj.fontSize = qFontSize;
        }

        if (qOptionFontSize && qOptionFontSize !== 1.0) {
            logicObj.optionFontSize = qOptionFontSize;
        }

        if (logicQuestionId) {
            logicObj.showIf = {
                questionId: logicQuestionId,
                value: logicValue
            };
        }
        
        if (qIsPrivate) {
            logicObj.isPrivate = true;
        } else {
            delete logicObj.isPrivate;
        }

        if (qIsRequired) {
            logicObj.isRequired = true;
        } else {
            delete logicObj.isRequired;
        }

        const newLogic = Object.keys(logicObj).length > 0 ? JSON.stringify(logicObj) : '';
        if (qLogic !== newLogic) {
            setQLogic(newLogic);
        }
    }, [logicQuestionId, logicValue, qIsPrivate, qIsRequired, qFontSize, qOptionFontSize]);

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
                setHasUnsavedChanges(false);
                setDeletedQuestionIds([]);
                setDeletedSectionIds([]);
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
        setResponses([]); // 로딩 시작 전 초기화 (이전 데이터 append 방지)
        try {
            const res = await listSurveyResponsesAction(surveyId);
            if (res.success) {
                // id 기준 중복 제거 후 상태 반영
                const unique = (res.data as any[]).filter(
                    (r, i, arr) => arr.findIndex((x: any) => x.id === r.id) === i
                );
                setResponses(unique);
            } else {
                setMsg({ type: 'error', text: res.error || '응답을 불러오지 못했습니다.' });
            }
        } catch (err) {
            console.error('Error in fetchResponses:', err);
        } finally {
            setResponsesLoading(false);
        }
    }, [surveyId]);

    // 초기 데이터 로드 (한 번만 실행)
    useEffect(() => { fetchData(); fetchResponses(); }, [fetchData, fetchResponses]);


    // Handle unsaved changes warning
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasUnsavedChanges]);

    const filteredResponses = useMemo(() => {
        let result = [...responses];
        
        if (searchName.trim()) {
            result = result.filter(r => (r.member?.name || '').includes(searchName.trim()));
        }
        if (searchPhone.trim()) {
            result = result.filter(r => (r.member?.phone || '').includes(searchPhone.trim()));
        }
        if (showOnlyNew) {
            result = result.filter(r => r.member?.isSelfRegistered);
        }

        result.sort((a, b) => {
            let valA: any, valB: any;
            if (orderBy === 'name') {
                valA = a.member?.name || '';
                valB = b.member?.name || '';
            } else if (orderBy === 'phone') {
                valA = a.member?.phone || '';
                valB = b.member?.phone || '';
            } else {
                valA = new Date(a.submittedAt).getTime();
                valB = new Date(b.submittedAt).getTime();
            }

            if (valA < valB) return order === 'asc' ? -1 : 1;
            if (valA > valB) return order === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [responses, searchName, searchPhone, showOnlyNew, orderBy, order]);

    const handleRequestSort = (property: string) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleExportExcel = (isPrivateOnly: boolean = false) => {
        if (filteredResponses.length === 0) {
            setMsg({ type: 'error', text: '내보낼 데이터가 없습니다.' });
            return;
        }

        // Filter questions based on isPrivate flag in logic
        const targetQuestions = questions.filter(q => {
            let isPrivate = false;
            if (q.logic) {
                try {
                    const logic = JSON.parse(q.logic);
                    isPrivate = !!logic.isPrivate;
                } catch(e) {}
            }
            return isPrivateOnly ? isPrivate : !isPrivate;
        });

        if (targetQuestions.length === 0) {
            setMsg({ type: 'error', text: isPrivateOnly ? '개인정보로 설정된 문항이 없습니다.' : '일반 응답으로 설정된 문항이 없습니다.' });
            return;
        }

        const data = filteredResponses.map(r => {
            const row: any = {
                '성함': r.member?.name || '정보 없음',
                '전화번호': r.member?.phone || '정보 없음',
                '신규여부': r.member?.isSelfRegistered ? 'NEW' : '',
                '제출시간': new Date(r.submittedAt).toLocaleString('ko-KR')
            };

            // 질문들 매핑
            const answers = r.answers ? JSON.parse(r.answers) : {};
            targetQuestions.forEach((q, idx) => {
                // 1. 기본 답변 값 찾기
                let val = answers[q.id] || answers[q.text] || '';
                
                // 2. '기타' 주관식 답변이 별도 키로 존재할 경우 합치기
                const otherVal = answers[`${q.id}_other`];
                if (otherVal) {
                    if (Array.isArray(val)) {
                        val = val.map(v => v.includes('기타') ? `기타(${otherVal})` : v);
                    } else if (typeof val === 'string' && val.includes('기타')) {
                        val = `기타(${otherVal})`;
                    }
                }

                // 3. 순위 선택형 데이터 포맷팅
                if (q.type === 'RANK_CHOICE' && val && typeof val === 'object') {
                    const r1 = val.rank1 === '기타' && val.other1 ? `기타(${val.other1})` : (val.rank1 || '');
                    const r2 = val.rank2 === '기타' && val.other2 ? `기타(${val.other2})` : (val.rank2 || '');
                    val = `1순위: ${r1}, 2순위: ${r2}`;
                }
                
                const qKey = isPrivateOnly ? `[개인정보] ${q.text}` : `Q${idx + 1}. ${q.text}`;
                row[qKey] = Array.isArray(val) ? val.join(', ') : val;
            });

            return row;
        });

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Responses");
        const fileName = `${surveyTitle}_${isPrivateOnly ? '개인정보' : '일반응답'}_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    const handleDeleteResponse = async (id: string, label: string) => {
        if (!window.confirm(`${label}의 응답을 삭제하시겠습니까?`)) return;
        
        // Optimistic Update: 즉시 화면에서 제거
        const previousResponses = [...responses];
        setResponses(prev => prev.filter(r => r.id !== id));

        try {
            const res = await deleteSurveyResponseAction(id, surveyId);
            if (res.success) {
                setMsg({ type: 'success', text: '응답이 삭제되었습니다.' });
            } else {
                setMsg({ type: 'error', text: res.error || '삭제 실패' });
                setResponses(previousResponses);
            }
        } catch (err) {
            console.error(err);
            setResponses(previousResponses);
        }
    };

    const handleResetAllResponses = async () => {
        if (!window.confirm(`이 설문의 응답 ${responses.length}건을 모두 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) return;
        
        const previousResponses = [...responses];
        setSubmitting(true);
        setResponses([]);

        try {
            let failCount = 0;
            for (const r of previousResponses) {
                const res = await deleteSurveyResponseAction(r.id, surveyId);
                if (!res.success) failCount++;
            }
            if (failCount === 0) {
                setMsg({ type: 'success', text: '모든 응답이 초기화되었습니다.' });
                setResponses([]); // 상태 확실히 비움
                router.refresh(); // 라우터 캐시 무효화
            } else {
                setMsg({ type: 'error', text: `${failCount}건 삭제 실패. 나머지는 삭제되었습니다.` });
                await fetchResponses();
            }
        } catch (err) {
            console.error(err);
            setResponses(previousResponses);
        } finally {
            setSubmitting(false);
        }
    };


    const handleOpenDialog = (q: Question | null = null) => {
        if (q) {
            setEditingQuestion(q);
            setQText(q.text);
            setQType(q.type);
            // options is already a JSON string from the server/state
            setQOptions(q.options && typeof q.options === 'string' ? JSON.parse(q.options) : Array.isArray(q.options) ? q.options : []);

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
            
            // Parse logic for builder and private flag
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
                    setQIsPrivate(!!parsed.isPrivate);
                    setQIsRequired(!!parsed.isRequired);
                    setQFontSize(parsed.fontSize || 1.1);
                    setQOptionFontSize(parsed.optionFontSize || 1.0);

                } catch (e) {
                    setLogicQuestionId('');
                    setLogicValue('');
                    setQIsPrivate(false);
                    setQIsRequired(false);
                    setQFontSize(1.1);
                    setQOptionFontSize(1.0);

                }
            } else {
                setLogicQuestionId('');
                setLogicValue('');
                setQIsPrivate(false);
                setQIsRequired(false);
                setQFontSize(1.1);
                setQOptionFontSize(1.0);

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
            setQIsPrivate(false);
            setQIsRequired(false);
            setQFontSize(1.1);
            setQOptionFontSize(1.0);

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
                router.refresh();
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
        
        if (editingSection) {
            // Update local state
            setSections(prev => prev.map(s => s.id === editingSection.id ? { ...s, title: sTitle.trim(), description: sDesc.trim() || null } : s));
            setHasUnsavedChanges(true);
            setSectionDialogOpen(false);
        } else {
            // Create local temporary ID
            const tempId = `temp_s_${Date.now()}`;
            const newSection: Section = {
                id: tempId,
                title: sTitle.trim(),
                description: sDesc.trim() || null,
                orderIdx: sections.length > 0 ? Math.max(...sections.map(s => s.orderIdx)) + 1 : 1
            };
            setSections(prev => [...prev, newSection]);
            setHasUnsavedChanges(true);
            setSectionDialogOpen(false);
        }
    };

    const handleDeleteSection = (id: string) => {
        if (!window.confirm('이 섹션을 삭제하시겠습니까? 섹션 내 문항들의 섹션 지정이 해제됩니다. (최종 저장 버튼을 누를 때까지 실제로 삭제되지 않습니다)')) return;
        
        if (!id.startsWith('temp_')) {
            setDeletedSectionIds(prev => [...prev, id]);
        }
        setSections(prev => prev.filter(s => s.id !== id));
        setQuestions(prev => prev.map(q => q.sectionId === id ? { ...q, sectionId: null } : q));
        setHasUnsavedChanges(true);
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
        
        const filteredOptions = (qType === 'MULTIPLE_CHOICE' || qType === 'MULTIPLE_SELECT' || qType === 'DROPDOWN' || qType === 'RANK_CHOICE')
            ? JSON.stringify(qOptions.map(o => o.trim()).filter(o => o !== ''))
            : qType === 'SCALE'
                ? JSON.stringify({ min: scaleMin, max: scaleMax, minLabel: scaleMinLabel.trim(), maxLabel: scaleMaxLabel.trim() })
                : (qType === 'GRID_CHOICE' || qType === 'GRID_CHECK')
                    ? JSON.stringify({ rows: gridRows.map(r => r.trim()).filter(r => r !== ''), columns: gridCols.map(c => c.trim()).filter(c => c !== '') })
                    : null;

        if (editingQuestion) {
            setQuestions(prev => prev.map(q => q.id === editingQuestion.id ? {
                ...q,
                sectionId: qSectionId || null,
                text: qText.trim(),
                type: qType,
                options: filteredOptions,
                maxChoices: qType === 'MULTIPLE_SELECT' ? qMaxChoices : 1,
                logic: qLogic || (qIsPrivate ? JSON.stringify({ isPrivate: true }) : null)
            } : q));
        } else {
            const tempId = `temp_q_${Date.now()}`;
            const newQuestion: Question = {
                id: tempId,
                sectionId: qSectionId || null,
                text: qText.trim(),
                type: qType,
                options: filteredOptions,
                maxChoices: qType === 'MULTIPLE_SELECT' ? qMaxChoices : 1,
                logic: qLogic || (qIsPrivate ? JSON.stringify({ isPrivate: true }) : null),
                orderIdx: questions.length > 0 ? Math.max(...questions.map(q => q.orderIdx)) + 1 : 1
            };
            setQuestions(prev => [...prev, newQuestion]);
        }
        setHasUnsavedChanges(true);
        setDialogOpen(false);
    };

    const handleDeleteQuestion = (id: string) => {
        if (!window.confirm('이 문항을 삭제하시겠습니까? (최종 저장 버튼을 누를 때까지 실제로 삭제되지 않습니다)')) return;
        
        if (!id.startsWith('temp_')) {
            setDeletedQuestionIds(prev => [...prev, id]);
        }
        setQuestions(prev => prev.filter(q => q.id !== id));
        setHasUnsavedChanges(true);
    };


    const handleSaveOrder = async () => {
        setSubmitting(true);
        setMsg({ type: 'success', text: '서버에 저장 중입니다...' });
        try {
            // 1. Delete removed sections
            for (const sid of deletedSectionIds) {
                await deleteSurveySectionAction(sid, surveyId);
            }

            // 2. Delete removed questions
            for (const qid of deletedQuestionIds) {
                await deleteSurveyQuestionAction(qid, surveyId);
            }

            // 3. Upsert sections and track ID mapping for temp sections
            const sectionIdMap: Record<string, string> = {};
            
            // We need to re-fetch sections after EACH creation to get the new ID, 
            // but since createSurveySectionAction doesn't return the ID, 
            // we'll use title as a temporary match key to build the map.
            for (let i = 0; i < sections.length; i++) {
                const s = sections[i];
                if (s.id.startsWith('temp_')) {
                    await createSurveySectionAction({
                        surveyId,
                        title: s.title,
                        description: s.description || undefined,
                        orderIdx: i + 1
                    });
                } else {
                    await updateSurveySectionAction({
                        surveyId,
                        id: s.id,
                        title: s.title,
                        description: s.description || undefined,
                        orderIdx: i + 1
                    });
                }
            }

            // Re-fetch ALL sections to get the real IDs generated by DB
            const freshSectionsRes = await listSurveySectionsAction(surveyId);
            const freshSections = freshSectionsRes.success ? freshSectionsRes.data as any[] : [];
            
            // Build the map: temp_id -> real_id
            sections.forEach(s => {
                if (s.id.startsWith('temp_')) {
                    // Match by title (best effort)
                    const realS = freshSections.find(fs => fs.title === s.title);
                    if (realS) sectionIdMap[s.id] = realS.id;
                } else {
                    sectionIdMap[s.id] = s.id;
                }
            });


            // Simple mapping: matching by title if it's unique enough (risky) or just assume they are there
            // BETTER: modify questions sectionId logic if needed.

            // 4. Upsert questions
            for (let i = 0; i < questions.length; i++) {
                const q = questions[i];
                
                // Map temp sectionId to real sectionId using our map
                let finalSectionId = q.sectionId;
                if (q.sectionId && sectionIdMap[q.sectionId]) {
                    finalSectionId = sectionIdMap[q.sectionId];
                } else if (q.sectionId && q.sectionId.startsWith('temp_')) {
                    // Fallback search if map failed
                    const tempSection = sections.find(ts => ts.id === q.sectionId);
                    if (tempSection) {
                        const realS = freshSections.find(fs => fs.title === tempSection.title);
                        finalSectionId = realS ? realS.id : null;
                    }
                }


                if (q.id.startsWith('temp_')) {
                    await createSurveyQuestionAction({
                        surveyId,
                        sectionId: finalSectionId || undefined,
                        text: q.text,
                        type: q.type,
                        options: q.options || undefined,
                        maxChoices: q.maxChoices || 1,
                        logic: q.logic || undefined,
                        orderIdx: i + 1
                    });
                } else {
                    await updateSurveyQuestionAction({
                        surveyId,
                        id: q.id,
                        sectionId: finalSectionId,
                        text: q.text,
                        type: q.type,
                        options: q.options,
                        maxChoices: q.maxChoices,
                        logic: q.logic,
                        orderIdx: i + 1
                    });
                }
            }

            setMsg({ type: 'success', text: '모든 변경 사항이 최종 저장되었습니다.' });
            setHasUnsavedChanges(false);
            setDeletedQuestionIds([]);
            setDeletedSectionIds([]);
            
            // 저장 완료 후 최신 데이터 즉시 로드 (router.refresh() 제거: 클라이언트 컴포넌트에서 불필요하고 느림)
            fetchData();
        } catch (err) {

            console.error(err);
            setMsg({ type: 'error', text: '저장 중 오류가 발생했습니다. 일부 데이터만 저장되었을 수 있습니다.' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = questions.findIndex((q) => q.id === active.id);
        const newIndex = questions.findIndex((q) => q.id === over.id);

        if (oldIndex === -1 || newIndex === -1) return;

        const newQuestions = arrayMove(questions, oldIndex, newIndex);
        
        // Update local state and mark as unsaved
        setQuestions(newQuestions);
        setHasUnsavedChanges(true);
    };



    // Sortable Question Item Component
    const SortableQuestion = ({ q, idx, sectionId }: { q: Question, idx: number, sectionId: string }) => {
        const {
            attributes,
            listeners,
            setNodeRef,
            transform,
            transition,
            isDragging
        } = useSortable({ id: q.id });

        const style = {
            transform: CSS.Transform.toString(transform),
            transition,
            zIndex: isDragging ? 1 : 0,
            opacity: isDragging ? 0.5 : 1,
            backgroundColor: isDragging ? '#f3e5f5' : 'transparent',
        };

        return (
            <Box ref={setNodeRef} style={style}>
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
                    <Box {...attributes} {...listeners} sx={{ cursor: 'grab', mr: 2, mt: 1, display: 'flex', alignItems: 'center' }}>
                        <GripVertical size={20} color="#9c27b0" />
                    </Box>
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
                                    q.type === 'TIME' ? '시간' : 
                                    q.type === 'RANK_CHOICE' ? '순위 선택형 (1, 2순위)' : '주관식'
                                } size="small" variant="outlined" />
                                {q.logic && JSON.parse(q.logic || '{}').isPrivate && <Chip label="개인정보(분리)" size="small" color="warning" variant="filled" />}
                                {q.logic && JSON.parse(q.logic || '{}').showIf && <Chip label="분기 로직 있음" size="small" color="info" variant="filled" />}
                                {q.logic && JSON.parse(q.logic || '{}').isRequired && <Chip label="필수" size="small" color="error" variant="filled" />}
                            </Box>
                        }
                        secondary={
                            <Box>
                                {(q.type === 'MULTIPLE_CHOICE' || q.type === 'MULTIPLE_SELECT' || q.type === 'RANK_CHOICE' || q.type === 'DROPDOWN') && q.options && (
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
        );
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
                        <Typography variant="h4" fontWeight="bold">
                            {survey?.title} {survey?.isActive ? <Chip label="진행중" color="success" size="small" /> : <Chip label="종료됨" color="default" size="small" />}
                        </Typography>
                        {survey?.description && (
                            <Typography color="text.secondary" sx={{ mt: 1 }}>
                                {survey.description}
                            </Typography>
                        )}
                    </Box>
                    <Stack direction="row" spacing={1}>
                        <Button 
                            startIcon={<BarChartIcon />}
                            variant="contained" 
                            color="info"
                            onClick={() => router.push(`/admin/surveys/${surveyId}/results`)}
                        >
                            설문 결과
                        </Button>
                        <Button 
                            variant="outlined" 
                            startIcon={<EditIcon />}
                            onClick={() => setSurveyEditOpen(true)}
                        >
                            설문 정보 수정
                        </Button>
                    </Stack>
                </Box>

                <Divider sx={{ mb: 4 }} />

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
                                    <ListItemText 
                                        primary={`${idx + 1}. ${s.title}`} 
                                        secondary={
                                            <Typography variant="body2" color="text.secondary" sx={{ 
                                                whiteSpace: 'pre-wrap', 
                                                wordBreak: 'keep-all', 
                                                overflowWrap: 'break-word'
                                            }}>
                                                {s.description}
                                            </Typography>
                                        } 
                                    />
                                </ListItem>
                            ))
                        )}
                    </List>
                </Paper>
                <Paper sx={{ p: 4, mb: 4, borderRadius: 3, border: '1px solid #e1bee7' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6" fontWeight="bold">문항 목록</Typography>
                        <Stack direction="row" spacing={1}>
                            <Button 
                                variant="contained" 
                                color="secondary" 
                                startIcon={<AddIcon />}
                                onClick={(e) => { e.currentTarget.blur(); handleOpenDialog(); }}
                                disabled={submitting}
                            >
                                문항 추가
                            </Button>
                        </Stack>
                    </Box>



                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                        modifiers={[restrictToVerticalAxis]}
                    >
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
                                            <SortableContext 
                                                items={sectionQuestions.map(q => q.id)}
                                                strategy={verticalListSortingStrategy}
                                            >
                                                {sectionQuestions.map((q, idx) => (
                                                    <SortableQuestion key={q.id} q={q} idx={idx} sectionId={section.id} />
                                                ))}
                                            </SortableContext>
                                        </Box>
                                    );
                                })
                            )}
                        </List>
                    </DndContext>

                </Paper>

                {/* 최종 저장 하단 플로팅 바 (변경사항 있을 때만 노출) */}
                {hasUnsavedChanges && (
                    <Paper 
                        elevation={10} 
                        sx={{ 
                            position: 'fixed', 
                            bottom: 20, 
                            left: '50%', 
                            transform: 'translateX(-50%)', 
                            zIndex: 1000, 
                            p: 2, 
                            px: 4, 
                            borderRadius: 10, 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 3, 
                            bgcolor: '#2e7d32', 
                            color: 'white',
                            border: '2px solid #fff',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                        }}
                    >
                        <Typography variant="body1" fontWeight="bold">
                            ⚠️ 변경된 내용이 있습니다. 반드시 저장 버튼을 눌러주세요!
                        </Typography>
                        <Button 
                            variant="contained" 
                            color="inherit" 
                            size="large"
                            startIcon={submitting ? <CircularProgress size={24} /> : <SaveIcon />}
                            onClick={handleSaveOrder}
                            disabled={submitting}
                            sx={{ 
                                color: '#2e7d32', 
                                fontWeight: 'bold', 
                                px: 4, 
                                '&:hover': { bgcolor: '#f5f5f5' } 
                            }}
                        >
                            {submitting ? '저장 중...' : '전체 설문 저장 적용'}
                        </Button>
                    </Paper>
                )}

                {/* 응답 관리 패널 */}

                <Paper sx={{ p: 4, mb: 4, borderRadius: 3, border: '1px solid #ffcdd2', bgcolor: '#fff8f8' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Box>
                            <Typography variant="h6" fontWeight="bold" color="error.main">응답 관리</Typography>
                            <Typography variant="body2" color="text.secondary">
                                총 {responsesLoading ? '...' : responses.length}건의 응답 {filteredResponses.length !== responses.length && `(필터링됨: ${filteredResponses.length}건)`}
                            </Typography>
                        </Box>
                        <Stack direction="row" spacing={1}>
                            <Button 
                                variant="contained" 
                                color="error" 
                                startIcon={<DeleteSweepIcon />}
                                disabled={submitting || responses.length === 0}
                                onClick={handleResetAllResponses}
                            >
                                전체 응답 초기화
                            </Button>
                        </Stack>
                    </Box>

                    <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', bgcolor: 'rgba(255,255,255,0.5)', p: 2, borderRadius: 2 }}>
                        <TextField 
                            size="small" 
                            label="성함 검색" 
                            value={searchName} 
                            onChange={(e) => setSearchName(e.target.value)}
                            InputProps={{ startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'action.active' }} /> }}
                            sx={{ bgcolor: 'white' }}
                        />
                        <TextField 
                            size="small" 
                            label="전화번호 검색" 
                            value={searchPhone} 
                            onChange={(e) => setSearchPhone(e.target.value)}
                            sx={{ bgcolor: 'white' }}
                        />
                        <Chip 
                            label="NEW만 보기" 
                            onClick={() => setShowOnlyNew(!showOnlyNew)}
                            color={showOnlyNew ? "primary" : "default"}
                            variant={showOnlyNew ? "filled" : "outlined"}
                            sx={{ fontWeight: 'bold' }}
                        />
                        <Box sx={{ flexGrow: 1 }} />
                        <Button
                            variant="outlined"
                            color="secondary"
                            startIcon={<SearchIcon />}
                            onClick={() => fetchResponses()}
                            disabled={responsesLoading}
                            sx={{ fontWeight: 'bold' }}
                        >
                            {responsesLoading ? <CircularProgress size={20} /> : '🔄 데이터 새로고침'}
                        </Button>
                        <Box sx={{ ml: 1 }} />
                        <Button
                            variant="contained"
                            color="success"
                            startIcon={<SaveIcon />}
                            onClick={() => handleExportExcel(false)}
                            disabled={filteredResponses.length === 0}
                            sx={{ fontWeight: 'bold' }}
                        >
                            📥 일반 응답 다운로드
                        </Button>
                        <Button
                            variant="contained"
                            color="warning"
                            startIcon={<SaveIcon />}
                            onClick={() => handleExportExcel(true)}
                            disabled={filteredResponses.length === 0}
                            sx={{ fontWeight: 'bold' }}
                        >
                            🎁 추첨용(개인정보) 다운로드
                        </Button>
                    </Box>

                    {/* 응답 목록 (테이블 형식) */}
                    <TableContainer component={Paper} elevation={0} variant="outlined" sx={{ borderRadius: 2, bgcolor: 'white' }}>
                        <Table size="small">
                            <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                                <TableRow>
                                    <TableCell>
                                        <TableSortLabel
                                            active={orderBy === 'name'}
                                            direction={orderBy === 'name' ? order : 'asc'}
                                            onClick={() => handleRequestSort('name')}
                                            sx={{ fontWeight: 'bold' }}
                                        >
                                            성함
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell>
                                        <TableSortLabel
                                            active={orderBy === 'phone'}
                                            direction={orderBy === 'phone' ? order : 'asc'}
                                            onClick={() => handleRequestSort('phone')}
                                            sx={{ fontWeight: 'bold' }}
                                        >
                                            전화번호
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell>
                                        <TableSortLabel
                                            active={orderBy === 'submittedAt'}
                                            direction={orderBy === 'submittedAt' ? order : 'asc'}
                                            onClick={() => handleRequestSort('submittedAt')}
                                            sx={{ fontWeight: 'bold' }}
                                        >
                                            제출 시간
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>관리</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredResponses.map((r) => (
                                    <TableRow key={r.id} hover>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography variant="body2" fontWeight="medium">
                                                    {r.member?.name || '이름 없음'}
                                                </Typography>
                                                {r.member?.isSelfRegistered && (
                                                    <Chip 
                                                        label="NEW" 
                                                        size="small" 
                                                        color="primary" 
                                                        sx={{ height: 18, fontSize: '0.65rem', fontWeight: 'bold' }} 
                                                    />
                                                )}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {r.member?.phone || '미등록'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {new Date(r.submittedAt).toLocaleString('ko-KR')}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton 
                                                size="small" 
                                                color="error" 
                                                onClick={() => handleDeleteResponse(r.id, r.member?.name || '응답')}
                                                disabled={submitting}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredResponses.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                {responsesLoading ? '데이터를 불러오는 중입니다...' : '조건에 맞는 응답 데이터가 없습니다.'}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
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
                    <Stack spacing={3} sx={{ mt: 2 }}>
                    
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

                        <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="secondary">질문 내용 (글자별 스타일 설정 가능)</Typography>
                            <SimpleRichEditor
                                value={qText}
                                onChange={setQText}
                            />
                        </Box>

                        <FormControl fullWidth sx={{ mt: 1 }}>
                            <InputLabel id="q-type-label">문항 타입</InputLabel>
                            <Select
                                labelId="q-type-label"
                                value={qType}
                                label="문항 타입"
                                onChange={(e) => {
                                    const newType = e.target.value as string;
                                    setQType(newType);
                                    if (newType === 'RANK_CHOICE' && qOptions.length === 0) {
                                        setQOptions(['']);
                                    }
                                }}
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
                                <MenuItem value="RANK_CHOICE">순위 선택형 (1, 2순위)</MenuItem>
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

                        {(qType === 'MULTIPLE_CHOICE' || qType === 'MULTIPLE_SELECT' || qType === 'DROPDOWN' || qType === 'RANK_CHOICE') && (
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

                        <Box sx={{ mt: 1, p: 2, border: '1px solid #ff9800', bgcolor: '#fffde7', borderRadius: 2 }}>
                            <FormControlLabel
                                control={
                                    <Checkbox 
                                        color="warning" 
                                        checked={qIsPrivate} 
                                        onChange={(e) => setQIsPrivate(e.target.checked)} 
                                    />
                                }
                                label={
                                    <Box>
                                        <Typography variant="body2" fontWeight="bold" color="warning.main">개인정보 수집 문항 (엑셀 분리)</Typography>
                                        <Typography variant="caption" color="text.secondary">체크 시 일반 응답 엑셀에서 제외되며, 추첨용 엑셀에만 나타납니다.</Typography>
                                    </Box>
                                }
                            />
                        </Box>

                        <Box sx={{ mt: 1, p: 2, border: '1px solid #ef5350', bgcolor: '#fff5f5', borderRadius: 2 }}>
                            <FormControlLabel
                                control={
                                    <Checkbox 
                                        color="error" 
                                        checked={qIsRequired} 
                                        onChange={(e) => setQIsRequired(e.target.checked)} 
                                    />
                                }
                                label={
                                    <Box>
                                        <Typography variant="body2" fontWeight="bold" color="error.main">필수 항목으로 설정</Typography>
                                        <Typography variant="caption" color="text.secondary">체크 시 응답자가 이 문항에 답변하지 않으면 다음 페이지로 넘어갈 수 없습니다.</Typography>
                                    </Box>
                                }
                            />
                        </Box>

                        <Box sx={{ mt: 1, p: 2, border: '1px solid #9c27b0', bgcolor: '#f3e5f5', borderRadius: 2 }}>
                            <Typography variant="body2" fontWeight="bold" color="secondary" gutterBottom>
                                📏 문항 글자 크기 조절 ({qFontSize}rem)
                            </Typography>
                            <Box sx={{ px: 2, pt: 1 }}>
                                <Slider
                                    value={qFontSize}
                                    min={0.8}
                                    max={2.0}
                                    step={0.1}
                                    marks={[
                                        { value: 1.1, label: '기본' },
                                        { value: 1.5, label: '크게' },
                                        { value: 2.0, label: '매우 크게' }
                                    ]}
                                    onChange={(_, newValue) => setQFontSize(newValue as number)}
                                    color="secondary"
                                />
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                    슬라이더를 조절하여 설문 문항의 글자 크기를 가독성 있게 조정할 수 있습니다.
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ mt: 1, p: 2, border: '1px solid #0288d1', bgcolor: '#e1f5fe', borderRadius: 2 }}>
                            <Typography variant="body2" fontWeight="bold" color="primary" gutterBottom>
                                📐 보기(선택지) 글자 크기 조절 ({qOptionFontSize}rem)
                            </Typography>
                            <Box sx={{ px: 2, pt: 1 }}>
                                <Slider
                                    value={qOptionFontSize}
                                    min={0.8}
                                    max={2.0}
                                    step={0.1}
                                    marks={[
                                        { value: 1.0, label: '기본' },
                                        { value: 1.4, label: '크게' },
                                        { value: 2.0, label: '매우 크게' }
                                    ]}
                                    onChange={(_, newValue) => setQOptionFontSize(newValue as number)}
                                    color="primary"
                                />
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                    슬라이더를 조절하여 선택지 보기의 글자 크기를 조정할 수 있습니다.
                                </Typography>
                            </Box>
                        </Box>
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
