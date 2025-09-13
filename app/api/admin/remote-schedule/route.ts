// app/api/admin/remote-schedule/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, isAdmin } from '@/lib/auth';

// In a real application, this would be replaced with database queries
// Mock data for interns (active users only)
const mockInterns = [
  { id: 1, name: 'John Doe', email: 'john.doe@example.com', status: 'active' },
  { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', status: 'active' },
  { id: 3, name: 'Robert Johnson', email: 'robert.johnson@example.com', status: 'active' },
  { id: 4, name: 'Emily Davis', email: 'emily.davis@example.com', status: 'active' },
  { id: 5, name: 'Michael Wilson', email: 'michael.wilson@example.com', status: 'active' },
  { id: 6, name: 'Sarah Brown', email: 'sarah.brown@example.com', status: 'active' },
  { id: 7, name: 'David Miller', email: 'david.miller@example.com', status: 'active' },
  { id: 8, name: 'Lisa Wilson', email: 'lisa.wilson@example.com', status: 'active' },
  { id: 9, name: 'James Taylor', email: 'james.taylor@example.com', status: 'inactive' },
];

// Mock data for schedule history
let scheduleHistory = [
  {
    id: 1,
    startDate: '2023-10-01',
    endDate: '2023-10-31',
    method: 'Satu kali remote per minggu',
    interns: [
      { id: 1, name: 'John Doe', remoteDates: ['2023-10-05'] },
      { id: 2, name: 'Jane Smith', remoteDates: ['2023-10-12'] },
      { id: 3, name: 'Robert Johnson', remoteDates: ['2023-10-19'] },
    ],
    createdAt: '2023-09-25T10:30:00Z',
  },
];

// Mock data for user calendars
let userCalendars: any = {
  1: [{ date: '2023-10-05', type: 'remote', scheduleId: 1 }],
  2: [{ date: '2023-10-12', type: 'remote', scheduleId: 1 }],
  3: [{ date: '2023-10-19', type: 'remote', scheduleId: 1 }],
};

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

// Helper function to check for date conflicts
function hasDateConflict(newStartDate: string, newEndDate: string, existingSchedules: any[]): boolean {
  const newStart = new Date(newStartDate);
  const newEnd = new Date(newEndDate);
  
  for (const schedule of existingSchedules) {
    const existingStart = new Date(schedule.startDate);
    const existingEnd = new Date(schedule.endDate);
    
    // Check if date ranges overlap
    if (newStart <= existingEnd && newEnd >= existingStart) {
      return true;
    }
  }
  
  return false;
}

// Helper function to add dates to user calendars
function addUserCalendarEntries(schedule: any) {
  schedule.interns.forEach((intern: any) => {
    if (!userCalendars[intern.id]) {
      userCalendars[intern.id] = [];
    }
    
    intern.remoteDates.forEach((date: string) => {
      // Check if entry already exists
      const exists = userCalendars[intern.id].some((entry: any) => 
        entry.date === date && entry.scheduleId === schedule.id
      );
      
      if (!exists) {
        userCalendars[intern.id].push({
          date,
          type: 'remote',
          scheduleId: schedule.id
        });
      }
    });
  });
}

// Helper function to remove dates from user calendars
function removeUserCalendarEntries(scheduleId: number) {
  Object.keys(userCalendars).forEach(userId => {
    userCalendars[userId] = userCalendars[userId].filter((entry: any) => 
      entry.scheduleId !== scheduleId
    );
  });
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

    // Check for date conflicts
    if (hasDateConflict(startDate, endDate, scheduleHistory)) {
      return NextResponse.json(
        { success: false, error: 'Date range conflicts with existing schedule' },
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

    const { startDate, endDate, method, schedule, id } = await request.json();

    // Validate input
    if (!startDate || !endDate || !method || !schedule) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Check for date conflicts (only if this is a new schedule)
    if (!id && hasDateConflict(startDate, endDate, scheduleHistory)) {
      return NextResponse.json(
        { success: false, error: 'Date range conflicts with existing schedule' },
        { status: 400 }
      );
    }

    let newSchedule;
    
    if (id) {
      // Update existing schedule
      const index = scheduleHistory.findIndex(s => s.id === id);
      if (index === -1) {
        return NextResponse.json(
          { success: false, error: 'Schedule not found' },
          { status: 404 }
        );
      }
      
      // Remove old calendar entries
      removeUserCalendarEntries(id);
      
      // Update schedule
      newSchedule = {
        ...scheduleHistory[index],
        startDate,
        endDate,
        method,
        interns: schedule,
      };
      
      scheduleHistory[index] = newSchedule;
    } else {
      // Create new schedule entry
      newSchedule = {
        id: scheduleHistory.length > 0 ? Math.max(...scheduleHistory.map(s => s.id)) + 1 : 1,
        startDate,
        endDate,
        method,
        interns: schedule,
        createdAt: new Date().toISOString(),
      };
      
      // Add to history
      scheduleHistory.push(newSchedule);
    }

    // Add calendar entries for all interns
    addUserCalendarEntries(newSchedule);

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

// PATCH /api/admin/remote-schedule/{id} - Update individual intern date
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = verifyAuth();
    if (!isAdmin(auth)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const scheduleId = parseInt(params.id);
    const { internId, oldDate, newDate } = await request.json();

    // Validate input
    if (!internId || !oldDate || !newDate) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Find the schedule
    const scheduleIndex = scheduleHistory.findIndex(s => s.id === scheduleId);
    if (scheduleIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Schedule not found' },
        { status: 404 }
      );
    }

    // Find the intern in the schedule
    const internIndex = scheduleHistory[scheduleIndex].interns.findIndex((i: any) => i.id === internId);
    if (internIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Intern not found in schedule' },
        { status: 404 }
      );
    }

    // Update the intern's remote date
    const dateIndex = scheduleHistory[scheduleIndex].interns[internIndex].remoteDates.indexOf(oldDate);
    if (dateIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Date not found for intern' },
        { status: 404 }
      );
    }

    // Update the date
    scheduleHistory[scheduleIndex].interns[internIndex].remoteDates[dateIndex] = newDate;

    // Update user calendar
    if (userCalendars[internId]) {
      const calendarEntryIndex = userCalendars[internId].findIndex((entry: any) => 
        entry.date === oldDate && entry.scheduleId === scheduleId
      );
      
      if (calendarEntryIndex !== -1) {
        userCalendars[internId][calendarEntryIndex].date = newDate;
      }
    }

    return NextResponse.json({
      success: true,
      data: scheduleHistory[scheduleIndex],
      message: 'Intern date updated successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update intern date' },
      { status: 500 }
    );
  }
}