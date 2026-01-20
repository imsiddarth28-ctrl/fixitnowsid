import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, MapPin, Shield, Bell, Palette, Globe, Save, Camera, Edit2 } from 'lucide-react';
import { motion } from 'framer-motion';
import API_URL from '../config';

const ProfileSettings = () => {
    const { user, updateUser } = useAuth();
    const [activeSection, setActiveSection] = useState('profile');
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
        bio: user?.bio || '',
        notifications: {
            email: true,
            push: true,
            sms: false
        },
        privacy: {
            showPhone: true,
            showEmail: false,
            showLocation: true
        }
    });

    const sections = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'privacy', label: 'Privacy', icon: Shield },
        { id: 'appearance', label: 'Appearance', icon: Palette }
    ];

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`${API_URL}/api/users/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                const updated = await res.json();
                updateUser(updated);
                alert('Settings saved successfully!');
            }
        } catch (err) {
            console.error('Save failed:', err);
            alert('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{ display: 'flex', gap: '2rem', minHeight: '600px' }}>
            {/* Sidebar */}
            <div style={{ width: '250px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {sections.map(section => {
                    const Icon = section.icon;
                    return (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '1rem 1.5rem',
                                borderRadius: '0.75rem',
                                border: 'none',
                                background: activeSection === section.id ? 'var(--text)' : 'transparent',
                                color: activeSection === section.id ? 'var(--bg)' : 'var(--text)',
                                cursor: 'pointer',
                                fontSize: '0.95rem',
                                fontWeight: 600,
                                transition: 'all 0.2s ease',
                                textAlign: 'left'
                            }}
                            onMouseEnter={(e) => {
                                if (activeSection !== section.id) {
                                    e.target.style.background = 'var(--card)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (activeSection !== section.id) {
                                    e.target.style.background = 'transparent';
                                }
                            }}
                        >
                            <Icon size={20} />
                            {section.label}
                        </button>
                    );
                })}
            </div>

            {/* Main Content */}
            <div style={{ flex: 1 }}>
                <motion.div
                    key={activeSection}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {/* Profile Section */}
                    {activeSection === 'profile' && (
                        <div>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '0.5rem' }}>Profile Information</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Update your personal details and profile picture</p>

                            {/* Profile Picture */}
                            <div style={{ marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                    <div style={{ position: 'relative' }}>
                                        <div style={{
                                            width: '100px',
                                            height: '100px',
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '2.5rem',
                                            fontWeight: 900,
                                            color: 'white'
                                        }}>
                                            {user?.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <button style={{
                                            position: 'absolute',
                                            bottom: 0,
                                            right: 0,
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            background: 'var(--text)',
                                            color: 'var(--bg)',
                                            border: '2px solid var(--bg)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer'
                                        }}>
                                            <Camera size={16} />
                                        </button>
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.3rem' }}>{user?.name}</h3>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{user?.role === 'customer' ? 'Customer' : 'Technician'} Account</p>
                                    </div>
                                </div>
                            </div>

                            {/* Form Fields */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem 1rem',
                                            borderRadius: '0.5rem',
                                            border: '1px solid var(--border)',
                                            background: 'var(--card)',
                                            color: 'var(--text)',
                                            fontSize: '0.95rem'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={user?.email || ''}
                                        readOnly
                                        disabled
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem 1rem',
                                            borderRadius: '0.5rem',
                                            border: '1px solid var(--border)',
                                            background: 'rgba(128, 128, 128, 0.1)',
                                            color: 'var(--text-muted)',
                                            fontSize: '0.95rem',
                                            cursor: 'not-allowed',
                                            opacity: 0.7
                                        }}
                                        title="Email cannot be changed"
                                    />
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.3rem', fontStyle: 'italic' }}>
                                        Email cannot be changed for security reasons
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem 1rem',
                                            borderRadius: '0.5rem',
                                            border: '1px solid var(--border)',
                                            background: 'var(--card)',
                                            color: 'var(--text)',
                                            fontSize: '0.95rem'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                                        Location
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem 1rem',
                                            borderRadius: '0.5rem',
                                            border: '1px solid var(--border)',
                                            background: 'var(--card)',
                                            color: 'var(--text)',
                                            fontSize: '0.95rem'
                                        }}
                                    />
                                </div>
                            </div>

                            {user?.role === 'technician' && (
                                <div style={{ marginTop: '1.5rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                                        Professional Bio
                                    </label>
                                    <textarea
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        rows={4}
                                        placeholder="Tell customers about your experience and expertise..."
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem 1rem',
                                            borderRadius: '0.5rem',
                                            border: '1px solid var(--border)',
                                            background: 'var(--card)',
                                            color: 'var(--text)',
                                            fontSize: '0.95rem',
                                            resize: 'vertical',
                                            fontFamily: 'inherit'
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Notifications Section */}
                    {activeSection === 'notifications' && (
                        <div>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '0.5rem' }}>Notification Preferences</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Choose how you want to receive updates</p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {[
                                    { key: 'email', label: 'Email Notifications', desc: 'Receive updates via email' },
                                    { key: 'push', label: 'Push Notifications', desc: 'Get instant alerts in your browser' },
                                    { key: 'sms', label: 'SMS Notifications', desc: 'Receive text messages for important updates' }
                                ].map(notif => (
                                    <div key={notif.key} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '1.5rem',
                                        background: 'var(--card)',
                                        borderRadius: '0.75rem',
                                        border: '1px solid var(--border)'
                                    }}>
                                        <div>
                                            <div style={{ fontWeight: 700, marginBottom: '0.3rem' }}>{notif.label}</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{notif.desc}</div>
                                        </div>
                                        <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '26px' }}>
                                            <input
                                                type="checkbox"
                                                checked={formData.notifications[notif.key]}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    notifications: { ...formData.notifications, [notif.key]: e.target.checked }
                                                })}
                                                style={{ opacity: 0, width: 0, height: 0 }}
                                            />
                                            <span style={{
                                                position: 'absolute',
                                                cursor: 'pointer',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                bottom: 0,
                                                background: formData.notifications[notif.key] ? '#3b82f6' : '#ccc',
                                                transition: '0.4s',
                                                borderRadius: '26px'
                                            }}>
                                                <span style={{
                                                    position: 'absolute',
                                                    content: '',
                                                    height: '20px',
                                                    width: '20px',
                                                    left: formData.notifications[notif.key] ? '27px' : '3px',
                                                    bottom: '3px',
                                                    background: 'white',
                                                    transition: '0.4s',
                                                    borderRadius: '50%'
                                                }} />
                                            </span>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Privacy Section */}
                    {activeSection === 'privacy' && (
                        <div>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '0.5rem' }}>Privacy Settings</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Control what information is visible to others</p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {[
                                    { key: 'showPhone', label: 'Show Phone Number', desc: 'Display your phone number on your profile' },
                                    { key: 'showEmail', label: 'Show Email Address', desc: 'Make your email visible to others' },
                                    { key: 'showLocation', label: 'Show Location', desc: 'Display your location to nearby users' }
                                ].map(privacy => (
                                    <div key={privacy.key} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '1.5rem',
                                        background: 'var(--card)',
                                        borderRadius: '0.75rem',
                                        border: '1px solid var(--border)'
                                    }}>
                                        <div>
                                            <div style={{ fontWeight: 700, marginBottom: '0.3rem' }}>{privacy.label}</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{privacy.desc}</div>
                                        </div>
                                        <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '26px' }}>
                                            <input
                                                type="checkbox"
                                                checked={formData.privacy[privacy.key]}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    privacy: { ...formData.privacy, [privacy.key]: e.target.checked }
                                                })}
                                                style={{ opacity: 0, width: 0, height: 0 }}
                                            />
                                            <span style={{
                                                position: 'absolute',
                                                cursor: 'pointer',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                bottom: 0,
                                                background: formData.privacy[privacy.key] ? '#3b82f6' : '#ccc',
                                                transition: '0.4s',
                                                borderRadius: '26px'
                                            }}>
                                                <span style={{
                                                    position: 'absolute',
                                                    content: '',
                                                    height: '20px',
                                                    width: '20px',
                                                    left: formData.privacy[privacy.key] ? '27px' : '3px',
                                                    bottom: '3px',
                                                    background: 'white',
                                                    transition: '0.4s',
                                                    borderRadius: '50%'
                                                }} />
                                            </span>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Appearance Section */}
                    {activeSection === 'appearance' && (
                        <div>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '0.5rem' }}>Appearance</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Customize how FixItNow looks for you</p>

                            <div style={{
                                padding: '2rem',
                                background: 'var(--card)',
                                borderRadius: '0.75rem',
                                border: '1px solid var(--border)',
                                textAlign: 'center'
                            }}>
                                <Palette size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem' }}>Theme Customization</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    Advanced theme options coming soon! Toggle dark mode from the main navigation.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Save Button */}
                    <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            style={{
                                padding: '0.75rem 2rem',
                                borderRadius: '0.75rem',
                                border: 'none',
                                background: 'var(--text)',
                                color: 'var(--bg)',
                                fontWeight: 800,
                                fontSize: '0.95rem',
                                cursor: saving ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                opacity: saving ? 0.6 : 1
                            }}
                        >
                            <Save size={18} />
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ProfileSettings;
