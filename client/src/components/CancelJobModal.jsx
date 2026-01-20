import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Clock, DollarSign, User, MessageSquare, ThumbsDown } from 'lucide-react';

const CancelJobModal = ({ job, user, onCancel, onClose }) => {
    const [step, setStep] = useState(1); // 1: Select reason, 2: Confirm
    const [selectedReason, setSelectedReason] = useState(null);
    const [additionalDetails, setAdditionalDetails] = useState('');
    const [cancelling, setCancelling] = useState(false);

    // Cancellation reasons based on user role and job status
    const cancellationReasons = user.role === 'customer' ? [
        {
            id: 'taking_too_long',
            label: 'Technician Taking Too Long',
            icon: Clock,
            description: 'Technician is delayed or not arriving on time',
            color: '#f59e0b'
        },
        {
            id: 'found_alternative',
            label: 'Found Alternative Service',
            icon: User,
            description: 'Found another technician or service provider',
            color: '#3b82f6'
        },
        {
            id: 'price_issue',
            label: 'Price Concerns',
            icon: DollarSign,
            description: 'Service cost is higher than expected',
            color: '#ef4444'
        },
        {
            id: 'no_longer_needed',
            label: 'Service No Longer Needed',
            icon: ThumbsDown,
            description: 'Issue resolved or service not required anymore',
            color: '#6b7280'
        },
        {
            id: 'poor_communication',
            label: 'Poor Communication',
            icon: MessageSquare,
            description: 'Technician not responding or communicating poorly',
            color: '#8b5cf6'
        },
        {
            id: 'other',
            label: 'Other Reason',
            icon: AlertTriangle,
            description: 'Specify your reason below',
            color: '#10b981'
        }
    ] : [
        {
            id: 'customer_unavailable',
            label: 'Customer Unavailable',
            icon: User,
            description: 'Customer not responding or unavailable',
            color: '#f59e0b'
        },
        {
            id: 'location_issue',
            label: 'Location/Access Issue',
            icon: Clock,
            description: 'Cannot reach location or access issues',
            color: '#ef4444'
        },
        {
            id: 'safety_concern',
            label: 'Safety Concern',
            icon: AlertTriangle,
            description: 'Safety or security concerns at location',
            color: '#dc2626'
        },
        {
            id: 'equipment_issue',
            label: 'Equipment/Tools Issue',
            icon: ThumbsDown,
            description: 'Missing required tools or equipment',
            color: '#6b7280'
        },
        {
            id: 'other',
            label: 'Other Reason',
            icon: MessageSquare,
            description: 'Specify your reason below',
            color: '#10b981'
        }
    ];

    const handleConfirmCancel = async () => {
        if (!selectedReason) return;

        setCancelling(true);
        try {
            await onCancel({
                reason: selectedReason.id,
                reasonLabel: selectedReason.label,
                details: additionalDetails,
                cancelledBy: user.role,
                cancelledAt: new Date().toISOString()
            });
        } catch (err) {
            console.error('Cancellation failed:', err);
            alert('Failed to cancel job. Please try again.');
        } finally {
            setCancelling(false);
        }
    };

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
                    maxWidth: '600px',
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
                    background: 'rgba(239, 68, 68, 0.05)'
                }}>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0, color: '#ef4444' }}>
                            Cancel Job
                        </h2>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.3rem 0 0 0' }}>
                            {step === 1 ? 'Select a reason for cancellation' : 'Confirm your cancellation'}
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
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '1.5rem'
                }}>
                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                            >
                                {/* Job Info */}
                                <div style={{
                                    padding: '1rem',
                                    background: 'var(--card)',
                                    borderRadius: '0.75rem',
                                    marginBottom: '1.5rem',
                                    border: '1px solid var(--border)'
                                }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                                        JOB DETAILS
                                    </div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                                        {job.serviceType}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        Status: <span style={{ color: '#f59e0b', fontWeight: 700 }}>{job.status.toUpperCase()}</span>
                                    </div>
                                </div>

                                {/* Reasons */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {cancellationReasons.map((reason) => {
                                        const Icon = reason.icon;
                                        const isSelected = selectedReason?.id === reason.id;
                                        return (
                                            <motion.button
                                                key={reason.id}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => setSelectedReason(reason)}
                                                style={{
                                                    padding: '1.25rem',
                                                    background: isSelected ? 'rgba(239, 68, 68, 0.1)' : 'var(--card)',
                                                    border: `2px solid ${isSelected ? '#ef4444' : 'var(--border)'}`,
                                                    borderRadius: '0.75rem',
                                                    cursor: 'pointer',
                                                    textAlign: 'left',
                                                    display: 'flex',
                                                    alignItems: 'start',
                                                    gap: '1rem',
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                <div style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    borderRadius: '0.5rem',
                                                    background: `${reason.color}20`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexShrink: 0
                                                }}>
                                                    <Icon size={20} color={reason.color} />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: 800, marginBottom: '0.3rem', color: 'var(--text)' }}>
                                                        {reason.label}
                                                    </div>
                                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                                                        {reason.description}
                                                    </div>
                                                </div>
                                            </motion.button>
                                        );
                                    })}
                                </div>

                                {/* Additional Details */}
                                {selectedReason && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        style={{ marginTop: '1.5rem' }}
                                    >
                                        <label style={{
                                            display: 'block',
                                            fontSize: '0.85rem',
                                            fontWeight: 700,
                                            marginBottom: '0.5rem',
                                            color: 'var(--text-muted)'
                                        }}>
                                            Additional Details (Optional)
                                        </label>
                                        <textarea
                                            value={additionalDetails}
                                            onChange={(e) => setAdditionalDetails(e.target.value)}
                                            placeholder="Provide more context about your cancellation..."
                                            rows={4}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                borderRadius: '0.5rem',
                                                border: '1px solid var(--border)',
                                                background: 'var(--card)',
                                                color: 'var(--text)',
                                                fontSize: '0.9rem',
                                                resize: 'vertical',
                                                fontFamily: 'inherit'
                                            }}
                                        />
                                    </motion.div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                {/* Confirmation */}
                                <div style={{
                                    padding: '2rem',
                                    background: 'rgba(239, 68, 68, 0.05)',
                                    borderRadius: '1rem',
                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                    textAlign: 'center',
                                    marginBottom: '1.5rem'
                                }}>
                                    <AlertTriangle size={48} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
                                    <h3 style={{ fontSize: '1.3rem', fontWeight: 900, marginBottom: '0.5rem' }}>
                                        Confirm Cancellation
                                    </h3>
                                    <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
                                        Are you sure you want to cancel this job? This action cannot be undone.
                                    </p>
                                </div>

                                {/* Summary */}
                                <div style={{
                                    padding: '1.5rem',
                                    background: 'var(--card)',
                                    borderRadius: '0.75rem',
                                    border: '1px solid var(--border)'
                                }}>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                                            CANCELLATION REASON
                                        </div>
                                        <div style={{ fontSize: '1rem', fontWeight: 800 }}>
                                            {selectedReason?.label}
                                        </div>
                                    </div>
                                    {additionalDetails && (
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                                                ADDITIONAL DETAILS
                                            </div>
                                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                                                {additionalDetails}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Consequences */}
                                <div style={{
                                    marginTop: '1.5rem',
                                    padding: '1rem',
                                    background: 'rgba(245, 158, 11, 0.05)',
                                    borderRadius: '0.5rem',
                                    border: '1px solid rgba(245, 158, 11, 0.2)'
                                }}>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: '#f59e0b' }}>
                                        ⚠️ Please Note:
                                    </div>
                                    <ul style={{ margin: 0, paddingLeft: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                                        {user.role === 'customer' ? (
                                            <>
                                                <li>The technician will be notified immediately</li>
                                                <li>Cancellation may affect your account rating</li>
                                                <li>You can book another technician anytime</li>
                                            </>
                                        ) : (
                                            <>
                                                <li>The customer will be notified immediately</li>
                                                <li>Frequent cancellations may affect your rating</li>
                                                <li>This job will be available for other technicians</li>
                                            </>
                                        )}
                                    </ul>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
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
                    {step === 1 ? (
                        <>
                            <button
                                onClick={onClose}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '0.75rem',
                                    border: '1px solid var(--border)',
                                    background: 'transparent',
                                    color: 'var(--text)',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => e.target.style.background = 'var(--bg)'}
                                onMouseLeave={(e) => e.target.style.background = 'transparent'}
                            >
                                Keep Job
                            </button>
                            <button
                                onClick={() => setStep(2)}
                                disabled={!selectedReason}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '0.75rem',
                                    border: 'none',
                                    background: selectedReason ? '#ef4444' : 'var(--border)',
                                    color: 'white',
                                    fontWeight: 800,
                                    cursor: selectedReason ? 'pointer' : 'not-allowed',
                                    opacity: selectedReason ? 1 : 0.5,
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                Continue →
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setStep(1)}
                                disabled={cancelling}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '0.75rem',
                                    border: '1px solid var(--border)',
                                    background: 'transparent',
                                    color: 'var(--text)',
                                    fontWeight: 800,
                                    cursor: cancelling ? 'not-allowed' : 'pointer',
                                    opacity: cancelling ? 0.5 : 1,
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                ← Back
                            </button>
                            <button
                                onClick={handleConfirmCancel}
                                disabled={cancelling}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '0.75rem',
                                    border: 'none',
                                    background: cancelling ? 'var(--border)' : '#ef4444',
                                    color: 'white',
                                    fontWeight: 800,
                                    cursor: cancelling ? 'not-allowed' : 'pointer',
                                    opacity: cancelling ? 0.5 : 1,
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                            </button>
                        </>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default CancelJobModal;
