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

// PUT /api/admin/news/[id] - Update a news or announcement
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const authResult = await verifyAdmin(token);
        if (!authResult.authorized) {
            return NextResponse.json({ message: authResult.message }, { status: 401 });
        }

        const id = params.id;
        const { title, content, category, isPublished } = await req.json();

        // Check if news/announcement exists
        const existing = await db.query(
            'SELECT id FROM news_announcements WHERE id = $1',
            [id]
        );

        if (existing.rowCount === 0) {
            return NextResponse.json({ 
                success: false,
                message: 'News/Announcement not found' 
            }, { status: 404 });
        }

        // Update news/announcement
        const result = await db.query(
            `UPDATE news_announcements 
            SET 
                title = $1, 
                content = $2, 
                category = $3, 
                is_published = $4,
                published_at = $5,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $6 
            RETURNING id, title, content, category, is_published, published_at, updated_at`,
            [
                title,
                content,
                category,
                isPublished || false,
                isPublished ? new Date().toISOString() : null,
                id
            ]
        );

        return NextResponse.json({ 
            success: true,
            message: 'News/Announcement updated successfully',
            data: result.rows[0]
        }, { status: 200 });

    } catch (error: any) {
        console.error('Admin News API Error (PUT):', error);
        return NextResponse.json({ 
            success: false,
            message: 'Internal server error' 
        }, { status: 500 });
    }
}

// DELETE /api/admin/news/[id] - Delete a news or announcement
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const authResult = await verifyAdmin(token);
        if (!authResult.authorized) {
            return NextResponse.json({ message: authResult.message }, { status: 401 });
        }

        const id = params.id;

        // Check if news/announcement exists
        const existing = await db.query(
            'SELECT id FROM news_announcements WHERE id = $1',
            [id]
        );

        if (existing.rowCount === 0) {
            return NextResponse.json({ 
                success: false,
                message: 'News/Announcement not found' 
            }, { status: 404 });
        }

        // Delete news/announcement
        await db.query('DELETE FROM news_announcements WHERE id = $1', [id]);

        return NextResponse.json({ 
            success: true,
            message: 'News/Announcement deleted successfully'
        }, { status: 200 });

    } catch (error: any) {
        console.error('Admin News API Error (DELETE):', error);
        return NextResponse.json({ 
            success: false,
            message: 'Internal server error' 
        }, { status: 500 });
    }
}