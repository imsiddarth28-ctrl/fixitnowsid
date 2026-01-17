import { TrendingUp, Wallet } from 'lucide-react';

const WalletInsights = ({ balance = "124.50" }) => {
    return (
        <div className="innovative-card" style={{
            padding: '1.5rem',
            background: 'var(--text)',
            color: 'var(--bg)',
            overflow: 'hidden',
            position: 'relative'
        }}>
            {/* Background pattern */}
            <div style={{
                position: 'absolute',
                right: '-20px',
                top: '-20px',
                opacity: 0.1,
                transform: 'rotate(15deg)'
            }}>
                <Wallet size={120} />
            </div>

            <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.7 }}>
                    Wallet Insights
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, margin: '0.5rem 0' }}>${balance}</div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}>
                        <TrendingUp size={12} />
                        12%
                    </div>
                    <span style={{ opacity: 0.7 }}>vs last month</span>
                </div>
            </div>

            <div style={{
                marginTop: '1.5rem',
                paddingTop: '1rem',
                borderTop: '1px solid rgba(var(--bg-rgb), 0.1)',
                display: 'flex',
                gap: '1rem'
            }}>
                <div>
                    <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>SAVED THIS YEAR</div>
                    <div style={{ fontWeight: 700 }}>$42.00</div>
                </div>
                <div>
                    <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>REDEEMABLE</div>
                    <div style={{ fontWeight: 700 }}>$5.50</div>
                </div>
            </div>
        </div>
    );
};

export default WalletInsights;
