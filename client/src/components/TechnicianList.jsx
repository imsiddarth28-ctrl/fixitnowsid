import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

import API_URL from '../config';
import { motion } from 'framer-motion';
import LiveMap from './LiveMap';

const TechnicianList = ({ onBookingSuccess }) => {
    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTech, setSelectedTech] = useState(null);
    const [filter, setFilter] = useState('all');
    const { user } = useAuth();

    // Booking Form State
    const [description, setDescription] = useState('');
    const [address, setAddress] = useState('');
    const [pickedLocation, setPickedLocation] = useState({ x: 75, y: 65 });
    const [isEmergency, setIsEmergency] = useState(false);
    const [isBooking, setIsBooking] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);

    useEffect(() => {
        fetch(`${API_URL}/api/technicians`)
            .then(res => res.json())
            .then(data => {
                setTechnicians(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching technicians:', err);
                setLoading(false);
            });
    }, []);

    const handleBook = (tech) => {
        if (!user) {
            alert('Please login to book a technician');
            return;
        }
        setSelectedTech(tech);
    };

    const confirmBooking = async () => {
        if (!description || !address) {
            alert('Please fill in all details');
            return;
        }

        setIsBooking(true);

        const bookingData = {
            technicianId: selectedTech._id,
            customerId: user.id || user._id,
            serviceType: selectedTech.serviceType,
            price: isEmergency ? 80 : 50,
            location: {
                address,
                latitude: pickedLocation.y,
                longitude: pickedLocation.x
            },
            description,
            isEmergency
        };

        try {
            const res = await fetch(`${API_URL}/api/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingData)
            });
            const data = await res.json();
            if (res.ok) {
                setBookingSuccess(true);
                // Wait for animation
                setTimeout(() => {
                    setSelectedTech(null);
                    setBookingSuccess(false);
                    setDescription('');
                    setAddress('');
                    setIsEmergency(false);
                    if (onBookingSuccess) onBookingSuccess();
                }, 2000);
            } else {
                alert('Booking failed: ' + (data.error || data.message || 'Unknown error'));
            }
        } catch (err) {
            console.error('Booking Error:', err);
            alert('Booking failed: Server unreachable');
        } finally {
            setIsBooking(false);
        }
    };

    const filteredTechs = filter === 'all'
        ? technicians
        : technicians.filter(t => t.serviceType.toLowerCase() === filter.toLowerCase());

    const categories = ['All', 'Plumber', 'Electrician', 'Cleaning', 'Carpenter', 'HVAC', 'Windows'];

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
                    <div style={{ fontSize: '1.1rem' }}>Finding the best technicians...</div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', padding: '6rem 2rem 4rem' }}>
            {/* Header */}
            <div style={{ maxWidth: '1400px', margin: '0 auto', marginBottom: '3rem' }}>
                <h1 style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                    fontWeight: 800,
                    marginBottom: '1rem',
                    background: 'linear-gradient(135deg, var(--text) 0%, var(--text-muted) 100%)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    Available Experts
                </h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
                    {filteredTechs.length} verified professionals ready to help
                </p>

                {/* Smart Match Button */}
                <button
                    className="btn btn-primary"
                    style={{ padding: '1rem 2rem', fontSize: '1rem', marginBottom: '2rem' }}
                    onClick={() => {
                        const bestTech = [...technicians].sort((a, b) => b.rating - a.rating)[0];
                        if (bestTech) handleBook(bestTech);
                        else alert('No technicians available');
                    }}
                >
                    ⚡ Smart Match - Auto Assign Best Pro
                </button>

                {/* Category Filters */}
                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    flexWrap: 'wrap',
                    marginBottom: '3rem'
                }}>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat === 'All' ? 'all' : cat)}
                            style={{
                                padding: '0.7rem 1.5rem',
                                borderRadius: '0.5rem',
                                border: '1px solid var(--border)',
                                background: filter === (cat === 'All' ? 'all' : cat)
                                    ? 'var(--text)'
                                    : 'var(--card)',
                                color: filter === (cat === 'All' ? 'all' : cat)
                                    ? 'var(--bg)'
                                    : 'var(--text)',
                                fontWeight: 600,
                                fontSize: '0.95rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                if (filter !== (cat === 'All' ? 'all' : cat)) {
                                    e.target.style.borderColor = 'var(--text)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (filter !== (cat === 'All' ? 'all' : cat)) {
                                    e.target.style.borderColor = 'var(--border)';
                                }
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Technician Grid */}
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '2rem'
                }}>
                    {filteredTechs.map(tech => (
                        <motion.div
                            key={tech._id}
                            whileHover={{
                                scale: 1.02,
                                rotateY: 5,
                                rotateX: -2,
                                translateZ: 20
                            }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            style={{
                                background: 'var(--card)',
                                border: '1px solid var(--border)',
                                borderRadius: '1.5rem',
                                padding: '2.5rem',
                                position: 'relative',
                                cursor: 'pointer',
                                transformStyle: 'preserve-3d',
                                boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)'
                            }}
                        >
                            {/* Animated Glow Base */}
                            <motion.div
                                animate={{
                                    opacity: tech.isBusy ? 0.2 : (tech.isAvailable ? [0.1, 0.3, 0.1] : 0),
                                    scale: tech.isAvailable ? [1, 1.05, 1] : 1
                                }}
                                transition={{ duration: 3, repeat: Infinity }}
                                style={{
                                    position: 'absolute', inset: -1, borderRadius: '1.5rem',
                                    background: tech.isBusy ? 'linear-gradient(135deg, #f59e0b, #ef4444)' : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                    zIndex: -1, filter: 'blur(15px)'
                                }}
                            />

                            {/* Status Badge */}
                            <div style={{
                                position: 'absolute',
                                top: '1.5rem',
                                right: '1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.6rem',
                                padding: '0.5rem 1rem',
                                borderRadius: '2rem',
                                background: tech.isBusy ? 'rgba(245, 158, 11, 0.1)' : (tech.isAvailable ? 'rgba(34, 197, 94, 0.1)' : 'rgba(128, 128, 128, 0.1)'),
                                border: `1px solid ${tech.isBusy ? '#f59e0b' : (tech.isAvailable ? '#22c55e' : 'var(--border)')}`,
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                color: tech.isBusy ? '#f59e0b' : (tech.isAvailable ? '#22c55e' : 'var(--text-muted)'),
                                letterSpacing: '0.05em'
                            }}>
                                <motion.div
                                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    style={{
                                        width: '8px', height: '8px', borderRadius: '50%',
                                        background: tech.isBusy ? '#f59e0b' : (tech.isAvailable ? '#22c55e' : '#666')
                                    }}
                                />
                                {tech.isBusy ? 'IN MISSION' : (tech.isAvailable ? 'READY TO HELP' : 'BUSY NOW')}
                            </div>

                            {/* Avatar with 3D shadow */}
                            <div style={{
                                width: '80px', height: '80px', borderRadius: '2rem',
                                background: 'linear-gradient(135deg, var(--bg) 0%, var(--border) 100%)',
                                marginBottom: '2rem', border: '1px solid var(--border)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '2rem', boxShadow: '0 10px 20px -5px rgba(0,0,0,0.1)',
                                transform: 'translateZ(30px)'
                            }}>
                                {tech.name[0]}
                            </div>

                            {/* Name & Rating */}
                            <h3 style={{
                                fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem',
                                letterSpacing: '-0.02em', transform: 'translateZ(40px)'
                            }}>
                                {tech.name}
                            </h3>

                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '0.8rem',
                                marginBottom: '1.5rem', transform: 'translateZ(20px)'
                            }}>
                                <span style={{ color: '#f59e0b', fontWeight: 800, fontSize: '1.1rem' }}>★ {tech.rating.toFixed(1)}</span>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{tech.totalJobs} projects</span>
                            </div>

                            {/* Service Type Label */}
                            <div style={{
                                display: 'inline-flex', padding: '0.4rem 1rem', borderRadius: '0.5rem',
                                background: 'var(--bg)', border: '1px solid var(--border)',
                                fontSize: '0.85rem', fontWeight: 700, marginBottom: '2rem',
                                color: 'var(--text-muted)', transform: 'translateZ(10px)'
                            }}>
                                {tech.serviceType.toUpperCase()}
                            </div>

                            {tech.isBusy && (
                                <div style={{
                                    fontSize: '0.75rem', color: '#f59e0b', fontWeight: 800,
                                    marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
                                }}>
                                    <Clock size={14} /> EST. WAIT: 25 MINS
                                </div>
                            )}

                            {/* Book Button with Micro-interaction */}
                            <motion.button
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                style={{
                                    width: '100%', padding: '1.2rem', borderRadius: '1rem',
                                    border: 'none',
                                    background: tech.isBusy ? '#ca8a04' : 'var(--text)',
                                    color: tech.isBusy ? 'white' : 'var(--bg)',
                                    fontSize: '1rem', fontWeight: 800, cursor: 'pointer',
                                    boxShadow: '0 10px 20px rgba(0,0,0,0.1)', transform: 'translateZ(50px)'
                                }}
                                onClick={() => handleBook(tech)}
                            >
                                {tech.isBusy ? 'RESERVE NEXT' : 'BOOK MISSION'}
                            </motion.button>
                        </motion.div>
                    ))}
                </div>

                {filteredTechs.length === 0 && (
                    <div style={{
                        textAlign: 'center',
                        padding: '4rem 2rem',
                        color: 'var(--text-muted)'
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No technicians found</h3>
                        <p>Try selecting a different category</p>
                    </div>
                )}
            </div>

            {/* Booking Modal */}
            {selectedTech && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    padding: '2rem'
                }}>
                    <div style={{
                        background: 'var(--bg)',
                        borderRadius: '1rem',
                        maxWidth: '650px',
                        width: '100%',
                        padding: '3rem',
                        border: '1px solid var(--border)',
                        boxShadow: '0 40px 100px -20px rgba(0,0,0,0.3)',
                        position: 'relative'
                    }}>
                        {/* Success Overlay */}
                        {bookingSuccess && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    background: 'var(--bg)',
                                    borderRadius: '1rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    zIndex: 100,
                                    textAlign: 'center',
                                    padding: '2rem'
                                }}
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: [0, 1.2, 1] }}
                                    transition={{ duration: 0.5 }}
                                    style={{
                                        width: '80px',
                                        height: '80px',
                                        borderRadius: '50%',
                                        background: '#22c55e',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '2.5rem',
                                        marginBottom: '1.5rem',
                                        boxShadow: '0 10px 30px rgba(34, 197, 94, 0.4)'
                                    }}
                                >
                                    ✓
                                </motion.div>
                                <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem' }}>MISSION INITIATED</h2>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Technician has been notified. Redirecting to tracking...</p>
                                <div style={{ width: '100px', height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                                    <motion.div
                                        animate={{ x: [-100, 100] }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                                        style={{ width: '40px', height: '100%', background: 'var(--text)' }}
                                    />
                                </div>
                            </motion.div>
                        )}

                        {/* Close Button */}
                        <button
                            onClick={() => setSelectedTech(null)}
                            style={{
                                position: 'absolute',
                                top: '1.5rem',
                                right: '1.5rem',
                                background: 'transparent',
                                border: 'none',
                                fontSize: '1.5rem',
                                cursor: 'pointer',
                                color: 'var(--text-muted)',
                                padding: 0,
                                zIndex: 101
                            }}
                        >
                            ×
                        </button>

                        {/* Header */}
                        <h2 style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: '2rem',
                            fontWeight: 700,
                            marginBottom: '0.5rem'
                        }}>
                            Book {selectedTech.name}
                        </h2>

                        {selectedTech.isBusy ? (
                            <div style={{
                                background: 'rgba(245, 158, 11, 0.1)',
                                border: '1px solid rgba(245, 158, 11, 0.2)',
                                padding: '1rem',
                                borderRadius: '0.8rem',
                                marginBottom: '1.5rem',
                                color: '#ca8a04',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.8rem'
                            }}>
                                <Clock size={20} />
                                <span>RESERVATION MODE: This pro is on a mission. Book now to be their next priority!</span>
                            </div>
                        ) : (
                            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                                {selectedTech.serviceType} · ⭐ {selectedTech.rating}
                            </p>
                        )}

                        {/* Form */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontSize: '0.9rem',
                                    fontWeight: 600
                                }}>
                                    Describe the Issue
                                </label>
                                <textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="e.g., Kitchen sink is leaking..."
                                    rows={4}
                                    style={{
                                        width: '100%',
                                        padding: '0.875rem 1rem',
                                        borderRadius: '0.5rem',
                                        border: '1px solid var(--border)',
                                        background: 'var(--card)',
                                        fontSize: '0.95rem',
                                        outline: 'none',
                                        resize: 'vertical',
                                        fontFamily: 'inherit',
                                        color: 'var(--text)'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = 'var(--text)'}
                                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                                        Service Address
                                    </label>
                                    <input
                                        type="text"
                                        value={address}
                                        onChange={e => setAddress(e.target.value)}
                                        placeholder="Room/Building/Street"
                                        style={{
                                            width: '100%',
                                            padding: '0.875rem 1rem',
                                            borderRadius: '0.5rem',
                                            border: '1px solid var(--border)',
                                            background: 'var(--card)',
                                            fontSize: '0.95rem',
                                            outline: 'none',
                                            color: 'var(--text)'
                                        }}
                                    />
                                </div>
                                <div style={{ height: '160px', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid var(--border)' }}>
                                    <LiveMap mode="select" onLocationSelect={setPickedLocation} />
                                </div>
                            </div>

                            {/* Emergency Checkbox */}
                            <div style={{
                                padding: '1rem',
                                background: 'rgba(239, 68, 68, 0.05)',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                borderRadius: '0.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem'
                            }}>
                                <input
                                    type="checkbox"
                                    id="emergency"
                                    checked={isEmergency}
                                    onChange={(e) => setIsEmergency(e.target.checked)}
                                    style={{
                                        width: '20px',
                                        height: '20px',
                                        cursor: 'pointer'
                                    }}
                                />
                                <label
                                    htmlFor="emergency"
                                    style={{
                                        color: 'var(--error)',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        fontSize: '0.95rem'
                                    }}
                                >
                                    🚨 Emergency Service (+$30)
                                </label>
                            </div>

                            <button
                                className="btn btn-primary"
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    fontSize: '1rem',
                                    marginTop: '0.5rem',
                                    opacity: isBooking ? 0.7 : 1,
                                    cursor: isBooking ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem'
                                }}
                                onClick={confirmBooking}
                                disabled={isBooking}
                            >
                                {isBooking ? (
                                    <>
                                        <div className="spinner" style={{ width: '20px', height: '20px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                                        Processing...
                                    </>
                                ) : 'Confirm Booking'}
                            </button>

                            <style>{`
                                @keyframes spin {
                                    to { transform: rotate(360deg); }
                                }
                            `}</style>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TechnicianList;
