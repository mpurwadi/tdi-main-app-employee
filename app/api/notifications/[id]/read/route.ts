// app/api/notifications/[id]/read/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';

// Mock data for notifications (in a real app, this would be in a database)
let notifications = [
  {
    id: 1,
    userId: 1,
    title: 'Welcome',
    message: 'Welcome to the TDI Employee system!',
    time: '2023-05-01T08:30:00Z',
    read: false
  },
  {
    id: 2,
    userId: 1,
    title: 'System Update',
    message: 'The system will be updated tonight at 2 AM.',
    time: '2023-05-02T14:15:00Z',
    read: true
  },
  {
    id: 3,
    userId: 2,
    title: 'New Assignment',
    message: 'You have been assigned to Project Alpha.',
    time: '2023-05-03T09:00:00Z',
    read: false
  }
];

// POST /api/notifications/[id]/read - Mark a notification as read
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = verifyAuth();
    const userId = auth.userId;
    const notificationId = parseInt(params.id);
    
    // Find the notification
    const notification = notifications.find(n => n.id === notificationId);
    
    // Check if notification exists and belongs to the user
    if (!notification) {
      return NextResponse.json({
        success: false,
        error: 'Notification not found'
      }, { status: 404 });
    }
    
    if (notification.userId !== userId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 403 });
    }
    
    // Mark as read
    notification.read = true;
    
    return NextResponse.json({
      success: true,
      data: notification
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to mark notification as read'
    }, { status: 500 });
  }
}