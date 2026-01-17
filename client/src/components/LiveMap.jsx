
import { useEffect, useState } from 'react';
import { Navigation, Home } from 'lucide-react';

const LiveMap = ({ role, socket, jobId, initialLocation }) => {
    const [techPos, setTechPos] = useState(initialLocation || { x: 25, y: 35 });
    const [customerPos] = useState({ x: 75, y: 65 });

    useEffect(() => {
        if (role === 'technician') {
            const interval = setInterval(() => {
                setTechPos((prev) => {
                    const dx = customerPos.x - prev.x;
                    const dy = customerPos.y - prev.y;
                    if (Math.abs(dx) < 2 && Math.abs(dy) < 2) return prev;
                    const newPos = {
                        x: prev.x + dx * 0.05,
                        y: prev.y + dy * 0.05
                    };
                    if (socket) socket.emit('update_location', { jobId, location: newPos });
                    return newPos;
                });
            }, 1000);
            return () => clearInterval(interval);
        } else if (socket) {
            const handleLocationUpdate = (data) => {
                setTechPos(data.location);
            };
            socket.on('technician_location_update', handleLocationUpdate);
            return () => socket.off('technician_location_update', handleLocationUpdate);
        }
    }, [role, jobId, socket, customerPos]);

    return (
        <div className="map-container" style={{ width: '100%', height: '100%' }}>
            {/* Map Background with Grid */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: '#0a0a10',
                backgroundImage: `
                    linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px'
            }}></div>

            {/* Glowing path */}
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
                    <div className="status-pulse" style={{ color: '#10b981' }}></div>
                    <span style={{ color: 'white', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px' }}>SYSTEM CALIBRATED</span>
                </div>
            </div>

            {/* Technician Marker */}
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
                    <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        marginTop: '0.5rem',
                        background: 'rgba(0,0,0,0.8)',
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        whiteSpace: 'nowrap',
                        fontWeight: 700,
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        TECH-042
                    </div>
                </div>
            </div>

            {/* Customer Marker */}
            <div style={{
                position: 'absolute',
                left: `${customerPos.x}%`,
                top: `${customerPos.y}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: 20
            }}>
                <div style={{
                    background: 'rgba(16, 185, 129, 0.2)',
                    padding: '8px',
                    borderRadius: '50%',
                    border: '2px solid #10b981',
                    boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)'
                }}>
                    <Home size={24} color="#10b981" fill="#10b981" />
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
            `}</style>
        </div>
    );
};

export default LiveMap;

