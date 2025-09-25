'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';

const ITSMReportsPage = () => {
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const [loading, setLoading] = useState(true);
    const [reports, setReports] = useState<any[]>([]); // This would typically be fetched from an API

    useEffect(() => {
        // Simulate fetching reports or report types
        const mockReports = [
            { id: 1, name: 'Service Request Trends', description: 'Analysis of service request volume and resolution times.' },
            { id: 2, name: 'Service Catalog Usage', description: 'Insights into most requested services and categories.' },
            { id: 3, name: 'Change Management Success Rate', description: 'Metrics on successful vs. failed change requests.' },
            { id: 4, name: 'Internal Billing Overview', description: 'Summary of inter-division billing and payments.' },
        ];
        setReports(mockReports);
        setLoading(false);
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">ITSM Reports</h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Generate and view various reports related to IT Service Management.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reports.map((report) => (
                    <div key={report.id} className={`rounded-lg p-6 ${themeConfig.theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow`}>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{report.name}</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{report.description}</p>
                        <button className="btn btn-outline-primary">
                            View Report
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ITSMReportsPage;
