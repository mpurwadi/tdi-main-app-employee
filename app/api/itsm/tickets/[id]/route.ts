import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { 
  ticketService,
  ticketCommentService
} from '@/services/itsmService';

// GET /api/itsm/tickets/[id] - Get ticket by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = verifyAuth();
    
    const ticketId = parseInt(params.id);
    if (isNaN(ticketId)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid ticket ID' 
        },
        { status: 400 }
      );
    }
    
    const ticket = await ticketService.getTicketById(ticketId);
    
    if (!ticket) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Ticket not found' 
        },
        { status: 404 }
      );
    }
    
    // Get comments for this ticket
    const comments = await ticketCommentService.getCommentsByTicketId(ticketId);
    
    return NextResponse.json({ 
      success: true, 
      data: { ...ticket, comments } 
    });
  } catch (error: any) {
    console.error('Error fetching ticket:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch ticket' 
      },
      { status: 500 }
    );
  }
}

// PUT /api/itsm/tickets/[id] - Update ticket
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = verifyAuth();
    
    const ticketId = parseInt(params.id);
    if (isNaN(ticketId)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid ticket ID' 
        },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    // Check permissions - only creator, assignee, or admins can update
    const ticket = await ticketService.getTicketById(ticketId);
    if (!ticket) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Ticket not found' 
        },
        { status: 404 }
      );
    }
    
    if (
      auth.userId !== ticket.created_by.toString() &&
      auth.userId !== ticket.assigned_to?.toString() &&
      !['admin', 'superadmin'].includes(auth.role)
    ) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unauthorized: Insufficient permissions' 
        },
        { status: 403 }
      );
    }
    
    const updatedTicket = await ticketService.updateTicket(ticketId, body);
    
    return NextResponse.json({ 
      success: true, 
      data: updatedTicket 
    });
  } catch (error: any) {
    console.error('Error updating ticket:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to update ticket' 
      },
      { status: 500 }
    );
  }
}

// DELETE /api/itsm/tickets/[id] - Delete ticket
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = verifyAuth();
    
    const ticketId = parseInt(params.id);
    if (isNaN(ticketId)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid ticket ID' 
        },
        { status: 400 }
      );
    }
    
    // Check permissions - only creator or admins can delete
    const ticket = await ticketService.getTicketById(ticketId);
    if (!ticket) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Ticket not found' 
        },
        { status: 404 }
      );
    }
    
    if (
      auth.userId !== ticket.created_by.toString() &&
      !['admin', 'superadmin'].includes(auth.role)
    ) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unauthorized: Insufficient permissions' 
        },
        { status: 403 }
      );
    }
    
    await ticketService.deleteTicket(ticketId);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Ticket deleted successfully' 
    });
  } catch (error: any) {
    console.error('Error deleting ticket:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to delete ticket' 
      },
      { status: 500 }
    );
  }
}