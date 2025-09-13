// app/api/admin/remote-schedule/interns/route.ts
import { Pool } from 'pg';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, isAdmin } from '@/lib/auth';

// Database connection pool
const pool = new Pool({
    user: process.env.DB_USER || 'mpurwadi',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'opsapps',
    password: process.env.DB_PASSWORD || 'pratista17',
    port: parseInt(process.env.DB_PORT || '5432'),
});

export async function GET(request: NextRequest) {
  try {
    const auth = verifyAuth();
    if (!isAdmin(auth)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Query to fetch active users with role 'user' (interns)
    // Based on the test, the status values are 'approved' and 'pending', not 'active'
    const query = `
      SELECT id, full_name as name, email, role, status 
      FROM users 
      WHERE role = 'user' AND status = 'approved'
      ORDER BY full_name
    `;
    
    const result = await pool.query(query);
    
    // Log the result for debugging
    console.log('Interns query result:', result.rows);

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error: any) {
    console.error('Error fetching interns:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch interns: ' + error.message },
      { status: 500 }
    );
  }
}