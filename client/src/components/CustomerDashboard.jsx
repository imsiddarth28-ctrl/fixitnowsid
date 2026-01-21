import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, Bell, Settings, LogOut, Plus,
    ArrowRight, CheckCircle, Clock, Shield,
    User, MessageSquare, Calendar, DollarSign,
    Star, Wallet, History, HelpCircle, Search, Menu, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import BookingHistory from './BookingHistory';
import ProfileSettings from './ProfileSettings';
import SupportHelp from './SupportHelp';
import UserAvatar from './UserAvatar';
import API_URL from '../config';

const CustomerDashboard = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [activeView, setActiveView] = useState('overview');
    const [stats, setStats] = useState({
        totalBookings: 0,
        activeJobs: 0,
        completedJobs: 0,
        totalSpent: 0
    });
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);

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
    }, []);

    const fetchDashboardData = async () => {
        try {
            const res = await fetch(`${API_URL}/api/customers/${user.id}/dashboard`);
            if (res.ok) {
                const data = await res.json();
                setStats(data.stats || stats);
            }
        } catch (err) {
            console.error('Dashboard error:', err);
        } finally {
            setLoading(false);
        }
    };

    const NavItem = ({ id, icon: Icon, label }) => {
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
                <span>{label}</span>
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
                    <div className="badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--text)', height: 'fit-content' }}>
                        {trend}
                    </div>
                )}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: '500' }}>{label}</div>
            <div style={{ fontSize: '2rem', color: 'var(--text)', fontWeight: '800', letterSpacing: '-0.03em' }}>{value}</div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', display: 'flex' }}>
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
                                    <Activity size={18} />
                                </div>
                                <span style={{ fontSize: '1.25rem', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>FixItNow</span>
                            </div>
                            {window.innerWidth < 1024 && (
                                <button onClick={() => setIsSidebarOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text)' }}>
                                    <X size={20} />
                                </button>
                            )}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                            <NavItem id="overview" icon={Activity} label="Overview" />
                            <NavItem id="history" icon={History} label="My Bookings" />
                            <NavItem id="wallet" icon={Wallet} label="Wallet & Pay" />
                            <NavItem id="support" icon={HelpCircle} label="Help Center" />
                            <NavItem id="profile" icon={Settings} label="Settings" />
                        </div>

                        <div className="glass" style={{ padding: '20px', borderRadius: 'var(--radius-lg)', marginBottom: '24px' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px' }}>Pro Support</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Get priority assistance for any service issues.</div>
                            <button className="btn btn-primary" style={{ width: '100%', padding: '0.6rem', fontSize: '0.8rem' }}>Contact Us</button>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px' }}>
                            <UserAvatar size={40} />
                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                <div style={{ fontSize: '0.9rem', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Customer Account</div>
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
                transition: 'margin 0.3sease'
            }}>
                {/* Header */}
                <header style={{
                    padding: '24px 40px',
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
                        <button onClick={toggleTheme} className="btn-secondary" style={{ padding: '0.6rem', borderRadius: '12px' }}>
                            {theme === 'dark' ? '☀️' : '🌙'}
                        </button>
                        <button className="btn btn-primary">
                            <Plus size={18} />
                            <span className="desktop-only">New Booking</span>
                        </button>
                    </div>
                </header>

                <div className="container" style={{ padding: '40px' }}>
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
                                        Hello, {user?.name?.split(' ')[0]}
                                    </h1>
                                    <p style={{ color: 'var(--text-secondary)' }}>Everything is running smoothly. How can we help today?</p>
                                </div>

                                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '48px' }}>
                                    <StatCard
                                        label="Live Tracking"
                                        value={stats.activeJobs}
                                        icon={Activity}
                                        trend={stats.trends?.active || "OFFLINE"}
                                    />
                                    <StatCard
                                        label="Fulfilled Jobs"
                                        value={stats.completedJobs}
                                        icon={CheckCircle}
                                        trend={stats.trends?.completed || "+0"}
                                    />
                                    <StatCard
                                        label="Wallet Balance"
                                        value={`$${stats.totalSpent}`}
                                        icon={Wallet}
                                        trend={stats.trends?.spent || "STANDARD"}
                                    />
                                    <StatCard
                                        label="Trust Score"
                                        value={stats.trends?.trust?.score || "5.0"}
                                        icon={Star}
                                        trend={stats.trends?.trust?.label || "VERIFIED"}
                                    />
                                </div>

                                <section>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                        <h3 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Quick Access</h3>
                                    </div>
                                    <div className="bento-grid">
                                        {[
                                            { title: 'Emergency', desc: 'Instant dispatch', icon: Shield, col: 'span 4' },
                                            { title: 'Find Pros', desc: 'Browse experts', icon: Search, col: 'span 4' },
                                            { title: 'Messages', desc: 'Chat with team', icon: MessageSquare, col: 'span 4' },
                                            { title: 'History', desc: 'Recent receipts', icon: History, col: 'span 6' },
                                            { title: 'Settings', desc: 'Profile & privacy', icon: Settings, col: 'span 6' }
                                        ].map((action, i) => (
                                            <motion.div
                                                key={i}
                                                whileHover={{ y: -4 }}
                                                className="bento-card"
                                                style={{
                                                    gridColumn: action.col,
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <div style={{ marginBottom: '16px', color: 'var(--text)' }}><action.icon size={28} /></div>
                                                <div style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '4px' }}>{action.title}</div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{action.desc}</div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </section>
                            </motion.div>
                        )}

                        {activeView === 'history' && (
                            <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <BookingHistory type="customer" />
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

export default CustomerDashboard;
