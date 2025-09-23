import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { 
  ticketService,
  ticketCommentService
} from '@/services/itsmService';

// GET /api/itsm/tickets - Get all tickets
export async function GET(request: NextRequest) {
  try {
    const auth = verifyAuth();
    
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    
    let tickets;
    if (status) {
      tickets = await ticketService.getTicketsByStatus(status);
    } else {
      tickets = await ticketService.getAllTickets();
    }
    
    return NextResponse.json({ 
      success: true, 
      data: tickets 
    });
  } catch (error: any) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch tickets' 
      },
      { status: 500 }
    );
  }
}

// POST /api/itsm/tickets - Create a new ticket
export async function POST(request: NextRequest) {
  try {
    const auth = verifyAuth();
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.description || !body.category) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Title, description, and category are required' 
        },
        { status: 400 }
      );
    }
    
    const ticket = await ticketService.createTicket({
      ...body,
      created_by: parseInt(auth.userId),
      status: 'open' // Default status
    });
    
    return NextResponse.json({ 
      success: true, 
      data: ticket 
    });
  } catch (error: any) {
    console.error('Error creating ticket:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to create ticket' 
      },
      { status: 500 }
    );
  }
}