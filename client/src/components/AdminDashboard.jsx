import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';
import { Menu, X, Check, Ban, Activity, DollarSign, Users, Bell } from 'lucide-react';

const AdminDashboard = () => {
    const { logout } = useAuth();
    const [technicians, setTechnicians] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [view, setView] = useState('techs'); // 'techs', 'bookings', 'analytics', 'support'
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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
            await fetch(`${API_URL}/api/admin/approve-technician/${id}`, { method: 'PUT' });
            fetchTechnicians();
        } catch (err) { console.error(err); }
    };

    const toggleBlockTech = async (id, currentStatus) => {
        try {
            await fetch(`${API_URL}/api/admin/block-technician/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isBlocked: !currentStatus })
            });
            fetchTechnicians();
        } catch (err) { console.error(err); }
    };

    const stats = {
        totalEarnings: bookings.filter(b => b.status === 'completed').reduce((acc, curr) => acc + (curr.price || 0), 0),
        activeTechs: technicians.filter(t => t.isAvailable && !t.isBlocked).length,
        pendingTechs: technicians.filter(t => !t.isVerified).length,
        pendingBookings: bookings.filter(b => b.status === 'pending').length,
        avgRating: technicians.length > 0
            ? (technicians.reduce((acc, curr) => acc + curr.rating, 0) / technicians.length).toFixed(1)
            : 5.0
    };

    const menuItems = [
        { id: 'techs', label: 'Technician Hub', icon: Users },
        { id: 'bookings', label: 'Project Ledger', icon: Activity },
        { id: 'analytics', label: 'Growth Insights', icon: DollarSign },
        { id: 'support', label: 'System Alerts', icon: Bell }
    ];

    // Dummy Alerts for Demo
    const systemAlerts = [
        { id: 1, type: 'info', msg: 'System backup completed successfully.', time: '10m ago' },
        { id: 2, type: 'warning', msg: 'High demand detected in New York area.', time: '1h ago' },
        { id: 3, type: 'success', msg: 'New technician registration batch processed.', time: '2h ago' },
        { id: 4, type: 'error', msg: 'Payment gateway latency spike observed.', time: '5h ago' },
    ];

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg)',
            display: 'flex',
            width: '100%',
            position: 'relative',
            textAlign: 'left',
            fontFamily: '"Inter", sans-serif',
            overflowX: 'hidden'
        }}>
            {/* Mobile Overlay */}
            {isMobile && sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40,
                        backdropFilter: 'blur(4px)'
                    }}
                />
            )}

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
                zIndex: 50,
                background: 'var(--bg)',
                transform: isMobile ? (sidebarOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none',
                transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <div style={{
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 800,
                        fontSize: '1.5rem',
                        letterSpacing: '-0.02em',
                        color: 'var(--text)'
                    }}>
                        Admin.
                    </div>
                    {isMobile && (
                        <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)' }}>
                            <X size={24} />
                        </button>
                    )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                    {menuItems.map(item => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.id}
                                onClick={() => { setView(item.id); if (isMobile) setSidebarOpen(false); }}
                                style={{
                                    textAlign: 'left',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '0.5rem',
                                    border: 'none',
                                    background: view === item.id ? 'var(--text)' : 'transparent',
                                    color: view === item.id ? 'var(--bg)' : 'var(--text-muted)',
                                    fontSize: '0.9rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.8rem'
                                }}
                            >
                                <Icon size={18} />
                                {item.label}
                                {item.id === 'techs' && stats.pendingTechs > 0 && (
                                    <span style={{ fontSize: '0.7rem', background: '#ef4444', color: 'white', padding: '0.1rem 0.4rem', borderRadius: '1rem', marginLeft: 'auto' }}>
                                        {stats.pendingTechs}
                                    </span>
                                )}
                            </button>
                        );
                    })}
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
                marginLeft: isMobile ? 0 : '280px',
                padding: isMobile ? '1.5rem' : '2rem 3.3rem',
                transition: 'margin-left 0.3s ease',
                width: '100%',
                overflowX: 'hidden'
            }}>
                {/* Mobile Header Toggle */}
                {isMobile && (
                    <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--text)' }}>
                            <Menu size={24} />
                        </button>
                        <span style={{ fontWeight: 800, fontSize: '1.2rem', fontFamily: 'var(--font-heading)' }}>FixItNow</span>
                    </div>
                )}

                {/* Header */}
                <header style={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    justifyContent: 'space-between',
                    alignItems: isMobile ? 'flex-start' : 'flex-end',
                    gap: isMobile ? '1rem' : 0,
                    marginBottom: '3rem'
                }}>
                    <div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            ROOT CONTROL / {menuItems.find(m => m.id === view)?.label}
                        </div>
                        <h1 style={{
                            fontSize: isMobile ? '1.8rem' : '2rem',
                            fontWeight: 800,
                            fontFamily: 'var(--font-heading)',
                            margin: 0
                        }}>
                            Platform Command
                        </h1>
                    </div>

                    <div style={{ display: 'flex', gap: '2rem' }}>
                        <div style={{ textAlign: isMobile ? 'left' : 'right' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>TOTAL VOLUME</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>${stats.totalEarnings.toFixed(2)}</div>
                        </div>
                        <div style={{ textAlign: isMobile ? 'left' : 'right' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>AVG RATING</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{stats.avgRating}</div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div style={{ width: '100%' }} className="animate-fade-in">
                    {view === 'techs' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {technicians.length === 0 && <div style={{ color: 'var(--text-muted)', padding: '2rem' }}>No technicians found.</div>}
                            {technicians.sort((a, b) => (a.isVerified === b.isVerified) ? 0 : a.isVerified ? 1 : -1).map(tech => (
                                <div key={tech._id} style={{
                                    padding: '1.5rem',
                                    background: 'var(--card)',
                                    border: `1px solid ${!tech.isVerified ? '#f59e0b' : 'var(--border)'}`,
                                    borderRadius: '0.75rem',
                                    display: 'flex',
                                    flexDirection: isMobile ? 'column' : 'row',
                                    justifyContent: 'space-between',
                                    alignItems: isMobile ? 'flex-start' : 'center',
                                    gap: '1.5rem',
                                    opacity: tech.isBlocked ? 0.6 : 1,
                                    position: 'relative'
                                }}>
                                    {!tech.isVerified && (
                                        <div style={{
                                            position: 'absolute', top: '-10px', left: '20px', background: '#f59e0b', color: 'black',
                                            fontSize: '0.65rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '1rem',
                                            letterSpacing: '0.05em'
                                        }}>
                                            PENDING APPROVAL
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                                            {tech.name[0]}
                                        </div>
                                        <div>
                                            <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem' }}>{tech.name} {tech.isBlocked && <span style={{ color: 'var(--error)', fontSize: '0.7rem' }}>(BLOCKED)</span>}</h4>
                                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                                                <span>{tech.serviceType}</span>
                                                <span>•</span>
                                                <span>{tech.email}</span>
                                                <span>•</span>
                                                <span>{tech.rating}⭐</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem', width: isMobile ? '100%' : 'auto' }}>
                                        {!tech.isVerified && (
                                            <button
                                                className="btn-approve"
                                                onClick={() => approveTech(tech._id)}
                                                style={{
                                                    flex: 1, padding: '0.6rem 1.2rem', fontSize: '0.85rem',
                                                    background: '#22c55e', color: 'white', border: 'none',
                                                    borderRadius: '0.4rem', fontWeight: 700, cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                                                }}
                                            >
                                                <Check size={16} /> APPROVE
                                            </button>
                                        )}
                                        <button
                                            onClick={() => toggleBlockTech(tech._id, tech.isBlocked)}
                                            style={{
                                                flex: 1, padding: '0.6rem 1.2rem', fontSize: '0.85rem',
                                                background: 'transparent', color: tech.isBlocked ? 'var(--text)' : '#ef4444',
                                                border: `1px solid ${tech.isBlocked ? 'var(--border)' : '#ef4444'}`,
                                                borderRadius: '0.4rem', fontWeight: 700, cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                                            }}
                                        >
                                            <Ban size={16} /> {tech.isBlocked ? 'UNBLOCK' : 'REJECT'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {view === 'bookings' && (
                        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '0.75rem', overflow: 'hidden' }}>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
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
                        </div>
                    )}

                    {view === 'analytics' && (
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '1.5rem' }}>
                            <div style={{ background: 'var(--card)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
                                <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>REVENUE GROWTH</h3>
                                <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>+128%</div>
                                <div style={{ marginTop: '0.5rem', color: '#22c55e', fontSize: '0.9rem' }}>↗ Record High</div>
                            </div>
                            <div style={{ background: 'var(--card)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
                                <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>ACTIVE EXPERTS</h3>
                                <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>{stats.activeTechs}</div>
                                <div style={{ marginTop: '0.5rem', color: '#3b82f6', fontSize: '0.9rem' }}>Deployable Now</div>
                            </div>
                            <div style={{ background: 'var(--card)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
                                <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>CLIENT SATISFACTION</h3>
                                <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>{stats.avgRating}</div>
                                <div style={{ marginTop: '0.5rem', color: '#22c55e', fontSize: '0.9rem' }}>★★★★★ Five Star</div>
                            </div>
                        </div>
                    )}

                    {view === 'support' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {systemAlerts.map(alert => (
                                <div key={alert.id} style={{
                                    padding: '1.5rem',
                                    background: 'var(--card)',
                                    borderLeft: `4px solid ${alert.type === 'error' ? '#ef4444' : alert.type === 'warning' ? '#f59e0b' : '#22c55e'}`,
                                    borderRadius: '0.5rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div style={{ fontWeight: 600 }}>{alert.msg}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{alert.time}</div>
                                </div>
                            ))}
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
