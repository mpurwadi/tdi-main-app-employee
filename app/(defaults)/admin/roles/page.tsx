import AdminRolesManagement from '@/components/admin/roles-management';
import { verifyAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import React from 'react';

export const metadata = {
    title: 'Roles Management',
};

const RolesManagementPage = async () => {
    try {
        const auth = await verifyAuth();
        // Only superadmins can manage roles
        if (auth.role !== 'superadmin') {
            redirect('/');
        }
    } catch (error) {
        // If not authenticated, redirect to the login page.
        redirect('/auth/cover-login');
    }

    // If authorized, render the roles management component.
    return (
        <div>
            <AdminRolesManagement />
        </div>
    );
};

export default RolesManagementPage;