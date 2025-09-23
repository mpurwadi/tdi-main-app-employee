'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import { useSearchParams } from 'next/navigation';
import CreateBillingRecord from '@/components/itsm/billing/CreateBillingRecord';
import RecordPayment from '@/components/itsm/billing/RecordPayment';
import { formatToRupiah } from '@/utils/localeUtils';

const BillingPage = () => {
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const [billingRecords, setBillingRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [userRole, setUserRole] = useState<string>('');
    const [userDivision, setUserDivision] = useState<string>('');

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedBillingRecord, setSelectedBillingRecord] = useState<any>(null);

    const searchParams = useSearchParams();
    const tab = searchParams.get('tab') || 'invoices';

    // Fetch billing records
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Fetch user authentication data
                const authResponse = await fetch('/api/auth/me', { credentials: 'include' });
                const authData = await authResponse.json();
                
                if (!authResponse.ok || !authData.success) {
                    console.error('Failed to fetch user data');
                    return;
                }
                
                setUserRole(authData.role);
                setUserDivision(authData.division);
                
                // Fetch billing records from API
                const billingResponse = await fetch('/api/itsm/billing', { credentials: 'include' });
                const billingData = await billingResponse.json();
                
                if (!billingResponse.ok || !billingData.success) {
                    console.error('Failed to fetch billing data');
                    return;
                }
                
                setBillingRecords(billingData.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, []);

    // Refresh billing records
    const refreshBillingRecords = async () => {
        try {
            const response = await fetch('/api/itsm/billing', { credentials: 'include' });
            const data = await response.json();
            
            if (data.success) {
                setBillingRecords(data.data);
            }
        } catch (error) {
            console.error('Error refreshing billing records:', error);
        }
    };

    // Handle payment recording
    const handleRecordPayment = (record: any) => {
        setSelectedBillingRecord(record);
        setShowPaymentModal(true);
    };

    // Filter billing records based on search and filters
    const filteredBillingRecords = billingRecords.filter(record => {
        const matchesSearch = record.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             record.requester_division.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    const statuses = ['all', 'pending', 'paid', 'overdue', 'disputed'];

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

            {/* Tabs */}
            <div className="mb-6">
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <ul className="flex flex-wrap -mb-px">
                        <li className="mr-2">
                            <button
                                className={`inline-block p-4 rounded-t-lg border-b-2 ${
                                    tab === 'invoices'
                                        ? 'text-primary border-primary dark:text-primary dark:border-primary'
                                        : 'border-transparent text-gray-500 hover:text-gray-600 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                                onClick={() => window.history.pushState({}, '', '?tab=invoices')}
                            >
                                Invoices
                            </button>
                        </li>
                        {(userRole === 'billing_coordinator' || userRole === 'admin' || userRole === 'superadmin') && (
                            <li className="mr-2">
                                <button
                                    className={`inline-block p-4 rounded-t-lg border-b-2 ${
                                        tab === 'payments'
                                            ? 'text-primary border-primary dark:text-primary dark:border-primary'
                                            : 'border-transparent text-gray-500 hover:text-gray-600 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                                    onClick={() => window.history.pushState({}, '', '?tab=payments')}
                                >
                                    Payment Processing
                                </button>
                            </li>
                        )}
                        <li className="mr-2">
                            <button
                                className={`inline-block p-4 rounded-t-lg border-b-2 ${
                                    tab === 'reports'
                                        ? 'text-primary border-primary dark:text-primary dark:border-primary'
                                        : 'border-transparent text-gray-500 hover:text-gray-600 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                                onClick={() => window.history.pushState({}, '', '?tab=reports')}
                            >
                                Reports
                            </button>
                        </li>
                    </ul>
                </div>
            </div>

            {tab === 'invoices' && (
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
                                    placeholder="Search invoices..."
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
                                            {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-end">
                                <button
                                    className="btn btn-primary w-full"
                                    onClick={() => setShowCreateModal(true)}
                                >
                                    Create New Billing Record
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Billing records table */}
                    {filteredBillingRecords.length === 0 ? (
                        <div className={`rounded-lg p-8 text-center ${themeConfig.theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No billing records found</h3>
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
                                            Invoice
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Requester
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Provider
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Period
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Due Date
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${themeConfig.theme === 'dark' ? 'divide-gray-700 bg-gray-800' : 'divide-gray-200 bg-white'}`}>
                                    {filteredBillingRecords.map((record) => (
                                        <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">{record.invoice_number}</div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">{record.created_at}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {record.requester_division}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {record.provider_division}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                ${(record.amount || 0).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {record.billing_period}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {record.due_date}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    record.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                                    record.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                                    record.status === 'overdue' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                                }`}>
                                                    {record.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button className="text-primary hover:text-primary-hover dark:text-primary dark:hover:text-primary-hover mr-3">
                                                    View
                                                </button>
                                                {record.status === 'pending' && (
                                                    <button 
                                                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                                        onClick={() => handleRecordPayment(record)}
                                                    >
                                                        Confirm Payment
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}

            {tab === 'payments' && (
                <div className={`rounded-lg p-6 ${themeConfig.theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow`}>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Payment Processing</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Process payments for pending invoices
                    </p>
                    
                    {/* Pending payments table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className={`${themeConfig.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Invoice
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Requester
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Due Date
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${themeConfig.theme === 'dark' ? 'divide-gray-700 bg-gray-800' : 'divide-gray-200 bg-white'}`}>
                                {billingRecords.filter(r => r.status === 'pending').map((record) => (
                                    <tr key={record.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">{record.invoice_number}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">{record.created_at}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {record.requester_division}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            ${record.amount.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {record.due_date}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">
                                                Confirm Payment
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {(tab === 'reports' || tab === 'payments') && (
                <div className={`rounded-lg p-6 ${themeConfig.theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow`}>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        {tab === 'reports' ? 'Billing Reports' : 'Payment Processing'}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        {tab === 'reports' 
                            ? 'Generate and view billing reports' 
                            : 'Process payments for pending invoices'}
                    </p>
                    
                    {tab === 'payments' ? (
                        // Pending payments table
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className={`${themeConfig.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Invoice
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Requester
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Due Date
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${themeConfig.theme === 'dark' ? 'divide-gray-700 bg-gray-800' : 'divide-gray-200 bg-white'}`}>
                                    {billingRecords.filter(r => r.status === 'pending').map((record) => (
                                        <tr key={record.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">{record.invoice_number}</div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">{new Date(record.created_at).toLocaleDateString()}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {record.requester_division}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                Rp {record.total_amount.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {new Date(record.due_date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button 
                                                    className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                                    onClick={() => handleRecordPayment(record)}
                                                >
                                                    Confirm Payment
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        // Reports content
                        <div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className={`p-5 rounded-lg ${themeConfig.theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50'} border border-blue-200 dark:border-blue-900`}>
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                        Rp {billingRecords.reduce((sum, record) => sum + record.total_amount, 0).toLocaleString()}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Billed</div>
                                </div>
                                <div className={`p-5 rounded-lg ${themeConfig.theme === 'dark' ? 'bg-gray-700' : 'bg-green-50'} border border-green-200 dark:border-green-900`}>
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                        Rp {billingRecords.filter(r => r.status === 'paid').reduce((sum, record) => sum + record.total_amount, 0).toLocaleString()}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Paid</div>
                                </div>
                                <div className={`p-5 rounded-lg ${themeConfig.theme === 'dark' ? 'bg-gray-700' : 'bg-yellow-50'} border border-yellow-200 dark:border-yellow-900`}>
                                <p className="text-2xl font-bold">{formatToRupiah(billingRecords.filter(r => r.status === 'pending').reduce((sum, record) => sum + record.total_amount, 0))}</p>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Pending Payment</div>
                                </div>
                            </div>
                            
                            <div className="mb-6">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Generate Report</h3>
                                <form className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Start Date
                                        </label>
                                        <input
                                            type="date"
                                            className="form-input w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            End Date
                                        </label>
                                        <input
                                            type="date"
                                            className="form-input w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Division
                                        </label>
                                        <select className="form-select w-full">
                                            <option value="">All Divisions</option>
                                            <option value="DevOps">DevOps</option>
                                            <option value="Big Data">Big Data</option>
                                            <option value="Produk">Produk</option>
                                            <option value="Operasional">Operasional</option>
                                        </select>
                                    </div>
                                    <div className="flex items-end">
                                        <button
                                            type="submit"
                                            className="btn btn-primary w-full"
                                        >
                                            Generate Report
                                        </button>
                                    </div>
                                </form>
                            </div>
                            
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Reports</h3>
                                <div className={`rounded-lg overflow-hidden ${themeConfig.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                                        <thead className={`${themeConfig.theme === 'dark' ? 'bg-gray-600' : 'bg-gray-100'}`}>
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Report
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Period
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Generated
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className={`divide-y ${themeConfig.theme === 'dark' ? 'divide-gray-600 bg-gray-700' : 'divide-gray-200 bg-gray-50'}`}>
                                            <tr>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                    Monthly Billing Report - September 2025
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    2025-09-01 to 2025-09-30
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    2025-10-01
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button className="text-primary hover:text-primary-hover dark:text-primary dark:hover:text-primary-hover mr-3">
                                                        View
                                                    </button>
                                                    <button className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300">
                                                        Download
                                                    </button>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Modals */}
            {showCreateModal && (
                <CreateBillingRecord 
                    onClose={() => setShowCreateModal(false)}
                    onRecordCreated={refreshBillingRecords}
                />
            )}

            {showPaymentModal && selectedBillingRecord && (
                <RecordPayment 
                    billingRecord={selectedBillingRecord}
                    onClose={() => {
                        setShowPaymentModal(false);
                        setSelectedBillingRecord(null);
                    }}
                    onPaymentRecorded={refreshBillingRecords}
                />
            )}
        </div>
    );
};

export default BillingPage;