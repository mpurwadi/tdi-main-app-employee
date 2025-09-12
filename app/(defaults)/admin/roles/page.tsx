import AdminRolesManagement from '@/components/admin/roles-management';
import { verifyAuth, isAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';
import React from 'react';

export const metadata = {
    title: 'Roles Management',
};

const RolesManagementPage = () => {
    try {
        const auth = verifyAuth();
        // Only superadmins can manage roles
        if (auth.role !== 'superadmin') {
            redirect('/');
        }
    } catch (error) {
        // If not authenticated, redirect to the login page.
        redirect('/auth/boxed-signin');
    }

    // If authorized, render the roles management component.
    return (
        <div>
            <AdminRolesManagement />
        </div>
    );
};

export default RolesManagementPage;