import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

// Helper function to verify admin access
const verifyAdmin = async (token: string) => {
    try {
        const decodedToken: any = jwt.verify(token, JWT_SECRET);
        const userId = decodedToken.userId;
        
        // Check if user is admin or superadmin
        const result = await db.query(
            'SELECT role FROM users WHERE id = $1',
            [userId]
        );
        
        if (result.rowCount === 0) {
            return { authorized: false, message: 'User not found' };
        }
        
        const userRole = result.rows[0].role;
        if (userRole !== 'admin' && userRole !== 'superadmin') {
            return { authorized: false, message: 'Insufficient permissions' };
        }
        
        return { authorized: true, userId, userRole };
    } catch (error) {
        return { authorized: false, message: 'Invalid token' };
    }
};

// GET /api/admin/news - Fetch all news and announcements
export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const authResult = await verifyAdmin(token);
        if (!authResult.authorized) {
            return NextResponse.json({ message: authResult.message }, { status: 401 });
        }

        // Fetch all news and announcements
        const result = await db.query(
            `SELECT 
                id, 
                title, 
                content, 
                category, 
                is_published,
                published_at,
                created_at,
                updated_at
            FROM news_announcements 
            ORDER BY created_at DESC`
        );

        return NextResponse.json({ 
            success: true,
            data: result.rows,
            count: result.rowCount
        }, { status: 200 });

    } catch (error: any) {
        console.error('Admin News API Error (GET):', error);
        return NextResponse.json({ 
            success: false,
            message: 'Internal server error' 
        }, { status: 500 });
    }
}

// POST /api/admin/news - Create a new news or announcement
export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const authResult = await verifyAdmin(token);
        if (!authResult.authorized) {
            return NextResponse.json({ message: authResult.message }, { status: 401 });
        }

        const { title, content, category, isPublished } = await req.json();

        if (!title || !content || !category) {
            return NextResponse.json({ 
                success: false,
                message: 'Title, content, and category are required' 
            }, { status: 400 });
        }

        // Insert new news/announcement
        const result = await db.query(
            `INSERT INTO news_announcements 
                (title, content, category, author_id, is_published, published_at) 
            VALUES 
                ($1, $2, $3, $4, $5, $6) 
            RETURNING id, title, content, category, is_published, published_at, created_at`,
            [
                title,
                content,
                category,
                authResult.userId,
                isPublished || false,
                isPublished ? new Date().toISOString() : null
            ]
        );

        return NextResponse.json({ 
            success: true,
            message: 'News/Announcement created successfully',
            data: result.rows[0]
        }, { status: 201 });

    } catch (error: any) {
        console.error('Admin News API Error (POST):', error);
        return NextResponse.json({ 
            success: false,
            message: 'Internal server error' 
        }, { status: 500 });
    }
}