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
        // Skip check for login page
        if (pathname === '/admin/login') {
            setAuthorized(true);
            setLoading(false);
            return;
        }

        const auth = sessionStorage.getItem('admin_auth');
        if (auth === 'true') {
            setAuthorized(true);
        } else {
            router.replace('/admin/login');
        }
        setLoading(false);
    }, [pathname, router]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!authorized && pathname !== '/admin/login') {
        return null; // Or a restricted access message, but router.replace handles redirection
    }

    return <>{children}</>;
}
