'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TicketList from '@/components/tickets/TicketList';
import { useAuth } from '@/hooks/useAuth';

export default function TicketsPage() {
    const router = useRouter();
    const { user, loading } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        if (user) {
            setIsAdmin(user.role === 'admin' || user.role === 'superadmin');
        }
    }, [user]);

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        {isAdmin 
                            ? 'Manage all support tickets' 
                            : 'View and submit support tickets'}
                    </p>
                </div>
                <div className="mt-4 sm:mt-0">
                    <button
                        onClick={() => router.push('/tickets/new')}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        New Ticket
                    </button>
                </div>
            </div>
            
            <TicketList isAdmin={isAdmin} />
        </div>
    );
}