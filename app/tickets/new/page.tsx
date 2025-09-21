'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TicketForm from '@/components/tickets/TicketForm';
import { TicketFormData } from '@/components/tickets/types';

export default function NewTicketPage() {
    const router = useRouter();
    const [showForm, setShowForm] = useState(true);

    const handleSubmit = async (data: TicketFormData) => {
        try {
            const response = await fetch('/api/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to submit ticket');
            }
            
            // Redirect to tickets list after successful submission
            router.push('/tickets');
            router.refresh();
        } catch (error) {
            throw error;
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Submit New Ticket</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Report a bug, request a feature, or submit a support request
                </p>
            </div>
            
            {showForm ? (
                <TicketForm 
                    onSubmit={handleSubmit} 
                    onCancel={() => router.push('/tickets')} 
                />
            ) : (
                <div className="bg-white rounded-lg shadow p-6 text-center">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Ticket Submitted Successfully!</h2>
                    <p className="text-gray-600 mb-4">
                        Your ticket has been submitted and our team will review it shortly.
                    </p>
                    <button
                        onClick={() => router.push('/tickets')}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        View All Tickets
                    </button>
                </div>
            )}
        </div>
    );
}