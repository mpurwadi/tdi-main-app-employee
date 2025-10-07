'use client';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const AbsenceComponent = () => {
    const router = useRouter();
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [distance, setDistance] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt' | null>(null);
    const [showLocationInstructions, setShowLocationInstructions] = useState(false);
    const [isCheckedIn, setIsCheckedIn] = useState(false);
    const [checkInTime, setCheckInTime] = useState<string | null>(null);
    const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);
    const [showManualCheckIn, setShowManualCheckIn] = useState(false);
    const [manualReason, setManualReason] = useState('');
    const [lateReason, setLateReason] = useState('');
    const [showLateReason, setShowLateReason] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-12
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // Office coordinates for geofencing (example - replace with actual office location)
    const OFFICE_LATITUDE = -6.9248406; // Updated coordinates
    const OFFICE_LONGITUDE = 107.6586951; // Updated coordinates
    const GEOFENCE_RADIUS_METERS = 400; // 400 meters

    useEffect(() => {
        // Check location permission status
        if (navigator.permissions) {
            navigator.permissions.query({ name: 'geolocation' as PermissionName }).then((permissionStatus) => {
                setLocationPermission(permissionStatus.state);
                permissionStatus.onchange = () => {
                    setLocationPermission(permissionStatus.state);
                };
            }).catch((err) => {
                console.warn('Location permission check failed:', err);
            });
        }

        // Set default month and year to current month
        const currentDate = new Date();
        setSelectedMonth(currentDate.getMonth() + 1); // JavaScript months are 0-indexed
        setSelectedYear(currentDate.getFullYear());

        // Check current attendance status
        checkAttendanceStatus();
        
        // Load attendance history for current month
        loadAttendanceHistory(currentDate.getMonth() + 1, currentDate.getFullYear());
    }, []);

    const checkAttendanceStatus = async () => {
        try {
            const response = await fetch('/api/attendance/status');
            if (response.ok) {
                const data = await response.json();
                setIsCheckedIn(data.isCheckedIn);
                setCheckInTime(data.checkInTime);
            }
        } catch (err) {
            console.error('Failed to check attendance status:', err);
        }
    };

    const loadAttendanceHistory = async (month?: number, year?: number) => {
        try {
            // If no month/year provided, use current month/year
            const targetMonth = month || selectedMonth;
            const targetYear = year || selectedYear;
            
            const response = await fetch(`/api/attendance/history?month=${targetMonth}&year=${targetYear}`);
            if (response.ok) {
                const data = await response.json();
                // Take only the last 5 records
                setAttendanceHistory(data.records.slice(0, 5));
            }
        } catch (err) {
            console.error('Failed to load attendance history:', err);
        }
    };

    // Haversine formula to calculate distance between two lat/lon points
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371e3; // metres
        const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        const distance = R * c; // in metres
        return distance;
    };

    const requestLocationPermission = () => {
        // Show instructions for enabling location permissions
        setShowLocationInstructions(true);
        
        // Try to request location permission
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                () => {
                    // Permission granted
                    setShowLocationInstructions(false);
                    setLocationPermission('granted');
                },
                (error) => {
                    // Permission denied or error
                    console.warn('Location permission request failed:', error);
                    setShowLocationInstructions(true);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        } else {
            setError('Geolocation is not supported by your browser/device.');
        }
    };

    const getCurrentLocation = (isForLateCheckIn = false) => {
        setLoading(true);
        setError(null);

        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser/device.');
            setLoading(false);
            return;
        }

        // Check if we should show location instructions
        if (locationPermission === 'denied') {
            setShowLocationInstructions(true);
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ latitude, longitude });

                const calculatedDistance = calculateDistance(
                    latitude,
                    longitude,
                    OFFICE_LATITUDE,
                    OFFICE_LONGITUDE
                );
                
                setDistance(calculatedDistance);

                if (calculatedDistance <= GEOFENCE_RADIUS_METERS) {
                    // If this is specifically for late check-in (from the late form), submit late check-in
                    if (isForLateCheckIn && showLateReason) {
                        await submitLateCheckIn(latitude, longitude);
                    } else if (isForLateCheckIn) {
                        // If this is called for late check-in but the form is not shown, it means
                        // we're trying to submit a late check-in but without going through the late prompt
                        if (isLateCheckIn(null)) {
                            setShowLateReason(true);
                        } else {
                            // If it's not actually late, submit regular check-in
                            await submitAttendance(latitude, longitude);
                        }
                    } else {
                        // Location is within geofence, proceed with attendance submission
                        await submitAttendance(latitude, longitude);
                    }
                } else {
                    setError(`You are ${calculatedDistance.toFixed(2)} meters away from the office. Must be within ${GEOFENCE_RADIUS_METERS} meters.`);
                    Swal.fire({
                        icon: 'error',
                        title: 'Location Error',
                        text: `You are ${calculatedDistance.toFixed(2)} meters away from the office. Must be within ${GEOFENCE_RADIUS_METERS} meters.`,
                        padding: '2em',
                        customClass: {
                            container: 'sweet-alerts'
                        },
                    });
                }
                setLoading(false);
            },
            (posError) => {
                setLoading(false);
                
                // Handle different error codes
                switch (posError.code) {
                    case posError.PERMISSION_DENIED:
                        setError('Location access denied. Please enable location permissions in your browser settings.');
                        setLocationPermission('denied');
                        setShowLocationInstructions(true);
                        Swal.fire({
                            icon: 'error',
                            title: 'Location Access Required',
                            text: 'Please enable location permissions for this app in your browser settings and try again.',
                            confirmButtonText: 'Show Instructions',
                            showCancelButton: true,
                            cancelButtonText: 'Cancel',
                            padding: '2em',
                            customClass: {
                                container: 'sweet-alerts'
                            },
                        }).then((result) => {
                            if (result.isConfirmed) {
                                setShowLocationInstructions(true);
                            }
                        });
                        break;
                    case posError.POSITION_UNAVAILABLE:
                        setError('Location information is unavailable. Please check your device settings.');
                        Swal.fire({
                            icon: 'error',
                            title: 'Location Unavailable',
                            text: 'Location information is unavailable. Please check your device settings and try again.',
                            padding: '2em',
                            customClass: {
                                container: 'sweet-alerts'
                            },
                        });
                        break;
                    case posError.TIMEOUT:
                        setError('Location request timed out. Please try again.');
                        Swal.fire({
                            icon: 'error',
                            title: 'Request Timeout',
                            text: 'Location request timed out. Please try again.',
                            padding: '2em',
                            customClass: {
                                container: 'sweet-alerts'
                            },
                        });
                        break;
                    default:
                        setError(`Geolocation Error: ${posError.message}`);
                        Swal.fire({
                            icon: 'error',
                            title: 'Geolocation Error',
                            text: `Please enable location services and try again. (${posError.message})`,
                            padding: '2em',
                            customClass: {
                                container: 'sweet-alerts'
                            },
                        });
                        break;
                }
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const submitAttendance = async (latitude: number, longitude: number) => {
        try {
            const action = isCheckedIn ? 'check-out' : 'check-in';
            
            // Determine if this is likely to be a late check-in based on current time
            if (action === 'check-in' && isLateCheckIn(null)) { // Pass null to check current time
                setShowLateReason(true);
                return;
            }

            const response = await fetch('/api/attendance/check-in', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ latitude, longitude, action }),
            });

            const data = await response.json();

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: isCheckedIn ? 'Check-out Recorded!' : 'Check-in Recorded!',
                    text: data.message || (isCheckedIn ? 'Your check-out has been successfully recorded.' : 'Your check-in has been successfully recorded.'),
                    padding: '2em',
                    customClass: {
                        container: 'sweet-alerts'
                    },
                });
                
                // Refresh attendance status and history
                await checkAttendanceStatus();
                await loadAttendanceHistory();
            } else {
                setError(data.message || (isCheckedIn ? 'Failed to record check-out.' : 'Failed to record check-in.'));
                Swal.fire({
                    icon: 'error',
                    title: isCheckedIn ? 'Check-out Failed' : 'Check-in Failed',
                    text: data.message || (isCheckedIn ? 'Failed to record check-out.' : 'Failed to record check-in.'),
                    padding: '2em',
                    customClass: {
                        container: 'sweet-alerts'
                    },
                });
            }
        } catch (err: any) {
            setError(`Network Error: ${err.message}`);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `An unexpected error occurred: ${err.message}`,
                padding: '2em',
                customClass: {
                    container: 'sweet-alerts'
                },
            });
        }
    };

    const submitLateCheckIn = async (latitude: number, longitude: number) => {
        if (!lateReason.trim()) {
            Swal.fire({
                icon: 'error',
                title: 'Keterangan Required',
                text: 'Please provide a reason (keterangan) for late check-in.',
                padding: '2em',
                customClass: {
                    container: 'sweet-alerts'
                },
            });
            return;
        }

        try {
            const response = await fetch('/api/attendance/check-in', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    latitude, 
                    longitude, 
                    action: 'check-in',
                    late: true,
                    lateReason: lateReason
                }),
            });

            const data = await response.json();

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Late Check-in Recorded!',
                    text: data.message || 'Your late check-in has been successfully recorded.',
                    padding: '2em',
                    customClass: {
                        container: 'sweet-alerts'
                    },
                });
                
                // Refresh attendance status and history
                await checkAttendanceStatus();
                await loadAttendanceHistory();
                
                // Reset form
                setLateReason('');
                setShowLateReason(false);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Check-in Failed',
                    text: data.message || 'Failed to record check-in.',
                    padding: '2em',
                    customClass: {
                        container: 'sweet-alerts'
                    },
                });
            }
        } catch (err: any) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `An unexpected error occurred: ${err.message}`,
                padding: '2em',
                customClass: {
                    container: 'sweet-alerts'
                },
            });
        }
    };

    const submitManualCheckIn = async () => {
        if (!manualReason.trim()) {
            Swal.fire({
                icon: 'error',
                title: 'Reason Required',
                text: 'Please provide a reason for manual check-in.',
                padding: '2em',
                customClass: {
                    container: 'sweet-alerts'
                },
            });
            return;
        }

        try {
            const action = isCheckedIn ? 'check-out' : 'check-in';
            const response = await fetch('/api/attendance/check-in', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    latitude: OFFICE_LATITUDE, 
                    longitude: OFFICE_LONGITUDE, 
                    action,
                    manual: true,
                    reason: manualReason
                }),
            });

            const data = await response.json();

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: isCheckedIn ? 'Manual Check-out Recorded!' : 'Manual Check-in Recorded!',
                    text: data.message || (isCheckedIn ? 'Your manual check-out has been successfully recorded.' : 'Your manual check-in has been successfully recorded.'),
                    padding: '2em',
                    customClass: {
                        container: 'sweet-alerts'
                    },
                });
                
                // Refresh attendance status and history
                await checkAttendanceStatus();
                await loadAttendanceHistory();
                
                // Reset form
                setManualReason('');
                setShowManualCheckIn(false);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: isCheckedIn ? 'Manual Check-out Failed' : 'Manual Check-in Failed',
                    text: data.message || (isCheckedIn ? 'Failed to record manual check-out.' : 'Failed to record manual check-in.'),
                    padding: '2em',
                    customClass: {
                        container: 'sweet-alerts'
                    },
                });
            }
        } catch (err: any) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `An unexpected error occurred: ${err.message}`,
                padding: '2em',
                customClass: {
                    container: 'sweet-alerts'
                },
            });
        }
    };

    const exportToPDF = async (month: number, year: number) => {
        try {
            // Fetch attendance records for the selected month
            const response = await fetch(`/api/attendance/export?month=${month}&year=${year}`);
            if (!response.ok) {
                throw new Error('Failed to fetch attendance data');
            }
            
            const data = await response.json();
            const records = data.records;

            // Create PDF document
            const doc = new jsPDF() as any;
            
            // Add title
            doc.setFontSize(18);
            doc.text(`Attendance Report - ${getMonthName(month)} ${year}`, 14, 20);
            
            // Add user info (in a real app, you'd get this from auth)
            doc.setFontSize(12);
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
            
            // Prepare table data
            const tableData = records.map((record: any) => [
                new Date(record.clockInTime).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                }),
                record.clockInTime ? new Date(record.clockInTime).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                }) : '-',
                record.clockOutTime ? new Date(record.clockOutTime).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                }) : '-',
                record.manualCheckinReason || record.manualCheckoutReason ? 'Yes' : (record.lateCheckinReason ? 'Late with reason' : 'No'),
                record.lateCheckinReason || '-'
            ]);
            
            // Add table using the imported autotable function
            autoTable(doc, {
                startY: 40,
                head: [['Date', 'Check-in Time', 'Check-out Time', 'Manual/Late Entry', 'Keterangan']],
                body: tableData,
                theme: 'striped',
                styles: {
                    fontSize: 10
                },
                headStyles: {
                    fillColor: [67, 97, 238] // Primary color
                }
            });
            
            // Save the PDF
            doc.save(`attendance-report-${year}-${month}.pdf`);
            
            Swal.fire({
                icon: 'success',
                title: 'Export Successful!',
                text: `Attendance report for ${getMonthName(month)} ${year} has been exported to PDF.`,
                padding: '2em',
                customClass: {
                    container: 'sweet-alerts'
                },
            });
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'Export Failed',
                text: `Failed to export attendance report: ${error.message}`,
                padding: '2em',
                customClass: {
                    container: 'sweet-alerts'
                },
            });
        }
    };

    const getMonthName = (month: number) => {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return months[month - 1];
    };

    // Check if the time is late (after 9:10 AM)
    const isLateCheckIn = (checkInTime: string | null = null): boolean => {
        const timeToCheck = checkInTime ? new Date(checkInTime) : new Date();
        const hours = timeToCheck.getHours();
        const minutes = timeToCheck.getMinutes();
        
        // Standard office start time is 9:00 AM, late if after 9:10 AM
        if (hours > 9 || (hours === 9 && minutes > 10)) {
            return true;
        }
        return false;
    };

    // Format distance with appropriate units
    const formatDistance = (distance: number) => {
        if (distance < 1000) {
            return `${distance.toFixed(2)} meters`;
        } else {
            return `${(distance / 1000).toFixed(2)} kilometers`;
        }
    };

    return (
        <div className="panel">
            <div className="mb-5 flex items-center justify-between">
                <h5 className="text-lg font-semibold">Absensi Karyawan</h5>
                <div className="flex gap-2">
                    <button 
                        className="btn btn-outline-primary"
                        onClick={() => setShowManualCheckIn(!showManualCheckIn)}
                    >
                        {showManualCheckIn ? 'Cancel Manual' : 'Manual Check-in'}
                    </button>
                </div>
            </div>
            
            <p className="mb-4">Pastikan Anda berada dalam radius 400 meter dari kantor untuk melakukan absensi.</p>
            
            {/* Manual Check-in Form */}
            {showManualCheckIn && (
                <div className="mb-6 panel">
                    <h3 className="text-lg font-bold mb-4">Manual Check-in/Check-out</h3>
                    <p className="mb-4">Please provide a reason for manual check-in/check-out.</p>
                    
                    <div className="mb-4">
                        <label htmlFor="manualReason" className="block text-sm font-medium mb-1">Reason</label>
                        <textarea
                            id="manualReason"
                            className="form-input"
                            value={manualReason}
                            onChange={(e) => setManualReason(e.target.value)}
                            placeholder="Enter reason for manual check-in/check-out"
                            rows={3}
                        />
                    </div>
                    
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => setShowManualCheckIn(false)}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className={`btn ${isCheckedIn ? 'btn-danger' : 'btn-primary'}`}
                            onClick={submitManualCheckIn}
                        >
                            {isCheckedIn ? 'Manual Check Out' : 'Manual Check In'}
                        </button>
                    </div>
                </div>
            )}

            {/* Late Check-in Form */}
            {showLateReason && (
                <div className="mb-6 panel">
                    <h3 className="text-lg font-bold mb-4">Late Check-in Reason Required</h3>
                    <p className="mb-4">
                        You are checking in after the standard start time (9:10 AM). Please provide a reason for the late arrival.
                    </p>
                    
                    <div className="mb-4">
                        <label htmlFor="lateReason" className="block text-sm font-medium mb-1">Keterangan (Reason)</label>
                        <textarea
                            id="lateReason"
                            className="form-input"
                            value={lateReason}
                            onChange={(e) => setLateReason(e.target.value)}
                            placeholder="Enter reason for late check-in"
                            rows={3}
                        />
                    </div>
                    
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => {
                                setShowLateReason(false);
                                setLateReason('');
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => {
                                if (location) {
                                    submitLateCheckIn(location.latitude, location.longitude);
                                } else {
                                    // If location is not available, get the current location first
                                    getCurrentLocation(true);
                                }
                            }}
                        >
                            Submit Late Check In
                        </button>
                    </div>
                </div>
            )}
            
            {/* Location permission instructions */}
            {showLocationInstructions && (
                <div className="mb-4 p-4 rounded-lg bg-info/10 text-info">
                    <div className="flex items-center justify-between">
                        <h4 className="font-bold text-lg">Enable Location Access</h4>
                        <button 
                            onClick={() => setShowLocationInstructions(false)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                    <div className="mt-2">
                        <p className="mb-2">To use the attendance feature, please enable location access:</p>
                        <ol className="list-decimal pl-5 space-y-2">
                            <li>Tap the lock icon or "i" icon in your browser's address bar</li>
                            <li>Find "Location" in the permissions list</li>
                            <li>Set it to "Allow" or "Allow this time"</li>
                            <li>Refresh this page</li>
                        </ol>
                        <div className="mt-3 flex flex-col sm:flex-row gap-2">
                            <button 
                                className="btn btn-primary"
                                onClick={requestLocationPermission}
                            >
                                Request Location Permission
                            </button>
                            <button 
                                className="btn btn-outline-secondary"
                                onClick={() => setShowLocationInstructions(false)}
                            >
                                Close Instructions
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Geofencing information */}
            <div className="mb-4 p-3 rounded-lg bg-info/10 text-info">
                <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span>Office Location: {OFFICE_LATITUDE.toFixed(6)}, {OFFICE_LONGITUDE.toFixed(6)}</span>
                </div>
                <div className="mt-1 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span>Geofence Radius: {GEOFENCE_RADIUS_METERS} meters</span>
                </div>
            </div>

            {error && (
                <div className="p-3.5 rounded-md bg-danger-light text-danger mb-4">
                    {error}
                </div>
            )}

            {loading && (
                <div className="p-3.5 rounded-md bg-info-light text-info mb-4 flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-info" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing attendance... Please wait.
                </div>
            )}

            {distance !== null && (
                <div className={`p-3 rounded-lg mb-4 ${
                    distance <= GEOFENCE_RADIUS_METERS 
                        ? 'bg-success/10 text-success' 
                        : 'bg-warning/10 text-warning'
                }`}>
                    <div className="flex justify-between items-center">
                        <span>Your distance from office:</span>
                        <span className="font-bold">{formatDistance(distance)}</span>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                            className={`h-2.5 rounded-full ${
                                distance <= GEOFENCE_RADIUS_METERS ? 'bg-success' : 'bg-warning'
                            }`} 
                            style={{ width: `${Math.min(100, (distance / GEOFENCE_RADIUS_METERS) * 100)}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                        <span>0m</span>
                        <span className={distance <= GEOFENCE_RADIUS_METERS ? 'text-success font-bold' : 'text-warning font-bold'}>
                            {GEOFENCE_RADIUS_METERS}m (Limit)
                        </span>
                    </div>
                </div>
            )}

            {isCheckedIn && checkInTime && (
                <div className="mb-4 p-3 rounded-lg bg-info/10 text-info">
                    <p className="font-medium">You checked in today at:</p>
                    <p>{new Date(checkInTime).toLocaleString('id-ID', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false
                    })}</p>
                </div>
            )}

            <div className="flex flex-col items-center mb-6">
                <button
                    type="button"
                    className={`btn ${isCheckedIn ? 'btn-danger' : 'btn-primary'} w-full max-w-xs`}
                    onClick={() => {
                        if (location) {
                            submitAttendance(location.latitude, location.longitude);
                        } else {
                            getCurrentLocation();
                        }
                    }}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                        </>
                    ) : isCheckedIn ? (
                        'Check Out'
                    ) : (
                        'Check In'
                    )}
                </button>
                
                <p className="text-gray-500 text-sm mt-3 text-center">
                    {isCheckedIn 
                        ? 'Click to record your check-out time' 
                        : 'Click to record your check-in time. Make sure you are within the geofence area.'}
                </p>
            </div>

            {/* Attendance History */}
            <div className="panel">
                <div className="mb-5 flex items-center justify-between">
                    <h5 className="text-lg font-semibold">Recent Attendance</h5>
                    <div className="flex items-center gap-2">
                        <select 
                            className="form-select"
                            value={selectedMonth}
                            onChange={(e) => {
                                const newMonth = parseInt(e.target.value);
                                setSelectedMonth(newMonth);
                                loadAttendanceHistory(newMonth, selectedYear);
                            }}
                        >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(month => (
                                <option key={month} value={month}>{getMonthName(month)}</option>
                            ))}
                        </select>
                        <select 
                            className="form-select"
                            value={selectedYear}
                            onChange={(e) => {
                                const newYear = parseInt(e.target.value);
                                setSelectedYear(newYear);
                                loadAttendanceHistory(selectedMonth, newYear);
                            }}
                        >
                            {[2023, 2024, 2025, 2026].map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                        <button 
                            className="btn btn-primary"
                            onClick={() => exportToPDF(selectedMonth, selectedYear)}
                        >
                            Export PDF
                        </button>
                    </div>
                </div>
                
                {attendanceHistory.length > 0 ? (
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Check-in Time</th>
                                    <th>Check-out Time</th>
                                    <th>Status</th>
                                    <th>Keterangan</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendanceHistory.map((record) => (
                                    <tr key={record.id}>
                                        <td>{new Date(record.clockInTime).toLocaleDateString('id-ID', {
                                            year: 'numeric',
                                            month: '2-digit',
                                            day: '2-digit'
                                        })}</td>
                                        <td>{record.clockInTime ? new Date(record.clockInTime).toLocaleTimeString('id-ID', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            second: '2-digit',
                                            hour12: false
                                        }) : '-'}</td>
                                        <td>{record.clockOutTime ? new Date(record.clockOutTime).toLocaleTimeString('id-ID', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            second: '2-digit',
                                            hour12: false
                                        }) : '-'}</td>
                                        <td>
                                            <span className={`badge ${record.clockOutTime ? 'badge-outline-success' : 'badge-outline-warning'}`}>
                                                {record.clockOutTime ? 'Completed' : 'In Progress'}
                                            </span>
                                        </td>
                                        <td>
                                            {record.lateCheckinReason ? record.lateCheckinReason : 
                                             record.manualCheckinReason ? record.manualCheckinReason : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500">No attendance records found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AbsenceComponent;