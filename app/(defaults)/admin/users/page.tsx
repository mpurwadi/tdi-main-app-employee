import UserManagementComponent from '@/components/admin/user-management';
import React from 'react';

export const metadata = {
    title: 'User Management',
};

const UserManagementPage = () => {

        return (
        <div>
            <UserManagementComponent />
        </div>
    );
};

export default UserManagementPage;