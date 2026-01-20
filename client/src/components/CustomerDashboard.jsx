import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import TechnicianList from './TechnicianList';
import BookingHistory from './BookingHistory';

const CustomerDashboard = ({ activeJob, setActiveJob, setActiveTab }) => {
    const { user, logout } = useAuth();
    const [view, setView] = useState('services'); // services, wallet, history, support, reviews, profile
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const menuItems = [
        { id: 'services', label: 'Service Search' },
        { id: 'history', label: 'Booking History' },
        { id: 'profile', label: 'Profile Settings' },
        { id: 'reviews', label: 'My Reviews' },
        { id: 'support', label: 'Support & Help' }
    ];

    const handleMenuClick = (id) => {
        setView(id);
        setMobileMenuOpen(false); // Close mobile menu after selection
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg)',
            display: 'flex',
            width: '100%',
            position: 'relative'
        }}>
            {/* Mobile Menu Toggle */}
            <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                style={{
                    position: 'fixed',
                    top: '1rem',
                    left: '1rem',
                    zIndex: 1001,
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem',
                    padding: '0.75rem',
                    cursor: 'pointer',
                    fontSize: '1.5rem'
                }}
                className="mobile-menu-toggle"
            >
                {mobileMenuOpen ? '✕' : '☰'}
            </button>

            {/* Mobile Backdrop Overlay */}
            {mobileMenuOpen && (
                <div
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.5)',
                        zIndex: 9,
                        backdropFilter: 'blur(2px)'
                    }}
                    className="mobile-backdrop"
                />
            )}

            {/* Sidebar */}
            <aside className="customer-sidebar">
                <div style={{
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 800,
                    fontSize: '1.5rem',
                    marginBottom: '3rem',
                    letterSpacing: '-0.02em'
                }}>
                    FixItNow
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => handleMenuClick(item.id)}
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'var(--card)',
                            border: '1px solid var(--border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.9rem',
                            fontWeight: 700
                        }}>
                            {user?.name?.charAt(0)}
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {user?.name}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Customer</div>
                        </div>
                    </div>
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
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'var(--card)'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    >
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="dashboard-main">
                {/* Header Section */}
                <header style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '3.5rem',
                    gap: '2rem'
                }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.6rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                            DASHBOARD // {menuItems.find(m => m.id === view)?.label?.toUpperCase()}
                        </div>
                        <h1 style={{
                            fontSize: '2.5rem',
                            fontWeight: 900,
                            fontFamily: 'var(--font-heading)',
                            margin: 0,
                            letterSpacing: '-0.03em'
                        }}>
                            Welcome, <span className="text-gradient">{user?.name?.split(' ')[0].toUpperCase()}</span>
                        </h1>
                    </div>

                    {/* Smart Insights Panel */}
                    <div className="desktop-only" style={{
                        display: 'flex',
                        gap: '1.5rem',
                        background: 'rgba(255,255,255,0.02)',
                        padding: '1.2rem 2rem',
                        borderRadius: '1.2rem',
                        border: '1px solid var(--border)',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <div style={{ borderRight: '1px solid var(--border)', paddingRight: '1.5rem' }}>
                            <div style={{ fontSize: '0.65rem', color: '#3b82f6', fontWeight: 900, marginBottom: '0.4rem', letterSpacing: '0.1em' }}>HOME HEALTH INDEX</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                <div style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: 'monospace' }}>94%</div>
                                <div style={{ width: '40px', height: '4px', background: '#22c55e30', borderRadius: '2px', overflow: 'hidden' }}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: '94%' }}
                                        style={{ height: '100%', background: '#22c55e' }}
                                    />
                                </div>
                            </div>
                        </div>
                        <div style={{ paddingLeft: '0.5rem' }}>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 900, marginBottom: '0.4rem', letterSpacing: '0.1em' }}>AI PREDICTION</div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)' }}>AC SERVICE DUE IN 12 DAYS</div>
                            <div style={{ fontSize: '0.7rem', color: '#f59e0b', fontWeight: 800 }}>⚡ OPTIMIZATION AVAILABLE</div>
                        </div>
                    </div>
                </header>

                {/* View Content */}
                <div style={{ width: '100%' }}>
                    {/* Active Job Alert */}
                    {activeJob && activeJob.status !== 'completed' && view === 'services' && (
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            style={{
                                marginBottom: '2rem',
                                padding: '2rem',
                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                borderRadius: '1.5rem',
                                color: 'white',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                boxShadow: '0 20px 40px rgba(59, 130, 246, 0.3)'
                            }}
                        >
                            <div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 900, opacity: 0.8, marginBottom: '0.5rem', letterSpacing: '0.1em' }}>ACTIVE JOB IN PROGRESS</div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, margin: '0 0 0.8rem 0' }}>{activeJob.serviceType}</h3>
                                <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                                    Status: <strong>{activeJob.status.toUpperCase().replace('_', ' ')}</strong>
                                </div>
                            </div>
                            <button
                                onClick={() => setActiveTab('home')}
                                style={{
                                    padding: '1rem 2rem',
                                    background: 'white',
                                    color: '#3b82f6',
                                    border: 'none',
                                    borderRadius: '1rem',
                                    fontWeight: 900,
                                    cursor: 'pointer',
                                    fontSize: '0.95rem',
                                    boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                                }}
                            >
                                VIEW TRACKING
                            </button>
                        </motion.div>
                    )}

                    {view === 'services' && (
                        <div className="animate-fade-in">
                            <TechnicianList onBookingSuccess={() => setView('history')} />
                        </div>
                    )}

                    {view === 'history' && (
                        <div className="animate-fade-in">
                            <BookingHistory />
                        </div>
                    )}

                    {(view === 'profile' || view === 'support' || view === 'wallet') && (
                        <div className="animate-fade-in" style={{
                            padding: '4rem 2rem',
                            border: '1px dashed var(--border)',
                            borderRadius: '1rem',
                            textAlign: 'center',
                            color: 'var(--text-muted)'
                        }}>
                            <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>🏗️</div>
                            <div style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text)' }}>Coming Soon</div>
                            <p style={{ fontSize: '0.9rem', margin: 0 }}>This specialized module is currently being optimized for your experience.</p>
                        </div>
                    )}

                    {view === 'reviews' && (
                        <div className="animate-fade-in" style={{
                            padding: '4rem 2rem',
                            border: '1px dashed var(--border)',
                            borderRadius: '1rem',
                            textAlign: 'center',
                            color: 'var(--text-muted)'
                        }}>
                            <div style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text)' }}>No reviews yet</div>
                            <p style={{ fontSize: '0.9rem', margin: 0 }}>Once you complete a service, you can rate your technician here.</p>
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

                /* Default: Desktop Styles (Base) */
                .mobile-menu-toggle {
                    display: none;
                }
                .mobile-backdrop {
                    display: none;
                }
                .customer-sidebar {
                    width: 280px;
                    border-right: 1px solid var(--border);
                    padding: 2rem 1.5rem;
                    display: flex;
                    flex-direction: column;
                    height: 100vh;
                    position: fixed;
                    left: 0;
                    top: 0;
                    z-index: 10;
                    background: var(--bg);
                    transform: translateX(0); /* Default visible */
                }
                .dashboard-main {
                    flex: 1;
                    margin-left: 280px; /* Space for sidebar */
                    padding: 2rem 3rem;
                    width: calc(100% - 280px);
                }

                /* Mobile Responsive Styles */
                @media (max-width: 768px) {
                    .mobile-menu-toggle {
                        display: block !important;
                    }

                    .mobile-backdrop {
                        display: block !important;
                    }

                    .desktop-only {
                        display: none !important;
                    }

                    .customer-sidebar {
                        transform: ${mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)'};
                        box-shadow: ${mobileMenuOpen ? '0 0 50px rgba(0,0,0,0.5)' : 'none'};
                        transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                        width: 280px; /* Fixed width sidebar on mobile too */
                        z-index: 1000; /* Below toggle button (1001) */
                    }
                    /* Let's put sidebar above content but below toggle if toggle is inside sidebar? 
                       Toggle is fixed at top-left. 
                       If sidebar opens, it covers top-left.
                       We want Toggle ('X') to be visible. Toggle z=1001. Sidebar z should be < 1001.
                       Sidebar z=10. This is fine.
                    */

                    .dashboard-main {
                        margin-left: 0 !important;
                        padding: 5rem 1.5rem 2rem !important;
                        width: 100%;
                    }
                }

                @media (min-width: 769px) {
                    /* Reinforce desktop rules if needed, but Base checks out */
                }
            `}</style>
        </div>
    );
};

export default CustomerDashboard;
