import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { 
  serviceRequestCommentService
} from '@/services/itsmService';

// POST /api/itsm/service-requests/[id]/comments - Add comment to service request
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = verifyAuth();
    
    const requestId = parseInt(params.id);
    if (isNaN(requestId)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request ID' 
        },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    if (!body.comment) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Comment is required' 
        },
        { status: 400 }
      );
    }
    
    const comment = await serviceRequestCommentService.createComment({
      service_request_id: requestId,
      user_id: parseInt(auth.userId),
      comment: body.comment
    });
    
    return NextResponse.json({ 
      success: true, 
      data: comment 
    });
  } catch (error: any) {
    console.error('Error adding comment:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to add comment' 
      },
      { status: 500 }
    );
  }
}