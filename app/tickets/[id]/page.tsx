'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import TicketDetail from '@/components/tickets/TicketDetail';
import { useAuth } from '@/hooks/useAuth';

export default function TicketDetailPage() {
    const params = useParams();
    const { user, loading } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);
    const ticketId = params.id ? parseInt(params.id as string, 10) : null;

    useEffect(() => {
        if (user) {
            setIsAdmin(user.role === 'admin' || user.role === 'superadmin');
        }
    }, [user]);

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading...</div>;
    }

    if (!ticketId) {
        return <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">Invalid ticket ID</div>;
    }

    return (
        <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Ticket Details</h1>
            </div>
            
            <TicketDetail ticketId={ticketId} isAdmin={isAdmin} />
        </div>
    );
}