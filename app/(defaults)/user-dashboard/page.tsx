import { verifyAuth } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import AttendanceWidget from '@/components/user-dashboard/attendance-widget';
import Link from 'next/link';

export default async function UserDashboardPage() {
    let authPayload;
    try {
        authPayload = verifyAuth();
        // Check if user has the correct role
        if (authPayload.role !== 'user') {
            // Redirect to appropriate dashboard based on role
            if (authPayload.role === 'admin' || authPayload.role === 'superadmin') {
                redirect('/admin/approval');
            } else {
                redirect('/');
            }
        }
    } catch (error) {
        // If authentication fails, redirect to login
        redirect('/auth/cover-login');
    }

    return (
        <div className="panel">
            <h5 className="mb-5 text-lg font-semibold">Welcome to Your Dashboard!</h5>
            <p className="mb-4">This is your central hub for all employee-related activities.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {/* Absensi Card */}
                <div className="card bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md rounded-lg p-6">
                    <h6 className="text-xl font-bold mb-2">Absensi</h6>
                    <p className="mb-4">Record your daily attendance.</p>
                    <Link href="#absensi" className="btn btn-light btn-sm">Record Attendance</Link>
                </div>

                {/* Logbook Card */}
                <div className="card bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md rounded-lg p-6">
                    <h6 className="text-xl font-bold mb-2">Logbook</h6>
                    <p className="mb-4">Manage your daily activity logs.</p>
                    <Link href="/apps/logbook" className="btn btn-light btn-sm">Go to Logbook</Link>
                </div>

                {/* Jadwal Card (Placeholder) */}
                <div className="card bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md rounded-lg p-6">
                    <h6 className="text-xl font-bold mb-2">Jadwal</h6>
                    <p className="mb-4">View your work schedule.</p>
                    <button type="button" className="btn btn-light btn-sm" disabled>Coming Soon</button>
                </div>
            </div>

            {/* Attendance Widget */}
            <div id="absensi">
                <AttendanceWidget />
            </div>

            {/* Monitoring Section (Placeholder) */}
            <div className="panel mt-6">
                <h5 className="mb-5 text-lg font-semibold">Your Activity Overview</h5>
                <p>This section will display key metrics and summaries of your attendance, logbook entries, and schedule.</p>
                {/* Placeholder for charts, recent activities, etc. */}
                <div className="mt-4 p-4 border border-dashed rounded-md text-center text-gray-500">
                    <p>Monitoring data will appear here.</p>
                </div>
            </div>
        </div>
    );
}
