import { useEffect, useState } from 'react';
import { Navigation } from 'lucide-react';
import API_URL from '../config';

const LocationTracker = ({ jobId, isActive = true }) => {
    const [tracking, setTracking] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!jobId || !isActive) return;

        let watchId = null;

        const startTracking = () => {
            if (!navigator.geolocation) {
                setError('Geolocation is not supported by your browser');
                return;
            }

            setTracking(true);
            setError(null);

            // Watch position with high accuracy
            watchId = navigator.geolocation.watchPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;

                    try {
                        // Send location to server
                        const res = await fetch(`${API_URL}/api/jobs/${jobId}/location`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ latitude, longitude })
                        });

                        if (res.ok) {
                            setLastUpdate(new Date());
                            setError(null);
                        } else {
                            throw new Error('Failed to update location');
                        }
                    } catch (err) {
                        console.error('Location update failed:', err);
                        setError('Failed to update location');
                    }
                },
                (err) => {
                    console.error('Geolocation error:', err);
                    setError(err.message);
                    setTracking(false);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                }
            );
        };

        startTracking();

        return () => {
            if (watchId !== null) {
                navigator.geolocation.clearWatch(watchId);
            }
            setTracking(false);
        };
    }, [jobId, isActive]);

    if (!isActive) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '1rem',
            left: '50%',
            transform: 'translateX(-50%)',
            background: tracking ? 'rgba(16, 185, 129, 0.95)' : 'rgba(239, 68, 68, 0.95)',
            backdropFilter: 'blur(10px)',
            padding: '0.75rem 1.5rem',
            borderRadius: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            zIndex: 1000,
            color: 'white',
            fontSize: '0.85rem',
            fontWeight: 700
        }}>
            <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'white',
                animation: tracking ? 'pulse 2s infinite' : 'none'
            }} />
            <Navigation size={16} />
            {tracking ? (
                <span>
                    Live Tracking Active
                    {lastUpdate && (
                        <span style={{ fontSize: '0.7rem', opacity: 0.8, marginLeft: '0.5rem' }}>
                            • Updated {Math.floor((new Date() - lastUpdate) / 1000)}s ago
                        </span>
                    )}
                </span>
            ) : (
                <span>{error || 'Location tracking disabled'}</span>
            )}
        </div>
    );
};

export default LocationTracker;
