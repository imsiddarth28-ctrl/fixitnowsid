import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import API_URL from '../config';
import { Menu, X, Check, Ban, Activity, DollarSign, Users, Bell, Trash2, Shield, Search, TrendingUp, BarChart3, Settings, LogOut, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { subscribeToEvent } from '../socket';

const AdminDashboard = () => {
    const { logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [technicians, setTechnicians] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [view, setView] = useState('techs'); // 'techs', 'bookings', 'analytics', 'support'
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
        const loadData = async () => {
            setLoading(true);
            await Promise.all([fetchTechnicians(), fetchBookings()]);
            setLoading(false);
        };
        loadData();

        // Real-time listeners
        const unsub = subscribeToEvent('admin-updates', '*', (eventName, data) => {
            console.log('[ADMIN EVENT]', eventName, data);
            // We can be more specific, but for simplicity, any relevant event triggers a data refresh
            if (['new_technician', 'new_booking', 'job_status_change', 'job_cancelled', 'technician_update'].includes(eventName)) {
                fetchTechnicians();
                fetchBookings();
            }
        });

        // Specific listeners because subscribeToEvent might not support '*' easily depending on bind implementation
        const unsub1 = subscribeToEvent('admin-updates', 'new_technician', fetchTechnicians);
        const unsub2 = subscribeToEvent('admin-updates', 'new_booking', fetchBookings);
        const unsub3 = subscribeToEvent('admin-updates', 'job_status_change', fetchBookings);
        const unsub4 = subscribeToEvent('admin-updates', 'job_cancelled', fetchBookings);

        return () => {
            unsub1(); unsub2(); unsub3(); unsub4();
        };
    }, []);

    const fetchTechnicians = async () => {
        try {
            const res = await fetch(`${API_URL}/api/admin/technicians`);
            const data = await res.json();
            setTechnicians(data);
        } catch (err) { console.error(err); }
    };

    const fetchBookings = async () => {
        try {
            const res = await fetch(`${API_URL}/api/admin/bookings`);
            const data = await res.json();
            setBookings(data);
        } catch (err) { console.error(err); }
    };

    const approveTech = async (id) => {
        try {
            await fetch(`${API_URL}/api/admin/approve-technician/${id}`, { method: 'PUT' });
            fetchTechnicians();
        } catch (err) { console.error(err); }
    };

    const toggleBlockTech = async (id, currentStatus) => {
        try {
            await fetch(`${API_URL}/api/admin/block-technician/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isBlocked: !currentStatus })
            });
            fetchTechnicians();
        } catch (err) { console.error(err); }
    };

    const stats = {
        totalEarnings: bookings?.filter(b => b.status === 'completed').reduce((acc, curr) => acc + (curr.price || 0), 0) || 0,
        activeTechs: technicians?.filter(t => t.isAvailable && !t.isBlocked).length || 0,
        pendingTechs: technicians?.filter(t => !t.isVerified).length || 0,
        pendingBookings: bookings?.filter(b => b.status === 'pending').length || 0,
        avgRating: technicians?.length > 0
            ? (technicians.reduce((acc, curr) => acc + (curr.rating || 0), 0) / technicians.length).toFixed(1)
            : 5.0
    };

    const menuItems = [
        { id: 'techs', label: 'Technician Hub', icon: Users },
        { id: 'bookings', label: 'Project Ledger', icon: Activity },
        { id: 'analytics', label: 'Growth Insights', icon: BarChart3 },
        { id: 'support', label: 'System Alerts', icon: Bell }
    ];

    const systemAlerts = [
        { id: 1, type: 'info', msg: 'System backup completed successfully.', time: '10m ago' },
        { id: 2, type: 'warning', msg: 'High demand detected in downtown area.', time: '1h ago' },
        { id: 3, type: 'success', msg: 'New pro registration batch processed.', time: '2h ago' },
        { id: 4, type: 'error', msg: 'Sync latency spike observed.', time: '5h ago' },
    ];

    const NavItem = ({ id, icon: Icon, label, badge }) => {
        const isActive = view === id;
        return (
            <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                    setView(id);
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
                        background: 'var(--error)', color: 'white',
                        fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px', fontWeight: '800'
                    }}>
                        {badge}
                    </span>
                )}
            </motion.button>
        );
    };

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
                                    width: '32px', height: '32px', background: 'var(--text)',
                                    borderRadius: '10px', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', color: 'var(--bg)'
                                }}>
                                    <Shield size={18} />
                                </div>
                                <span style={{ fontSize: '1.25rem', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>SAHAKAR</span>
                                <span style={{ fontSize: '0.65rem', background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px', fontWeight: '800' }}>ADMIN</span>
                            </div>
                            {window.innerWidth < 1024 && (
                                <button onClick={() => setIsSidebarOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text)' }}>
                                    <X size={20} />
                                </button>
                            )}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                            {menuItems.map(item => (
                                <NavItem key={item.id} id={item.id} icon={item.icon} label={item.label} badge={item.id === 'techs' ? stats.pendingTechs : 0} />
                            ))}
                        </div>

                        <div className="glass" style={{ padding: '20px', borderRadius: 'var(--radius-lg)', marginBottom: '24px' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px' }}>System Status</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--success)', fontWeight: '600' }}>
                                <span style={{ width: '8px', height: '8px', background: 'var(--success)', borderRadius: '50%' }}></span>
                                All Systems Operational
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                            <button onClick={logout} style={{
                                width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)',
                                background: 'transparent', color: 'var(--error)', fontWeight: '700', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifySelf: 'center', gap: '10px'
                            }}>
                                <LogOut size={18} /> Terminate Root Session
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
                            Command Center
                        </h2>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button onClick={toggleTheme} className="btn-secondary" style={{ padding: '0.6rem', borderRadius: '12px' }}>
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '12px', borderLeft: '1px solid var(--border)' }}>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.85rem', fontWeight: '700' }}>Root Admin</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Superuser.01</div>
                            </div>
                            <div style={{ width: '40px', height: '40px', background: 'var(--text)', color: 'var(--bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>A</div>
                        </div>
                    </div>
                </header>

                <div style={{ padding: 'var(--container-padding)', maxWidth: '1800px', margin: '0 auto', width: '100%' }}>
                    <motion.div
                        key={view}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Summary Section */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--gap)', marginBottom: 'var(--container-padding)' }}>
                            <div className="bento-card">
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>Volume</div>
                                <div style={{ fontSize: '1.6rem', fontWeight: '800', letterSpacing: '-0.03em' }}>${stats.totalEarnings.toFixed(2)}</div>
                            </div>
                            <div className="bento-card">
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>Experts</div>
                                <div style={{ fontSize: '1.6rem', fontWeight: '800', letterSpacing: '-0.03em' }}>{stats.activeTechs}</div>
                            </div>
                            <div className="bento-card">
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>Satisfaction</div>
                                <div style={{ fontSize: '1.6rem', fontWeight: '800', letterSpacing: '-0.03em' }}>{stats.avgRating}</div>
                            </div>
                            <div className="bento-card">
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>Queue</div>
                                <div style={{ fontSize: '1.6rem', fontWeight: '800', letterSpacing: '-0.03em' }}>{stats.pendingBookings}</div>
                            </div>
                        </div>

                        {view === 'techs' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Expert Verification Hub</h3>
                                    <div className="glass" style={{ padding: '8px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Search size={16} color="var(--text-secondary)" />
                                        <input type="text" placeholder="Search professionals..." style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontSize: '0.9rem' }} />
                                    </div>
                                </div>
                                {technicians.map(tech => (
                                    <motion.div key={tech._id} whileHover={{ y: -2 }} className="bento-card" style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        border: !tech.isVerified ? '1px solid var(--text)' : '1px solid var(--border)',
                                        opacity: tech.isBlocked ? 0.5 : 1
                                    }}>
                                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.2rem' }}>
                                                {tech.name[0]}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '800', fontSize: '1.1rem' }}>{tech.name} {tech.isBlocked && <span style={{ color: 'var(--error)', fontSize: '0.7rem' }}>[BLOCKED]</span>}</div>
                                                <div style={{ display: 'flex', gap: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                                    <span>{tech.serviceType}</span>
                                                    <span>•</span>
                                                    <span>{tech.email}</span>
                                                    <span>•</span>
                                                    <span style={{ color: 'var(--text)', fontWeight: '700' }}>{tech.rating}⭐</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            {!tech.isVerified && (
                                                <button onClick={() => approveTech(tech._id)} className="btn btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.8rem' }}>
                                                    APPROVE PRO
                                                </button>
                                            )}
                                            <button onClick={() => toggleBlockTech(tech._id, tech.isBlocked)} className="btn btn-secondary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.8rem', color: tech.isBlocked ? 'var(--text)' : 'var(--error)' }}>
                                                {tech.isBlocked ? 'UNBLOCK' : 'RESTRICT'}
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {view === 'bookings' && (
                            <div className="bento-card" style={{ padding: 0, overflow: 'hidden' }}>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                        <thead>
                                            <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                                                <th style={{ padding: '1.5rem', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>ID</th>
                                                <th style={{ padding: '1.5rem', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Service</th>
                                                <th style={{ padding: '1.5rem', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Parties</th>
                                                <th style={{ padding: '1.5rem', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
                                                <th style={{ padding: '1.5rem', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {bookings.map(job => (
                                                <tr key={job._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                    <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{job._id.slice(-6).toUpperCase()}</td>
                                                    <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.95rem', fontWeight: '700' }}>{job.serviceType}</td>
                                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                                        <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>C: {job.customerId?.name || '---'}</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>T: {job.technicianId?.name || '---'}</div>
                                                    </td>
                                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                                        <span className="badge" style={{
                                                            background: job.status === 'completed' ? 'var(--text)' : 'var(--bg-tertiary)',
                                                            color: job.status === 'completed' ? 'var(--bg)' : 'var(--text)',
                                                            fontSize: '0.65rem'
                                                        }}>
                                                            {job.status}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '1.25rem 1.5rem', fontWeight: '800', fontSize: '1.1rem' }}>
                                                        ${(job.price || 0).toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {view === 'analytics' && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                                <div className="bento-card" style={{ gridColumn: 'span 2' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                                        <h4 style={{ fontWeight: '800', fontSize: '1.2rem' }}>Revenue Stream</h4>
                                        <TrendingUp size={20} color="var(--success)" />
                                    </div>
                                    <div style={{ height: '240px', background: 'var(--bg-tertiary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                                        Interactive Chart Component
                                    </div>
                                </div>
                                <div className="bento-card">
                                    <div style={{ fontWeight: '800', fontSize: '1.2rem', marginBottom: '20px' }}>Service Distribution</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        {['Plumbing', 'Electrical', 'Cleaning', 'AC Repair'].map((s, i) => (
                                            <div key={i}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                                                    <span>{s}</span>
                                                    <span style={{ fontWeight: '700' }}>{70 - i * 15}%</span>
                                                </div>
                                                <div style={{ height: '6px', width: '100%', background: 'var(--bg-tertiary)', borderRadius: '10px' }}>
                                                    <div style={{ height: '100%', width: `${70 - i * 15}%`, background: 'var(--text)', borderRadius: '10px' }}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {view === 'support' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {systemAlerts.map(alert => (
                                    <div key={alert.id} className="glass" style={{
                                        padding: '20px 24px',
                                        borderLeft: `6px solid ${alert.type === 'error' ? 'var(--error)' : alert.type === 'warning' ? 'var(--warning)' : 'var(--text)'}`,
                                        borderRadius: '16px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div>
                                            <div style={{ fontSize: '1.1rem', fontWeight: '700' }}>{alert.msg}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>System Node: {alert.time}</div>
                                        </div>
                                        <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}>Acknowledge</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
