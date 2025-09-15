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

// Handle CORS preflight requests
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
            'Access-Control-Allow-Credentials': 'true',
        },
    });
}

// Get todo list items for a user
export async function GET(request: Request) {
    try {
        const auth = verifyAuth();
        
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const tag = searchParams.get('tag');
        const priority = searchParams.get('priority');
        const search = searchParams.get('search');
        
        let query = 'SELECT id, user_id, title, description, description_text, tag, priority, status, date, path, created_at, updated_at FROM todo_list_items WHERE user_id = $1';
        let params: any[] = [auth.userId];
        let paramIndex = 2;
        
        if (status) {
            query += ` AND status = ${paramIndex}`;
            params.push(status);
            paramIndex++;
        }
        
        if (tag) {
            query += ` AND tag = ${paramIndex}`;
            params.push(tag);
            paramIndex++;
        }
        
        if (priority) {
            query += ` AND priority = ${paramIndex}`;
            params.push(priority);
            paramIndex++;
        }
        
        if (search) {
            query += ` AND (title ILIKE ${paramIndex} OR description_text ILIKE ${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }
        
        query += ' ORDER BY created_at DESC';
        
        const result = await pool.query(query, params);
        
        return NextResponse.json(result.rows, { status: 200 });
    } catch (error: any) {
        if (error.message.includes('Unauthorized')) {
            return NextResponse.json({ message: error.message }, { status: 401 });
        }
        console.error('Error fetching todo list items:', error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}

// Create a new todo list item
export async function POST(request: Request) {
    try {
        const auth = verifyAuth();
        
        const body = await request.json();
        const { title, description, descriptionText, tag, priority, status, date, path } = body;
        
        // Validate required fields
        if (!title) {
            return NextResponse.json({ message: 'Title is required' }, { status: 400 });
        }
        
        // Insert new todo list item
        const result = await pool.query(
            'INSERT INTO todo_list_items (user_id, title, description, description_text, tag, priority, status, date, path) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id, user_id, title, description, description_text, tag, priority, status, date, path, created_at, updated_at',
            [auth.userId, title, description || '', descriptionText || '', tag || '', priority || 'medium', status || 'pending', date || '', path || '']
        );
        
        return NextResponse.json(result.rows[0], { status: 201 });
    } catch (error: any) {
        if (error.message.includes('Unauthorized')) {
            return NextResponse.json({ message: error.message }, { status: 401 });
        }
        console.error('Error creating todo list item:', error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}

// Update a todo list item
export async function PUT(request: Request) {
    try {
        const auth = verifyAuth();
        
        const body = await request.json();
        const { id, title, description, descriptionText, tag, priority, status, date, path } = body;
        
        // Validate required fields
        if (!id) {
            return NextResponse.json({ message: 'TODO ID is required' }, { status: 400 });
        }
        
        // Check if todo list item exists and belongs to user
        const existingItem = await pool.query(
            'SELECT id FROM todo_list_items WHERE id = $1 AND user_id = $2',
            [id, auth.userId]
        );
        
        if (existingItem.rowCount === 0) {
            return NextResponse.json({ message: 'Todo list item not found' }, { status: 404 });
        }
        
        // Update todo list item
        const result = await pool.query(
            'UPDATE todo_list_items SET title = $1, description = $2, description_text = $3, tag = $4, priority = $5, status = $6, date = $7, path = $8, updated_at = CURRENT_TIMESTAMP WHERE id = $9 AND user_id = $10 RETURNING id, user_id, title, description, description_text, tag, priority, status, date, path, created_at, updated_at',
            [title || null, description || null, descriptionText || null, tag || null, priority || null, status || null, date || null, path || null, id, auth.userId]
        );
        
        if (result.rowCount === 0) {
            return NextResponse.json({ message: 'Failed to update todo list item' }, { status: 500 });
        }
        
        return NextResponse.json(result.rows[0], { status: 200 });
    } catch (error: any) {
        if (error.message.includes('Unauthorized')) {
            return NextResponse.json({ message: error.message }, { status: 401 });
        }
        console.error('Error updating todo list item:', error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}

// Delete a todo list item
export async function DELETE(request: Request) {
    try {
        const auth = verifyAuth();
        
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        
        // Validate required fields
        if (!id) {
            return NextResponse.json({ message: 'TODO ID is required' }, { status: 400 });
        }
        
        // Check if todo list item exists and belongs to user
        const existingItem = await pool.query(
            'SELECT id FROM todo_list_items WHERE id = $1 AND user_id = $2',
            [id, auth.userId]
        );
        
        if (existingItem.rowCount === 0) {
            return NextResponse.json({ message: 'Todo list item not found' }, { status: 404 });
        }
        
        // Delete todo list item
        const result = await pool.query(
            'DELETE FROM todo_list_items WHERE id = $1 AND user_id = $2',
            [id, auth.userId]
        );
        
        if (result.rowCount === 0) {
            return NextResponse.json({ message: 'Failed to delete todo list item' }, { status: 500 });
        }
        
        return NextResponse.json({ message: 'Todo list item deleted successfully' }, { status: 200 });
    } catch (error: any) {
        if (error.message.includes('Unauthorized')) {
            return NextResponse.json({ message: error.message }, { status: 401 });
        }
        console.error('Error deleting todo list item:', error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}