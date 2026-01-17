import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';
import { motion, AnimatePresence } from 'framer-motion';
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

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return '#22c55e';
            case 'cancelled': return '#ef4444';
            case 'pending': return '#f59e0b';
            case 'accepted': return '#3b82f6';
            default: return 'var(--text-muted)';
        }
    };

    const submitRating = async (jobId) => {
        try {
            const res = await fetch(`${API_URL}/api/jobs/${jobId}/rate`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating, review })
            });
            if (res.ok) {
                alert('Thank you for your feedback!');
                setRatingJobId(null);
                setReview('');
                fetchBookings();
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={{ marginTop: '2rem', textAlign: 'left' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '2rem' }}>Project History</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {bookings.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem', border: '1px dashed var(--border)', borderRadius: '0.5rem' }}>No projects found in your ledger.</p>
                ) : (
                    bookings.map((job, idx) => (
                        <motion.div
                            key={job._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            whileHover={{ scale: 1.01, x: 5 }}
                            style={{
                                padding: '1.8rem',
                                background: 'var(--card)',
                                border: '1px solid var(--border)',
                                borderRadius: '1rem',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1.2rem',
                                position: 'relative',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontFamily: 'monospace', letterSpacing: '0.1em' }}>PROJECT_ID: {job._id.slice(-8).toUpperCase()}</div>
                                    <h4 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 0.4rem 0' }}>{job.serviceType}</h4>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-muted)' }}></span>
                                        {user.role === 'technician' ? `Client: ${job.customerId?.name}` : `Professional: ${job.technicianId?.name || 'Searching...'}`}
                                    </p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 800, fontSize: '1.4rem', marginBottom: '0.4rem' }}>${job.price || 0}</div>
                                    <span style={{
                                        color: getStatusColor(job.status),
                                        background: `${getStatusColor(job.status)}15`,
                                        padding: '0.3rem 0.8rem',
                                        borderRadius: '0.4rem',
                                        fontSize: '0.7rem',
                                        fontWeight: 900,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        border: `1px solid ${getStatusColor(job.status)}30`
                                    }}>
                                        {job.status.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>

                            <div style={{
                                fontSize: '0.85rem', color: 'var(--text-muted)',
                                borderTop: '1px solid var(--border)', paddingTop: '1.2rem',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    📅 {new Date(job.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </div>

                                {job.status === 'completed' && (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setViewReceiptJob(job)}
                                        style={{
                                            background: 'transparent',
                                            color: 'var(--text)',
                                            border: '1px solid var(--border)',
                                            padding: '0.5rem 1.2rem',
                                            borderRadius: '0.5rem',
                                            fontWeight: 800,
                                            fontSize: '0.75rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.4rem'
                                        }}
                                    >
                                        RECEIPT 📄
                                    </motion.button>
                                )}

                                {user.role === 'customer' && job.status === 'completed' && !job.rating && ratingJobId !== job._id && (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setRatingJobId(job._id)}
                                        style={{ background: 'var(--text)', color: 'var(--bg)', border: 'none', padding: '0.5rem 1.2rem', borderRadius: '0.5rem', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer' }}
                                    >
                                        RATE PRO
                                    </motion.button>
                                )}

                                {job.rating && (
                                    <div style={{ fontWeight: 800, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                        {Array(Math.floor(job.rating)).fill('★').join('')} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({job.rating})</span>
                                    </div>
                                )}
                            </div>

                            <AnimatePresence>
                                {ratingJobId === job._id && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        style={{ overflow: 'hidden' }}
                                    >
                                        <div style={{ background: 'var(--bg)', padding: '1.5rem', borderRadius: '0.8rem', marginTop: '0.5rem', border: '1px solid var(--border)' }}>
                                            <h5 style={{ margin: '0 0 1.2rem 0', fontWeight: 800 }}>RATE YOUR EXPERIENCE</h5>
                                            <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.5rem' }}>
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <motion.button
                                                        whileHover={{ scale: 1.2 }}
                                                        key={star}
                                                        onClick={() => setRating(star)}
                                                        style={{ fontSize: '1.8rem', background: 'none', border: 'none', cursor: 'pointer', opacity: rating >= star ? 1 : 0.2 }}
                                                    >
                                                        ★
                                                    </motion.button>
                                                ))}
                                            </div>
                                            <textarea
                                                placeholder="Tell us what you liked about the service..."
                                                value={review}
                                                onChange={(e) => setReview(e.target.value)}
                                                style={{ width: '100%', background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text)', padding: '1rem', borderRadius: '0.6rem', marginBottom: '1.5rem', minHeight: '100px', resize: 'none', fontSize: '0.9rem' }}
                                            />
                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                <button
                                                    onClick={() => submitRating(job._id)}
                                                    style={{ flex: 2, background: 'var(--text)', color: 'var(--bg)', border: 'none', padding: '0.8rem', borderRadius: '0.5rem', fontWeight: 800, cursor: 'pointer' }}
                                                >
                                                    SUBMIT FEEDBACK
                                                </button>
                                                <button
                                                    onClick={() => setRatingJobId(null)}
                                                    style={{ flex: 1, background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', padding: '0.8rem', borderRadius: '0.5rem', fontWeight: 800, cursor: 'pointer' }}
                                                >
                                                    EXIT
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
