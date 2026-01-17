import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import socket from '../socket';
import API_URL from '../config';

const TechnicianList = ({ onBookingSuccess }) => {
    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTech, setSelectedTech] = useState(null);
    const [filter, setFilter] = useState('all');
    const { user } = useAuth();

    // Booking Form State
    const [description, setDescription] = useState('');
    const [address, setAddress] = useState('');

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

    const confirmBooking = async (isEmergency = false) => {
        if (!description || !address) {
            alert('Please fill in all details');
            return;
        }

        const bookingData = {
            technicianId: selectedTech._id,
            customerId: user.id,
            serviceType: selectedTech.serviceType,
            price: isEmergency ? 80 : 50,
            location: { address, latitude: 0, longitude: 0 },
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
                alert('Booking Request Sent! Waiting for Technician response...');
                setSelectedTech(null);
                socket.emit('join', user.id);
                if (onBookingSuccess) onBookingSuccess();
            } else {
                alert('Booking failed: ' + data.error);
            }
        } catch (err) {
            console.error(err);
            alert('Booking failed');
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
                        <div
                            key={tech._id}
                            style={{
                                background: 'var(--card)',
                                border: '1px solid var(--border)',
                                borderRadius: '1rem',
                                padding: '2rem',
                                position: 'relative',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(0,0,0,0.1)';
                                e.currentTarget.style.borderColor = 'var(--text-muted)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                                e.currentTarget.style.borderColor = 'var(--border)';
                            }}
                        >
                            {/* Status Badge */}
                            <div style={{
                                position: 'absolute',
                                top: '1.5rem',
                                right: '1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.4rem 0.8rem',
                                borderRadius: '0.5rem',
                                background: tech.isAvailable ? 'rgba(16, 185, 129, 0.1)' : 'rgba(128, 128, 128, 0.1)',
                                border: `1px solid ${tech.isAvailable ? 'var(--success)' : 'var(--text-muted)'}`,
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                color: tech.isAvailable ? 'var(--success)' : 'var(--text-muted)'
                            }}>
                                <div style={{
                                    width: '6px',
                                    height: '6px',
                                    borderRadius: '50%',
                                    background: tech.isAvailable ? 'var(--success)' : 'var(--text-muted)'
                                }} />
                                {tech.isAvailable ? 'AVAILABLE' : 'BUSY'}
                            </div>

                            {/* Avatar */}
                            <div style={{
                                width: '70px',
                                height: '70px',
                                borderRadius: '50%',
                                background: '#eee',
                                marginBottom: '1.5rem'
                            }} />

                            {/* Name & Rating */}
                            <h3 style={{
                                fontSize: '1.5rem',
                                fontWeight: 700,
                                marginBottom: '0.5rem',
                                fontFamily: 'var(--font-heading)'
                            }}>
                                {tech.name}
                            </h3>

                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginBottom: '1rem'
                            }}>
                                <span style={{ color: 'var(--warning)', fontWeight: 700 }}>⭐ {tech.rating}</span>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>({Math.floor(Math.random() * 100) + 20} reviews)</span>
                            </div>

                            {/* Service Type Badge */}
                            <div style={{
                                display: 'inline-block',
                                padding: '0.5rem 1rem',
                                borderRadius: '0.5rem',
                                background: 'var(--bg)',
                                border: '1px solid var(--border)',
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                marginBottom: '1.5rem'
                            }}>
                                {tech.serviceType}
                            </div>

                            {/* Stats */}
                            <div style={{
                                display: 'flex',
                                gap: '1.5rem',
                                marginBottom: '1.5rem',
                                fontSize: '0.9rem',
                                color: 'var(--text-muted)'
                            }}>
                                <span>📍 2.5 km away</span>
                                <span>⏱️ 15 min ETA</span>
                            </div>

                            {/* Book Button */}
                            <button
                                className="btn btn-primary"
                                style={{ width: '100%', padding: '1rem' }}
                                onClick={() => handleBook(tech)}
                            >
                                Book Now
                            </button>
                        </div>
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
                        maxWidth: '500px',
                        width: '100%',
                        padding: '3rem',
                        border: '1px solid var(--border)',
                        boxShadow: '0 40px 100px -20px rgba(0,0,0,0.3)',
                        position: 'relative'
                    }}>
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
                                padding: 0
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
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                            {selectedTech.serviceType} · ⭐ {selectedTech.rating}
                        </p>

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

                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontSize: '0.9rem',
                                    fontWeight: 600
                                }}>
                                    Service Address
                                </label>
                                <input
                                    type="text"
                                    value={address}
                                    onChange={e => setAddress(e.target.value)}
                                    placeholder="Enter your address"
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
                                    onFocus={(e) => e.target.style.borderColor = 'var(--text)'}
                                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                                />
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
                                style={{ width: '100%', padding: '1rem', fontSize: '1rem', marginTop: '0.5rem' }}
                                onClick={() => {
                                    const isEmergency = document.getElementById('emergency').checked;
                                    confirmBooking(isEmergency);
                                }}
                            >
                                Confirm Booking
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TechnicianList;
