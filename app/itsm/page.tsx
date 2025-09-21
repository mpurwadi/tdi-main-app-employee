'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import Link from 'next/link';
import { verifyAuth } from '@/lib/auth';

const ITSMPage = () => {
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const [userRole, setUserRole] = useState<string>('');
    const [userDivision, setUserDivision] = useState<string>('');

    useEffect(() => {
        // In a real implementation, you would get this from the auth context or API
        // For now, we'll simulate getting user data
        try {
            // This would normally come from your auth system
            // const auth = verifyAuth();
            // setUserRole(auth.role);
            // setUserDivision(auth.division || '');
            
            // Simulating for development
            setUserRole('service_catalog_manager');
            setUserDivision('DevOps');
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    }, []);

    // Define modules based on user role
    const modules = [
        {
            id: 'service-catalog',
            title: 'Service Catalog',
            description: 'Browse and manage internal services offered by different divisions',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            ),
            link: '/itsm/service-catalog',
            roles: ['service_catalog_manager', 'service_provider', 'service_requester', 'admin', 'superadmin']
        },
        {
            id: 'service-requests',
            title: 'Service Requests',
            description: 'Submit, track, and manage service requests across divisions',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
            ),
            link: '/itsm/service-requests',
            roles: ['service_requester', 'service_provider', 'approver', 'admin', 'superadmin']
        },
        {
            id: 'billing',
            title: 'Internal Billing',
            description: 'Manage internal billing and financial reporting between divisions',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            link: '/itsm/billing',
            roles: ['billing_coordinator', 'billing_admin', 'admin', 'superadmin']
        },
        {
            id: 'change-management',
            title: 'Change Management',
            description: 'Submit, review, and track infrastructure and application changes',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
            link: '/itsm/change-management',
            roles: ['change_requester', 'change_manager', 'cab_member', 'implementer', 'admin', 'superadmin']
        }
    ];

    // Filter modules based on user role
    const accessibleModules = modules.filter(module => 
        module.roles.includes(userRole) || userRole === 'superadmin' || userRole === 'admin'
    );

    return (
        <div className={`min-h-screen ${themeConfig.theme === 'dark' ? 'dark bg-black' : 'bg-gray-50'}`}>
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Internal Service Hub</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Manage IT services, requests, billing, and changes across divisions
                    </p>
                    {userDivision && (
                        <div className="mt-2">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                {userDivision} Division
                            </span>
                        </div>
                    )}
                </div>

                {accessibleModules.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Access</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            You don't have access to any ITSM modules. Please contact your administrator.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {accessibleModules.map((module) => (
                            <Link 
                                key={module.id} 
                                href={module.link}
                                className={`block rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg ${
                                    themeConfig.theme === 'dark' 
                                        ? 'bg-gray-800 hover:bg-gray-700' 
                                        : 'bg-white hover:bg-gray-50'
                                }`}
                            >
                                <div className="flex items-start">
                                    <div className="mr-4 mt-1">
                                        {module.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                            {module.title}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            {module.description}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <span className="inline-flex items-center text-primary font-medium">
                                        Access module
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                <div className={`mt-12 p-6 rounded-xl ${
                    themeConfig.theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                } shadow-md`}>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">About Internal Service Hub</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        The Internal Service Hub is a comprehensive IT Service Management platform that enables 
                        efficient collaboration between different divisions within the organization. This platform 
                        streamlines service requests, manages internal billing, and facilitates change management 
                        processes.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <div className="p-4 rounded-lg bg-primary/10 dark:bg-primary/20">
                            <h3 className="font-semibold text-primary mb-2">Service Catalog</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Discover and request services offered by different divisions
                            </p>
                        </div>
                        <div className="p-4 rounded-lg bg-primary/10 dark:bg-primary/20">
                            <h3 className="font-semibold text-primary mb-2">Request Management</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Track and manage service requests from submission to completion
                            </p>
                        </div>
                        <div className="p-4 rounded-lg bg-primary/10 dark:bg-primary/20">
                            <h3 className="font-semibold text-primary mb-2">Change Management</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Submit, review, and implement infrastructure and application changes
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ITSMPage;