import { Pool } from 'pg';
import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';

// Database connection pool
const pool = new Pool({
    user: 'mpurwadi',
    host: 'localhost',
    database: 'opsapps',
    password: 'pratista17',
    port: 5432,
});

// Get TODO items for a user
export async function GET(request: Request) {
    try {
        const auth = verifyAuth();
        
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        
        let query = 'SELECT id, user_id, title, description, status, priority, due_date, created_at, updated_at FROM todo_items WHERE user_id = $1';
        let params: any[] = [auth.userId];
        
        if (status) {
            query += ' AND status = $2';
            params.push(status);
        }
        
        query += ' ORDER BY created_at DESC';
        
        const result = await pool.query(query, params);
        
        return NextResponse.json(result.rows, { status: 200 });
    } catch (error: any) {
        if (error.message.includes('Unauthorized')) {
            return NextResponse.json({ message: error.message }, { status: 401 });
        }
        console.error('Error fetching TODO items:', error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}

// Create a new TODO item
export async function POST(request: Request) {
    try {
        const auth = verifyAuth();
        
        const body = await request.json();
        const { title, description, priority, dueDate } = body;
        
        // Validate required fields
        if (!title) {
            return NextResponse.json({ message: 'Title is required' }, { status: 400 });
        }
        
        // Insert new TODO item
        const result = await pool.query(
            'INSERT INTO todo_items (user_id, title, description, priority, due_date, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, user_id, title, description, status, priority, due_date, created_at, updated_at',
            [auth.userId, title, description || '', priority || 'medium', dueDate || null, 'pending']
        );
        
        return NextResponse.json(result.rows[0], { status: 201 });
    } catch (error: any) {
        if (error.message.includes('Unauthorized')) {
            return NextResponse.json({ message: error.message }, { status: 401 });
        }
        console.error('Error creating TODO item:', error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}

// Update a TODO item
export async function PUT(request: Request) {
    try {
        const auth = verifyAuth();
        
        const body = await request.json();
        const { id, title, description, status, priority, dueDate } = body;
        
        // Validate required fields
        if (!id) {
            return NextResponse.json({ message: 'TODO ID is required' }, { status: 400 });
        }
        
        // Check if TODO item exists and belongs to user
        const existingItem = await pool.query(
            'SELECT id FROM todo_items WHERE id = $1 AND user_id = $2',
            [id, auth.userId]
        );
        
        if (existingItem.rowCount === 0) {
            return NextResponse.json({ message: 'TODO item not found' }, { status: 404 });
        }
        
        // Update TODO item
        const result = await pool.query(
            'UPDATE todo_items SET title = $1, description = $2, status = $3, priority = $4, due_date = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 AND user_id = $7 RETURNING id, user_id, title, description, status, priority, due_date, created_at, updated_at',
            [title || null, description || null, status || null, priority || null, dueDate || null, id, auth.userId]
        );
        
        if (result.rowCount === 0) {
            return NextResponse.json({ message: 'Failed to update TODO item' }, { status: 500 });
        }
        
        return NextResponse.json(result.rows[0], { status: 200 });
    } catch (error: any) {
        if (error.message.includes('Unauthorized')) {
            return NextResponse.json({ message: error.message }, { status: 401 });
        }
        console.error('Error updating TODO item:', error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}

// Delete a TODO item
export async function DELETE(request: Request) {
    try {
        const auth = verifyAuth();
        
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        
        // Validate required fields
        if (!id) {
            return NextResponse.json({ message: 'TODO ID is required' }, { status: 400 });
        }
        
        // Check if TODO item exists and belongs to user
        const existingItem = await pool.query(
            'SELECT id FROM todo_items WHERE id = $1 AND user_id = $2',
            [id, auth.userId]
        );
        
        if (existingItem.rowCount === 0) {
            return NextResponse.json({ message: 'TODO item not found' }, { status: 404 });
        }
        
        // Delete TODO item
        const result = await pool.query(
            'DELETE FROM todo_items WHERE id = $1 AND user_id = $2',
            [id, auth.userId]
        );
        
        if (result.rowCount === 0) {
            return NextResponse.json({ message: 'Failed to delete TODO item' }, { status: 500 });
        }
        
        return NextResponse.json({ message: 'TODO item deleted successfully' }, { status: 200 });
    } catch (error: any) {
        if (error.message.includes('Unauthorized')) {
            return NextResponse.json({ message: error.message }, { status: 401 });
        }
        console.error('Error deleting TODO item:', error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}