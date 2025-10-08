import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Return location configuration from environment variables
    const config = {
      officeLatitude: process.env.OFFICE_LATITUDE ? parseFloat(process.env.OFFICE_LATITUDE) : -6.9248406,
      officeLongitude: process.env.OFFICE_LONGITUDE ? parseFloat(process.env.OFFICE_LONGITUDE) : 107.6586951,
      geofenceRadiusMeters: process.env.GEOFENCE_RADIUS_METERS ? parseInt(process.env.GEOFENCE_RADIUS_METERS) : 400,
      remoteDefaultLatitude: process.env.REMOTE_DEFAULT_LATITUDE ? parseFloat(process.env.REMOTE_DEFAULT_LATITUDE) : -6.200000,
      remoteDefaultLongitude: process.env.REMOTE_DEFAULT_LONGITUDE ? parseFloat(process.env.REMOTE_DEFAULT_LONGITUDE) : 106.816666,
      remoteGeofenceRadiusMeters: process.env.REMOTE_GEOFENCE_RADIUS_METERS ? parseInt(process.env.REMOTE_GEOFENCE_RADIUS_METERS) : 50000,
      dashboardOfficeLatitude: process.env.DASHBOARD_OFFICE_LATITUDE ? parseFloat(process.env.DASHBOARD_OFFICE_LATITUDE) : -6.200000,
      dashboardOfficeLongitude: process.env.DASHBOARD_OFFICE_LONGITUDE ? parseFloat(process.env.DASHBOARD_OFFICE_LONGITUDE) : 106.816666,
      dashboardGeofenceRadiusMeters: process.env.DASHBOARD_GEOFENCE_RADIUS_METERS ? parseInt(process.env.DASHBOARD_GEOFENCE_RADIUS_METERS) : 100
    };

    return NextResponse.json(config, { status: 200 });
  } catch (error) {
    console.error('Error fetching location configuration:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}