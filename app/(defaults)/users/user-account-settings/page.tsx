'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import IconUser from '@/components/icon/icon-user';
import IconMail from '@/components/icon/icon-mail';
import IconBookmark from '@/components/icon/icon-bookmark';

interface UserProfile {
    id: number;
    full_name: string;
    email: string;
    student_id: string;
    campus: string;
    division: string;
    role: string;
}

const UserProfileSettings = () => {
    const router = useRouter();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const divisions = ['BA', 'QA', 'Developer', 'UIUX', 'Multimedia', 'Helpdesk'];

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await fetch('/api/users/me');
                if (!response.ok) {
                    if (response.status === 401) {
                        router.push('/auth/boxed-signin'); // Redirect to login if unauthorized
                        return;
                    }
                    throw new Error('Failed to fetch user profile');
                }
                const data: UserProfile = await response.json();
                setUser(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchUserProfile();
    }, [router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setUser((prev) => (prev ? { ...prev, [name]: value } : null));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        if (!user) return;

        try {
            const response = await fetch('/api/users/me', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fullName: user.full_name,
                    studentId: user.student_id,
                    campus: user.campus,
                    division: user.division,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update profile');
            }

            setSuccessMessage('Profile updated successfully!');
            // Optionally, refresh user data after update
            // fetchUserProfile();
        } catch (err: any) {
            setError(err.message);
        }
    };

    if (loading) {
        return <div>Loading profile...</div>;
    }

    if (error) {
        return <div className="p-3.5 rounded-md bg-danger-light text-danger">Error: {error}</div>;
    }

    if (!user) {
        return <div className="p-3.5 rounded-md bg-warning-light text-warning">No user data found.</div>;
    }

    return (
        <div className="panel">
            <h2 className="text-xl font-bold mb-4">User Profile Settings</h2>
            <form className="space-y-5 dark:text-white" onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="full_name">Full Name</label>
                    <div className="relative text-white-dark">
                        <input id="full_name" name="full_name" type="text" placeholder="Enter Full Name" className="form-input ps-10 placeholder:text-white-dark" value={user.full_name} onChange={handleChange} required />
                        <span className="absolute start-4 top-1/2 -translate-y-1/2">
                            <IconUser fill={true} />
                        </span>
                    </div>
                </div>
                <div>
                    <label htmlFor="email">Email</label>
                    <div className="relative text-white-dark">
                        <input id="email" name="email" type="email" placeholder="Enter Email" className="form-input ps-10 placeholder:text-white-dark" value={user.email} disabled />
                        <span className="absolute start-4 top-1/2 -translate-y-1/2">
                            <IconMail fill={true} />
                        </span>
                    </div>
                </div>
                <div>
                    <label htmlFor="student_id">Student ID</label>
                    <div className="relative text-white-dark">
                        <input id="student_id" name="student_id" type="text" placeholder="Enter Student ID" className="form-input ps-10 placeholder:text-white-dark" value={user.student_id} onChange={handleChange} required />
                        <span className="absolute start-4 top-1/2 -translate-y-1/2">
                            <IconUser fill={true} />
                        </span>
                    </div>
                </div>
                <div>
                    <label htmlFor="campus">Campus</label>
                    <div className="relative text-white-dark">
                        <input id="campus" name="campus" type="text" placeholder="Enter Campus" className="form-input ps-10 placeholder:text-white-dark" value={user.campus} onChange={handleChange} required />
                        <span className="absolute start-4 top-1/2 -translate-y-1/2">
                            <IconBookmark fill={true} />
                        </span>
                    </div>
                </div>
                <div>
                    <label htmlFor="division">Division</label>
                    <select id="division" name="division" className="form-select text-white-dark" value={user.division} onChange={handleChange} required>
                        <option value="">Select Division</option>
                        {divisions.map((div) => (
                            <option key={div} value={div}>
                                {div}
                            </option>
                        ))}
                    </select>
                </div>

                {successMessage && <p className="text-green-500 text-sm mt-4">{successMessage}</p>}
                {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

                <button type="submit" className="btn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]">
                    Update Profile
                </button>
            </form>
        </div>
    );
};

export default UserProfileSettings;