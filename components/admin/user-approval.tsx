'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';

interface PendingUser {
    id: number;
    full_name: string;
    email: string;
    student_id: string;
    campus: string;
    division: string;
    status: string;
    created_at: string;
}

const UserApprovalComponent = () => {
    const [users, setUsers] = useState<PendingUser[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('pending');

    const fetchPendingUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            let url = `/api/admin/users?status=${statusFilter}`;
            if (searchTerm) {
                url += `&search=${encodeURIComponent(searchTerm)}`;
            }
            
            const response = await fetch(url);
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to fetch users');
            }
            const data: PendingUser[] = await response.json();
            setUsers(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingUsers();
    }, [searchTerm, statusFilter]);

    const handleUpdateStatus = async (userId: number, status: 'approved' | 'rejected' | 'suspended') => {
        try {
            const response = await fetch('/api/admin/users/status', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId, status }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || `Failed to ${status} user`);
            }

            // Remove the user from the list on successful update
            setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));

        } catch (err: any) {
            setError(err.message); // Show error specific to this action
            // Optionally, refetch users to get the latest state
            setTimeout(() => setError(null), 5000); // Clear error after 5s
        }
    };

    if (loading) {
        return <div>Loading users...</div>;
    }

    if (error) {
        return <div className="p-3.5 rounded-md bg-danger-light text-danger">Error: {error}</div>;
    }

    return (
        <div className="panel">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-xl font-bold">User Management</h2>
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <div className="sm:w-1/3">
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="form-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div>
                        <select
                            className="form-select"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="pending">Pending</option>
                            <option value="approved">Active</option>
                            <option value="suspended">Suspended</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>
            </div>
            
            {users.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-lg">No users found.</p>
                    <p className="text-gray-500 mt-2">
                        {statusFilter === 'pending' 
                            ? 'All caught up! There are no users waiting for approval.' 
                            : `No users with status "${statusFilter}" found.`}
                    </p>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="table-hover">
                        <thead>
                            <tr>
                                <th>Full Name</th>
                                <th>Email</th>
                                <th>Student ID</th>
                                <th>Campus</th>
                                <th>Division</th>
                                <th>Request Date</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td>{user.full_name}</td>
                                    <td>{user.email}</td>
                                    <td>{user.student_id}</td>
                                    <td>{user.campus}</td>
                                    <td>{user.division}</td>
                                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                                    <td className="text-center space-x-2">
                                        {user.status === 'pending' && (
                                            <>
                                                <button 
                                                    type="button" 
                                                    className="btn btn-sm btn-outline-success"
                                                    onClick={() => handleUpdateStatus(user.id, 'approved')}
                                                >
                                                    Approve
                                                </button>
                                                <button 
                                                    type="button" 
                                                    className="btn btn-sm btn-outline-warning"
                                                    onClick={() => handleUpdateStatus(user.id, 'suspended')}
                                                >
                                                    Suspend
                                                </button>
                                                <button 
                                                    type="button" 
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleUpdateStatus(user.id, 'rejected')}
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                        {user.status === 'approved' && (
                                            <>
                                                <button 
                                                    type="button" 
                                                    className="btn btn-sm btn-outline-warning"
                                                    onClick={() => handleUpdateStatus(user.id, 'suspended')}
                                                >
                                                    Suspend
                                                </button>
                                                <button 
                                                    type="button" 
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleUpdateStatus(user.id, 'rejected')}
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                        {user.status === 'suspended' && (
                                            <>
                                                <button 
                                                    type="button" 
                                                    className="btn btn-sm btn-outline-success"
                                                    onClick={() => handleUpdateStatus(user.id, 'approved')}
                                                >
                                                    Activate
                                                </button>
                                                <button 
                                                    type="button" 
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleUpdateStatus(user.id, 'rejected')}
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                        {user.status === 'rejected' && (
                                            <button 
                                                type="button" 
                                                className="btn btn-sm btn-outline-success"
                                                onClick={() => handleUpdateStatus(user.id, 'approved')}
                                            >
                                                Reapprove
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default UserApprovalComponent;
