
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const TechnicianDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ earnings: 1250, jobs: 12, rating: 4.8 }); // Mocked for now
    const [isAvailable, setIsAvailable] = useState(true);

    const toggleAvailability = async () => {
        try {
            const newState = !isAvailable;
            await fetch(`http://localhost:5000/api/technicians/${user.id}/availability`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isAvailable: newState })
            });
            setIsAvailable(newState);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="container" style={{ marginTop: '2rem' }}>
            <h2 className="text-gradient" style={{ marginBottom: '2rem' }}>Technician Dashboard</h2>

            {/* Status Toggle */}
            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h3>Availability Status</h3>
                    <p style={{ color: isAvailable ? 'var(--success)' : 'var(--text-muted)' }}>
                        {isAvailable ? '● Online & Receiving Jobs' : '○ Offline'}
                    </p>
                </div>
                <button
                    onClick={toggleAvailability}
                    style={{
                        background: isAvailable ? 'var(--success)' : '#334155',
                        color: 'white',
                        border: 'none',
                        padding: '0.75rem 2rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'background 0.3s'
                    }}
                >
                    {isAvailable ? 'GO OFFLINE' : 'GO ONLINE'}
                </button>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
                    <h4 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Total Earnings</h4>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>$ {stats.earnings}</div>
                </div>
                <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
                    <h4 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Jobs Completed</h4>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.jobs}</div>
                </div>
                <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
                    <h4 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Rating</h4>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--warning)' }}>★ {stats.rating}</div>
                </div>
            </div>

        </div>
    );
};

export default TechnicianDashboard;
