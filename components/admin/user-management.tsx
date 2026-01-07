'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AuthPayload, isSuperadmin, isDivisionAdmin, isDivisionManager } from '@/lib/auth-helpers';
import IconPencil from '@/components/icon/icon-pencil';
import IconLockDots from '@/components/icon/icon-lock-dots';
import IconTrash from '@/components/icon/icon-trash';

interface User {
    id: number;
    full_name: string;
    email: string;
    student_id: string | null;
    campus: string | null;
    division_id: number | null;
    division_name: string | null;
    status: string;
    role: 'user' | 'admin' | 'superadmin';
    roles: string[]; // Array of division-specific roles
    job_role_id: number | null;
    job_role_name: string | null;
    created_at: string;
    updated_at: string;
}

interface Division {
    id: number;
    name: string;
}

const UserManagementComponent = () => {
    const { user: currentUser, loading: authLoading, isAuthenticated } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [divisions, setDivisions] = useState<Division[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showCreateUserModal, setShowCreateUserModal] = useState<boolean>(false);
    const [showPasswordResetModal, setShowPasswordResetModal] = useState<boolean>(false);
    const [newDivisionName, setNewDivisionName] = useState<string>('');
    const [creatingDivision, setCreatingDivision] = useState<boolean>(false);
    const [divisionError, setDivisionError] = useState<string | null>(null);

    const [showEditUserModal, setShowEditUserModal] = useState<boolean>(false);

    const [jobRoles, setJobRoles] = useState<{id: number, name: string}[]>([]);
    const [loadingJobRoles, setLoadingJobRoles] = useState(true);

    // Pagination states
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10); // Default to 10 rows per page
    const [totalUsers, setTotalUsers] = useState<number>(0);

    // Column filter states
    const [emailFilter, setEmailFilter] = useState<string>('');
    const [fullNameFilter, setFullNameFilter] = useState<string>('');
    const [divisionNameFilter, setDivisionNameFilter] = useState<string>('');
    const [roleFilter, setRoleFilter] = useState<string>('');

    const fetchUsersAndDivisions = async () => {
        setLoading(true);
        setError(null);
        try {
            if (!isAuthenticated || !currentUser) {
                setLoading(false);
                return; // Wait for auth to load
            }

            const usersUrl = new URL('/api/admin/users', window.location.origin);
            usersUrl.searchParams.append('page', currentPage.toString());
            usersUrl.searchParams.append('limit', pageSize.toString());

            if (emailFilter) usersUrl.searchParams.append('emailFilter', emailFilter);
            if (fullNameFilter) usersUrl.searchParams.append('fullNameFilter', fullNameFilter);
            if (divisionNameFilter) usersUrl.searchParams.append('divisionNameFilter', divisionNameFilter);
            if (roleFilter) usersUrl.searchParams.append('roleFilter', roleFilter);

            const divisionsUrl = '/api/admin/divisions';

            const [usersResponse, divisionsResponse] = await Promise.all([
                fetch(usersUrl.toString()),
                fetch(divisionsUrl)
            ]);

            if (!usersResponse.ok) {
                const errorData = await usersResponse.json();
                throw new Error(errorData.message || 'Failed to fetch users');
            }
            if (!divisionsResponse.ok) {
                const errorData = await divisionsResponse.json();
                throw new Error(errorData.message || 'Failed to fetch divisions');
            }

            const usersData = await usersResponse.json();
            const divisionsData: Division[] = await divisionsResponse.json();

            setUsers(usersData.users);
            setTotalUsers(usersData.totalCount);
            setDivisions(divisionsData);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            // Fetch divisions
            try {
                const divisionsResponse = await fetch('/api/admin/divisions', { credentials: 'include' });
                if (divisionsResponse.ok) {
                    const divisionsData = await divisionsResponse.json();
                    setDivisions(divisionsData);
                }
            } catch (err) {
                console.error('Error fetching divisions:', err);
            }

            // Fetch job roles
            try {
                const jobRolesResponse = await fetch('/api/job-roles', { credentials: 'include' });
                if (jobRolesResponse.ok) {
                    const jobRolesData = await jobRolesResponse.json();
                    setJobRoles(jobRolesData);
                }
            } catch (err) {
                console.error('Error fetching job roles:', err);
            } finally {
                setLoadingJobRoles(false);
            }
        };

        if (!authLoading) {
            fetchData();
            fetchUsersAndDivisions();
        }
    }, [authLoading, isAuthenticated, currentUser, currentPage, pageSize, emailFilter, fullNameFilter, divisionNameFilter, roleFilter]); // Re-fetch when auth state or pagination/filter changes

    const totalPages = useMemo(() => Math.ceil(totalUsers / pageSize), [totalUsers, pageSize]);

    const handlePageChange = (page: number) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleCreateDivision = async () => {
        if (!newDivisionName.trim()) {
            setDivisionError('Division name cannot be empty.');
            return;
        }
        setCreatingDivision(true);
        setDivisionError(null);
        try {
            const response = await fetch('/api/admin/divisions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newDivisionName }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create division');
            }
            setNewDivisionName('');
            await fetchUsersAndDivisions(); // Refresh data
        } catch (err: any) {
            setDivisionError(err.message);
        } finally {
            setCreatingDivision(false);
        }
    };

    const handleUserAction = async (userId: number, action: string, payload: any) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/admin/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, action, payload }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to perform action');
            }
            setSelectedUser(null); // Clear selection after action
            await fetchUsersAndDivisions(); // Refresh data
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId: number) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/admin/users?userId=${userId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete user');
            }
            setSelectedUser(null);
            await fetchUsersAndDivisions();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (userId: number, newPassword: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/admin/users/password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, newPassword }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to reset password');
            }
            setShowPasswordResetModal(false);
            setSelectedUser(null);
            // No need to fetch users again, password change doesn't affect list display
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) {
        return <div className="panel">Loading user management...</div>;
    }

    if (error) {
        return <div className="panel text-danger">Error: {error}</div>;
    }

    if (!isAuthenticated || !currentUser) {
        return <div className="panel text-danger">Unauthorized. Please log in.</div>;
    }

    const canCreateDivision = isSuperadmin(currentUser);
    const canCreateUser = isSuperadmin(currentUser);

    return (
        <div className="panel">
            <h2 className="text-xl font-bold mb-6">User & Role Management</h2>

            <div className="flex flex-col gap-6">
                {/* User List Section */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="form-input w-full max-w-xs"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {canCreateUser && (
                            <button 
                                type="button" 
                                className="btn btn-primary"
                                onClick={() => setShowCreateUserModal(true)}
                            >
                                Add New User
                            </button>
                        )}
                    </div>

                    <div className="table-container" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        <div className="table-responsive">
                            <table className="table-hover">
                                <thead>
                                    <tr>
                                    <th>
                                        Name
                                        <input type="text" placeholder="Filter Name" className="form-input form-input-sm mt-1" value={fullNameFilter} onChange={(e) => setFullNameFilter(e.target.value)} />
                                    </th>
                                    <th>
                                        Email
                                        <input type="text" placeholder="Filter Email" className="form-input form-input-sm mt-1" value={emailFilter} onChange={(e) => setEmailFilter(e.target.value)} />
                                    </th>
                                    <th>
                                        Division
                                        <input type="text" placeholder="Filter Division" className="form-input form-input-sm mt-1" value={divisionNameFilter} onChange={(e) => setDivisionNameFilter(e.target.value)} />
                                    </th>
                                    <th>
                                        Role
                                        <input type="text" placeholder="Filter Role" className="form-input form-input-sm mt-1" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} />
                                    </th>
                                    <th>Job Roles</th>
                                    <th className="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center">No users found.</td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <tr 
                                            key={user.id} 
                                            onClick={() => setSelectedUser(user)}
                                            className={`${selectedUser?.id === user.id ? 'bg-primary-light dark:bg-primary-dark' : ''} cursor-pointer`}
                                        >
                                            <td>{user.full_name}</td>
                                            <td>{user.email}</td>
                                            <td>{user.division_name || 'N/A'}</td>
                                            <td>{user.role}</td>
                                            <td>{user.job_role_name || 'None'}</td>
                                            <td className="text-center space-x-2" style={{ whiteSpace: 'nowrap' }}>
                                                <button 
                                                    type="button" 
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={(e) => { e.stopPropagation(); setSelectedUser(user); setShowEditUserModal(true); }}
                                                    disabled={!isSuperadmin(currentUser)}
                                                >
                                                    <IconPencil className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    type="button" 
                                                    className="btn btn-sm btn-outline-secondary"
                                                    onClick={(e) => { e.stopPropagation(); setSelectedUser(user); setShowPasswordResetModal(true); }}
                                                    disabled={!isSuperadmin(currentUser)}
                                                >
                                                    <IconLockDots className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    type="button" 
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteUser(user.id); }}
                                                    disabled={!isSuperadmin(currentUser)}
                                                >
                                                    <IconTrash className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                    {/* Pagination Controls */}
                    {totalUsers > 0 && (
                        <div className="flex justify-center items-center mt-4 space-x-2">
                            <button
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </button>
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    className={`btn btn-sm ${currentPage === i + 1 ? 'btn-primary' : 'btn-outline-primary'}`}
                                    onClick={() => handlePageChange(i + 1)}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>

                {/* Management Panel Section */}
                <div>
                    {selectedUser ? (
                        <ManagementPanel 
                            user={selectedUser} 
                            currentUser={currentUser} 
                            divisions={divisions}
                            onUpdate={handleUserAction}
                            onClose={() => setSelectedUser(null)}
                        />
                    ) : (
                        <div className="panel mt-6">
                            <h3 className="text-lg font-bold mb-4">Select a User</h3>
                            <p>Click on a user from the list to manage their division and roles.</p>
                        </div>
                    )}

                    {/* Create Division Section (Superadmin Only) */}
                    {canCreateDivision && (
                        <div className="panel mt-6">
                            <h3 className="text-lg font-bold mb-4">Create New Division</h3>
                            {divisionError && <div className="text-danger mb-4">{divisionError}</div>}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Division Name"
                                    className="form-input flex-grow"
                                    value={newDivisionName}
                                    onChange={(e) => setNewDivisionName(e.target.value)}
                                    disabled={creatingDivision}
                                />
                                <button 
                                    type="button" 
                                    className="btn btn-primary"
                                    onClick={handleCreateDivision}
                                    disabled={creatingDivision}
                                >
                                    {creatingDivision ? 'Creating...' : 'Create'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {showCreateUserModal && (
                <CreateUserModal 
                    onClose={() => setShowCreateUserModal(false)}
                    onSave={fetchUsersAndDivisions}
                    divisions={divisions}
                />
            )}

            {showPasswordResetModal && selectedUser && (
                <PasswordResetModal 
                    user={selectedUser}
                    onClose={() => { setShowPasswordResetModal(false); setSelectedUser(null); }}
                    onSave={handleResetPassword}
                />
            )}

            {showEditUserModal && selectedUser && (
                <EditUserModal
                    user={selectedUser}
                    divisions={divisions}
                    jobRoles={jobRoles}
                    loadingJobRoles={loadingJobRoles}
                    onClose={() => { setShowEditUserModal(false); setSelectedUser(null); }}
                    onSave={fetchUsersAndDivisions}
                />
            )}
        </div>
    );
};

// Edit User Modal Component
interface EditUserModalProps {
    user: User;
    divisions: Division[];
    jobRoles: {id: number, name: string}[];
    loadingJobRoles: boolean;
    onClose: () => void;
    onSave: () => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ user, divisions, jobRoles, loadingJobRoles, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        full_name: user.full_name,
        email: user.email,
        student_id: user.student_id || '',
        campus: user.campus || '',
        division_id: user.division_id || '',
        job_role_id: user.job_role_id || '',
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
            const body = {
                ...formData,
                division_id: formData.division_id ? parseInt(formData.division_id as string) : null,
                job_role_id: formData.job_role_id ? parseInt(formData.job_role_id as string) : null,
            };

            const response = await fetch(`/api/admin/users`,
            {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, action: 'update_user', payload: body }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to update user');
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
                <h3 className="text-lg font-bold mb-4">Edit User</h3>

                {error && (
                    <div className="p-3.5 rounded-md bg-danger-light text-danger mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Full Name</label>
                        <input type="text" name="full_name" className="form-input" value={formData.full_name} onChange={handleChange} required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input type="email" name="email" className="form-input" value={formData.email} onChange={handleChange} required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Student ID</label>
                        <input type="text" name="student_id" className="form-input" value={formData.student_id} onChange={handleChange} />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Campus</label>
                        <input type="text" name="campus" className="form-input" value={formData.campus} onChange={handleChange} />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Division</label>
                        <select
                            name="division_id"
                            className="form-select"
                            value={formData.division_id}
                            onChange={handleChange}
                        >
                            <option value="">Select Division</option>
                            {divisions.map(div => <option key={div.id} value={div.id}>{div.name}</option>)}
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Job Role</label>
                        <select
                            name="job_role_id"
                            className="form-select"
                            value={formData.job_role_id}
                            onChange={handleChange}
                            disabled={loadingJobRoles}
                        >
                            <option value="">{loadingJobRoles ? 'Loading job roles...' : 'Select Job Role'}</option>
                            {jobRoles.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}
                        </select>
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={loading}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Updating...' : 'Update User'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Management Panel Component
interface ManagementPanelProps {
    user: User;
    currentUser: AuthPayload;
    divisions: Division[];
    onUpdate: (userId: number, action: string, payload: any) => Promise<void>;
    onClose: () => void;
}

const ManagementPanel: React.FC<ManagementPanelProps> = ({ user, currentUser, divisions, onUpdate, onClose }) => {
    const [selectedDivisionId, setSelectedDivisionId] = useState<number | null>(user.division_id);
    const [selectedDivisionRoles, setSelectedDivisionRoles] = useState<string[]>(user.roles);
    const [isUpdating, setIsUpdating] = useState<boolean>(false);
    const [updateError, setUpdateError] = useState<string | null>(null);

    useEffect(() => {
        setSelectedDivisionId(user.division_id);
        setSelectedDivisionRoles(user.roles);
    }, [user]);

    const handleAssignDivision = async () => {
        if (selectedDivisionId === null) {
            setUpdateError('Please select a division.');
            return;
        }
        setIsUpdating(true);
        setUpdateError(null);
        await onUpdate(user.id, 'assign_division', { divisionId: selectedDivisionId });
        setIsUpdating(false);
        onClose();
    };

    const handleUpdateRoles = async () => {
        setIsUpdating(true);
        setUpdateError(null);
        await onUpdate(user.id, 'update_roles', { roles: selectedDivisionRoles });
        setIsUpdating(false);
        onClose();
    };

    const availableDivisionRoles = useMemo(() => {
        if (isSuperadmin(currentUser)) {
            return ['admin divisi', 'manager divisi', 'head divisi', 'implementor'];
        } else if (isDivisionAdmin(currentUser)) {
            return ['admin divisi', 'manager divisi', 'head divisi'];
        } else if (isDivisionManager(currentUser)) {
            return ['implementor'];
        }
        return [];
    }, [currentUser]);

    return (
        <div className="panel">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Manage {user.full_name}</h3>
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onClose}>X</button>
            </div>
            {updateError && <div className="text-danger mb-4">{updateError}</div>}

            <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Current Role:</label>
                <p className="font-semibold">{user.role}</p>
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Current Division:</label>
                <p className="font-semibold">{user.division_name || 'Not Assigned'}</p>
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Current Division Roles:</label>
                <p className="font-semibold">{user.roles.join(', ') || 'None'}</p>
            </div>

            {/* Superadmin: Assign Division */}
            {isSuperadmin(currentUser) && (
                <div className="mb-4">
                    <label htmlFor="division-select" className="block text-sm font-medium mb-1">Assign to Division</label>
                    <select
                        id="division-select"
                        className="form-select"
                        value={selectedDivisionId || ''}
                        onChange={(e) => setSelectedDivisionId(parseInt(e.target.value))}
                        disabled={isUpdating}
                    >
                        <option value="">Select Division</option>
                        {divisions.map(div => (
                            <option key={div.id} value={div.id}>{div.name}</option>)
                        )}
                    </select>
                    <button 
                        type="button" 
                        className="btn btn-sm btn-primary mt-2"
                        onClick={handleAssignDivision}
                        disabled={isUpdating || selectedDivisionId === user.division_id}
                    >
                        {isUpdating ? 'Assigning...' : 'Assign Division'}
                    </button>
                </div>
            )}

            {/* Superadmin, Division Admin, Division Manager: Update Division Roles */}
            {(isSuperadmin(currentUser) || isDivisionAdmin(currentUser) || isDivisionManager(currentUser)) && (
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Update Division Roles</label>
                    <div className="flex flex-wrap gap-2">
                        {availableDivisionRoles.map(role => (
                            <label key={role} className="flex items-center">
                                <input
                                    type="checkbox"
                                    className="form-checkbox"
                                    value={role}
                                    checked={selectedDivisionRoles.includes(role)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedDivisionRoles(prev => [...prev, role]);
                                        } else {
                                            setSelectedDivisionRoles(prev => prev.filter(r => r !== role));
                                        }
                                    }}
                                    disabled={isUpdating}
                                />
                                <span className="ml-2">{role}</span>
                            </label>
                        ))}
                    </div>
                    <button 
                        type="button" 
                        className="btn btn-sm btn-primary mt-2"
                        onClick={handleUpdateRoles}
                        disabled={isUpdating || JSON.stringify(selectedDivisionRoles) === JSON.stringify(user.roles)}
                    >
                        {isUpdating ? 'Updating...' : 'Update Roles'}
                    </button>
                </div>
            )}
        </div>
    );
};

// Create User Modal Component
interface CreateUserModalProps {
    onClose: () => void;
    onSave: () => void;
    divisions: Division[];
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({ onClose, onSave, divisions }) => {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        student_id: '',
        campus: '',
        division_id: '' as string | number,
        password: '',
        role: 'user',
        roles: [] as string[],
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { value } = e.target;
        setFormData(prev => ({ ...prev, role: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        try {
            const body = { 
                ...formData, 
                division_id: formData.division_id ? parseInt(formData.division_id as string) : null,
                roles: formData.roles // Ensure roles is an array
            };

            const response = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to create user');
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
                <h3 className="text-lg font-bold mb-4">Create New User</h3>
                
                {error && (
                    <div className="p-3.5 rounded-md bg-danger-light text-danger mb-4">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Full Name</label>
                        <input type="text" name="full_name" className="form-input" value={formData.full_name} onChange={handleChange} required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input type="email" name="email" className="form-input" value={formData.email} onChange={handleChange} required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Student ID</label>
                        <input type="text" name="student_id" className="form-input" value={formData.student_id} onChange={handleChange} />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Campus</label>
                        <input type="text" name="campus" className="form-input" value={formData.campus} onChange={handleChange} />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Division</label>
                        <select
                            name="division_id"
                            className="form-select"
                            value={formData.division_id}
                            onChange={handleChange}
                        >
                            <option value="">Select Division</option>
                            {divisions.map(div => <option key={div.id} value={div.id}>{div.name}</option>)}
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input type="password" name="password" className="form-input" value={formData.password} onChange={handleChange} required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Global Role</label>
                        <select
                            name="role"
                            className="form-select"
                            value={formData.role}
                            onChange={handleRoleChange}
                        >
                            <option value="user">user</option>
                            <option value="superadmin">superadmin</option>
                        </select>
                    </div>
                    
                    <div className="flex justify-end space-x-3">
                        <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={loading}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create User'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserManagementComponent;

// Password Reset Modal Component
interface PasswordResetModalProps {
    user: User;
    onClose: () => void;
    onSave: (userId: number, newPassword: string) => Promise<void>;
}

const PasswordResetModal: React.FC<PasswordResetModalProps> = ({ user, onClose, onSave }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }
        setLoading(true);
        setError(null);
        await onSave(user.id, password);
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-black rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-bold mb-4">Reset Password for {user.full_name}</h3>
                
                {error && (
                    <div className="p-3.5 rounded-md bg-danger-light text-danger mb-4">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">New Password</label>
                        <input
                            type="password"
                            className="form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                        <input
                            type="password"
                            className="form-input"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
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
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};