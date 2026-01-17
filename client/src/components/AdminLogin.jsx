import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const AdminLogin = () => {
    const { login } = useAuth();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Hardcode role 'admin' for this route
            const res = await login(formData.email, formData.password, 'admin');
            if (!res.success) {
                setError(res.message);
            }
        } catch (err) {
            setError('System error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'var(--bg)',
            padding: '2rem'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '400px',
                padding: '3rem',
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '1rem',
                boxShadow: '0 40px 100px -20px rgba(0,0,0,0.1)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <div style={{
                        fontSize: '1.2rem',
                        fontWeight: 800,
                        fontFamily: 'var(--font-heading)',
                        marginBottom: '1rem'
                    }}>
                        FixItNow
                    </div>
                    <h2 style={{
                        fontSize: '1.75rem',
                        fontWeight: 700,
                        margin: 0
                    }}>
                        Internal Admin Portal
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                        Enter your credentials to manage the platform
                    </p>
                </div>

                {error && (
                    <div style={{
                        color: 'var(--error)',
                        background: 'rgba(239,68,68,0.1)',
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        fontSize: '0.9rem',
                        marginBottom: '2rem',
                        border: '1px solid rgba(239,68,68,0.2)',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
                            Admin Email
                        </label>
                        <input
                            type="email"
                            placeholder="admin@fixitnow.com"
                            style={{
                                width: '100%',
                                padding: '1rem',
                                background: 'var(--bg)',
                                border: '1px solid var(--border)',
                                color: 'var(--text)',
                                borderRadius: '0.5rem',
                                outline: 'none',
                                fontSize: '0.95rem'
                            }}
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
                            Password
                        </label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            style={{
                                width: '100%',
                                padding: '1rem',
                                background: 'var(--bg)',
                                border: '1px solid var(--border)',
                                color: 'var(--text)',
                                borderRadius: '0.5rem',
                                outline: 'none',
                                fontSize: '0.95rem'
                            }}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            fontSize: '1rem',
                            opacity: loading ? 0.7 : 1,
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? 'Authorizing...' : 'Authorize Access'}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                        <a href="/" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textDecoration: 'none' }}>
                            Go back to Public Site
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
