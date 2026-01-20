import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, Clock, User, Shield, CheckCircle, DollarSign,
    Star, Bell, LogOut, AlertTriangle, Zap, TrendingUp, Target
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

    const PendingRequestCard = ({ request }) => (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: isMobile ? '1.25rem' : '1.5rem',
                marginBottom: '1rem'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div>
                    <div style={{ fontSize: isMobile ? '1.1rem' : '1.25rem', fontWeight: 800, color: '#000000', marginBottom: '0.5rem' }}>
                        {request.serviceType || 'Service Request'}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                        Customer: {request.customerName || 'Unknown'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: 600 }}>
                        {new Date(request.createdAt).toLocaleString()}
                    </div>
                </div>
                <div style={{
                    padding: '0.5rem 1rem',
                    background: '#fef3c7',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#92400e'
                }}>
                    PENDING
                </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                        flex: 1,
                        padding: '0.75rem',
                        borderRadius: '10px',
                        background: '#000000',
                        border: 'none',
                        color: '#ffffff',
                        fontWeight: 800,
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    }}
                >
                    Accept
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                        flex: 1,
                        padding: '0.75rem',
                        borderRadius: '10px',
                        background: '#ffffff',
                        border: '1px solid #e5e7eb',
                        color: '#000000',
                        fontWeight: 800,
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    }}
                >
                    Reject
                </motion.button>
            </div>
        </motion.div>
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
                            Technician
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    {stats.pendingRequests > 0 && (
                        <motion.div
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: '10px',
                                background: '#fef3c7',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative'
                            }}
                        >
                            <Bell size={20} color="#92400e" strokeWidth={2.5} />
                            <div style={{
                                position: 'absolute',
                                top: '-4px',
                                right: '-4px',
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                background: '#000000',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.7rem',
                                fontWeight: 900,
                                color: '#ffffff'
                            }}>
                                {stats.pendingRequests}
                            </div>
                        </motion.div>
                    )}
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
                                <StatCard icon={Zap} label="Active Jobs" value={stats.activeJobs} change={15} />
                                <StatCard icon={CheckCircle} label="Completed Today" value={stats.completedToday} change={20} />
                                <StatCard icon={DollarSign} label="Earnings" value={`$${stats.totalEarnings}`} change={12} />
                                <StatCard icon={Star} label="Rating" value={stats.rating} change={5} />
                            </div>

                            {/* Pending Requests Alert */}
                            {stats.pendingRequests > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    style={{
                                        background: '#fef3c7',
                                        border: '1px solid #fde68a',
                                        borderRadius: '12px',
                                        padding: isMobile ? '1.25rem' : '1.5rem',
                                        marginBottom: '2rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem'
                                    }}
                                >
                                    <AlertTriangle size={32} color="#92400e" strokeWidth={2.5} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: isMobile ? '1.1rem' : '1.25rem', fontWeight: 800, marginBottom: '0.3rem', color: '#000000' }}>
                                            {stats.pendingRequests} Pending Request{stats.pendingRequests > 1 ? 's' : ''}
                                        </div>
                                        <div style={{ fontSize: '0.875rem', color: '#92400e', fontWeight: 600 }}>
                                            Review and respond to customer requests
                                        </div>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setActiveView('requests')}
                                        style={{
                                            padding: '0.75rem 1.5rem',
                                            borderRadius: '10px',
                                            background: '#000000',
                                            border: 'none',
                                            color: '#ffffff',
                                            fontWeight: 800,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease'
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
                            transition={{ duration: 0.2 }}
                        >
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', color: '#000000' }}>
                                Pending Requests
                            </h3>
                            {pendingRequests.length > 0 ? (
                                pendingRequests.map(request => (
                                    <PendingRequestCard key={request.id} request={request} />
                                ))
                            ) : (
                                <div style={{
                                    background: '#ffffff',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '12px',
                                    padding: isMobile ? '2rem 1rem' : '3rem 2rem',
                                    textAlign: 'center',
                                    color: '#6b7280'
                                }}>
                                    <CheckCircle size={48} color="#d1d5db" style={{ margin: '0 auto 1rem' }} />
                                    <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                                        All Caught Up!
                                    </div>
                                    <div style={{ fontSize: '0.875rem' }}>
                                        No pending requests at the moment
                                    </div>
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
                            transition={{ duration: 0.2 }}
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

export default TechnicianDashboard;
