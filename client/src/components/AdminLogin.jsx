import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';

const AdminLogin = () => {
    const { login } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        adminCode: '' // The Secret Code
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                // Hardcode role 'admin' for this route
                const res = await login(formData.email, formData.password, 'admin');
                if (!res.success) {
                    setError(res.message);
                }
            } else {
                // REGISTER ADMIN
                const res = await fetch(`${API_URL}/api/auth/register/admin`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: formData.name,
                        email: formData.email,
                        password: formData.password,
                        adminCode: formData.adminCode
                    })
                });
                const data = await res.json();

                if (res.ok) {
                    alert('Admin Access Granted. Please log in.');
                    setIsLogin(true);
                } else {
                    setError(data.message || 'Access Denied');
                }
            }
        } catch (err) {
            console.error(err);
            setError('System error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
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
                maxWidth: '430px',
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
                        {isLogin ? 'Internal Admin Portal' : 'Admin Protocol Init'}
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                        {isLogin ? 'Enter your credentials to manage the platform' : 'Enter security code for elevated access'}
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

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

                    {!isLogin && (
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
                                Admin Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                placeholder="Root Admin"
                                style={{
                                    width: '100%', padding: '0.8rem', background: 'var(--bg)',
                                    border: '1px solid var(--border)', color: 'var(--text)',
                                    borderRadius: '0.5rem', outline: 'none', fontSize: '0.95rem'
                                }}
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    )}

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
                            Admin Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            placeholder="admin@fixitnow.com"
                            style={{
                                width: '100%', padding: '0.8rem', background: 'var(--bg)',
                                border: '1px solid var(--border)', color: 'var(--text)',
                                borderRadius: '0.5rem', outline: 'none', fontSize: '0.95rem'
                            }}
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            style={{
                                width: '100%', padding: '0.8rem', background: 'var(--bg)',
                                border: '1px solid var(--border)', color: 'var(--text)',
                                borderRadius: '0.5rem', outline: 'none', fontSize: '0.95rem'
                            }}
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {!isLogin && (
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#f59e0b' }}>
                                Security Clearance Code
                            </label>
                            <input
                                type="password"
                                name="adminCode"
                                placeholder="Enter Access Code"
                                style={{
                                    width: '100%', padding: '0.8rem', background: 'rgba(245, 158, 11, 0.05)',
                                    border: '1px solid #f59e0b', color: 'var(--text)',
                                    borderRadius: '0.5rem', outline: 'none', fontSize: '0.95rem', letterSpacing: '2px'
                                }}
                                value={formData.adminCode}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            fontSize: '1rem',
                            marginTop: '1rem',
                            opacity: loading ? 0.7 : 1,
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? 'Processing...' : (isLogin ? 'Authorize Access' : 'Create System Admin')}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <button
                            type="button"
                            onClick={() => { setIsLogin(!isLogin); setError(''); }}
                            style={{ background: 'transparent', border: 'none', textDecoration: 'underline', color: 'var(--text)', cursor: 'pointer', fontSize: '0.9rem' }}
                        >
                            {isLogin ? 'Initial Admin Registration' : 'Return to Login'}
                        </button>

                        <a href="/" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none' }}>
                            Go back to Public Site
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
