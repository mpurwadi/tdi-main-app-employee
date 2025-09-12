'use client';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const AdminNewsManagement = () => {
    const { t } = useTranslation();
    const [newsItems, setNewsItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    
    // Form state
    const [isEditing, setIsEditing] = useState(false);
    const [currentItem, setCurrentItem] = useState<any>(null);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: 'news',
        isPublished: false
    });

    // Fetch all news and announcements
    const fetchNewsItems = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/news');
            const data = await response.json();
            
            if (data.success) {
                setNewsItems(data.data);
            } else {
                setError(data.message || 'Failed to fetch news items');
            }
        } catch (err) {
            setError('Failed to fetch news items');
        } finally {
            setLoading(false);
        }
    };

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
        
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            const url = isEditing ? `/api/admin/news/${currentItem.id}` : '/api/admin/news';
            const method = isEditing ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            
            const data = await response.json();
            
            if (data.success) {
                setMessage({ text: data.message, type: 'success' });
                resetForm();
                fetchNewsItems();
            } else {
                setMessage({ text: data.message || 'Operation failed', type: 'error' });
            }
        } catch (err) {
            setMessage({ text: 'Network error occurred', type: 'error' });
        }
    };

    // Edit item
    const handleEdit = (item: any) => {
        setCurrentItem(item);
        setFormData({
            title: item.title,
            content: item.content,
            category: item.category,
            isPublished: item.is_published
        });
        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Delete item
    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this item?')) {
            return;
        }
        
        try {
            const response = await fetch(`/api/admin/news/${id}`, {
                method: 'DELETE',
            });
            
            const data = await response.json();
            
            if (data.success) {
                setMessage({ text: data.message, type: 'success' });
                fetchNewsItems();
            } else {
                setMessage({ text: data.message || 'Delete failed', type: 'error' });
            }
        } catch (err) {
            setMessage({ text: 'Network error occurred', type: 'error' });
        }
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            title: '',
            content: '',
            category: 'news',
            isPublished: false
        });
        setIsEditing(false);
        setCurrentItem(null);
    };

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    // Initialize
    useEffect(() => {
        fetchNewsItems();
    }, []);

    return (
        <div>
            <div className="flex items-center justify-between mb-5">
                <h5 className="font-semibold text-lg">News & Announcements Management</h5>
            </div>

            {/* Message Display */}
            {message && (
                <div
                    className={`mb-5 p-4 rounded ${
                        message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                >
                    {message.text}
                </div>
            )}

            {/* News/Announcement Form */}
            <div className="panel mb-6">
                <h6 className="font-semibold text-lg mb-4">
                    {isEditing ? 'Edit News/Announcement' : 'Add New News/Announcement'}
                </h6>
                
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="form-input"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-2">Category</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className="form-select"
                            >
                                <option value="news">News</option>
                                <option value="announcement">Announcement</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Content</label>
                        <textarea
                            name="content"
                            value={formData.content}
                            onChange={handleInputChange}
                            className="form-textarea"
                            rows={4}
                            required
                        ></textarea>
                    </div>
                    
                    <div className="mb-4">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                name="isPublished"
                                checked={formData.isPublished}
                                onChange={handleInputChange}
                                className="form-checkbox"
                            />
                            <span className="ml-2">Published</span>
                        </label>
                    </div>
                    
                    <div className="flex space-x-3">
                        <button type="submit" className="btn btn-primary">
                            {isEditing ? 'Update' : 'Create'}
                        </button>
                        {isEditing && (
                            <button type="button" className="btn btn-secondary" onClick={resetForm}>
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* News/Announcements List */}
            <div className="panel">
                <h6 className="font-semibold text-lg mb-4">News & Announcements</h6>
                
                {loading ? (
                    <div className="flex justify-center items-center h-40">
                        <span className="animate-spin border-2 border-black border-l-transparent rounded-full w-6 h-6"></span>
                    </div>
                ) : error ? (
                    <div className="text-center py-8 text-red-500">
                        {error}
                    </div>
                ) : newsItems.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500">No news or announcements found</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-hover whitespace-nowrap">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Category</th>
                                    <th>Status</th>
                                    <th>Published Date</th>
                                    <th className="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {newsItems.map((item) => (
                                    <tr key={item.id}>
                                        <td className="font-semibold">{item.title}</td>
                                        <td>
                                            <span className={`badge ${item.category === 'news' ? 'bg-info' : 'bg-warning'}`}>
                                                {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                                            </span>
                                        </td>
                                        <td>
                                            {item.is_published ? (
                                                <span className="badge bg-success">Published</span>
                                            ) : (
                                                <span className="badge bg-secondary">Draft</span>
                                            )}
                                        </td>
                                        <td>
                                            {item.published_at ? formatDate(item.published_at) : '-'}
                                        </td>
                                        <td className="text-center">
                                            <div className="flex justify-center space-x-2">
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-secondary"
                                                    onClick={() => handleEdit(item)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => handleDelete(item.id)}
                                                >
                                                    Delete
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
        </div>
    );
};

export default AdminNewsManagement;