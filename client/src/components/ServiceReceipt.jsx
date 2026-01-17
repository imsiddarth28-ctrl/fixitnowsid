
import { motion } from 'framer-motion';
import { Download, CheckCircle2, MapPin, Clock, CreditCard, ShieldCheck } from 'lucide-react';

const ServiceReceipt = ({ job, onClose }) => {
    if (!job) return null;

    const formattedDate = new Date(job.completedAt || Date.now()).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '2rem'
        }}>
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{
                    background: 'var(--bg)',
                    width: '100%',
                    maxWidth: '450px',
                    borderRadius: '1.5rem',
                    border: '1px solid var(--border)',
                    overflow: 'hidden',
                    boxShadow: '0 40px 100px rgba(0,0,0,0.5)',
                    position: 'relative'
                }}
            >
                {/* Receipt Header */}
                <div style={{
                    padding: '2.5rem 2rem',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    textAlign: 'center',
                    color: 'white'
                }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        backdropFilter: 'blur(5px)'
                    }}>
                        <CheckCircle2 size={32} />
                    </div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '0.4rem', letterSpacing: '-0.02em' }}>MISSION ACCOMPLISHED</h2>
                    <p style={{ opacity: 0.8, fontSize: '0.85rem', fontWeight: 600 }}>TRANSACTION ID: #{job._id.slice(-8).toUpperCase()}</p>
                </div>

                {/* Receipt Details */}
                <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ borderBottom: '1px dashed var(--border)', paddingBottom: '1.5rem' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.8rem', letterSpacing: '0.1em' }}>SERVICE SUMMARY</div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>{job.serviceType}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            <Clock size={14} />
                            <span>Completed on {formattedDate}</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Base Service Fee</span>
                            <span style={{ fontWeight: 700 }}>${(job.price * 0.8).toFixed(2)}</span>
                        </div>
                        {job.isEmergency && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: '#ef4444', fontSize: '0.9rem', fontWeight: 600 }}>Emergency Override</span>
                                <span style={{ fontWeight: 700, color: '#ef4444' }}>+$30.00</span>
                            </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Platform Maintenance</span>
                            <span style={{ fontWeight: 700 }}>${(job.price * 0.2).toFixed(2)}</span>
                        </div>
                        <div style={{
                            marginTop: '1rem',
                            paddingTop: '1rem',
                            borderTop: '2px solid var(--border)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <span style={{ fontWeight: 900, fontSize: '1.1rem' }}>TOTAL SETTLED</span>
                            <span style={{ fontWeight: 900, fontSize: '1.8rem', color: '#10b981' }}>${job.price?.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Trust Badges */}
                    <div style={{
                        background: 'var(--card)',
                        padding: '1rem',
                        borderRadius: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.8rem',
                        border: '1px solid var(--border)'
                    }}>
                        <ShieldCheck size={20} color="#10b981" />
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                            AUTHENTICATED SECURE SETTLEMENT VIA FIXITNOW ESCROW
                        </span>
                    </div>

                    {/* Footer Actions */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                        <button style={{
                            padding: '1rem',
                            borderRadius: '0.8rem',
                            background: 'var(--text)',
                            color: 'var(--bg)',
                            border: 'none',
                            fontWeight: 800,
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.6rem'
                        }}>
                            <Download size={18} /> DOWNLOAD
                        </button>
                        <button
                            onClick={onClose}
                            style={{
                                padding: '1rem',
                                borderRadius: '0.8rem',
                                background: 'transparent',
                                color: 'var(--text)',
                                border: '1px solid var(--border)',
                                fontWeight: 800,
                                fontSize: '0.85rem',
                                cursor: 'pointer'
                            }}
                        >
                            CLOSE ARCHIVE
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ServiceReceipt;
