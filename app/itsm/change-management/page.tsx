'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';

const ChangeManagementPage = () => {
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const [changes, setChanges] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Mock data for demonstration
    const mockChanges = [
        {
            id: 1,
            title: 'Database Server Upgrade',
            description: 'Upgrade PostgreSQL from version 12 to 15',
            requester: 'Alex Johnson',
            change_manager: 'Sarah Wilson',
            implementer: 'Mike Chen',
            status: 'approved',
            priority: 'high',
            risk_level: 'high',
            created_at: '2025-09-15',
            schedule_date: '2025-09-25'
        },
        {
            id: 2,
            title: 'API Gateway Implementation',
            description: 'Implement new API gateway for microservices',
            requester: 'Maria Garcia',
            change_manager: 'David Lee',
            implementer: 'Tom Wilson',
            status: 'in_progress',
            priority: 'medium',
            risk_level: 'medium',
            created_at: '2025-09-10',
            schedule_date: '2025-09-20'
        },
        {
            id: 3,
            title: 'Mobile App Security Patch',
            description: 'Apply critical security patches to mobile application',
            requester: 'Robert Taylor',
            change_manager: 'Lisa Wong',
            implementer: 'James Smith',
            status: 'submitted',
            priority: 'critical',
            risk_level: 'low',
            created_at: '2025-09-18',
            schedule_date: null
        },
        {
            id: 4,
            title: 'Load Balancer Configuration',
            description: 'Update load balancer configuration for new services',
            requester: 'Jennifer Brown',
            change_manager: 'Michael Davis',
            implementer: 'Kevin Lee',
            status: 'completed',
            priority: 'medium',
            risk_level: 'medium',
            created_at: '2025-09-01',
            schedule_date: '2025-09-10',
            completed_at: '2025-09-10'
        }
    ];

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setChanges(mockChanges);
            setLoading(false);
        }, 1000);
    }, []);

    // Filter changes based on active tab and search term
    const filteredChanges = changes.filter(change => {
        const matchesSearch = change.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             change.description.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (activeTab === 'all') return matchesSearch;
        return matchesSearch && change.status === activeTab;
    });

    // Get counts for tabs
    const allCount = changes.length;
    const submittedCount = changes.filter(c => c.status === 'submitted').length;
    const approvedCount = changes.filter(c => c.status === 'approved').length;
    const inProgressCount = changes.filter(c => c.status === 'in_progress').length;
    const completedCount = changes.filter(c => c.status === 'completed').length;

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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Change Management</h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Submit, review, and track infrastructure and application changes
                </p>
            </div>

            {/* Tabs */}
            <div className="mb-6">
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="-mb-px flex space-x-8 overflow-x-auto">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'all'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                        >
                            All Changes
                            <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-gray-500 rounded-full">
                                {allCount}
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab('submitted')}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'submitted'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                        >
                            Submitted
                            <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-yellow-500 rounded-full">
                                {submittedCount}
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab('approved')}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'approved'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                        >
                            Approved
                            <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-500 rounded-full">
                                {approvedCount}
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab('in_progress')}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'in_progress'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                        >
                            In Progress
                            <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-purple-500 rounded-full">
                                {inProgressCount}
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab('completed')}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'completed'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                        >
                            Completed
                            <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-green-500 rounded-full">
                                {completedCount}
                            </span>
                        </button>
                    </nav>
                </div>
            </div>

            {/* Search and New Change Button */}
            <div className={`mb-6 p-4 rounded-lg ${themeConfig.theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow`}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Search changes..."
                            className="form-input w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="btn btn-primary whitespace-nowrap">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        New Change Request
                    </button>
                </div>
            </div>

            {/* Changes table */}
            {filteredChanges.length === 0 ? (
                <div className={`rounded-lg p-8 text-center ${themeConfig.theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No changes found</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        Try adjusting your search or filter criteria
                    </p>
                </div>
            ) : (
                <div className={`rounded-lg shadow-md overflow-hidden ${themeConfig.theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Change Request
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Requester
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Priority
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Risk
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Schedule
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredChanges.map((change) => (
                                    <tr key={change.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {change.title}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                {change.description.substring(0, 60)}...
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 dark:text-white">
                                                {change.requester}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                change.status === 'submitted' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                                change.status === 'approved' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                                change.status === 'in_progress' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                                                change.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                            }`}>
                                                {change.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                change.priority === 'low' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                                change.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                                change.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                                                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                            }`}>
                                                {change.priority}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                change.risk_level === 'low' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                                change.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                                change.risk_level === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                                                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                            }`}>
                                                {change.risk_level}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            {change.schedule_date || 'Not scheduled'}
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-medium">
                                            <button className="text-primary hover:text-primary/80">
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Change Calendar */}
            <div className={`mt-8 rounded-lg shadow-md p-6 ${themeConfig.theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Change Calendar</h2>
                    <button className="text-sm text-primary hover:text-primary/80">
                        View Full Calendar
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                        <div key={day} className="text-center p-2">
                            <div className="font-medium text-gray-900 dark:text-white">{day}</div>
                            <div className={`mt-1 h-20 rounded border ${
                                themeConfig.theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                            }`}>
                                {index === 3 && (
                                    <div className="p-1">
                                        <div className="bg-blue-100 text-blue-800 text-xs p-1 rounded mb-1 dark:bg-blue-900 dark:text-blue-200">
                                            DB Upgrade
                                        </div>
                                    </div>
                                )}
                                {index === 5 && (
                                    <div className="p-1">
                                        <div className="bg-purple-100 text-purple-800 text-xs p-1 rounded mb-1 dark:bg-purple-900 dark:text-purple-200">
                                            API Gateway
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ChangeManagementPage;