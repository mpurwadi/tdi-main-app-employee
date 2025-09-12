'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';

interface LogbookEntry {
    id: number;
    user_id: number;
    entry_date: string;
    activity: string;
    work_type: string | null;
    start_time: string | null;
    end_time: string | null;
    status: string;
    created_at: string;
    updated_at: string;
    full_name: string;
    student_id: string;
    division: string;
}

const AdminLogbookApproval = () => {
    const [entries, setEntries] = useState<LogbookEntry[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('pending');

    const fetchEntries = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/admin/logbook?status=${statusFilter}`);
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to fetch logbook entries');
            }
            const data: LogbookEntry[] = await response.json();
            setEntries(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEntries();
    }, [statusFilter]);

    const handleStatusChange = async (entryId: number, status: 'approved' | 'rejected') => {
        try {
            const response = await fetch('/api/admin/logbook', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ entryId, status }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || `Failed to ${status} logbook entry`);
            }

            // Refresh the entries
            fetchEntries();
        } catch (err: any) {
            setError(err.message);
            setTimeout(() => setError(null), 5000);
        }
    };

    if (loading) {
        return <div>Loading logbook entries...</div>;
    }

    if (error) {
        return <div className="p-3.5 rounded-md bg-danger-light text-danger">Error: {error}</div>;
    }

    return (
        <div className="panel">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Logbook Approval</h2>
                <div className="sm:w-1/4">
                    <select
                        className="form-select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>

            {entries.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-lg">No logbook entries found.</p>
                    <p className="text-gray-500 mt-2">
                        {statusFilter === 'pending' 
                            ? 'All caught up! There are no entries waiting for approval.' 
                            : `No ${statusFilter} entries found.`}
                    </p>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="table-hover">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Student ID</th>
                                <th>Division</th>
                                <th>Date</th>
                                <th>Activity</th>
                                <th>Work Type</th>
                                <th>Time</th>
                                <th>Status</th>
                                {statusFilter === 'pending' && <th className="text-center">Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {entries.map((entry) => (
                                <tr key={entry.id}>
                                    <td>{entry.full_name}</td>
                                    <td>{entry.student_id}</td>
                                    <td>{entry.division}</td>
                                    <td>{new Date(entry.entry_date).toLocaleDateString()}</td>
                                    <td>
                                        <div className="max-w-xs truncate" title={entry.activity}>
                                            {entry.activity}
                                        </div>
                                    </td>
                                    <td>{entry.work_type || '-'}</td>
                                    <td>
                                        {entry.start_time && entry.end_time 
                                            ? `${entry.start_time} - ${entry.end_time}` 
                                            : '-'}
                                    </td>
                                    <td>
                                        <span className={`badge ${
                                            entry.status === 'approved' ? 'badge-success' :
                                            entry.status === 'pending' ? 'badge-warning' :
                                            'badge-danger'
                                        }`}>
                                            {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                                        </span>
                                    </td>
                                    {statusFilter === 'pending' && (
                                        <td className="text-center space-x-2">
                                            <button 
                                                type="button" 
                                                className="btn btn-sm btn-outline-success"
                                                onClick={() => handleStatusChange(entry.id, 'approved')}
                                            >
                                                Approve
                                            </button>
                                            <button 
                                                type="button" 
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => handleStatusChange(entry.id, 'rejected')}
                                            >
                                                Reject
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminLogbookApproval;