'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
    Box, 
    Typography, 
    Paper, 
    Button, 
    TextField, 
    List, 
    ListItem,
    ListItemText,
    IconButton,
    Chip,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { createSurveyAction, updateSystemServiceAction, listSurveysAction, deleteSurveyAction } from '@/app/actions/data';

interface Survey {
    id: string;
    title: string;
    description?: string | null;
}

interface SurveyManagerProps {
    systemId: string;
    activeSurveyId?: string | null;
    onRefresh: () => void;
}

export default function SurveyManager({ systemId, activeSurveyId, onRefresh }: SurveyManagerProps) {
    const router = useRouter();
    const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [loading, setLoading] = useState(false);
    const [surveys, setSurveys] = useState<Survey[]>([]);

    const fetchSurveys = async () => {
        const res = await listSurveysAction();
        if (res.success && res.data) {
            setSurveys(res.data);
        }
    };

    useEffect(() => {
        fetchSurveys();
    }, []);

    const handleCreateSurvey = async () => {
        if (!newTitle.trim()) return;
        setLoading(true);
        try {
            const res = await createSurveyAction({ 
                title: newTitle.trim(), 
                description: newDesc.trim() 
            });
            if (res.success) {
                setCreateDialogOpen(false);
                setNewTitle('');
                setNewDesc('');
                fetchSurveys();
                onRefresh();
            } else {
                alert(res.error || '설문 생성 실패');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSetActiveSurvey = async (surveyId: string) => {
        setLoading(true);
        try {
            const res = await updateSystemServiceAction({
                systemId,
                activeService: 'SURVEY',
                activeSurveyId: surveyId
            });
            if (res.success) {
                onRefresh();
            } else {
                alert(res.error || '설문 활성화 실패');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSurvey = async (surveyId: string) => {
        if (!window.confirm("정말 이 설문조사를 삭제하시겠습니까? (관련된 모든 응답도 삭제될 수 있습니다.)")) return;
        setLoading(true);
        try {
            const res = await deleteSurveyAction(surveyId);
            if (res.success) {
                fetchSurveys();
            } else {
                alert(res.error || '설문 삭제 실패');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Paper sx={{ p: 4, mb: 4, bgcolor: '#fcf8ff', border: '1px solid #e1bee7' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" fontWeight="bold" color="secondary">
                        📋 설문조사 관리
                    </Typography>
                    <Button 
                        variant="contained" 
                        color="secondary" 
                        startIcon={<AddCircleOutlineIcon />}
                        onClick={(e) => { e.currentTarget.blur(); setCreateDialogOpen(true); }}
                    >
                        새 설문 생성
                    </Button>
                </Box>

                <Alert severity="info" sx={{ mb: 2 }}>
                    현재 활성화된 설문 ID: <strong>{activeSurveyId || '없음'}</strong>
                </Alert>

                <List sx={{ bgcolor: 'background.paper', borderRadius: 2, mb: 2, border: '1px solid #ddd' }}>
                    {surveys.length === 0 ? (
                        <ListItem>
                            <ListItemText primary="생성된 설문이 없습니다." />
                        </ListItem>
                    ) : (
                        surveys.map((sy) => (
                            <ListItem 
                                key={sy.id} 
                                divider 
                                sx={{ bgcolor: sy.id === activeSurveyId ? '#e8f5e9' : 'inherit' }}
                            >
                                <ListItemText 
                                    primary={<strong>{sy.title}</strong>} 
                                />
                                {sy.id !== activeSurveyId && (
                                    <Button 
                                        variant="outlined" 
                                        color="success" 
                                        size="small" 
                                        onClick={() => handleSetActiveSurvey(sy.id)}
                                        disabled={loading}
                                    >
                                        🟢 이 설문 활성화
                                    </Button>
                                )}
                                {sy.id === activeSurveyId && (
                                    <Chip label="✅ 활성 상태" color="success" size="small" />
                                )}
                                {sy.id !== activeSurveyId && (
                                    <IconButton 
                                        edge="end" 
                                        aria-label="delete" 
                                        color="error" 
                                        onClick={() => handleDeleteSurvey(sy.id)}
                                        disabled={loading}
                                        sx={{ ml: 2 }}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                )}
                                <Button 
                                    variant="contained" 
                                    size="small" 
                                    color="secondary" 
                                    onClick={() => router.push(`/admin/surveys/${sy.id}`)}
                                    sx={{ ml: 2 }}
                                >
                                    문항 편집
                                </Button>
                                <Button 
                                    variant="contained" 
                                    size="small" 
                                    color="info" 
                                    onClick={() => router.push(`/admin/surveys/${sy.id}/results`)}
                                    sx={{ ml: 1 }}
                                >
                                    📊 결과
                                </Button>
                            </ListItem>
                        ))
                    )}
                </List>

                <Typography variant="body2" color="text.secondary">
                    * 각 설문의 &apos;문항 편집&apos; 버튼을 눌러 상세 질문을 구성할 수 있습니다.
                </Typography>
            </Paper>

            {/* 설문 생성 다이얼로그 */}
            <Dialog open={isCreateDialogOpen} onClose={() => setCreateDialogOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>새 설문조사 만들기</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="설문 제목"
                        fullWidth
                        variant="outlined"
                        sx={{ mt: 1 }}
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="설문 설명"
                        fullWidth
                        multiline
                        rows={3}
                        variant="outlined"
                        sx={{ mt: 2 }}
                        value={newDesc}
                        onChange={(e) => setNewDesc(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCreateDialogOpen(false)}>취소</Button>
                    <Button 
                        onClick={handleCreateSurvey} 
                        variant="contained" 
                        color="secondary"
                        disabled={loading || !newTitle.trim()}
                    >
                        열기
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
