// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, isAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth();
    const admin = isAdmin(auth);
    
    return NextResponse.json({
      success: true,
      userId: auth.userId,
      email: auth.email,
      role: auth.role,
      roles: auth.roles,
      isAdmin: admin,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }
}