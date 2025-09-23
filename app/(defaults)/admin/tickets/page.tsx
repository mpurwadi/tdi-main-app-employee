import AdminTicketsManagement from '@/components/admin/ticket-management';

export const metadata = {
    title: 'Ticket Management',
};

export const dynamic = 'force-dynamic';

const TicketsPage = () => {

        return (
        <div>
            <AdminTicketsManagement />
        </div>
    );
};

export default TicketsPage;