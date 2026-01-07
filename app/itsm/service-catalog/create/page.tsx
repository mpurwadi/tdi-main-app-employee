'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import Swal from 'sweetalert2';

const ServiceFormPage = () => {
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const router = useRouter();
    const [categories, setCategories] = useState<any[]>([]);
    const [divisions] = useState(['DevOps', 'Big Data', 'Produk', 'Operasional']);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category_id: '',
        division: '',
        cost_type: 'fixed',
        cost_amount: '',
        sla_days: '',
        tags: ''
    });
    const [documentFile, setDocumentFile] = useState<File | null>(null);
    const [documentPreview, setDocumentPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch categories
    useEffect(() => {
        // In a real implementation, you would fetch this data from the API
        // For now, we'll use mock data
        const mockCategories = [
            { id: 1, name: 'Infrastructure', description: 'Hardware and infrastructure services' },
            { id: 2, name: 'Analytics', description: 'Data analysis and reporting services' },
            { id: 3, name: 'Development', description: 'Application development services' },
            { id: 4, name: 'Security', description: 'Security assessment and compliance services' }
        ];
        
        setCategories(mockCategories);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setDocumentFile(file);
            
            // Validate file type
            const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
            if (!allowedTypes.includes(file.type)) {
                setError('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.');
                return;
            }
            
            // Validate file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                setError('File size exceeds 10MB limit');
                return;
            }
            
            // Create preview URL
            const previewUrl = URL.createObjectURL(file);
            setDocumentPreview(previewUrl);
            setError('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            // Prepare form data
            const serviceData = {
                ...formData,
                category_id: parseInt(formData.category_id),
                cost_amount: parseFloat(formData.cost_amount),
                sla_days: formData.sla_days ? parseInt(formData.sla_days) : null,
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) // Process tags
            };
            
            const response = await fetch('/api/itsm/service-catalog', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(serviceData),
            });

            const result = await response.json();

            if (!response.ok) {
                console.error('Service creation validation errors:', result.details); // Log validation details
                throw new Error(result.message || 'Failed to create service');
            }

            // If there's a document, upload it after service creation
            if (documentFile && result.data && result.data.id) {
                const docFormData = new FormData();
                docFormData.append('document', documentFile);
                
                const uploadResponse = await fetch(`/api/itsm/service-catalog/${result.data.id}/document`, {
                    method: 'POST',
                    body: docFormData,
                });

                if (!uploadResponse.ok) {
                    const uploadError = await uploadResponse.json();
                    console.error('Document upload failed:', uploadError.message);
                    // Don't block service creation if document upload fails, just log
                }
            }
            
            Swal.fire({
                icon: 'success',
                title: 'Service Created!',
                text: 'Your service has been submitted for approval.',
                timer: 3000,
                showConfirmButton: false,
            });
            router.push('/itsm/service-catalog');
        } catch (err: any) {
            setError(err.message || 'Failed to create service. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Add New Service</h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Create a new service to be added to the service catalog
                </p>
            </div>

            <div className={`rounded-lg p-6 ${themeConfig.theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow`}>
                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Service Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="form-input w-full"
                                placeholder="Enter service name"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Category *
                            </label>
                            <select
                                name="category_id"
                                value={formData.category_id}
                                onChange={handleChange}
                                className="form-select w-full"
                                required
                            >
                                <option value="">Select a category</option>
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Division *
                            </label>
                            <select
                                name="division"
                                value={formData.division}
                                onChange={handleChange}
                                className="form-select w-full"
                                required
                            >
                                <option value="">Select a division</option>
                                {divisions.map(division => (
                                    <option key={division} value={division}>
                                        {division}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Cost Type *
                            </label>
                            <select
                                name="cost_type"
                                value={formData.cost_type}
                                onChange={handleChange}
                                className="form-select w-full"
                                required
                            >
                                <option value="fixed">Fixed</option>
                                <option value="hourly">Hourly</option>
                                <option value="per_unit">Per Unit</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Cost Amount *
                            </label>
                            <input
                                type="number"
                                name="cost_amount"
                                value={formData.cost_amount}
                                onChange={handleChange}
                                className="form-input w-full"
                                placeholder="Enter cost amount"
                                min="0"
                                step="0.01"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                SLA (Days)
                            </label>
                            <input
                                type="number"
                                name="sla_days"
                                value={formData.sla_days}
                                onChange={handleChange}
                                className="form-input w-full"
                                placeholder="Enter SLA in days"
                                min="0"
                            />
                        </div>
                        
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Description *
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="form-textarea w-full"
                                rows={4}
                                placeholder="Enter service description"
                                required
                            ></textarea>
                        </div>
                        
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Tags
                            </label>
                            <input
                                type="text"
                                name="tags"
                                value={formData.tags}
                                onChange={handleChange}
                                className="form-input w-full"
                                placeholder="Enter tags separated by commas"
                            />
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Tags help categorize and search for services
                            </p>
                        </div>
                        
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Service Document (Optional)
                            </label>
                            <input
                                type="file"
                                accept=".pdf,.doc,.docx,.txt"
                                onChange={handleDocumentChange}
                                className="form-input w-full"
                            />
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Upload a document describing this service (PDF, DOC, DOCX, or TXT, max 10MB)
                            </p>
                            {documentPreview && (
                                <div className="mt-2">
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        Selected file: {documentFile?.name}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="mt-8 flex justify-end space-x-3">
                        <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => router.push('/itsm/service-catalog')}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating...
                                </>
                            ) : 'Create Service'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ServiceFormPage;