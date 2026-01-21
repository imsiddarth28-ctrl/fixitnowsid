import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, Bell, Settings, LogOut, CheckCircle,
    Clock, Shield, User, MessageSquare, DollarSign,
    Star, Wallet, History, HelpCircle, Target,
    Briefcase, AlertTriangle, ArrowUpRight, Menu, X, Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import BookingHistory from './BookingHistory';
import ProfileSettings from './ProfileSettings';
import SupportHelp from './SupportHelp';
import UserAvatar from './UserAvatar';
import API_URL from '../config';
import { subscribeToEvent } from '../socket';

const TechnicianDashboard = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [activeView, setActiveView] = useState('overview');
    const [stats, setStats] = useState({
        activeJobs: 0,
        completedToday: 0,
        totalEarnings: 0,
        rating: 4.9,
        pendingRequests: 0
    });
    const [pendingRequests, setPendingRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
    const [isAvailable, setIsAvailable] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) setIsSidebarOpen(true);
            else setIsSidebarOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        fetchDashboardData();

        if (!user) return;

        // Listen for new job requests or job status updates (e.g. cancellation)
        const unsub1 = subscribeToEvent(`user-${user.id}`, 'new_job_request', fetchDashboardData);
        const unsub2 = subscribeToEvent(`user-${user.id}`, 'job_update', fetchDashboardData);

        return () => {
            unsub1();
            unsub2();
        };
    }, [user]);

    const fetchDashboardData = async () => {
        try {
            const res = await fetch(`${API_URL}/api/technicians/${user.id}/dashboard`);
            if (res.ok) {
                const data = await res.json();
                setStats(data.stats || stats);
                setPendingRequests(data.pendingRequests || []);
                setIsAvailable(data.isAvailable);
            }
        } catch (err) {
            console.error('Tech Dashboard error:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleAvailability = async () => {
        try {
            const res = await fetch(`${API_URL}/api/technicians/${user.id}/availability`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isAvailable: !isAvailable })
            });
            if (res.ok) {
                const data = await res.json();
                setIsAvailable(data.isAvailable);
                fetchDashboardData();
            }
        } catch (err) {
            console.error('Availability toggle error:', err);
        }
    };

    const NavItem = ({ id, icon: Icon, label, badge }) => {
        const isActive = activeView === id;
        return (
            <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                    setActiveView(id);
                    if (window.innerWidth < 1024) setIsSidebarOpen(false);
                }}
                className={isActive ? 'glass' : ''}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 18px',
                    width: '100%',
                    background: isActive ? 'var(--bg-tertiary)' : 'transparent',
                    color: isActive ? 'var(--text)' : 'var(--text-secondary)',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    fontWeight: isActive ? '600' : '500',
                    transition: 'all 0.2s ease',
                    textAlign: 'left'
                }}
            >
                <Icon size={20} style={{ opacity: isActive ? 1 : 0.7 }} />
                <span style={{ flex: 1 }}>{label}</span>
                {badge > 0 && (
                    <span style={{
                        background: 'var(--accent)', color: 'var(--accent-foreground)',
                        fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px', fontWeight: '800'
                    }}>
                        {badge}
                    </span>
                )}
            </motion.button>
        );
    };

    const StatCard = ({ label, value, icon: Icon, trend }) => (
        <div className="bento-card" style={{ flex: 1, minWidth: '240px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div style={{
                    width: '40px', height: '40px', background: 'var(--bg-tertiary)',
                    borderRadius: '12px', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: 'var(--text)'
                }}>
                    <Icon size={20} />
                </div>
                {trend && (
                    <div className="badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--success)', height: 'fit-content' }}>
                        {trend}
                    </div>
                )}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: '500' }}>{label}</div>
            <div style={{ fontSize: '1.6rem', color: 'var(--text)', fontWeight: '800', letterSpacing: '-0.03em' }}>{value}</div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', width: '100%', background: 'var(--bg)', color: 'var(--text)', display: 'flex' }}>
            {/* Sidebar */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.aside
                        initial={{ x: -300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -300, opacity: 0 }}
                        style={{
                            position: 'fixed',
                            left: 0, top: 0, bottom: 0,
                            width: '280px',
                            background: 'var(--bg-secondary)',
                            borderRight: '1px solid var(--border)',
                            padding: '24px',
                            display: 'flex',
                            flexDirection: 'column',
                            zIndex: 1000
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '32px', height: '32px', background: 'var(--accent)',
                                    borderRadius: '10px', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', color: 'var(--accent-foreground)'
                                }}>
                                    <Zap size={18} />
                                </div>
                                <span style={{ fontSize: '1.25rem', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>FixItNow</span>
                                <span style={{ fontSize: '0.65rem', background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px', fontWeight: '800' }}>PRO</span>
                            </div>
                            {window.innerWidth < 1024 && (
                                <button onClick={() => setIsSidebarOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text)' }}>
                                    <X size={20} />
                                </button>
                            )}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                            <NavItem id="overview" icon={Activity} label="Status" />
                            <NavItem id="requests" icon={AlertTriangle} label="Requests" badge={stats.pendingRequests} />
                            <NavItem id="history" icon={History} label="Completed" />
                            <NavItem id="wallet" icon={Wallet} label="Earnings" />
                            <NavItem id="support" icon={HelpCircle} label="Support" />
                            <NavItem id="profile" icon={Settings} label="Profile" />
                        </div>

                        <div style={{ padding: '20px', borderRadius: 'var(--radius-lg)', background: isAvailable ? 'var(--bg-tertiary)' : 'var(--text)', color: isAvailable ? 'var(--text)' : 'var(--bg)', marginBottom: '24px', transition: 'all 0.3s ease' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: '700', marginBottom: '4px' }}>{isAvailable ? 'Presence Active' : 'Presence Hidden'}</div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '16px' }}>{isAvailable ? 'You are visible to customers in your area.' : 'Go online to start receiving new service requests.'}</div>
                            <button
                                onClick={toggleAvailability}
                                className="btn"
                                style={{
                                    width: '100%',
                                    padding: '0.6rem',
                                    fontSize: '0.8rem',
                                    background: isAvailable ? 'var(--bg)' : 'var(--bg)',
                                    color: 'var(--text)',
                                    fontWeight: '800'
                                }}
                            >
                                {isAvailable ? 'GO OFFLINE' : 'GO ONLINE'}
                            </button>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px' }}>
                            <UserAvatar size={40} />
                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                <div style={{ fontSize: '0.9rem', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Expert Professional</div>
                            </div>
                            <button onClick={logout} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}>
                                <LogOut size={18} />
                            </button>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Main Wrapper */}
            <main style={{
                flex: 1,
                marginLeft: isSidebarOpen && window.innerWidth >= 1024 ? '280px' : '0',
                padding: '0 0 100px 0',
                transition: 'margin 0.3s ease'
            }}>
                {/* Header */}
                <header style={{
                    padding: 'var(--container-padding)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                    background: 'var(--glass-bg)',
                    backdropFilter: 'blur(12px)',
                    borderBottom: '1px solid var(--border)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {!isSidebarOpen && (
                            <button onClick={() => setIsSidebarOpen(true)} style={{ background: 'none', border: 'none', color: 'var(--text)' }}>
                                <Menu size={24} />
                            </button>
                        )}
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                            {activeView.charAt(0).toUpperCase() + activeView.slice(1)}
                        </h2>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingRight: '12px', borderRight: '1px solid var(--border)' }}>
                            <span style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: isAvailable ? '#10b981' : 'var(--text-muted)',
                                boxShadow: isAvailable ? '0 0 10px #10b981' : 'none'
                            }}></span>
                            <span style={{
                                fontSize: '0.85rem',
                                fontWeight: '800',
                                color: isAvailable ? '#10b981' : 'var(--text-muted)',
                                letterSpacing: '0.05em'
                            }}>
                                {isAvailable ? 'ONLINE' : 'OFFLINE'}
                            </span>
                        </div>
                        <button onClick={toggleTheme} className="btn-secondary" style={{ padding: '0.6rem', borderRadius: '12px' }}>
                            {theme === 'dark' ? '☀️' : '🌙'}
                        </button>
                    </div>
                </header>

                <div style={{ padding: 'var(--container-padding)', maxWidth: '1800px', margin: '0 auto', width: '100%' }}>
                    <AnimatePresence mode="wait">
                        {activeView === 'overview' && (
                            <motion.div
                                key="overview"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <div style={{ marginBottom: '40px' }}>
                                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-0.04em', marginBottom: '8px' }}>
                                        Welcome back, {user?.name?.split(' ')[0]}
                                    </h1>
                                    <p style={{ color: 'var(--text-secondary)' }}>You have {stats.pendingRequests} new service requests waiting for your review.</p>
                                </div>

                                <div style={{ display: 'flex', gap: 'var(--gap)', flexWrap: 'wrap', marginBottom: 'var(--container-padding)' }}>
                                    <StatCard label="Live Jobs" value={stats.activeJobs} icon={Briefcase} trend="ACTIVE" />
                                    <StatCard label="Finished Today" value={stats.completedToday} icon={CheckCircle} trend="+1" />
                                    <StatCard label="Total Earnings" value={`$${stats.totalEarnings}`} icon={DollarSign} trend="+15%" />
                                    <StatCard label="My Rating" value={stats.rating} icon={Star} trend="TOP-TIER" />
                                </div>

                                <section>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                        <h3 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Incoming Requests</h3>
                                        <button onClick={() => setActiveView('requests')} className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>View All</button>
                                    </div>

                                    {pendingRequests.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {pendingRequests.slice(0, 3).map((req, i) => (
                                                <motion.div
                                                    key={i}
                                                    whileHover={{ x: 4 }}
                                                    className="bento-card"
                                                    style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        padding: '1.5rem 2rem'
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                                        <div className="glass" style={{ width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <Activity size={24} />
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: '800', fontSize: '1.1rem' }}>{req.serviceType}</div>
                                                            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Customer: {req.customerName} • {req.distance || '2.4 km'} away</div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => setActiveView('requests')}
                                                        className="btn btn-primary"
                                                        style={{ padding: '0.8rem 1.8rem' }}
                                                    >
                                                        Review Request
                                                    </button>
                                                </motion.div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="glass" style={{
                                            padding: '80px',
                                            borderRadius: 'var(--radius-lg)',
                                            textAlign: 'center'
                                        }}>
                                            <div style={{ color: 'var(--text-muted)', marginBottom: '16px' }}><CheckCircle size={48} style={{ margin: '0 auto' }} /></div>
                                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px' }}>All caught up!</h3>
                                            <p style={{ color: 'var(--text-secondary)' }}>Stay online to receive new opportunities near you.</p>
                                        </div>
                                    )}
                                </section>
                            </motion.div>
                        )}

                        {activeView === 'requests' && (
                            <motion.div key="requests" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '32px' }}>Service Queue</h2>
                                <div className="glass" style={{ padding: '100px', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Detailed queue management system loading...</p>
                                </div>
                            </motion.div>
                        )}

                        {activeView === 'history' && (
                            <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <BookingHistory type="technician" />
                            </motion.div>
                        )}

                        {activeView === 'profile' && (
                            <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <ProfileSettings />
                            </motion.div>
                        )}

                        {activeView === 'support' && (
                            <motion.div key="support" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <SupportHelp />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default TechnicianDashboard;
