import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth'; // Only import verifyAuth from lib/auth
import { AuthPayload, isAdmin } from '@/lib/auth-helpers'; // Import AuthPayload and helpers from auth-helpers

export async function GET(request: NextRequest) {
  try {
    console.log('Auth me request received');
    let auth: AuthPayload = await verifyAuth(request);
    console.log('Auth verification successful:', auth);
    
    const admin = isAdmin(auth);
    
    return NextResponse.json({
      success: true,
      userId: auth.userId,
      email: auth.email,
      role: auth.role,
      roles: auth.roles,
      divisionId: auth.divisionId,
      divisionName: auth.divisionName,
      isAdmin: admin,
    });
  } catch (error) {
    console.error('Auth me error:', error);
    // Return 401 to indicate unauthorized access
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }
}