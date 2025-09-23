'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import { useSearchParams } from 'next/navigation';
import Swal from 'sweetalert2';
import Link from 'next/link';

import { formatToRupiah } from '@/utils/localeUtils';

const ROLES = {
    SUPERADMIN: 'superadmin',
    ADMIN: 'admin',
    CATALOG_MANAGER: 'service_catalog_manager',
    PROVIDER: 'service_provider',
};

const ServiceCatalogPage = () => {
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    
    const [services, setServices] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);
    
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [divisionFilter, setDivisionFilter] = useState('all');
    
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'browse');

    const fetchData = async () => {
        try {
            setLoading(true);
            const [servicesRes, categoriesRes, userRes] = await Promise.all([
                fetch('/api/itsm/service-catalog?status=approved', { credentials: 'include' }),
                fetch('/api/itsm/service-categories', { credentials: 'include' }),
                fetch('/api/auth/me', { credentials: 'include' })
            ]);

            if (!servicesRes.ok || !categoriesRes.ok || !userRes.ok) {
                const serviceError = !servicesRes.ok ? await servicesRes.text() : '';
                const categoryError = !categoriesRes.ok ? await categoriesRes.text() : '';
                const userError = !userRes.ok ? await userRes.text() : '';
                console.error('Service Error:', serviceError);
                console.error('Category Error:', categoryError);
                console.error('User Error:', userError);
                throw new Error('Failed to fetch initial page data.');
            }

            const servicesData = await servicesRes.json();

            const categoriesData = await categoriesRes.json();
            const userData = await userRes.json();

            setServices(servicesData.data || []);
            setCategories(categoriesData.categories || []);
            setCurrentUser(userData || null);

        } catch (error) {
            console.error('Error fetching data:', error);
            Swal.fire('Error', 'Failed to load service catalog data.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleTabClick = (tab: string) => {
        setActiveTab(tab);
        window.history.pushState({}, '', `?tab=${tab}`);
    };

    const handleAction = async (serviceId: number, action: 'approve' | 'reject' | 'delete') => {
        const urlMap = {
            approve: `/api/itsm/service-catalog/${serviceId}/approve`,
            reject: `/api/itsm/service-catalog/${serviceId}/reject`,
            delete: `/api/itsm/service-catalog/${serviceId}`
        };
        const methodMap = {
            approve: 'POST',
            reject: 'POST',
            delete: 'DELETE'
        };

        const confirmationTitle = {
            approve: 'Are you sure you want to approve this service?',
            reject: 'Are you sure you want to reject this service?',
            delete: 'Are you sure you want to delete this service?'
        };

        const result = await Swal.fire({
            title: confirmationTitle[action],
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: `Yes, ${action} it!`,
            cancelButtonText: 'No, cancel!'
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(urlMap[action], { method: methodMap[action], credentials: 'include' });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Action failed');
                }
                Swal.fire('Success!', `Service has been ${action}d.`, 'success');
                fetchData(); // Refresh data
            } catch (error: any) {
                Swal.fire('Error', error.message, 'error');
            }
        }
    };

    const userRole = currentUser?.role || '';

    const permissions = {
        canAddService: [ROLES.PROVIDER, 'itsm_division_admin', 'itsm_manager', ROLES.ADMIN, ROLES.SUPERADMIN].includes(userRole),
        canApproveServices: [ROLES.ADMIN, ROLES.SUPERADMIN, ROLES.CATALOG_MANAGER, 'itsm_manager'].includes(userRole), // itsm_manager can also approve
        canManageAllServices: [ROLES.ADMIN, ROLES.SUPERADMIN, ROLES.CATALOG_MANAGER, 'itsm_manager', 'itsm_division_admin'].includes(userRole), // itsm_manager and itsm_division_admin can manage
    };

    const getStatusForTab = (tab: string) => {
        // If user cannot approve services, and they are on the pending tab,
        // we still want to show them pending services, but they won't have action buttons.
        // The previous logic was hiding them entirely.
        // If they cannot manage services, and they are on the manage tab, show approved services.
        if (!permissions.canManageAllServices && tab === 'manage') return 'approved';

        switch (tab) {
            case 'pending': return 'pending';
            case 'manage': return 'all';
            default: return 'approved';
        }
    };

    const statusFilter = getStatusForTab(activeTab);

    const filteredServices = services.filter(service => {
        if (!service) {
            return false;
        }
        const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             service.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || service.category_id === parseInt(categoryFilter);
        const matchesDivision = divisionFilter === 'all' || service.division === divisionFilter;
        const matchesStatus = statusFilter === 'all' || service.status === statusFilter;
        
        const isProviderManaging = userRole === ROLES.PROVIDER && activeTab === 'manage';
        const matchesOwnership = !isProviderManaging || service.created_by === currentUser?.id;

        return matchesSearch && matchesCategory && matchesDivision && matchesStatus && matchesOwnership;
    });

    useEffect(() => {
        console.log('--- Filtering Debug ---');
        console.log('Services state:', services);
        console.log('Active Tab:', activeTab);
        console.log('Status Filter:', statusFilter);
        console.log('Filtered Services (in useEffect):', filteredServices);
        services.forEach(service => {
            const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 service.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = categoryFilter === 'all' || service.category_id === parseInt(categoryFilter);
            const matchesDivision = divisionFilter === 'all' || service.division === divisionFilter;
            const matchesStatus = statusFilter === 'all' || service.status === statusFilter;
            const isProviderManaging = userRole === ROLES.PROVIDER && activeTab === 'manage';
            const matchesOwnership = !isProviderManaging || service.created_by === currentUser?.id;
            const finalResult = matchesSearch && matchesCategory && matchesDivision && matchesStatus && matchesOwnership;
            console.log(`  Service ID: ${service.id}, Name: ${service.name}, Status: ${service.status}, matchesStatus: ${matchesStatus}, matchesOwnership: ${matchesOwnership}, Final: ${finalResult}`);
        });
        console.log('-----------------------');
    }, [services, activeTab, statusFilter, searchTerm, categoryFilter, divisionFilter, userRole, currentUser]);

    const divisions = ['all', ...Array.from(new Set(services.map(s => s.division)))];

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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Service Catalog</h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Browse and request services offered by different divisions
                </p>
            </div>

            {/* Add Service Button - visible only to providers */}
            {permissions.canAddService && (
                <div className="mb-6 flex justify-end">
                    <Link href="/itsm/service-catalog/create" className="btn btn-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add New Service
                    </Link>
                </div>
            )}

            {/* Tabs */}
            <div className="mb-6">
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <ul className="flex flex-wrap -mb-px">
                        <li className="mr-2">
                            <button
                                className={`inline-block p-4 rounded-t-lg border-b-2 ${
                                    activeTab === 'browse'
                                        ? 'text-primary border-primary dark:text-primary dark:border-primary'
                                        : 'border-transparent text-gray-500 hover:text-gray-600 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                                onClick={() => handleTabClick('browse')}
                            >
                                Browse Services
                            </button>
                        </li>
                        {permissions.canManageAllServices && (
                            <li className="mr-2">
                                <button
                                    className={`inline-block p-4 rounded-t-lg border-b-2 ${
                                        activeTab === 'manage'
                                            ? 'text-primary border-primary dark:text-primary dark:border-primary'
                                            : 'border-transparent text-gray-500 hover:text-gray-600 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                                    onClick={() => handleTabClick('manage')}
                                >
                                    Manage Services
                                </button>
                            </li>
                        )}
                        {permissions.canApproveServices && (
                            <li className="mr-2">
                                <button
                                    className={`inline-block p-4 rounded-t-lg border-b-2 ${
                                        activeTab === 'pending'
                                            ? 'text-primary border-primary dark:text-primary dark:border-primary'
                                            : 'border-transparent text-gray-500 hover:text-gray-600 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                                    onClick={() => handleTabClick('pending')}
                                >
                                    Pending Approvals
                                </button>
                            </li>
                        )}
                    </ul>
                </div>
            </div>

            {activeTab === 'browse' && (
                <>
                    {/* Filters */}
                    <div className={`mb-6 p-4 rounded-lg ${themeConfig.theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow`}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search</label>
                                <input
                                    type="text"
                                    placeholder="Search services..."
                                    className="form-input w-full"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                                <select className="form-select w-full" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                                    <option value="all">All Categories</option>
                                    {categories.map(category => (
                                        <option key={category.id} value={category.id}>{category.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Division</label>
                                <select className="form-select w-full" value={divisionFilter} onChange={(e) => setDivisionFilter(e.target.value)}>
                                    <option value="all">All Divisions</option>
                                    {divisions.map(division => (
                                        <option key={division} value={division}>{division}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Services grid */}
                    {filteredServices.length === 0 ? (
                        <div className={`rounded-lg p-8 text-center ${themeConfig.theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow`}>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No services found</h3>
                            <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filter criteria</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredServices.map((service) => (
                                <div key={service.id} className={`rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1 ${themeConfig.theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                                    <div className="p-5">
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{service.name}</h3>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                service.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                                service.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                            }`}>{service.status}</span>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{service.description}</p>
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <span className="text-lg font-bold text-gray-900 dark:text-white">
                                                    {formatToRupiah(service.cost_amount)}
                                                </span>
                                                <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">/{service.cost_type}</span>
                                            </div>
                                            <Link href={`/itsm/service-requests?tab=create&service_id=${service.id}&service_name=${service.name}`} className={`btn btn-primary btn-sm ${service.status !== 'approved' ? 'disabled' : ''}`}>
                                                Request Service
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {activeTab === 'manage' && (
                <div className={`rounded-lg p-6 ${themeConfig.theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow`}>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Manage Services</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            {/* Table Head */}
                            <thead className={`${themeConfig.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Service</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Division</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${themeConfig.theme === 'dark' ? 'divide-gray-700 bg-gray-800' : 'divide-gray-200 bg-white'}`}>
                                {filteredServices.map((service) => (
                                    <tr key={service.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">{service.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{service.division}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ service.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{service.status}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link href={`/itsm/service-catalog/details/${service.id}`} className="text-primary hover:text-primary-hover dark:text-primary dark:hover:text-primary-hover mr-3">
                                                View
                                            </Link>
                                            <Link href={`/itsm/service-catalog/edit/${service.id}`} className="text-primary hover:text-primary-hover dark:text-primary dark:hover:text-primary-hover mr-3">
                                                Edit
                                            </Link>
                                            <button onClick={() => handleAction(service.id, 'delete')} className="text-red-600 hover:text-red-900">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'pending' && (
                <div className={`rounded-lg p-6 ${themeConfig.theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow`}>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Pending Approvals</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            {/* Table Head */}
                            <thead className={`${themeConfig.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Service</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Division</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${themeConfig.theme === 'dark' ? 'divide-gray-700 bg-gray-800' : 'divide-gray-200 bg-white'}`}>
                                {filteredServices.map((service) => (
                                    <tr key={service.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">{service.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{service.division}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => handleAction(service.id, 'approve')} className="text-green-600 hover:text-green-900 mr-3">Approve</button>
                                            <button onClick={() => handleAction(service.id, 'reject')} className="text-red-600 hover:text-red-900">Reject</button>
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

export default ServiceCatalogPage;
