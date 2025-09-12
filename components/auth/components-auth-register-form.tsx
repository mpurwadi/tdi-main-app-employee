'use client';
import IconBookmark from '@/components/icon/icon-bookmark';
import IconLockDots from '@/components/icon/icon-lock-dots';
import IconMail from '@/components/icon/icon-mail';
import IconUser from '@/components/icon/icon-user';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

const ComponentsAuthRegisterForm = () => {
    const router = useRouter();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        passwordConfirm: '',
        studentId: '',
        campus: '',
        division: '',
    });
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        if (formData.password !== formData.passwordConfirm) {
            setError('Passwords do not match');
            return;
        }

        // Password strength check (basic)
        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fullName: formData.fullName,
                    email: formData.email,
                    password: formData.password,
                    studentId: formData.studentId,
                    campus: formData.campus,
                    division: formData.division,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            // On success, you might want to redirect or show a message
            alert('Registration successful! Please wait for admin approval.');
            router.push('/auth/boxed-signin');
        } catch (err: any) {
            setError(err.message);
        }
    };

    const divisions = ['BA', 'QA', 'Developer', 'UIUX', 'Multimedia', 'Helpdesk'];

    return (
        <form className="space-y-5 dark:text-white" onSubmit={handleSubmit}>
            <div>
                <label htmlFor="fullName">Full Name</label>
                <div className="relative text-white-dark">
                    <input id="fullName" name="fullName" type="text" placeholder="Enter Full Name" className="form-input ps-10 placeholder:text-white-dark" value={formData.fullName} onChange={handleChange} required />
                    <span className="absolute start-4 top-1/2 -translate-y-1/2">
                        <IconUser fill={true} />
                    </span>
                </div>
            </div>
            <div>
                <label htmlFor="email">Email</label>
                <div className="relative text-white-dark">
                    <input id="email" name="email" type="email" placeholder="Enter Email" className="form-input ps-10 placeholder:text-white-dark" value={formData.email} onChange={handleChange} required />
                    <span className="absolute start-4 top-1/2 -translate-y-1/2">
                        <IconMail fill={true} />
                    </span>
                </div>
            </div>
            <div>
                <label htmlFor="password">Password</label>
                <div className="relative text-white-dark">
                    <input id="password" name="password" type="password" placeholder="Enter Password" className="form-input ps-10 placeholder:text-white-dark" value={formData.password} onChange={handleChange} required />
                    <span className="absolute start-4 top-1/2 -translate-y-1/2">
                        <IconLockDots fill={true} />
                    </span>
                </div>
            </div>
            <div>
                <label htmlFor="passwordConfirm">Confirm Password</label>
                <div className="relative text-white-dark">
                    <input id="passwordConfirm" name="passwordConfirm" type="password" placeholder="Confirm Password" className="form-input ps-10 placeholder:text-white-dark" value={formData.passwordConfirm} onChange={handleChange} required />
                    <span className="absolute start-4 top-1/2 -translate-y-1/2">
                        <IconLockDots fill={true} />
                    </span>
                </div>
            </div>
            <div>
                <label htmlFor="studentId">Student ID</label>
                <div className="relative text-white-dark">
                    <input id="studentId" name="studentId" type="text" placeholder="Enter Student ID" className="form-input ps-10 placeholder:text-white-dark" value={formData.studentId} onChange={handleChange} required />
                    <span className="absolute start-4 top-1/2 -translate-y-1/2">
                        {/* Using a generic icon, replace if a specific one exists */}
                        <IconUser fill={true} />
                    </span>
                </div>
            </div>
            <div>
                <label htmlFor="campus">Campus</label>
                <div className="relative text-white-dark">
                    <input id="campus" name="campus" type="text" placeholder="Enter Campus" className="form-input ps-10 placeholder:text-white-dark" value={formData.campus} onChange={handleChange} required />
                    <span className="absolute start-4 top-1/2 -translate-y-1/2">
                        {/* Using a generic icon, replace if a specific one exists */}
                        <IconBookmark fill={true} />
                    </span>
                </div>
            </div>
            <div>
                <label htmlFor="division">Division</label>
                <select id="division" name="division" className="form-select text-white-dark" value={formData.division} onChange={handleChange} required>
                    <option value="">Select Division</option>
                    {divisions.map((div) => (
                        <option key={div} value={div}>
                            {div}
                        </option>
                    ))}
                </select>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button type="submit" className="btn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]">
                Sign Up
            </button>
        </form>
    );
};

export default ComponentsAuthRegisterForm;