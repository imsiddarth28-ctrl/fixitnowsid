import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap, MapPin, Clock, TrendingUp, Activity, Bell,
    Settings, LogOut, AlertTriangle, CheckCircle,
    DollarSign, Star, Shield, User, Target, Briefcase
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BookingHistory from './BookingHistory';
import ProfileSettings from './ProfileSettings';
import SupportHelp from './SupportHelp';
import UserAvatar from './UserAvatar';
import API_URL from '../config';

const TechnicianDashboard = () => {
    const { user, logout } = useAuth();
    const [activeView, setActiveView] = useState('overview');
    const [stats, setStats] = useState({
        activeJobs: 0,
        completedToday: 0,
        totalEarnings: 0,
        rating: 4.8,
        pendingRequests: 0
    });
    const [pendingRequests, setPendingRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const res = await fetch(`${API_URL}/api/technicians/${user.id}/dashboard`);
            if (res.ok) {
                const data = await res.json();
                setStats(data.stats || stats);
                setPendingRequests(data.pendingRequests || []);
            }
        } catch (err) {
            console.error('Failed to fetch dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ icon: Icon, label, value, trend, color, pulse }) => (
        <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            style={{
                background: 'rgba(15, 15, 15, 0.8)',
                border: `1px solid ${color}40`,
                borderRadius: '1rem',
                padding: isMobile ? '1rem' : '1.5rem',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: `0 0 20px ${color}20`,
                backdropFilter: 'blur(10px)'
            }}
        >
            {/* CRT Scan Lines */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
                pointerEvents: 'none',
                zIndex: 1
            }} />

            {/* Glow Effect */}
            <div style={{
                position: 'absolute',
                top: '-50%',
                right: '-50%',
                width: '100%',
                height: '100%',
                background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
                pointerEvents: 'none',
                animation: pulse ? 'pulse 2s infinite' : 'none'
            }} />

            <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                    <div style={{
                        width: isMobile ? '40px' : '48px',
                        height: isMobile ? '40px' : '48px',
                        borderRadius: '0.75rem',
                        background: `${color}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `1px solid ${color}40`
                    }}>
                        <Icon size={isMobile ? 20 : 24} color={color} />
                    </div>
                    {trend && (
                        <div style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '1rem',
                            background: trend > 0 ? '#10b98120' : '#ef444420',
                            border: `1px solid ${trend > 0 ? '#10b981' : '#ef4444'}40`,
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: trend > 0 ? '#10b981' : '#ef4444'
                        }}>
                            {trend > 0 ? '+' : ''}{trend}%
                        </div>
                    )}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
                    {label}
                </div>
                <div style={{ fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 900, color: 'white', fontFamily: 'monospace', textShadow: `0 0 10px ${color}80` }}>
                    {value}
                </div>
            </div>
        </motion.div>
    );

    const PendingRequestCard = ({ request }) => (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
                background: 'rgba(15, 15, 15, 0.8)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '1rem',
                padding: isMobile ? '1rem' : '1.5rem',
                marginBottom: '1rem',
                boxShadow: '0 0 20px rgba(245, 158, 11, 0.2)'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div>
                    <div style={{ fontSize: isMobile ? '1rem' : '1.2rem', fontWeight: 900, color: 'white', marginBottom: '0.5rem' }}>
                        {request.serviceType || 'Service Request'}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem' }}>
                        Customer: {request.customerName || 'Unknown'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 700 }}>
                        ⏰ Requested: {new Date(request.createdAt).toLocaleString()}
                    </div>
                </div>
                <div style={{
                    padding: '0.5rem 1rem',
                    background: 'rgba(245, 158, 11, 0.2)',
                    border: '1px solid rgba(245, 158, 11, 0.4)',
                    borderRadius: '0.5rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#f59e0b'
                }}>
                    PENDING
                </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                        flex: 1,
                        padding: '0.75rem',
                        borderRadius: '0.75rem',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        border: 'none',
                        color: 'white',
                        fontWeight: 800,
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)'
                    }}
                >
                    ✓ ACCEPT
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                        flex: 1,
                        padding: '0.75rem',
                        borderRadius: '0.75rem',
                        background: 'rgba(239, 68, 68, 0.2)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        color: '#ef4444',
                        fontWeight: 800,
                        fontSize: '0.9rem',
                        cursor: 'pointer'
                    }}
                >
                    ✕ REJECT
                </motion.button>
            </div>
        </motion.div>
    );

    return (
        <div style={{
            minHeight: '100vh',
            background: '#000000',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Animated Background Grid */}
            <div style={{
                position: 'fixed',
                inset: 0,
                background: 'linear-gradient(0deg, transparent 24%, rgba(16, 185, 129, 0.05) 25%, rgba(16, 185, 129, 0.05) 26%, transparent 27%, transparent 74%, rgba(16, 185, 129, 0.05) 75%, rgba(16, 185, 129, 0.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(16, 185, 129, 0.05) 25%, rgba(16, 185, 129, 0.05) 26%, transparent 27%, transparent 74%, rgba(16, 185, 129, 0.05) 75%, rgba(16, 185, 129, 0.05) 76%, transparent 77%, transparent)',
                backgroundSize: '50px 50px',
                opacity: 0.3,
                pointerEvents: 'none'
            }} />

            {/* CRT Vignette */}
            <div style={{
                position: 'fixed',
                inset: 0,
                background: 'radial-gradient(circle, transparent 0%, rgba(0,0,0,0.8) 100%)',
                pointerEvents: 'none'
            }} />

            {/* Main Content */}
            <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Top Bar */}
                <div style={{
                    padding: isMobile ? '1rem' : '1.5rem 2rem',
                    borderBottom: '1px solid rgba(16, 185, 129, 0.2)',
                    background: 'rgba(0, 0, 0, 0.8)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem',
                    flexWrap: isMobile ? 'wrap' : 'nowrap'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <UserAvatar size={isMobile ? 40 : 48} />
                        <div>
                            <div style={{ fontSize: isMobile ? '1.2rem' : '1.5rem', fontWeight: 900, textShadow: '0 0 10px #10b981' }}>
                                {user?.name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700, letterSpacing: '0.1em' }}>
                                TECH_ID: {user?.id?.slice(-6).toUpperCase()}
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        {stats.pendingRequests > 0 && (
                            <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                style={{
                                    width: isMobile ? '40px' : '44px',
                                    height: isMobile ? '40px' : '44px',
                                    borderRadius: '0.75rem',
                                    background: 'rgba(245, 158, 11, 0.2)',
                                    border: '1px solid rgba(245, 158, 11, 0.4)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative'
                                }}
                            >
                                <Bell size={isMobile ? 18 : 20} color="#f59e0b" />
                                <div style={{
                                    position: 'absolute',
                                    top: '-4px',
                                    right: '-4px',
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    background: '#ef4444',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.7rem',
                                    fontWeight: 900
                                }}>
                                    {stats.pendingRequests}
                                </div>
                            </motion.div>
                        )}
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={logout}
                            style={{
                                width: isMobile ? '40px' : '44px',
                                height: isMobile ? '40px' : '44px',
                                borderRadius: '0.75rem',
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                            }}
                        >
                            <LogOut size={isMobile ? 18 : 20} color="#ef4444" />
                        </motion.button>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div style={{
                    padding: isMobile ? '1rem' : '1rem 2rem',
                    borderBottom: '1px solid rgba(16, 185, 129, 0.2)',
                    background: 'rgba(0, 0, 0, 0.6)',
                    overflowX: 'auto',
                    display: 'flex',
                    gap: '0.5rem'
                }}>
                    {[
                        { id: 'overview', label: 'Overview', icon: Activity },
                        { id: 'requests', label: `Requests ${stats.pendingRequests > 0 ? `(${stats.pendingRequests})` : ''}`, icon: AlertTriangle },
                        { id: 'history', label: 'History', icon: Clock },
                        { id: 'profile', label: 'Profile', icon: User },
                        { id: 'support', label: 'Support', icon: Shield }
                    ].map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeView === tab.id;
                        return (
                            <motion.button
                                key={tab.id}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setActiveView(tab.id)}
                                style={{
                                    padding: isMobile ? '0.6rem 1rem' : '0.75rem 1.5rem',
                                    borderRadius: '0.75rem',
                                    background: isActive ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                                    border: `1px solid ${isActive ? 'rgba(16, 185, 129, 0.5)' : 'rgba(255,255,255,0.1)'}`,
                                    color: isActive ? '#10b981' : 'rgba(255,255,255,0.6)',
                                    fontWeight: 800,
                                    fontSize: isMobile ? '0.8rem' : '0.9rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    transition: 'all 0.3s ease',
                                    boxShadow: isActive ? '0 0 20px rgba(16, 185, 129, 0.3)' : 'none',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                <Icon size={16} />
                                {tab.label}
                            </motion.button>
                        );
                    })}
                </div>

                {/* Main Content Area */}
                <div style={{ padding: isMobile ? '1rem' : '2rem' }}>
                    <AnimatePresence mode="wait">
                        {activeView === 'overview' && (
                            <motion.div
                                key="overview"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                {/* Stats Grid */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))',
                                    gap: '1rem',
                                    marginBottom: '2rem'
                                }}>
                                    <StatCard icon={Zap} label="ACTIVE JOBS" value={stats.activeJobs} trend={15} color="#10b981" pulse={stats.activeJobs > 0} />
                                    <StatCard icon={CheckCircle} label="COMPLETED TODAY" value={stats.completedToday} trend={20} color="#3b82f6" />
                                    <StatCard icon={DollarSign} label="EARNINGS" value={`$${stats.totalEarnings}`} trend={12} color="#f59e0b" />
                                    <StatCard icon={Star} label="RATING" value={stats.rating} trend={5} color="#8b5cf6" />
                                </div>

                                {/* Pending Requests Alert */}
                                {stats.pendingRequests > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        style={{
                                            background: 'rgba(245, 158, 11, 0.1)',
                                            border: '1px solid rgba(245, 158, 11, 0.3)',
                                            borderRadius: '1rem',
                                            padding: isMobile ? '1rem' : '1.5rem',
                                            marginBottom: '2rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem',
                                            boxShadow: '0 0 30px rgba(245, 158, 11, 0.2)'
                                        }}
                                    >
                                        <AlertTriangle size={32} color="#f59e0b" />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: isMobile ? '1rem' : '1.2rem', fontWeight: 900, marginBottom: '0.3rem' }}>
                                                {stats.pendingRequests} Pending Request{stats.pendingRequests > 1 ? 's' : ''}
                                            </div>
                                            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
                                                Review and respond to customer requests
                                            </div>
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setActiveView('requests')}
                                            style={{
                                                padding: '0.75rem 1.5rem',
                                                borderRadius: '0.75rem',
                                                background: '#f59e0b',
                                                border: 'none',
                                                color: 'black',
                                                fontWeight: 900,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            VIEW
                                        </motion.button>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}

                        {activeView === 'requests' && (
                            <motion.div
                                key="requests"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <h3 style={{ fontSize: isMobile ? '1.2rem' : '1.5rem', fontWeight: 900, marginBottom: '1.5rem', textShadow: '0 0 10px #f59e0b' }}>
                                    PENDING REQUESTS
                                </h3>
                                {pendingRequests.length > 0 ? (
                                    pendingRequests.map(request => (
                                        <PendingRequestCard key={request.id} request={request} />
                                    ))
                                ) : (
                                    <div style={{
                                        background: 'rgba(15, 15, 15, 0.8)',
                                        border: '1px solid rgba(16, 185, 129, 0.2)',
                                        borderRadius: '1rem',
                                        padding: isMobile ? '2rem 1rem' : '3rem 2rem',
                                        textAlign: 'center',
                                        color: 'rgba(255,255,255,0.5)'
                                    }}>
                                        <CheckCircle size={48} color="#10b981" style={{ margin: '0 auto 1rem' }} />
                                        <div style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                                            All Caught Up!
                                        </div>
                                        <div>No pending requests at the moment</div>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeView === 'history' && (
                            <motion.div
                                key="history"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <BookingHistory type="technician" />
                            </motion.div>
                        )}

                        {activeView === 'profile' && (
                            <motion.div
                                key="profile"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <ProfileSettings />
                            </motion.div>
                        )}

                        {activeView === 'support' && (
                            <motion.div
                                key="support"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <SupportHelp />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default TechnicianDashboard;
