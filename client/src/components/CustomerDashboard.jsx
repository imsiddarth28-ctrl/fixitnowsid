import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, Clock, User, Shield, CheckCircle, DollarSign,
    Star, Bell, LogOut, Plus, MessageSquare, Calendar, Settings,
    TrendingUp, ArrowRight, Zap
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
            }
        } catch (err) {
            console.error('Failed to fetch dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ icon: Icon, label, value, change }) => (
        <motion.div
            whileHover={{ y: -4 }}
            style={{
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: isMobile ? '1.25rem' : '1.5rem',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '10px',
                    background: '#000000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Icon size={24} color="#ffffff" strokeWidth={2.5} />
                </div>
                {change && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: change > 0 ? '#10b981' : '#ef4444'
                    }}>
                        <TrendingUp size={14} />
                        {change > 0 ? '+' : ''}{change}%
                    </div>
                )}
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', letterSpacing: '0.05em', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                {label}
            </div>
            <div style={{ fontSize: isMobile ? '1.75rem' : '2rem', fontWeight: 700, color: '#000000' }}>
                {value}
            </div>
        </motion.div>
    );

    const QuickAction = ({ icon: Icon, label, onClick }) => (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            style={{
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: isMobile ? '1rem' : '1.25rem',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.75rem',
                transition: 'all 0.3s ease',
                width: '100%'
            }}
        >
            <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#000000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Icon size={28} color="#ffffff" strokeWidth={2.5} />
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#000000', textAlign: 'center' }}>
                {label}
            </div>
        </motion.button>
    );

    return (
        <div style={{
            minHeight: '100vh',
            background: '#f9fafb',
            color: '#000000'
        }}>
            {/* Top Bar */}
            <div style={{
                background: '#ffffff',
                borderBottom: '1px solid #e5e7eb',
                padding: isMobile ? '1rem 1.5rem' : '1.25rem 2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
                flexWrap: isMobile ? 'wrap' : 'nowrap'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <UserAvatar size={isMobile ? 44 : 48} />
                    <div>
                        <div style={{ fontSize: isMobile ? '1.25rem' : '1.5rem', fontWeight: 800, color: '#000000' }}>
                            {user?.name}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: 600 }}>
                            Customer
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '10px',
                            background: '#f3f4f6',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <Bell size={20} color="#000000" strokeWidth={2.5} />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={logout}
                        style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '10px',
                            background: '#000000',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <LogOut size={20} color="#ffffff" strokeWidth={2.5} />
                    </motion.button>
                </div>
            </div>

            {/* Navigation */}
            <div style={{
                background: '#ffffff',
                borderBottom: '1px solid #e5e7eb',
                padding: isMobile ? '0.75rem 1.5rem' : '1rem 2rem',
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
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setActiveView(tab.id)}
                            style={{
                                padding: isMobile ? '0.625rem 1rem' : '0.75rem 1.25rem',
                                borderRadius: '10px',
                                background: isActive ? '#000000' : 'transparent',
                                border: 'none',
                                color: isActive ? '#ffffff' : '#6b7280',
                                fontWeight: 700,
                                fontSize: '0.875rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                transition: 'all 0.2s ease',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            <Icon size={16} strokeWidth={2.5} />
                            {tab.label}
                        </motion.button>
                    );
                })}
            </div>

            {/* Main Content */}
            <div style={{ padding: isMobile ? '1.5rem' : '2rem' }}>
                <AnimatePresence mode="wait">
                    {activeView === 'overview' && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {/* Stats Grid */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(240px, 1fr))',
                                gap: '1rem',
                                marginBottom: '2rem'
                            }}>
                                <StatCard icon={Zap} label="Active Jobs" value={stats.activeJobs} change={12} />
                                <StatCard icon={CheckCircle} label="Completed" value={stats.completedJobs} change={8} />
                                <StatCard icon={DollarSign} label="Total Spent" value={`$${stats.totalSpent}`} change={-5} />
                                <StatCard icon={Star} label="Avg Rating" value="4.8" change={3} />
                            </div>

                            {/* Quick Actions */}
                            <div style={{ marginBottom: '2rem' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem', color: '#000000' }}>
                                    Quick Actions
                                </h3>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(140px, 1fr))',
                                    gap: '1rem'
                                }}>
                                    <QuickAction icon={Plus} label="New Booking" onClick={() => { }} />
                                    <QuickAction icon={MessageSquare} label="Messages" onClick={() => { }} />
                                    <QuickAction icon={Calendar} label="Schedule" onClick={() => { }} />
                                    <QuickAction icon={Settings} label="Settings" onClick={() => setActiveView('profile')} />
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem', color: '#000000' }}>
                                    Recent Activity
                                </h3>
                                <div style={{
                                    background: '#ffffff',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '12px',
                                    padding: isMobile ? '2rem 1rem' : '3rem 2rem',
                                    textAlign: 'center',
                                    color: '#6b7280'
                                }}>
                                    <Activity size={48} color="#d1d5db" style={{ margin: '0 auto 1rem' }} />
                                    <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                                        No recent activity
                                    </div>
                                    <div style={{ fontSize: '0.875rem' }}>
                                        Your activity will appear here
                                    </div>
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
                            transition={{ duration: 0.2 }}
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
                            transition={{ duration: 0.2 }}
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
                            transition={{ duration: 0.2 }}
                        >
                            <SupportHelp />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default CustomerDashboard;
