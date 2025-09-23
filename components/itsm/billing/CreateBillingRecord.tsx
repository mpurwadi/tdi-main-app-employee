// components/itsm/billing/CreateBillingRecord.tsx
'use client';

import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

interface ServiceCatalogItem {
  id: number;
  name: string;
  description: string;
  category: string;
  unit_price: number;
  unit_type: string;
}

interface CreateBillingRecordProps {
  onClose: () => void;
  onRecordCreated: () => void;
}

const CreateBillingRecord = ({ onClose, onRecordCreated }: CreateBillingRecordProps) => {
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<ServiceCatalogItem[]>([]);
  const [formData, setFormData] = useState({
    requesterDivision: '',
    providerDivision: '',
    serviceCatalogId: '',
    quantity: 1,
    billingPeriodStart: '',
    billingPeriodEnd: '',
    dueDate: '',
    description: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch service catalog items
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/itsm/billing/services');
        const data = await response.json();
        
        if (data.success) {
          setServices(data.data);
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: data.error || 'Failed to fetch services'
          });
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to fetch services'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchServices();
  }, []);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: Record<string, string> = {};
    
    if (!formData.requesterDivision) {
      newErrors.requesterDivision = 'Requester division is required';
    }
    
    if (!formData.providerDivision) {
      newErrors.providerDivision = 'Provider division is required';
    }
    
    if (!formData.serviceCatalogId) {
      newErrors.serviceCatalogId = 'Service is required';
    }
    
    if (!formData.billingPeriodStart) {
      newErrors.billingPeriodStart = 'Billing period start is required';
    }
    
    if (!formData.billingPeriodEnd) {
      newErrors.billingPeriodEnd = 'Billing period end is required';
    }
    
    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    try {
      setLoading(true);
      
      // Calculate total amount based on selected service and quantity
      const selectedService = services.find(s => s.id === parseInt(formData.serviceCatalogId));
      const totalAmount = selectedService ? selectedService.unit_price * formData.quantity : 0;
      const unitPrice = selectedService ? selectedService.unit_price : 0;
      
      const response = await fetch('/api/itsm/billing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          unitPrice,
          totalAmount
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Billing record created successfully',
          timer: 2000,
          showConfirmButton: false
        });
        
        onRecordCreated();
        onClose();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.error || 'Failed to create billing record'
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to create billing record'
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate total amount based on selected service and quantity
  const calculateTotalAmount = () => {
    if (!formData.serviceCatalogId || !formData.quantity) return 0;
    
    const selectedService = services.find(s => s.id === parseInt(formData.serviceCatalogId));
    if (!selectedService) return 0;
    
    return selectedService.unit_price * formData.quantity;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New Billing Record</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Requester Division *
                  </label>
                  <input
                    type="text"
                    name="requesterDivision"
                    className={`form-input w-full ${errors.requesterDivision ? 'border-red-500' : ''}`}
                    value={formData.requesterDivision}
                    onChange={handleChange}
                  />
                  {errors.requesterDivision && (
                    <p className="mt-1 text-sm text-red-600">{errors.requesterDivision}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Provider Division *
                  </label>
                  <input
                    type="text"
                    name="providerDivision"
                    className={`form-input w-full ${errors.providerDivision ? 'border-red-500' : ''}`}
                    value={formData.providerDivision}
                    onChange={handleChange}
                  />
                  {errors.providerDivision && (
                    <p className="mt-1 text-sm text-red-600">{errors.providerDivision}</p>
                  )}
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Service *
                  </label>
                  <select
                    name="serviceCatalogId"
                    className={`form-select w-full ${errors.serviceCatalogId ? 'border-red-500' : ''}`}
                    value={formData.serviceCatalogId}
                    onChange={handleChange}
                  >
                    <option value="">Select a service</option>
                    {services.map(service => (
                      <option key={service.id} value={service.id}>
                        {service.name} - Rp {service.unit_price.toLocaleString()} per {service.unit_type}
                      </option>
                    ))}
                  </select>
                  {errors.serviceCatalogId && (
                    <p className="mt-1 text-sm text-red-600">{errors.serviceCatalogId}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    min="0.01"
                    step="0.01"
                    className="form-input w-full"
                    value={formData.quantity}
                    onChange={handleChange}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Total Amount (Rp)
                  </label>
                  <input
                    type="text"
                    className="form-input w-full"
                    value={calculateTotalAmount().toLocaleString()}
                    readOnly
                    disabled
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Billing Period Start *
                  </label>
                  <input
                    type="date"
                    name="billingPeriodStart"
                    className={`form-input w-full ${errors.billingPeriodStart ? 'border-red-500' : ''}`}
                    value={formData.billingPeriodStart}
                    onChange={handleChange}
                  />
                  {errors.billingPeriodStart && (
                    <p className="mt-1 text-sm text-red-600">{errors.billingPeriodStart}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Billing Period End *
                  </label>
                  <input
                    type="date"
                    name="billingPeriodEnd"
                    className={`form-input w-full ${errors.billingPeriodEnd ? 'border-red-500' : ''}`}
                    value={formData.billingPeriodEnd}
                    onChange={handleChange}
                  />
                  {errors.billingPeriodEnd && (
                    <p className="mt-1 text-sm text-red-600">{errors.billingPeriodEnd}</p>
                  )}
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    className={`form-input w-full ${errors.dueDate ? 'border-red-500' : ''}`}
                    value={formData.dueDate}
                    onChange={handleChange}
                  />
                  {errors.dueDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>
                  )}
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    className="form-textarea w-full"
                    value={formData.description}
                    onChange={handleChange}
                  ></textarea>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-outline-secondary"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Billing Record'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateBillingRecord;