'use client';
import { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';

const AdminDashboard = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/admin/stats');
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to fetch statistics');
            }
            const data = await response.json();
            setStats(data.data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    // Chart options for users by division
    const usersByDivisionChartOptions: any = {
        chart: {
            type: 'donut',
            height: 350,
        },
        labels: stats?.usersByDivision?.map((item: any) => item.division || 'Unassigned') || [],
        colors: ['#4361ee', '#3498db', '#2ecc71', '#f1c40f', '#e74c3c', '#9b59b6'],
        legend: {
            position: 'bottom',
        },
        responsive: [{
            breakpoint: 480,
            options: {
                chart: {
                    width: 200
                },
                legend: {
                    position: 'bottom'
                }
            }
        }],
        dataLabels: {
            enabled: true,
            formatter: function (val: number) {
                return val.toFixed(1) + '%';
            }
        }
    };

    // Chart options for tickets by status
    const ticketsByStatusChartOptions: any = {
        chart: {
            type: 'donut',
            height: 350,
        },
        labels: stats?.ticketsByStatus ? Object.keys(stats.ticketsByStatus).map(status => status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')) : [],
        colors: ['#4361ee', '#3498db', '#2ecc71', '#f1c40f', '#e74c3c', '#9b59b6'],
        legend: {
            position: 'bottom',
        },
        responsive: [{
            breakpoint: 480,
            options: {
                chart: {
                    width: 200
                },
                legend: {
                    position: 'bottom'
                }
            }
        }],
        dataLabels: {
            enabled: true,
            formatter: function (val: number) {
                return val.toFixed(1) + '%';
            }
        }
    };

    const usersByDivisionChartData = stats?.usersByDivision?.map((item: any) => parseInt(item.count)) || [];
    const ticketsByStatusChartData = stats?.ticketsByStatus ? Object.values(stats.ticketsByStatus).map(count => parseInt(count as string)) : [];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-3.5 rounded-md bg-danger-light text-danger">
                Error: {error}
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-400">System overview and statistics</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
                <div className="panel">
                    <div className="flex items-center">
                        <div className="rounded-full bg-primary/10 p-3 text-primary dark:bg-primary dark:text-white-light">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <div className="ltr:ml-4 rtl:mr-4">
                            <h3 className="text-lg font-semibold">Total Users</h3>
                            <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="panel">
                    <div className="flex items-center">
                        <div className="rounded-full bg-info/10 p-3 text-info dark:bg-info dark:text-white-light">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <div className="ltr:ml-4 rtl:mr-4">
                            <h3 className="text-lg font-semibold">Logbook Entries</h3>
                            <p className="text-2xl font-bold">{stats?.totalLogbookEntries || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="panel">
                    <div className="flex items-center">
                        <div className="rounded-full bg-success/10 p-3 text-success dark:bg-success dark:text-white-light">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ltr:ml-4 rtl:mr-4">
                            <h3 className="text-lg font-semibold">Attendance Records</h3>
                            <p className="text-2xl font-bold">{stats?.totalAttendanceRecords || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="panel">
                    <div className="flex items-center">
                        <div className="rounded-full bg-warning/10 p-3 text-warning dark:bg-warning dark:text-white-light">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                        </div>
                        <div className="ltr:ml-4 rtl:mr-4">
                            <h3 className="text-lg font-semibold">Remote Check-ins</h3>
                            <p className="text-2xl font-bold">{stats?.totalRemoteCheckins || 0}</p>
                        </div>
                    </div>
                </div>
                
                <div className="panel">
                    <div className="flex items-center">
                        <div className="rounded-full bg-pink/10 p-3 text-pink dark:bg-pink dark:text-white-light">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                            </svg>
                        </div>
                        <div className="ltr:ml-4 rtl:mr-4">
                            <h3 className="text-lg font-semibold">Total Tickets</h3>
                            <p className="text-2xl font-bold">{stats?.totalTickets || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="panel">
                    <h2 className="text-xl font-bold mb-4">Users by Division</h2>
                    {usersByDivisionChartData.length > 0 ? (
                        <ReactApexChart
                            options={usersByDivisionChartOptions}
                            series={usersByDivisionChartData}
                            type="donut"
                            height={350}
                        />
                    ) : (
                        <div className="flex justify-center items-center h-64">
                            <p>No data available</p>
                        </div>
                    )}
                </div>

                <div className="panel">
                    <h2 className="text-xl font-bold mb-4">Tickets by Status</h2>
                    {ticketsByStatusChartData.length > 0 ? (
                        <ReactApexChart
                            options={ticketsByStatusChartOptions}
                            series={ticketsByStatusChartData}
                            type="donut"
                            height={350}
                        />
                    ) : (
                        <div className="flex justify-center items-center h-64">
                            <p>No ticket data available</p>
                        </div>
                    )}
                </div>
            </div>
            
            {/* System Overview */}
            <div className="panel mt-6">
                <h2 className="text-xl font-bold mb-4">System Overview</h2>
                <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-800 rounded">
                        <span>News & Announcements</span>
                        <span className="font-bold">{stats?.totalNewsAnnouncements || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-800 rounded">
                        <span>Recently Joined Users (7 days)</span>
                        <span className="font-bold">{stats?.recentUsers || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-800 rounded">
                        <span>Unassigned Tickets</span>
                        <span className="font-bold">{stats?.unassignedTickets || 0}</span>
                    </div>
                </div>
            </div>
            
            {/* Ticket Summary */}
            <div className="panel mt-6">
                <h2 className="text-xl font-bold mb-4">Ticket Summary</h2>
                {stats?.ticketsByStatus && Object.keys(stats.ticketsByStatus).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {Object.entries(stats.ticketsByStatus).map(([status, count]: [string, any]) => {
                            // Define color schemes for different statuses
                            let bgColor = 'bg-gray-50';
                            let textColor = 'text-gray-800';
                            
                            switch (status.toLowerCase()) {
                                case 'open':
                                    bgColor = 'bg-blue-50';
                                    textColor = 'text-blue-800';
                                    break;
                                case 'in-progress':
                                case 'inprogress':
                                    bgColor = 'bg-yellow-50';
                                    textColor = 'text-yellow-800';
                                    break;
                                case 'resolved':
                                    bgColor = 'bg-green-50';
                                    textColor = 'text-green-800';
                                    break;
                                case 'closed':
                                    bgColor = 'bg-gray-50';
                                    textColor = 'text-gray-800';
                                    break;
                                case 'pending':
                                    bgColor = 'bg-orange-50';
                                    textColor = 'text-orange-800';
                                    break;
                                default:
                                    bgColor = 'bg-purple-50';
                                    textColor = 'text-purple-800';
                            }
                            
                            return (
                                <div key={status} className={`p-4 ${bgColor} rounded-lg`}>
                                    <h3 className={`font-semibold ${textColor} capitalize`}>
                                        {status.replace('-', ' ')}
                                    </h3>
                                    <p className="text-2xl font-bold">{count}</p>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <p>No tickets found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;