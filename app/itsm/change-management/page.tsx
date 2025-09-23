'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import { useSearchParams } from 'next/navigation';

const ChangeManagementPage = () => {
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const [changeRequests, setChangeRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [userRole, setUserRole] = useState<string>('');
    const [userDivision, setUserDivision] = useState<string>('');

    const searchParams = useSearchParams();
    const tab = searchParams.get('tab') || 'my-changes';

    // Fetch change requests
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // In a real implementation, you would fetch this data from the API
                // For now, we'll use mock data
                
                // Mock change requests data
                const mockChangeRequests = [
                    {
                        id: 1,
                        title: 'Upgrade database server to version 15',
                        requester_name: 'John Doe',
                        change_manager_name: 'Jane Smith',
                        implementer_name: 'Mike Johnson',
                        priority: 'high',
                        risk_level: 'medium',
                        status: 'approved',
                        created_at: '2025-09-15',
                        schedule_date: '2025-09-25'
                    },
                    {
                        id: 2,
                        title: 'Implement new authentication system',
                        requester_name: 'Alice Johnson',
                        change_manager_name: 'Bob Wilson',
                        implementer_name: null,
                        priority: 'critical',
                        risk_level: 'high',
                        status: 'submitted',
                        created_at: '2025-09-10',
                        schedule_date: null
                    },
                    {
                        id: 3,
                        title: 'Update firewall rules for new application',
                        requester_name: 'Charlie Brown',
                        change_manager_name: 'Diana Lee',
                        implementer_name: 'Eve Wilson',
                        priority: 'medium',
                        risk_level: 'low',
                        status: 'completed',
                        created_at: '2025-09-05',
                        schedule_date: '2025-09-12'
                    }
                ];
                
                // Mock user data
                const mockUser = {
                    role: 'change_requester',
                    division: 'DevOps'
                };
                
                setChangeRequests(mockChangeRequests);
                setUserRole(mockUser.role);
                setUserDivision(mockUser.division);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, []);

    // Filter change requests based on search and filters
    const filteredChangeRequests = changeRequests.filter(request => {
        const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             request.requester_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    const statuses = ['all', 'submitted', 'under_review', 'approved', 'scheduled', 'in_progress', 'completed', 'failed', 'cancelled'];
    const priorities = ['low', 'medium', 'high', 'critical'];
    const riskLevels = ['low', 'medium', 'high', 'critical'];

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
                    Manage and track infrastructure and application changes
                </p>
            </div>

            {/* Tabs */}
            <div className="mb-6">
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <ul className="flex flex-wrap -mb-px">
                        <li className="mr-2">
                            <button
                                className={`inline-block p-4 rounded-t-lg border-b-2 ${
                                    tab === 'my-changes'
                                        ? 'text-primary border-primary dark:text-primary dark:border-primary'
                                        : 'border-transparent text-gray-500 hover:text-gray-600 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                                onClick={() => window.history.pushState({}, '', '?tab=my-changes')}
                            >
                                My Changes
                            </button>
                        </li>
                        <li className="mr-2">
                            <button
                                className={`inline-block p-4 rounded-t-lg border-b-2 ${
                                    tab === 'create'
                                        ? 'text-primary border-primary dark:text-primary dark:border-primary'
                                        : 'border-transparent text-gray-500 hover:text-gray-600 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                                onClick={() => window.history.pushState({}, '', '?tab=create')}
                            >
                                Create Change
                            </button>
                        </li>
                        {(userRole === 'change_manager' || userRole === 'admin' || userRole === 'superadmin') && (
                            <li className="mr-2">
                                <button
                                    className={`inline-block p-4 rounded-t-lg border-b-2 ${
                                        tab === 'approvals'
                                            ? 'text-primary border-primary dark:text-primary dark:border-primary'
                                            : 'border-transparent text-gray-500 hover:text-gray-600 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                                    onClick={() => window.history.pushState({}, '', '?tab=approvals')}
                                >
                                    CAB Approvals
                                </button>
                            </li>
                        )}
                        {(userRole === 'implementer' || userRole === 'admin' || userRole === 'superadmin') && (
                            <li className="mr-2">
                                <button
                                    className={`inline-block p-4 rounded-t-lg border-b-2 ${
                                        tab === 'implementations'
                                            ? 'text-primary border-primary dark:text-primary dark:border-primary'
                                            : 'border-transparent text-gray-500 hover:text-gray-600 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                                    onClick={() => window.history.pushState({}, '', '?tab=implementations')}
                                >
                                    My Implementations
                                </button>
                            </li>
                        )}
                        <li className="mr-2">
                            <button
                                className={`inline-block p-4 rounded-t-lg border-b-2 ${
                                    tab === 'calendar'
                                        ? 'text-primary border-primary dark:text-primary dark:border-primary'
                                        : 'border-transparent text-gray-500 hover:text-gray-600 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                                onClick={() => window.history.pushState({}, '', '?tab=calendar')}
                            >
                                Change Calendar
                            </button>
                        </li>
                    </ul>
                </div>
            </div>

            {tab === 'my-changes' && (
                <>
                    {/* Filters */}
                    <div className={`mb-6 p-4 rounded-lg ${themeConfig.theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow`}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Search
                                </label>
                                <input
                                    type="text"
                                    placeholder="Search changes..."
                                    className="form-input w-full"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Status
                                </label>
                                <select
                                    className="form-select w-full"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    {statuses.map(status => (
                                        <option key={status} value={status}>
                                            {status === 'all' ? 'All Statuses' : status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-end">
                                <button
                                    className="btn btn-primary w-full"
                                    onClick={() => window.history.pushState({}, '', '?tab=create')}
                                >
                                    New Change
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Change requests table */}
                    {filteredChangeRequests.length === 0 ? (
                        <div className={`rounded-lg p-8 text-center ${themeConfig.theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No change requests found</h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                Try adjusting your search or filter criteria
                            </p>
                        </div>
                    ) : (
                        <div className={`rounded-lg overflow-hidden ${themeConfig.theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow`}>
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className={`${themeConfig.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Change Request
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Requester
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Priority
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Risk
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Scheduled
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${themeConfig.theme === 'dark' ? 'divide-gray-700 bg-gray-800' : 'divide-gray-200 bg-white'}`}>
                                    {filteredChangeRequests.map((request) => (
                                        <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">{request.title}</div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">ID: CR-{request.id}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {request.requester_name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    request.priority === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                                    request.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                                                    request.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                }`}>
                                                    {request.priority}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    request.risk_level === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                                    request.risk_level === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                                                    request.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                }`}>
                                                    {request.risk_level}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    request.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                                    request.status === 'approved' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                                    request.status === 'submitted' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                                    request.status === 'in_progress' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                                                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                                }`}>
                                                    {request.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {request.schedule_date || 'Not scheduled'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button className="text-primary hover:text-primary-hover dark:text-primary dark:hover:text-primary-hover">
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}

            {tab === 'create' && (
                <div className={`rounded-lg p-6 ${themeConfig.theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow`}>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Create New Change Request</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Submit a change request for infrastructure or application changes
                    </p>
                    
                    <form>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Change Title *
                                </label>
                                <input
                                    type="text"
                                    className="form-input w-full"
                                    placeholder="Enter change title"
                                />
                            </div>
                            
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Description *
                                </label>
                                <textarea
                                    className="form-textarea w-full"
                                    rows={4}
                                    placeholder="Describe the change in detail"
                                ></textarea>
                            </div>
                            
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Reason for Change *
                                </label>
                                <textarea
                                    className="form-textarea w-full"
                                    rows={3}
                                    placeholder="Explain why this change is needed"
                                ></textarea>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Priority
                                </label>
                                <select
                                    className="form-select w-full"
                                >
                                    {priorities.map(priority => (
                                        <option key={priority} value={priority}>
                                            {priority.charAt(0).toUpperCase() + priority.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Risk Level
                                </label>
                                <select
                                    className="form-select w-full"
                                >
                                    {riskLevels.map(risk => (
                                        <option key={risk} value={risk}>
                                            {risk.charAt(0).toUpperCase() + risk.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Impact Assessment
                                </label>
                                <textarea
                                    className="form-textarea w-full"
                                    rows={3}
                                    placeholder="Describe the potential impact of this change"
                                ></textarea>
                            </div>
                            
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Rollback Plan *
                                </label>
                                <textarea
                                    className="form-textarea w-full"
                                    rows={3}
                                    placeholder="Describe how to rollback this change if needed"
                                ></textarea>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Proposed Implementation Date
                                </label>
                                <input
                                    type="date"
                                    className="form-input w-full"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Rollback Deadline
                                </label>
                                <input
                                    type="date"
                                    className="form-input w-full"
                                />
                            </div>
                        </div>
                        
                        <div className="mt-8 flex justify-end space-x-3">
                            <button
                                type="button"
                                className="btn btn-outline"
                                onClick={() => window.history.pushState({}, '', '?tab=my-changes')}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                            >
                                Submit Change Request
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {tab === 'approvals' && (
                <div className={`rounded-lg p-6 ${themeConfig.theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow`}>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">CAB Approvals</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Review and approve pending change requests
                    </p>
                    
                    {/* Pending approvals table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className={`${themeConfig.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Change Request
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Requester
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Priority
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Risk
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Submitted
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${themeConfig.theme === 'dark' ? 'divide-gray-700 bg-gray-800' : 'divide-gray-200 bg-white'}`}>
                                {changeRequests.filter(r => r.status === 'submitted').map((request) => (
                                    <tr key={request.id}>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">{request.title}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">ID: CR-{request.id}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {request.requester_name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                request.priority === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                                request.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                                                request.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                                'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                            }`}>
                                                {request.priority}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                request.risk_level === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                                request.risk_level === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                                                request.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                                'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                            }`}>
                                                {request.risk_level}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {request.created_at}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 mr-3">
                                                Approve
                                            </button>
                                            <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                                                Reject
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {tab === 'implementations' && (
                <div className={`rounded-lg p-6 ${themeConfig.theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow`}>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">My Implementations</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Changes assigned to you for implementation
                    </p>
                    
                    {/* Assigned implementations table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className={`${themeConfig.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Change Request
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Requester
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Priority
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Scheduled
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${themeConfig.theme === 'dark' ? 'divide-gray-700 bg-gray-800' : 'divide-gray-200 bg-white'}`}>
                                {changeRequests.filter(r => r.status === 'approved' || r.status === 'scheduled' || r.status === 'in_progress').map((request) => (
                                    <tr key={request.id}>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">{request.title}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">ID: CR-{request.id}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {request.requester_name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                request.priority === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                                request.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                                                request.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                                'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                            }`}>
                                                {request.priority}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                request.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                                request.status === 'approved' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                                request.status === 'scheduled' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                                                request.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                            }`}>
                                                {request.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {request.schedule_date || 'Not scheduled'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button className="text-primary hover:text-primary-hover dark:text-primary dark:hover:text-primary-hover mr-3">
                                                View
                                            </button>
                                            <button className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">
                                                Complete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {tab === 'calendar' && (
                <div className={`rounded-lg p-6 ${themeConfig.theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow`}>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Change Calendar</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        View scheduled changes
                    </p>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">
                                    {day}
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                            {Array.from({ length: 35 }).map((_, i) => {
                                const day = i - 5; // Adjust for starting day
                                const isCurrentMonth = day > 0 && day <= 30;
                                const hasChanges = day === 12 || day === 25; // Mock change dates
                                
                                return (
                                    <div 
                                        key={i} 
                                        className={`min-h-24 p-1 border rounded ${
                                            isCurrentMonth 
                                                ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600' 
                                                : 'bg-gray-100 dark:bg-gray-900 border-transparent'
                                        }`}
                                    >
                                        {isCurrentMonth && (
                                            <>
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {day}
                                                </div>
                                                {hasChanges && (
                                                    <div className="mt-1">
                                                        <div className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded px-1 py-0.5 truncate">
                                                            CR-1: DB Upgrade
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChangeManagementPage;