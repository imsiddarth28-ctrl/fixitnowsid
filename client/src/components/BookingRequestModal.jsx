import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Calendar, AlertCircle, CheckCircle, User, MapPin, ArrowRight, ArrowLeft, Zap, ChevronRight, ShieldCheck } from 'lucide-react';
import API_URL from '../config';

const BookingRequestModal = ({ technician, onClose, onBookingCreated, customerId }) => {
    const [step, setStep] = useState(1); // 1: Service selection, 2: Time/Schedule, 3: Confirm
    const [loading, setLoading] = useState(false);
    const [checkingAvailability, setCheckingAvailability] = useState(false);
    const [technicianStatus, setTechnicianStatus] = useState(null);
    const [hasActiveBooking, setHasActiveBooking] = useState(false);

    const [bookingData, setBookingData] = useState({
        serviceType: '',
        description: '',
        urgency: 'normal',
        estimatedDuration: 60,
        scheduledTime: null,
        isScheduled: false,
        location: {
            address: '',
            latitude: null,
            longitude: null
        }
    });

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
        setStep(3);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/bookings/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerId,
                    technicianId: technician._id,
                    ...bookingData,
                    status: technicianStatus?.isBusy ? 'pending_approval' : 'accepted'
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
                                {step === 1 ? 'Select Objective' : step === 2 ? 'Temporal Alignment' : 'Final Verification'}
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
                            <motion.div key="step2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                {technicianStatus?.isBusy ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div style={{ padding: '16px', background: 'rgba(255, 149, 0, 0.05)', borderRadius: '16px', border: '1px solid rgba(255, 149, 0, 0.1)', color: 'var(--warning)', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <Clock size={18} /> Next available synchronization windows:
                                        </div>
                                        {availableSlots.map((slot, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleTimeSelect(slot)}
                                                className="bento-card"
                                                style={{ padding: '20px', textAlign: 'left', fontWeight: '800', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                            >
                                                {slot.label}
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
                                        <button onClick={() => setStep(3)} className="btn btn-primary" style={{ padding: '16px 48px' }}>INITIALIZE NOW</button>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div key="step3" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
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
                                            <div style={{ fontSize: '1rem', fontWeight: '700' }}>{bookingData.isScheduled ? bookingData.scheduledTime.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Immediate Delivery'}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>Execution Time</div>
                                            <div style={{ fontSize: '1rem', fontWeight: '700' }}>~{bookingData.estimatedDuration} Minutes</div>
                                        </div>
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
                    {step === 3 ? (
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
                            <button onClick={() => setStep(3)} className="btn btn-primary" style={{ flex: 2, padding: '16px' }}>SKIP TO SUMMARY</button>
                        )
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default BookingRequestModal;
