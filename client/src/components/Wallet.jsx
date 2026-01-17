
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Wallet = () => {
    const { user } = useAuth();
    const [balance, setBalance] = useState(user?.walletBalance || 0); // Need to sync with context or fetch
    const [amount, setAmount] = useState('');

    const handleAddMoney = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`http://localhost:5000/api/user/${user.id}/wallet/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: parseFloat(amount) })
            });
            const data = await res.json();
            setBalance(data.balance);
            setAmount('');
            alert('Money added to wallet!');
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 className="text-gradient" style={{ marginBottom: '1.5rem' }}>My Wallet</h2>

            <div style={{
                background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))',
                padding: '2rem', borderRadius: '1rem', marginBottom: '2rem', textAlign: 'center'
            }}>
                <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Current Balance</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>$ {balance.toFixed(2)}</div>
            </div>

            <form onSubmit={handleAddMoney}>
                <h4 style={{ marginBottom: '1rem' }}>Add Money</h4>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <input
                        type="number"
                        placeholder="Amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="glass-input"
                        style={{ flex: 1, padding: '0.75rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: 'white' }}
                        required
                    />
                    <button type="submit" className="btn-primary">Add Funds</button>
                </div>
            </form>

            <div style={{ marginTop: '2rem' }}>
                <h4 style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>Recent Transactions</h4>
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>No transactions yet.</p>
                </div>
            </div>
        </div>
    );
};

export default Wallet;
