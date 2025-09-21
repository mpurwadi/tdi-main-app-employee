'use client';

import { useState, useEffect } from 'react';
import { User } from './types';

interface TicketAssignmentProps {
    ticketId: number;
    currentAssignee?: number | null;
    onAssign: (userId: number | null) => void;
}

export default function TicketAssignment({ ticketId, currentAssignee, onAssign }: TicketAssignmentProps) {
    const [admins, setAdmins] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    const fetchAdmins = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/users?role=admin');
            if (!response.ok) throw new Error('Failed to fetch admins');
            
            const data = await response.json();
            setAdmins(data.users || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    const handleAssign = async (userId: number | null) => {
        try {
            setIsUpdating(true);
            const response = await fetch(`/api/tickets/${ticketId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ assignedTo: userId })
            });
            
            if (!response.ok) throw new Error('Failed to assign ticket');
            
            onAssign(userId);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading) return <div className="text-sm text-gray-500">Loading admins...</div>;
    if (error) return <div className="text-sm text-red-500">Error: {error}</div>;

    return (
        <div className="flex items-center space-x-2">
            <select
                value={currentAssignee?.toString() || ''}
                onChange={(e) => handleAssign(e.target.value ? parseInt(e.target.value) : null)}
                disabled={isUpdating}
                className="text-sm rounded border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            >
                <option value="">Unassigned</option>
                {admins.map(admin => (
                    <option key={admin.id} value={admin.id}>
                        {admin.full_name}
                    </option>
                ))}
            </select>
            {isUpdating && (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
            )}
        </div>
    );
}