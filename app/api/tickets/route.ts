export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { verifyAuth, isAdmin } from '@/lib/auth';
import { db } from '@/lib/db';

// GET all tickets (admin) or user's tickets
export async function GET(request: Request) {
    try {
        const auth = verifyAuth();
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const offset = (page - 1) * limit;
        const status = searchParams.get('status');
        const category = searchParams.get('category');
        const priority = searchParams.get('priority');
        const search = searchParams.get('search');
        
        // Build query dynamically based on filters
        let baseQuery = `
            SELECT t.*, 
                   u.full_name as created_by_name,
                   a.full_name as assigned_to_name
            FROM tickets t
            LEFT JOIN users u ON t.created_by = u.id
            LEFT JOIN users a ON t.assigned_to = a.id
        `;
        
        let countQuery = 'SELECT COUNT(*) FROM tickets t';
        
        let whereConditions = [];
        let values = [];
        let valueIndex = 1;
        
        // Add user filter for non-admins
        if (!isAdmin(auth)) {
            whereConditions.push(`t.created_by = ${valueIndex}`);
            values.push(auth.userId);
            valueIndex++;
        }
        
        // Add status filter
        if (status && status !== 'all') {
            whereConditions.push(`t.status = $${valueIndex}`);
            values.push(status);
            valueIndex++;
        }
        
        // Add category filter
        if (category && category !== 'all') {
            whereConditions.push(`t.category = ${valueIndex}`);
            values.push(category);
            valueIndex++;
        }
        
        // Add priority filter
        if (priority && priority !== 'all') {
            whereConditions.push(`t.priority = ${valueIndex}`);
            values.push(priority);
            valueIndex++;
        }
        
        // Add search filter
        if (search) {
            whereConditions.push(`(t.title ILIKE ${valueIndex} OR t.description ILIKE ${valueIndex})`);
            values.push(`%${search}%`);
            valueIndex++;
        }
        
        // Add WHERE clause if we have conditions
        if (whereConditions.length > 0) {
            const whereClause = 'WHERE ' + whereConditions.join(' AND ');
            baseQuery += ' ' + whereClause;
            countQuery += ' ' + whereClause;
        }
        
        // Add ordering and pagination
        baseQuery += ` ORDER BY t.created_at DESC LIMIT ${valueIndex} OFFSET ${valueIndex + 1}`;
        values.push(limit, offset);
        
        const result = await db.query(baseQuery, values);
        
        // Get total count for pagination
        const countResult = await db.query(countQuery, values.slice(0, valueIndex - 2)); // Exclude limit and offset
        const total = parseInt(countResult.rows[0].count);
        
        return NextResponse.json({
            tickets: result.rows,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        }, { status: 200 });
        
    } catch (error: any) {
        if (error.message.includes('Unauthorized')) {
            return NextResponse.json({ message: error.message }, { status: 401 });
        }
        console.error('Error fetching tickets:', error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}

// CREATE a new ticket
export async function POST(request: Request) {
    try {
        const auth = verifyAuth();
        const body = await request.json();
        const { title, description, category, priority } = body;
        
        // Validate required fields
        if (!title || !description) {
            return NextResponse.json({ message: 'Title and description are required' }, { status: 400 });
        }
        
        const query = `
            INSERT INTO tickets (title, description, category, priority, status, created_by)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        const values = [title, description, category || 'support', priority || 'medium', 'open', auth.userId];
        
        const result = await db.query(query, values);
        
        return NextResponse.json(result.rows[0], { status: 201 });
        
    } catch (error: any) {
        if (error.message.includes('Unauthorized')) {
            return NextResponse.json({ message: error.message }, { status: 401 });
        }
        console.error('Error creating ticket:', error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}