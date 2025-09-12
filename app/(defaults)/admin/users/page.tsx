import UserManagementComponent from '@/components/admin/user-management';
import { verifyAuth, isAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';
import React from 'react';

export const metadata = {
    title: 'User Management',
};

const UserManagementPage = () => {
    try {
        const auth = verifyAuth();
        if (!isAdmin(auth)) {
            // If not an admin, redirect to the homepage.
            redirect('/');
        }
    } catch (error) {
        // If not authenticated, redirect to the login page.
        redirect('/auth/boxed-signin');
    }

    // If authorized, render the user management component.
    return (
        <div>
            <UserManagementComponent />
        </div>
    );
};

export default UserManagementPage;