// components/ProtectedRoute.tsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { CircularProgress, Box } from '@mui/material';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, } = useUser();
    const router = useRouter();

    useEffect(() => {
        console.log('dsfdfdsf', isAuthenticated)
        if (!isAuthenticated) {
            router.push('/auth');
        }
    }, [, isAuthenticated, router]);

    return <>{isAuthenticated ? children : null}</>;
}
