'use client';

import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';

interface Holiday {
    id: number;
    name: string;
    date: string;
    description: string;
    is_national: boolean;
    created_at: string;
    updated_at: string;
}

const AdminHolidaysPage = () => {
    const router = useRouter();
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        date: '',
        description: '',
        is_national: true
    });

    // Fetch holidays from API
    const fetchHolidays = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/holidays', { credentials: 'include' });
            
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to fetch holidays');
            }
            
            const data = await response.json();
            setHolidays(data);
        } catch (err: any) {
            setError(err.message);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.message,
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
        } finally {
            setLoading(false);
        }
    };

    // Initialize component
    useEffect(() => {
        fetchHolidays();
    }, []);

    // Handle form input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            const url = '/api/holidays';
            const method = editingHoliday ? 'PUT' : 'POST';
            
            const body = {
                ...(editingHoliday && { id: editingHoliday.id }),
                ...formData
            };
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(body)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || `Failed to ${editingHoliday ? 'update' : 'create'} holiday`);
            }
            
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: `Holiday ${editingHoliday ? 'updated' : 'created'} successfully`,
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
            
            // Reset form and refresh data
            setFormData({
                name: '',
                date: '',
                description: '',
                is_national: true
            });
            setEditingHoliday(null);
            setShowModal(false);
            fetchHolidays();
        } catch (err: any) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.message,
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
        }
    };

    // Handle edit holiday
    const handleEdit = (holiday: Holiday) => {
        setEditingHoliday(holiday);
        setFormData({
            name: holiday.name,
            date: holiday.date,
            description: holiday.description || '',
            is_national: holiday.is_national
        });
        setShowModal(true);
    };

    // Handle delete holiday
    const handleDelete = async (id: number) => {
        Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to delete this holiday?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch(`/api/holidays?id=${id}`, {
                        method: 'DELETE',
                        credentials: 'include'
                    });
                    
                    const data = await response.json();
                    
                    if (!response.ok) {
                        throw new Error(data.message || 'Failed to delete holiday');
                    }
                    
                    Swal.fire({
                        icon: 'success',
                        title: 'Deleted!',
                        text: 'Holiday has been deleted.',
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 3000
                    });
                    
                    fetchHolidays();
                } catch (err: any) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: err.message,
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 3000
                    });
                }
            }
        });
    };

    // Handle add new holiday
    const handleAddNew = () => {
        setEditingHoliday(null);
        setFormData({
            name: '',
            date: '',
            description: '',
            is_national: true
        });
        setShowModal(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg">Loading holidays...</div>
            </div>
        );
    }

    return (
        <div className="panel">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Manage Holidays</h2>
                <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={handleAddNew}
                >
                    Add New Holiday
                </button>
            </div>

            {error && (
                <div className="mb-5 p-3.5 rounded-md bg-danger-light text-danger">
                    {error}
                </div>
            )}

            <div className="table-responsive">
                <table className="table-hover">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Date</th>
                            <th>Description</th>
                            <th>National</th>
                            <th className="text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {holidays.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-8">
                                    No holidays found. Add your first holiday!
                                </td>
                            </tr>
                        ) : (
                            holidays.map((holiday) => (
                                <tr key={holiday.id}>
                                    <td>{holiday.name}</td>
                                    <td>{new Date(holiday.date).toLocaleDateString()}</td>
                                    <td>{holiday.description || '-'}</td>
                                    <td>
                                        <span className={`badge ${holiday.is_national ? 'badge-success' : 'badge-secondary'}`}>
                                            {holiday.is_national ? 'Yes' : 'No'}
                                        </span>
                                    </td>
                                    <td className="text-center">
                                        <div className="flex justify-center gap-2">
                                            <button 
                                                type="button" 
                                                className="btn btn-sm btn-outline-primary"
                                                onClick={() => handleEdit(holiday)}
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                type="button" 
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => handleDelete(holiday.id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Holiday Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-black rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">
                                {editingHoliday ? 'Edit Holiday' : 'Add New Holiday'}
                            </h3>
                            <button 
                                type="button" 
                                className="text-gray-400 hover:text-gray-600"
                                onClick={() => setShowModal(false)}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Holiday Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="form-input"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Date *</label>
                                <input
                                    type="date"
                                    name="date"
                                    className="form-input"
                                    value={formData.date}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    name="description"
                                    className="form-textarea"
                                    rows={3}
                                    value={formData.description}
                                    onChange={handleChange}
                                ></textarea>
                            </div>

                            <div className="mb-4">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="is_national"
                                        className="form-checkbox"
                                        checked={formData.is_national}
                                        onChange={handleChange}
                                    />
                                    <span className="ml-2">National Holiday</span>
                                </label>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                >
                                    {editingHoliday ? 'Update Holiday' : 'Add Holiday'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminHolidaysPage;