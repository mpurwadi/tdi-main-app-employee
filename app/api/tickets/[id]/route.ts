export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { isAdmin } from "@/lib/auth";
import { db } from '@/lib/db';

// GET a specific ticket
export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const auth = await verifyAuthServer();
        const ticketId = params.id;
        
        // Check if ticket exists and user has permission to view it
        let query, values;
        if (isAdmin(auth)) {
            // Admins can see any ticket
            query = `
                SELECT t.*, 
                       u.full_name as created_by_name,
                       a.full_name as assigned_to_name
                FROM tickets t
                LEFT JOIN users u ON t.created_by = u.id
                LEFT JOIN users a ON t.assigned_to = a.id
                WHERE t.id = $1
            `;
            values = [ticketId];
        } else {
            // Regular users can only see their own tickets
            query = `
                SELECT t.*, 
                       u.full_name as created_by_name,
                       a.full_name as assigned_to_name
                FROM tickets t
                LEFT JOIN users u ON t.created_by = u.id
                LEFT JOIN users a ON t.assigned_to = a.id
                WHERE t.id = $1 AND t.created_by = $2
            `;
            values = [ticketId, auth.userId];
        }
        
        const result = await db.query(query, values);
        
        if (result.rows.length === 0) {
            return NextResponse.json({ message: 'Ticket not found or access denied' }, { status: 404 });
        }
        
        // Get comments for this ticket
        const commentsQuery = `
            SELECT tc.*, u.full_name as user_name
            FROM ticket_comments tc
            JOIN users u ON tc.user_id = u.id
            WHERE tc.ticket_id = $1
            ORDER BY tc.created_at ASC
        `;
        const commentsResult = await db.query(commentsQuery, [ticketId]);
        
        return NextResponse.json({
            ...result.rows[0],
            comments: commentsResult.rows
        }, { status: 200 });
        
    } catch (error: any) {
        if (error.message.includes('Unauthorized')) {
            return NextResponse.json({ message: error.message }, { status: 401 });
        }
        console.error('Error fetching ticket:', error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}

// UPDATE a ticket (admin only for assignment/status changes, user can edit their own)
export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const auth = await verifyAuthServer();
        const ticketId = params.id;
        const body = await request.json();
        const { title, description, category, priority, status, assignedTo } = body;
        
        // First, check if ticket exists and user has permission to edit it
        let checkQuery, checkValues;
        if (isAdmin(auth)) {
            // Admins can edit any ticket
            checkQuery = 'SELECT * FROM tickets WHERE id = $1';
            checkValues = [ticketId];
        } else {
            // Regular users can only edit their own tickets
            checkQuery = 'SELECT * FROM tickets WHERE id = $1 AND created_by = $2';
            checkValues = [ticketId, auth.userId];
        }
        
        const checkResult = await db.query(checkQuery, checkValues);
        
        if (checkResult.rows.length === 0) {
            return NextResponse.json({ message: 'Ticket not found or access denied' }, { status: 404 });
        }
        
        // Build update query based on what fields are provided
        const updates = [];
        const updateValues = [];
        let valueIndex = 1;
        
        if (title !== undefined) {
            updates.push(`title = $${valueIndex}`);
            updateValues.push(title);
            valueIndex++;
        }
        
        if (description !== undefined) {
            updates.push(`description = $${valueIndex}`);
            updateValues.push(description);
            valueIndex++;
        }
        
        if (category !== undefined) {
            updates.push(`category = $${valueIndex}`);
            updateValues.push(category);
            valueIndex++;
        }
        
        if (priority !== undefined) {
            updates.push(`priority = $${valueIndex}`);
            updateValues.push(priority);
            valueIndex++;
        }
        
        // Only admins can change status and assign tickets
        if (isAdmin(auth)) {
            if (status !== undefined) {
                updates.push(`status = $${valueIndex}`);
                updateValues.push(status);
                valueIndex++;
            }
            
            if (assignedTo !== undefined) {
                updates.push(`assigned_to = $${valueIndex}`);
                updateValues.push(assignedTo);
                valueIndex++;
            }
        }
        
        // Always update the updated_at timestamp
        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        
        if (updates.length === 1) {
            // Only timestamp would be updated, so just return the existing ticket
            return NextResponse.json(checkResult.rows[0], { status: 200 });
        }
        
        const updateQuery = `
            UPDATE tickets 
            SET ${updates.join(', ')}
            WHERE id = $${valueIndex}
            RETURNING *
        `;
        updateValues.push(ticketId);
        
        const updateResult = await db.query(updateQuery, updateValues);
        
        return NextResponse.json(updateResult.rows[0], { status: 200 });
        
    } catch (error: any) {
        if (error.message.includes('Unauthorized')) {
            return NextResponse.json({ message: error.message }, { status: 401 });
        }
        console.error('Error updating ticket:', error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}

// DELETE a ticket (only ticket creator can delete, and only if it's still open)
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const auth = await verifyAuthServer();
        const ticketId = params.id;
        
        // Check if ticket exists and user has permission to delete it
        const checkQuery = 'SELECT * FROM tickets WHERE id = $1 AND created_by = $2 AND status = $3';
        const checkValues = [ticketId, auth.userId, 'open'];
        
        const checkResult = await db.query(checkQuery, checkValues);
        
        if (checkResult.rows.length === 0) {
            return NextResponse.json({ message: 'Ticket not found, access denied, or ticket is not in open status' }, { status: 404 });
        }
        
        // Delete the ticket (comments will be deleted automatically due to CASCADE)
        const deleteQuery = 'DELETE FROM tickets WHERE id = $1';
        await db.query(deleteQuery, [ticketId]);
        
        return NextResponse.json({ message: 'Ticket deleted successfully' }, { status: 200 });
        
    } catch (error: any) {
        if (error.message.includes('Unauthorized')) {
            return NextResponse.json({ message: error.message }, { status: 401 });
        }
        console.error('Error deleting ticket:', error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}