import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Star, Clock, User, ChevronRight, MessageSquare, AlertCircle } from 'lucide-react';
import ServiceReceipt from './ServiceReceipt';

const BookingHistory = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [ratingJobId, setRatingJobId] = useState(null);
    const [rating, setRating] = useState(5);
    const [review, setReview] = useState('');
    const [viewReceiptJob, setViewReceiptJob] = useState(null);

    useEffect(() => {
        if (user) {
            fetchBookings();
        }
    }, [user]);

    const fetchBookings = () => {
        const role = user.role === 'technician' ? 'technician' : 'customer';
        fetch(`${API_URL}/api/bookings/user/${user.id}?role=${role}`)
            .then(res => res.json())
            .then(data => setBookings(data))
            .catch(err => console.error(err));
    };

    const StatusBadge = ({ status }) => {
        const config = {
            completed: { label: 'SUCCESSFUL', color: 'var(--success)', bg: 'rgba(16, 185, 129, 0.1)' },
            cancelled: { label: 'HALTED', color: 'var(--error)', bg: 'rgba(239, 68, 68, 0.1)' },
            pending: { label: 'IN QUEUE', color: 'var(--warning)', bg: 'rgba(255, 149, 0, 0.1)' },
            accepted: { label: 'PROCESSING', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
        };
        const s = config[status] || { label: status?.toUpperCase(), color: 'var(--text-secondary)', bg: 'var(--bg-tertiary)' };

        return (
            <span style={{
                color: s.color,
                background: s.bg,
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '0.65rem',
                fontWeight: '800',
                letterSpacing: '0.05em',
                border: `1px solid ${s.color}20`
            }}>
                {s.label}
            </span>
        );
    };

    const submitRating = async (jobId) => {
        try {
            const res = await fetch(`${API_URL}/api/jobs/${jobId}/rate`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating, review })
            });
            if (res.ok) {
                setRatingJobId(null);
                setReview('');
                fetchBookings();
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={{ marginTop: '24px' }}>
            <div style={{ marginBottom: '32px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
                    Data Repository
                </div>
                <h2 style={{ fontSize: '2rem', fontWeight: '800', fontFamily: 'var(--font-heading)', color: 'var(--text)' }}>
                    Project Ledger
                </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {bookings.length === 0 ? (
                    <div className="glass" style={{ padding: '64px 32px', textAlign: 'center', borderRadius: '24px', border: '1px dashed var(--border)' }}>
                        <div style={{ color: 'var(--text-secondary)', opacity: 0.3, marginBottom: '16px' }}>
                            <FileText size={48} style={{ margin: '0 auto' }} />
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontWeight: '700' }}>No historical entries found in your ledger.</p>
                    </div>
                ) : (
                    bookings.map((job, idx) => (
                        <motion.div
                            key={job._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bento-card"
                            style={{ padding: '28px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', position: 'relative' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                                <div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '8px', fontFamily: 'monospace', fontWeight: '700' }}>
                                        HEX_ID: {job._id.slice(-12).toUpperCase()}
                                    </div>
                                    <h4 style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--text)', marginBottom: '8px', letterSpacing: '-0.02em' }}>
                                        {job.serviceType}
                                    </h4>
                                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>
                                            <User size={14} />
                                            {user.role === 'technician' ? job.customerId?.name : (job.technicianId?.name || 'Authorized Pro')}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>
                                            <Clock size={14} />
                                            {new Date(job.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ textAlign: 'right', minWidth: '120px' }}>
                                    <div style={{ fontWeight: '900', fontSize: '1.75rem', color: 'var(--text)', marginBottom: '8px', letterSpacing: '-0.04em' }}>
                                        ${job.price || 0}
                                    </div>
                                    <StatusBadge status={job.status} />
                                </div>
                            </div>

                            <div style={{
                                marginTop: '24px', paddingTop: '24px',
                                borderTop: '1px solid var(--border)',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                            }}>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    {job.status === 'completed' && (
                                        <button
                                            onClick={() => setViewReceiptJob(job)}
                                            className="btn btn-secondary"
                                            style={{ padding: '8px 16px', fontSize: '0.75rem', display: 'flex', gap: '6px' }}
                                        >
                                            <FileText size={14} /> RECEIPT
                                        </button>
                                    )}

                                    {user.role === 'customer' && job.status === 'completed' && !job.rating && ratingJobId !== job._id && (
                                        <button
                                            onClick={() => setRatingJobId(job._id)}
                                            className="btn btn-primary"
                                            style={{ padding: '8px 16px', fontSize: '0.75rem', display: 'flex', gap: '6px' }}
                                        >
                                            <Star size={14} /> RATE PRO
                                        </button>
                                    )}
                                </div>

                                {job.rating && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={14} fill={i < job.rating ? '#f59e0b' : 'none'} color={i < job.rating ? '#f59e0b' : 'var(--border)'} />
                                        ))}
                                        <span style={{ fontSize: '0.8rem', fontWeight: '900', color: '#f59e0b', marginLeft: '4px' }}>{job.rating.toFixed(1)}</span>
                                    </div>
                                )}
                            </div>

                            <AnimatePresence>
                                {ratingJobId === job._id && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                    >
                                        <div style={{ background: 'var(--bg-tertiary)', padding: '24px', borderRadius: '20px', marginTop: '20px', border: '1px solid var(--border)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                                <h5 style={{ fontWeight: '800', fontSize: '0.9rem', color: 'var(--text)' }}>FEEDBACK SUBMISSION</h5>
                                                <div style={{ display: 'flex', gap: '4px' }}>
                                                    {[1, 2, 3, 4, 5].map(star => (
                                                        <button
                                                            key={star}
                                                            onClick={() => setRating(star)}
                                                            style={{ background: 'none', border: 'none', cursor: 'pointer', transition: 'transform 0.2s' }}
                                                        >
                                                            <Star
                                                                size={24}
                                                                fill={rating >= star ? '#f59e0b' : 'none'}
                                                                color={rating >= star ? '#f59e0b' : 'var(--text-secondary)'}
                                                                style={{ opacity: rating >= star ? 1 : 0.3 }}
                                                            />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <textarea
                                                placeholder="Enter performance evaluation details..."
                                                value={review}
                                                onChange={(e) => e.target.value.length <= 200 && setReview(e.target.value)}
                                                className="input"
                                                style={{ minHeight: '100px', marginBottom: '20px', background: 'var(--bg-secondary)', padding: '16px' }}
                                            />

                                            <div style={{ display: 'flex', gap: '12px' }}>
                                                <button
                                                    onClick={() => submitRating(job._id)}
                                                    className="btn btn-primary"
                                                    style={{ flex: 2, padding: '12px' }}
                                                >
                                                    SUBMIT ENTRY
                                                </button>
                                                <button
                                                    onClick={() => setRatingJobId(null)}
                                                    className="btn btn-secondary"
                                                    style={{ flex: 1, padding: '12px' }}
                                                >
                                                    CANCEL
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))
                )}
            </div>

            <AnimatePresence>
                {viewReceiptJob && (
                    <ServiceReceipt
                        job={viewReceiptJob}
                        onClose={() => setViewReceiptJob(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default BookingHistory;
