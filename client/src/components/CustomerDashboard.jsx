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
import TechnicianList from './TechnicianList';
import API_URL from '../config';
import { subscribeToEvent } from '../socket';

const CustomerDashboard = ({ setActiveTab, activeJob, setActiveJob }) => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [activeView, setActiveView] = useState('overview');
    const [stats, setStats] = useState({
        totalBookings: 0,
        activeJobs: 0,
        completedJobs: 0,
        totalSpent: 0,
        trends: {}
    });
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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

        // Listen for job status changes to refresh dashboard stats
        const unsub = subscribeToEvent(`user-${user.id}`, 'job_update', fetchDashboardData);

        return () => unsub();
    }, [user]);

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
                    background: isActive ? 'var(--text)' : 'transparent',
                    color: isActive ? 'var(--bg)' : 'var(--text-secondary)',
                    border: 'none',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: isActive ? '800' : '600',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    textAlign: 'left'
                }}
            >
                <Icon size={18} style={{ opacity: isActive ? 1 : 0.7 }} />
                <span>{label.toUpperCase()}</span>
            </motion.button>
        );
    };

    const StatCard = ({ label, value, icon: Icon, trend }) => (
        <div className="bento-card glass" style={{ flex: '1 1 240px', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div style={{
                    width: '48px', height: '48px', background: 'var(--text)',
                    borderRadius: '16px', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: 'var(--bg)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                }}>
                    <Icon size={22} />
                </div>
                {trend && (
                    <div className="badge" style={{
                        background: 'var(--bg-tertiary)',
                        color: 'var(--text)',
                        height: 'fit-content',
                        fontSize: '0.65rem',
                        fontWeight: '900',
                        letterSpacing: '0.05em'
                    }}>
                        {trend}
                    </div>
                )}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '800', letterSpacing: '0.05em' }}>{label.toUpperCase()}</div>
            <div style={{ fontSize: '1.8rem', color: 'var(--text)', fontWeight: '900', letterSpacing: '-0.04em' }}>{value}</div>
        </div>
    );

    const ThemeToggle3D = () => (
        <motion.button
            onClick={toggleTheme}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
                width: '56px',
                height: '56px',
                borderRadius: '18px',
                background: 'var(--text)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                overflow: 'hidden'
            }}
        >
            <motion.div
                animate={{ rotateY: theme === 'dark' ? 180 : 0 }}
                transition={{ duration: 0.6, type: 'spring', stiffness: 200, damping: 20 }}
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transformStyle: 'preserve-3d'
                }}
            >
                {theme === 'light' ? (
                    <Activity size={24} color="var(--bg)" />
                ) : (
                    <Shield size={24} color="var(--bg)" style={{ transform: 'rotateY(180deg)' }} />
                )}
            </motion.div>
        </motion.button>
    );

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', display: 'flex' }}>
            {/* Logout Confirmation Modal */}
            <AnimatePresence>
                {showLogoutConfirm && (
                    <div style={{
                        position: 'fixed', inset: 0, zIndex: 10000,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)'
                    }}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="glass"
                            style={{
                                width: '100%', maxWidth: '400px', padding: '40px',
                                borderRadius: '32px', background: 'var(--bg-secondary)',
                                border: '1px solid var(--border)', textAlign: 'center'
                            }}
                        >
                            <div style={{
                                width: '64px', height: '64px', borderRadius: '24px',
                                background: 'var(--bg-tertiary)', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px'
                            }}>
                                <LogOut size={32} color="var(--error)" />
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '12px' }}>TERMINATE_SESSION?</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontWeight: '500' }}>Are you sure you want to initialize session termination?</p>
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <button
                                    onClick={() => setShowLogoutConfirm(false)}
                                    className="btn btn-secondary"
                                    style={{ flex: 1, padding: '16px' }}
                                >
                                    ABORT
                                </button>
                                <button
                                    onClick={logout}
                                    className="btn btn-primary"
                                    style={{ flex: 1, padding: '16px', background: 'var(--error)' }}
                                >
                                    CONFIRM
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

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
                            width: '300px',
                            background: 'var(--bg-secondary)',
                            borderRight: '1px solid var(--border)',
                            padding: '32px',
                            display: 'flex',
                            flexDirection: 'column',
                            zIndex: 1000
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '64px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{
                                    width: '40px', height: '40px', background: 'var(--text)',
                                    borderRadius: '12px', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', color: 'var(--bg)',
                                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                                }}>
                                    <Activity size={20} />
                                </div>
                                <span style={{ fontSize: '1.5rem', fontWeight: '900', letterSpacing: '-0.04em' }}>FixItNow</span>
                            </div>
                            {window.innerWidth < 1024 && (
                                <button onClick={() => setIsSidebarOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text)' }}>
                                    <X size={24} />
                                </button>
                            )}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                            <NavItem id="overview" icon={Activity} label="Control Center" />
                            <NavItem id="history" icon={History} label="Operations" />
                            <NavItem id="support" icon={HelpCircle} label="Neural Support" />
                            <NavItem id="profile" icon={Settings} label="Identity Settings" />
                        </div>

                        <div className="glass" style={{ padding: '24px', borderRadius: '24px', marginBottom: '32px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: '900', marginBottom: '8px', letterSpacing: '0.05em' }}>PRIORITY_OVERRIDE</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '20px', fontWeight: '500' }}>Emergency directive for immediate expert deployment.</div>
                            <button className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '0.85rem', fontWeight: '900' }}>ACTIVATE</button>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'var(--bg-tertiary)', borderRadius: '24px', border: '1px solid var(--border)' }}>
                            <UserAvatar size={44} />
                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                <div style={{ fontSize: '0.95rem', fontWeight: '900', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '700', letterSpacing: '0.05em' }}>AUTHORIZED_UNIT</div>
                            </div>
                            <button onClick={() => setShowLogoutConfirm(true)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}>
                                <LogOut size={20} />
                            </button>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Main Wrapper */}
            <main style={{
                flex: 1,
                marginLeft: isSidebarOpen && window.innerWidth >= 1024 ? '300px' : '0',
                padding: '0 0 60px 0',
                transition: 'margin 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
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
                    backdropFilter: 'blur(20px)',
                    borderBottom: '1px solid var(--border)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        {!isSidebarOpen && (
                            <button onClick={() => setIsSidebarOpen(true)} style={{ background: 'none', border: 'none', color: 'var(--text)' }}>
                                <Menu size={28} />
                            </button>
                        )}
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '900', letterSpacing: '-0.02em' }}>
                            {activeView.toUpperCase()}_LOG
                        </h2>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <ThemeToggle3D />
                        <button
                            onClick={() => setActiveTab('services')}
                            className="btn btn-primary"
                            style={{ padding: '0 24px', height: '56px', borderRadius: '18px', gap: '12px' }}
                        >
                            <Plus size={24} />
                            <span className="desktop-only" style={{ fontWeight: '900' }}>INIT_MOD_BOOKING</span>
                        </button>
                    </div>
                </header>

                <div className="container" style={{ padding: 'var(--container-padding)' }}>
                    <AnimatePresence mode="wait">
                        {activeView === 'overview' && (
                            <motion.div
                                key="overview"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.4 }}
                            >
                                <div style={{ marginBottom: '40px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: 'var(--success)' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 10px var(--success)' }} />
                                        <span style={{ fontSize: '0.75rem', fontWeight: '900', letterSpacing: '0.1em' }}>SYSTEM_NOMINAL</span>
                                    </div>
                                    <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-0.06em', marginBottom: '8px', lineHeight: '1.1' }}>
                                        GREETINGS, {user?.name?.split(' ')[0].toUpperCase()}
                                    </h1>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: '500' }}>Neural interface active. All systems reporting functional status.</p>
                                </div>

                                <div style={{ display: 'flex', gap: 'var(--gap)', flexWrap: 'wrap', marginBottom: 'var(--container-padding)' }}>
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
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                                        <h3 style={{ fontSize: '1.75rem', fontWeight: '900', letterSpacing: '-0.02em' }}>QUICK_ACCESS_NODES</h3>
                                    </div>
                                    <div className="bento-grid">
                                        {[
                                            { title: 'EMERGENCY', desc: 'Instant dispatch protocol', icon: Shield, col: 'span 4', action: () => { } },
                                            { title: 'FIND_PROS', desc: 'Browse authorized experts', icon: Search, col: 'span 4', action: () => setActiveView('services') },
                                            { title: 'COMMS', desc: 'Secure encryption channel', icon: MessageSquare, col: 'span 4', action: () => { } },
                                            { title: 'HISTORY', desc: 'Immutable operation logs', icon: History, col: 'span 6', action: () => setActiveView('history') },
                                            { title: 'IDENTITY', desc: 'Credential management', icon: Settings, col: 'span 6', action: () => setActiveView('profile') }
                                        ].map((action, i) => (
                                            <motion.div
                                                key={i}
                                                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                                                onClick={action.action}
                                                className="bento-card glass"
                                                style={{
                                                    gridColumn: action.col,
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    padding: '24px',
                                                    background: 'var(--bg-secondary)',
                                                    border: '1px solid var(--border)',
                                                    borderRadius: '24px'
                                                }}
                                            >
                                                <div style={{ marginBottom: '16px', color: 'var(--text)' }}><action.icon size={24} /></div>
                                                <div style={{ fontSize: '1rem', fontWeight: '900', marginBottom: '4px', letterSpacing: '-0.02em' }}>{action.title}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '500' }}>{action.desc}</div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </section>
                            </motion.div>
                        )}

                        {activeView === 'services' && (
                            <motion.div key="services" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                <TechnicianList onBookingSuccess={() => setActiveView('overview')} />
                            </motion.div>
                        )}

                        {activeView === 'history' && (
                            <motion.div key="history" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                <BookingHistory type="customer" />
                            </motion.div>
                        )}

                        {activeView === 'profile' && (
                            <motion.div key="profile" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                <ProfileSettings />
                            </motion.div>
                        )}

                        {activeView === 'support' && (
                            <motion.div key="support" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
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
