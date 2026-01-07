'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import { useSearchParams } from 'next/navigation';
import { formatToRupiah } from '@/utils/localeUtils';
import Swal from 'sweetalert2';

const ServiceRequestsPage = () => {
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const [requests, setRequests] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [userRole, setUserRole] = useState<string>('');
    const [userDivision, setUserDivision] = useState<string>('');
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [approvalData, setApprovalData] = useState({
        cost: 0,
        points: 0,
        comments: ''
    });
    const [requestForm, setRequestForm] = useState({
        project_name: '',
        service_id: '',
        title: '',
        description: '',
        priority: 'medium',
        requested_for: 'Myself'
    });

    const searchParams = useSearchParams();
    const tab = searchParams.get('tab') || 'my-requests';

    // Fetch requests and services
    const fetchData = async () => {
        try {
            setLoading(true);
            
            const [servicesRes, userRes] = await Promise.all([
                fetch('/api/itsm/service-catalog', { credentials: 'include' }),
                fetch('/api/auth/me', { credentials: 'include' })
            ]);

            if (!servicesRes.ok || !userRes.ok) {
                const serviceError = !servicesRes.ok ? await servicesRes.text() : '';
                const userError = !userRes.ok ? await userRes.text() : '';
                console.error('Service Error:', serviceError);
                console.error('User Error:', userError);
                throw new Error('Failed to fetch initial page data.');
            }

            const servicesData = await servicesRes.json();
            const userData = await userRes.json();

            // Fetch actual service requests data
            const requestsRes = await fetch('/api/itsm/service-requests', { credentials: 'include' });
            if (!requestsRes.ok) {
                const requestsError = await requestsRes.text();
                console.error('Requests Error:', requestsError);
                throw new Error('Failed to fetch service requests.');
            }
            
            const requestsData = await requestsRes.json();
            
            setRequests(requestsData.data || []);
            setServices(servicesData.data || []);
            setUserRole(userData.role);
            setUserDivision(userData.division);

        } catch (error) {
            console.error('Error fetching data:', error);
            Swal.fire('Error', 'Failed to load service request data.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        // Pre-select service if service_id is in URL
        const serviceIdFromUrl = searchParams.get('service_id');
        const serviceNameFromUrl = searchParams.get('service_name');

        if (serviceIdFromUrl && serviceNameFromUrl) {
            setRequestForm(prev => ({
                ...prev,
                service_id: serviceIdFromUrl,
                title: `Request for ${serviceNameFromUrl}`,
            }));
        }
    }, []);

    // Filter requests based on search and filters
    const filteredRequests = requests.filter(request => {
        const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             request.service_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    const handleManagerApproval = (requestId: number) => {
        const request = requests.find(r => r.id === requestId);
        if (request) {
            setSelectedRequest(request);
            setApprovalData({
                cost: request.cost || 0,
                points: request.metadata?.points || 0,
                comments: request.metadata?.manager_comments || ''
            });
            setShowApprovalModal(true);
        }
    };

    const handleViewRequest = (requestId: number) => {
        const request = requests.find(r => r.id === requestId);
        if (request) {
            setSelectedRequest(request);
            setShowViewModal(true);
        }
    };

    const handleApprovalSubmit = async () => {
        if (!selectedRequest) return;
        
        try {
            const response = await fetch(`/api/itsm/service-requests/${selectedRequest.id}/manager-approve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(approvalData),
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Update the requests list
                setRequests(requests.map(req => 
                    req.id === selectedRequest.id 
                        ? { ...req, status: 'approved', cost: approvalData.cost } 
                        : req
                ));
                
                setShowApprovalModal(false);
                setSelectedRequest(null);
                
                Swal.fire({
                    icon: 'success',
                    title: 'Approved!',
                    text: 'Service request has been approved with cost and points.',
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: result.error || 'Failed to approve service request.',
                });
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to approve service request.',
            });
        }
    };

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
                                            Project/Product
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
                                                {request.metadata?.project_name || 'N/A'}
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
                                                <button 
                                                    className="text-primary hover:text-primary-hover dark:text-primary dark:hover:text-primary-hover"
                                                    onClick={() => handleViewRequest(request.id)}
                                                >
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

            {/* Manager Approval Modal */}
            {showApprovalModal && selectedRequest && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className={`rounded-lg p-6 ${themeConfig.theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg w-full max-w-md`}>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Approve Service Request</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-2">
                            <strong>Request:</strong> {selectedRequest.title}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            <strong>Service:</strong> {selectedRequest.service_name}
                        </p>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Cost (IDR) *
                                </label>
                                <input
                                    type="number"
                                    className="form-input w-full"
                                    value={approvalData.cost}
                                    onChange={(e) => setApprovalData({...approvalData, cost: parseFloat(e.target.value) || 0})}
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Points *
                                </label>
                                <input
                                    type="number"
                                    className="form-input w-full"
                                    value={approvalData.points}
                                    onChange={(e) => setApprovalData({...approvalData, points: parseInt(e.target.value) || 0})}
                                    min="0"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Comments
                                </label>
                                <textarea
                                    className="form-textarea w-full"
                                    rows={3}
                                    value={approvalData.comments}
                                    onChange={(e) => setApprovalData({...approvalData, comments: e.target.value})}
                                    placeholder="Add any comments for this approval..."
                                ></textarea>
                            </div>
                        </div>
                        
                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                type="button"
                                className="btn btn-outline"
                                onClick={() => setShowApprovalModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleApprovalSubmit}
                            >
                                Approve Request
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Request Modal */}
            {showViewModal && selectedRequest && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className={`rounded-lg p-6 ${themeConfig.theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg w-full max-w-2xl`}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Service Request Details</h3>
                            <button 
                                onClick={() => setShowViewModal(false)}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Request ID</h4>
                                <p className="text-lg font-medium text-gray-900 dark:text-white">{selectedRequest.id}</p>
                            </div>
                            
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</h4>
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    selectedRequest.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                    selectedRequest.status === 'approved' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                    selectedRequest.status === 'submitted' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                    selectedRequest.status === 'in_progress' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                }`}>
                                    {selectedRequest.status.replace('_', ' ')}
                                </span>
                            </div>
                            
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Service</h4>
                                <p className="text-lg font-medium text-gray-900 dark:text-white">{selectedRequest.service_name}</p>
                            </div>
                            
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Priority</h4>
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    selectedRequest.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                    selectedRequest.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                }`}>
                                    {selectedRequest.priority}
                                </span>
                            </div>
                            
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Requester</h4>
                                <p className="text-lg font-medium text-gray-900 dark:text-white">{selectedRequest.requester_name}</p>
                            </div>
                            
                            {selectedRequest.approver_name && (
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Approver</h4>
                                    <p className="text-lg font-medium text-gray-900 dark:text-white">{selectedRequest.approver_name}</p>
                                </div>
                            )}
                            
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Date Created</h4>
                                <p className="text-lg font-medium text-gray-900 dark:text-white">{selectedRequest.created_at}</p>
                            </div>
                            
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Cost</h4>
                                <p className="text-lg font-medium text-gray-900 dark:text-white">{formatToRupiah(selectedRequest.cost)}</p>
                            </div>
                        </div>
                        
                        <div className="mb-6">
                            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Title</h4>
                            <p className="text-lg font-medium text-gray-900 dark:text-white">{selectedRequest.title}</p>
                        </div>
                        
                        <div className="mb-6">
                            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Description</h4>
                            <p className="text-gray-900 dark:text-white">
                                {selectedRequest.description || selectedRequest.metadata?.description || 'No description provided'}
                            </p>
                        </div>
                        
                        {selectedRequest.metadata && (
                            <div className="mb-6">
                                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Metadata</h4>
                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {Object.entries(selectedRequest.metadata).map(([key, value]) => (
                                            <div key={key}>
                                                <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400 capitalize">{key.replace('_', ' ')}</h5>
                                                <p className="text-gray-900 dark:text-white">{String(value)}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <div className="flex justify-end">
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => setShowViewModal(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {tab === 'create' && (
                <div className={`rounded-lg p-6 ${themeConfig.theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow`}>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Create New Service Request</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Request a service from another division
                    </p>
                    
                    <form onSubmit={async (e) => {
                        e.preventDefault();
                        try {
                            const response = await fetch('/api/itsm/service-requests', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    service_id: parseInt(requestForm.service_id),
                                    title: requestForm.title,
                                    description: requestForm.description,
                                    priority: requestForm.priority,
                                    requested_for: requestForm.requested_for,
                                    metadata: {
                                        project_name: requestForm.project_name
                                    }
                                }),
                            });
                            
                            const result = await response.json();
                            
                            if (result.success) {
                                Swal.fire({
                                    icon: 'success',
                                    title: 'Request Submitted!',
                                    text: 'Your service request has been submitted successfully.',
                                    timer: 3000,
                                    showConfirmButton: false,
                                });
                                
                                // Reset form
                                setRequestForm({
                                    project_name: '',
                                    service_id: '',
                                    title: '',
                                    description: '',
                                    priority: 'medium',
                                    requested_for: 'Myself'
                                });
                                
                                // Switch to my requests tab
                                window.history.pushState({}, '', '?tab=my-requests');
                                
                                // Refresh requests
                                fetchData();
                            } else {
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Error',
                                    text: result.error || 'Failed to submit service request.',
                                });
                            }
                        } catch (error) {
                            Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: 'Failed to submit service request.',
                            });
                        }
                    }}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Project/Product Name *
                                </label>
                                <input
                                    type="text"
                                    className="form-input w-full"
                                    placeholder="Enter project or product name"
                                    value={requestForm.project_name}
                                    onChange={(e) => setRequestForm({...requestForm, project_name: e.target.value})}
                                    required
                                />
                            </div>
                            
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Service *
                                </label>
                                <select
                                    className="form-select w-full"
                                    value={requestForm.service_id}
                                    onChange={(e) => setRequestForm({...requestForm, service_id: e.target.value})}
                                    required
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
                                    value={requestForm.title}
                                    onChange={(e) => setRequestForm({...requestForm, title: e.target.value})}
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
                                    value={requestForm.description}
                                    onChange={(e) => setRequestForm({...requestForm, description: e.target.value})}
                                ></textarea>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Priority
                                </label>
                                <select
                                    className="form-select w-full"
                                    value={requestForm.priority}
                                    onChange={(e) => setRequestForm({...requestForm, priority: e.target.value})}
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
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
                                    value={requestForm.requested_for}
                                    onChange={(e) => setRequestForm({...requestForm, requested_for: e.target.value})}
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
                                        Project/Product
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
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {request.metadata?.project_name || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {request.created_at}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button 
                                                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 mr-3"
                                                onClick={() => handleManagerApproval(request.id)}
                                            >
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
                                            <button 
                                                className="text-primary hover:text-primary-hover dark:text-primary dark:hover:text-primary-hover mr-3"
                                                onClick={() => handleViewRequest(request.id)}
                                            >
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