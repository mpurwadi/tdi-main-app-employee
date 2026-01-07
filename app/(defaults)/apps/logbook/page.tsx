import LogbookComponent from '@/components/apps/logbook';
import { verifyAuthServer } from '@/lib/auth';
import { redirect } from 'next/navigation';
import React from 'react';

export const metadata = {
    title: 'Logbook',
};

const LogbookPage = async () => {
    try {
        const auth = await verifyAuthServer();
        // All authenticated users can access the logbook
    } catch (error) {
        // If not authenticated, redirect to the login page.
        redirect('/auth/boxed-signin');
    }

    // If authorized, render the logbook component.
    return (
        <div>
            <LogbookComponent />
        </div>
    );
};

export default LogbookPage;