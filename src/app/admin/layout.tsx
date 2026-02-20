'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { CircularProgress, Box } from '@mui/material';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [authorized, setAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (pathname === '/admin/login') return;

        const auth = sessionStorage.getItem('admin_auth');
        if (auth === 'true') {
            // eslint-disable-next-line
            setAuthorized(true);
        } else {
            router.replace('/admin/login');
        }
        setLoading(false);
    }, [pathname, router]);

    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!authorized) {
        return null;
    }

    return <>{children}</>;
}
