import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';

const BookingHistory = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        if (user) {
            const role = user.role === 'technician' ? 'technician' : 'customer';
            fetch(`${API_URL}/api/bookings/user/${user.id}?role=${role}`)
                .then(res => res.json())
                .then(data => setBookings(data))
                .catch(err => console.error(err));
        }
    }, [user]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'var(--success)';
            case 'cancelled': return 'var(--error)';
            case 'pending': return 'var(--warning)';
            default: return 'var(--primary-color)';
        }
    };

    return (
        <div className="container" style={{ marginTop: '2rem' }}>
            <h2 className="text-gradient">Booking History</h2>
            <div style={{ marginTop: '2rem' }}>
                {bookings.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>No bookings found.</p>
                ) : (
                    bookings.map(job => (
                        <div key={job._id} className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h4 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>{job.serviceType}</h4>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{new Date(job.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.25rem' }}>${job.price}</div>
                                <span style={{
                                    color: getStatusColor(job.status),
                                    background: 'rgba(255,255,255,0.05)',
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '1rem',
                                    fontSize: '0.8rem',
                                    textTransform: 'capitalize'
                                }}>
                                    {job.status.replace('_', ' ')}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default BookingHistory;
