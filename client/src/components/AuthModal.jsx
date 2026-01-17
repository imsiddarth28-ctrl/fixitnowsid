import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const AuthModal = ({ onClose, onSuccess }) => {
    const { login, register } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        role: 'customer'
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let res;
            if (isLogin) {
                res = await login(formData.email, formData.password, formData.role);
            } else {
                res = await register(
                    { name: formData.name, email: formData.email, password: formData.password },
                    formData.role
                );
            }

            if (res.success) {
                if (!isLogin) {
                    // If register success, automatically login or ask to login
                    alert('Registration successful! Please login.');
                    setIsLogin(true);
                } else {
                    if (onSuccess) onSuccess(formData.role);
                    onClose();
                }
            } else {
                setError(res.message);
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            padding: '2rem'
        }}>
            <div style={{
                background: 'var(--bg)',
                borderRadius: '1rem',
                maxWidth: '450px',
                width: '100%',
                padding: '3rem',
                border: '1px solid var(--border)',
                boxShadow: '0 40px 100px -20px rgba(0,0,0,0.3)',
                position: 'relative'
            }}>
                {/* Close Button */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1.5rem',
                        right: '1.5rem',
                        background: 'transparent',
                        border: 'none',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        color: 'var(--text-muted)',
                        padding: 0,
                        width: '30px',
                        height: '30px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    ×
                </button>

                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <h2 style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: '2rem',
                        fontWeight: 700,
                        marginBottom: '0.5rem'
                    }}>
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                        {isLogin ? 'Sign in to continue' : 'Sign up to get started'}
                    </p>
                </div>

                {/* Error Display */}
                {error && (
                    <div style={{
                        padding: '1rem',
                        background: 'rgba(239,68,68,0.1)',
                        color: 'var(--error)',
                        borderRadius: '0.5rem',
                        fontSize: '0.9rem',
                        marginBottom: '1.5rem',
                        border: '1px solid rgba(239,68,68,0.2)',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Role Selection */}
                    <div>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.8rem',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            color: 'var(--text)'
                        }}>
                            I am a...
                        </label>
                        <div style={{
                            display: 'flex',
                            gap: '1rem',
                            background: 'var(--card)',
                            padding: '0.4rem',
                            borderRadius: '0.6rem',
                            border: '1px solid var(--border)'
                        }}>
                            {['customer', 'technician'].map((role) => (
                                <button
                                    key={role}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, role }))}
                                    style={{
                                        flex: 1,
                                        padding: '0.6rem',
                                        borderRadius: '0.4rem',
                                        border: 'none',
                                        background: formData.role === role ? 'var(--text)' : 'transparent',
                                        color: formData.role === role ? 'var(--bg)' : 'var(--text-muted)',
                                        fontSize: '0.85rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        textTransform: 'capitalize'
                                    }}
                                >
                                    {role}
                                </button>
                            ))}
                        </div>
                    </div>

                    {!isLogin && (
                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                color: 'var(--text)'
                            }}>
                                Full Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter your name"
                                style={{
                                    width: '100%',
                                    padding: '0.875rem 1rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid var(--border)',
                                    background: 'var(--card)',
                                    fontSize: '0.95rem',
                                    outline: 'none',
                                    transition: 'all 0.2s ease',
                                    color: 'var(--text)'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--text)'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                            />
                        </div>
                    )}

                    <div>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            color: 'var(--text)'
                        }}>
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            style={{
                                width: '100%',
                                padding: '0.875rem 1rem',
                                borderRadius: '0.5rem',
                                border: '1px solid var(--border)',
                                background: 'var(--card)',
                                fontSize: '0.95rem',
                                outline: 'none',
                                transition: 'all 0.2s ease',
                                color: 'var(--text)'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--text)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                        />
                    </div>

                    <div>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            color: 'var(--text)'
                        }}>
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            style={{
                                width: '100%',
                                padding: '0.875rem 1rem',
                                borderRadius: '0.5rem',
                                border: '1px solid var(--border)',
                                background: 'var(--card)',
                                fontSize: '0.95rem',
                                outline: 'none',
                                transition: 'all 0.2s ease',
                                color: 'var(--text)'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--text)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
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
                            marginTop: '0.5rem',
                            opacity: loading ? 0.7 : 1,
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                    </button>
                </form>

                {/* Toggle */}
                <div style={{
                    marginTop: '2rem',
                    textAlign: 'center',
                    fontSize: '0.9rem',
                    color: 'var(--text-muted)'
                }}>
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text)',
                            fontWeight: 600,
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            padding: 0
                        }}
                    >
                        {isLogin ? 'Sign Up' : 'Sign In'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
