import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, User, Mail, Phone, MapPin, Edit2, Save, X } from 'lucide-react';
import API_URL from '../config';

const ProfileSettings = () => {
    const { user, login } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        address: user?.address || '',
        bio: user?.bio || '',
        profilePhoto: user?.profilePhoto || ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert('Image size should be less than 2MB');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, profilePhoto: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const endpoint = user.role === 'technician'
                ? `/api/auth/profile/technician/${user.id}`
                : `/api/auth/profile/user/${user.id}`;

            const res = await fetch(`${API_URL}${endpoint}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                // Update localStorage with new user data
                const updatedUser = { ...user, ...formData };
                localStorage.setItem('user', JSON.stringify(updatedUser));

                setSuccessMessage('Profile updated successfully! ✓');
                setIsEditing(false);

                // Re-login to update context
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                alert(data.message || 'Failed to update profile');
            }
        } catch (err) {
            console.error(err);
            alert('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 0' }}>
            {/* Success Message */}
            <AnimatePresence>
                {successMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        style={{
                            position: 'fixed',
                            top: '2rem',
                            right: '2rem',
                            background: '#22c55e',
                            color: 'white',
                            padding: '1rem 2rem',
                            borderRadius: '0.75rem',
                            boxShadow: '0 10px 30px rgba(34, 197, 94, 0.3)',
                            zIndex: 10000,
                            fontWeight: 700
                        }}
                    >
                        {successMessage}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 900, margin: 0, marginBottom: '0.5rem' }}>Profile Settings</h2>
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>Manage your personal information and preferences</p>
                </div>

                {!isEditing ? (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsEditing(true)}
                        style={{
                            background: 'var(--text)',
                            color: 'var(--bg)',
                            border: 'none',
                            borderRadius: '0.75rem',
                            padding: '0.875rem 1.5rem',
                            fontWeight: 700,
                            fontSize: '0.95rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <Edit2 size={18} /> Edit Profile
                    </motion.button>
                ) : (
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                setIsEditing(false);
                                setFormData({
                                    name: user?.name || '',
                                    phone: user?.phone || '',
                                    address: user?.address || '',
                                    bio: user?.bio || '',
                                    profilePhoto: user?.profilePhoto || ''
                                });
                            }}
                            style={{
                                background: 'transparent',
                                color: 'var(--text)',
                                border: '1px solid var(--border)',
                                borderRadius: '0.75rem',
                                padding: '0.875rem 1.5rem',
                                fontWeight: 700,
                                fontSize: '0.95rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <X size={18} /> Cancel
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSave}
                            disabled={loading}
                            style={{
                                background: loading ? 'var(--text-muted)' : '#22c55e',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.75rem',
                                padding: '0.875rem 1.5rem',
                                fontWeight: 700,
                                fontSize: '0.95rem',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <Save size={18} /> {loading ? 'Saving...' : 'Save Changes'}
                        </motion.button>
                    </div>
                )}
            </div>

            {/* Profile Card */}
            <motion.div
                layout
                style={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '1.5rem',
                    padding: '2.5rem',
                    marginBottom: '2rem'
                }}
            >
                {/* Profile Photo Section */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2.5rem' }}>
                    <motion.div
                        whileHover={isEditing ? { scale: 1.05 } : {}}
                        style={{
                            position: 'relative',
                            marginBottom: '1.5rem'
                        }}
                    >
                        <div style={{
                            width: '120px',
                            height: '120px',
                            borderRadius: '50%',
                            background: formData.profilePhoto
                                ? `url(${formData.profilePhoto}) center/cover`
                                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: '4px solid var(--border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2.5rem',
                            fontWeight: 900,
                            color: 'white',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            {!formData.profilePhoto && getInitials(formData.name)}
                        </div>

                        {isEditing && (
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    right: 0,
                                    background: 'var(--text)',
                                    color: 'var(--bg)',
                                    border: '3px solid var(--bg)',
                                    borderRadius: '50%',
                                    width: '40px',
                                    height: '40px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer'
                                }}
                            >
                                <Camera size={20} />
                            </motion.button>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            style={{ display: 'none' }}
                        />
                    </motion.div>

                    {isEditing && (
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                            Click the camera icon to upload a new photo (max 2MB)
                        </p>
                    )}
                </div>

                {/* Form Fields */}
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {/* Name */}
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                            <User size={16} /> FULL NAME
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            disabled={!isEditing}
                            style={{
                                width: '100%',
                                padding: '1rem 1.25rem',
                                borderRadius: '0.75rem',
                                border: '1px solid var(--border)',
                                background: isEditing ? 'var(--bg)' : 'var(--card)',
                                fontSize: '1rem',
                                fontWeight: 600,
                                outline: 'none',
                                color: 'var(--text)',
                                transition: 'all 0.2s ease'
                            }}
                            onFocus={(e) => isEditing && (e.target.style.borderColor = 'var(--text)')}
                            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                        />
                    </div>

                    {/* Email (Read-only) */}
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                            <Mail size={16} /> EMAIL ADDRESS
                        </label>
                        <input
                            type="email"
                            value={user?.email || ''}
                            disabled
                            style={{
                                width: '100%',
                                padding: '1rem 1.25rem',
                                borderRadius: '0.75rem',
                                border: '1px solid var(--border)',
                                background: 'var(--card)',
                                fontSize: '1rem',
                                fontWeight: 600,
                                outline: 'none',
                                color: 'var(--text-muted)',
                                opacity: 0.7
                            }}
                        />
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem', marginLeft: '0.25rem' }}>
                            Email cannot be changed for security reasons
                        </p>
                    </div>

                    {/* Phone */}
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                            <Phone size={16} /> PHONE NUMBER
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            disabled={!isEditing}
                            style={{
                                width: '100%',
                                padding: '1rem 1.25rem',
                                borderRadius: '0.75rem',
                                border: '1px solid var(--border)',
                                background: isEditing ? 'var(--bg)' : 'var(--card)',
                                fontSize: '1rem',
                                fontWeight: 600,
                                outline: 'none',
                                color: 'var(--text)',
                                transition: 'all 0.2s ease'
                            }}
                            onFocus={(e) => isEditing && (e.target.style.borderColor = 'var(--text)')}
                            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                        />
                    </div>

                    {/* Address */}
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                            <MapPin size={16} /> ADDRESS
                        </label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            disabled={!isEditing}
                            placeholder="Your home or business address"
                            style={{
                                width: '100%',
                                padding: '1rem 1.25rem',
                                borderRadius: '0.75rem',
                                border: '1px solid var(--border)',
                                background: isEditing ? 'var(--bg)' : 'var(--card)',
                                fontSize: '1rem',
                                fontWeight: 600,
                                outline: 'none',
                                color: 'var(--text)',
                                transition: 'all 0.2s ease'
                            }}
                            onFocus={(e) => isEditing && (e.target.style.borderColor = 'var(--text)')}
                            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                        />
                    </div>

                    {/* Bio */}
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                            BIO
                        </label>
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            disabled={!isEditing}
                            placeholder="Tell us a bit about yourself..."
                            rows={4}
                            style={{
                                width: '100%',
                                padding: '1rem 1.25rem',
                                borderRadius: '0.75rem',
                                border: '1px solid var(--border)',
                                background: isEditing ? 'var(--bg)' : 'var(--card)',
                                fontSize: '1rem',
                                fontWeight: 600,
                                outline: 'none',
                                color: 'var(--text)',
                                resize: 'vertical',
                                fontFamily: 'inherit',
                                transition: 'all 0.2s ease'
                            }}
                            onFocus={(e) => isEditing && (e.target.style.borderColor = 'var(--text)')}
                            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                        />
                    </div>
                </div>
            </motion.div>

            {/* Account Info Card */}
            <motion.div
                style={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '1.5rem',
                    padding: '2rem',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1.5rem'
                }}
            >
                <div>
                    <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>ACCOUNT TYPE</p>
                    <p style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, textTransform: 'capitalize' }}>{user?.role}</p>
                </div>
                <div>
                    <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>MEMBER SINCE</p>
                    <p style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
                        {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </p>
                </div>
                <div>
                    <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>USER ID</p>
                    <p style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                        #{user?.id?.slice(-8).toUpperCase()}
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default ProfileSettings;
