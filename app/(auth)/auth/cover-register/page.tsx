'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import IconMail from '@/components/icon/icon-mail';
import IconLockDots from '@/components/icon/icon-lock-dots';
import IconUser from '@/components/icon/icon-user';
import IconBookmark from '@/components/icon/icon-bookmark';
import IconEye from '@/components/icon/icon-eye';
import IconEyeOff from '@/components/icon/icon-eye-off';

const SimpleCoverRegister = () => {
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
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        if (formData.password !== formData.passwordConfirm) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        // Password strength check (basic)
        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Include credentials (cookies) in the request
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            // On success, you might want to redirect or show a message
            alert('Registration successful! Please wait for admin approval.');
            router.push('/auth/cover-login');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const divisions = ['BA', 'QA', 'Developer', 'UIUX', 'Multimedia', 'Helpdesk'];

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Create Account</h1>
                    <p className="text-gray-600 dark:text-gray-300">Sign up for a new account</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sm:p-8">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Full Name
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <IconUser className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    placeholder="Enter your full name"
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Email
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <IconMail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <IconLockDots className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <IconEyeOff className="h-5 w-5 text-gray-400" />
                                    ) : (
                                        <IconEye className="h-5 w-5 text-gray-400" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <IconLockDots className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="passwordConfirm"
                                    name="passwordConfirm"
                                    type={showPasswordConfirm ? "text" : "password"}
                                    placeholder="Confirm your password"
                                    className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    value={formData.passwordConfirm}
                                    onChange={handleChange}
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                                >
                                    {showPasswordConfirm ? (
                                        <IconEyeOff className="h-5 w-5 text-gray-400" />
                                    ) : (
                                        <IconEye className="h-5 w-5 text-gray-400" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Student ID
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <IconUser className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="studentId"
                                    name="studentId"
                                    type="text"
                                    placeholder="Enter your student ID"
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    value={formData.studentId}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label htmlFor="campus" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Campus
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <IconBookmark className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="campus"
                                    name="campus"
                                    type="text"
                                    placeholder="Enter your campus"
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    value={formData.campus}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="mb-6">
                            <label htmlFor="division" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Division
                            </label>
                            <select
                                id="division"
                                name="division"
                                className="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                value={formData.division}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Division</option>
                                {divisions.map((div) => (
                                    <option key={div} value={div}>
                                        {div}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {isLoading ? 'Creating account...' : 'Sign up'}
                        </button>
                    </form>
                </div>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Already have an account?{' '}
                        <Link href="/auth/cover-login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                            Sign in
                        </Link>
                    </p>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        &copy; {new Date().getFullYear()} TDI Service. All rights reserved.
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Made with Love by mpurwadi
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SimpleCoverRegister;