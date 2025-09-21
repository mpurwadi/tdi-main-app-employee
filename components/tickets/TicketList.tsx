'use client';

import { useState, useEffect } from 'react';
import { Ticket } from './types';
import TicketItem from './TicketItem';
import TicketFilter from './TicketFilter';

interface TicketListProps {
    isAdmin?: boolean;
}

export default function TicketList({ isAdmin = false }: TicketListProps) {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState({
        status: 'all',
        category: 'all',
        priority: 'all',
        search: ''
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams({
                page: currentPage.toString(),
                limit: '10',
                ...(filters.status !== 'all' && { status: filters.status }),
                ...(filters.category !== 'all' && { category: filters.category }),
                ...(filters.priority !== 'all' && { priority: filters.priority }),
                ...(filters.search && { search: filters.search })
            });
            
            const response = await fetch(`/api/tickets?${queryParams}`);
            if (!response.ok) throw new Error('Failed to fetch tickets');
            
            const data = await response.json();
            setTickets(data.tickets);
            setTotalPages(data.pagination.pages);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, [currentPage, filters]);

    const handleFilterChange = (newFilters: typeof filters) => {
        setFilters(newFilters);
        setCurrentPage(1);
    };

    const handleStatusChange = (ticketId: number, newStatus: Ticket['status']) => {
        setTickets(tickets.map(ticket => 
            ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
        ));
    };

    const handleAssign = (ticketId: number, assignedTo: number | null) => {
        setTickets(tickets.map(ticket => 
            ticket.id === ticketId ? { ...ticket, assigned_to: assignedTo } : ticket
        ));
    };

    if (loading) return <div className="text-center py-4">Loading tickets...</div>;
    if (error) return <div className="text-center py-4 text-red-500">Error: {error}</div>;

    return (
        <div className="space-y-4">
            <TicketFilter 
                filters={filters} 
                onFilterChange={handleFilterChange}
                isAdmin={isAdmin}
            />
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {tickets.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No tickets found
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {tickets.map(ticket => (
                            <TicketItem 
                                key={ticket.id} 
                                ticket={ticket} 
                                onStatusChange={handleStatusChange}
                                onAssign={handleAssign}
                                isAdmin={isAdmin}
                            />
                        ))}
                    </div>
                )}
            </div>
            
            {totalPages > 1 && (
                <div className="flex justify-center space-x-2">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 rounded border disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="px-4 py-2">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 rounded border disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}