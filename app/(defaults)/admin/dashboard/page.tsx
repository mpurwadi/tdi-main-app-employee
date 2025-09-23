import AdminDashboard from '@/components/admin/dashboard';
import React from 'react';

export const metadata = {
    title: 'Admin Dashboard',
};

export const dynamic = 'force-dynamic';

const DashboardPage = () => {
    return (
        <div>
            <AdminDashboard />
        </div>
    );
};

export default DashboardPage;