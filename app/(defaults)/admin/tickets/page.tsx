import { verifyAuth, isAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminTicketsManagement from '@/components/admin/ticket-management';

export const metadata = {
    title: 'Ticket Management',
};

export const dynamic = 'force-dynamic';

const TicketsPage = () => {
    try {
        const auth = verifyAuth();
        if (!isAdmin(auth)) {
            // If not an admin, redirect to the homepage.
            redirect('/');
        }
    } catch (error) {
        // If not authenticated, redirect to the login page.
        redirect('/auth/boxed-signin');
    }

    // If authorized, render the admin tickets management component.
    return (
        <div>
            <AdminTicketsManagement />
        </div>
    );
};

export default TicketsPage;