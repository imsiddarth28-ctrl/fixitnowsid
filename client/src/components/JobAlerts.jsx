import { useState, useEffect } from 'react';
import { subscribeToEvent } from '../socket';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, ArrowRight, Zap, ShieldAlert } from 'lucide-react';

const JobAlerts = ({ activeJob, setActiveJob, setActiveTab }) => {
    const { user } = useAuth();
    const [incomingJob, setIncomingJob] = useState(null);

    useEffect(() => {
        if (!user) return;

        const handleNewJob = (data) => {
            setIncomingJob(data);
        };

        const unsubNewJob = subscribeToEvent(`user-${user.id}`, 'new_job_request', handleNewJob);

        return () => {
            unsubNewJob();
        };
    }, [user]);

    const handleResponse = async (status) => {
        if (!incomingJob) return;
        const targetJob = incomingJob.job;

        setIncomingJob(null);

        try {
            const res = await fetch(`${API_URL}/api/jobs/${targetJob._id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });

            if (res.ok) {
                const updatedJob = await res.json();
                if (status === 'accepted') {
                    if (setActiveJob) setActiveJob(updatedJob);
                    if (setActiveTab) setActiveTab('home');
                }
            }
        } catch (err) {
            console.error('Alert response error:', err);
        }
    };

    return (
        <AnimatePresence>
            {incomingJob && (
                <motion.div
                    initial={{ opacity: 0, y: 100, x: '-50%' }}
                    animate={{ opacity: 1, y: 0, x: '-50%' }}
                    exit={{ opacity: 0, scale: 0.95, x: '-50%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="glass"
                    style={{
                        position: 'fixed',
                        bottom: '40px',
                        left: '50%',
                        width: 'calc(100% - 48px)',
                        maxWidth: '460px',
                        borderRadius: '32px',
                        padding: '32px',
                        zIndex: 10000,
                        border: '1px solid var(--border)',
                        boxShadow: '0 40px 100px rgba(0,0,0,0.2)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '24px',
                        background: 'var(--bg-secondary)'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                            <div style={{
                                width: '56px',
                                height: '56px',
                                background: 'var(--text)',
                                borderRadius: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                            }}>
                                <Zap size={28} color="var(--bg)" />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
                                    {incomingJob.isQueued ? 'QUEUE_MISSION' : 'DEPLOYMENT_REQUEST'}
                                </div>
                                <div style={{ fontSize: '1.25rem', fontWeight: '900', letterSpacing: '-0.02em' }}>{incomingJob.customerName}</div>
                            </div>
                        </div>
                        <motion.button
                            whileHover={{ rotate: 90 }}
                            onClick={() => setIncomingJob(null)}
                            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                        >
                            <X size={20} />
                        </motion.button>
                    </div>

                    <div className="glass" style={{ padding: '20px', borderRadius: '24px', border: '1px solid var(--border)', background: 'var(--bg-tertiary)' }}>
                        <div style={{ fontWeight: '900', fontSize: '1.1rem', marginBottom: '8px', letterSpacing: '-0.02em' }}>{incomingJob.job.serviceType?.toUpperCase()}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
                            <motion.div
                                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.4, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }}
                            />
                            PRIORITY_DISPATCH_REQUIRED
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px' }}>
                        <button
                            onClick={() => handleResponse('rejected')}
                            className="btn btn-secondary"
                            style={{ flex: 1, padding: '18px', fontSize: '0.9rem', fontWeight: '900' }}
                        >
                            DISMISS
                        </button>
                        <button
                            onClick={() => handleResponse('accepted')}
                            className="btn btn-primary"
                            style={{ flex: 1.5, padding: '18px', fontSize: '0.9rem', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                        >
                            ACCEPT_MISSION <ArrowRight size={18} />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default JobAlerts;
