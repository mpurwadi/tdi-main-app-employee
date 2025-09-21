// app/(defaults)/users/profile/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import Swal from 'sweetalert2';

interface UserProfile {
    full_name: string;
    email: string;
    student_id: string;
    campus: string;
    division: string;
}

const PasswordResetForm = () => {
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState<any>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const validatePasswordForm = () => {
        let newErrors: any = {};
        if (!passwordData.currentPassword) newErrors.currentPassword = 'Current password is required';
        if (!passwordData.newPassword) {
            newErrors.newPassword = 'New password is required';
        } else if (passwordData.newPassword.length < 6) {
            newErrors.newPassword = 'Password must be at least 6 characters';
        }
        if (!passwordData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your new password';
        } else if (passwordData.newPassword !== passwordData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validatePasswordForm()) return;

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/users/profile/reset-password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                }),
            });

            const result = await response.json();

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Password Updated!',
                    text: 'Your password has been updated successfully.',
                    padding: '2em',
                    customClass: {
                        container: 'sweet-alerts'
                    },
                });
                // Reset form
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Update Failed',
                    text: result.message || 'Failed to update password.',
                    padding: '2em',
                    customClass: {
                        container: 'sweet-alerts'
                    },
                });
            }
        } catch (error) {
            console.error('Error updating password:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'An unexpected error occurred. Please try again.',
                padding: '2em',
                customClass: {
                    container: 'sweet-alerts'
                },
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form className="space-y-5" onSubmit={handlePasswordSubmit}>
            <div>
                <label htmlFor="currentPassword">Current Password</label>
                <input
                    id="currentPassword"
                    type="password"
                    name="currentPassword"
                    placeholder="Enter Current Password"
                    className="form-input"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                />
                {errors.currentPassword && <div className="text-danger text-sm">{errors.currentPassword}</div>}
            </div>
            <div>
                <label htmlFor="newPassword">New Password</label>
                <input
                    id="newPassword"
                    type="password"
                    name="newPassword"
                    placeholder="Enter New Password"
                    className="form-input"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                />
                {errors.newPassword && <div className="text-danger text-sm">{errors.newPassword}</div>}
            </div>
            <div>
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                    id="confirmPassword"
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm New Password"
                    className="form-input"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                />
                {errors.confirmPassword && <div className="text-danger text-sm">{errors.confirmPassword}</div>}
            </div>
            <button 
                type="submit" 
                className="btn btn-primary !mt-6"
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Updating...' : 'Update Password'}
            </button>
        </form>
    );
};

const UserProfilePage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState<UserProfile>({
        full_name: '',
        email: '',
        student_id: '',
        campus: '',
        division: '',
    });
    const [errors, setErrors] = useState<any>({});

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await fetch('/api/users/profile', { credentials: 'include' });
                if (response.ok) {
                    const data = await response.json();
                    setUserData(data);
                } else {
                    // Handle error, e.g., redirect to login if not authenticated
                    router.push('/auth/boxed-signin');
                }
            } catch (error) {
                console.error('Failed to fetch user profile:', error);
                router.push('/auth/boxed-signin');
            } finally {
                setLoading(false);
            }
        };
        fetchUserProfile();
    }, [router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setUserData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const validateForm = () => {
        let newErrors: any = {};
        if (!userData.full_name) newErrors.full_name = 'Full Name is required';
        if (!userData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(userData.email)) {
            newErrors.email = 'Email is invalid';
        }
        if (!userData.student_id) newErrors.student_id = 'Student ID is required';
        if (!userData.campus) newErrors.campus = 'Campus is required';
        if (!userData.division) newErrors.division = 'Division is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Please correct the errors in the form.',
                padding: '2em',
                customClass: {
                    container: 'sweet-alerts'
                },
            });
            return;
        }

        try {
            const response = await fetch('/api/users/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Profile Updated!',
                    text: 'Your profile has been updated successfully.',
                    padding: '2em',
                    customClass: {
                        container: 'sweet-alerts'
                    },
                });
            } else {
                const errorData = await response.json();
                Swal.fire({
                    icon: 'error',
                    title: 'Update Failed',
                    text: errorData.message || 'Failed to update profile.',
                    padding: '2em',
                    customClass: {
                        container: 'sweet-alerts'
                    },
                });
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'An unexpected error occurred. Please try again.',
                padding: '2em',
                customClass: {
                    container: 'sweet-alerts'
                },
            });
        }
    };

    if (loading) {
        return <div>Loading profile...</div>;
    }

    return (
        <div className="panel">
            <h5 className="mb-5 text-lg font-semibold">User Profile</h5>
            <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="full_name">Full Name</label>
                    <input
                        id="full_name"
                        type="text"
                        name="full_name"
                        placeholder="Enter Full Name"
                        className="form-input"
                        value={userData.full_name}
                        onChange={handleChange}
                    />
                    {errors.full_name && <div className="text-danger text-sm">{errors.full_name}</div>}
                </div>
                <div>
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        placeholder="Enter Email"
                        className="form-input"
                        value={userData.email}
                        onChange={handleChange}
                        disabled // Email usually cannot be changed directly
                    />
                    {errors.email && <div className="text-danger text-sm">{errors.email}</div>}
                </div>
                <div>
                    <label htmlFor="student_id">Student ID</label>
                    <input
                        id="student_id"
                        type="text"
                        name="student_id"
                        placeholder="Enter Student ID"
                        className="form-input"
                        value={userData.student_id}
                        onChange={handleChange}
                    />
                    {errors.student_id && <div className="text-danger text-sm">{errors.student_id}</div>}
                </div>
                <div>
                    <label htmlFor="campus">Campus</label>
                    <input
                        id="campus"
                        type="text"
                        name="campus"
                        placeholder="Enter Campus"
                        className="form-input"
                        value={userData.campus}
                        onChange={handleChange}
                    />
                    {errors.campus && <div className="text-danger text-sm">{errors.campus}</div>}
                </div>
                <div>
                    <label htmlFor="division">Division</label>
                    <select
                        id="division"
                        name="division"
                        className="form-select"
                        value={userData.division}
                        onChange={handleChange}
                    >
                        <option value="">Select Division</option>
                        <option value="BA">BA</option>
                        <option value="QA">QA</option>
                        <option value="Developer">Developer</option>
                        <option value="UIUX">UIUX</option>
                        <option value="Multimedia">Multimedia</option>
                        <option value="Helpdesk">Helpdesk</option>
                    </select>
                    {errors.division && <div className="text-danger text-sm">{errors.division}</div>}
                </div>
                <button type="submit" className="btn btn-primary !mt-6">
                    Update Profile
                </button>
            </form>
            
            {/* Password Reset Section */}
            <div className="mt-10 panel">
                <h5 className="mb-5 text-lg font-semibold">Reset Password</h5>
                <PasswordResetForm />
            </div>
        </div>
    );
};

export default UserProfilePage;
