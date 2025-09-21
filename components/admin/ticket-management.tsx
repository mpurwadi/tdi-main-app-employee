'use client';

import { useState, useEffect } from 'react';
import TicketList from '@/components/tickets/TicketList';

export default function AdminTicketManagement() {
    return (
        <div className="panel">
            <div className="mb-5">
                <h1 className="text-2xl font-bold">Ticket Management</h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Manage all support tickets submitted by users
                </p>
            </div>
            
            <TicketList isAdmin={true} />
        </div>
    );
}