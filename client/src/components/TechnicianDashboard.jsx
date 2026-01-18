import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';
import { motion, AnimatePresence } from 'framer-motion';
import BookingHistory from './BookingHistory';
import { Menu, X } from 'lucide-react';

const TechnicianDashboard = ({ activeJob, setActiveTab }) => {
    const { user, logout } = useAuth();
    const [stats, setStats] = useState({ earnings: 0, totalJobs: 0, rating: 5.0 });
    const [recentJobs, setRecentJobs] = useState([]);
    const [isAvailable, setIsAvailable] = useState(false);
    const [view, setView] = useState('overview'); // overview, history, payments, settings
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

    // Responsive State
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024); // Tablet/Mobile

    // Profile Settings State
    const [profile, setProfile] = useState({
        name: user?.name || '',
        phone: '',
        serviceType: '',
        experience: 0
    });

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
        return () => {
            window.removeEventListener('resize', handleResize);
            clearInterval(timer);
        };
    }, []);

    useEffect(() => {
        if (user) {
            fetchStats();
            fetchProfile();
        }
    }, [user]);

    const fetchStats = async () => {
        try {
            const res = await fetch(`${API_URL}/api/technicians/${user.id}/stats`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setStats({
                earnings: data.earnings,
                totalJobs: data.totalJobs,
                rating: data.rating
            });
            setRecentJobs(data.recentJobs || []);
        } catch (err) {
            console.error('Error fetching stats:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchProfile = async () => {
        try {
            // We can reuse the stats endpoint or specialized profile one
            const res = await fetch(`${API_URL}/api/admin/technicians`);
            const allTechs = await res.json();
            const myProfile = allTechs.find(t => t._id === user.id);
            if (myProfile) {
                setProfile({
                    name: myProfile.name,
                    phone: myProfile.phone,
                    serviceType: myProfile.serviceType,
                    experience: myProfile.experience || 0
                });
                setIsAvailable(myProfile.isAvailable);
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
        }
    };

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

    const updateProfile = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/api/admin/technicians/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profile)
            });
            if (res.ok) {
                alert('Profile updated successfully!');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const menuItems = [
        { id: 'overview', label: 'COMMAND CENTER' },
        { id: 'jobs', label: 'ACTIVE MISSIONS' },
        { id: 'history', label: 'SERVICE LOGS' },
        { id: 'settings', label: 'PROFILE CONFIG' }
    ];

    if (loading) return <div style={{ padding: '4rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>[SYSTEM] INITIALIZING WORKSPACE...</div>;

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

            {/* Sidebar - Pro Version */}
            <aside style={{
                width: '280px',
                borderRight: '1px solid var(--border)',
                padding: '2.5rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                position: 'fixed',
                left: 0,
                top: 0,
                zIndex: 50,
                background: 'rgba(20, 20, 20, 0.95)', // Solid background for mobile legibility
                backdropFilter: 'blur(20px)',
                transform: isMobile ? (sidebarOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none',
                transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
                <div style={{
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 900,
                    fontSize: '1.4rem',
                    marginBottom: '3.5rem',
                    letterSpacing: '-0.05em',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    color: 'var(--text)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <div style={{ position: 'relative' }}>
                            <div style={{
                                width: 14, height: 14, background: '#3b82f6',
                                boxShadow: '0 0 15px #3b82f6', borderRadius: '3px'
                            }}></div>
                            <motion.div
                                animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                style={{
                                    position: 'absolute', top: 0, left: 0, width: 14, height: 14,
                                    background: '#3b82f6', borderRadius: '3px', zIndex: -1
                                }}
                            />
                        </div>
                        <div>FIXIT<span style={{ fontWeight: 300, opacity: 0.6 }}>PRO</span></div>
                    </div>
                    {isMobile && (
                        <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)' }}>
                            <X size={24} />
                        </button>
                    )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => { setView(item.id); if (isMobile) setSidebarOpen(false); }}
                            style={{
                                textAlign: 'left',
                                padding: '0.8rem 1.2rem',
                                borderRadius: '0.4rem',
                                border: 'none',
                                background: view === item.id ? 'var(--text)' : 'transparent',
                                color: view === item.id ? 'var(--bg)' : 'var(--text-muted)',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                letterSpacing: '0.05em',
                                cursor: 'pointer',
                                transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* System Info HUD */}
                <div style={{
                    marginTop: 'auto',
                    padding: '1.5rem',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '1rem',
                    border: '1px solid var(--border)',
                    marginBottom: '2rem'
                }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.5 }}>SYSTEM STATUS</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>LATENCY</span>
                            <span style={{ fontSize: '0.7rem', color: '#22c55e', fontFamily: 'monospace' }}>24ms</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>UPTIME</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text)', fontFamily: 'monospace' }}>99.9%</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>NEURAL LINK</span>
                            <span style={{ fontSize: '0.7rem', color: '#22c55e', fontFamily: 'monospace' }}>ACTIVE</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>LOCAL TIME</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text)', fontFamily: 'monospace' }}>{currentTime}</span>
                        </div>
                    </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
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
                            <div style={{ fontWeight: 700, fontSize: '0.85rem', whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>
                                {user?.name}
                            </div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>
                                ID: {user.id.slice(-6).toUpperCase()}
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
                            fontSize: '0.75rem',
                            fontWeight: 900,
                            letterSpacing: '0.05em',
                            cursor: 'pointer',
                            textTransform: 'uppercase'
                        }}
                    >
                        DISCONNECT
                    </button>
                </div>
            </aside>

            {/* Main Workspace */}
            <main style={{
                flex: 1,
                marginLeft: isMobile ? 0 : '280px',
                padding: isMobile ? '1.5rem' : '2rem 3rem',
                transition: 'margin-left 0.3s ease',
                width: '100%'
            }}>
                {/* Mobile Trigger */}
                {isMobile && (
                    <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', marginBottom: '2rem', padding: 0, color: 'var(--text)', cursor: 'pointer' }}>
                        <Menu size={24} />
                    </button>
                )}
                {/* Status & Action Bar */}
                <header style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2.5rem',
                    marginBottom: '4rem'
                }}>
                    <AnimatePresence>
                        {activeJob && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                onClick={() => setActiveTab('home')}
                                style={{
                                    background: 'linear-gradient(90deg, #1e40af, #3b82f6)',
                                    padding: '1.5rem 2.5rem',
                                    borderRadius: '1rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    boxShadow: '0 20px 40px rgba(59, 130, 246, 0.2)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                <div style={{
                                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 3px)',
                                    pointerEvents: 'none'
                                }}></div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', color: 'white', position: 'relative', zIndex: 1 }}>
                                    <div style={{
                                        width: '12px', height: '12px', background: 'white',
                                        borderRadius: '2px', animation: 'pulse 1s infinite'
                                    }}></div>
                                    <div>
                                        <div style={{ fontSize: '0.65rem', fontWeight: 900, opacity: 0.7, letterSpacing: '0.15em', fontFamily: 'monospace' }}>[SYSTEM] LIVE MISSION ACTIVE</div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 900, letterSpacing: '-0.02em' }}>TRACKING: {activeJob.serviceType.toUpperCase()}</div>
                                    </div>
                                </div>
                                <div style={{
                                    background: 'rgba(255,255,255,0.15)', color: 'white', padding: '0.6rem 1.5rem',
                                    borderRadius: '0.5rem', fontWeight: 900, fontSize: '0.75rem',
                                    backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)',
                                    position: 'relative', zIndex: 1, letterSpacing: '0.1em'
                                }}>
                                    ENGAGE TRACKER →
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '1rem',
                                fontSize: '0.7rem', color: 'var(--text-muted)',
                                marginBottom: '0.8rem', letterSpacing: '0.15em', fontWeight: 900
                            }}>
                                <span style={{ color: 'var(--text)' }}>SESSION://{view.toUpperCase()}</span>
                                <span style={{ opacity: 0.3 }}>|</span>
                                <span>COORD://40.7128.W</span>
                            </div>
                            <h1 style={{
                                fontSize: '2.5rem',
                                fontWeight: 900,
                                fontFamily: 'var(--font-heading)',
                                margin: 0,
                                letterSpacing: '-0.04em',
                                color: 'var(--text)'
                            }}>
                                WELCOME, {user?.name?.split(' ')[0].toUpperCase()}
                            </h1>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.6rem',
                                    background: isAvailable ? 'rgba(34,197,94,0.05)' : 'rgba(239, 68, 68, 0.05)',
                                    padding: '0.6rem 1.2rem',
                                    borderRadius: '0.5rem',
                                    border: `1px solid ${isAvailable ? 'rgba(34,197,94,0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                                }}>
                                    <div className="status-pulse" style={{
                                        width: 8, height: 8, borderRadius: '50%',
                                        background: isAvailable ? '#22c55e' : '#ef4444'
                                    }}></div>
                                    <span style={{
                                        fontSize: '0.7rem',
                                        fontWeight: 900,
                                        color: isAvailable ? '#22c55e' : '#ef4444',
                                        letterSpacing: '0.1em'
                                    }}>
                                        {isAvailable ? 'SYSTEM: ONLINE' : 'SYSTEM: STANDBY'}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={toggleAvailability}
                                style={{
                                    background: isAvailable ? 'rgba(239, 68, 68, 0.1)' : 'var(--text)',
                                    color: isAvailable ? '#ef4444' : 'var(--bg)',
                                    border: isAvailable ? '1px solid rgba(239, 68, 68, 0.2)' : 'none',
                                    padding: '0.8rem 2rem',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.75rem',
                                    fontWeight: 900,
                                    letterSpacing: '0.1em',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                    textTransform: 'uppercase'
                                }}
                            >
                                {isAvailable ? 'GO OFFLINE' : 'GO LIVE'}
                            </button>
                        </div>
                    </div>
                </header>

                {/* Grid Content */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '2rem',
                    marginBottom: '4rem',
                    perspective: '1000px'
                }}>
                    {[
                        { label: 'NET EARNINGS', value: `$${stats.earnings.toFixed(2)}`, trend: 'Lifetime Revenue' },
                        { label: 'COMPLETED JOBS', value: stats.totalJobs, trend: 'Total assignments' },
                        { label: 'CLIENT RATING', value: stats.rating, trend: 'Average from reviews' }
                    ].map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30, rotateX: 10 }}
                            animate={{ opacity: 1, y: 0, rotateX: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{
                                translateZ: 30,
                                scale: 1.02,
                                boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                            }}
                            style={{
                                background: 'var(--card)',
                                border: '1px solid var(--border)',
                                borderRadius: '1.2rem',
                                padding: '2.5rem',
                                textAlign: 'left',
                                position: 'relative',
                                overflow: 'hidden',
                                transformStyle: 'preserve-3d',
                                cursor: 'default'
                            }}
                        >
                            <div style={{
                                position: 'absolute', top: 0, right: 0, width: '100px', height: '100px',
                                background: 'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.02) 100%)',
                                borderRadius: '0 0 0 100%'
                            }} />
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '1.5rem', letterSpacing: '0.1em' }}>
                                {item.label}
                            </div>
                            <div style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.03em', fontFamily: 'var(--font-heading)' }}>
                                {item.value}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: item.label.includes('EARNINGS') ? '#22c55e' : 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: item.label.includes('EARNINGS') ? '#22c55e' : 'var(--text-muted)' }}></div>
                                {item.trend}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="animate-fade-in">
                    {view === 'overview' && (
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                                <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '1rem', padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Recent Activity</h3>
                                        <button onClick={() => setView('history')} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>View All</button>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                        {recentJobs.length > 0 ? recentJobs.map(job => (
                                            <div key={job._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.2rem' }}>{job.serviceType} #{job._id.slice(-6).toUpperCase()}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Customer: {job.customerId?.name} • {new Date(job.createdAt).toLocaleDateString()}</div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>+${job.price?.toFixed(2)}</div>
                                                    <div style={{ fontSize: '0.75rem', color: job.status === 'completed' ? '#22c55e' : '#3b82f6', fontWeight: 600, textTransform: 'uppercase' }}>{job.status}</div>
                                                </div>
                                            </div>
                                        )) : (
                                            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No recent activity to show.</div>
                                        )}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                    {/* Mission Performance Chart (Visual Simulation) */}
                                    <div style={{
                                        background: 'var(--card)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '1rem',
                                        padding: '2rem',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}>
                                        <h3 style={{ fontSize: '0.9rem', fontWeight: 900, marginBottom: '1.5rem', letterSpacing: '0.1em' }}>DAILY PERFORMANCE // RADAR</h3>
                                        <div style={{ height: '120px', display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
                                            {[60, 45, 80, 55, 90, 70, 85].map((h, i) => (
                                                <div key={i} style={{ flex: 1, position: 'relative' }}>
                                                    <motion.div
                                                        initial={{ height: 0 }}
                                                        animate={{ height: `${h}%` }}
                                                        transition={{ delay: i * 0.1 }}
                                                        style={{
                                                            background: i === 6 ? '#3b82f6' : 'rgba(59, 130, 246, 0.2)',
                                                            borderRadius: '4px 4px 0 0',
                                                            boxShadow: i === 6 ? '0 0 15px #3b82f6' : 'none'
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                            <span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span>
                                        </div>
                                    </div>

                                    <div style={{
                                        background: 'black',
                                        color: 'white',
                                        border: '1px solid #333',
                                        borderRadius: '1rem',
                                        padding: '2rem',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}>
                                        {/* HUD Scanline */}
                                        <motion.div
                                            animate={{ top: ['-100%', '200%'] }}
                                            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                                            style={{ position: 'absolute', left: 0, right: 0, height: '1px', background: 'rgba(59, 130, 246, 0.3)', zIndex: 1 }}
                                        />
                                        <h3 style={{ fontSize: '0.8rem', fontWeight: 900, margin: '0 0 1.5rem 0', letterSpacing: '0.1em', color: '#3b82f6' }}>SECURITY HUB // ACTIVE</h3>
                                        {isAvailable ? (
                                            <div style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.6', position: 'relative', zIndex: 2 }}>
                                                <div style={{ marginBottom: '0.5rem', fontWeight: 700 }}>[CHANNEL ENCRYPTED]</div>
                                                Searching for new missions in your sector. Response time within 10km is currently <span style={{ color: '#22c55e' }}>2.4ms</span>.
                                            </div>
                                        ) : (
                                            <div style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.6', position: 'relative', zIndex: 2 }}>
                                                <div style={{ marginBottom: '0.5rem', fontWeight: 700 }}>[SYSTEM DISCONNECTED]</div>
                                                Reconnect to the FixItNow neural network to broadcast your availability to clients.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '1rem', padding: '2rem' }}>
                                <h3 style={{ fontSize: '0.9rem', fontWeight: 900, margin: '0 0 1rem 0', letterSpacing: '0.1em' }}>DIRECT SUPPORT</h3>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                                    Need technical help or have a billing query?
                                </div>
                                <button style={{
                                    width: '100%',
                                    padding: '0.8rem',
                                    borderRadius: '0.6rem',
                                    border: '1px solid var(--border)',
                                    background: 'transparent',
                                    color: 'var(--text)',
                                    fontSize: '0.8rem',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}>
                                    OPEN SECURE TICKET
                                </button>
                            </div>
                        </>
                    )}

                    {view === 'history' && <BookingHistory role="technician" />}

                    {view === 'jobs' && (
                        <div style={{ textAlign: 'center', padding: '4rem', border: '1px dashed var(--border)', borderRadius: '0.5rem' }}>
                            <div style={{ fontWeight: 600, color: 'var(--text-muted)' }}>No active projects. Jobs will appear in the "Job Alert" banner at the bottom once they arrive.</div>
                        </div>
                    )}

                    {view === 'payments' && (
                        <div style={{ padding: '2rem', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '0.5rem' }}>
                            <h3 style={{ marginBottom: '2rem' }}>Earnings Overview</h3>
                            <div style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '0.5rem' }}>${stats.earnings.toFixed(2)}</div>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Available for payout</p>
                            <button className="btn btn-primary" disabled style={{ opacity: 0.5 }}>Request Payout</button>
                        </div>
                    )}

                    {view === 'settings' && (
                        <div style={{ maxWidth: '600px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '0.5rem', padding: '2rem' }}>
                            <h3 style={{ marginBottom: '2rem' }}>Account Settings</h3>
                            <form onSubmit={updateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-muted)' }}>FULL NAME</label>
                                    <input
                                        type="text"
                                        value={profile.name}
                                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '0.4rem', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-muted)' }}>PHONE NUMBER</label>
                                    <input
                                        type="text"
                                        value={profile.phone}
                                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '0.4rem', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-muted)' }}>SERVICE TYPE</label>
                                    <select
                                        value={profile.serviceType}
                                        onChange={(e) => setProfile({ ...profile, serviceType: e.target.value })}
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '0.4rem', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                                    >
                                        <option value="Plumber">Plumber</option>
                                        <option value="Electrician">Electrician</option>
                                        <option value="Carpenter">Carpenter</option>
                                        <option value="Cleaner">Cleaner</option>
                                        <option value="AC Repair">AC Repair</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-muted)' }}>EXPERIENCE (YEARS)</label>
                                    <input
                                        type="number"
                                        value={profile.experience}
                                        onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '0.4rem', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>Save Changes</button>
                            </form>
                        </div>
                    )}
                </div>
            </main >

            <style>{`
                .animate-fade-in {
                    animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .btn {
                    padding: 0.8rem 1.5rem;
                    border-radius: 0.5rem;
                    font-weight: 700;
                    cursor: pointer;
                    border: none;
                    transition: all 0.2s ease;
                }
                .btn-primary {
                    background: var(--text);
                    color: var(--bg);
                }
                .btn-primary:hover {
                    opacity: 0.9;
                }
            `}</style>
        </div >
    );
};

export default TechnicianDashboard;
