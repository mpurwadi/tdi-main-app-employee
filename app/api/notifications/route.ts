// app/api/notifications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';

// Mock data for notifications
let notifications = [
  {
    id: 1,
    userId: 1,
    title: 'Welcome',
    message: 'Welcome to the TDI Service system!',
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

// GET /api/notifications - Get notifications for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const auth = verifyAuth();
    const userId = parseInt(auth.userId);
    
    // Filter notifications for the current user
    const userNotifications = notifications.filter(notification => notification.userId === userId);
    
    return NextResponse.json({
      success: true,
      data: userNotifications
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch notifications'
    }, { status: 500 });
  }
}

// POST /api/notifications - Create a new notification (admin only)
export async function POST(request: NextRequest) {
  try {
    const auth = verifyAuth();
    
    // Check if user is admin
    if (auth.role !== 'admin' && auth.role !== 'superadmin') {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 403 });
    }
    
    const { userId, title, message } = await request.json();
    
    // Create new notification
    const newNotification = {
      id: notifications.length + 1,
      userId: parseInt(userId),
      title,
      message,
      time: new Date().toISOString(),
      read: false
    };
    
    notifications.push(newNotification);
    
    return NextResponse.json({
      success: true,
      data: newNotification
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to create notification'
    }, { status: 500 });
  }
}