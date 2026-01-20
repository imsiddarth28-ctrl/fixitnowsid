
import { motion, AnimatePresence } from 'framer-motion';
import { Download, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';

const ServiceReceipt = ({ job, onClose }) => {
    if (!job) return null;

    const formattedDate = new Date(job.completedAt || Date.now()).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const handleDownloadPDF = () => {
        // Create a print-friendly version
        const printWindow = window.open('', '_blank');
        const receiptHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>FixItNow Receipt - ${job._id.slice(-6).toUpperCase()}</title>
                <style>
                    @page { margin: 20mm; }
                    body { font-family: Arial, sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; }
                    .header { text-align: center; margin-bottom: 30px; padding: 20px; background: #10b981; color: white; border-radius: 10px; }
                    .header h1 { margin: 0; font-size: 24px; }
                    .header p { margin: 5px 0 0 0; font-size: 12px; opacity: 0.9; }
                    .section { margin: 20px 0; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; }
                    .section-title { font-size: 11px; color: #6b7280; font-weight: bold; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em; }
                    .service-name { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
                    .line-item { display: flex; justify-content: space-between; margin: 10px 0; font-size: 14px; }
                    .total { border-top: 2px solid #000; padding-top: 10px; margin-top: 10px; font-weight: bold; font-size: 16px; }
                    .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 20px; }
                    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px 0; }
                    .info-item { font-size: 13px; }
                    .info-label { color: #6b7280; font-size: 11px; margin-bottom: 4px; }
                    .info-value { font-weight: 600; }
                    @media print { 
                        body { padding: 20px; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>✓ SERVICE COMPLETED</h1>
                    <p>Transaction ID: #${job._id.slice(-8).toUpperCase()}</p>
                    <p style="margin-top: 5px; font-size: 10px;">FixItNow Professional Services</p>
                </div>
                
                <div class="section">
                    <div class="section-title">Service Summary</div>
                    <div class="service-name">${job.serviceType}</div>
                    <div style="font-size: 13px; color: #6b7280; margin-top: 8px;">Completed on ${formattedDate}</div>
                    ${job.description ? `<div style="font-size: 12px; color: #6b7280; margin-top: 8px; padding: 10px; background: #f9fafb; border-radius: 5px;">${job.description}</div>` : ''}
                </div>

                <div class="section">
                    <div class="section-title">Service Details</div>
                    <div class="info-grid">
                        <div class="info-item">
                            <div class="info-label">Technician</div>
                            <div class="info-value">${job.technicianId?.name || 'Professional'}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Customer</div>
                            <div class="info-value">${job.customerId?.name || 'Client'}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Location</div>
                            <div class="info-value">${job.location?.address || 'Service Location'}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Service Type</div>
                            <div class="info-value">${job.isEmergency ? '🚨 Emergency' : 'Standard'}</div>
                        </div>
                    </div>
                </div>
                
                <div class="section">
                    <div class="section-title">Payment Breakdown</div>
                    <div class="line-item">
                        <span>Service Fee</span>
                        <span>$${(job.price * 0.8).toFixed(2)}</span>
                    </div>
                    ${job.isEmergency ? `
                    <div class="line-item" style="color: #ef4444;">
                        <span>Emergency Surcharge</span>
                        <span>+$30.00</span>
                    </div>` : ''}
                    <div class="line-item">
                        <span>Platform Fee</span>
                        <span>$${(job.price * 0.2).toFixed(2)}</span>
                    </div>
                    <div class="line-item total">
                        <span>TOTAL AMOUNT</span>
                        <span style="color: #10b981;">$${job.price?.toFixed(2)}</span>
                    </div>
                </div>
                
                <div class="footer">
                    <p style="margin: 10px 0;"><strong>🛡️ Secure Payment via FixItNow Escrow</strong></p>
                    <p style="margin: 5px 0;">This is an official receipt for services rendered through FixItNow platform.</p>
                    <p style="margin: 5px 0;">For support, visit fixitnow.com/support</p>
                    <p style="margin: 15px 0 5px 0; font-size: 10px;">Generated on ${new Date().toLocaleString()}</p>
                </div>
            </body>
            </html>
        `;

        printWindow.document.write(receiptHTML);
        printWindow.document.close();

        // Wait for content to load, then print
        printWindow.onload = () => {
            setTimeout(() => {
                printWindow.print();
                printWindow.onafterprint = () => printWindow.close();
            }, 250);
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
                    background: 'rgba(0,0,0,0.85)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10000,
                    padding: '1rem',
                    cursor: 'pointer'
                }}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        background: 'var(--bg)',
                        width: '100%',
                        maxWidth: '360px',
                        borderRadius: '1rem',
                        border: '1px solid var(--border)',
                        overflow: 'hidden',
                        boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
                        cursor: 'default'
                    }}
                >
                    {/* Compact Header */}
                    <div style={{
                        padding: '1.2rem',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        textAlign: 'center',
                        color: 'white'
                    }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 0.8rem'
                        }}>
                            <CheckCircle2 size={20} />
                        </div>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: '0.2rem' }}>COMPLETE</h2>
                        <p style={{ opacity: 0.8, fontSize: '0.65rem', fontWeight: 600 }}>TX: #{job._id.slice(-6).toUpperCase()}</p>
                    </div>

                    {/* Compact Details */}
                    <div style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ paddingBottom: '0.8rem', borderBottom: '1px dashed var(--border)' }}>
                            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 800, marginBottom: '0.3rem', letterSpacing: '0.05em' }}>SERVICE</div>
                            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.3rem' }}>{job.serviceType}</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                                <Clock size={10} />
                                <span>{formattedDate}</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Service Fee</span>
                                <span style={{ fontWeight: 700, fontSize: '0.75rem' }}>${(job.price * 0.8).toFixed(2)}</span>
                            </div>
                            {job.isEmergency && (
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 600 }}>Emergency</span>
                                    <span style={{ fontWeight: 700, color: '#ef4444', fontSize: '0.75rem' }}>+$30.00</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Platform</span>
                                <span style={{ fontWeight: 700, fontSize: '0.75rem' }}>${(job.price * 0.2).toFixed(2)}</span>
                            </div>
                            <div style={{
                                marginTop: '0.5rem',
                                paddingTop: '0.6rem',
                                borderTop: '2px solid var(--border)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <span style={{ fontWeight: 900, fontSize: '0.85rem' }}>TOTAL</span>
                                <span style={{ fontWeight: 900, fontSize: '1.3rem', color: '#10b981' }}>${job.price?.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Compact Trust Badge */}
                        <div style={{
                            background: 'var(--card)',
                            padding: '0.6rem',
                            borderRadius: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            border: '1px solid var(--border)'
                        }}>
                            <ShieldCheck size={14} color="#10b981" />
                            <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                                SECURE ESCROW SETTLEMENT
                            </span>
                        </div>

                        {/* Compact Actions */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                            <button
                                onClick={handleDownloadPDF}
                                style={{
                                    padding: '0.7rem',
                                    borderRadius: '0.5rem',
                                    background: 'var(--text)',
                                    color: 'var(--bg)',
                                    border: 'none',
                                    fontWeight: 800,
                                    fontSize: '0.7rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.4rem'
                                }}
                            >
                                <Download size={12} /> PDF
                            </button>
                            <button
                                onClick={onClose}
                                style={{
                                    padding: '0.7rem',
                                    borderRadius: '0.5rem',
                                    background: 'transparent',
                                    color: 'var(--text)',
                                    border: '1px solid var(--border)',
                                    fontWeight: 800,
                                    fontSize: '0.7rem',
                                    cursor: 'pointer'
                                }}
                            >
                                CLOSE
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ServiceReceipt;

