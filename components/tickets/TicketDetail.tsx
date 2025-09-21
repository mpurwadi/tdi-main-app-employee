'use client';

import { useState, useEffect } from 'react';
import { TicketWithComments, TicketComment } from './types';
import { formatDate } from '@/lib/utils';
import TicketAssignment from './TicketAssignment';

interface TicketDetailProps {
    ticketId: number;
    isAdmin: boolean;
}

export default function TicketDetail({ ticketId, isAdmin }: TicketDetailProps) {
    const [ticket, setTicket] = useState<TicketWithComments | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchTicket = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/tickets/${ticketId}`);
            if (!response.ok) throw new Error('Failed to fetch ticket');
            
            const data = await response.json();
            setTicket(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTicket();
    }, [ticketId]);

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        
        try {
            setIsSubmitting(true);
            const response = await fetch(`/api/tickets/${ticketId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ comment: newComment })
            });
            
            if (!response.ok) throw new Error('Failed to submit comment');
            
            const comment = await response.json();
            setTicket(prev => prev ? {
                ...prev,
                comments: [...prev.comments, comment]
            } : null);
            setNewComment('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        if (!isAdmin || !ticket) return;
        
        try {
            const response = await fetch(`/api/tickets/${ticketId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            
            if (!response.ok) throw new Error('Failed to update status');
            
            const updatedTicket = await response.json();
            setTicket(prev => prev ? { ...prev, ...updatedTicket } : null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        }
    };

    const handleAssign = async (userId: number | null) => {
        if (!isAdmin || !ticket) return;
        
        try {
            const response = await fetch(`/api/tickets/${ticketId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ assignedTo: userId })
            });
            
            if (!response.ok) throw new Error('Failed to assign ticket');
            
            const updatedTicket = await response.json();
            setTicket(prev => prev ? { ...prev, ...updatedTicket } : null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'bg-blue-100 text-blue-800';
            case 'in-progress': return 'bg-yellow-100 text-yellow-800';
            case 'resolved': return 'bg-green-100 text-green-800';
            case 'closed': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    
    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'low': return 'bg-green-100 text-green-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'high': return 'bg-orange-100 text-orange-800';
            case 'urgent': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    
    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'bug': return 'bg-red-100 text-red-800';
            case 'feature': return 'bg-blue-100 text-blue-800';
            case 'support': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) return <div className="text-center py-4">Loading ticket...</div>;
    if (error) return <div className="text-center py-4 text-red-500">Error: {error}</div>;
    if (!ticket) return <div className="text-center py-4">Ticket not found</div>;

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{ticket.title}</h1>
                        <div className="flex items-center space-x-2 mt-2">
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
                    </div>
                    {isAdmin && (
                        <div className="flex space-x-2">
                            <select
                                value={ticket.status}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                className="text-sm rounded border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                            >
                                <option value="open">Open</option>
                                <option value="in-progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>
                    )}
                </div>
                
                <div className="prose max-w-none mb-6">
                    <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <p className="font-medium text-gray-500">Created by</p>
                            <p className="text-gray-900">{ticket.created_by_name}</p>
                        </div>
                        <div>
                            <p className="font-medium text-gray-500">Created at</p>
                            <p className="text-gray-900">{formatDate(ticket.created_at)}</p>
                        </div>
                        {isAdmin && (
                            <div>
                                <p className="font-medium text-gray-500">Assignment</p>
                                <TicketAssignment 
                                    ticketId={ticketId}
                                    currentAssignee={ticket.assigned_to}
                                    onAssign={handleAssign}
                                />
                            </div>
                        )}
                        {ticket.assigned_to_name && !isAdmin && (
                            <div>
                                <p className="font-medium text-gray-500">Assigned to</p>
                                <p className="text-gray-900">{ticket.assigned_to_name}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            <div className="border-t border-gray-200 p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Comments ({ticket.comments.length})</h2>
                
                <div className="space-y-4 mb-6">
                    {ticket.comments.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No comments yet</p>
                    ) : (
                        ticket.comments.map((comment) => (
                            <div key={comment.id} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex justify-between">
                                    <span className="font-medium text-gray-900">{comment.user_name}</span>
                                    <span className="text-sm text-gray-500">{formatDate(comment.created_at)}</span>
                                </div>
                                <p className="mt-2 text-gray-700 whitespace-pre-wrap">{comment.comment}</p>
                            </div>
                        ))
                    )}
                </div>
                
                <form onSubmit={handleSubmitComment} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-md font-medium text-gray-900 mb-2">Add a comment</h3>
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={3}
                        className="w-full rounded border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        placeholder="Add your comment here..."
                        disabled={isSubmitting}
                    />
                    <div className="flex justify-end mt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting || !newComment.trim()}
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {isSubmitting ? 'Posting...' : 'Post Comment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}