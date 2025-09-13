// app/api/admin/remote-schedule/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, isAdmin } from '@/lib/auth';

// Mock data for interns
const mockInterns = [
  { id: 1, name: 'John Doe', email: 'john.doe@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com' },
  { id: 3, name: 'Robert Johnson', email: 'robert.johnson@example.com' },
  { id: 4, name: 'Emily Davis', email: 'emily.davis@example.com' },
  { id: 5, name: 'Michael Wilson', email: 'michael.wilson@example.com' },
  { id: 6, name: 'Sarah Brown', email: 'sarah.brown@example.com' },
  { id: 7, name: 'David Miller', email: 'david.miller@example.com' },
  { id: 8, name: 'Lisa Wilson', email: 'lisa.wilson@example.com' },
];

// Mock data for schedule history
let scheduleHistory = [
  {
    id: 1,
    startDate: '2023-10-01',
    endDate: '2023-10-31',
    method: 'Satu kali remote per minggu',
    interns: [
      { id: 1, name: 'John Doe', remoteDate: '2023-10-05' },
      { id: 2, name: 'Jane Smith', remoteDate: '2023-10-12' },
      { id: 3, name: 'Robert Johnson', remoteDate: '2023-10-19' },
    ],
    createdAt: '2023-09-25T10:30:00Z',
  },
];

// Helper function to get weekdays only (excluding weekends)
function getWeekdaysBetween(startDate: Date, endDate: Date): Date[] {
  const weekdays: Date[] = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    // 0 = Sunday, 6 = Saturday, so we exclude these
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      weekdays.push(new Date(currentDate));
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return weekdays;
}

// Helper function to randomly select dates
function getRandomDates(dates: Date[], count: number): Date[] {
  const shuffled = [...dates].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// GET /api/admin/remote-schedule - Get schedule history
export async function GET(request: NextRequest) {
  try {
    const auth = verifyAuth();
    if (!isAdmin(auth)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: scheduleHistory,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch schedule history' },
      { status: 500 }
    );
  }
}

// POST /api/admin/remote-schedule - Generate random schedule
export async function POST(request: NextRequest) {
  try {
    const auth = verifyAuth();
    if (!isAdmin(auth)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { startDate, endDate, method, selectedInterns } = await request.json();

    // Validate input
    if (!startDate || !endDate || !method || !selectedInterns) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Get all weekdays in the range
    const weekdays = getWeekdaysBetween(new Date(startDate), new Date(endDate));
    
    // Determine how many remote days per intern based on method
    let remoteDaysPerIntern = 1;
    if (method === 'Dua kali remote per minggu') {
      remoteDaysPerIntern = 2;
    }

    // Generate schedule for each intern
    const schedule = selectedInterns.map((intern: any) => {
      // Get random dates for this intern
      const remoteDates = getRandomDates(weekdays, remoteDaysPerIntern);
      
      return {
        id: intern.id,
        name: intern.name,
        remoteDates: remoteDates.map(date => date.toISOString().split('T')[0]),
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        startDate,
        endDate,
        method,
        schedule,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to generate schedule' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/remote-schedule - Save schedule to database
export async function PUT(request: NextRequest) {
  try {
    const auth = verifyAuth();
    if (!isAdmin(auth)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { startDate, endDate, method, schedule } = await request.json();

    // Validate input
    if (!startDate || !endDate || !method || !schedule) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Create new schedule entry
    const newSchedule = {
      id: scheduleHistory.length + 1,
      startDate,
      endDate,
      method,
      interns: schedule.map((intern: any) => ({
        id: intern.id,
        name: intern.name,
        remoteDates: intern.remoteDates,
      })),
      createdAt: new Date().toISOString(),
    };

    // Add to history
    scheduleHistory.push(newSchedule);

    return NextResponse.json({
      success: true,
      data: newSchedule,
      message: 'Schedule saved successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to save schedule' },
      { status: 500 }
    );
  }
}