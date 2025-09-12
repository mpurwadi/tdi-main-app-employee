
import UserApprovalComponent from '@/components/admin/user-approval';
import { verifyAuth, isAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';
import React from 'react';

export const metadata = {
    title: 'User Approval',
};

const UserApprovalPage = () => {
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

    // If authorized, render the approval component.
    return (
        <div>
            <UserApprovalComponent />
        </div>
    );
};

export default UserApprovalPage;
