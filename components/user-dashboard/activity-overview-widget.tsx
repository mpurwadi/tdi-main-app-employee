'use client';
import { useState, useEffect } from 'react';

interface ActivityOverviewData {
    attendance: {
        totalDays: number;
        todayAttendance: number;
        presentDays: number;
        lateDays: number;
    };
    logbook: {
        totalEntries: number;
        todayEntries: number;
        approvedEntries: number;
        pendingEntries: number;
    };
    todos: {
        totalTodos: number;
        completedTodos: number;
        inProgressTodos: number;
        pendingTodos: number;
    };
    recentActivities: {
        id: number;
        entry_date: string;
        activity: string;
        status: string;
    }[];
}

const ActivityOverviewWidget = () => {
    const [data, setData] = useState<ActivityOverviewData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch activity overview data
    const fetchActivityOverview = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/activity-overview', {
                credentials: 'include'
            });
            if (!response.ok) {
                throw new Error('Failed to fetch activity overview data');
            }
            const result = await response.json();
            setData(result);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActivityOverview();
    }, []);

    // Format date for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="panel">
                <h5 className="mb-5 text-lg font-semibold">Your Activity Overview</h5>
                <p>Loading activity data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="panel">
                <h5 className="mb-5 text-lg font-semibold">Your Activity Overview</h5>
                <div className="p-3.5 rounded-md bg-danger-light text-danger">
                    Error: {error}
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="panel">
                <h5 className="mb-5 text-lg font-semibold">Your Activity Overview</h5>
                <p>No activity data available.</p>
            </div>
        );
    }

    return (
        <div className="panel">
            <div className="flex justify-between items-center mb-5">
                <h5 className="text-lg font-semibold">Your Activity Overview</h5>
                <button 
                    type="button" 
                    className="btn btn-outline-primary"
                    onClick={fetchActivityOverview}
                >
                    Refresh
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Attendance Card */}
                <div className="border rounded-lg p-4 bg-white dark:bg-black">
                    <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Attendance</p>
                            <p className="text-xl font-bold">{data.attendance.presentDays}/{data.attendance.totalDays} days</p>
                        </div>
                    </div>
                    {data.attendance.lateDays > 0 && (
                        <p className="text-xs text-warning mt-2">{data.attendance.lateDays} late arrivals</p>
                    )}
                </div>

                {/* Logbook Card */}
                <div className="border rounded-lg p-4 bg-white dark:bg-black">
                    <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Logbook Entries</p>
                            <p className="text-xl font-bold">{data.logbook.totalEntries}</p>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {data.logbook.approvedEntries} approved, {data.logbook.pendingEntries} pending
                    </p>
                </div>

                {/* TODO Card */}
                <div className="border rounded-lg p-4 bg-white dark:bg-black">
                    <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">TODO Items</p>
                            <p className="text-xl font-bold">{data.todos.totalTodos > 0 ? data.todos.totalTodos : 'N/A'}</p>
                        </div>
                    </div>
                    {data.todos.totalTodos > 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {data.todos.completedTodos} completed
                        </p>
                    )}
                </div>

                {/* Recent Activity Card */}
                <div className="border rounded-lg p-4 bg-white dark:bg-black">
                    <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Recent Activity</p>
                            <p className="text-xl font-bold">{data.recentActivities.length}</p>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Last 30 days
                    </p>
                </div>
            </div>

            {/* Recent Activities */}
            <div className="panel">
                <h6 className="text-md font-semibold mb-4">Recent Logbook Entries</h6>
                {data.recentActivities.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                        No recent logbook entries found.
                    </p>
                ) : (
                    <div className="space-y-3">
                        {data.recentActivities.map((activity) => (
                            <div key={activity.id} className="flex items-start border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0 last:pb-0">
                                <div className="flex-1">
                                    <div className="flex justify-between">
                                        <h6 className="font-medium">{activity.activity.substring(0, 50)}{activity.activity.length > 50 ? '...' : ''}</h6>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {formatDate(activity.entry_date)}
                                        </span>
                                    </div>
                                    <div className="flex items-center mt-1">
                                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                            activity.status === 'approved' ? 'bg-success/20 text-success' :
                                            activity.status === 'pending' ? 'bg-warning/20 text-warning' :
                                            'bg-info/20 text-info'
                                        }`}>
                                            {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityOverviewWidget;