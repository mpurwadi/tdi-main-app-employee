import AttendanceReport from '@/components/admin/reports/attendance-report';
import React from 'react';

export const metadata = {
    title: 'Attendance Report',
};

export const dynamic = 'force-dynamic';

const AttendanceReportPage = () => {

        return (
        <div>
            <AttendanceReport />
        </div>
    );
};

export default AttendanceReportPage;