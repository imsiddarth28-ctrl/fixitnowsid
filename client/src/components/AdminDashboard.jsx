
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
    const [technicians, setTechnicians] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [view, setView] = useState('techs'); // 'techs' or 'bookings'

    useEffect(() => {
        fetchTechnicians();
        fetchBookings();
    }, []);

    const fetchTechnicians = () => {
        fetch('http://localhost:5000/api/admin/technicians')
            .then(res => res.json())
            .then(data => setTechnicians(data));
    };

    const fetchBookings = () => {
        fetch('http://localhost:5000/api/admin/bookings')
            .then(res => res.json())
            .then(data => setBookings(data));
    };

    const approveTech = async (id) => {
        await fetch(`http://localhost:5000/api/admin/approve-technician/${id}`, { method: 'PUT' });
        fetchTechnicians(); // Refresh
        alert('Technician Approved');
    };

    return (
        <div className="container" style={{ marginTop: '2rem' }}>
            <h2 className="text-gradient" style={{ marginBottom: '1rem' }}>Admin Portal</h2>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <button
                    onClick={() => setView('techs')}
                    className={view === 'techs' ? 'btn-primary' : 'glass-panel'}
                    style={{ padding: '0.5rem 1.5rem' }}
                >
                    Manage Technicians
                </button>
                <button
                    onClick={() => setView('bookings')}
                    className={view === 'bookings' ? 'btn-primary' : 'glass-panel'}
                    style={{ padding: '0.5rem 1.5rem' }}
                >
                    All Bookings
                </button>
            </div>

            {view === 'techs' && (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {technicians.map(tech => (
                        <div key={tech._id} className="glass-panel" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h4 style={{ fontSize: '1.2rem' }}>{tech.name}</h4>
                                <p style={{ color: 'var(--text-muted)' }}>{tech.serviceType} | {tech.email}</p>
                            </div>
                            <div>
                                {tech.isVerified ? (
                                    <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>✓ Verified</span>
                                ) : (
                                    <button className="btn-primary" onClick={() => approveTech(tech._id)}>Approve</button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {view === 'bookings' && (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {bookings.map(job => (
                        <div key={job._id} className="glass-panel" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <span style={{ color: 'var(--accent-color)', fontSize: '0.9rem' }}>{job._id}</span>
                                <h4>{job.serviceType}</h4>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    Cust: {job.customerId?.name || 'N/A'} → Tech: {job.technicianId?.name || 'Pending'}
                                </p>
                            </div>
                            <span style={{
                                padding: '0.25rem 0.75rem',
                                background: 'rgba(255,255,255,0.1)',
                                borderRadius: '1rem',
                                textTransform: 'capitalize'
                            }}>
                                {job.status}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
