import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap, MapPin, Clock, TrendingUp, Activity, Bell,
    Settings, LogOut, Search, Plus, ArrowRight,
    CheckCircle, AlertCircle, Loader, User, MessageSquare,
    Calendar, DollarSign, Star, Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BookingHistory from './BookingHistory';
import ProfileSettings from './ProfileSettings';
import SupportHelp from './SupportHelp';
import UserAvatar from './UserAvatar';
import API_URL from '../config';

const CustomerDashboard = () => {
    const { user, logout } = useAuth();
    const [activeView, setActiveView] = useState('overview');
    const [stats, setStats] = useState({
        totalBookings: 0,
        activeJobs: 0,
        completedJobs: 0,
        totalSpent: 0
    });
    const [recentActivity, setRecentActivity] = useState([]);
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
            const res = await fetch(`${API_URL}/api/customers/${user.id}/dashboard`);
            if (res.ok) {
                const data = await res.json();
                setStats(data.stats || stats);
                setRecentActivity(data.recentActivity || []);
            }
        } catch (err) {
            console.error('Failed to fetch dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ icon: Icon, label, value, trend, color }) => (
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
                pointerEvents: 'none'
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

    const QuickAction = ({ icon: Icon, label, onClick, color }) => (
        <motion.button
            whileHover={{ scale: 1.05, boxShadow: `0 0 30px ${color}40` }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            style={{
                background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
                border: `1px solid ${color}40`,
                borderRadius: '1rem',
                padding: isMobile ? '1rem' : '1.25rem',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.75rem',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <div style={{
                width: isMobile ? '48px' : '56px',
                height: isMobile ? '48px' : '56px',
                borderRadius: '50%',
                background: `${color}30`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `2px solid ${color}60`
            }}>
                <Icon size={isMobile ? 24 : 28} color={color} />
            </div>
            <div style={{ fontSize: isMobile ? '0.8rem' : '0.9rem', fontWeight: 800, color: 'white', textAlign: 'center' }}>
                {label}
            </div>
        </motion.button>
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
                background: 'linear-gradient(0deg, transparent 24%, rgba(59, 130, 246, 0.05) 25%, rgba(59, 130, 246, 0.05) 26%, transparent 27%, transparent 74%, rgba(59, 130, 246, 0.05) 75%, rgba(59, 130, 246, 0.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(59, 130, 246, 0.05) 25%, rgba(59, 130, 246, 0.05) 26%, transparent 27%, transparent 74%, rgba(59, 130, 246, 0.05) 75%, rgba(59, 130, 246, 0.05) 76%, transparent 77%, transparent)',
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
                    borderBottom: '1px solid rgba(59, 130, 246, 0.2)',
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
                            <div style={{ fontSize: isMobile ? '1.2rem' : '1.5rem', fontWeight: 900, textShadow: '0 0 10px #3b82f6' }}>
                                {user?.name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 700, letterSpacing: '0.1em' }}>
                                CUSTOMER_ID: {user?.id?.slice(-6).toUpperCase()}
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            style={{
                                width: isMobile ? '40px' : '44px',
                                height: isMobile ? '40px' : '44px',
                                borderRadius: '0.75rem',
                                background: 'rgba(59, 130, 246, 0.1)',
                                border: '1px solid rgba(59, 130, 246, 0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                            }}
                        >
                            <Bell size={isMobile ? 18 : 20} color="#3b82f6" />
                        </motion.button>
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
                    borderBottom: '1px solid rgba(59, 130, 246, 0.2)',
                    background: 'rgba(0, 0, 0, 0.6)',
                    overflowX: 'auto',
                    display: 'flex',
                    gap: '0.5rem'
                }}>
                    {[
                        { id: 'overview', label: 'Overview', icon: Activity },
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
                                    background: isActive ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                                    border: `1px solid ${isActive ? 'rgba(59, 130, 246, 0.5)' : 'rgba(255,255,255,0.1)'}`,
                                    color: isActive ? '#3b82f6' : 'rgba(255,255,255,0.6)',
                                    fontWeight: 800,
                                    fontSize: isMobile ? '0.8rem' : '0.9rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    transition: 'all 0.3s ease',
                                    boxShadow: isActive ? '0 0 20px rgba(59, 130, 246, 0.3)' : 'none',
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
                                    <StatCard icon={Zap} label="ACTIVE JOBS" value={stats.activeJobs} trend={12} color="#3b82f6" />
                                    <StatCard icon={CheckCircle} label="COMPLETED" value={stats.completedJobs} trend={8} color="#10b981" />
                                    <StatCard icon={DollarSign} label="TOTAL SPENT" value={`$${stats.totalSpent}`} trend={-5} color="#f59e0b" />
                                    <StatCard icon={Star} label="AVG RATING" value="4.8" trend={3} color="#8b5cf6" />
                                </div>

                                {/* Quick Actions */}
                                <div style={{ marginBottom: '2rem' }}>
                                    <h3 style={{ fontSize: isMobile ? '1.2rem' : '1.5rem', fontWeight: 900, marginBottom: '1rem', textShadow: '0 0 10px #3b82f6' }}>
                                        QUICK ACTIONS
                                    </h3>
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(150px, 1fr))',
                                        gap: '1rem'
                                    }}>
                                        <QuickAction icon={Plus} label="New Booking" onClick={() => { }} color="#3b82f6" />
                                        <QuickAction icon={MessageSquare} label="Messages" onClick={() => { }} color="#10b981" />
                                        <QuickAction icon={Calendar} label="Schedule" onClick={() => { }} color="#f59e0b" />
                                        <QuickAction icon={Settings} label="Settings" onClick={() => setActiveView('profile')} color="#8b5cf6" />
                                    </div>
                                </div>

                                {/* Recent Activity */}
                                <div>
                                    <h3 style={{ fontSize: isMobile ? '1.2rem' : '1.5rem', fontWeight: 900, marginBottom: '1rem', textShadow: '0 0 10px #3b82f6' }}>
                                        RECENT ACTIVITY
                                    </h3>
                                    <div style={{
                                        background: 'rgba(15, 15, 15, 0.8)',
                                        border: '1px solid rgba(59, 130, 246, 0.2)',
                                        borderRadius: '1rem',
                                        padding: isMobile ? '1rem' : '1.5rem',
                                        textAlign: 'center',
                                        color: 'rgba(255,255,255,0.5)'
                                    }}>
                                        No recent activity
                                    </div>
                                </div>
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
                                <BookingHistory type="customer" />
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

export default CustomerDashboard;
