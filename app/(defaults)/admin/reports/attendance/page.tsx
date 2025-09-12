import AttendanceReport from '@/components/admin/reports/attendance-report';
import { verifyAuth, isAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';
import React from 'react';

export const metadata = {
    title: 'Attendance Report',
};

const AttendanceReportPage = () => {
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

    // If authorized, render the attendance report component.
    return (
        <div>
            <AttendanceReport />
        </div>
    );
};

export default AttendanceReportPage;