'use client';
import { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import Swal from 'sweetalert2';

const AttendanceWidget = () => {
    const qrCodeScannerRef = useRef<Html5QrcodeScanner | null>(null);
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Office coordinates for geofencing (example - replace with actual office location)
    const OFFICE_LATITUDE = -6.200000; // Example: Jakarta
    const OFFICE_LONGITUDE = 106.816666; // Example: Jakarta
    const GEOFENCE_RADIUS_METERS = 100; // 100 meters

    useEffect(() => {
        // Initialize QR code scanner
        if (!qrCodeScannerRef.current) {
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
            }
        };
    }, []);

    const onScanSuccess = (decodedText: string, decodedResult: any) => {
        // Handle the scanned QR code
        setScanResult(decodedText);
        qrCodeScannerRef.current?.clear(); // Stop scanning after success
        checkLocationAndSubmit(decodedText);
    };

    const onScanError = (errorMessage: string) => {
        // Handle scan errors
        console.warn(`QR Code Scan Error: ${errorMessage}`);
        // setError(`QR Scan Error: ${errorMessage}`); // Don't show too many transient errors
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

                const distance = calculateDistance(
                    latitude,
                    longitude,
                    OFFICE_LATITUDE,
                    OFFICE_LONGITUDE
                );

                if (distance <= GEOFENCE_RADIUS_METERS) {
                    // Location is within geofence, proceed with attendance submission
                    await submitAttendance(qrData, latitude, longitude);
                } else {
                    setError(`You are ${distance.toFixed(2)} meters away from the office. Must be within ${GEOFENCE_RADIUS_METERS} meters.`);
                    Swal.fire({
                        icon: 'error',
                        title: 'Location Error',
                        text: `You are ${distance.toFixed(2)} meters away from the office. Must be within ${GEOFENCE_RADIUS_METERS} meters.`,
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
                Swal.fire({
                    icon: 'success',
                    title: 'Attendance Recorded!',
                    text: data.message || 'Your attendance has been successfully recorded.',
                    padding: '2em',
                    customClass: {
                        container: 'sweet-alerts'
                    },
                });
                // Optionally redirect or update UI
            } else {
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

    return (
        <div className="panel">
            <h5 className="mb-5 text-lg font-semibold">Absensi Karyawan</h5>
            <p className="mb-4">Scan QR Code kantor dan pastikan Anda berada dalam radius 100 meter dari kantor.</p>

            {error && (
                <div className="p-3.5 rounded-md bg-danger-light text-danger mb-4">
                    {error}
                </div>
            )}

            {loading && (
                <div className="p-3.5 rounded-md bg-info-light text-info mb-4">
                    Processing... Please wait.
                </div>
            )}

            {!scanResult ? (
                <div id="qr-code-reader-widget" style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}></div>
            ) : (
                <div>
                    <p className="text-success text-lg font-bold">QR Code Scanned: {scanResult}</p>
                    {location && (
                        <p className="text-info">Your Location: Latitude {location.latitude.toFixed(6)}, Longitude {location.longitude.toFixed(6)}</p>
                    )}
                    <p className="mt-4">Checking location and submitting attendance...</p>
                </div>
            )}
        </div>
    );
};

export default AttendanceWidget;