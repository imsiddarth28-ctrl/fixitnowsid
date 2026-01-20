import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Calendar, AlertCircle, CheckCircle, User, MapPin, DollarSign } from 'lucide-react';
import API_URL from '../config';

const BookingRequestModal = ({ technician, onClose, onBookingCreated, customerId }) => {
    const [step, setStep] = useState(1); // 1: Service details, 2: Time selection, 3: Confirm
    const [loading, setLoading] = useState(false);
    const [checkingAvailability, setCheckingAvailability] = useState(false);
    const [technicianStatus, setTechnicianStatus] = useState(null);
    const [hasActiveBooking, setHasActiveBooking] = useState(false);

    const [bookingData, setBookingData] = useState({
        serviceType: '',
        description: '',
        urgency: 'normal',
        estimatedDuration: 60, // minutes
        scheduledTime: null,
        isScheduled: false,
        location: {
            address: '',
            latitude: null,
            longitude: null
        }
    });

    const [availableSlots, setAvailableSlots] = useState([]);

    // Service types with estimated durations
    const serviceTypes = [
        { id: 'plumbing', label: 'Plumbing', duration: 90, icon: '🔧' },
        { id: 'electrical', label: 'Electrical', duration: 120, icon: '⚡' },
        { id: 'carpentry', label: 'Carpentry', duration: 180, icon: '🪚' },
        { id: 'painting', label: 'Painting', duration: 240, icon: '🎨' },
        { id: 'cleaning', label: 'Cleaning', duration: 120, icon: '🧹' },
        { id: 'appliance_repair', label: 'Appliance Repair', duration: 90, icon: '🔨' },
        { id: 'hvac', label: 'HVAC', duration: 120, icon: '❄️' },
        { id: 'other', label: 'Other', duration: 60, icon: '🛠️' }
    ];

    // Check customer's active bookings and technician availability
    useEffect(() => {
        const checkStatus = async () => {
            setCheckingAvailability(true);
            try {
                // Check if customer has active booking
                const customerRes = await fetch(`${API_URL}/api/customers/${customerId}/active-booking`);
                if (customerRes.ok) {
                    const data = await customerRes.json();
                    setHasActiveBooking(data.hasActiveBooking);
                }

                // Check technician availability
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

    // Generate available time slots when technician is busy
    const generateTimeSlots = () => {
        if (!technicianStatus?.isBusy || !technicianStatus?.estimatedFreeTime) return;

        const slots = [];
        const freeTime = new Date(technicianStatus.estimatedFreeTime);

        // Generate slots for next 24 hours after technician is free
        for (let i = 0; i < 8; i++) {
            const slotTime = new Date(freeTime.getTime() + (i * 3 * 60 * 60 * 1000)); // 3-hour intervals
            slots.push({
                time: slotTime,
                label: slotTime.toLocaleString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })
            });
        }

        setAvailableSlots(slots);
    };

    useEffect(() => {
        if (technicianStatus?.isBusy) {
            generateTimeSlots();
        }
    }, [technicianStatus]);

    const handleServiceSelect = (service) => {
        setBookingData({
            ...bookingData,
            serviceType: service.id,
            estimatedDuration: service.duration
        });
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
                    status: 'pending_approval'
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

    if (checkingAvailability) {
        return (
            <div style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999
            }}>
                <div style={{ color: 'white', fontSize: '1.2rem' }}>
                    Checking availability...
                </div>
            </div>
        );
    }

    if (hasActiveBooking) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.8)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    padding: '1rem'
                }}
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        background: 'var(--bg)',
                        borderRadius: '1.5rem',
                        maxWidth: '500px',
                        width: '100%',
                        padding: '2rem',
                        textAlign: 'center',
                        border: '1px solid var(--border)'
                    }}
                >
                    <AlertCircle size={64} color="#f59e0b" style={{ margin: '0 auto 1rem' }} />
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '1rem' }}>
                        Active Booking Exists
                    </h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: '1.6' }}>
                        You already have an active booking. Please complete or cancel your current booking before creating a new one.
                    </p>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '0.75rem 2rem',
                            borderRadius: '0.75rem',
                            border: 'none',
                            background: '#3b82f6',
                            color: 'white',
                            fontWeight: 800,
                            cursor: 'pointer'
                        }}
                    >
                        Got It
                    </button>
                </motion.div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.8)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                padding: '1rem'
            }}
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: 'var(--bg)',
                    borderRadius: '1.5rem',
                    maxWidth: '700px',
                    width: '100%',
                    maxHeight: '90vh',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1px solid var(--border)',
                    boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '1.5rem',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(59, 130, 246, 0.05)'
                }}>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0 }}>
                            Book Service
                        </h2>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.3rem 0 0 0' }}>
                            {step === 1 && 'Select service type'}
                            {step === 2 && 'Choose time slot'}
                            {step === 3 && 'Confirm booking'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: '1px solid var(--border)',
                            borderRadius: '0.5rem',
                            padding: '0.5rem',
                            cursor: 'pointer',
                            color: 'var(--text)',
                            display: 'flex'
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Technician Info */}
                <div style={{
                    padding: '1rem 1.5rem',
                    background: 'var(--card)',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        fontWeight: 900,
                        color: 'white'
                    }}>
                        {technician.name?.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>
                            {technician.name}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {technician.specialty || 'General Technician'}
                            {technicianStatus?.isBusy && (
                                <span style={{
                                    padding: '0.2rem 0.5rem',
                                    background: '#f59e0b',
                                    color: 'white',
                                    borderRadius: '0.3rem',
                                    fontSize: '0.7rem',
                                    fontWeight: 700
                                }}>
                                    BUSY
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content - Will implement steps next */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '1.5rem'
                }}>
                    {/* Step content will go here */}
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        Booking form implementation in progress...
                    </div>
                </div>

                {/* Footer */}
                <div style={{
                    padding: '1.5rem',
                    borderTop: '1px solid var(--border)',
                    display: 'flex',
                    gap: '1rem',
                    justifyContent: 'flex-end',
                    background: 'var(--card)'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '0.75rem 1.5rem',
                            borderRadius: '0.75rem',
                            border: '1px solid var(--border)',
                            background: 'transparent',
                            color: 'var(--text)',
                            fontWeight: 800,
                            cursor: 'pointer'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        style={{
                            padding: '0.75rem 1.5rem',
                            borderRadius: '0.75rem',
                            border: 'none',
                            background: loading ? 'var(--border)' : '#3b82f6',
                            color: 'white',
                            fontWeight: 800,
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? 'Creating...' : 'Create Booking'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default BookingRequestModal;
