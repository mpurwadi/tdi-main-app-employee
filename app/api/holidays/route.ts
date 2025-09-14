import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

// Helper function to verify authentication
const verifyAuth = (token: string) => {
    try {
        const decodedToken: any = jwt.verify(token, JWT_SECRET);
        return { userId: decodedToken.userId, role: decodedToken.role };
    } catch (error) {
        throw new Error('Unauthorized');
    }
};

// GET /api/holidays - Fetch holidays with optional date range filtering
export async function GET(req: NextRequest) {
    try {
        const cookieStore = cookies();
        const token = cookieStore.get('token')?.value;
        
        if (!token) {
            return NextResponse.json({ message: 'Unauthorized: No token provided' }, { status: 401 });
        }

        const auth = verifyAuth(token);
        
        // Check if user has admin privileges
        if (auth.role !== 'admin' && auth.role !== 'superadmin') {
            return NextResponse.json({ message: 'Forbidden: Insufficient permissions' }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const startDate = searchParams.get('start');
        const endDate = searchParams.get('end');

        let query = 'SELECT id, name, date, description, is_national, created_at, updated_at FROM holidays WHERE 1=1';
        let params: any[] = [];
        let paramIndex = 1;

        if (startDate && endDate) {
            query += ` AND date BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
            params.push(startDate, endDate);
            paramIndex += 2;
        }

        query += ' ORDER BY date ASC';

        const result = await db.query(query, params);
        
        return NextResponse.json(result.rows, { status: 200 });
    } catch (error: any) {
        if (error.message.includes('Unauthorized')) {
            return NextResponse.json({ message: error.message }, { status: 401 });
        }
        console.error('Error fetching holidays:', error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}

// POST /api/holidays - Create a new holiday
export async function POST(req: NextRequest) {
    try {
        const cookieStore = cookies();
        const token = cookieStore.get('token')?.value;
        
        if (!token) {
            return NextResponse.json({ message: 'Unauthorized: No token provided' }, { status: 401 });
        }

        const auth = verifyAuth(token);
        
        // Check if user has admin privileges
        if (auth.role !== 'admin' && auth.role !== 'superadmin') {
            return NextResponse.json({ message: 'Forbidden: Insufficient permissions' }, { status: 403 });
        }

        const body = await req.json();
        const { name, date, description, isNational } = body;

        // Validate required fields
        if (!name || !date) {
            return NextResponse.json({ message: 'Name and date are required' }, { status: 400 });
        }

        // Insert new holiday
        const result = await db.query(
            'INSERT INTO holidays (name, date, description, is_national) VALUES ($1, $2, $3, $4) RETURNING id, name, date, description, is_national, created_at, updated_at',
            [name, date, description || '', isNational !== undefined ? isNational : true]
        );

        return NextResponse.json(result.rows[0], { status: 201 });
    } catch (error: any) {
        if (error.message.includes('Unauthorized')) {
            return NextResponse.json({ message: error.message }, { status: 401 });
        }
        console.error('Error creating holiday:', error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}

// PUT /api/holidays - Update an existing holiday
export async function PUT(req: NextRequest) {
    try {
        const cookieStore = cookies();
        const token = cookieStore.get('token')?.value;
        
        if (!token) {
            return NextResponse.json({ message: 'Unauthorized: No token provided' }, { status: 401 });
        }

        const auth = verifyAuth(token);
        
        // Check if user has admin privileges
        if (auth.role !== 'admin' && auth.role !== 'superadmin') {
            return NextResponse.json({ message: 'Forbidden: Insufficient permissions' }, { status: 403 });
        }

        const body = await req.json();
        const { id, name, date, description, isNational } = body;

        // Validate required fields
        if (!id) {
            return NextResponse.json({ message: 'Holiday ID is required' }, { status: 400 });
        }

        // Update holiday
        const result = await db.query(
            'UPDATE holidays SET name = $1, date = $2, description = $3, is_national = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING id, name, date, description, is_national, created_at, updated_at',
            [name || null, date || null, description || null, isNational !== undefined ? isNational : null, id]
        );

        if (result.rowCount === 0) {
            return NextResponse.json({ message: 'Holiday not found' }, { status: 404 });
        }

        return NextResponse.json(result.rows[0], { status: 200 });
    } catch (error: any) {
        if (error.message.includes('Unauthorized')) {
            return NextResponse.json({ message: error.message }, { status: 401 });
        }
        console.error('Error updating holiday:', error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}

// DELETE /api/holidays - Delete a holiday
export async function DELETE(req: NextRequest) {
    try {
        const cookieStore = cookies();
        const token = cookieStore.get('token')?.value;
        
        if (!token) {
            return NextResponse.json({ message: 'Unauthorized: No token provided' }, { status: 401 });
        }

        const auth = verifyAuth(token);
        
        // Check if user has admin privileges
        if (auth.role !== 'admin' && auth.role !== 'superadmin') {
            return NextResponse.json({ message: 'Forbidden: Insufficient permissions' }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        // Validate required fields
        if (!id) {
            return NextResponse.json({ message: 'Holiday ID is required' }, { status: 400 });
        }

        // Delete holiday
        const result = await db.query('DELETE FROM holidays WHERE id = $1', [id]);

        if (result.rowCount === 0) {
            return NextResponse.json({ message: 'Holiday not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Holiday deleted successfully' }, { status: 200 });
    } catch (error: any) {
        if (error.message.includes('Unauthorized')) {
            return NextResponse.json({ message: error.message }, { status: 401 });
        }
        console.error('Error deleting holiday:', error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}