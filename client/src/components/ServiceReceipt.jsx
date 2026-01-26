
import { motion, AnimatePresence } from 'framer-motion';
import { Download, CheckCircle2, Clock, ShieldCheck, FileText, X } from 'lucide-react';

const ServiceReceipt = ({ job, onClose }) => {
    if (!job) return null;

    const formattedDate = new Date(job.completedAt || Date.now()).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const handleDownloadPDF = () => {
        const printWindow = window.open('', '_blank');
        const receiptHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>SAHAKAR Receipt - ${job._id.slice(-6).toUpperCase()}</title>
                <style>
                    @page { margin: 15mm; }
                    body { font-family: 'Inter', -apple-system, sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; color: #1d1d1f; }
                    .header { border-bottom: 2px solid #000; padding-bottom: 30px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
                    .title { font-size: 32px; font-weight: 900; letter-spacing: -0.04em; margin: 0; }
                    .tx-id { font-family: monospace; font-size: 14px; color: #86868b; margin: 0; }
                    .section { margin: 24px 0; }
                    .section-label { font-size: 10px; font-weight: 800; color: #86868b; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; }
                    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                    .info-val { font-size: 15px; font-weight: 600; }
                    .line-item { display: flex; justify-content: space-between; margin: 12px 0; font-size: 14px; }
                    .total-box { background: #fafafa; padding: 20px; border-radius: 12px; margin-top: 30px; }
                    .total-row { display: flex; justify-content: space-between; align-items: center; }
                    .total-label { font-size: 18px; font-weight: 900; }
                    .total-val { font-size: 24px; font-weight: 900; }
                    .footer { text-align: center; margin-top: 50px; font-size: 11px; color: #86868b; border-top: 1px solid #f2f2f2; padding-top: 30px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <h1 class="title">RECEIPT</h1>
                        <p class="tx-id">TIMESTAMP: ${new Date().toISOString()}</p>
                    </div>
                    <div style="text-align: right;">
                        <p style="font-weight: 900; margin: 0;">SAHAKAR</p>
                        <p class="tx-id">PRO VERSION 2.0</p>
                    </div>
                </div>
                
                <div class="section">
                    <p class="section-label">Service Summary</p>
                    <p style="font-size: 20px; font-weight: 800; margin: 0;">${job.serviceType}</p>
                    <p style="color: #86868b; font-size: 14px; margin-top: 4px;">Executed on ${formattedDate}</p>
                </div>

                <div class="section">
                    <p class="section-label">Personnel & Location</p>
                    <div class="info-grid">
                        <div>
                            <p class="section-label" style="font-size: 8px;">TECHNICIAN</p>
                            <p class="info-val">${job.technicianId?.name || 'Authorized Pro'}</p>
                        </div>
                        <div>
                            <p class="section-label" style="font-size: 8px;">LOCATION</p>
                            <p class="info-val">${job.location?.address || 'On-site Service'}</p>
                        </div>
                    </div>
                </div>
                
                <div class="total-box">
                    <p class="section-label">Financial Breakdown</p>
                    <div class="line-item">
                        <span>Base Service Fee</span>
                        <span>$${(job.price * 0.85).toFixed(2)}</span>
                    </div>
                    ${job.isEmergency ? `
                    <div class="line-item" style="color: #ff3b30; font-weight: 700;">
                        <span>Urgent Handling Surcharge</span>
                        <span>+$30.00</span>
                    </div>` : ''}
                    <div class="line-item">
                        <span>System Surcharge</span>
                        <span>$${(job.price * 0.15).toFixed(2)}</span>
                    </div>
                    <div style="height: 1px; background: #e5e5e5; margin: 15px 0;"></div>
                    <div class="total-row">
                        <span class="total-label">FINAL SETTLEMENT</span>
                        <span class="total-val">$${job.price?.toFixed(2)}</span>
                    </div>
                </div>
                
                <div class="footer">
                    <p><strong>SAHAKAR SECURE AUTHENTICATION REVEALED</strong></p>
                    <p>This document verifies the completion of a digital service contract via SAHAKAR.</p>
                    <p>All transactions are protected by end-to-end encryption and secure escrow systems.</p>
                </div>
            </body>
            </html>
        `;

        printWindow.document.write(receiptHTML);
        printWindow.document.close();
        printWindow.onload = () => {
            setTimeout(() => {
                printWindow.print();
                printWindow.onafterprint = () => printWindow.close();
            }, 500);
        };
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(12px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10000,
                    padding: '24px'
                }}
            >
                <motion.div
                    initial={{ scale: 0.95, y: 20, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.95, y: 20, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="glass"
                    style={{
                        width: '100%',
                        maxWidth: '400px',
                        borderRadius: '32px',
                        border: '1px solid var(--border)',
                        overflow: 'hidden',
                        boxShadow: '0 40px 100px rgba(0,0,0,0.2)',
                        background: 'var(--bg-secondary)'
                    }}
                >
                    {/* Header: Success Confirmation */}
                    <div style={{
                        padding: '40px 32px 32px',
                        textAlign: 'center',
                        background: 'var(--bg-tertiary)',
                        borderBottom: '1px solid var(--border)'
                    }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '24px',
                            background: 'var(--text)',
                            color: 'var(--bg)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px'
                        }}>
                            <CheckCircle2 size={32} />
                        </div>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: '900', fontFamily: 'var(--font-heading)', color: 'var(--text)', marginBottom: '4px' }}>
                            MISSION COMPLETE
                        </h2>
                        <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-secondary)', opacity: 0.7 }}>
                            TX: #{job._id.slice(-8).toUpperCase()}
                        </div>
                    </div>

                    {/* Receipt Details */}
                    <div style={{ padding: '32px' }}>
                        <div style={{ marginBottom: '24px' }}>
                            <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
                                Operation Data
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text)' }}>{job.serviceType}</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '6px' }}>
                                <Clock size={14} />
                                <span>{formattedDate}</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', background: 'var(--bg-tertiary)', padding: '24px', borderRadius: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>Service Fee</span>
                                <span style={{ fontWeight: '800', color: 'var(--text)' }}>${(job.price * 0.85).toFixed(2)}</span>
                            </div>
                            {job.isEmergency && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                    <span style={{ color: 'var(--error)', fontWeight: '700' }}>Urgent Surcharge</span>
                                    <span style={{ fontWeight: '800', color: 'var(--error)' }}>+$30.00</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>System Fee</span>
                                <span style={{ fontWeight: '800', color: 'var(--text)' }}>${(job.price * 0.15).toFixed(2)}</span>
                            </div>

                            <div style={{ height: '1px', background: 'var(--border)', margin: '6px 0' }} />

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: '900', fontSize: '1rem', color: 'var(--text)' }}>TOTAL</span>
                                <span style={{ fontWeight: '900', fontSize: '1.75rem', color: 'var(--success)', letterSpacing: '-0.03em' }}>
                                    ${job.price?.toFixed(2)}
                                </span>
                            </div>
                        </div>

                        {/* Security Badge */}
                        <div style={{
                            marginTop: '24px',
                            background: 'rgba(16, 185, 129, 0.05)',
                            padding: '12px 16px',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            border: '1px solid rgba(16, 185, 129, 0.1)'
                        }}>
                            <ShieldCheck size={18} color="var(--success)" />
                            <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--success)', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                                Verified Secure Escrow Settlement
                            </span>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '32px' }}>
                            <button
                                onClick={handleDownloadPDF}
                                className="btn btn-secondary"
                                style={{
                                    padding: '14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                <FileText size={18} /> EXPORT
                            </button>
                            <button
                                onClick={onClose}
                                className="btn btn-primary"
                                style={{ padding: '14px' }}
                            >
                                DISMISS
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ServiceReceipt;

