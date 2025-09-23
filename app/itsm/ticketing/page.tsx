'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import TicketList from '@/components/tickets/TicketList';

export default function ITSMTicketingPage() {
    const router = useRouter();
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const [userRole, setUserRole] = useState<string>('');
    const [userDivision, setUserDivision] = useState<string>('');
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        // In a real implementation, you would get this from the auth context or API
        // For now, we'll simulate getting user data
        try {
            // This would normally come from your auth system
            // const auth = verifyAuth();
            // setUserRole(auth.role);
            // setUserDivision(auth.division || '');
            // setIsAdmin(auth.role === 'admin' || auth.role === 'superadmin');
            
            // Simulating for development
            setUserRole('service_requester');
            setUserDivision('IT Department');
            setIsAdmin(false);
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    }, []);

    return (
        <div className={`min-h-screen ${themeConfig.theme === 'dark' ? 'dark bg-black' : 'bg-gray-50'}`}>
            <div className="px-4 py-8">
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Incident Management</h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Report, track, and resolve IT incidents and service issues
                            </p>
                            {userDivision && (
                                <div className="mt-2">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                        {userDivision}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="mt-4 sm:mt-0">
                            <button
                                onClick={() => router.push('/tickets/new')}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                            >
                                New Incident
                            </button>
                        </div>
                    </div>
                </div>

                <div className={`rounded-xl shadow-md p-6 ${themeConfig.theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                    <TicketList isAdmin={isAdmin} />
                </div>

                <div className={`mt-8 p-6 rounded-xl ${themeConfig.theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">About Incident Management</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        The Incident Management module helps you report and track IT issues, service disruptions, 
                        and technical problems. Create tickets for any IT-related issues you encounter and track 
                        their resolution status.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <div className="p-4 rounded-lg bg-primary/10 dark:bg-primary/20">
                            <h3 className="font-semibold text-primary mb-2">Report Incidents</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Quickly report any IT issues or service disruptions
                            </p>
                        </div>
                        <div className="p-4 rounded-lg bg-primary/10 dark:bg-primary/20">
                            <h3 className="font-semibold text-primary mb-2">Track Progress</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Monitor the status of your incidents in real-time
                            </p>
                        </div>
                        <div className="p-4 rounded-lg bg-primary/10 dark:bg-primary/20">
                            <h3 className="font-semibold text-primary mb-2">Get Resolutions</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Receive updates and solutions for your reported issues
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}