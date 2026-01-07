import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/job-roles - Get all job roles
export async function GET(request: NextRequest) {
  try {
    const result = await db.query('SELECT id, name, description FROM job_roles ORDER BY name');
    
    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    console.error('Error fetching job roles:', error);
    return NextResponse.json(
      { message: 'Failed to fetch job roles' },
      { status: 500 }
    );
  }
}