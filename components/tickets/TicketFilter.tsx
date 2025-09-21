'use client';

import { useState, useEffect } from 'react';

interface TicketFilters {
    status: string;
    category: string;
    priority: string;
    search: string;
}

interface TicketFilterProps {
    filters: TicketFilters;
    onFilterChange: (filters: TicketFilters) => void;
    isAdmin: boolean;
}

export default function TicketFilter({ filters, onFilterChange, isAdmin }: TicketFilterProps) {
    const [localFilters, setLocalFilters] = useState(filters);
    
    useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);
    
    const handleChange = (field: keyof TicketFilters, value: string) => {
        const newFilters = { ...localFilters, [field]: value };
        setLocalFilters(newFilters);
        onFilterChange(newFilters);
    };
    
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const newFilters = { ...localFilters, search: value };
        setLocalFilters(newFilters);
        // Debounce search to avoid too many API calls
        setTimeout(() => {
            onFilterChange(newFilters);
        }, 300);
    };
    
    return (
        <div className="bg-white rounded-lg shadow p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Search
                    </label>
                    <input
                        type="text"
                        value={localFilters.search}
                        onChange={handleSearchChange}
                        placeholder="Search tickets by title or description"
                        className="w-full rounded border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Priority
                    </label>
                    <select
                        value={localFilters.priority}
                        onChange={(e) => handleChange('priority', e.target.value)}
                        className="w-full rounded border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    >
                        <option value="all">All Priorities</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                    </select>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                    </label>
                    <select
                        value={localFilters.status}
                        onChange={(e) => handleChange('status', e.target.value)}
                        className="w-full rounded border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    >
                        <option value="all">All Statuses</option>
                        <option value="open">Open</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                    </label>
                    <select
                        value={localFilters.category}
                        onChange={(e) => handleChange('category', e.target.value)}
                        className="w-full rounded border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    >
                        <option value="all">All Categories</option>
                        <option value="bug">Bug</option>
                        <option value="feature">Feature Request</option>
                        <option value="support">Support</option>
                    </select>
                </div>
                
                <div>
                    {/* Empty div for spacing */}
                </div>
            </div>
        </div>
    );
}