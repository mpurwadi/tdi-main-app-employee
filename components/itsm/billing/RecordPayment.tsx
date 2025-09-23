// components/itsm/billing/RecordPayment.tsx
'use client';

import { useState } from 'react';
import Swal from 'sweetalert2';

interface RecordPaymentProps {
  billingRecord: any;
  onClose: () => void;
  onPaymentRecorded: () => void;
}

const RecordPayment = ({ billingRecord, onClose, onPaymentRecorded }: RecordPaymentProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: billingRecord.total_amount.toString(),
    paymentMethod: 'transfer',
    referenceNumber: '',
    remarks: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount is required and must be greater than 0';
    }
    
    if (parseFloat(formData.amount) > billingRecord.total_amount) {
      newErrors.amount = 'Payment amount cannot exceed the total billing amount';
    }
    
    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Payment method is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await fetch('/api/itsm/billing/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          billingRecordId: billingRecord.id,
          amount: parseFloat(formData.amount),
          paymentMethod: formData.paymentMethod,
          referenceNumber: formData.referenceNumber,
          remarks: formData.remarks
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Payment recorded successfully',
          timer: 2000,
          showConfirmButton: false
        });
        
        onPaymentRecorded();
        onClose();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.error || 'Failed to record payment'
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to record payment'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Record Payment</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-600 dark:text-gray-300">Invoice Number:</div>
              <div className="font-medium">{billingRecord.invoice_number}</div>
              
              <div className="text-gray-600 dark:text-gray-300">Requester:</div>
              <div className="font-medium">{billingRecord.requester_division}</div>
              
              <div className="text-gray-600 dark:text-gray-300">Total Amount:</div>
              <div className="font-medium">Rp {billingRecord.total_amount.toLocaleString()}</div>
              
              <div className="text-gray-600 dark:text-gray-300">Amount Paid:</div>
              <div className="font-medium">Rp 0</div>
              
              <div className="text-gray-600 dark:text-gray-300">Amount Due:</div>
              <div className="font-medium text-red-600">Rp {billingRecord.total_amount.toLocaleString()}</div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Payment Amount (Rp) *
                </label>
                <input
                  type="number"
                  name="amount"
                  min="0.01"
                  step="0.01"
                  max={billingRecord.total_amount}
                  className={`form-input w-full ${errors.amount ? 'border-red-500' : ''}`}
                  value={formData.amount}
                  onChange={handleChange}
                />
                {errors.amount && (
                  <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Payment Method *
                </label>
                <select
                  name="paymentMethod"
                  className={`form-select w-full ${errors.paymentMethod ? 'border-red-500' : ''}`}
                  value={formData.paymentMethod}
                  onChange={handleChange}
                >
                  <option value="transfer">Bank Transfer</option>
                  <option value="cash">Cash</option>
                  <option value="check">Check</option>
                  <option value="other">Other</option>
                </select>
                {errors.paymentMethod && (
                  <p className="mt-1 text-sm text-red-600">{errors.paymentMethod}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Reference Number
                </label>
                <input
                  type="text"
                  name="referenceNumber"
                  className="form-input w-full"
                  value={formData.referenceNumber}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Remarks
                </label>
                <textarea
                  name="remarks"
                  rows={3}
                  className="form-textarea w-full"
                  value={formData.remarks}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
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
                {loading ? 'Recording...' : 'Record Payment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RecordPayment;