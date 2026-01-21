import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, MapPin, Shield, Bell, Palette, Globe, Save, Camera, Edit2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API_URL from '../config';

const ProfileSettings = () => {
    const { user, updateUser } = useAuth();
    const [activeSection, setActiveSection] = useState('profile');
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [profilePhoto, setProfilePhoto] = useState(user?.profilePhoto || null);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
        bio: user?.bio || '',
        profilePhoto: user?.profilePhoto || null,
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

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            alert('Image size should be less than 2MB');
            return;
        }

        setUploading(true);
        try {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                setProfilePhoto(base64String);
                setFormData({ ...formData, profilePhoto: base64String });
            };
            reader.readAsDataURL(file);
        } catch (err) {
            console.error('Upload failed:', err);
            alert('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const sections = [
        { id: 'profile', label: 'Identity', icon: User, desc: 'Personal credentials' },
        { id: 'notifications', label: 'Alerts', icon: Bell, desc: 'System notifications' },
        { id: 'privacy', label: 'Security', icon: Shield, desc: 'Privacy controls' },
        { id: 'appearance', label: 'Visuals', icon: Palette, desc: 'UI personalization' }
    ];

    const handleSave = async () => {
        setSaving(true);
        try {
            updateUser({
                name: formData.name,
                phone: formData.phone,
                address: formData.address,
                bio: formData.bio,
                profilePhoto: profilePhoto || formData.profilePhoto
            });

            const res = await fetch(`${API_URL}/api/users/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    profilePhoto: profilePhoto || formData.profilePhoto
                })
            });
            if (res.ok) {
                const updated = await res.json();
                updateUser(updated);
            }
        } catch (err) {
            console.error('Save failed:', err);
        } finally {
            setSaving(false);
        }
    };

    const Toggle = ({ checked, onChange }) => (
        <button
            onClick={() => onChange(!checked)}
            style={{
                width: '44px',
                height: '24px',
                borderRadius: '12px',
                background: checked ? 'var(--text)' : 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
                position: 'relative',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                padding: 0
            }}
        >
            <motion.div
                animate={{ x: checked ? 22 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: checked ? 'var(--bg)' : 'var(--text-secondary)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
            />
        </button>
    );

    return (
        <div style={{ display: 'flex', gap: '48px', alignItems: 'flex-start' }}>
            {/* Sidebar */}
            <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '8px', position: 'sticky', top: '24px' }}>
                {sections.map(section => {
                    const Icon = section.icon;
                    const isActive = activeSection === section.id;
                    return (
                        <motion.button
                            key={section.id}
                            whileHover={{ x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setActiveSection(section.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                                padding: '16px 20px',
                                borderRadius: '16px',
                                border: '1px solid',
                                borderColor: isActive ? 'var(--border)' : 'transparent',
                                background: isActive ? 'var(--bg-secondary)' : 'transparent',
                                color: isActive ? 'var(--text)' : 'var(--text-secondary)',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                textAlign: 'left',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '12px',
                                background: isActive ? 'var(--text)' : 'var(--bg-tertiary)',
                                color: isActive ? 'var(--bg)' : 'var(--text-secondary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.3s ease'
                            }}>
                                <Icon size={20} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: '800', fontSize: '0.95rem' }}>{section.label}</div>
                                <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{section.desc}</div>
                            </div>
                            {isActive && <ChevronRight size={16} style={{ opacity: 0.4 }} />}
                        </motion.button>
                    );
                })}
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, minHeight: '600px' }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeSection}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="bento-card"
                        style={{ padding: '48px', border: '1px solid var(--border)', borderRadius: '32px' }}
                    >
                        {/* Profile Section */}
                        {activeSection === 'profile' && (
                            <div>
                                <div style={{ marginBottom: '40px' }}>
                                    <h2 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '8px', letterSpacing: '-0.04em' }}>IDENTITY CORE</h2>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: '500' }}>Manage your persona and digital identification metrics.</p>
                                </div>

                                {/* Profile Picture */}
                                <div style={{ marginBottom: '48px', display: 'flex', alignItems: 'center', gap: '32px' }}>
                                    <div style={{ position: 'relative' }}>
                                        <div style={{
                                            width: '120px',
                                            height: '120px',
                                            borderRadius: '40px',
                                            overflow: 'hidden',
                                            border: '4px solid var(--bg-tertiary)',
                                            background: 'var(--bg-secondary)',
                                            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                                        }}>
                                            {profilePhoto || user?.profilePhoto ? (
                                                <img
                                                    src={profilePhoto || user?.profilePhoto}
                                                    alt="Profile"
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <div style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '3rem',
                                                    fontWeight: '900',
                                                    color: 'var(--text)',
                                                    background: 'var(--bg-tertiary)'
                                                }}>
                                                    {user?.name?.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handlePhotoUpload}
                                            style={{ display: 'none' }}
                                            id="profile-photo-upload"
                                        />
                                        <motion.label
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            htmlFor="profile-photo-upload"
                                            style={{
                                                position: 'absolute',
                                                bottom: '-8px',
                                                right: '-8px',
                                                width: '44px',
                                                height: '44px',
                                                borderRadius: '16px',
                                                background: 'var(--text)',
                                                color: 'var(--bg)',
                                                border: '4px solid var(--bg)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: uploading ? 'not-allowed' : 'pointer',
                                                boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                                            }}
                                        >
                                            {uploading ? '...' : <Camera size={20} />}
                                        </motion.label>
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '4px' }}>{user?.name}</h3>
                                        <div style={{
                                            display: 'inline-flex',
                                            gap: '8px',
                                            alignItems: 'center',
                                            padding: '4px 12px',
                                            background: 'var(--bg-tertiary)',
                                            borderRadius: '8px',
                                            fontSize: '0.75rem',
                                            fontWeight: '800',
                                            color: 'var(--text-secondary)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em'
                                        }}>
                                            <Shield size={12} />
                                            {user?.role === 'customer' ? 'Authorized Client' : 'Verified Professional'}
                                        </div>
                                    </div>
                                </div>

                                {/* Form Fields */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                    <div className="input-group">
                                        <label className="input-label">FULL NAME</label>
                                        <div style={{ position: 'relative' }}>
                                            <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="input"
                                                style={{ paddingLeft: '48px' }}
                                            />
                                        </div>
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">SECURE EMAIL</label>
                                        <div style={{ position: 'relative' }}>
                                            <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                                            <input
                                                readOnly
                                                value={user?.email || ''}
                                                className="input"
                                                style={{ paddingLeft: '48px', opacity: 0.6, cursor: 'not-allowed', background: 'var(--bg-tertiary)' }}
                                            />
                                        </div>
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">CONTACT CHANNEL</label>
                                        <div style={{ position: 'relative' }}>
                                            <Phone size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="input"
                                                style={{ paddingLeft: '48px' }}
                                            />
                                        </div>
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">PRIMARY COORDINATES</label>
                                        <div style={{ position: 'relative' }}>
                                            <MapPin size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                                            <input
                                                type="text"
                                                value={formData.address}
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                className="input"
                                                style={{ paddingLeft: '48px' }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {user?.role === 'technician' && (
                                    <div className="input-group" style={{ marginTop: '24px' }}>
                                        <label className="input-label">PROFESSIONAL MANIFESTO</label>
                                        <textarea
                                            value={formData.bio}
                                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                            className="input"
                                            rows={4}
                                            placeholder="Define your expertise for the network..."
                                            style={{ minHeight: '120px', padding: '16px', resize: 'none' }}
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Notifications Section */}
                        {activeSection === 'notifications' && (
                            <div>
                                <div style={{ marginBottom: '40px' }}>
                                    <h2 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '8px', letterSpacing: '-0.04em' }}>ALERT DISPATCH</h2>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: '500' }}>Configure real-time information flow and system triggers.</p>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {[
                                        { key: 'email', label: 'EMAIL VECTOR', desc: 'Secure correspondence and logs' },
                                        { key: 'push', label: 'PUSH URGENCY', desc: 'Critical system pings and updates' },
                                        { key: 'sms', label: 'SMS BACKUP', desc: 'Secondary communication pipeline' }
                                    ].map(notif => (
                                        <div key={notif.key} className="glass" style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '24px 32px',
                                            borderRadius: '24px',
                                            background: 'var(--bg-secondary)',
                                            border: '1px solid var(--border)'
                                        }}>
                                            <div>
                                                <div style={{ fontWeight: '900', fontSize: '1rem', letterSpacing: '0.05em' }}>{notif.label}</div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>{notif.desc}</div>
                                            </div>
                                            <Toggle
                                                checked={formData.notifications[notif.key]}
                                                onChange={(val) => setFormData({
                                                    ...formData,
                                                    notifications: { ...formData.notifications, [notif.key]: val }
                                                })}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Privacy Section */}
                        {activeSection === 'privacy' && (
                            <div>
                                <div style={{ marginBottom: '40px' }}>
                                    <h2 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '8px', letterSpacing: '-0.04em' }}>SECURITY MASKING</h2>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: '500' }}>Control data visibility across the platform network.</p>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {[
                                        { key: 'showPhone', label: 'TELEPHONY ACCESS', desc: 'Allow contacts to view your phone' },
                                        { key: 'showEmail', label: 'COMMUNICATIONS', desc: 'Reveal email to verified network members' },
                                        { key: 'showLocation', label: 'SPATIAL TRACKING', desc: 'Broadcast location for nearby matching' }
                                    ].map(privacy => (
                                        <div key={privacy.key} className="glass" style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '24px 32px',
                                            borderRadius: '24px',
                                            background: 'var(--bg-secondary)',
                                            border: '1px solid var(--border)'
                                        }}>
                                            <div>
                                                <div style={{ fontWeight: '900', fontSize: '1rem', letterSpacing: '0.05em' }}>{privacy.label}</div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>{privacy.desc}</div>
                                            </div>
                                            <Toggle
                                                checked={formData.privacy[privacy.key]}
                                                onChange={(val) => setFormData({
                                                    ...formData,
                                                    privacy: { ...formData.privacy, [privacy.key]: val }
                                                })}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Appearance Section */}
                        {activeSection === 'appearance' && (
                            <div style={{ textAlign: 'center', padding: '64px 0' }}>
                                <Palette size={64} style={{ margin: '0 auto 24px', opacity: 0.2 }} />
                                <h2 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '16px', letterSpacing: '-0.04em' }}>VISUAL OVERRIDE</h2>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '400px', margin: '0 auto 32px' }}>
                                    The new design system is currently active in High-Definition mode. Advanced theme shifting is locked in the current build.
                                </p>
                                <div style={{ padding: '24px', background: 'var(--bg-tertiary)', borderRadius: '24px', display: 'inline-block' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: '900', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>CURRENT ENGINE</div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--text)' }}>PREMIUM_ULTRA_v2.0</div>
                                </div>
                            </div>
                        )}

                        {/* Save Action */}
                        {activeSection !== 'appearance' && (
                            <div style={{ marginTop: '48px', display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={() => {
                                        setFormData({
                                            ...formData,
                                            name: user?.name || '',
                                            phone: user?.phone || '',
                                            address: user?.address || '',
                                            bio: user?.bio || ''
                                        });
                                        setProfilePhoto(user?.profilePhoto || null);
                                    }}
                                    className="btn btn-secondary"
                                    style={{ padding: '16px 32px' }}
                                >
                                    ABORT
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="btn btn-primary"
                                    style={{ padding: '16px 40px', display: 'flex', gap: '12px' }}
                                >
                                    <Save size={20} />
                                    {saving ? 'SYNCING...' : 'INITIALIZE SYNC'}
                                </button>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ProfileSettings;
