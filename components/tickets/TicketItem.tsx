'use client';

import { useState } from 'react';
import { Ticket } from './types';
import { formatDate } from '@/lib/utils';
import TicketAssignment from './TicketAssignment';

interface TicketItemProps {
    ticket: Ticket;
    onStatusChange: (ticketId: number, newStatus: Ticket['status']) => void;
    onAssign: (ticketId: number, assignedTo: number | null) => void;
    isAdmin: boolean;
}

export default function TicketItem({ ticket, onStatusChange, onAssign, isAdmin }: TicketItemProps) {
    const [isUpdating, setIsUpdating] = useState(false);
    
    const getStatusColor = (status: Ticket['status']) => {
        switch (status) {
            case 'open': return 'bg-blue-100 text-blue-800';
            case 'in-progress': return 'bg-yellow-100 text-yellow-800';
            case 'resolved': return 'bg-green-100 text-green-800';
            case 'closed': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    
    const getPriorityColor = (priority: Ticket['priority']) => {
        switch (priority) {
            case 'low': return 'bg-green-100 text-green-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'high': return 'bg-orange-100 text-orange-800';
            case 'urgent': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    
    const getCategoryColor = (category: Ticket['category']) => {
        switch (category) {
            case 'bug': return 'bg-red-100 text-red-800';
            case 'feature': return 'bg-blue-100 text-blue-800';
            case 'support': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    
    const handleStatusChange = async (newStatus: Ticket['status']) => {
        if (!isAdmin) return;
        
        try {
            setIsUpdating(true);
            const response = await fetch(`/api/tickets/${ticket.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            
            if (!response.ok) throw new Error('Failed to update status');
            
            onStatusChange(ticket.id, newStatus);
        } catch (error) {
            console.error('Error updating status:', error);
        } finally {
            setIsUpdating(false);
        }
    };
    
    return (
        <div className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                            {ticket.title}
                        </h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(ticket.status)}`}>
                            {ticket.status}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(ticket.category)}`}>
                            {ticket.category}
                        </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                        {ticket.description}
                    </p>
                    <div className="flex items-center text-xs text-gray-500 space-x-4">
                        <span>Created by: {ticket.created_by_name}</span>
                        {ticket.assigned_to_name && (
                            <span>Assigned to: {ticket.assigned_to_name}</span>
                        )}
                        <span>Created: {formatDate(ticket.created_at)}</span>
                    </div>
                </div>
                {isAdmin && (
                    <div className="flex space-x-2">
                        <select
                            value={ticket.status}
                            onChange={(e) => handleStatusChange(e.target.value as Ticket['status'])}
                            disabled={isUpdating}
                            className="text-sm rounded border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        >
                            <option value="open">Open</option>
                            <option value="in-progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                        </select>
                        <TicketAssignment 
                            ticketId={ticket.id}
                            currentAssignee={ticket.assigned_to}
                            onAssign={(userId) => onAssign(ticket.id, userId)}
                        />
                        <button
                            onClick={() => window.open(`/tickets/${ticket.id}`, '_blank')}
                            className="text-sm text-blue-600 hover:text-blue-800"
                        >
                            View
                        </button>
                    </div>
                )}
                {!isAdmin && (
                    <button
                        onClick={() => window.open(`/tickets/${ticket.id}`, '_blank')}
                        className="text-sm text-blue-600 hover:text-blue-800"
                    >
                        View
                    </button>
                )}
            </div>
        </div>
    );
}