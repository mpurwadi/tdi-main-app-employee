'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';

const ServiceCatalogPage = () => {
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [divisionFilter, setDivisionFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('approved');

    // Mock data for demonstration
    const mockServices = [
        {
            id: 1,
            name: 'Server Provisioning',
            description: 'Request new servers for development, testing, or production environments',
            category: 'Infrastructure',
            division: 'DevOps',
            cost_type: 'fixed',
            cost_amount: 150.00,
            status: 'approved',
            created_by: 'John Doe',
            created_at: '2025-09-15'
        },
        {
            id: 2,
            name: 'Data Analysis Report',
            description: 'Request custom data analysis and reporting services',
            category: 'Analytics',
            division: 'Big Data',
            cost_type: 'hourly',
            cost_amount: 75.00,
            status: 'approved',
            created_by: 'Jane Smith',
            created_at: '2025-09-10'
        },
        {
            id: 3,
            name: 'Application Development',
            description: 'Request custom application development services',
            category: 'Development',
            division: 'Produk',
            cost_type: 'fixed',
            cost_amount: 500.00,
            status: 'approved',
            created_by: 'Mike Johnson',
            created_at: '2025-09-05'
        },
        {
            id: 4,
            name: 'Network Security Assessment',
            description: 'Comprehensive security assessment of network infrastructure',
            category: 'Security',
            division: 'DevOps',
            cost_type: 'fixed',
            cost_amount: 300.00,
            status: 'pending',
            created_by: 'Sarah Wilson',
            created_at: '2025-09-18'
        }
    ];

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setServices(mockServices);
            setLoading(false);
        }, 1000);
    }, []);

    // Filter services based on search and filters
    const filteredServices = services.filter(service => {
        const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             service.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter;
        const matchesDivision = divisionFilter === 'all' || service.division === divisionFilter;
        const matchesStatus = statusFilter === 'all' || service.status === statusFilter;
        
        return matchesSearch && matchesCategory && matchesDivision && matchesStatus;
    });

    // Get unique categories and divisions for filters
    const categories = ['all', ...Array.from(new Set(services.map(s => s.category)))];
    const divisions = ['all', ...Array.from(new Set(services.map(s => s.division)))];
    const statuses = ['all', 'pending', 'approved', 'rejected', 'active', 'inactive'];

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

            {/* Filters */}
            <div className={`mb-6 p-4 rounded-lg ${themeConfig.theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow`}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Search
                        </label>
                        <input
                            type="text"
                            placeholder="Search services..."
                            className="form-input w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Category
                        </label>
                        <select
                            className="form-select w-full"
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            {categories.map(category => (
                                <option key={category} value={category}>
                                    {category.charAt(0).toUpperCase() + category.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Division
                        </label>
                        <select
                            className="form-select w-full"
                            value={divisionFilter}
                            onChange={(e) => setDivisionFilter(e.target.value)}
                        >
                            {divisions.map(division => (
                                <option key={division} value={division}>
                                    {division}
                                </option>
                            ))}
                        </select>
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
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Services grid */}
            {filteredServices.length === 0 ? (
                <div className={`rounded-lg p-8 text-center ${themeConfig.theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No services found</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        Try adjusting your search or filter criteria
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredServices.map((service) => (
                        <div 
                            key={service.id} 
                            className={`rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1 ${
                                themeConfig.theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                            }`}
                        >
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {service.name}
                                    </h3>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        service.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                        service.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                        service.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                    }`}>
                                        {service.status}
                                    </span>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                                    {service.description}
                                </p>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                        {service.category}
                                    </span>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                        {service.division}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div>
                                        {service.cost_type === 'fixed' ? (
                                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                                                ${service.cost_amount.toFixed(2)}
                                            </span>
                                        ) : (
                                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                                                ${service.cost_amount.toFixed(2)}/hr
                                            </span>
                                        )}
                                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                                            {service.cost_type}
                                        </span>
                                    </div>
                                    <button
                                        className="btn btn-primary btn-sm"
                                        disabled={service.status !== 'approved'}
                                    >
                                        Request Service
                                    </button>
                                </div>
                            </div>
                            <div className={`px-5 py-3 text-xs text-gray-500 dark:text-gray-400 border-t ${
                                themeConfig.theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                            }`}>
                                Created by {service.created_by} on {service.created_at}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add service button for managers */}
            <div className="mt-8 flex justify-end">
                <button className="btn btn-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add New Service
                </button>
            </div>
        </div>
    );
};

export default ServiceCatalogPage;