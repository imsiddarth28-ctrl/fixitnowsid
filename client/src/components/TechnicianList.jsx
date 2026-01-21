import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Filter, Star, Clock, MapPin,
    ChevronRight, ArrowLeft, Zap, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';
import BookingRequestModal from './BookingRequestModal';

const TechnicianList = ({ onBookingSuccess }) => {
    const { user } = useAuth();
    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedTech, setSelectedTech] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        fetchTechnicians();
    }, []);

    const fetchTechnicians = async () => {
        try {
            const res = await fetch(`${API_URL}/api/technicians`);
            if (res.ok) {
                const data = await res.json();
                setTechnicians(data);
            }
        } catch (err) {
            console.error('Fetch techs error:', err);
        } finally {
            setLoading(false);
        }
    };

    const categories = ['All', 'Plumber', 'Electrician', 'Cleaning', 'Carpenter', 'HVAC'];

    const filteredTechs = technicians.filter(tech => {
        const matchesCategory = selectedCategory === 'All' ||
            tech.serviceType?.toLowerCase() === selectedCategory.toLowerCase();
        const matchesSearch = tech.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tech.specialty?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const TechCard = ({ tech }) => (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            onClick={() => setSelectedTech(tech)}
            className="glass"
            style={{
                padding: '32px',
                borderRadius: '32px',
                border: '1px solid var(--border)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
                background: 'var(--bg-secondary)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div style={{
                        width: '64px', height: '64px', borderRadius: '20px',
                        background: 'var(--text)', color: 'var(--bg)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '24px', fontWeight: '900',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                    }}>
                        {tech.name?.charAt(0)}
                    </div>
                    <div>
                        <div style={{ fontWeight: '900', fontSize: '1.25rem', color: 'var(--text)', letterSpacing: '-0.02em' }}>{tech.name}</div>
                        <div style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-secondary)',
                            fontWeight: '800',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            marginTop: '4px'
                        }}>{tech.serviceType}</div>
                    </div>
                </div>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 14px', background: 'var(--bg-tertiary)', borderRadius: '12px',
                    fontSize: '0.85rem', fontWeight: '900', border: '1px solid var(--border)'
                }}>
                    <Star size={16} fill="var(--text)" color="var(--text)" />
                    {tech.rating?.toFixed(1) || '5.0'}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{
                    padding: '16px', background: 'var(--bg-tertiary)', borderRadius: '18px',
                    display: 'flex', flexDirection: 'column', gap: '4px', border: '1px solid var(--border)'
                }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: '900', letterSpacing: '0.05em' }}>EXPERIENCE</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: '800' }}>{tech.experience || '4+ Years'}</div>
                </div>
                <div style={{
                    padding: '16px', background: 'var(--bg-tertiary)', borderRadius: '18px',
                    display: 'flex', flexDirection: 'column', gap: '4px', border: '1px solid var(--border)'
                }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: '900', letterSpacing: '0.05em' }}>COMPLETED</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: '800' }}>{tech.totalJobs || '120+'} Jobs</div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: tech.isBusy ? 'var(--warning)' : 'var(--success)', fontWeight: '800' }}>
                    <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: tech.isBusy ? 'var(--warning)' : 'var(--success)',
                        boxShadow: `0 0 10px ${tech.isBusy ? 'var(--warning)' : 'var(--success)'}`
                    }} />
                    {tech.isBusy ? 'BUSY' : 'READY_NOW'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: 'var(--text)', fontWeight: '900', letterSpacing: '0.02em' }}>
                    PRO_FILE <ChevronRight size={18} />
                </div>
            </div>
        </motion.div>
    );

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg)',
            padding: isMobile ? '32px 24px' : '64px 80px',
            color: 'var(--text)'
        }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                {/* Header Section */}
                <div style={{ marginBottom: '64px' }}>
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}
                    >
                        <ShieldCheck size={20} color="var(--success)" />
                        <span style={{ fontSize: '0.85rem', fontWeight: '900', color: 'var(--success)', letterSpacing: '0.05em' }}>VERIFIED_PROFESSIONALS_ONLY</span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        style={{ fontSize: isMobile ? '2.5rem' : '4rem', fontWeight: '900', letterSpacing: '-0.05em', marginBottom: '24px', lineHeight: '1' }}
                    >
                        FIND_YOUR_EXPERT
                    </motion.h1>

                    {/* Search and Filters */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        style={{
                            display: 'flex',
                            flexDirection: isMobile ? 'column' : 'row',
                            gap: '20px',
                            marginTop: '48px'
                        }}>
                        <div className="glass" style={{
                            flex: 1, position: 'relative',
                            borderRadius: '24px', border: '1px solid var(--border)',
                            padding: '18px 24px', display: 'flex', alignItems: 'center', gap: '16px',
                            background: 'var(--bg-secondary)'
                        }}>
                            <Search size={22} color="var(--text-secondary)" />
                            <input
                                type="text"
                                placeholder="Search by name, expertise or skill..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="input"
                                style={{
                                    border: 'none', background: 'transparent', outline: 'none',
                                    width: '100%', fontSize: '1rem', fontWeight: '600', padding: 0
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none' }}>
                            {categories.map(cat => (
                                <motion.button
                                    key={cat}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={selectedCategory === cat ? 'btn btn-primary' : 'btn btn-secondary'}
                                    style={{
                                        padding: '14px 28px',
                                        borderRadius: '20px',
                                        fontSize: '0.9rem',
                                        fontWeight: '800',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {cat.toUpperCase()}
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '120px' }}>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                            style={{ width: '48px', height: '48px', border: '3px solid var(--border)', borderTopColor: 'var(--text)', borderRadius: '50%' }}
                        />
                    </div>
                ) : filteredTechs.length > 0 ? (
                    <div className="bento-grid" style={{
                        gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
                        gap: '32px'
                    }}>
                        {filteredTechs.map(tech => <TechCard key={tech._id} tech={tech} />)}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{ textAlign: 'center', padding: '120px 0' }}
                    >
                        <div style={{ fontSize: '64px', marginBottom: '32px' }}>🔍</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '12px', letterSpacing: '-0.02em' }}>NO_PROFESSIONALS_FOUND</div>
                        <div style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Adjust filters or search parameters for better results.</div>
                    </motion.div>
                )}
            </div>

            {/* Booking Modal */}
            <AnimatePresence>
                {selectedTech && (
                    <BookingRequestModal
                        technician={selectedTech}
                        customerId={user.id}
                        onClose={() => setSelectedTech(null)}
                        onBookingCreated={(booking) => {
                            if (onBookingSuccess) onBookingSuccess(booking);
                            setSelectedTech(null);
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default TechnicianList;
