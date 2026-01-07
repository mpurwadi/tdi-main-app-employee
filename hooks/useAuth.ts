'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthPayload } from '@/lib/auth-helpers'; // Import AuthPayload from auth-helpers

interface UseAuthResult {
    isAuthenticated: boolean;
    user: AuthPayload | null;
    loading: boolean;
    error: string | null;
}

export function useAuth(): UseAuthResult {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<AuthPayload | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch('/api/auth/me'); // Endpoint to get current user's info
                if (!response.ok) {
                    // If not authenticated, clear user and redirect to login
                    setIsAuthenticated(false);
                    setUser(null);
                    router.push('/auth/boxed-signin'); // Redirect to login page
                    return;
                }
                const userData: AuthPayload = await response.json();
                setIsAuthenticated(true);
                setUser(userData);
            } catch (err: any) {
                setError('Authentication failed: ' + err.message);
                setIsAuthenticated(false);
                setUser(null);
                router.push('/auth/boxed-signin'); // Redirect to login page on error
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [router]);

    return { isAuthenticated, user, loading, error };
}