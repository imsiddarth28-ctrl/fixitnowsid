import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { X, ChevronRight, Mail, Lock, User, Phone, Briefcase } from 'lucide-react';

const AuthModal = ({ onClose, onSuccess }) => {
    const { login, register } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        phone: '',
        serviceType: 'Plumber',
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
                    {
                        name: formData.name,
                        email: formData.email,
                        password: formData.password,
                        phone: formData.phone,
                        serviceType: formData.serviceType
                    },
                    formData.role
                );
            }

            if (res.success) {
                if (!isLogin) {
                    if (formData.role === 'technician') {
                        setIsLogin(true);
                        setError('Registration successful! Your account is pending Admin approval.');
                    } else {
                        const loginRes = await login(formData.email, formData.password, formData.role);
                        if (loginRes.success) {
                            if (onSuccess) onSuccess(formData.role);
                            onClose();
                        } else {
                            setError('Account created, but auto-login failed. Please sign in manually.');
                            setIsLogin(true);
                        }
                    }
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
            inset: 0,
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            padding: '24px'
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="glass"
                style={{
                    maxWidth: '440px',
                    width: '100%',
                    padding: '48px',
                    borderRadius: 'var(--radius-lg)',
                    position: 'relative',
                    border: '1px solid var(--border)'
                }}
            >
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '24px',
                        right: '24px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-secondary)'
                    }}
                >
                    <X size={24} />
                </button>

                <div style={{ marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: '800', fontFamily: 'var(--font-heading)', color: 'var(--text)', marginBottom: '8px' }}>
                        {isLogin ? 'Welcome back' : 'Join SAHAKAR'}
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                        {isLogin ? 'Enter your details to access your account' : 'Start your journey with premium services'}
                    </p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            padding: '12px 16px',
                            background: 'rgba(239,68,68,0.1)',
                            color: 'var(--error)',
                            borderRadius: '10px',
                            fontSize: '0.85rem',
                            marginBottom: '24px',
                            border: '1px solid rgba(239,68,68,0.2)',
                            fontWeight: '600'
                        }}
                    >
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Role Selection Tabs */}
                    <div style={{
                        display: 'flex',
                        background: 'var(--bg-tertiary)',
                        padding: '4px',
                        borderRadius: '12px',
                        marginBottom: '4px'
                    }}>
                        {['customer', 'technician'].map((role) => (
                            <button
                                key={role}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, role }))}
                                style={{
                                    flex: 1,
                                    padding: '8px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: formData.role === role ? 'var(--bg-secondary)' : 'transparent',
                                    color: formData.role === role ? 'var(--text)' : 'var(--text-secondary)',
                                    fontSize: '0.85rem',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}
                            >
                                {role}
                            </button>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        {!isLogin && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
                            >
                                <div style={{ position: 'relative' }}>
                                    <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Full Name"
                                        required
                                        className="input"
                                        style={{ paddingLeft: '48px' }}
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div style={{ position: 'relative' }}>
                                    <Phone size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                    <input
                                        type="tel"
                                        name="phone"
                                        placeholder="Phone Number"
                                        required
                                        className="input"
                                        style={{ paddingLeft: '48px' }}
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </div>

                                {formData.role === 'technician' && (
                                    <div style={{ position: 'relative' }}>
                                        <Briefcase size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                        <select
                                            name="serviceType"
                                            className="input"
                                            style={{ paddingLeft: '48px', appearance: 'none' }}
                                            value={formData.serviceType}
                                            onChange={handleChange}
                                        >
                                            <option value="Plumber">Plumbing</option>
                                            <option value="Electrician">Electrical</option>
                                            <option value="Cleaning">Cleaning</option>
                                            <option value="Carpenter">Carpentry</option>
                                            <option value="HVAC">HVAC</option>
                                            <option value="Windows">Windows</option>
                                        </select>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div style={{ position: 'relative' }}>
                        <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            required
                            className="input"
                            style={{ paddingLeft: '48px' }}
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            required
                            className="input"
                            style={{ paddingLeft: '48px' }}
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                        style={{ padding: '14px', marginTop: '8px' }}
                    >
                        {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                    </button>
                </form>

                <div style={{ marginTop: '32px', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            style={{ background: 'none', border: 'none', color: 'var(--text)', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                            {isLogin ? 'Sign Up' : 'Sign In'}
                        </button>
                    </p>
                </div>

                <div style={{ marginTop: '24px', textAlign: 'center' }}>
                    <a href="/admin" onClick={onClose} style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textDecoration: 'none', opacity: 0.6 }}>Admin access node</a>
                </div>
            </motion.div>
        </div>
    );
};

export default AuthModal;
