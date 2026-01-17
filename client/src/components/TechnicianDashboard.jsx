import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import BookingHistory from './BookingHistory'; // Assuming we want this viewable here too
import API_URL from '../config';

const TechnicianDashboard = () => {
    const { user, logout } = useAuth();
    const [stats, setStats] = useState({ earnings: 1250.45, jobs: 12, rating: 4.88 });
    const [isAvailable, setIsAvailable] = useState(true);
    const [view, setView] = useState('overview'); // overview, history, payments, settings

    const toggleAvailability = async () => {
        try {
            const newState = !isAvailable;
            await fetch(`${API_URL}/api/technicians/${user.id}/availability`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isAvailable: newState })
            });
            setIsAvailable(newState);
        } catch (err) {
            console.error(err);
        }
    };

    const menuItems = [
        { id: 'overview', label: 'Command Center' },
        { id: 'jobs', label: 'Active Projects' },
        { id: 'history', label: 'Completed Jobs' },
        { id: 'payments', label: 'Earnings & Payouts' },
        { id: 'settings', label: 'Profile Settings' }
    ];

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg)',
            display: 'flex',
            width: '100%',
            position: 'relative',
            color: 'var(--text)'
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
                zIndex: 10,
                background: 'var(--bg)'
            }}>
                <div style={{
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 800,
                    fontSize: '1.4rem',
                    marginBottom: '3rem',
                    letterSpacing: '-0.03em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    PRO <span style={{ fontWeight: 300, opacity: 0.5 }}>/ terminal</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
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
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                            }}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginTop: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '0.4rem',
                            background: 'var(--text)',
                            color: 'var(--bg)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.85rem',
                            fontWeight: 800
                        }}>
                            {user?.name?.charAt(0)}
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                                {user?.name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                Verified Pro
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        style={{
                            width: '100%',
                            padding: '0.7rem',
                            borderRadius: '0.4rem',
                            border: '1px solid var(--border)',
                            background: 'transparent',
                            color: 'var(--text)',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        Disconnect
                    </button>
                </div>
            </aside>

            {/* Main Workspace */}
            <main style={{
                flex: 1,
                marginLeft: '280px',
                padding: '2.5rem 4rem'
            }}>
                {/* Status & Action Bar */}
                <header style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '4rem'
                }}>
                    <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                            {view} / active_session
                        </div>
                        <h1 style={{
                            fontSize: '1.8rem',
                            fontWeight: 800,
                            fontFamily: 'var(--font-heading)',
                            margin: 0,
                            letterSpacing: '-0.02em'
                        }}>
                            Welcome, {user?.name?.split(' ')[0]}
                        </h1>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.6rem',
                                background: isAvailable ? 'rgba(34,197,94,0.1)' : 'rgba(100,116,139,0.1)',
                                padding: '0.5rem 1.2rem',
                                borderRadius: '2rem',
                                border: `1px solid ${isAvailable ? 'rgba(34,197,94,0.2)' : 'rgba(100,116,139,0.2)'}`
                            }}>
                                <span style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: isAvailable ? '#22c55e' : '#64748b'
                                }}></span>
                                <span style={{
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    color: isAvailable ? '#22c55e' : '#64748b',
                                    textTransform: 'uppercase'
                                }}>
                                    {isAvailable ? 'Available for Jobs' : 'Offline / Standby'}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={toggleAvailability}
                            style={{
                                background: 'var(--text)',
                                color: 'var(--bg)',
                                border: 'none',
                                padding: '0.6rem 1.5rem',
                                borderRadius: '0.4rem',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'opacity 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                            onMouseLeave={(e) => e.target.style.opacity = '1'}
                        >
                            {isAvailable ? 'Go Offline' : 'Go Live'}
                        </button>
                    </div>
                </header>

                {/* Grid Content */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                    <div style={{
                        padding: '1.5rem',
                        background: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '0.5rem'
                    }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem', fontWeight: 600, letterSpacing: '0.05em' }}>NET EARNINGS</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>${stats.earnings.toFixed(2)}</div>
                        <div style={{ fontSize: '0.8rem', color: '#22c55e', marginTop: '0.5rem', fontWeight: 600 }}>+12.5% vs last month</div>
                    </div>
                    <div style={{
                        padding: '1.5rem',
                        background: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '0.5rem'
                    }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem', fontWeight: 600, letterSpacing: '0.05em' }}>COMPLETED JOBS</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>{stats.jobs}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Average 2.4 jobs / day</div>
                    </div>
                    <div style={{
                        padding: '1.5rem',
                        background: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '0.5rem'
                    }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem', fontWeight: 600, letterSpacing: '0.05em' }}>CLIENT RATING</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>{stats.rating}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Based on 48 reviews</div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="animate-fade-in">
                    {view === 'overview' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '0.5rem', padding: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Recent Activity</h3>
                                    <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>View All</button>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    {[1, 2, 3].map(i => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.2rem' }}>Pipe Leak Repair #2841</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Customer: Alice C. • Completed 4h ago</div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>+$85.00</div>
                                                <div style={{ fontSize: '0.75rem', color: '#22c55e', fontWeight: 600 }}>PAID</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div style={{ background: 'black', color: 'white', border: '1px solid #333', borderRadius: '0.5rem', padding: '1.5rem' }}>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1.5rem 0' }}>Job Notifications</h3>
                                    {isAvailable ? (
                                        <div style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: '1.6' }}>
                                            You are currently in the live queue. New job requests will appear here in real-time.
                                        </div>
                                    ) : (
                                        <div style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: '1.6' }}>
                                            You are currently offline. Go live to start receiving service requests in your area.
                                        </div>
                                    )}
                                </div>

                                <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '0.5rem', padding: '1.5rem' }}>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1rem 0' }}>Support</h3>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                                        Need technical help or have a billing query?
                                    </div>
                                    <button style={{
                                        width: '100%',
                                        padding: '0.7rem',
                                        borderRadius: '0.4rem',
                                        border: '1px solid var(--border)',
                                        background: 'transparent',
                                        color: 'var(--text)',
                                        fontSize: '0.85rem',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}>
                                        Open Support Ticket
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {view === 'history' && <BookingHistory role="technician" />}

                    {view === 'jobs' && (
                        <div style={{ textAlign: 'center', padding: '4rem', border: '1px dashed var(--border)', borderRadius: '0.5rem' }}>
                            <div style={{ fontWeight: 600, color: 'var(--text-muted)' }}>No active projects. Jobs will appear here once accepted.</div>
                        </div>
                    )}

                    {(view === 'payments' || view === 'settings') && (
                        <div style={{ textAlign: 'center', padding: '4rem', border: '1px dashed var(--border)', borderRadius: '0.5rem' }}>
                            <div style={{ fontWeight: 600, color: 'var(--text-muted)' }}>This module is currently being optimized. Checkout soon.</div>
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

export default TechnicianDashboard;
