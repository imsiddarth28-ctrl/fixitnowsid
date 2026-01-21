
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, CreditCard, ArrowUpRight, Calendar, Download, Wallet } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';

const EarningsDashboard = () => {
    const { user } = useAuth();
    const [earningsData, setEarningsData] = useState({
        total: 0,
        pending: 0,
        available: 0,
        history: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEarnings = async () => {
            try {
                // In a real app, successful jobs = earnings. 
                // We'll mock specific earnings history from completed jobs for now 
                // or fetch from a dedicated endpoint if it existed.
                // Reusing the dashboard stats endpoint or booking history.
                const res = await fetch(`${API_URL}/api/bookings/user/${user.id}?role=technician`);
                if (res.ok) {
                    const jobs = await res.json();
                    const completed = jobs.filter(j => j.status === 'completed');

                    const total = completed.reduce((acc, job) => acc + (job.price || 150), 0); // Mock price if missing
                    const history = completed.map(job => ({
                        id: job._id,
                        date: job.completedAt || job.updatedAt,
                        amount: job.price || 150,
                        customer: job.customerId?.name || 'Customer'
                    })).sort((a, b) => new Date(b.date) - new Date(a.date));

                    setEarningsData({
                        total,
                        pending: 0, // Mock
                        available: total,
                        history
                    });
                }
            } catch (err) {
                console.error('Earnings fetch error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchEarnings();
    }, [user.id]);

    const Card = ({ label, value, sub, icon: Icon, color }) => (
        <div className="bento-card glass" style={{ padding: '32px', flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{
                    width: '56px', height: '56px', borderRadius: '18px',
                    background: color || 'var(--text)', color: 'var(--bg)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                }}>
                    <Icon size={24} />
                </div>
                <div className="badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                    <ArrowUpRight size={14} style={{ marginRight: '4px' }} />
                    +12%
                </div>
            </div>
            <div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '800', letterSpacing: '0.05em', marginBottom: '8px' }}>{label.toUpperCase()}</div>
                <div style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-0.04em' }}>${value.toLocaleString()}</div>
                {sub && <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px', fontWeight: '600' }}>{sub}</div>}
            </div>
        </div>
    );

    if (loading) return (
        <div style={{ padding: '80px', textAlign: 'center' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} style={{ width: '40px', height: '40px', border: '3px solid var(--border)', borderTopColor: 'var(--text)', borderRadius: '50%', margin: '0 auto' }} />
        </div>
    );

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: '48px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: 'var(--success)' }}>
                    <Wallet size={24} />
                    <span style={{ fontSize: '0.8rem', fontWeight: '900', letterSpacing: '0.1em' }}>FINANCIAL_CENTER</span>
                </div>
                <h1 style={{ fontSize: '3rem', fontWeight: '900', letterSpacing: '-0.04em', marginBottom: '12px' }}>EARNINGS_OVERVIEW</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', fontWeight: '500' }}>Manage your revenue streams and payout protocols.</p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', marginBottom: '48px' }}>
                <Card label="Total Revenue" value={earningsData.total} sub="Lifetime earnings generated" icon={DollarSign} />
                <Card label="Available Balance" value={earningsData.available} sub="Ready for immediate payout" icon={Wallet} color="var(--success)" />
                <Card label="Pending Clearance" value={earningsData.pending} sub="verifying transaction blocks" icon={Clock} color="var(--warning)" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px' }}>
                {/* Transaction History */}
                <div className="glass" style={{ padding: '32px', borderRadius: '32px', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '900' }}>RECENT_TRANSACTIONS</h3>
                        <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.75rem' }}>EXPORT_CSV</button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {earningsData.history.length > 0 ? (
                            earningsData.history.map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', background: 'var(--bg)', borderRadius: '20px', border: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <ArrowUpRight size={24} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '800', fontSize: '1rem', marginBottom: '4px' }}>Mission Payment</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>{new Date(item.date).toLocaleDateString()} • {item.customer}</div>
                                        </div>
                                    </div>
                                    <div style={{ fontWeight: '900', fontSize: '1.1rem', color: 'var(--success)' }}>
                                        +${item.amount}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>No transactions recorded yet.</div>
                        )}
                    </div>
                </div>

                {/* Payout Method */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="glass" style={{ padding: '32px', borderRadius: '32px', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '900', marginBottom: '24px' }}>PAYOUT_METHOD</h3>
                        <div style={{ padding: '24px', background: 'linear-gradient(135deg, #111 0%, #333 100%)', borderRadius: '24px', color: 'white', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: 0, right: 0, padding: '24px', opacity: 0.1 }}>
                                <CreditCard size={120} />
                            </div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '4px' }}>LINKED_ACCOUNT</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '32px' }}>Chase Sapph****</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                <div>
                                    <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>HOLDER</div>
                                    <div style={{ fontWeight: '700' }}>{user.name.toUpperCase()}</div>
                                </div>
                                <div style={{ fontSize: '1.5rem' }}>VISA</div>
                            </div>
                        </div>
                        <button className="btn btn-secondary" style={{ width: '100%', padding: '16px' }}>MANAGE_ACCOUNTS</button>
                    </div>

                    <div className="glass" style={{ padding: '32px', borderRadius: '32px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--text)', color: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Download size={20} />
                            </div>
                            <div style={{ fontWeight: '800' }}>Tax Documents</div>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>Download your 1099-NEC and annual earnings report for the fiscal year.</p>
                        <button className="btn btn-outline" style={{ width: '100%' }}>ACCESS_VAULT</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EarningsDashboard;
