'use client';
import IconLockDots from '@/components/icon/icon-lock-dots';
import IconMail from '@/components/icon/icon-mail';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

const ComponentsAuthLoginForm = () => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            // On successful login, the API sets a cookie.
            // Redirect based on user role.
            const userRole = data.role;
            if (userRole === 'superadmin' || userRole === 'admin') {
                router.push('/admin/approval'); // Redirect to admin approval page
            } else if (userRole === 'user') {
                router.push('/user-dashboard'); // Redirect to the new user dashboard
            } else {
                router.push('/'); // Fallback to home if role is unknown
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <form className="space-y-5 dark:text-white" onSubmit={handleSubmit}>
            <div>
                <label htmlFor="email">Email</label>
                <div className="relative text-white-dark">
                    <input id="email" type="email" placeholder="Enter Email" className="form-input ps-10 placeholder:text-white-dark" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <span className="absolute start-4 top-1/2 -translate-y-1/2">
                        <IconMail fill={true} />
                    </span>
                </div>
            </div>
            <div>
                <label htmlFor="password">Password</label>
                <div className="relative text-white-dark">
                    <input id="password" type="password" placeholder="Enter Password" className="form-input ps-10 placeholder:text-white-dark" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <span className="absolute start-4 top-1/2 -translate-y-1/2">
                        <IconLockDots fill={true} />
                    </span>
                </div>
            </div>
            
            {error && (
                <div className="p-3.5 rounded-md bg-danger-light text-danger">
                    {error}
                </div>
            )}

            <button type="submit" className="btn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]">
                Sign in
            </button>
        </form>
    );
};

export default ComponentsAuthLoginForm;