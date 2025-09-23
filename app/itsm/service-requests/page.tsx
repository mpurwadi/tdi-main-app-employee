'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import { useSearchParams } from 'next/navigation';
import { formatToRupiah } from '@/utils/localeUtils';

const ServiceRequestsPage = () => {
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const [requests, setRequests] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [userRole, setUserRole] = useState<string>('');
    const [userDivision, setUserDivision] = useState<string>('');

    const searchParams = useSearchParams();
    const tab = searchParams.get('tab') || 'my-requests';

    // Fetch requests and services
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // In a real implementation, you would fetch this data from the API
                // For now, we'll use mock data
                
                // Mock requests data
                const mockRequests = [
                    {
                        id: 1,
                        title: 'Request for new development server',
                        service_name: 'Server Provisioning',
                        requester_name: 'John Doe',
                        approver_name: 'Jane Smith',
                        priority: 'high',
                        status: 'approved',
                        created_at: '2025-09-15',
                        cost: 150.00
                    },
                    {
                        id: 2,
                        title: 'Monthly data analysis report',
                        service_name: 'Data Analysis Report',
                        requester_name: 'Alice Johnson',
                        approver_name: 'Bob Wilson',
                        priority: 'medium',
                        status: 'completed',
                        created_at: '2025-09-10',
                        cost: 75.00
                    },
                    {
                        id: 3,
                        title: 'Custom application development',
                        service_name: 'Application Development',
                        requester_name: 'Charlie Brown',
                        approver_name: null,
                        priority: 'high',
                        status: 'submitted',
                        created_at: '2025-09-18',
                        cost: 500.00
                    }
                ];
                
                // Mock services data
                const mockServices = [
                    { id: 1, name: 'Server Provisioning' },
                    { id: 2, name: 'Data Analysis Report' },
                    { id: 3, name: 'Application Development' }
                ];
                
                // Mock user data
                const mockUser = {
                    role: 'service_requester',
                    division: 'DevOps'
                };
                
                setRequests(mockRequests);
                setServices(mockServices);
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

    // Filter requests based on search and filters
    const filteredRequests = requests.filter(request => {
        const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             request.service_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    const statuses = ['all', 'submitted', 'approved', 'in_progress', 'completed', 'rejected', 'cancelled'];

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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Service Requests</h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Manage and track your service requests
                </p>
            </div>

            {/* Tabs */}
            <div className="mb-6">
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <ul className="flex flex-wrap -mb-px">
                        <li className="mr-2">
                            <button
                                className={`inline-block p-4 rounded-t-lg border-b-2 ${
                                    tab === 'my-requests'
                                        ? 'text-primary border-primary dark:text-primary dark:border-primary'
                                        : 'border-transparent text-gray-500 hover:text-gray-600 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                                onClick={() => window.history.pushState({}, '', '?tab=my-requests')}
                            >
                                My Requests
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
                                Create Request
                            </button>
                        </li>
                        {(userRole === 'approver' || userRole === 'admin' || userRole === 'superadmin') && (
                            <li className="mr-2">
                                <button
                                    className={`inline-block p-4 rounded-t-lg border-b-2 ${
                                        tab === 'approvals'
                                            ? 'text-primary border-primary dark:text-primary dark:border-primary'
                                            : 'border-transparent text-gray-500 hover:text-gray-600 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                                    onClick={() => window.history.pushState({}, '', '?tab=approvals')}
                                >
                                    Pending Approvals
                                </button>
                            </li>
                        )}
                        {(userRole === 'service_provider' || userRole === 'admin' || userRole === 'superadmin') && (
                            <li className="mr-2">
                                <button
                                    className={`inline-block p-4 rounded-t-lg border-b-2 ${
                                        tab === 'assignments'
                                            ? 'text-primary border-primary dark:text-primary dark:border-primary'
                                            : 'border-transparent text-gray-500 hover:text-gray-600 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                                    onClick={() => window.history.pushState({}, '', '?tab=assignments')}
                                >
                                    My Assignments
                                </button>
                            </li>
                        )}
                    </ul>
                </div>
            </div>

            {tab === 'my-requests' && (
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
                                    placeholder="Search requests..."
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
                                            {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-end">
                                <button
                                    className="btn btn-primary w-full"
                                    onClick={() => window.history.pushState({}, '', '?tab=create')}
                                >
                                    New Request
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Requests table */}
                    {filteredRequests.length === 0 ? (
                        <div className={`rounded-lg p-8 text-center ${themeConfig.theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No requests found</h3>
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
                                            Request
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Service
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Priority
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Cost
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${themeConfig.theme === 'dark' ? 'divide-gray-700 bg-gray-800' : 'divide-gray-200 bg-white'}`}>
                                    {filteredRequests.map((request) => (
                                        <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">{request.title}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {request.service_name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    request.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
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
                                                    request.status === 'submitted' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                                    request.status === 'in_progress' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                                                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                                }`}>
                                                    {request.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                        <div className="text-lg font-semibold">{formatToRupiah(request.cost)}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {request.created_at}
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
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Create New Service Request</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Request a service from another division
                    </p>
                    
                    <form>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Service *
                                </label>
                                <select
                                    className="form-select w-full"
                                >
                                    <option value="">Select a service</option>
                                    {services.map(service => (
                                        <option key={service.id} value={service.id}>
                                            {service.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Request Title *
                                </label>
                                <input
                                    type="text"
                                    className="form-input w-full"
                                    placeholder="Enter request title"
                                />
                            </div>
                            
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Description *
                                </label>
                                <textarea
                                    className="form-textarea w-full"
                                    rows={4}
                                    placeholder="Describe your request in detail"
                                ></textarea>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Priority
                                </label>
                                <select
                                    className="form-select w-full"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium" selected>Medium</option>
                                    <option value="high">High</option>
                                    <option value="critical">Critical</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Requested For
                                </label>
                                <input
                                    type="text"
                                    className="form-input w-full"
                                    placeholder="Enter name or team"
                                    defaultValue="Myself"
                                />
                            </div>
                        </div>
                        
                        <div className="mt-8 flex justify-end space-x-3">
                            <button
                                type="button"
                                className="btn btn-outline"
                                onClick={() => window.history.pushState({}, '', '?tab=my-requests')}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                            >
                                Submit Request
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {tab === 'approvals' && (
                <div className={`rounded-lg p-6 ${themeConfig.theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow`}>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Pending Approvals</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Review and approve pending service requests
                    </p>
                    
                    {/* Pending approvals table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className={`${themeConfig.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Request
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Service
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Requester
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Priority
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Cost
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${themeConfig.theme === 'dark' ? 'divide-gray-700 bg-gray-800' : 'divide-gray-200 bg-white'}`}>
                                {requests.filter(r => r.status === 'submitted').map((request) => (
                                    <tr key={request.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">{request.title}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {request.service_name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {request.requester_name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                request.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                                request.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                                'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                            }`}>
                                                {request.priority}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            {formatToRupiah(request.cost)}
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

            {tab === 'assignments' && (
                <div className={`rounded-lg p-6 ${themeConfig.theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow`}>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">My Assignments</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Service requests assigned to you for fulfillment
                    </p>
                    
                    {/* Assigned requests table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className={`${themeConfig.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Request
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Service
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
                                        Date
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${themeConfig.theme === 'dark' ? 'divide-gray-700 bg-gray-800' : 'divide-gray-200 bg-white'}`}>
                                {requests.filter(r => r.status === 'approved' || r.status === 'in_progress').map((request) => (
                                    <tr key={request.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">{request.title}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {request.service_name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {request.requester_name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                request.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
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
                                                request.status === 'in_progress' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                                                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                            }`}>
                                                {request.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {request.created_at}
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
        </div>
    );
};

export default ServiceRequestsPage;