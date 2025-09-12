import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/public/news - Fetch published news and announcements
export async function GET(req: NextRequest) {
    try {
        // Fetch published news and announcements, ordered by published date
        const result = await db.query(
            `SELECT 
                id, 
                title, 
                content, 
                category, 
                published_at,
                created_at
            FROM news_announcements 
            WHERE is_published = true 
            ORDER BY published_at DESC 
            LIMIT 10`
        );

        // Format the records for the frontend
        const newsItems = result.rows.map(item => ({
            id: item.id,
            title: item.title,
            content: item.content,
            category: item.category,
            publishedAt: item.published_at || item.created_at
        }));

        return NextResponse.json({ 
            success: true,
            data: newsItems,
            count: newsItems.length
        }, { status: 200 });

    } catch (error: any) {
        console.error('News/Announcements API Error:', error);
        return NextResponse.json({ 
            success: false,
            message: 'Internal server error' 
        }, { status: 500 });
    }
}