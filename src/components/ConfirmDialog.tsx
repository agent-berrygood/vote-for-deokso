'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    TextField,
    CircularProgress,
    Alert
} from '@mui/material';

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
    /** 활성화 시 비밀번호 입력 후 서버 재인증을 거쳐야 확인 버튼이 동작합니다 */
    requireReAuth?: boolean;
}

export default function ConfirmDialog({
    open,
    title,
    description,
    onConfirm,
    onCancel,
    confirmLabel = "확인",
    cancelLabel = "취소",
    requireReAuth = false
}: ConfirmDialogProps) {
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState('');
    const [authLoading, setAuthLoading] = useState(false);

    const handleCancel = () => {
        setPassword('');
        setAuthError('');
        onCancel();
    };

    const handleConfirm = async () => {
        if (!requireReAuth) {
            onConfirm();
            return;
        }

        if (!password) {
            setAuthError('비밀번호를 입력해주세요.');
            return;
        }

        setAuthLoading(true);
        setAuthError('');

        try {
            const { reAuthenticateAdmin } = await import('@/app/actions/auth');
            const result = await reAuthenticateAdmin(password);

            if (result.success) {
                setPassword('');
                setAuthError('');
                onConfirm();
            } else {
                setAuthError(result.message || '재인증에 실패했습니다.');
            }
        } catch {
            setAuthError('재인증 처리 중 오류가 발생했습니다.');
        } finally {
            setAuthLoading(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleCancel}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">
                {title}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    {description}
                </DialogContentText>
                {requireReAuth && (
                    <>
                        <TextField
                            label="관리자 비밀번호 재입력"
                            type="password"
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setAuthError(''); }}
                            fullWidth
                            size="small"
                            sx={{ mt: 2 }}
                            error={!!authError}
                            disabled={authLoading}
                            autoFocus
                            onKeyDown={(e) => { if (e.key === 'Enter') handleConfirm(); }}
                        />
                        {authError && (
                            <Alert severity="error" sx={{ mt: 1 }}>
                                {authError}
                            </Alert>
                        )}
                    </>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCancel} color="inherit" disabled={authLoading}>
                    {cancelLabel}
                </Button>
                <Button
                    onClick={handleConfirm}
                    color="error"
                    autoFocus={!requireReAuth}
                    variant="contained"
                    disabled={authLoading || (requireReAuth && !password)}
                    startIcon={authLoading ? <CircularProgress size={16} color="inherit" /> : undefined}
                >
                    {authLoading ? '확인 중...' : confirmLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
