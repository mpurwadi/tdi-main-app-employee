export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { verifyAuth, isAdmin } from '@/lib/auth';
import { db } from '@/lib/db';

// POST a new comment on a ticket
export async function POST(request: Request, { params }: { params: { id: string } }) {
    try {
        const auth = verifyAuth();
        const ticketId = params.id;
        const body = await request.json();
        const { comment } = body;
        
        // Validate required fields
        if (!comment) {
            return NextResponse.json({ message: 'Comment is required' }, { status: 400 });
        }
        
        // Check if ticket exists and user has permission to comment on it
        let checkQuery, checkValues;
        if (isAdmin(auth)) {
            // Admins can comment on any ticket
            checkQuery = 'SELECT * FROM tickets WHERE id = $1';
            checkValues = [ticketId];
        } else {
            // Regular users can only comment on their own tickets
            checkQuery = 'SELECT * FROM tickets WHERE id = $1 AND created_by = $2';
            checkValues = [ticketId, auth.userId];
        }
        
        const checkResult = await db.query(checkQuery, checkValues);
        
        if (checkResult.rows.length === 0) {
            return NextResponse.json({ message: 'Ticket not found or access denied' }, { status: 404 });
        }
        
        // Insert the comment
        const insertQuery = `
            INSERT INTO ticket_comments (ticket_id, user_id, comment)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        const insertValues = [ticketId, auth.userId, comment];
        
        const result = await db.query(insertQuery, insertValues);
        
        return NextResponse.json(result.rows[0], { status: 201 });
        
    } catch (error: any) {
        if (error.message.includes('Unauthorized')) {
            return NextResponse.json({ message: error.message }, { status: 401 });
        }
        console.error('Error creating comment:', error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}