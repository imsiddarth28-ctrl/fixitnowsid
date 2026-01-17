import { useEffect, useState } from 'react';
import { Navigation, Home, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { subscribeToEvent } from '../socket';
import API_URL from '../config';

const LiveMap = ({ role, jobId, initialLocation, customerLocation, mode = 'track', onLocationSelect }) => {
    const [techPos, setTechPos] = useState(initialLocation || { x: 25, y: 35 });
    const [customerPos, setCustomerPos] = useState(customerLocation || { x: 75, y: 65 });

    useEffect(() => {
        if (role === 'technician' && mode === 'track') {
            const interval = setInterval(() => {
                setTechPos((prev) => {
                    const dx = customerPos.x - prev.x;
                    const dy = customerPos.y - prev.y;
                    if (Math.abs(dx) < 2 && Math.abs(dy) < 2) return prev;
                    const newPos = {
                        x: prev.x + dx * 0.05,
                        y: prev.y + dy * 0.05
                    };

                    // Update via REST API
                    fetch(`${API_URL}/api/jobs/${jobId}/location`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ location: newPos })
                    }).catch(err => console.error('Loc update error:', err));

                    return newPos;
                });
            }, 1000);
            return () => clearInterval(interval);
        } else if (mode === 'track') {
            const unsubscribe = subscribeToEvent(`job-${jobId}`, 'technician_location_update', (data) => {
                setTechPos(data.location);
            });
            return () => unsubscribe();
        }
    }, [role, jobId, customerPos, mode]);

    const handleMapClick = (e) => {
        if (mode === 'select') {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            const newPos = { x, y };
            setCustomerPos(newPos);
            if (onLocationSelect) onLocationSelect(newPos);
        }
    };

    return (
        <div
            className="map-container"
            onClick={handleMapClick}
            style={{
                width: '100%',
                height: '100%',
                cursor: mode === 'select' ? 'crosshair' : 'default',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Map Background with Grid */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: '#0a0a10',
                backgroundImage: `
                    linear-gradient(rgba(59, 130, 246, 0.05) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(59, 130, 246, 0.05) 1px, transparent 1px)
                `,
                backgroundSize: '30px 30px'
            }}>
                {/* Moving Scanline */}
                <motion.div
                    animate={{ y: ['0%', '1000%'] }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '2px',
                        background: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.2), transparent)',
                        boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)',
                        zIndex: 1,
                        pointerEvents: 'none'
                    }}
                />

                {/* Technical Coordinates Display */}
                <div style={{
                    position: 'absolute',
                    bottom: '1rem',
                    right: '1rem',
                    fontFamily: 'monospace',
                    fontSize: '0.65rem',
                    color: 'rgba(59, 130, 246, 0.4)',
                    textAlign: 'right',
                    pointerEvents: 'none',
                    zIndex: 2
                }}>
                    LAT: {techPos.x.toFixed(4)}<br />
                    LNG: {techPos.y.toFixed(4)}<br />
                    FRAME: {Math.floor(Date.now() / 100).toString().slice(-6)}
                </div>
            </div>

            {/* Selection Guide */}
            {mode === 'select' && (
                <div style={{
                    position: 'absolute',
                    top: '1rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(59, 130, 246, 0.9)',
                    color: 'white',
                    padding: '0.5rem 1.5rem',
                    borderRadius: '100px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    zIndex: 100,
                    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
                    pointerEvents: 'none',
                    letterSpacing: '0.05em'
                }}>
                    TAP TO SET SERVICE LOCATION
                </div>
            )}

            {/* Glowing path */}
            {mode === 'track' && (
                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                    <defs>
                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>
                    <line
                        x1={`${techPos.x}%`} y1={`${techPos.y}%`}
                        x2={`${customerPos.x}%`} y2={`${customerPos.y}%`}
                        stroke="white"
                        strokeWidth="1.5"
                        strokeDasharray="8,8"
                        opacity="0.2"
                    />
                    <circle cx={`${techPos.x}%`} cy={`${techPos.y}%`} r="30" fill="url(#radialGlow)" opacity="0.1" />
                    <radialGradient id="radialGlow">
                        <stop offset="0%" stopColor="white" />
                        <stop offset="100%" stopColor="transparent" />
                    </radialGradient>
                </svg>
            )}

            {/* Controls Overlay */}
            <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{
                    background: 'rgba(0,0,0,0.8)',
                    padding: '0.5rem 1rem',
                    borderRadius: '100px',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    <div className="status-pulse" style={{ color: mode === 'select' ? '#3b82f6' : '#10b981' }}></div>
                    <span style={{ color: 'white', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px' }}>
                        {mode === 'select' ? 'CALIBRATION MODE' : 'SYSTEM CALIBRATED'}
                    </span>
                </div>
            </div>

            {/* Technician Marker */}
            {mode === 'track' && (
                <div style={{
                    position: 'absolute',
                    left: `${techPos.x}%`,
                    top: `${techPos.y}%`,
                    transform: 'translate(-50%, -50%)',
                    transition: 'all 1s linear',
                    zIndex: 20
                }}>
                    <div style={{ position: 'relative' }}>
                        <div className="marker-ping"></div>
                        <div style={{
                            background: 'white',
                            color: 'black',
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 0 20px rgba(255,255,255,0.4)'
                        }}>
                            <Navigation size={20} fill="black" />
                        </div>
                    </div>
                </div>
            )}

            {/* Customer Marker */}
            <div style={{
                position: 'absolute',
                left: `${customerPos.x}%`,
                top: `${customerPos.y}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: 30,
                transition: mode === 'select' ? 'all 0.2s ease-out' : 'none'
            }}>
                <div style={{
                    background: mode === 'select' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                    padding: '8px',
                    borderRadius: '50%',
                    border: `2px solid ${mode === 'select' ? '#3b82f6' : '#10b981'}`,
                    boxShadow: `0 0 20px ${mode === 'select' ? 'rgba(59, 130, 246, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {mode === 'select' ? (
                        <MapPin size={24} color="#3b82f6" fill="#3b82f6" />
                    ) : (
                        <Home size={24} color="#10b981" fill="#10b981" />
                    )}
                </div>
            </div>

            <style>{`
                .marker-ping {
                    position: absolute;
                    inset: -10px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.2);
                    animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
                }
                @keyframes ping {
                    75%, 100% {
                        transform: scale(2);
                        opacity: 0;
                    }
                }
                .status-pulse {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: currentColor;
                    animation: pulse 2s infinite;
                }
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.5); opacity: 0.5; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default LiveMap;

