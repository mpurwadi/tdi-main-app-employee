'use client';
import { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import Swal from 'sweetalert2';

const AttendanceWidget = () => {
    const qrCodeScannerRef = useRef<Html5QrcodeScanner | null>(null);
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [distance, setDistance] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(true);
    const [attendanceStatus, setAttendanceStatus] = useState<string | null>(null);
    const [locationConfig, setLocationConfig] = useState({
        officeLatitude: process.env.DASHBOARD_OFFICE_LATITUDE ? parseFloat(process.env.DASHBOARD_OFFICE_LATITUDE) : -6.200000, // Default fallback
        officeLongitude: process.env.DASHBOARD_OFFICE_LONGITUDE ? parseFloat(process.env.DASHBOARD_OFFICE_LONGITUDE) : 106.816666, // Default fallback
        geofenceRadiusMeters: process.env.DASHBOARD_GEOFENCE_RADIUS_METERS ? parseInt(process.env.DASHBOARD_GEOFENCE_RADIUS_METERS) : 100 // Default fallback
    });

    useEffect(() => {
        // Fetch location configuration from API
        const fetchLocationConfig = async () => {
            try {
                const response = await fetch('/api/config/location');
                if (response.ok) {
                    const config = await response.json();
                    setLocationConfig({
                        officeLatitude: config.dashboardOfficeLatitude,
                        officeLongitude: config.dashboardOfficeLongitude,
                        geofenceRadiusMeters: config.dashboardGeofenceRadiusMeters
                    });
                }
            } catch (error) {
                console.error('Failed to fetch location configuration:', error);
                // Keep default values if fetching fails
            }
        };

        fetchLocationConfig();
    }, []);

    useEffect(() => {
        // Initialize QR code scanner
        if (isScanning && !qrCodeScannerRef.current) {
            qrCodeScannerRef.current = new Html5QrcodeScanner(
                "qr-code-reader-widget",
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    disableFlip: false,
                },
                /* verbose= */ false
            );

            qrCodeScannerRef.current.render(onScanSuccess, onScanError);
        }

        return () => {
            if (qrCodeScannerRef.current) {
                qrCodeScannerRef.current.clear().catch(error => {
                    console.error("Failed to clear html5QrcodeScanner", error);
                });
                qrCodeScannerRef.current = null;
            }
        };
    }, [isScanning]);

    const onScanSuccess = (decodedText: string, decodedResult: any) => {
        // Handle the scanned QR code
        setScanResult(decodedText);
        setIsScanning(false);
        checkLocationAndSubmit(decodedText);
    };

    const onScanError = (errorMessage: string) => {
        // Handle scan errors
        console.warn(`QR Code Scan Error: ${errorMessage}`);
        // setError(`QR Scan Error: ${errorMessage}`); // Don't show too many transient errors
    };

    const startScanning = () => {
        setIsScanning(true);
        setScanResult(null);
        setError(null);
        setAttendanceStatus(null);
        setLocation(null);
        setDistance(null);
    };

    const checkLocationAndSubmit = (qrData: string) => {
        setLoading(true);
        setError(null);

        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser.');
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
                    locationConfig.officeLatitude,
                    locationConfig.officeLongitude
                );
                
                setDistance(calculatedDistance);

                if (calculatedDistance <= locationConfig.geofenceRadiusMeters) {
                    // Location is within geofence, proceed with attendance submission
                    await submitAttendance(qrData, latitude, longitude);
                } else {
                    setError(`You are ${calculatedDistance.toFixed(2)} meters away from the office. Must be within ${locationConfig.geofenceRadiusMeters} meters.`);
                    Swal.fire({
                        icon: 'error',
                        title: 'Location Error',
                        text: `You are ${calculatedDistance.toFixed(2)} meters away from the office. Must be within ${locationConfig.geofenceRadiusMeters} meters.`,
                        padding: '2em',
                        customClass: {
                            container: 'sweet-alerts'
                        },
                    });
                }
                setLoading(false);
            },
            (posError) => {
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
                setLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
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

    const submitAttendance = async (qrData: string, latitude: number, longitude: number) => {
        try {
            const response = await fetch('/api/attendance/check-in', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ qrData, latitude, longitude }),
            });

            const data = await response.json();

            if (response.ok) {
                setAttendanceStatus('success');
                Swal.fire({
                    icon: 'success',
                    title: 'Attendance Recorded!',
                    text: data.message || 'Your attendance has been successfully recorded.',
                    padding: '2em',
                    customClass: {
                        container: 'sweet-alerts'
                    },
                });
            } else {
                setAttendanceStatus('error');
                setError(data.message || 'Failed to record attendance.');
                Swal.fire({
                    icon: 'error',
                    title: 'Attendance Failed',
                    text: data.message || 'Failed to record attendance.',
                    padding: '2em',
                    customClass: {
                        container: 'sweet-alerts'
                    },
                });
            }
        } catch (err: any) {
            setAttendanceStatus('error');
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
            <h5 className="mb-5 text-lg font-semibold">Absensi Karyawan</h5>
            <p className="mb-4">Scan QR Code kantor dan pastikan Anda berada dalam radius 100 meter dari kantor.</p>
            
            {/* Geofencing information */}
            <div className="mb-4 p-3 rounded-lg bg-info/10 text-info">
                <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span>Office Location: {locationConfig.officeLatitude.toFixed(6)}, {locationConfig.officeLongitude.toFixed(6)}</span>
                </div>
                <div className="mt-1 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span>Geofence Radius: {locationConfig.geofenceRadiusMeters} meters</span>
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
                    distance <= locationConfig.geofenceRadiusMeters 
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
                                distance <= locationConfig.geofenceRadiusMeters ? 'bg-success' : 'bg-warning'
                            }`} 
                            style={{ width: `${Math.min(100, (distance / locationConfig.geofenceRadiusMeters) * 100)}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                        <span>0m</span>
                        <span className={distance <= locationConfig.geofenceRadiusMeters ? 'text-success font-bold' : 'text-warning font-bold'}>
                            {locationConfig.geofenceRadiusMeters}m (Limit)
                        </span>
                    </div>
                </div>
            )}

            {!scanResult ? (
                <div>
                    {isScanning ? (
                        <div>
                            <div id="qr-code-reader-widget" style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}></div>
                            <p className="text-center text-gray-500 mt-2">Point your camera at the QR code</p>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500 mb-4">Scanner is not active</p>
                            <button 
                                type="button" 
                                className="btn btn-primary"
                                onClick={startScanning}
                            >
                                Start QR Scanner
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center">
                    <div className="mb-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 text-success mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <p className="text-success text-lg font-bold">QR Code Scanned Successfully!</p>
                        <p className="text-sm text-gray-500 mt-1">Code: {scanResult}</p>
                    </div>
                    
                    {location && (
                        <div className="mb-4 p-3 rounded-lg bg-info/10 text-info">
                            <p className="font-medium">Your Location:</p>
                            <p>Latitude: {location.latitude.toFixed(6)}</p>
                            <p>Longitude: {location.longitude.toFixed(6)}</p>
                        </div>
                    )}
                    
                    {attendanceStatus === 'success' ? (
                        <div className="mt-4">
                            <button 
                                type="button" 
                                className="btn btn-primary"
                                onClick={startScanning}
                            >
                                Scan Another QR Code
                            </button>
                        </div>
                    ) : attendanceStatus === 'error' ? (
                        <div className="mt-4">
                            <button 
                                type="button" 
                                className="btn btn-primary"
                                onClick={startScanning}
                            >
                                Try Again
                            </button>
                        </div>
                    ) : (
                        <p className="mt-4">Checking location and submitting attendance...</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default AttendanceWidget;