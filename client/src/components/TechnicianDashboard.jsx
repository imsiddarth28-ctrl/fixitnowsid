import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Briefcase,
    History,
    CreditCard,
    Settings,
    LogOut,
    Menu,
    X,
    TrendingUp,
    Star,
    Bell,
    Zap,
    ChevronRight,
    MapPin,
    Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';
import BookingHistory from './BookingHistory';
import ProfileSettings from './ProfileSettings';
import SupportHelp from './SupportHelp';

const TechnicianDashboard = ({ activeJob, setActiveJob, setActiveTab }) => {
    const { user, logout } = useAuth();
    const [stats, setStats] = useState({ earnings: 0, totalJobs: 0, rating: 5.0 });
    const [isAvailable, setIsAvailable] = useState(false);
    const [view, setView] = useState('overview'); // overview, history, payments, settings
    const [activeMissions, setActiveMissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
        const handleResize = () => setSidebarOpen(window.innerWidth > 1024);
        window.addEventListener('resize', handleResize);
        return () => {
            clearInterval(timer);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        if (user) {
            fetchStats();
            fetchProfile();
            fetchActiveMissions();
        }
    }, [user]);

    const fetchActiveMissions = async () => {
        try {
            const res = await fetch(`${API_URL}/api/bookings/user/${user.id}?role=technician`);
            if (res.ok) {
                const jobs = await res.json();
                setActiveMissions(jobs.filter(j => !['completed', 'rejected', 'cancelled'].includes(j.status)));
            }
        } catch (err) {
            console.error('Error fetching missions:', err);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await fetch(`${API_URL}/api/technicians/${user.id}/stats`);
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    };

    const fetchProfile = async () => {
        try {
            const res = await fetch(`${API_URL}/api/auth/profile/${user.id}?role=technician`);
            if (res.ok) {
                const data = await res.json();
                setIsAvailable(data.isAvailable);
            }
            setLoading(false);
        } catch (err) {
            console.error('Error fetching profile:', err);
            setLoading(false);
        }
    };

    const toggleAvailability = async () => {
        try {
            const res = await fetch(`${API_URL}/api/auth/profile/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isAvailable: !isAvailable, role: 'technician' })
            });
            if (res.ok) {
                const data = await res.json();
                setIsAvailable(data.isAvailable);
            }
        } catch (err) {
            console.error('Error toggling availability:', err);
        }
    };

    const navItems = [
        { id: 'overview', label: 'Sector Hub', icon: <LayoutDashboard size={20} /> },
        { id: 'jobs', label: 'Active Missions', icon: <Briefcase size={20} />, count: activeMissions.length },
        { id: 'history', label: 'Ops Archives', icon: <History size={20} /> },
        { id: 'payments', label: 'Credit Ledger', icon: <CreditCard size={20} /> },
        { id: 'settings', label: 'Profile Settings', icon: <Settings size={20} /> },
        { id: 'support', label: 'Support & Help', icon: <Bell size={20} /> },
    ];

    if (loading) return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} style={{ width: 40, height: 40, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#3b82f6', borderRadius: '50%' }} />
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', width: '100%', color: 'var(--text)', overflow: 'hidden' }}>
            {/* Sidebar */}
            <motion.aside
                animate={{ x: sidebarOpen ? 0 : -280 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                style={{
                    width: '280px', borderRight: '1px solid var(--border)', background: 'rgba(10, 10, 10, 0.95)',
                    padding: '2.5rem 1.5rem', display: 'flex', flexDirection: 'column', height: '100vh', position: 'fixed', left: 0, top: 0, zIndex: 100
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '4rem' }}>
                    <div style={{ width: 32, height: 32, background: '#3b82f6', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Zap size={18} fill="white" />
                    </div>
                    <span style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.05em' }}>FIXIT<span style={{ color: '#3b82f6' }}>NOW</span></span>
                </div>

                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setView(item.id)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', borderRadius: '1rem', border: 'none',
                                background: view === item.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                color: view === item.id ? '#3b82f6' : 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.2s ease', position: 'relative'
                            }}
                        >
                            {item.icon}
                            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{item.label}</span>
                            {item.count > 0 && <span style={{ marginLeft: 'auto', background: '#3b82f6', color: 'white', size: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '1rem', fontWeight: 900 }}>{item.count}</span>}
                            {view === item.id && <motion.div layoutId="nav-pill" style={{ position: 'absolute', right: 0, width: 4, height: 20, background: '#3b82f6', borderRadius: '4px 0 0 4px' }} />}
                        </button>
                    ))}
                </nav>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-muted)' }}>SECTOR_STATUS</span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: isAvailable ? '#10b981' : '#f59e0b' }}>{isAvailable ? 'READY' : 'OFFLINE'}</span>
                        </div>
                        <button onClick={toggleAvailability} style={{ width: 40, height: 22, borderRadius: 11, background: isAvailable ? '#10b981' : 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'all 0.3s ease' }}>
                            <motion.div animate={{ x: isAvailable ? 20 : 2 }} style={{ width: 18, height: 18, borderRadius: '50%', background: 'white', position: 'absolute', top: 2 }} />
                        </button>
                    </div>
                    <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: '1rem', border: 'none', background: 'rgba(239, 68, 68, 0.05)', color: '#ef4444', fontWeight: 800, cursor: 'pointer' }}>
                        <LogOut size={18} /> DISCONNECT
                    </button>
                </div>
            </motion.aside>

            {/* Content Area */}
            <main style={{ flex: 1, marginLeft: sidebarOpen ? '280px' : '0', transition: 'margin 0.4s ease', padding: '3rem 4rem', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 900, letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
                            <Bell size={14} /> SYSTEM_UPDATE: HUB_SYNCHRONIZED
                        </div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.03em', margin: 0 }}>HELLO, Agent {user?.name?.split(' ')[0]}</h1>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)' }}>UPTIME</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 900, fontFamily: 'monospace' }}>{currentTime}</div>
                    </div>
                </header>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
                    {view === 'overview' && (
                        <>
                            {/* Stats Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                                {[
                                    { label: 'Total Extraction', value: `$${stats.earnings?.toFixed(2)}`, trend: '+12%', icon: <TrendingUp color="#10b981" />, bg: 'rgba(16, 185, 129, 0.05)' },
                                    { label: 'Completed Ops', value: stats.totalJobs, trend: 'Tier 3', icon: <Briefcase color="#3b82f6" />, bg: 'rgba(59, 130, 246, 0.05)' },
                                    { label: 'Field Rating', value: stats.rating?.toFixed(1), trend: 'Elite', icon: <Star color="#f59e0b" />, bg: 'rgba(245, 158, 11, 0.05)' }
                                ].map((s, i) => (
                                    <motion.div key={i} whileHover={{ y: -5 }} style={{ padding: '2.5rem', background: 'var(--card)', borderRadius: '2rem', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
                                        <div style={{ position: 'absolute', top: 0, right: 0, width: '120px', height: '120px', background: s.bg, borderRadius: '0 0 0 100%', opacity: 0.5 }}></div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                            <div style={{ width: 50, height: 50, background: s.bg, borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.icon}</div>
                                            <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#10b981', background: s.bg, padding: '0.4rem 0.8rem', borderRadius: '0.6rem' }}>{s.trend}</div>
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 800, marginBottom: '0.5rem' }}>{s.label.toUpperCase()}</div>
                                        <div style={{ fontSize: '2.4rem', fontWeight: 900 }}>{s.value}</div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Active Mission HUD */}
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '3rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h2 style={{ fontSize: '1.4rem', fontWeight: 900, margin: 0 }}>ACTIVE_ZONE_ALERTS</h2>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#3b82f6' }}>LIVE_SCAN_RANGE: 15KM</span>
                                    </div>

                                    {activeMissions.length > 0 ? (
                                        <motion.div
                                            initial={{ scale: 0.98, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            style={{
                                                padding: '3rem', background: '#3b82f6', color: 'white', borderRadius: '2.5rem',
                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 25px 50px rgba(59, 130, 246, 0.4)'
                                            }}
                                        >
                                            <div>
                                                <div style={{ fontSize: '0.8rem', fontWeight: 900, opacity: 0.8, marginBottom: '0.8rem', letterSpacing: '0.1em' }}>PRIORITY_MISSION</div>
                                                <div style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '1.5rem' }}>{activeMissions[0].serviceType}</div>
                                                <div style={{ display: 'flex', gap: '2rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                                        <MapPin size={18} />
                                                        <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{activeMissions[0].location?.address?.split(',')[0]}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                                        <Clock size={18} />
                                                        <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>URGENT</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => { setActiveJob(activeMissions[0]); setActiveTab('home'); }}
                                                style={{
                                                    padding: '1.5rem 3rem', background: 'white', color: '#3b82f6', borderRadius: '1.5rem', border: 'none',
                                                    fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.1rem'
                                                }}
                                            >
                                                ENGAGE <ChevronRight size={20} />
                                            </motion.button>
                                        </motion.div>
                                    ) : (
                                        <div style={{ padding: '5rem', border: '2px dashed var(--border)', borderRadius: '2.5rem', textAlign: 'center', background: 'rgba(255,255,255,0.01)' }}>
                                            <Zap size={40} style={{ opacity: 0.2, marginBottom: '1.5rem' }} />
                                            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-muted)' }}>WAITING FOR BROADCAST...</div>
                                            <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginTop: '0.8rem', maxWidth: '300px', margin: '0.8rem auto 0' }}>The sector is currently quiet. New extraction requests will appear here.</p>
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                    <h2 style={{ fontSize: '1.4rem', fontWeight: 900, margin: 0 }}>TECH_OS_INFO</h2>
                                    <div style={{ padding: '2rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '2rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem' }}>
                                            <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 900 }}>{user?.name?.charAt(0)}</div>
                                            <div>
                                                <div style={{ fontSize: '1.1rem', fontWeight: 900 }}>{user?.name}</div>
                                                <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#3b82f6' }}>VERIFIED_FIELD_AGENT</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>Service Focus</span>
                                                <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>Tactical Repair</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>Security Clearence</span>
                                                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#10b981' }}>LEVEL 4</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                    {view === 'history' && <BookingHistory type="technician" />}
                    {view === 'settings' && <ProfileSettings />}
                    {view === 'support' && <SupportHelp />}
                    {(view === 'payments' || view === 'jobs') && (
                        <div style={{
                            padding: '4rem 2rem',
                            border: '1px dashed var(--border)',
                            borderRadius: '1rem',
                            textAlign: 'center',
                            color: 'var(--text-muted)'
                        }}>
                            <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>🏗️</div>
                            <div style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text)' }}>Coming Soon</div>
                            <p style={{ fontSize: '0.9rem', margin: 0 }}>This feature is currently being optimized for your experience.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default TechnicianDashboard;
