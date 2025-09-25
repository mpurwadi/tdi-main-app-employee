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
    const [resettingPassword, setResettingPassword] = useState<number | null>(null);
    const [selectedDivision, setSelectedDivision] = useState<string>(''); // New state for division

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

            // Fetch roles (if needed, currently hardcoded in select)
            // const rolesResponse = await fetch('/api/admin/roles');
            // if (!rolesResponse.ok) {
            //     const data = await rolesResponse.json();
            //     throw new Error(data.message || 'Failed to fetch roles');
            // }
            // const rolesData = await rolesResponse.json();
            // setRoles(rolesData.data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsersAndRoles();
    }, []);

    const handleRoleChange = async (userId: number, newRole: string, newDivision?: string) => {
        try {
            const payload: { userId: number; role: string; division?: string } = { userId, role: newRole };
            if (newDivision) {
                payload.division = newDivision;
            }
            const response = await fetch('/api/admin/roles/assign', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
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

    const handleResetPassword = async (userId: number, userName: string) => {
        try {
            // Ask for new password using SweetAlert
            const { value: newPassword } = await Swal.fire({
                title: `Reset Password for ${userName}`,
                input: 'password',
                inputLabel: 'New Password',
                inputPlaceholder: 'Enter new password',
                inputAttributes: {
                    autocapitalize: 'off',
                    autocorrect: 'off'
                },
                showCancelButton: true,
                confirmButtonText: 'Reset Password',
                cancelButtonText: 'Cancel',
                showLoaderOnConfirm: true,
                preConfirm: (password) => {
                    if (!password || password.length < 8) {
                        Swal.showValidationMessage('Password must be at least 8 characters long');
                        return false;
                    }
                    return password;
                }
            });

            if (newPassword) {
                setResettingPassword(userId);
                
                const response = await fetch('/api/admin/users/password', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ userId, newPassword }),
                });

                const data = await response.json();
                setResettingPassword(null);

                if (!response.ok) {
                    throw new Error(data.message || 'Failed to reset password');
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
            }
        } catch (err: any) {
            setResettingPassword(null);
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
                                        <div className="flex flex-wrap gap-2">
                                            {user.role !== 'superadmin' ? (
                                                <>
                                                    <select
                                                        className="form-select"
                                                        value={user.role}
                                                        onChange={(e) => {
                                                            const newRole = e.target.value;
                                                            // If changing to a division-specific role, set selectedDivision
                                                            if (['itsm_division_admin', 'itsm_manager'].includes(newRole)) {
                                                                setSelectedDivision(user.division || ''); // Pre-fill with current division if exists
                                                            } else {
                                                                setSelectedDivision(''); // Clear division for non-division roles
                                                            }
                                                            handleRoleChange(user.id, newRole, newRole === 'itsm_division_admin' || newRole === 'itsm_manager' ? selectedDivision : undefined);
                                                        }}
                                                    >
                                                        <option value="user">User</option>
                                                        <option value="admin">Admin</option>
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
                                                    {(user.role === 'itsm_division_admin' || user.role === 'itsm_manager') && (
                                                        <select
                                                            className="form-select mt-2"
                                                            value={selectedDivision}
                                                            onChange={(e) => {
                                                                setSelectedDivision(e.target.value);
                                                                handleRoleChange(user.id, user.role, e.target.value);
                                                            }}
                                                        >
                                                            <option value="">Select Division</option>
                                                            <option value="devops">DevOps</option>
                                                            <option value="operasional">Operasional</option>
                                                            <option value="bigdata">Big Data</option>
                                                            <option value="produk">Produk</option>
                                                        </select>
                                                    )}
                                                </>
                                            ) : (
                                                <span className="text-muted">Cannot change</span>
                                            )}
                                            
                                            <button
                                                type="button"
                                                className="btn btn-warning btn-sm"
                                                onClick={() => handleResetPassword(user.id, user.full_name)}
                                                disabled={resettingPassword === user.id}
                                            >
                                                {resettingPassword === user.id ? 'Resetting...' : 'Reset Password'}
                                            </button>
                                        </div>
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