import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Clock, DollarSign, User, MessageSquare, ThumbsDown, ArrowRight, ArrowLeft } from 'lucide-react';

const CancelJobModal = ({ job, user, onCancel, onClose }) => {
    const [step, setStep] = useState(1); // 1: Select reason, 2: Confirm
    const [selectedReason, setSelectedReason] = useState(null);
    const [additionalDetails, setAdditionalDetails] = useState('');
    const [cancelling, setCancelling] = useState(false);

    const cancellationReasons = user.role === 'customer' ? [
        { id: 'taking_too_long', label: 'Response Delay', icon: Clock, description: 'Technician is taking too long' },
        { id: 'found_alternative', label: 'Alternative Solution', icon: User, description: 'Found another provider' },
        { id: 'price_issue', label: 'Pricing Conflict', icon: DollarSign, description: 'Cost is higher than expected' },
        { id: 'no_longer_needed', label: 'No Longer Required', icon: ThumbsDown, description: 'Issue resolved or cancelled' },
        { id: 'poor_communication', label: 'Communication Gap', icon: MessageSquare, description: 'Lack of updates or response' },
        { id: 'other', label: 'Other Reason', icon: AlertTriangle, description: 'Specify your context' }
    ] : [
        { id: 'customer_unavailable', label: 'Client Inaccessible', icon: User, description: 'Client not responding' },
        { id: 'location_issue', label: 'Access Restriction', icon: Clock, description: 'Cannot reach the location' },
        { id: 'safety_concern', label: 'Risk Protocol', icon: AlertTriangle, description: 'Safety or security concerns' },
        { id: 'equipment_issue', label: 'Technical Constraint', icon: ThumbsDown, description: 'Missing required tools' },
        { id: 'other', label: 'Other Reason', icon: MessageSquare, description: 'Specify your context' }
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
                background: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(12px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                padding: '24px'
            }}
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="glass"
                style={{
                    borderRadius: '32px',
                    maxWidth: '560px',
                    width: '100%',
                    maxHeight: '90vh',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1px solid var(--border)',
                    boxShadow: '0 40px 100px rgba(0,0,0,0.2)'
                }}
            >
                {/* Header */}
                <div style={{ padding: '40px 40px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h2 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--text)', marginBottom: '8px', letterSpacing: '-0.04em' }}>
                            {step === 1 ? 'TERMINATE_JOB' : 'FINAL_CONFIRM'}
                        </h2>
                        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                            {step === 1 ? 'Identify the primary reason for cancellation.' : 'Review protocol before termination.'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="glass"
                        style={{ width: '40px', height: '40px', borderRadius: '14px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text)' }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '0 40px 40px' }}>
                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                                    {cancellationReasons.map((reason) => {
                                        const isSelected = selectedReason?.id === reason.id;
                                        return (
                                            <motion.button
                                                key={reason.id}
                                                whileHover={{ scale: 1.01, x: 4 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => setSelectedReason(reason)}
                                                style={{
                                                    padding: '20px 24px',
                                                    background: isSelected ? 'var(--text)' : 'var(--bg-secondary)',
                                                    border: isSelected ? '1px solid var(--text)' : '1px solid var(--border)',
                                                    borderRadius: '20px',
                                                    cursor: 'pointer',
                                                    textAlign: 'left',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '20px',
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                <div style={{
                                                    width: '44px',
                                                    height: '44px',
                                                    borderRadius: '14px',
                                                    background: isSelected ? 'rgba(255,255,255,0.1)' : 'var(--bg-tertiary)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: isSelected ? 'var(--bg)' : 'var(--text)'
                                                }}>
                                                    <reason.icon size={22} />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: '800', fontSize: '1rem', color: isSelected ? 'var(--bg)' : 'var(--text)', letterSpacing: '0.02em' }}>{reason.label}</div>
                                                    <div style={{ fontSize: '0.8rem', color: isSelected ? 'rgba(255,255,255,0.6)' : 'var(--text-secondary)', fontWeight: '500' }}>{reason.description}</div>
                                                </div>
                                            </motion.button>
                                        );
                                    })}
                                </div>

                                {selectedReason && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: '24px' }}>
                                        <textarea
                                            value={additionalDetails}
                                            onChange={(e) => setAdditionalDetails(e.target.value)}
                                            placeholder="Internal system notes (optional)..."
                                            rows={2}
                                            className="input"
                                            style={{ minHeight: '80px', padding: '16px', resize: 'none' }}
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
                                transition={{ duration: 0.3 }}
                            >
                                <div style={{
                                    padding: '40px 32px',
                                    background: 'var(--bg-tertiary)',
                                    borderRadius: '28px',
                                    textAlign: 'center',
                                    marginBottom: '24px',
                                    border: '1px solid var(--border)'
                                }}>
                                    <div style={{
                                        width: '64px',
                                        height: '64px',
                                        borderRadius: '20px',
                                        background: 'var(--error)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 20px',
                                        color: 'white',
                                        boxShadow: '0 12px 24px rgba(255, 59, 48, 0.2)'
                                    }}>
                                        <AlertTriangle size={32} />
                                    </div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--text)', marginBottom: '8px' }}>ARE YOU CERTAIN?</div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6', fontWeight: '500' }}>
                                        Termination will immediately notify the {user.role === 'customer' ? 'technician' : 'client'} and archive this session.
                                    </div>
                                </div>
                                <div className="glass" style={{ padding: '24px', borderRadius: '24px', border: '1px solid var(--border)' }}>
                                    <div style={{ fontSize: '0.7rem', fontWeight: '900', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>REASON_MANIFEST</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: '900', color: 'var(--text)' }}>{selectedReason?.label}</div>
                                    {additionalDetails && <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '8px', fontStyle: 'italic', fontWeight: '500' }}>"{additionalDetails}"</div>}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <div style={{ padding: '24px 40px 40px', borderTop: '1px solid var(--border)', display: 'flex', gap: '16px' }}>
                    <button
                        onClick={step === 1 ? onClose : () => setStep(1)}
                        className="btn btn-secondary"
                        style={{ flex: 1, padding: '18px' }}
                    >
                        {step === 1 ? 'ABORT' : 'BACK'}
                    </button>
                    <button
                        onClick={step === 1 ? () => setStep(2) : handleConfirmCancel}
                        disabled={!selectedReason || cancelling}
                        className="btn btn-primary"
                        style={{ flex: 1, padding: '18px' }}
                    >
                        {cancelling ? 'SYNCING...' : step === 1 ? 'PROCEED' : 'TERMINATE'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default CancelJobModal;
