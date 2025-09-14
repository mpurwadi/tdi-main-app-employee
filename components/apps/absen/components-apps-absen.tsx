'use client';
import { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';

const AbsenceComponent = () => {
    const router = useRouter();
    const qrCodeScannerRef = useRef<Html5QrcodeScanner | null>(null);
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [distance, setDistance] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(true);
    const [attendanceStatus, setAttendanceStatus] = useState<string | null>(null);
    const [isSecureContext, setIsSecureContext] = useState(true);
    const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt' | null>(null);
    const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt' | null>(null);
    const [showLocationInstructions, setShowLocationInstructions] = useState(false);
    const [useManualCheckIn, setUseManualCheckIn] = useState(false);
    const [officeCode, setOfficeCode] = useState('');

    // Office coordinates for geofencing (example - replace with actual office location)
    const OFFICE_LATITUDE = -6.200000; // Example: Jakarta
    const OFFICE_LONGITUDE = 106.816666; // Example: Jakarta
    const GEOFENCE_RADIUS_METERS = 100; // 100 meters
    const OFFICE_QR_CODE = 'TDI_OFFICE_QR_CODE'; // Static QR code for the office

    useEffect(() => {
        // Check if we're in a secure context or running on localhost
        // For localhost development, we allow camera access even on HTTP
        const isLocalhost = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1' || 
                           window.location.hostname.startsWith('192.168.') ||
                           window.location.hostname.startsWith('10.') ||
                           window.location.hostname.startsWith('172.');
        setIsSecureContext(window.isSecureContext || isLocalhost);
        
        // Check camera permission status
        if (navigator.permissions) {
            navigator.permissions.query({ name: 'camera' as PermissionName }).then((permissionStatus) => {
                setCameraPermission(permissionStatus.state);
                permissionStatus.onchange = () => {
                    setCameraPermission(permissionStatus.state);
                };
            }).catch((err) => {
                console.warn('Camera permission check failed:', err);
            });
            
            // Check location permission status
            navigator.permissions.query({ name: 'geolocation' as PermissionName }).then((permissionStatus) => {
                setLocationPermission(permissionStatus.state);
                permissionStatus.onchange = () => {
                    setLocationPermission(permissionStatus.state);
                };
            }).catch((err) => {
                console.warn('Location permission check failed:', err);
            });
        }

        // Initialize QR code scanner only in secure context or localhost
        const isLocalhost = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1' || 
                           window.location.hostname.startsWith('192.168.') ||
                           window.location.hostname.startsWith('10.') ||
                           window.location.hostname.startsWith('172.');
        
        if (!useManualCheckIn && (window.isSecureContext || isLocalhost) && isScanning && !qrCodeScannerRef.current) {
            initializeScanner();
        }

        return () => {
            if (qrCodeScannerRef.current) {
                qrCodeScannerRef.current.clear().catch(error => {
                    console.error("Failed to clear html5QrcodeScanner", error);
                });
                qrCodeScannerRef.current = null;
            }
        };
    }, [isScanning, useManualCheckIn]);

    const initializeScanner = () => {
        // For localhost development, we allow camera access even on HTTP
        const isLocalhost = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1' || 
                           window.location.hostname.startsWith('192.168.') ||
                           window.location.hostname.startsWith('10.') ||
                           window.location.hostname.startsWith('172.');
        
        if (!window.isSecureContext && !isLocalhost) {
            setError('Camera access requires a secure context (HTTPS or localhost). Please access this page via HTTPS or localhost.');
            setIsScanning(false);
            return;
        }

        qrCodeScannerRef.current = new Html5QrcodeScanner(
            "qr-code-reader-absence",
            {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                disableFlip: false,
            },
            /* verbose= */ false
        );

        qrCodeScannerRef.current.render(onScanSuccess, onScanError);
    };

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
        // For localhost development, we allow camera access even on HTTP
        const isLocalhost = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1' || 
                           window.location.hostname.startsWith('192.168.') ||
                           window.location.hostname.startsWith('10.') ||
                           window.location.hostname.startsWith('172.');
        
        if (!window.isSecureContext && !isLocalhost) {
            setError('Camera access requires a secure context (HTTPS or localhost). Please access this page via HTTPS or localhost.');
            return;
        }
        
        setUseManualCheckIn(false);
        setIsScanning(true);
        setScanResult(null);
        setError(null);
        setAttendanceStatus(null);
        setLocation(null);
        setDistance(null);
        setShowLocationInstructions(false);
        setOfficeCode('');
        
        // Reinitialize scanner if needed
        if (!qrCodeScannerRef.current) {
            initializeScanner();
        }
    };

    const toggleCheckInMethod = () => {
        setUseManualCheckIn(!useManualCheckIn);
        setScanResult(null);
        setError(null);
        setAttendanceStatus(null);
        setLocation(null);
        setDistance(null);
        setShowLocationInstructions(false);
        setOfficeCode('');
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

    const handleManualCheckIn = async () => {
        if (!officeCode.trim()) {
            setError('Please enter the office code');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/attendance/check-in', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    officeCode: officeCode.trim(),
                    checkInType: 'manual'
                }),
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
        } finally {
            setLoading(false);
        }
    };

    const checkLocationAndSubmit = (qrData: string) => {
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
                    // Location is within geofence, proceed with attendance submission
                    await submitAttendance(qrData, latitude, longitude);
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
            
            {/* Toggle check-in method */}
            <div className="mb-4 flex justify-center">
                <button 
                    type="button" 
                    className="btn btn-outline-primary"
                    onClick={toggleCheckInMethod}
                >
                    {useManualCheckIn ? 'Switch to QR Scan' : 'Switch to Manual Check-in'}
                </button>
            </div>
            
            {/* Security context warning */}
            {!isSecureContext && !useManualCheckIn && (
                <div className="mb-4 p-3 rounded-lg bg-warning/10 text-warning">
                    <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span><strong>Secure Context Required:</strong> Camera access requires a secure context (HTTPS or localhost)</span>
                    </div>
                    <div className="mt-2">
                        <p>Please access this application via:</p>
                        <ul className="list-disc pl-5 mt-1">
                            <li><code>https://</code> protocol (not <code>http://</code>)</li>
                            <li>or <code>localhost</code> for local development (camera access is allowed on HTTP for localhost)</li>
                        </ul>
                    </div>
                </div>
            )}

            {/* Manual Check-in Form */}
            {useManualCheckIn && (
                <div className="mb-6 panel">
                    <h3 className="text-lg font-bold mb-4">Manual Check-in</h3>
                    <p className="mb-4">Enter the office code to check in without location detection or QR scanning.</p>
                    
                    <div className="mb-4">
                        <label htmlFor="officeCode" className="block text-sm font-medium mb-1">Office Code</label>
                        <input
                            type="text"
                            id="officeCode"
                            className="form-input"
                            value={officeCode}
                            onChange={(e) => setOfficeCode(e.target.value)}
                            placeholder="Enter office code"
                        />
                        <p className="text-sm text-gray-500 mt-1">Office code: {OFFICE_QR_CODE}</p>
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
                    
                    <div className="flex justify-end">
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleManualCheckIn}
                            disabled={loading}
                        >
                            {loading ? 'Checking In...' : 'Check In'}
                        </button>
                    </div>
                </div>
            )}

            {/* Location permission instructions */}
            {showLocationInstructions && !useManualCheckIn && (
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

            {error && !useManualCheckIn && (
                <div className="p-3.5 rounded-md bg-danger-light text-danger mb-4">
                    {error}
                </div>
            )}

            {loading && !useManualCheckIn && (
                <div className="p-3.5 rounded-md bg-info-light text-info mb-4 flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-info" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing attendance... Please wait.
                </div>
            )}

            {distance !== null && !useManualCheckIn && (
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

            {!useManualCheckIn && (
                <>
                    {!scanResult ? (
                        <div>
                            {isScanning ? (
                                <div>
                                    {isSecureContext ? (
                                        <>
                                            <div id="qr-code-reader-absence" style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}></div>
                                            <p className="text-center text-gray-500 mt-2">Point your camera at the QR code</p>
                                        </>
                                    ) : (
                                        <div className="text-center py-8">
                                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-warning/10 text-warning mb-3">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <p className="text-warning text-lg font-bold">Secure Context Required</p>
                                            <p className="text-gray-500 mt-2">Camera access is only available in secure contexts (HTTPS or localhost)</p>
                                            <button 
                                                type="button" 
                                                className="btn btn-primary mt-4"
                                                onClick={() => window.location.reload()}
                                            >
                                                Refresh Page
                                            </button>
                                        </div>
                                    )}
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
                </>
            )}

            {useManualCheckIn && attendanceStatus === 'success' && (
                <div className="text-center mt-6">
                    <div className="mb-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 text-success mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <p className="text-success text-lg font-bold">Manual Check-in Successful!</p>
                    </div>
                    <button 
                        type="button" 
                        className="btn btn-primary"
                        onClick={toggleCheckInMethod}
                    >
                        Back to QR Scan
                    </button>
                </div>
            )}

            {useManualCheckIn && attendanceStatus === 'error' && (
                <div className="text-center mt-6">
                    <button 
                        type="button" 
                        className="btn btn-primary"
                        onClick={() => {
                            setAttendanceStatus(null);
                            setError(null);
                        }}
                    >
                        Try Again
                    </button>
                </div>
            )}
        </div>
    );
};

export default AbsenceComponent;