import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, MapPin, Clock, Phone, MessageSquare, CheckCircle2, AlertCircle, X, ShieldAlert, ArrowLeft } from 'lucide-react';
import ServiceReceipt from './ServiceReceipt';
import Chat from './Chat';
import GoogleMap from './GoogleMap';
import LocationTracker from './LocationTracker';
import CancelJobModal from './CancelJobModal';
import API_URL from '../config';

const ActiveJobTracking = ({ job, user, onStatusUpdate, onBack }) => {
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [showReceipt, setShowReceipt] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);

    useEffect(() => {
        if (job) {
            const start = new Date(job.createdAt).getTime();
            const update = () => {
                const now = new Date().getTime();
                setElapsedSeconds(Math.floor((now - start) / 1000));
            };
            update();
            const timer = setInterval(update, 1000);
            return () => clearInterval(timer);
        }
    }, [job]);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? h + ':' : ''}${m < 10 && h > 0 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const isReached = ['arrived', 'in_progress', 'completed'].includes(job.status);

    const updateStatus = async (newStatus) => {
        const originalJob = { ...job };
        onStatusUpdate({ ...job, status: newStatus });

        if (newStatus === 'completed') {
            setShowReceipt(true);
        }

        try {
            const res = await fetch(`${API_URL}/api/jobs/${job._id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || errorData.message || 'Mission Sync Failure');
            }

            const updatedJob = await res.json();
            onStatusUpdate(updatedJob);
        } catch (err) {
            console.error('Error updating status:', err);
            onStatusUpdate(originalJob);
            if (newStatus === 'completed') setShowReceipt(false);
            alert(`SATELLITE_LINK_ERROR: ${err.message}`);
        }
    };

    const handleCancelJob = async (cancellationData) => {
        try {
            const res = await fetch(`${API_URL}/api/jobs/${job._id}/cancel`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(cancellationData)
            });

            if (!res.ok) throw new Error('Failed to cancel job');

            const result = await res.json();

            // Close modal
            setShowCancelModal(false);

            // Notify parent component
            onStatusUpdate({ ...job, status: 'cancelled', cancellationData });

            // Show success message
            alert(`Job cancelled successfully. ${user.role === 'customer' ? 'The technician has been notified.' : 'The customer has been notified.'}`);

            // Go back to dashboard
            if (onBack) {
                setTimeout(() => onBack(), 1000);
            }
        } catch (err) {
            console.error('Cancel job failed:', err);
            alert('Failed to cancel job. Please try again.');
        }
    };

    return (
        <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Top Toolbar */}
            <header style={{ padding: '1.5rem 3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {user.role === 'customer' && onBack && (
                        <button
                            onClick={onBack}
                            style={{
                                background: 'transparent',
                                border: '1px solid var(--border)',
                                padding: '0.6rem',
                                borderRadius: '0.8rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--text)',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.target.style.background = 'var(--card)'}
                            onMouseLeave={(e) => e.target.style.background = 'transparent'}
                            title="Back to Dashboard"
                        >
                            <ArrowLeft size={18} />
                        </button>
                    )}
                    <div style={{ background: 'var(--text)', color: 'var(--bg)', padding: '0.4rem 0.8rem', borderRadius: '0.5rem', fontWeight: 900, fontSize: '0.7rem' }}>SECURE LINE</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, opacity: 0.6 }}>JOB_ID: #{job._id.slice(-8).toUpperCase()}</div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => setShowChat(!showChat)} style={{ background: showChat ? 'var(--text)' : 'transparent', color: showChat ? 'var(--bg)' : 'var(--text)', border: '1px solid var(--border)', padding: '0.6rem 1.2rem', borderRadius: '0.8rem', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s ease' }}>
                        <MessageSquare size={16} /> CHAT
                    </button>
                    {job.status !== 'completed' && (
                        <button
                            onClick={() => setShowCancelModal(true)}
                            style={{
                                background: 'transparent',
                                color: '#ef4444',
                                border: '1px solid #ef4444',
                                padding: '0.6rem 1.2rem',
                                borderRadius: '0.8rem',
                                cursor: 'pointer',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = '#ef4444';
                                e.target.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = 'transparent';
                                e.target.style.color = '#ef4444';
                            }}
                        >
                            <X size={16} /> CANCEL JOB
                        </button>
                    )}
                    {user.role === 'technician' && job.status === 'completed' && (
                        <button onClick={() => onStatusUpdate(null)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '0.8rem', cursor: 'pointer', fontWeight: 700 }}>
                            EXIT MISSION
                        </button>
                    )}
                </div>
            </header>

            {/* Tracking Field */}
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: window.innerWidth < 768 ? 'column' : 'row' }}>
                {/* Main Content Area (Map + HUD) - Responsive layout */}
                <div style={{
                    flex: showChat ? (window.innerWidth < 768 ? '0 0 50%' : 3) : 1,
                    position: 'relative',
                    display: 'flex',
                    transition: 'flex 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    minHeight: window.innerWidth < 768 ? '50%' : 'auto'
                }}>
                    {/* HUD Overlay */}
                    <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        style={{
                            position: 'absolute',
                            top: window.innerWidth < 768 ? '1rem' : '2rem',
                            left: window.innerWidth < 768 ? '1rem' : '2rem',
                            width: window.innerWidth < 768 ? 'calc(100% - 2rem)' : (showChat ? '280px' : '320px'),
                            maxWidth: window.innerWidth < 768 ? '100%' : '320px',
                            background: 'rgba(15, 15, 15, 0.95)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '1.5rem',
                            padding: window.innerWidth < 768 ? '1rem' : (showChat ? '1.5rem' : '1.8rem'),
                            border: '1px solid rgba(255,255,255,0.1)',
                            zIndex: 10,
                            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                            color: 'white',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <div style={{ fontSize: '0.6rem', color: '#3b82f6', fontWeight: 900, letterSpacing: '0.2em', marginBottom: '1rem' }}>MISSION_PROFILE</div>
                        <h2 style={{ fontSize: window.innerWidth < 768 ? '1rem' : (showChat ? '1.2rem' : '1.4rem'), fontWeight: 900, marginBottom: '1.5rem', letterSpacing: '-0.02em', transition: 'font-size 0.3s ease' }}>{job.serviceType?.toUpperCase()}</h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.05)', borderRadius: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <MapPin size={20} color="#3b82f6" />
                                </div>
                                <div style={{ overflow: 'hidden', flex: 1 }}>
                                    <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', fontWeight: 800 }}>DESTINATION</div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{job.location?.address || 'Sector 01'}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.05)', borderRadius: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Clock size={20} color="#10b981" />
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', fontWeight: 800 }}>ACTIVE_TIME</div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 700, fontFamily: 'monospace' }}>{formatTime(elapsedSeconds)}</div>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.8rem' }}>
                                {(user.role === 'customer' ? (job.technicianId?.name || 'T') : (job.customerId?.name || 'C')).charAt(0).toUpperCase()}
                            </div>
                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.role === 'customer' ? (job.technicianId?.name || 'Analyst') : (job.customerId?.name || 'Direct Line')}</div>
                                <div style={{ fontSize: '0.6rem', color: '#10b981', fontWeight: 900 }}>ENCRYPTED_SIGNAL</div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Main Ground View (Map) */}
                    <div style={{ flex: 1, position: 'relative', background: '#050505' }}>
                        <GoogleMap job={job} user={user} />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.6) 100%)', pointerEvents: 'none', zIndex: 1 }}></div>
                    </div>
                </div>

                {/* Chat Sidebar - Responsive */}
                <AnimatePresence>
                    {showChat && (
                        <motion.div
                            initial={{
                                [window.innerWidth < 768 ? 'height' : 'width']: 0,
                                opacity: 0
                            }}
                            animate={{
                                [window.innerWidth < 768 ? 'height' : 'width']: window.innerWidth < 768 ? '50%' : '25%',
                                opacity: 1
                            }}
                            exit={{
                                [window.innerWidth < 768 ? 'height' : 'width']: 0,
                                opacity: 0
                            }}
                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            style={{
                                minWidth: window.innerWidth < 768 ? 'auto' : '300px',
                                maxWidth: window.innerWidth < 768 ? '100%' : '400px',
                                minHeight: window.innerWidth < 768 ? '50%' : 'auto',
                                background: 'var(--card)',
                                borderLeft: window.innerWidth < 768 ? 'none' : '1px solid var(--border)',
                                borderTop: window.innerWidth < 768 ? '1px solid var(--border)' : 'none',
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden'
                            }}
                        >
                            <Chat
                                jobId={job._id}
                                receiverId={user.role === 'customer'
                                    ? (job.technicianId?._id || job.technicianId)
                                    : (job.customerId?._id || job.customerId)}
                                onClose={() => setShowChat(false)}
                                isCompact={true}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Tactical Action Bar */}
            <footer style={{ padding: '2rem 3rem', background: 'var(--card)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '4rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '0.1em' }}>CURRENT_PHASE</span>
                        <span style={{ fontSize: '1.2rem', fontWeight: 900, color: 'white' }}>{job.status.toUpperCase().replace('_', ' ')}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        {['accepted', 'arrived', 'in_progress', 'completed'].map((s, i) => (
                            <div key={s} style={{ width: 40, height: 4, background: ['accepted', 'arrived', 'in_progress', 'completed'].indexOf(job.status) >= i ? '#10b981' : 'rgba(255,255,255,0.05)', borderRadius: 2 }}></div>
                        ))}
                    </div>
                </div>

                {user.role === 'technician' && job.status !== 'completed' && (
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        {job.status === 'accepted' && (
                            <button onClick={() => updateStatus('arrived')} style={{ padding: '1rem 2.5rem', background: 'white', color: 'black', borderRadius: '1rem', border: 'none', fontWeight: 900, cursor: 'pointer', boxShadow: '0 0 20px rgba(255,255,255,0.1)' }}>ARRIVAL SIGNAL</button>
                        )}
                        {job.status === 'arrived' && (
                            <button onClick={() => updateStatus('in_progress')} style={{ padding: '1rem 2.5rem', background: '#3b82f6', color: 'white', borderRadius: '1rem', border: 'none', fontWeight: 900, cursor: 'pointer' }}>COMMENCE OPS</button>
                        )}
                        {job.status === 'in_progress' && (
                            <button onClick={() => updateStatus('completed')} style={{ padding: '1rem 2.5rem', background: '#10b981', color: 'white', borderRadius: '1rem', border: 'none', fontWeight: 900, cursor: 'pointer' }}>COMPLETE MISSION</button>
                        )}
                    </div>
                )}

                {user.role === 'customer' && job.status === 'completed' && (
                    <div style={{ color: '#10b981', fontWeight: 900, fontSize: '0.9rem' }}>MISSION COMPLETE. CHECK ARCHIVES.</div>
                )}
            </footer>

            <AnimatePresence>
                {showReceipt && (
                    <ServiceReceipt job={job} onClose={() => setShowReceipt(false)} />
                )}
            </AnimatePresence>

            {/* Location Tracker for Technicians */}
            {user.role === 'technician' && job.status !== 'completed' && (
                <LocationTracker
                    jobId={job._id}
                    isActive={job.status === 'in-progress' || job.status === 'accepted'}
                />
            )}

            {/* Cancel Job Modal */}
            <AnimatePresence>
                {showCancelModal && (
                    <CancelJobModal
                        job={job}
                        user={user}
                        onCancel={handleCancelJob}
                        onClose={() => setShowCancelModal(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default ActiveJobTracking;
