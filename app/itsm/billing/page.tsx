'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';

const BillingPage = () => {
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const [bills, setBills] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending');
    const [searchTerm, setSearchTerm] = useState('');

    // Mock data for demonstration
    const mockBills = [
        {
            id: 1,
            requester_division: 'Marketing',
            provider_division: 'DevOps',
            amount: 1500.00,
            billing_period: 'September 2025',
            status: 'pending',
            created_at: '2025-09-01',
            due_date: '2025-09-30',
            service_requests: 12
        },
        {
            id: 2,
            requester_division: 'Sales',
            provider_division: 'Big Data',
            amount: 2250.75,
            billing_period: 'September 2025',
            status: 'paid',
            created_at: '2025-09-01',
            due_date: '2025-09-30',
            payment_date: '2025-09-15',
            service_requests: 30
        },
        {
            id: 3,
            requester_division: 'HR',
            provider_division: 'Produk',
            amount: 5000.00,
            billing_period: 'September 2025',
            status: 'disputed',
            created_at: '2025-09-01',
            due_date: '2025-09-30',
            service_requests: 10
        },
        {
            id: 4,
            requester_division: 'Finance',
            provider_division: 'DevOps',
            amount: 750.50,
            billing_period: 'August 2025',
            status: 'paid',
            created_at: '2025-08-01',
            due_date: '2025-08-31',
            payment_date: '2025-08-25',
            service_requests: 5
        }
    ];

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setBills(mockBills);
            setLoading(false);
        }, 1000);
    }, []);

    // Filter bills based on active tab and search term
    const filteredBills = bills.filter(bill => {
        const matchesSearch = bill.requester_division.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             bill.provider_division.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (activeTab === 'all') return matchesSearch;
        return matchesSearch && bill.status === activeTab;
    });

    // Get counts for tabs
    const allCount = bills.length;
    const pendingCount = bills.filter(b => b.status === 'pending').length;
    const paidCount = bills.filter(b => b.status === 'paid').length;
    const disputedCount = bills.filter(b => b.status === 'disputed').length;

    // Calculate total amounts
    const totalPending = bills
        .filter(b => b.status === 'pending')
        .reduce((sum, bill) => sum + bill.amount, 0);
        
    const totalPaid = bills
        .filter(b => b.status === 'paid')
        .reduce((sum, bill) => sum + bill.amount, 0);

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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Internal Billing</h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Manage and track internal billing between divisions
                </p>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className={`rounded-lg shadow-md p-5 ${themeConfig.theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-200">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">Pending</h3>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                ${totalPending.toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>
                <div className={`rounded-lg shadow-md p-5 ${themeConfig.theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-200">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">Paid</h3>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                ${totalPaid.toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>
                <div className={`rounded-lg shadow-md p-5 ${themeConfig.theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">Total Bills</h3>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {bills.length}
                            </p>
                        </div>
                    </div>
                </div>
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
                            All Bills
                            <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-gray-500 rounded-full">
                                {allCount}
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab('pending')}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'pending'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                        >
                            Pending
                            <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-yellow-500 rounded-full">
                                {pendingCount}
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab('paid')}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'paid'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                        >
                            Paid
                            <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-green-500 rounded-full">
                                {paidCount}
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab('disputed')}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'disputed'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                        >
                            Disputed
                            <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                                {disputedCount}
                            </span>
                        </button>
                    </nav>
                </div>
            </div>

            {/* Search */}
            <div className={`mb-6 p-4 rounded-lg ${themeConfig.theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow`}>
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Search bills..."
                            className="form-input w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex space-x-3">
                        <button className="btn btn-outline-primary whitespace-nowrap">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                            </svg>
                            Generate Report
                        </button>
                        <button className="btn btn-primary whitespace-nowrap">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            New Invoice
                        </button>
                    </div>
                </div>
            </div>

            {/* Bills table */}
            {filteredBills.length === 0 ? (
                <div className={`rounded-lg p-8 text-center ${themeConfig.theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No bills found</h3>
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
                                        Invoice
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Divisions
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Period
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Due Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Requests
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredBills.map((bill) => (
                                    <tr key={bill.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                INV-{bill.id.toString().padStart(4, '0')}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {bill.created_at}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 dark:text-white">
                                                {bill.requester_division}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                to {bill.provider_division}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                            ${bill.amount.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            {bill.billing_period}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            {bill.due_date}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            {bill.service_requests} requests
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                bill.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                                bill.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                            }`}>
                                                {bill.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-medium">
                                            <button className="text-primary hover:text-primary/80 mr-3">
                                                View
                                            </button>
                                            {bill.status === 'pending' && (
                                                <button className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300">
                                                    Confirm Payment
                                                </button>
                                            )}
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

export default BillingPage;