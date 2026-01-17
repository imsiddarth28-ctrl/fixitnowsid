import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';

const AdminDashboard = () => {
    const { logout } = useAuth();
    const [technicians, setTechnicians] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [view, setView] = useState('techs'); // 'techs' or 'bookings'
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([fetchTechnicians(), fetchBookings()]);
            setLoading(false);
        };
        loadData();
    }, []);

    const fetchTechnicians = async () => {
        try {
            const res = await fetch(`${API_URL}/api/admin/technicians`);
            const data = await res.json();
            setTechnicians(data);
        } catch (err) { console.error(err); }
    };

    const fetchBookings = async () => {
        try {
            const res = await fetch(`${API_URL}/api/admin/bookings`);
            const data = await res.json();
            setBookings(data);
        } catch (err) { console.error(err); }
    };

    const approveTech = async (id) => {
        try {
            const res = await fetch(`${API_URL}/api/admin/approve-technician/${id}`, { method: 'PUT' });
            if (res.ok) {
                fetchTechnicians();
                alert('Technician verified successfully');
            }
        } catch (err) { console.error(err); }
    };

    const toggleBlockTech = async (id, currentStatus) => {
        try {
            const res = await fetch(`${API_URL}/api/admin/block-technician/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isBlocked: !currentStatus })
            });
            if (res.ok) {
                fetchTechnicians();
                alert(`Technician ${!currentStatus ? 'blocked' : 'unblocked'} successfully`);
            }
        } catch (err) { console.error(err); }
    };

    const stats = {
        totalEarnings: bookings.filter(b => b.status === 'completed').reduce((acc, curr) => acc + (curr.price || 0), 0),
        activeTechs: technicians.filter(t => t.isAvailable && !t.isBlocked).length,
        pendingBookings: bookings.filter(b => b.status === 'pending').length,
        avgRating: technicians.length > 0
            ? (technicians.reduce((acc, curr) => acc + curr.rating, 0) / technicians.length).toFixed(1)
            : 5.0
    };

    const menuItems = [
        { id: 'techs', label: 'Technician Hub' },
        { id: 'bookings', label: 'Project Ledger' },
        { id: 'analytics', label: 'Growth Insights' },
        { id: 'support', label: 'System Alerts' }
    ];

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg)',
            display: 'flex',
            width: '100%',
            position: 'relative',
            textAlign: 'left'
        }}>
            {/* Sidebar */}
            <aside style={{
                width: '280px',
                borderRight: '1px solid var(--border)',
                padding: '2rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                position: 'fixed',
                left: 0,
                top: 0,
                zIndex: 10
            }}>
                <div style={{
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 800,
                    fontSize: '1.5rem',
                    marginBottom: '3rem',
                    letterSpacing: '-0.02em',
                    color: 'var(--text)'
                }}>
                    Admin.
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setView(item.id)}
                            style={{
                                textAlign: 'left',
                                padding: '0.75rem 1rem',
                                borderRadius: '0.5rem',
                                border: 'none',
                                background: view === item.id ? 'var(--text)' : 'transparent',
                                color: view === item.id ? 'var(--bg)' : 'var(--text-muted)',
                                fontSize: '0.95rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginTop: 'auto' }}>
                    <button
                        onClick={logout}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            border: '1px solid var(--border)',
                            background: 'transparent',
                            color: 'var(--text)',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        Terminate Session
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{
                flex: 1,
                marginLeft: '280px',
                padding: '2rem 3.3rem'
            }}>
                {/* Header */}
                <header style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    marginBottom: '3rem'
                }}>
                    <div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            ROOT CONTROL / {menuItems.find(m => m.id === view)?.label}
                        </div>
                        <h1 style={{
                            fontSize: '2rem',
                            fontWeight: 800,
                            fontFamily: 'var(--font-heading)',
                            margin: 0
                        }}>
                            Platform Command
                        </h1>
                    </div>

                    <div style={{ display: 'flex', gap: '2rem' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>TOTAL VOLUME</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>${stats.totalEarnings.toFixed(2)}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>AVG RATING</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{stats.avgRating}</div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div style={{ width: '100%' }} className="animate-fade-in">
                    {view === 'techs' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {technicians.map(tech => (
                                <div key={tech._id} style={{
                                    padding: '1.5rem',
                                    background: 'var(--card)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '0.75rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    opacity: tech.isBlocked ? 0.6 : 1
                                }}>
                                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                                            {tech.name[0]}
                                        </div>
                                        <div>
                                            <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem' }}>{tech.name} {tech.isBlocked && <span style={{ color: 'var(--error)', fontSize: '0.7rem' }}>(BLOCKED)</span>}</h4>
                                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                <span>{tech.serviceType}</span>
                                                <span>•</span>
                                                <span>{tech.email}</span>
                                                <span>•</span>
                                                <span>{tech.rating}⭐</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        {!tech.isVerified && (
                                            <button
                                                className="btn-approve"
                                                onClick={() => approveTech(tech._id)}
                                                style={{ padding: '0.5rem 1.2rem', fontSize: '0.8rem', background: 'var(--text)', color: 'var(--bg)', border: 'none', borderRadius: '0.4rem', fontWeight: 700, cursor: 'pointer' }}
                                            >
                                                Approve
                                            </button>
                                        )}
                                        <button
                                            onClick={() => toggleBlockTech(tech._id, tech.isBlocked)}
                                            style={{ padding: '0.5rem 1.2rem', fontSize: '0.8rem', background: 'transparent', color: tech.isBlocked ? 'var(--text)' : 'var(--error)', border: `1px solid ${tech.isBlocked ? 'var(--border)' : 'var(--error)'}`, borderRadius: '0.4rem', fontWeight: 700, cursor: 'pointer' }}
                                        >
                                            {tech.isBlocked ? 'Unblock' : 'Block'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {view === 'bookings' && (
                        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '0.75rem', overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                                        <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>PROJECT ID</th>
                                        <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>SERVICE</th>
                                        <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>PARTIES</th>
                                        <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>STATUS</th>
                                        <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>PRICE</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map(job => (
                                        <tr key={job._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', fontFamily: 'monospace' }}>#{job._id.slice(-6).toUpperCase()}</td>
                                            <td style={{ padding: '1rem 1.5rem', fontSize: '0.9rem', fontWeight: 600 }}>{job.serviceType}</td>
                                            <td style={{ padding: '1rem 1.5rem', fontSize: '0.85rem' }}>
                                                <div style={{ fontWeight: 600 }}>{job.customerId?.name || 'User'}</div>
                                                <div style={{ color: 'var(--text-muted)' }}>{job.technicianId?.name || 'Unassigned'}</div>
                                            </td>
                                            <td style={{ padding: '1rem 1.5rem' }}>
                                                <span style={{
                                                    fontSize: '0.75rem',
                                                    fontWeight: 800,
                                                    padding: '0.25rem 0.6rem',
                                                    borderRadius: '0.25rem',
                                                    background: job.status === 'completed' ? 'rgba(34,197,94,0.1)' : 'rgba(59,130,246,0.1)',
                                                    color: job.status === 'completed' ? '#22c55e' : '#3b82f6',
                                                    textTransform: 'uppercase'
                                                }}>
                                                    {job.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem 1.5rem', fontWeight: 700 }}>
                                                ${job.price || 0}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {(view === 'analytics' || view === 'support') && (
                        <div style={{ textAlign: 'center', padding: '5rem', border: '1px dashed var(--border)', borderRadius: '1rem' }}>
                            <h3 style={{ color: 'var(--text-muted)' }}>Statistical insights are being compiled.</h3>
                        </div>
                    )}
                </div>
            </main>

            <style>{`
                .animate-fade-in {
                    animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default AdminDashboard;
