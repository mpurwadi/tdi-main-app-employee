'use client';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

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

const AdminRolesManagement = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');

    const fetchUsersAndRoles = async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch users
            const usersResponse = await fetch('/api/admin/users');
            if (!usersResponse.ok) {
                const data = await usersResponse.json();
                throw new Error(data.message || 'Failed to fetch users');
            }
            const usersData: User[] = await usersResponse.json();
            setUsers(usersData);

            // Fetch roles
            const rolesResponse = await fetch('/api/admin/roles');
            if (!rolesResponse.ok) {
                const data = await rolesResponse.json();
                throw new Error(data.message || 'Failed to fetch roles');
            }
            const rolesData = await rolesResponse.json();
            setRoles(rolesData.data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsersAndRoles();
    }, []);

    const handleRoleChange = async (userId: number, newRole: string) => {
        try {
            const response = await fetch('/api/admin/roles/assign', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId, role: newRole }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update user role');
            }

            // Show success message
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: data.message,
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
            });

            // Refresh the user list
            fetchUsersAndRoles();
        } catch (err: any) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.message,
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
            });
        }
    };

    // Filter users based on search term
    const filteredUsers = users.filter(user => {
        const searchLower = searchTerm.toLowerCase();
        return (
            user.full_name.toLowerCase().includes(searchLower) ||
            user.email.toLowerCase().includes(searchLower) ||
            user.student_id.toLowerCase().includes(searchLower) ||
            user.role.toLowerCase().includes(searchLower)
        );
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-3.5 rounded-md bg-danger-light text-danger">
                Error: {error}
            </div>
        );
    }

    return (
        <div className="panel">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Roles Management</h2>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <input
                    type="text"
                    placeholder="Search users..."
                    className="form-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {filteredUsers.length === 0 ? (
                <p>No users found.</p>
            ) : (
                <div className="table-responsive">
                    <table className="table-hover">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Student ID</th>
                                <th>Role</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user.id}>
                                    <td>{user.full_name}</td>
                                    <td>{user.email}</td>
                                    <td>{user.student_id}</td>
                                    <td>
                                        <span className={`badge ${
                                            user.role === 'superadmin' ? 'bg-danger' :
                                            user.role === 'admin' ? 'bg-primary' : 'bg-secondary'
                                        }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td>
                                        {user.role !== 'superadmin' ? (
                                            <div className="flex gap-2">
                                                <select
                                                    className="form-select"
                                                    value={user.role}
                                                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                >
                                                    <option value="user">User</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            </div>
                                        ) : (
                                            <span className="text-muted">Cannot change</span>
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

export default AdminRolesManagement;