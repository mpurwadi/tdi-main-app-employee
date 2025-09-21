'use client';

import { useState, useEffect } from 'react';

interface User {
    id: number;
    full_name: string;
    email: string;
    role: string;
    student_id?: string;
    campus?: string;
    division?: string;
}

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch('/api/users/me');
                if (!response.ok) {
                    throw new Error('Failed to fetch user');
                }
                const userData = await response.json();
                setUser(userData);
            } catch (error) {
                console.error('Error fetching user:', error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    return { user, loading };
}