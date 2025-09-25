import { Pool } from 'pg';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { config } from 'dotenv';

config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '456456',
    database: process.env.DB_NAME || 'opsapps',
    port: parseInt(process.env.DB_PORT || '5432', 10),
});

// GET all divisions
export async function GET(request: NextRequest) {
    try {
        // This endpoint is public and does not require authentication.
        const result = await pool.query('SELECT id, name FROM divisions ORDER BY name');
        
        return NextResponse.json(result.rows, { status: 200 });

    } catch (error: any) {
        console.error('Error fetching divisions:', error);
        return NextResponse.json({ message: error.message || 'An internal server error occurred' }, { status: 500 });
    }
}

// POST - Create a new division (Superadmin only)
export async function POST(request: NextRequest) {
    try {
        const auth = await verifyAuth(request);
        const { isSuperadmin } = await import('@/lib/auth');

        if (!isSuperadmin(auth)) {
            return NextResponse.json({ message: 'Forbidden: Only superadmins can create divisions.' }, { status: 403 });
        }

        const body = await request.json();
        const { name } = body;

        if (!name) {
            return NextResponse.json({ message: 'Division name is required' }, { status: 400 });
        }

        const result = await pool.query(
            'INSERT INTO divisions (name) VALUES ($1) RETURNING id, name',
            [name]
        );

        return NextResponse.json({ message: 'Division created successfully', division: result.rows[0] }, { status: 201 });

    } catch (error: any) {
        // Handle unique constraint violation
        if (error.code === '23505') { // unique_violation
            return NextResponse.json({ message: `Division with name "${(error as any).detail.match(/\(([^)]+)\)/)[1]}" already exists.` }, { status: 409 });
        }
        console.error('Error creating division:', error);
        return NextResponse.json({ message: error.message || 'An internal server error occurred' }, { status: 500 });
    }
}