import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Navigation, MapPin, Clock, Phone, MessageSquare,
    CheckCircle2, AlertCircle, X, ShieldAlert,
    ArrowLeft, ChevronRight, Activity, Zap, ShieldCheck, ArrowUpRight
} from 'lucide-react';
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
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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


    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371e3; // metres
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    };

    const updateStatus = async (newStatus) => {
        // Location check for completing job
        if (newStatus === 'completed' && user.role === 'technician') {
            const jobLat = job.location?.latitude || job.location?.lat;
            const jobLng = job.location?.longitude || job.location?.lng;

            if (jobLat && jobLng) {
                try {
                    const position = await new Promise((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject);
                    });

                    const dist = calculateDistance(
                        position.coords.latitude,
                        position.coords.longitude,
                        jobLat,
                        jobLng
                    );

                    // Allow completion only if within 500 meters
                    if (dist > 500) {
                        alert(`You are ${Math.round(dist)}m away from the location. You must be at the customer's location to complete the job.`);
                        return;
                    }
                } catch (err) {
                    console.error('Location check failed', err);
                    // Decide whether to block or warn. For now warn but allow if location fails? 
                    // Strict requirement says "im at the customers location only im able to finish".
                    // But if GPS fails, they can't finish. Let's block and ask them to enable GPS.
                    alert('Unable to verify your location. Please ensure GPS is enabled to complete the job.');
                    return;
                }
            }
        }

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
                throw new Error(errorData.error || errorData.message || 'Failed to update status');
            }

            const updatedJob = await res.json();
            onStatusUpdate(updatedJob);
        } catch (err) {
            console.error('Error updating status:', err);
            onStatusUpdate(originalJob);
            if (newStatus === 'completed') setShowReceipt(false);
            alert('Failed to update status. Please try again.');
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

            setShowCancelModal(false);
            onStatusUpdate({ ...job, status: 'cancelled', cancellationData });

            if (onBack) {
                setTimeout(() => onBack(), 2000);
            }
        } catch (err) {
            console.error('Cancel job failed:', err);
        }
    };

    const StatusItem = ({ label, active, done, idx }) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>
            <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '12px',
                background: done ? 'var(--text)' : active ? 'var(--text)' : 'var(--bg-tertiary)',
                color: done || active ? 'var(--bg)' : 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
                zIndex: 2,
                border: '1px solid var(--border)'
            }}>
                {done ? <CheckCircle2 size={16} /> : <span style={{ fontSize: '0.75rem', fontWeight: '900' }}>{idx + 1}</span>}
            </div>
            <div style={{
                fontSize: '0.9rem',
                fontWeight: active ? '900' : '600',
                color: active ? 'var(--text)' : done ? 'var(--text)' : 'var(--text-secondary)',
                letterSpacing: active ? '0.02em' : '0',
                transition: 'all 0.3s ease'
            }}>
                {label}
            </div>
            {active && (
                <motion.div
                    layoutId="status-indicator"
                    style={{ position: 'absolute', right: 0, width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text)' }}
                />
            )}
        </div>
    );

    return (
        <div style={{
            background: 'var(--bg)',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            color: 'var(--text)',
            overflow: 'hidden'
        }}>
            {/* Mission Header */}
            <header className="glass" style={{
                padding: isMobile ? '16px' : '24px 40px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid var(--border)',
                zIndex: 100
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    {onBack && (
                        <motion.button
                            whileHover={{ scale: 1.1, x: -4 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onBack}
                            className="glass"
                            style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: '14px',
                                border: '1px solid var(--border)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: 'var(--text)'
                            }}
                        >
                            <ArrowLeft size={20} />
                        </motion.button>
                    )}
                    <div>
                        <div style={{ fontSize: '1.25rem', fontWeight: '900', letterSpacing: '-0.04em' }}>
                            {job.serviceType?.toUpperCase()}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700', letterSpacing: '0.1em' }}>
                            ORDER ID: {job._id.slice(-12).toUpperCase()}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowChat(!showChat)}
                        className={`btn ${showChat ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '12px 24px', display: 'flex', gap: '12px', alignItems: 'center' }}
                    >
                        <MessageSquare size={18} />
                        <span style={{ fontWeight: '800', fontSize: '0.85rem' }}>Chat</span>
                    </motion.button>
                    {job.status !== 'completed' && job.status !== 'cancelled' && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowCancelModal(true)}
                            className="btn btn-secondary"
                            style={{ color: 'var(--error)', borderColor: 'rgba(255, 59, 48, 0.2)', padding: '12px 24px' }}
                        >
                            <span style={{ fontWeight: '800', fontSize: '0.85rem' }}>Cancel Job</span>
                        </motion.button>
                    )}
                </div>
            </header>

            {/* Content Core */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                overflow: 'hidden'
            }}>
                {/* Tactical HUD */}
                <div style={{
                    width: isMobile ? '100%' : '440px',
                    background: 'var(--bg-secondary)',
                    borderRight: isMobile ? 'none' : '1px solid var(--border)',
                    borderBottom: isMobile ? '1px solid var(--border)' : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: 10,
                    padding: isMobile ? '24px' : '40px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '48px' }}>
                        <div style={{
                            width: '56px',
                            height: '56px',
                            background: 'var(--text)',
                            borderRadius: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--bg)',
                            boxShadow: '0 12px 24px rgba(0,0,0,0.1)'
                        }}>
                            <Zap size={28} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '800', letterSpacing: '0.1em', marginBottom: '4px' }}>JOB STATUS</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>{job.status.replace('_', ' ')}</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        <div
                            onClick={() => {
                                if (user.role === 'technician' && job.location) {
                                    const lat = job.location.latitude || job.location.lat;
                                    const lng = job.location.longitude || job.location.lng;
                                    const query = lat && lng ? `${lat},${lng}` : encodeURIComponent(job.location.address);
                                    window.open(`https://www.google.com/maps/dir/?api=1&destination=${query}`, '_blank');
                                }
                            }}
                            style={{
                                display: 'flex',
                                gap: '20px',
                                cursor: user.role === 'technician' ? 'pointer' : 'default',
                                padding: '8px',
                                borderRadius: '12px',
                                transition: 'background 0.2s',
                                margin: '-8px'
                            }}
                            onMouseEnter={(e) => {
                                if (user.role === 'technician') e.currentTarget.style.background = 'var(--bg-tertiary)';
                            }}
                            onMouseLeave={(e) => {
                                if (user.role === 'technician') e.currentTarget.style.background = 'transparent';
                            }}
                        >
                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                                <MapPin size={20} />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '800', letterSpacing: '0.1em', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    SERVICE LOCATION
                                    {user.role === 'technician' && <ArrowUpRight size={12} color="var(--accent)" />}
                                </div>
                                <div style={{ fontSize: '0.95rem', fontWeight: '600', lineHeight: '1.4' }}>{job.location?.address}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                                <Clock size={20} />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '800', letterSpacing: '0.1em', marginBottom: '4px' }}>TIME ELAPSED</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: '900', fontFamily: 'monospace', letterSpacing: '0.05em' }}>{formatTime(elapsedSeconds)}</div>
                            </div>
                        </div>
                    </div>

                    {/* Participant Profile */}
                    <div className="glass" style={{ marginTop: '48px', padding: '24px', borderRadius: '24px', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                background: 'var(--text)',
                                borderRadius: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--bg)',
                                fontSize: '1.25rem',
                                fontWeight: '900'
                            }}>
                                {(user.role === 'customer' ? (job.technicianId?.name || 'T') : (job.customerId?.name || 'C')).charAt(0).toUpperCase()}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '800', letterSpacing: '0.05em' }}>
                                    {user.role === 'customer' ? 'TECHNICIAN' : 'CUSTOMER'}
                                </div>
                                <div style={{ fontSize: '1rem', fontWeight: '800' }}>{user.role === 'customer' ? (job.technicianId?.name || 'Assigned Pro') : (job.customerId?.name || 'Authorized Client')}</div>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--bg-tertiary)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text)' }}
                            >
                                <Phone size={18} />
                            </motion.button>
                        </div>
                    </div>

                    {/* Progress Matrix */}
                    <div style={{ marginTop: '56px' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: '900', color: 'var(--text-secondary)', marginBottom: '24px', letterSpacing: '0.1em' }}>JOB PROGRESS</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '15px', top: '24px', bottom: '24px', width: '2px', background: 'var(--border)', zIndex: 1 }} />
                            {[
                                { id: 'accepted', label: 'Accepted' },
                                { id: 'on_way', label: 'Heading to Location' },
                                { id: 'arrived', label: 'Arrived at Location' },
                                { id: 'in_progress', label: 'Job in Progress' },
                                { id: 'completed', label: 'Completed' }
                            ].map((step, idx) => {
                                const statuses = ['accepted', 'on_way', 'arrived', 'in_progress', 'completed'];
                                const currentIdx = statuses.indexOf(job.status);
                                return (
                                    <StatusItem
                                        key={step.id}
                                        label={step.label}
                                        idx={idx}
                                        active={idx === currentIdx}
                                        done={idx < currentIdx}
                                    />
                                );
                            })}
                        </div>
                    </div>

                    {/* Command Interface (Technician Only) */}
                    {user.role === 'technician' && job.status !== 'completed' && job.status !== 'cancelled' && (
                        <div style={{ marginTop: 'auto', paddingTop: '40px' }}>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={job.status}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                >
                                    {job.status === 'accepted' && (
                                        <button onClick={() => updateStatus('on_way')} className="btn btn-primary" style={{ width: '100%', padding: '20px', borderRadius: '20px', fontSize: '0.95rem' }}>Start Navigation</button>
                                    )}
                                    {job.status === 'on_way' && (
                                        <button onClick={() => updateStatus('arrived')} className="btn btn-primary" style={{ width: '100%', padding: '20px', borderRadius: '20px', fontSize: '0.95rem' }}>I've Arrived</button>
                                    )}
                                    {job.status === 'arrived' && (
                                        <button onClick={() => updateStatus('in_progress')} className="btn btn-primary" style={{ width: '100%', padding: '20px', borderRadius: '20px', fontSize: '0.95rem' }}>Start Job</button>
                                    )}
                                    {job.status === 'in_progress' && (
                                        <button onClick={() => updateStatus('completed')} className="btn btn-primary" style={{ width: '100%', padding: '20px', borderRadius: '20px', fontSize: '0.95rem' }}>Complete Job</button>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    )}

                    {/* Mission Support Actions (Customer Only) */}
                    {user.role === 'customer' && job.status !== 'completed' && job.status !== 'cancelled' && (
                        <div style={{ marginTop: 'auto', display: 'flex', gap: '12px', paddingTop: '40px' }}>
                            <button className="btn btn-secondary" style={{ flex: 1, fontSize: '0.75rem', padding: '12px' }}>
                                <ShieldAlert size={14} style={{ marginRight: '8px' }} />
                                Report Issue
                            </button>
                            <button className="btn btn-secondary" style={{ flex: 1, fontSize: '0.75rem', padding: '12px' }}>
                                <Zap size={14} style={{ marginRight: '8px' }} />
                                Add Tip
                            </button>
                        </div>
                    )}
                </div>

                {/* Perspective - Map Area */}
                <div style={{
                    flex: 1,
                    position: 'relative',
                    background: 'var(--bg-tertiary)',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <GoogleMap job={job} user={user} />

                    {/* Floating HUD Elements */}
                    <div style={{
                        position: 'absolute',
                        top: isMobile ? '16px' : '32px',
                        left: isMobile ? '16px' : '32px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        zIndex: 100,
                        maxWidth: 'calc(100% - 32px)'
                    }}>
                        <div className="glass" style={{
                            padding: '12px 16px',
                            borderRadius: '20px',
                            border: '1px solid var(--border)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            boxShadow: '0 12px 32px rgba(0,0,0,0.1)',
                            width: 'fit-content'
                        }}>
                            <div style={{ position: 'relative', width: '10px', height: '10px' }}>
                                <motion.div
                                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'var(--success)' }}
                                />
                                <div style={{ position: 'absolute', inset: '1px', borderRadius: '50%', background: 'var(--success)', border: '2px solid white' }} />
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.05em' }}>Live Tracking</span>
                        </div>

                        {!isMobile && (
                            <div className="glass" style={{
                                padding: '16px 24px',
                                borderRadius: '20px',
                                border: '1px solid var(--border)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '24px',
                                boxShadow: '0 12px 32px rgba(0,0,0,0.1)',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }}></div>
                                    <div style={{ fontSize: '0.75rem', fontWeight: '700' }}>GPS Connected</div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Chat Slide-over */}
                    <AnimatePresence>
                        {showChat && (
                            <motion.div
                                initial={{ x: '100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '100%' }}
                                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                    bottom: 0,
                                    width: isMobile ? '100%' : '500px',
                                    background: 'var(--bg)',
                                    zIndex: 200,
                                    boxShadow: '-20px 0 60px rgba(0,0,0,0.15)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    borderLeft: '1px solid var(--border)'
                                }}
                            >
                                <div style={{ flex: 1, position: 'relative' }}>
                                    <Chat
                                        jobId={job._id}
                                        otherUser={user.role === 'customer' ? job.technicianId : job.customerId}
                                        isCompact={true}
                                    />
                                    <motion.button
                                        whileHover={{ scale: 1.1, rotate: 90 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setShowChat(false)}
                                        className="glass"
                                        style={{
                                            position: 'absolute',
                                            top: '24px',
                                            right: '24px',
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '12px',
                                            border: '1px solid var(--border)',
                                            cursor: 'pointer',
                                            zIndex: 300,
                                            color: 'var(--text)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <X size={20} />
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Sub-Modules */}
            <AnimatePresence>
                {showCancelModal && (
                    <CancelJobModal
                        job={job}
                        user={user}
                        onCancel={handleCancelJob}
                        onClose={() => setShowCancelModal(false)}
                    />
                )}
                {showReceipt && (
                    <ServiceReceipt job={job} onClose={() => setShowReceipt(false)} />
                )}
            </AnimatePresence>

            {/* Tactical Tracker Process */}
            {user.role === 'technician' && (job.status === 'on_way' || job.status === 'in_progress') && (
                <LocationTracker jobId={job._id} isActive={true} />
            )}
        </div>
    );
};

export default ActiveJobTracking;
