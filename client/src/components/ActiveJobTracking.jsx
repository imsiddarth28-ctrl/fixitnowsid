import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, MapPin, Clock, Phone, MessageSquare, CheckCircle2, AlertCircle, X, ShieldAlert } from 'lucide-react';
import ServiceReceipt from './ServiceReceipt';
import Chat from './Chat';
import API_URL from '../config';

const ActiveJobTracking = ({ job, user, onStatusUpdate }) => {
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [showReceipt, setShowReceipt] = useState(false);
    const [showChat, setShowChat] = useState(false);

    useEffect(() => {
        if (!job || job.status === 'completed') return;
        const startTime = new Date(job.updatedAt || job.createdAt).getTime();
        const interval = setInterval(() => {
            setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, [job]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (!job) return null;

    const isReached = ['arrived', 'in_progress', 'completed'].includes(job.status);

    const updateStatus = async (newStatus) => {
        try {
            const res = await fetch(`${API_URL}/api/jobs/${job._id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            const updatedJob = await res.json();
            onStatusUpdate(updatedJob);
            if (newStatus === 'completed') {
                setShowReceipt(true);
            }
        } catch (err) {
            console.error('Error updating status:', err);
        }
    };

    return (
        <>
            <div style={{
                height: 'calc(100vh - 80px)',
                display: 'flex',
                flexDirection: 'column',
                background: 'var(--bg)',
                overflow: 'hidden',
                position: 'relative'
            }}>
                {/* Map Background */}
                <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                    {/* Map Replacement Placeholder */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'radial-gradient(circle at center, #111 0%, #000 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexDirection: 'column', gap: '1rem'
                    }}>
                        <div style={{ opacity: 0.1 }}>
                            <ShieldAlert size={120} />
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.2em' }}>
                            SECURE TRACKING LAYER ACTIVE
                        </div>
                    </div>

                    {/* Floating Info Overlay */}
                    <motion.div
                        initial={{ x: -100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        style={{
                            position: 'absolute',
                            top: '2rem',
                            left: '2rem',
                            width: '320px',
                            background: 'rgba(var(--card-rgb), 0.8)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid var(--border)',
                            borderRadius: '1.5rem',
                            padding: '1.5rem',
                            zIndex: 100,
                            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{
                                width: '48px', height: '48px', borderRadius: '1rem',
                                background: 'var(--text)', color: 'var(--bg)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Navigation size={24} />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>Current Mission</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{job.serviceType}</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                <MapPin size={16} color="var(--text-muted)" />
                                <span style={{ fontSize: '0.85rem', color: 'var(--text)' }}>{job.location?.address || 'Customer Location'}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                <Clock size={16} color="var(--text-muted)" />
                                <span style={{ fontSize: '0.85rem', color: 'var(--text)', fontFamily: 'monospace' }}>
                                    DURATION: {formatTime(elapsedSeconds)}
                                </span>
                            </div>
                        </div>

                        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--border)' }}></div>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{job.customerId?.name || 'Customer'}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid var(--border)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)' }}>
                                        <Phone size={16} />
                                    </button>
                                    <button style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid var(--border)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)' }}>
                                        <MessageSquare size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Status Progress Bar */}
                    <div style={{
                        position: 'absolute',
                        top: '2rem',
                        right: '2rem',
                        left: '360px',
                        display: 'flex',
                        gap: '1rem',
                        zIndex: 100
                    }}>
                        {['accepted', 'arrived', 'in_progress', 'completed'].map((status, idx) => {
                            const statuses = ['accepted', 'arrived', 'in_progress', 'completed'];
                            const currentIndex = statuses.indexOf(job.status);
                            const isPast = idx < currentIndex;
                            const isCurrent = idx === currentIndex;

                            return (
                                <div key={status} style={{ flex: 1, position: 'relative' }}>
                                    <div style={{
                                        height: '4px',
                                        background: isPast || isCurrent ? '#22c55e' : 'rgba(255,255,255,0.1)',
                                        borderRadius: '2px',
                                        transition: 'all 0.5s ease'
                                    }}></div>
                                    <div style={{
                                        marginTop: '0.5rem',
                                        fontSize: '0.65rem',
                                        fontWeight: 800,
                                        color: isCurrent ? 'white' : 'var(--text-muted)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.1em'
                                    }}>
                                        {status.replace('_', ' ')}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div >

                {/* Bottom Controls */}
                < motion.div
                    initial={{ y: 100 }}
                    animate={{ y: 0 }}
                    style={{
                        padding: '2rem 4rem',
                        background: 'var(--card)',
                        borderTop: '1px solid var(--border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        zIndex: 200
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800 }}>CURRENT STATUS</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6' }}></div>
                                <span style={{ fontSize: '1.2rem', fontWeight: 800, textTransform: 'uppercase' }}>{job.status.replace('_', ' ')}</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                        {user.role === 'technician' ? (
                            <>
                                {!isReached ? (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => updateStatus('arrived')}
                                        style={{
                                            padding: '1rem 2.5rem',
                                            borderRadius: '1rem',
                                            background: 'white',
                                            color: 'black',
                                            border: 'none',
                                            fontWeight: 800,
                                            cursor: 'pointer',
                                            fontSize: '1rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.8rem',
                                            boxShadow: '0 10px 20px rgba(255,255,255,0.1)'
                                        }}
                                    >
                                        <CheckCircle2 size={20} />
                                        SIGNAL ARRIVAL
                                    </motion.button>
                                ) : job.status === 'arrived' ? (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => updateStatus('in_progress')}
                                        style={{
                                            padding: '1rem 2.5rem',
                                            borderRadius: '1rem',
                                            background: 'var(--text)',
                                            color: 'var(--bg)',
                                            border: 'none',
                                            fontWeight: 800,
                                            cursor: 'pointer',
                                            fontSize: '1rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.8rem'
                                        }}
                                    >
                                        <Navigation size={20} />
                                        COMMENCE WORK
                                    </motion.button>
                                ) : job.status === 'in_progress' ? (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => updateStatus('completed')}
                                        style={{
                                            padding: '1rem 2.5rem',
                                            borderRadius: '1rem',
                                            background: '#22c55e',
                                            color: 'white',
                                            border: 'none',
                                            fontWeight: 800,
                                            cursor: 'pointer',
                                            fontSize: '1rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.8rem'
                                        }}
                                    >
                                        <CheckCircle2 size={20} />
                                        COMPLETE MISSION
                                    </motion.button>
                                ) : (
                                    <div style={{ color: '#22c55e', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <CheckCircle2 size={24} /> MISSION ACCOMPLISHED
                                    </div>
                                )}
                            </>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                {job.status === 'arrived' ? (
                                    <motion.div
                                        animate={{ scale: [1, 1.05, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        style={{
                                            background: 'rgba(59, 130, 246, 0.1)',
                                            padding: '0.8rem 1.5rem',
                                            borderRadius: '0.8rem',
                                            border: '1px solid #3b82f6',
                                            color: '#3b82f6',
                                            fontWeight: 900,
                                            fontSize: '0.85rem',
                                            letterSpacing: '0.1em'
                                        }}
                                    >
                                        🛰️ PROXIMITY ALERT: PRO IS AT LOCATION
                                    </motion.div>
                                ) : job.status === 'completed' ? (
                                    <div style={{ color: '#22c55e', fontWeight: 900, fontSize: '0.9rem' }}>MISSION COMPLETE. CHECK BOOKING HISTORY FOR RECEIPT.</div>
                                ) : (
                                    <div style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.85rem' }}>
                                        SECURE NEURAL LINK ESTABLISHED. TRACKING PRO...
                                    </div>
                                )}
                            </div>
                        )}

                        <button style={{
                            padding: '1rem 2rem',
                            borderRadius: '1rem',
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: '#ef4444',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.8rem'
                        }}>
                            <AlertCircle size={20} />
                            SOS / HELP
                        </button>

                        <button
                            onClick={() => setShowChat(!showChat)}
                            style={{
                                padding: '1rem 2rem',
                                borderRadius: '1rem',
                                background: showChat ? 'var(--text)' : 'rgba(255, 255, 255, 0.05)',
                                color: showChat ? 'var(--bg)' : 'var(--text)',
                                border: '1px solid var(--border)',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.8rem',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <MessageSquare size={20} />
                            CHAT WITH CLIENT
                        </button>
                    </div>
                </motion.div>
            </div>

            <AnimatePresence>
                {showChat && (
                    <motion.div
                        initial={{ x: 400, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 400, opacity: 0 }}
                        style={{
                            position: 'fixed',
                            top: '100px',
                            right: '25px',
                            bottom: '120px',
                            width: '400px',
                            zIndex: 1000,
                            background: 'var(--card)',
                            borderRadius: '1.5rem',
                            border: '1px solid var(--border)',
                            boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden'
                        }}
                    >
                        <div style={{
                            padding: '1rem 1.5rem',
                            borderBottom: '1px solid var(--border)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'rgba(255,255,255,0.03)'
                        }}>
                            <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>SECURE CHANNEL: {job.customerId?.name?.toUpperCase()}</div>
                            <button
                                onClick={() => setShowChat(false)}
                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <Chat
                                jobId={job._id}
                                receiverId={user.role === 'customer' ? job.technicianId : job.customerId}
                                onClose={() => setShowChat(false)}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <AnimatePresence>
                {showReceipt && (
                    <ServiceReceipt
                        job={job}
                        onClose={() => setShowReceipt(false)}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

export default ActiveJobTracking;
