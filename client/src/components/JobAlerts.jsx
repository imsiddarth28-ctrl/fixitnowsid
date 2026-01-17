import { useState, useEffect } from 'react';
import { subscribeToEvent } from '../socket';
import { useAuth } from '../context/AuthContext';
import LiveMap from './LiveMap';
import API_URL from '../config';
import Chat from './Chat';
import { motion, AnimatePresence } from 'framer-motion';

const JobAlerts = ({ activeJob, setActiveJob }) => {
    const { user } = useAuth();
    const [incomingJob, setIncomingJob] = useState(null);
    const [showChat, setShowChat] = useState(false);

    useEffect(() => {
        if (!user) return;

        const handleNewJob = (data) => {
            setIncomingJob(data);
        };

        const handleJobUpdate = (data) => {
            if (data.job.status === 'accepted') {
                setActiveJob(data.job);
            }
        };

        const unsubNewJob = subscribeToEvent(`user-${user.id}`, 'new_job_request', handleNewJob);
        const unsubUpdate = subscribeToEvent(`user-${user.id}`, 'job_update', handleJobUpdate);

        return () => {
            unsubNewJob();
            unsubUpdate();
        };
    }, [user]);

    const handleResponse = async (status) => {
        if (!incomingJob) return;

        try {
            const res = await fetch(`${API_URL}/api/jobs/${incomingJob.job._id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });

            if (res.ok) {
                const updatedJob = await res.json();
                if (status === 'accepted') {
                    setActiveJob(updatedJob);
                }
            }
        } catch (err) {
            console.error('Response error:', err);
        }

        setIncomingJob(null);
    };

    return (
        <>
            <AnimatePresence>
                {incomingJob && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        style={{
                            position: 'fixed', bottom: '2rem', right: '2rem',
                            background: 'var(--card)', padding: '2rem',
                            borderRadius: '1.5rem', border: '1px solid var(--border)',
                            boxShadow: '0 30px 60px rgba(0,0,0,0.4)', zIndex: 2000, maxWidth: '380px',
                            backdropFilter: 'blur(20px)'
                        }}
                    >
                        <div style={{
                            position: 'absolute', top: -10, left: 20,
                            background: incomingJob.isQueued ? '#f59e0b' : 'var(--text)',
                            color: incomingJob.isQueued ? 'white' : 'var(--bg)',
                            padding: '0.3rem 0.8rem', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: 900,
                            boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                        }}>{incomingJob.isQueued ? 'QUEUED MISSION' : 'NEW REQUEST'}</div>
                        <h3 style={{ marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.02em' }}>{incomingJob.customerName}</h3>
                        <p style={{ marginBottom: '0.8rem', fontSize: '1.1rem', fontWeight: 700 }}>{incomingJob.job.serviceType}</p>

                        {incomingJob.isQueued && (
                            <div style={{
                                background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)',
                                padding: '0.8rem', borderRadius: '0.8rem', marginBottom: '1rem',
                                color: '#f59e0b', fontSize: '0.8rem', fontWeight: 700
                            }}>
                                ⚠️ SYSTEM ALERT: You are currently active. This job will be queued as your next mission.
                            </div>
                        )}

                        <p style={{ marginBottom: '0.8rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{incomingJob.job.description}</p>
                        <p style={{ marginBottom: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>📍 {incomingJob.job.location.address}</p>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={() => handleResponse('rejected')}
                                style={{ flex: 1, padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', fontWeight: 700, cursor: 'pointer' }}
                            >
                                Decline
                            </button>
                            <button
                                onClick={() => handleResponse('accepted')}
                                style={{
                                    flex: 2, padding: '0.8rem', borderRadius: '0.5rem', border: 'none',
                                    background: incomingJob.isQueued ? '#f59e0b' : 'var(--text)',
                                    color: incomingJob.isQueued ? 'white' : 'var(--bg)',
                                    fontWeight: 800, cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {incomingJob.isQueued ? 'ACCEPT & QUEUE' : 'ACCEPT & RESPOND'}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {activeJob && (
                    <motion.div
                        initial={{ y: 200 }}
                        animate={{ y: 0 }}
                        exit={{ y: 200 }}
                        style={{
                            position: 'fixed', bottom: '0', left: '0', right: '0',
                            background: 'var(--card)',
                            borderTop: '1px solid var(--border)',
                            zIndex: 1999,
                            boxShadow: '0 -10px 40px rgba(0,0,0,0.2)'
                        }}
                    >
                        <div style={{ padding: '0.5rem 2rem', maxWidth: '1400px', margin: '0 auto' }}>
                            <div style={{
                                padding: '1rem',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>active_session</div>
                                        <div style={{ fontSize: '0.95rem', fontWeight: 800 }}>{activeJob.serviceType} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>#{activeJob._id.slice(-6).toUpperCase()}</span></div>
                                    </div>
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                                        padding: '0.3rem 0.8rem', borderRadius: '2rem', border: '1px solid var(--border)',
                                        fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase'
                                    }}>
                                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6' }}></span>
                                        {activeJob.status.replace('_', ' ')}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <button
                                        onClick={() => setShowChat(!showChat)}
                                        style={{
                                            background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)',
                                            padding: '0.6rem 1.2rem', borderRadius: '0.5rem', fontWeight: 700, cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', gap: '0.5rem'
                                        }}
                                    >
                                        💬 {showChat ? 'Hide Chat' : 'Message'}
                                    </button>

                                    {user?.role === 'technician' && activeJob.status !== 'completed' && (
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            {activeJob.status === 'accepted' && (
                                                <button onClick={() => {
                                                    fetch(`${API_URL}/api/jobs/${activeJob._id}/status`, {
                                                        method: 'PUT',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ status: 'arrived' })
                                                    }).then(res => res.json()).then(data => setActiveJob(data));
                                                }} style={{ padding: '0.6rem 1.2rem', borderRadius: '0.5rem', border: 'none', background: 'var(--text)', color: 'var(--bg)', fontWeight: 700, cursor: 'pointer' }}>I Arrived</button>
                                            )}
                                            {activeJob.status === 'arrived' && (
                                                <button onClick={() => {
                                                    fetch(`${API_URL}/api/jobs/${activeJob._id}/status`, {
                                                        method: 'PUT',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ status: 'in_progress' })
                                                    }).then(res => res.json()).then(data => setActiveJob(data));
                                                }} style={{ padding: '0.6rem 1.2rem', borderRadius: '0.5rem', border: 'none', background: 'var(--text)', color: 'var(--bg)', fontWeight: 700, cursor: 'pointer' }}>Start Job</button>
                                            )}
                                            {activeJob.status === 'in_progress' && (
                                                <button onClick={() => {
                                                    fetch(`${API_URL}/api/jobs/${activeJob._id}/status`, {
                                                        method: 'PUT',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ status: 'completed' })
                                                    }).then(res => res.json()).then(data => setActiveJob(data));
                                                }} style={{ padding: '0.6rem 1.2rem', borderRadius: '0.5rem', border: 'none', background: '#22c55e', color: 'white', fontWeight: 700, cursor: 'pointer' }}>Complete Job</button>
                                            )}
                                        </div>
                                    )}

                                    {activeJob.status === 'completed' && (
                                        <button onClick={() => { setActiveJob(null); setShowChat(false); }} style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', background: 'none', border: 'none' }}>Close Track</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showChat && activeJob && (
                    <Chat
                        jobId={activeJob._id}
                        receiverId={user.role === 'customer' ? activeJob.technicianId : activeJob.customerId}
                        onClose={() => setShowChat(false)}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

export default JobAlerts;
