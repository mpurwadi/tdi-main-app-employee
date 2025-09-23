'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';

interface User {
    id: number;
    full_name: string;
    email: string;
    student_id: string;
    campus: string;
    division: string;
    status: string;
    role: string;
    created_at: string;
    updated_at: string;
}

const UserManagementComponent = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            let url = '/api/admin/users';
            const params = new URLSearchParams();
            
            if (statusFilter !== 'all') {
                params.append('status', statusFilter);
            }
            
            if (searchTerm) {
                params.append('search', searchTerm);
            }
            
            if (params.toString()) {
                url += `?${params.toString()}`;
            }
            
            const response = await fetch(url);
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to fetch users');
            }
            const data: User[] = await response.json();
            setUsers(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [statusFilter, searchTerm]);

    const handleStatusChange = async (userId: number, status: string) => {
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
                throw new Error(data.message || 'Failed to update user status');
            }

            // Refresh the user list
            fetchUsers();
        } catch (err: any) {
            setError(err.message);
            setTimeout(() => setError(null), 5000);
        }
    };

    const handleRoleChange = async (userId: number, role: string) => {
        try {
            const response = await fetch('/api/admin/users/role', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId, role }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to update user role');
            }

            // Refresh the user list
            fetchUsers();
        } catch (err: any) {
            setError(err.message);
            setTimeout(() => setError(null), 5000);
        }
    };

    const handleDeleteUser = async (userId: number) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }
        
        try {
            const response = await fetch(`/api/admin/users?userId=${userId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to delete user');
            }

            // Refresh the user list
            fetchUsers();
        } catch (err: any) {
            setError(err.message);
            setTimeout(() => setError(null), 5000);
        }
    };

    const handleCreateUser = () => {
        setEditingUser(null);
        setShowCreateForm(true);
    };

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setShowCreateForm(true);
    };

    const handleCloseForm = () => {
        setShowCreateForm(false);
        setEditingUser(null);
        fetchUsers(); // Refresh the user list
    };

    if (loading) {
        return <div>Loading users...</div>;
    }

    if (error) {
        return <div className="p-3.5 rounded-md bg-danger-light text-danger">Error: {error}</div>;
    }

    return (
        <div className="panel">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">User Management</h2>
                <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={handleCreateUser}
                >
                    Add New User
                </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <input
                    type="text"
                    placeholder="Search users..."
                    className="form-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                    className="form-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="suspended">Suspended</option>
                </select>
            </div>

            {users.length === 0 ? (
                <p>No users found.</p>
            ) : (
                <div className="table-responsive">
                    <table className="table-hover">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Student ID</th>
                                <th>Campus</th>
                                <th>Division</th>
                                <th>Status</th>
                                <th>Role</th>
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
                                    <td>
                                        <span className={`badge ${
                                            user.status === 'approved' ? 'badge-success' :
                                            user.status === 'pending' ? 'badge-warning' :
                                            user.status === 'rejected' ? 'badge-danger' :
                                            'badge-secondary'
                                        }`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td>
                                        <select
                                            className="form-select"
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                        >
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                            <option value="superadmin">Super Admin</option>
                                            <option value="itsm_division_admin">ITSM Division Admin</option>
                                            <option value="itsm_manager">ITSM Manager</option>
                                            <option value="service_catalog_manager">Service Catalog Manager</option>
                                            <option value="service_provider">Service Provider</option>
                                            <option value="service_requester">Service Requester</option>
                                            <option value="approver">Approver</option>
                                            <option value="billing_coordinator">Billing Coordinator</option>
                                            <option value="billing_admin">Billing Admin</option>
                                            <option value="change_requester">Change Requester</option>
                                            <option value="change_manager">Change Manager</option>
                                            <option value="cab_member">CAB Member</option>
                                            <option value="implementer">Implementer</option>
                                        </select>
                                    </td>
                                    <td className="text-center space-x-2">
                                        <button 
                                            type="button" 
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={() => handleEditUser(user)}
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            type="button" 
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleDeleteUser(user.id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showCreateForm && (
                <UserForm 
                    user={editingUser} 
                    onClose={handleCloseForm} 
                    onSave={fetchUsers} 
                />
            )}
        </div>
    );
};

// User Form Component
const UserForm = ({ user, onClose, onSave }: { user: User | null; onClose: () => void; onSave: () => void }) => {
    const [formData, setFormData] = useState({
        full_name: user?.full_name || '',
        email: user?.email || '',
        student_id: user?.student_id || '',
        campus: user?.campus || '',
        division: user?.division || '',
        password: '',
        role: user?.role || 'user',
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        try {
            const url = user ? `/api/admin/users` : `/api/admin/users`;
            const method = user ? 'PUT' : 'POST';
            
            const body: any = { ...formData };
            if (user) {
                body.userId = user.id;
            }
            
            // If editing, we don't require password
            if (user && !formData.password) {
                delete body.password;
            }
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || `Failed to ${user ? 'update' : 'create'} user`);
            }

            onSave();
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-black rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-bold mb-4">{user ? 'Edit User' : 'Create New User'}</h3>
                
                {error && (
                    <div className="p-3.5 rounded-md bg-danger-light text-danger mb-4">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Full Name</label>
                        <input
                            type="text"
                            name="full_name"
                            className="form-input"
                            value={formData.full_name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            className="form-input"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Student ID</label>
                        <input
                            type="text"
                            name="student_id"
                            className="form-input"
                            value={formData.student_id}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Campus</label>
                        <input
                            type="text"
                            name="campus"
                            className="form-input"
                            value={formData.campus}
                            onChange={handleChange}
                        />
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Division</label>
                        <input
                            type="text"
                            name="division"
                            className="form-input"
                            value={formData.division}
                            onChange={handleChange}
                        />
                    </div>
                    
                    {!user && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Password</label>
                            <input
                                type="password"
                                name="password"
                                className="form-input"
                                value={formData.password}
                                onChange={handleChange}
                                required={!user}
                            />
                        </div>
                    )}
                    
                    {user && formData.password && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">New Password (leave blank to keep current)</label>
                            <input
                                type="password"
                                name="password"
                                className="form-input"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                    )}
                    
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Role</label>
                        <select
                            name="role"
                            className="form-select"
                            value={formData.role}
                            onChange={handleChange}
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                            <option value="superadmin">Super Admin</option>
                            <option value="itsm_division_admin">ITSM Division Admin</option>
                            <option value="itsm_manager">ITSM Manager</option>
                            <option value="service_catalog_manager">Service Catalog Manager</option>
                            <option value="service_provider">Service Provider</option>
                            <option value="service_requester">Service Requester</option>
                            <option value="approver">Approver</option>
                            <option value="billing_coordinator">Billing Coordinator</option>
                            <option value="billing_admin">Billing Admin</option>
                            <option value="change_requester">Change Requester</option>
                            <option value="change_manager">Change Manager</option>
                            <option value="cab_member">CAB Member</option>
                            <option value="implementer">Implementer</option>
                        </select>
                    </div>
                    
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : user ? 'Update User' : 'Create User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserManagementComponent;