'use client';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const RemoteCheckin = () => {
    const { t } = useTranslation();
    const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);
    const [workLocation, setWorkLocation] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [showMap, setShowMap] = useState(false);
    const [selectedHistoryMap, setSelectedHistoryMap] = useState<any | null>(null);

    // Get user's location
    const getLocation = () => {
        if (!navigator.geolocation) {
            setMessage({ text: 'Geolocation is not supported by your browser', type: 'error' });
            return;
        }

        setMessage({ text: 'Requesting location permission...', type: 'success' });

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLatitude(position.coords.latitude);
                setLongitude(position.coords.longitude);
                setMessage({ text: 'Location retrieved successfully!', type: 'success' });
            },
            (error) => {
                let errorMessage = '';
                switch (error.code) {
                    case 1: // PERMISSION_DENIED
                        errorMessage = 'Location access denied. Please enable location permissions in your browser settings.';
                        break;
                    case 2: // POSITION_UNAVAILABLE
                        errorMessage = 'Location information is unavailable.';
                        break;
                    case 3: // TIMEOUT
                        errorMessage = 'The request to get user location timed out.';
                        break;
                    default:
                        errorMessage = `An unknown error occurred: ${error.message}`;
                        break;
                }
                setMessage({ text: errorMessage, type: 'error' });
                console.error('Geolocation error:', error);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    // Handle check-in
    const handleCheckin = async () => {
        if (!latitude || !longitude) {
            setMessage({ text: 'Please get your location first', type: 'error' });
            return;
        }

        setLoading(true);
        setMessage({ text: 'Checking in...', type: 'success' });

        try {
            const response = await fetch('/api/remote/check-in', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    latitude,
                    longitude,
                    workLocation
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ text: data.message, type: 'success' });
                // Refresh history after successful check-in
                fetchHistory();
                // Clear location so user must get it again for next check-in
                setLatitude(null);
                setLongitude(null);
            } else {
                setMessage({ text: data.message || 'Check-in failed', type: 'error' });
            }
        } catch (error) {
            setMessage({ text: 'Network error occurred', type: 'error' });
            console.error('Check-in error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch check-in history
    const fetchHistory = async () => {
        setHistoryLoading(true);
        try {
            const response = await fetch('/api/remote/history');
            const data = await response.json();

            if (response.ok) {
                setHistory(data.records);
            } else {
                setMessage({ text: 'Failed to fetch history', type: 'error' });
            }
        } catch (error) {
            setMessage({ text: 'Network error occurred while fetching history', type: 'error' });
        } finally {
            setHistoryLoading(false);
        }
    };

    // Format date for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    // Format coordinates for display
    const formatCoordinates = (lat: number | string, lng: number | string) => {
        const latNum = typeof lat === 'number' ? lat : parseFloat(lat);
        const lngNum = typeof lng === 'number' ? lng : parseFloat(lng);
        return `${latNum.toFixed(6)}, ${lngNum.toFixed(6)}`;
    };

    // Initialize
    useEffect(() => {
        // Don't automatically request location on page load
        // User must explicitly click the "Get Location" button
        fetchHistory();
    }, []);

    return (
        <div>
            <div className="flex items-center justify-between mb-5">
                <h5 className="font-semibold text-lg">{t('Remote Check-in')}</h5>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                {/* Check-in Card */}
                <div className="panel">
                    <div className="flex items-center justify-between mb-5">
                        <h5 className="font-semibold text-lg">{t('Check-in for Remote Work')}</h5>
                    </div>
                    <div className="mb-5">
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">{t('Your Location')}</label>
                            <div className="flex space-x-2">
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={getLocation}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span className="flex items-center">
                                            <span className="mr-2 animate-spin border-2 border-white border-l-transparent rounded-full w-4 h-4"></span>
                                            {t('Getting Location...')}
                                        </span>
                                    ) : (
                                        t('Get Location')
                                    )}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={getLocation}
                                    disabled={loading}
                                >
                                    {t('Refresh Location')}
                                </button>
                            </div>
                        </div>

                        {latitude !== null && longitude !== null && (
                            <div className="mb-4 p-3 bg-gray-100 rounded">
                                <p className="text-sm">
                                    <strong>{t('Latitude')}:</strong> {latitude.toFixed(6)}
                                </p>
                                <p className="text-sm">
                                    <strong>{t('Longitude')}:</strong> {longitude.toFixed(6)}
                                </p>
                            </div>
                        )}

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">{t('Work Location')}</label>
                            <input
                                type="text"
                                placeholder={t('e.g., Home Office, Co-working Space')}
                                className="form-input"
                                value={workLocation}
                                onChange={(e) => setWorkLocation(e.target.value)}
                            />
                        </div>

                        <button
                            type="button"
                            className="btn btn-success w-full"
                            onClick={handleCheckin}
                            disabled={loading || !latitude || !longitude}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <span className="mr-2 animate-spin border-2 border-white border-l-transparent rounded-full w-4 h-4"></span>
                                    {t('Checking in...')}
                                </span>
                            ) : (
                                t('Check-in for Remote Work')
                            )}
                        </button>
                    </div>
                </div>

                {/* History Card */}
                <div className="panel">
                    <div className="flex items-center justify-between mb-5">
                        <h5 className="font-semibold text-lg">{t('Check-in History')}</h5>
                    </div>
                    <div className="table-responsive">
                        {historyLoading ? (
                            <div className="flex justify-center items-center h-40">
                                <span className="animate-spin border-2 border-black border-l-transparent rounded-full w-6 h-6"></span>
                            </div>
                        ) : history.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500">{t('No check-in history found')}</p>
                            </div>
                        ) : (
                            <table className="table table-hover whitespace-nowrap">
                                <thead>
                                    <tr>
                                        <th>{t('Date')}</th>
                                        <th>{t('Location')}</th>
                                        <th>{t('Coordinates')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map((record) => (
                                        <tr key={record.id}>
                                            <td>{formatDate(record.checkinTime)}</td>
                                            <td>{record.workLocation}</td>
                                            <td>
                                                {formatCoordinates(record.latitude, record.longitude)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                    {history.length > 0 && (
                        <div className="mt-4 flex justify-end">
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={fetchHistory}
                                disabled={historyLoading}
                            >
                                {historyLoading ? t('Refreshing...') : t('Refresh History')}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Message Display */}
            {message && (
                <div
                    className={`mt-5 p-4 rounded ${
                        message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                >
                    {message.text}
                </div>
            )}

            {/* Info Section */}
            <div className="panel mt-6">
                <div className="flex items-center justify-between mb-5">
                    <h5 className="font-semibold text-lg">{t('Remote Work Information')}</h5>
                </div>
                <div className="prose max-w-full">
                    <p>{t('Remember to check in for remote work each day to track your work location.')}</p>
                    <ul>
                        <li>{t('Your location is used only for verification purposes')}</li>
                        <li>{t('You can only check in once per day')}</li>
                        <li>{t('Make sure you have a stable internet connection when checking in')}</li>
                    </ul>
                </div>
            </div>

            <style jsx>{`
                .leaflet-container {
                    height: 100%;
                    width: 100%;
                }
            `}</style>
        </div>
    );
};

export default RemoteCheckin;