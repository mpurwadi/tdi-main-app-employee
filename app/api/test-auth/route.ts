// test-auth-api/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthServer } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    // Test authentication
    const auth = await verifyAuthServer();
    
    return NextResponse.json({
      success: true,
      message: 'Authentication successful',
      userId: auth.userId,
      role: auth.role
    });
  } catch (error: any) {
    console.error('Auth test error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Authentication failed' },
      { status: 401 }
    );
  }
}