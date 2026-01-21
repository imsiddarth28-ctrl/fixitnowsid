import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, MapPin, Shield, Bell, Palette, Globe, Save, Camera, Edit2, ChevronRight, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API_URL from '../config';

const ProfileSettings = () => {
    const { user, updateUser } = useAuth();
    const [activeSection, setActiveSection] = useState('profile');
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const isMobile = windowWidth < 1024;
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
        },
        experience: user?.experience || '',
        serviceType: user?.serviceType || ''
    });

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('CRITICAL_ERROR: INVALID_FILE_TYPE. Please select an authorized image.');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            alert('CRITICAL_ERROR: FILE_EXCEEDS_CAPACITY (MAX 2MB).');
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
            console.error('UPLINK_FAILURE:', err);
            alert('CRITICAL_ERROR: DATA_TRANSFER_FAILED.');
        } finally {
            setUploading(false);
        }
    };

    const sections = [
        { id: 'profile', label: 'IDENTITY_CORE', icon: User, desc: 'PERSONA_METRICS' },
        { id: 'notifications', label: 'ALERT_DISPATCH', icon: Bell, desc: 'REALTIME_PINGS' },
        { id: 'privacy', label: 'SECURITY_MASK', icon: Shield, desc: 'ENCRYPTION_LEVELS' },
        { id: 'appearance', label: 'VISUAL_ENGINE', icon: Palette, desc: 'UI_OVERRIDE_SPECS' }
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

            const endpoint = user.role === 'technician' ? `technician/${user.id}` : `user/${user.id}`;
            const res = await fetch(`${API_URL}/api/auth/profile/${endpoint}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    profilePhoto: profilePhoto || formData.profilePhoto
                })
            });
            if (res.ok) {
                const data = await res.json();
                const updatedUser = user.role === 'technician' ? data.technician : data.user;
                updateUser({ ...updatedUser, id: user.id }); // Preserve id if needed
                alert('SYNC_COMPLETE: Cloud identification ledger updated.');
            }
        } catch (err) {
            console.error('SYNC_ERROR:', err);
            alert('CRITICAL_ERROR: LEDGER_SYNC_FAILED.');
        } finally {
            setSaving(false);
        }
    };

    const Toggle = ({ checked, onChange }) => (
        <button
            onClick={() => onChange(!checked)}
            style={{
                width: '56px',
                height: '30px',
                borderRadius: '15px',
                background: checked ? 'var(--text)' : 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
                position: 'relative',
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                padding: 0
            }}
        >
            <motion.div
                animate={{ x: checked ? 28 : 2 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: checked ? 'var(--bg)' : 'var(--text-secondary)',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                    position: 'absolute',
                    top: '2px'
                }}
            />
        </button>
    );

    return (
        <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '24px' : '48px',
            alignItems: 'flex-start',
            maxWidth: '1200px',
            margin: '0 auto',
            padding: isMobile ? '10px' : '0'
        }}>
            {/* Sidebar Navigation */}
            <div style={{
                width: isMobile ? '100%' : '320px',
                display: 'flex',
                flexDirection: isMobile ? 'row' : 'column',
                gap: '12px',
                position: isMobile ? 'relative' : 'sticky',
                top: isMobile ? '0' : '24px',
                overflowX: isMobile ? 'auto' : 'visible',
                paddingBottom: isMobile ? '12px' : '0',
                scrollbarWidth: 'none'
            }}>
                {!isMobile && (
                    <div style={{ marginBottom: '24px', paddingLeft: '20px' }}>
                        <h3 style={{ fontSize: '0.75rem', fontWeight: '900', color: 'var(--text-secondary)', letterSpacing: '0.2em' }}>COMMAND_MODULES</h3>
                    </div>
                )}
                {sections.map(section => {
                    const Icon = section.icon;
                    const isActive = activeSection === section.id;
                    return (
                        <motion.button
                            key={section.id}
                            whileHover={{ x: 8 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setActiveSection(section.id)}
                            className={isActive ? 'glass' : ''}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: isMobile ? '12px' : '20px',
                                padding: isMobile ? '12px 16px' : '20px 24px',
                                borderRadius: isMobile ? '16px' : '24px',
                                border: '1px solid',
                                borderColor: isActive ? 'var(--border)' : 'transparent',
                                background: isActive ? 'var(--bg-secondary)' : 'transparent',
                                color: isActive ? 'var(--text)' : 'var(--text-secondary)',
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                textAlign: 'left',
                                whiteSpace: isMobile ? 'nowrap' : 'normal'
                            }}
                        >
                            <div style={{
                                width: isMobile ? '32px' : '48px',
                                height: isMobile ? '32px' : '48px',
                                borderRadius: isMobile ? '10px' : '16px',
                                background: isActive ? 'var(--text)' : 'var(--bg-tertiary)',
                                color: isActive ? 'var(--bg)' : 'var(--text-secondary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.3s'
                            }}>
                                <Icon size={isMobile ? 16 : 22} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: '900', fontSize: isMobile ? '0.8rem' : '1rem', letterSpacing: '-0.01em' }}>{section.label}</div>
                                {!isMobile && <div style={{ fontSize: '0.7rem', fontWeight: '700', opacity: 0.5, letterSpacing: '0.05em' }}>{section.desc}</div>}
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            {/* Main Content Area */}
            <div style={{ width: '100%', flex: 1, minHeight: isMobile ? 'auto' : '600px' }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeSection}
                        initial={{ opacity: 0, scale: 0.98, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: -10 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="bento-card glass"
                        style={{ padding: isMobile ? '32px 20px' : '64px', borderRadius: isMobile ? '32px' : '48px', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
                    >
                        {/* Profile Module */}
                        {activeSection === 'profile' && (
                            <div>
                                <div style={{ marginBottom: '48px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: 'var(--accent)' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 10px var(--accent)' }} />
                                        <span style={{ fontSize: '0.75rem', fontWeight: '900', letterSpacing: '0.1em' }}>LEDGER_SYNC_READY</span>
                                    </div>
                                    <h2 style={{ fontSize: isMobile ? '1.75rem' : '3rem', fontWeight: '900', marginBottom: '12px', letterSpacing: '-0.05em' }}>IDENTITY_CORE</h2>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: isMobile ? '0.9rem' : '1.1rem', fontWeight: '500' }}>Manage your unit persona and encrypted identification metrics.</p>
                                </div>

                                {/* Avatar Management */}
                                <div style={{ marginBottom: isMobile ? '40px' : '64px', display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? '24px' : '40px' }}>
                                    <div style={{ position: 'relative' }}>
                                        <div style={{
                                            width: '140px',
                                            height: '140px',
                                            borderRadius: '48px',
                                            overflow: 'hidden',
                                            border: '4px solid var(--bg-tertiary)',
                                            background: 'var(--bg-secondary)',
                                            boxShadow: '0 24px 48px rgba(0,0,0,0.2)'
                                        }}>
                                            {profilePhoto || user?.profilePhoto ? (
                                                <img
                                                    src={profilePhoto || user?.profilePhoto}
                                                    alt="SECURE_ID"
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <div style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '4rem',
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
                                            id="ledger-photo-uplink"
                                        />
                                        <motion.label
                                            whileHover={{ scale: 1.1, rotate: 90 }}
                                            whileTap={{ scale: 0.9 }}
                                            htmlFor="ledger-photo-uplink"
                                            style={{
                                                position: 'absolute',
                                                bottom: '-12px',
                                                right: '-12px',
                                                width: '56px',
                                                height: '56px',
                                                borderRadius: '20px',
                                                background: 'var(--text)',
                                                color: 'var(--bg)',
                                                border: '4px solid var(--bg)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: uploading ? 'not-allowed' : 'pointer',
                                                boxShadow: '0 12px 24px rgba(0,0,0,0.2)'
                                            }}
                                        >
                                            {uploading ? '...' : <Camera size={24} />}
                                        </motion.label>
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '8px', letterSpacing: '-0.02em' }}>{user?.name.toUpperCase()}</h3>
                                        <div style={{
                                            display: 'inline-flex',
                                            gap: '12px',
                                            alignItems: 'center',
                                            padding: '8px 20px',
                                            background: 'var(--bg-secondary)',
                                            border: '1px solid var(--border)',
                                            borderRadius: '12px',
                                            fontSize: '0.8rem',
                                            fontWeight: '900',
                                            color: 'var(--text)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.1em'
                                        }}>
                                            <Shield size={14} />
                                            {user?.role === 'customer' ? 'AUTHORIZED_CLIENT_UNIT' : 'VERIFIED_TACTICAL_ASSET'}
                                        </div>
                                    </div>
                                </div>

                                {/* Secure Input Fields */}
                                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '20px' : '32px' }}>
                                    <div className="input-group">
                                        <label className="input-label">UNIT_NAME_MANIFEST</label>
                                        <div style={{ position: 'relative' }}>
                                            <User size={20} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="input"
                                                style={{ paddingLeft: '56px', background: 'var(--bg)', borderRadius: '20px' }}
                                            />
                                        </div>
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">ENCRYPTED_COMMS_NODE</label>
                                        <div style={{ position: 'relative' }}>
                                            <Mail size={20} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                                            <input
                                                readOnly
                                                value={user?.email || ''}
                                                className="input"
                                                style={{ paddingLeft: '56px', opacity: 0.6, cursor: 'not-allowed', background: 'var(--bg-tertiary)', borderRadius: '20px' }}
                                            />
                                        </div>
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">MOBILE_UPLINK_PROTOCOL</label>
                                        <div style={{ position: 'relative' }}>
                                            <Phone size={20} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="input"
                                                style={{ paddingLeft: '56px', background: 'var(--bg)', borderRadius: '20px' }}
                                            />
                                        </div>
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">PRIMARY_BASE_COORDINATES</label>
                                        <div style={{ position: 'relative' }}>
                                            <MapPin size={20} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                                            <input
                                                type="text"
                                                value={formData.address}
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                className="input"
                                                style={{ paddingLeft: '56px', background: 'var(--bg)', borderRadius: '20px' }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {user?.role === 'technician' && (
                                    <>
                                        <div className="input-group">
                                            <label className="input-label">EXPERIENCE_LOG_LENGTH</label>
                                            <input
                                                type="text"
                                                value={formData.experience}
                                                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                                placeholder="e.g. 5+ Years"
                                                className="input"
                                                style={{ background: 'var(--bg)', borderRadius: '20px' }}
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label className="input-label">MISSION_SPECIALIZATION</label>
                                            <select
                                                value={formData.serviceType}
                                                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                                                className="input"
                                                style={{ background: 'var(--bg)', borderRadius: '20px' }}
                                            >
                                                <option value="Plumber">Plumber</option>
                                                <option value="Electrician">Electrician</option>
                                                <option value="Cleaning">Cleaning</option>
                                                <option value="Carpenter">Carpenter</option>
                                                <option value="HVAC">HVAC</option>
                                            </select>
                                        </div>
                                        <div className="input-group" style={{ gridColumn: 'span 2' }}>
                                            <label className="input-label">OPERATIONAL_MANIFESTO</label>
                                            <textarea
                                                value={formData.bio}
                                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                                className="input"
                                                rows={5}
                                                placeholder="DECLARE_UNIT_CAPABILITIES_FOR_THE_NETWORK..."
                                                style={{ minHeight: '160px', padding: '24px', resize: 'none', background: 'var(--bg)', borderRadius: '24px' }}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Alert Dispatch Module */}
                        {activeSection === 'notifications' && (
                            <div>
                                <div style={{ marginBottom: '48px' }}>
                                    <h2 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '12px', letterSpacing: '-0.05em' }}>ALERT_DISPATCH</h2>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', fontWeight: '500' }}>Configure mission telemetry and system status broadcasts.</p>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    {[
                                        { key: 'email', label: 'EMAIL_LEDGER_SYNC', desc: 'Secure operational documentation and logs' },
                                        { key: 'push', label: 'PUSH_TELEMETRY_LINK', desc: 'Instant tactical pings and updates' },
                                        { key: 'sms', label: 'MOBILE_SMS_RECOVERY', desc: 'Fail-safe backup communication channel' }
                                    ].map(notif => (
                                        <div key={notif.key} className="bento-card" style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '32px 40px',
                                            borderRadius: '32px',
                                            background: 'var(--bg-tertiary)',
                                            border: '1px solid var(--border)'
                                        }}>
                                            <div>
                                                <div style={{ fontWeight: '900', fontSize: '1.25rem', letterSpacing: '-0.01em' }}>{notif.label}</div>
                                                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '600', marginTop: '4px' }}>{notif.desc}</div>
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

                        {/* Security Mask Module */}
                        {activeSection === 'privacy' && (
                            <div>
                                <div style={{ marginBottom: '48px' }}>
                                    <h2 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '12px', letterSpacing: '-0.05em' }}>SECURITY_MASK</h2>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', fontWeight: '500' }}>Control persistent data visibility across the decentralized network.</p>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    {[
                                        { key: 'showPhone', label: 'PHONE_VISIBILITY_OVERRIDE', desc: 'Reveal unit contact channel to verified peers' },
                                        { key: 'showEmail', label: 'EMAIL_NODE_BROADCAST', desc: 'Expose secure email to high-trust assets' },
                                        { key: 'showLocation', label: 'SPATIAL_COORDINATE_TRANSMISSION', desc: 'Stream live location for optimal match-making' }
                                    ].map(privacy => (
                                        <div key={privacy.key} className="bento-card" style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '32px 40px',
                                            borderRadius: '32px',
                                            background: 'var(--bg-tertiary)',
                                            border: '1px solid var(--border)'
                                        }}>
                                            <div>
                                                <div style={{ fontWeight: '900', fontSize: '1.25rem', letterSpacing: '-0.01em' }}>{privacy.label}</div>
                                                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '600', marginTop: '4px' }}>{privacy.desc}</div>
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

                        {/* Visual Engine Module */}
                        {activeSection === 'appearance' && (
                            <div style={{ textAlign: 'center', padding: '80px 0' }}>
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                                    style={{ margin: '0 auto 40px', width: '80px', height: '80px', opacity: 0.2 }}
                                >
                                    <Palette size={80} />
                                </motion.div>
                                <h2 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '20px', letterSpacing: '-0.05em' }}>VISUAL_ENGINE_LOCKED</h2>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '500px', margin: '0 auto 48px', fontWeight: '500' }}>
                                    The PREMIUM_MOD_v4.0 interface is currently hardcoded and optimized for peak performance. Theme toggling is restricted.
                                </p>
                                <div style={{ padding: '32px 48px', background: 'var(--bg-tertiary)', borderRadius: '32px', border: '1px solid var(--border)', display: 'inline-block' }}>
                                    <div style={{ fontSize: '0.8rem', fontWeight: '900', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '8px' }}>ACTIVE_CORE_SKIN</div>
                                    <div style={{ fontSize: '1.75rem', fontWeight: '900', color: 'var(--text)' }}>HI_DEFINITION_GLASS_v2</div>
                                </div>
                            </div>
                        )}

                        {/* Final Sync Action Bar */}
                        {activeSection !== 'appearance' && (
                            <div style={{ marginTop: '64px', display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '20px', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '48px' }}>
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
                                    style={{ padding: '20px 40px', borderRadius: '20px', fontWeight: '900' }}
                                >
                                    TERMINATE_CHANGES
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="btn btn-primary"
                                    style={{ padding: '20px 48px', borderRadius: '20px', fontWeight: '900', display: 'flex', gap: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                                >
                                    {saving ? (
                                        <>
                                            <Activity size={20} className="animate-pulse" />
                                            <span>SYNCING_DATA...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save size={20} />
                                            <span>INITIALIZE_LEDGER_SYNC</span>
                                        </>
                                    )}
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
