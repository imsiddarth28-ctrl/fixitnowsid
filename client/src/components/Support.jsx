
import { useState } from 'react';

const Support = () => {
    return (
        <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 className="text-gradient" style={{ marginBottom: '1.5rem' }}>Support & Help</h2>

            <div style={{ marginBottom: '2rem' }}>
                <h3>How can we help you?</h3>
                <p style={{ color: 'var(--text-muted)' }}>Chat with us or raise a ticket.</p>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                    <h4>📢 Report an Issue</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Report a problem with a recent job.</p>
                    <button className="btn-primary" style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>Raise Ticket</button>
                </div>
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                    <h4>💬 Live Chat</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Chat with our customer service.</p>
                    <button className="glass-panel" style={{ marginTop: '0.5rem', fontSize: '0.8rem', padding: '0.5rem 1rem' }}>Start Chat</button>
                </div>
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                    <h4>💸 Refund Request</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Request a refund for a cancelled job.</p>
                </div>
            </div>
        </div>
    );
};

export default Support;
