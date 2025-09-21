export interface Ticket {
    id: number;
    title: string;
    description: string;
    category: 'bug' | 'feature' | 'support';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'open' | 'in-progress' | 'resolved' | 'closed';
    assigned_to?: number | null;
    assigned_to_name?: string;
    created_by: number;
    created_by_name: string;
    created_at: string;
    updated_at: string;
}

export interface TicketComment {
    id: number;
    ticket_id: number;
    user_id: number;
    user_name: string;
    comment: string;
    created_at: string;
}

export interface TicketFormData {
    title: string;
    description: string;
    category: 'bug' | 'feature' | 'support';
    priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface TicketWithComments extends Ticket {
    comments: TicketComment[];
}

export interface User {
    id: number;
    full_name: string;
    email: string;
    role: string;
}