
import { useState } from 'react';

const PaymentForm = ({ amount, onSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        name: ''
    });
    const [errors, setErrors] = useState({});
    const [isProcessing, setIsProcessing] = useState(false);

    const formatCardNumber = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = matches && matches[0] || '';
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        if (parts.length) {
            return parts.join(' ');
        } else {
            return value;
        }
    };

    const formatExpiry = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        if (v.length >= 2) {
            return v.substring(0, 2) + '/' + v.substring(2, 4);
        }
        return v;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = value;

        if (name === 'cardNumber') {
            formattedValue = formatCardNumber(value);
        } else if (name === 'expiryDate') {
            formattedValue = formatExpiry(value);
        } else if (name === 'cvv') {
            formattedValue = value.replace(/\D/g, '').slice(0, 3);
        }

        setFormData(prev => ({ ...prev, [name]: formattedValue }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};

        // Simple Card Number Validation (Length check 16 digits)
        const cleanCardNum = formData.cardNumber.replace(/\s/g, '');
        if (cleanCardNum.length !== 16) {
            newErrors.cardNumber = 'Card number must be 16 digits';
        }

        // Expiry Validation
        if (!formData.expiryDate.match(/^(0[1-9]|1[0-2])\/\d{2}$/)) {
            newErrors.expiryDate = 'Invalid date (MM/YY)';
        } else {
            // Check if expired
            const [month, year] = formData.expiryDate.split('/');
            const expiry = new Date(20 + year, month - 1);
            const now = new Date();
            now.setMonth(now.getMonth() - 1); // Allow current month
            if (expiry < now) {
                newErrors.expiryDate = 'Card has expired';
            }
        }

        // CVV Validation
        if (formData.cvv.length !== 3) {
            newErrors.cvv = 'Invalid CVV';
        }

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            setIsProcessing(true);
            // Simulate network request
            setTimeout(() => {
                setIsProcessing(false);
                onSuccess();
            }, 2000);
        }
    };

    return (
        <div className="glass-panel" style={{ maxWidth: '500px', margin: '2rem auto', padding: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Secure Payment</h2>

            <div style={{ marginBottom: '2rem', textAlign: 'center', fontSize: '1.25rem' }}>
                Total Amount: <span className="text-gradient" style={{ fontWeight: 'bold' }}>${amount}</span>
            </div>

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Cardholder Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: 'var(--radius-sm)',
                            background: 'rgba(0,0,0,0.2)',
                            border: errors.name ? '1px solid var(--error)' : '1px solid rgba(255,255,255,0.1)',
                            color: 'white',
                            outline: 'none'
                        }}
                    />
                    {errors.name && <span style={{ color: 'var(--error)', fontSize: '0.875rem' }}>{errors.name}</span>}
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Card Number</label>
                    <input
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleChange}
                        maxLength="19"
                        placeholder="0000 0000 0000 0000"
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: 'var(--radius-sm)',
                            background: 'rgba(0,0,0,0.2)',
                            border: errors.cardNumber ? '1px solid var(--error)' : '1px solid rgba(255,255,255,0.1)',
                            color: 'white',
                            outline: 'none',
                            fontFamily: 'monospace'
                        }}
                    />
                    {errors.cardNumber && <span style={{ color: 'var(--error)', fontSize: '0.875rem' }}>{errors.cardNumber}</span>}
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Expiry Date</label>
                        <input
                            type="text"
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleChange}
                            maxLength="5"
                            placeholder="MM/YY"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: 'var(--radius-sm)',
                                background: 'rgba(0,0,0,0.2)',
                                border: errors.expiryDate ? '1px solid var(--error)' : '1px solid rgba(255,255,255,0.1)',
                                color: 'white',
                                outline: 'none'
                            }}
                        />
                        {errors.expiryDate && <span style={{ color: 'var(--error)', fontSize: '0.875rem' }}>{errors.expiryDate}</span>}
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>CVV</label>
                        <input
                            type="password"
                            name="cvv"
                            value={formData.cvv}
                            onChange={handleChange}
                            maxLength="3"
                            placeholder="123"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: 'var(--radius-sm)',
                                background: 'rgba(0,0,0,0.2)',
                                border: errors.cvv ? '1px solid var(--error)' : '1px solid rgba(255,255,255,0.1)',
                                color: 'white',
                                outline: 'none'
                            }}
                        />
                        {errors.cvv && <span style={{ color: 'var(--error)', fontSize: '0.875rem' }}>{errors.cvv}</span>}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        type="button"
                        onClick={onCancel}
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: 'var(--text-muted)',
                            background: 'transparent'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isProcessing}
                        className="btn-primary"
                        style={{
                            flex: 2,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            opacity: isProcessing ? 0.7 : 1
                        }}
                    >
                        {isProcessing ? 'Processing...' : `Pay $${amount}`}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PaymentForm;
