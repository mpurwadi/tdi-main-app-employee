import AdminDashboard from '@/components/admin/dashboard';
import { verifyAuth, isAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';
import React from 'react';

export const metadata = {
    title: 'Admin Dashboard',
};

export const dynamic = 'force-dynamic';

const DashboardPage = () => {
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

    // If authorized, render the admin dashboard component.
    return (
        <div>
            <AdminDashboard />
        </div>
    );
};

export default DashboardPage;