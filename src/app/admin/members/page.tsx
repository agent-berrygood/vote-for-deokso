'use client';

import { Box, Container, Typography, Breadcrumbs, Link, Paper } from '@mui/material';
import MemberManager from '@/components/MemberManager';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

export default function AdminMembersPage() {
    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
                    <Link underline="hover" color="inherit" href="/admin">
                        관리자 홈
                    </Link>
                    <Typography color="text.primary">교인 명부 관리</Typography>
                </Breadcrumbs>
                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mt: 2 }}>
                    통합 교인 명부 관리 (설문용)
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    전송된 설문조사에 참여하는 교인들의 명단을 관리합니다. 설문 모드에서 명부에 없는 분이 참여할 경우 '자가등록'으로 표시됩니다.
                </Typography>
            </Box>

            <Paper sx={{ p: 0, overflow: 'hidden', boxShadow: 3, borderRadius: 2 }}>
                <MemberManager />
            </Paper>
        </Container>
    );
}
