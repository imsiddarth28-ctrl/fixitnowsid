import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Calendar, AlertCircle, CheckCircle, User, MapPin, ArrowRight, ArrowLeft, Zap, ChevronRight, ShieldCheck } from 'lucide-react';
import API_URL from '../config';

const BookingRequestModal = ({ technician, onClose, onBookingCreated, customerId }) => {
    const [step, setStep] = useState(1); // 1: Service selection, 2: Location selection, 3: Time/Schedule, 4: Confirm
    const [loading, setLoading] = useState(false);
    const [checkingAvailability, setCheckingAvailability] = useState(false);
    const [technicianStatus, setTechnicianStatus] = useState(null);
    const [hasActiveBooking, setHasActiveBooking] = useState(false);
    const [addressSearch, setAddressSearch] = useState('');
    const [mapInstance, setMapInstance] = useState(null);
    const [markerInstance, setMarkerInstance] = useState(null);
    const [mapError, setMapError] = useState(null);

    const [bookingData, setBookingData] = useState({
        serviceType: '',
        description: '',
        urgency: 'normal',
        estimatedDuration: 60,
        scheduledTime: null,
        isScheduled: false,
        location: {
            address: '',
            latitude: 17.3850,
            longitude: 78.4867
        }
    });

    // Handle Map Initialization
    useEffect(() => {
        if (step === 2 && window.google) {
            if (!mapInstance) {
                const mapDiv = document.getElementById('booking-map');
                if (mapDiv) {
                    const initialPos = { lat: bookingData.location.latitude || 17.3850, lng: bookingData.location.longitude || 78.4867 };
                    const map = new window.google.maps.Map(mapDiv, {
                        center: initialPos,
                        zoom: 15,
                        styles: [
                            { elementType: "geometry", stylers: [{ color: "#212121" }] },
                            { featureType: "road", elementType: "geometry", stylers: [{ color: "#2c2c2c" }] },
                            { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] }
                        ],
                        disableDefaultUI: true,
                        zoomControl: true
                    });

                    const marker = new window.google.maps.Marker({
                        position: initialPos,
                        map: map,
                        draggable: true,
                        animation: window.google.maps.Animation.DROP
                    });

                    setMapInstance(map);
                    setMarkerInstance(marker);

                    marker.addListener('dragend', () => {
                        const pos = marker.getPosition();
                        updateLocation(pos.lat(), pos.lng());
                    });

                    map.addListener('click', (e) => {
                        marker.setPosition(e.latLng);
                        updateLocation(e.latLng.lat(), e.latLng.lng());
                    });

                    // Initialize Autocomplete
                    const input = document.getElementById('address-input');
                    if (input) {
                        const autocomplete = new window.google.maps.places.Autocomplete(input);
                        autocomplete.addListener('place_changed', () => {
                            const place = autocomplete.getPlace();
                            if (place.geometry) {
                                map.setCenter(place.geometry.location);
                                marker.setPosition(place.geometry.location);
                                setBookingData(prev => ({
                                    ...prev,
                                    location: {
                                        address: place.formatted_address,
                                        latitude: place.geometry.location.lat(),
                                        longitude: place.geometry.location.lng()
                                    }
                                }));
                                setAddressSearch(place.formatted_address);
                            }
                        });
                    }
                }
            }

            // Auto-detect location on step 2 start if empty
            if (!bookingData.location.address) {
                handleDetectLocation();
            }
        }
    }, [step]);

    const updateLocation = async (lat, lng) => {
        setBookingData(prev => ({
            ...prev,
            location: { ...prev.location, latitude: lat, longitude: lng }
        }));

        // Reverse Geocode
        if (window.google) {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                if (status === 'OK' && results[0]) {
                    setBookingData(prev => ({
                        ...prev,
                        location: { ...prev.location, address: results[0].formatted_address }
                    }));
                    setAddressSearch(results[0].formatted_address);
                } else {
                    // Fallback to coordinates as address if geocoding fails
                    const coordAddr = `Coordinate Lock: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
                    setBookingData(prev => ({
                        ...prev,
                        location: { ...prev.location, address: coordAddr }
                    }));
                    setAddressSearch(coordAddr);
                }
            });
        }
    };

    const handleSearchAddress = () => {
        if (!addressSearch) return;
        setMapError(null);
        if (window.google) {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ address: addressSearch }, (results, status) => {
                if (status === 'OK' && results[0]) {
                    const pos = results[0].geometry.location;
                    const lat = pos.lat();
                    const lng = pos.lng();

                    if (mapInstance) mapInstance.setCenter(pos);
                    if (markerInstance) markerInstance.setPosition(pos);

                    setBookingData(prev => ({
                        ...prev,
                        location: {
                            address: results[0].formatted_address,
                            latitude: lat,
                            longitude: lng
                        }
                    }));
                    setAddressSearch(results[0].formatted_address);
                } else {
                    setMapError('Address not found. Please be more specific.');
                }
            });
        }
    };

    const handleDetectLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    const pos = { lat, lng };

                    if (mapInstance) mapInstance.setCenter(pos);
                    if (markerInstance) markerInstance.setPosition(pos);
                    updateLocation(lat, lng);
                },
                (error) => {
                    setMapError('Unable to detect location. Please search manually.');
                }
            );
        }
    };

    const [availableSlots, setAvailableSlots] = useState([]);

    const serviceTypes = [
        { id: 'plumbing', label: 'Plumbing', duration: 90, icon: '🔧' },
        { id: 'electrical', label: 'Electrical', duration: 120, icon: '⚡' },
        { id: 'carpentry', label: 'Carpentry', duration: 180, icon: '🪚' },
        { id: 'cleaning', label: 'Cleaning', duration: 120, icon: '🧹' },
        { id: 'appliance_repair', label: 'Appliance Repair', duration: 90, icon: '🔨' },
        { id: 'other', label: 'General Task', duration: 60, icon: '🛠️' }
    ];

    useEffect(() => {
        const checkStatus = async () => {
            setCheckingAvailability(true);
            try {
                const customerRes = await fetch(`${API_URL}/api/customers/${customerId}/active-booking`);
                if (customerRes.ok) {
                    const data = await customerRes.json();
                    setHasActiveBooking(data.hasActiveBooking);
                }

                const techRes = await fetch(`${API_URL}/api/technicians/${technician._id}/availability`);
                if (techRes.ok) {
                    const data = await techRes.json();
                    setTechnicianStatus(data);
                }
            } catch (err) {
                console.error('Status check failed:', err);
            } finally {
                setCheckingAvailability(false);
            }
        };

        checkStatus();
    }, [customerId, technician._id]);

    useEffect(() => {
        if (technicianStatus?.isBusy && technicianStatus?.estimatedFreeTime) {
            const slots = [];
            const freeTime = new Date(technicianStatus.estimatedFreeTime);
            for (let i = 0; i < 4; i++) {
                const slotTime = new Date(freeTime.getTime() + (i * 2 * 60 * 60 * 1000) + (30 * 60 * 1000));
                slots.push({
                    time: slotTime,
                    label: slotTime.toLocaleString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' })
                });
            }
            setAvailableSlots(slots);
        }
    }, [technicianStatus]);

    const handleServiceSelect = (service) => {
        setBookingData({ ...bookingData, serviceType: service.label, estimatedDuration: service.duration });
        setStep(2);
    };

    const handleTimeSelect = (slot) => {
        setBookingData({ ...bookingData, scheduledTime: slot.time, isScheduled: true });
        setStep(4);
    };

    const handleSubmit = async () => {
        if (!bookingData.location.address) {
            alert('Please select a service location.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerId,
                    technicianId: technician._id,
                    ...bookingData,
                    status: technicianStatus?.isBusy ? 'pending' : 'pending' // Force pending for real flow
                })
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Failed to create booking');
            }

            const booking = await res.json();
            onBookingCreated(booking);
            onClose();
        } catch (err) {
            console.error('Booking failed:', err);
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const StatusBadge = ({ type }) => {
        const colors = {
            busy: { bg: 'rgba(255, 149, 0, 0.1)', text: 'var(--warning)', label: 'CURRENTLY BUSY' },
            available: { bg: 'rgba(16, 185, 129, 0.1)', text: 'var(--success)', label: 'AVAILABLE NOW' }
        };
        const style = colors[type];
        return (
            <span style={{
                background: style.bg, color: style.text, padding: '4px 10px',
                borderRadius: '8px', fontSize: '0.65rem', fontWeight: '800', letterSpacing: '0.05em'
            }}>
                {style.label}
            </span>
        );
    };

    if (checkingAvailability) {
        return (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} style={{ width: '32px', height: '32px', border: '3px solid var(--border)', borderTopColor: 'var(--text)', borderRadius: '50%' }} />
            </div>
        );
    }

    if (hasActiveBooking) {
        return (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '24px' }}>
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass" style={{ borderRadius: '24px', maxWidth: '400px', width: '100%', padding: '40px', textAlign: 'center', border: '1px solid var(--border)' }}>
                    <div style={{ width: '64px', height: '64px', background: 'rgba(239,68,68,0.1)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--error)' }}>
                        <AlertCircle size={32} />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '12px', fontFamily: 'var(--font-heading)' }}>Conflict Detected</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '32px' }}>You already have an active synchronization session. Finish your current task before starting a new one.</p>
                    <button onClick={onClose} className="btn btn-primary" style={{ width: '100%' }}>ACKNOWLEDGE</button>
                </motion.div>
            </div>
        );
    }

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '24px' }} onClick={onClose}>
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                onClick={(e) => e.stopPropagation()}
                className="glass"
                style={{
                    borderRadius: '32px', maxWidth: '540px', width: '100%',
                    maxHeight: '90vh', overflow: 'hidden', display: 'flex',
                    flexDirection: 'column', border: '1px solid var(--border)'
                }}
            >
                {/* Header Section */}
                <div style={{ padding: '32px 32px 24px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                        <div>
                            <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
                                Booking Module / Step 0{step}
                            </div>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>
                                {step === 1 ? 'Select Objective' : step === 2 ? 'Target Location' : step === 3 ? 'Temporal Alignment' : 'Final Verification'}
                            </h2>
                        </div>
                        <button onClick={onClose} style={{ background: 'var(--bg-tertiary)', border: 'none', borderRadius: '12px', padding: '8px', cursor: 'pointer', color: 'var(--text)' }}>
                            <X size={20} />
                        </button>
                    </div>

                    <div className="glass" style={{ padding: '16px', borderRadius: '18px', display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--bg-secondary)' }}>
                        <div style={{ width: '48px', height: '48px', background: 'var(--text)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bg)', fontWeight: '800' }}>
                            {technician.name?.charAt(0)}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '800', fontSize: '1rem' }}>{technician.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>{technician.serviceType} Specialist</div>
                        </div>
                        <StatusBadge type={technicianStatus?.isBusy ? 'busy' : 'available'} />
                    </div>
                </div>

                {/* Content Section */}
                <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                                    {serviceTypes.map(s => (
                                        <button
                                            key={s.id}
                                            onClick={() => handleServiceSelect(s)}
                                            className="bento-card"
                                            style={{ padding: '24px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s ease', border: '1px solid var(--border)' }}
                                        >
                                            <div style={{ fontSize: '1.5rem', marginBottom: '16px' }}>{s.icon}</div>
                                            <div style={{ fontWeight: '800', fontSize: '1rem', marginBottom: '4px' }}>{s.label}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Duration: ~{s.duration} min</div>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div key="step2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <div className="glass" style={{ flex: 1, padding: '12px', borderRadius: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', gap: '12px' }}>
                                        <MapPin size={20} style={{ marginTop: '4px', opacity: 0.5 }} />
                                        <input
                                            id="address-input"
                                            type="text"
                                            placeholder="Enter mission address..."
                                            value={addressSearch}
                                            onChange={(e) => setAddressSearch(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSearchAddress()}
                                            style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--text)', outline: 'none', fontWeight: '600' }}
                                        />
                                        <button onClick={handleSearchAddress} className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.75rem' }}>SEARCH</button>
                                    </div>
                                    <button onClick={handleDetectLocation} className="btn btn-secondary" style={{ padding: '12px', borderRadius: '16px' }}>
                                        <Zap size={20} />
                                    </button>
                                </div>
                                {mapError && <div style={{ color: 'var(--error)', fontSize: '0.75rem', fontWeight: '700' }}>{mapError}</div>}
                                <div id="booking-map" style={{ width: '100%', height: '300px', borderRadius: '24px', border: '1px solid var(--border)', overflow: 'hidden' }}></div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600', textAlign: 'center' }}>
                                    Drag the marker to pinpoint your exact mission coordinates.
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                                    {bookingData.location.address && (
                                        <div style={{ padding: '16px', background: 'var(--bg-tertiary)', borderRadius: '16px', border: '1px solid var(--border)', fontSize: '0.85rem', fontWeight: '700' }}>
                                            📍 {bookingData.location.address}
                                        </div>
                                    )}
                                    <button
                                        onClick={async () => {
                                            if (!bookingData.location.address && addressSearch) {
                                                handleSearchAddress();
                                                // Wait 500ms for geocode to potentially finish
                                                setTimeout(() => {
                                                    if (bookingData.location.address) setStep(3);
                                                }, 500);
                                            } else if (bookingData.location.address) {
                                                setStep(3);
                                            } else {
                                                setMapError('Please pinpoint a location on the map or search for an address.');
                                            }
                                        }}
                                        className="btn btn-primary"
                                        style={{ width: '100%', padding: '14px', borderRadius: '16px', fontWeight: '800' }}
                                    >
                                        ESTABLISH PERIMETER
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div key="step3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                {technicianStatus?.isBusy ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div style={{ padding: '16px', background: 'rgba(255, 149, 0, 0.05)', borderRadius: '16px', border: '1px solid rgba(255, 149, 0, 0.1)', color: 'var(--warning)', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <Clock size={18} /> Tech busy. Accept Wait Protocol?
                                        </div>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px', fontWeight: '500' }}>
                                            The technician is finishing a current mission. You can join their priority queue to be served next immediately after.
                                        </p>
                                        {availableSlots.map((slot, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleTimeSelect(slot)}
                                                className="bento-card"
                                                style={{ padding: '20px', textAlign: 'left', fontWeight: '800', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border)' }}
                                            >
                                                <div>
                                                    <div style={{ fontSize: '0.95rem' }}>{slot.label}</div>
                                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '600' }}>ESTIMATED START</div>
                                                </div>
                                                <ChevronRight size={18} />
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                        <div style={{ width: '80px', height: '80px', background: 'var(--bg-tertiary)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--success)' }}>
                                            <div style={{ fontSize: '2.5rem' }}><Zap /></div>
                                        </div>
                                        <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '8px' }}>Instant Deployment</h3>
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '32px', lineHeight: '1.6' }}>
                                            Technician is currently on standby. Deployment can begin immediately upon confirmation.
                                        </p>
                                        <button onClick={() => setStep(4)} className="btn btn-primary" style={{ padding: '16px 48px' }}>INITIALIZE NOW</button>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div key="step4" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                                <div className="glass" style={{ padding: '28px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '24px', background: 'var(--bg-tertiary)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div style={{ width: '40px', height: '40px', background: 'var(--text)', color: 'var(--bg)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <ShieldCheck size={20} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Selected Operation</div>
                                            <div style={{ fontSize: '1.1rem', fontWeight: '800' }}>{bookingData.serviceType}</div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div>
                                            <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>Schedule</div>
                                            <div style={{ fontSize: '1rem', fontWeight: '700' }}>{bookingData.isScheduled && bookingData.scheduledTime ? bookingData.scheduledTime.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Immediate Delivery'}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>Execution Time</div>
                                            <div style={{ fontSize: '1rem', fontWeight: '700' }}>~{bookingData.estimatedDuration} Minutes</div>
                                        </div>
                                    </div>

                                    <div style={{}}>
                                        <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>Mission Location</div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: '700', lineHeight: '1.4' }}>{bookingData.location.address}</div>
                                    </div>

                                    <div style={{ height: '1px', background: 'var(--border)' }} />

                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', display: 'flex', gap: '8px' }}>
                                        <AlertCircle size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
                                        <span>Final pricing will be determined post-inspection by the technician based on material requirements.</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Navigation Section */}
                <div style={{ padding: '24px 32px 32px', borderTop: '1px solid var(--border)', display: 'flex', gap: '12px' }}>
                    {step > 1 && (
                        <button onClick={() => setStep(step - 1)} className="btn btn-secondary" style={{ flex: 1, padding: '16px' }}>BACK</button>
                    )}
                    {step === 4 ? (
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="btn btn-primary"
                            style={{ flex: 2, padding: '16px' }}
                        >
                            {loading ? 'SYNCHRONIZING...' : 'CONFIRM MISSION'}
                        </button>
                    ) : (
                        step !== 1 && (
                            <button onClick={() => setStep(step + 1)} className="btn btn-primary" style={{ flex: 2, padding: '16px' }}>CONTINUE</button>
                        )
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default BookingRequestModal;
