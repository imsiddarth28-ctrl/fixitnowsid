import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import TechnicianList from './TechnicianList';
import Wallet from './Wallet';
import BookingHistory from './BookingHistory';
import Support from './Support';

const CustomerDashboard = () => {
    const { user, logout } = useAuth();
    const [view, setView] = useState('services'); // services, wallet, history, support, reviews

    const menuItems = [
        { id: 'services', label: 'Service Search' },
        { id: 'wallet', label: 'Payment & Wallet' },
        { id: 'history', label: 'Booking History' },
        { id: 'reviews', label: 'My Reviews' },
        { id: 'support', label: 'Support & Help' }
    ];

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg)',
            display: 'flex',
            width: '100%',
            position: 'relative'
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
                    letterSpacing: '-0.02em'
                }}>
                    FixItNow
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
            <main style={{
                flex: 1,
                marginLeft: '280px',
                padding: '2rem 3rem'
            }}>
                {/* Header Section */}
                <header style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    marginBottom: '3rem'
                }}>
                    <div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                            Dashboard / {menuItems.find(m => m.id === view)?.label}
                        </div>
                        <h1 style={{
                            fontSize: '2rem',
                            fontWeight: 800,
                            fontFamily: 'var(--font-heading)',
                            margin: 0
                        }}>
                            Welcome back, {user?.name?.split(' ')[0]}
                        </h1>
                    </div>

                    <div style={{ display: 'flex', gap: '2rem' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>WALLET BALANCE</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>${user?.walletBalance || '0.00'}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>PENDING JOBS</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>0</div>
                        </div>
                    </div>
                </header>

                {/* View Content */}
                <div style={{ width: '100%' }}>
                    {view === 'services' && (
                        <div className="animate-fade-in">
                            <TechnicianList />
                        </div>
                    )}

                    {view === 'wallet' && (
                        <div className="animate-fade-in">
                            <Wallet />
                        </div>
                    )}

                    {view === 'history' && (
                        <div className="animate-fade-in">
                            <BookingHistory />
                        </div>
                    )}

                    {view === 'support' && (
                        <div className="animate-fade-in">
                            <Support />
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
            `}</style>
        </div>
    );
};

export default CustomerDashboard;
