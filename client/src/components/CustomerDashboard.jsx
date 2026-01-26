import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, Bell, Settings, LogOut, Plus,
    ArrowRight, CheckCircle, Clock, Shield,
    User, MessageSquare, Calendar, DollarSign,
    Star, Wallet, History, HelpCircle, Search, Menu, X, Home
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
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 14px',
                    width: '100%',
                    background: isActive ? 'var(--text)' : 'transparent',
                    color: isActive ? 'var(--bg)' : 'var(--text-secondary)',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: isActive ? '700' : '500',
                    transition: 'all 0.2s ease',
                    textAlign: 'left'
                }}
            >
                <Icon size={18} />
                <span>{label}</span>
            </motion.button>
        );
    };

    const StatCard = ({ label, value, icon: Icon, trend }) => (
        <div className="bento-card glass" style={{ flex: '1 1 200px', minWidth: '200px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{
                    width: '40px', height: '40px', background: 'var(--text)',
                    borderRadius: '12px', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: 'var(--bg)'
                }}>
                    <Icon size={20} />
                </div>
                {trend && (
                    <div style={{
                        background: 'var(--bg-tertiary)',
                        color: 'var(--text)',
                        padding: '4px 8px',
                        borderRadius: '8px',
                        fontSize: '0.7rem',
                        fontWeight: '700'
                    }}>
                        {trend}
                    </div>
                )}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '600' }}>{label}</div>
            <div style={{ fontSize: '1.6rem', color: 'var(--text)', fontWeight: '800', letterSpacing: '-0.02em' }}>{value}</div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', display: 'flex', flexDirection: 'column' }}>
            {/* Logout Modal */}
            <AnimatePresence>
                {showLogoutConfirm && (
                    <div style={{
                        position: 'fixed', inset: 0, zIndex: 10000,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)'
                    }} onClick={() => setShowLogoutConfirm(false)}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="glass"
                            style={{
                                width: '90%', maxWidth: '380px', padding: '32px',
                                borderRadius: '24px', background: 'var(--bg-secondary)',
                                border: '1px solid var(--border)', textAlign: 'center'
                            }}
                        >
                            <div style={{
                                width: '56px', height: '56px', borderRadius: '16px',
                                background: 'rgba(239, 68, 68, 0.1)', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'
                            }}>
                                <LogOut size={28} color="#ef4444" />
                            </div>
                            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '10px' }}>Logout?</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}>Are you sure you want to logout?</p>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button onClick={() => setShowLogoutConfirm(false)} className="btn btn-secondary" style={{ flex: 1, padding: '12px' }}>Cancel</button>
                                <button onClick={logout} className="btn" style={{ flex: 1, padding: '12px', background: '#ef4444', color: 'white', border: 'none' }}>Logout</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.aside
                        initial={{ x: -280, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -280, opacity: 0 }}
                        style={{
                            position: 'fixed',
                            left: 0, top: 0, bottom: 0,
                            width: '260px',
                            background: 'var(--bg-secondary)',
                            borderRight: '1px solid var(--border)',
                            padding: '24px',
                            display: 'flex',
                            flexDirection: 'column',
                            zIndex: 1000,
                            overflowY: 'auto'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '36px', height: '36px', background: 'var(--text)',
                                    borderRadius: '10px', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', color: 'var(--bg)'
                                }}>
                                    <Activity size={18} />
                                </div>
                                <span style={{ fontSize: '1.2rem', fontWeight: '800' }}>SAHAKAR</span>
                            </div>
                            {window.innerWidth < 1024 && (
                                <button onClick={() => setIsSidebarOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer' }}>
                                    <X size={22} />
                                </button>
                            )}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                            <NavItem id="overview" icon={Home} label="Dashboard" />
                            <NavItem id="history" icon={History} label="My Bookings" />
                            <NavItem id="support" icon={HelpCircle} label="Help & Support" />
                            <NavItem id="profile" icon={Settings} label="Settings" />
                        </div>

                        <div className="glass" style={{ padding: '18px', borderRadius: '16px', marginBottom: '20px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: '800', marginBottom: '6px' }}>Need Urgent Help?</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>Get instant service for emergencies.</div>
                            <button className="btn btn-primary" style={{ width: '100%', padding: '10px', fontSize: '0.8rem', fontWeight: '700' }}>Emergency Service</button>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--bg-tertiary)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                            <UserAvatar size={40} />
                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                <div style={{ fontSize: '0.85rem', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Customer</div>
                            </div>
                            <button onClick={() => setShowLogoutConfirm(true)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}>
                                <LogOut size={18} />
                            </button>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <main style={{
                    flex: 1,
                    marginLeft: isSidebarOpen && window.innerWidth >= 1024 ? '260px' : '0',
                    transition: 'margin 0.3s ease'
                }}>
                    {/* Header */}
                    <header style={{
                        padding: window.innerWidth < 768 ? '16px' : '20px 32px',
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
                                <button onClick={() => setIsSidebarOpen(true)} style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer' }}>
                                    <Menu size={24} />
                                </button>
                            )}
                            <h2 style={{ fontSize: window.innerWidth < 768 ? '1.1rem' : '1.3rem', fontWeight: '800' }}>
                                {activeView === 'overview' ? 'Dashboard' : activeView === 'history' ? 'My Bookings' : activeView === 'support' ? 'Support' : 'Settings'}
                            </h2>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <button onClick={toggleTheme} style={{
                                width: '40px', height: '40px', borderRadius: '12px',
                                background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', fontSize: '1.2rem'
                            }}>
                                {theme === 'dark' ? '☀️' : '🌙'}
                            </button>
                            <button
                                onClick={() => setActiveTab('services')}
                                className="btn btn-primary"
                                style={{ padding: '0 16px', height: '40px', borderRadius: '12px', gap: '8px', fontSize: '0.85rem', fontWeight: '700' }}
                            >
                                <Plus size={18} />
                                <span className="desktop-only">New Booking</span>
                            </button>
                        </div>
                    </header>

                    <div style={{ padding: window.innerWidth < 768 ? '20px' : '32px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
                        <AnimatePresence mode="wait">
                            {activeView === 'overview' && (
                                <motion.div
                                    key="overview"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                >
                                    <div style={{ marginBottom: '32px' }}>
                                        <h1 style={{ fontSize: window.innerWidth < 768 ? '1.8rem' : '2.2rem', fontWeight: '800', marginBottom: '8px' }}>
                                            Welcome back, {user?.name?.split(' ')[0]}!
                                        </h1>
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Here's an overview of your service activity.</p>
                                    </div>

                                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '32px' }}>
                                        <StatCard label="Active Jobs" value={stats.activeJobs} icon={Activity} trend={stats.activeJobs > 0 ? "LIVE" : "NONE"} />
                                        <StatCard label="Completed" value={stats.completedJobs} icon={CheckCircle} trend={stats.completedJobs > 0 ? `+${stats.completedJobs}` : "0"} />
                                        <StatCard label="Total Spent" value={`$${stats.totalSpent}`} icon={Wallet} />
                                        <StatCard label="Rating" value={stats.trends?.trust?.score || "5.0"} icon={Star} trend="⭐" />
                                    </div>

                                    <section>
                                        <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '20px' }}>Quick Actions</h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                                            {[
                                                { title: 'Find Technicians', desc: 'Browse available experts', icon: Search, action: () => setActiveTab('services') },
                                                { title: 'My Bookings', desc: 'View booking history', icon: History, action: () => setActiveView('history') },
                                                { title: 'Get Help', desc: 'Contact support', icon: HelpCircle, action: () => setActiveView('support') },
                                                { title: 'My Profile', desc: 'Update settings', icon: Settings, action: () => setActiveView('profile') }
                                            ].map((action, i) => (
                                                <motion.div
                                                    key={i}
                                                    whileHover={{ y: -4 }}
                                                    onClick={action.action}
                                                    className="bento-card glass"
                                                    style={{
                                                        cursor: 'pointer',
                                                        padding: '20px',
                                                        background: 'var(--bg-secondary)',
                                                        border: '1px solid var(--border)',
                                                        borderRadius: '16px'
                                                    }}
                                                >
                                                    <action.icon size={24} style={{ marginBottom: '12px', color: 'var(--text)' }} />
                                                    <div style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '4px' }}>{action.title}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{action.desc}</div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </section>
                                </motion.div>
                            )}

                            {activeView === 'services' && (
                                <motion.div key="services" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    <TechnicianList onBookingSuccess={() => setActiveView('overview')} />
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

                {/* Footer */}
                <footer style={{
                    marginLeft: isSidebarOpen && window.innerWidth >= 1024 ? '260px' : '0',
                    padding: '24px 32px',
                    background: 'var(--bg-secondary)',
                    borderTop: '1px solid var(--border)',
                    transition: 'margin 0.3s ease'
                }}>
                    <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                        <div>
                            <div style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '4px' }}>SAHAKAR</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Your trusted home service platform</div>
                        </div>
                        <div style={{ display: 'flex', gap: '24px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy Policy</a>
                            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Terms of Service</a>
                            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Contact Us</a>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            © 2026 SAHAKAR. All rights reserved.
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default CustomerDashboard;
