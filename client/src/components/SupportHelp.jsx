import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { MessageCircle, HelpCircle, Book, Phone, Mail, Search, ChevronRight, ExternalLink, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import API_URL from '../config';

const SupportHelp = () => {
    const { user } = useAuth();
    const [activeSection, setActiveSection] = useState('faq');
    const [searchQuery, setSearchQuery] = useState('');
    const [contactForm, setContactForm] = useState({
        subject: '',
        message: '',
        priority: 'normal'
    });
    const [sending, setSending] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const isMobile = windowWidth < 768;

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const sections = [
        { id: 'faq', label: 'NEURAL_ANSWERS', icon: HelpCircle },
        { id: 'guides', label: 'OPERATIONAL_GUIDES', icon: Book },
        { id: 'contact', label: 'DIRECT_UPLINK', icon: MessageCircle }
    ];

    const faqs = user?.role === 'customer' ? [
        {
            category: 'BOOKING_PROTOCOLS',
            questions: [
                { q: 'How do I book a service?', a: 'Browse authorized experts, select your technician, choose the service module, and confirm. System will verify and establish connection.' },
                { q: 'Can I terminate a booking?', a: 'Yes, you can initialize termination before technician deployment. Post-acceptance termination requires neural support authorization.' },
                { q: 'How do I track my technician?', a: 'Once the mission is accepted, real-time telemetry will be available via the map interface with live coordinate updates.' }
            ]
        },
        {
            category: 'CREDENTIALS_&_PAYMENTS',
            questions: [
                { q: 'What payment methods are accepted?', a: 'We accept encrypted transactions via credit/debit cards, digital wallets, and universal credit protocols.' },
                { q: 'When is credit deducted?', a: 'Credits are finalized post-operation completion. A secure ledger receipt will be generated for your records.' },
                { q: 'How do credit reversals work?', a: 'Reversals are processed within 5-7 solar days to the original transaction node.' }
            ]
        }
    ] : [
        {
            category: 'MISSION_ACQUISITION',
            questions: [
                { q: 'How do I receive job requests?', a: 'Set your status to "ACTIVE" in the control center. You will receive priority dispatch notifications for local missions.' },
                { q: 'Can I decline a mission?', a: 'Yes, you can accept or bypass any request. Your mission success rate affects your authorization priority.' },
                { q: 'How do I update telemetry?', a: 'Telemetry is automated while your status is ACTIVE. Ensure all terminal permissions are granted.' }
            ]
        },
        {
            category: 'CREDIT_ALLOCATION',
            questions: [
                { q: 'When are credits disbursed?', a: 'Credits are allocated post-mission verification, typically within one solar cycle.' },
                { q: 'What are the platform protocols?', a: 'FixItNow standard protocol reserves a 20% service allocation for ongoing system maintenance.' },
                { q: 'How can I maximize allocation?', a: 'Maintain high trust scores, complete complex missions, and maintain high availability during peak cycles.' }
            ]
        }
    ];

    const guides = user?.role === 'customer' ? [
        { title: 'INITIALIZING_YOUR_FIRST_MISSION', duration: '3 MIN READ', link: '#' },
        { title: 'UNDERSTANDING_CREDIT_PROTOCOLS', duration: '5 MIN READ', link: '#' },
        { title: 'TELEMETRY_INTERFACE_MASTERY', duration: '4 MIN READ', link: '#' },
        { title: 'LEDGER_&_RECEIPT_MANAGEMENT', duration: '3 MIN READ', link: '#' }
    ] : [
        { title: 'TECHNICIAN_UNIT_ONBOARDING', duration: '5 MIN READ', link: '#' },
        { title: 'CREDIT_OPTIMIZATION_STRATEGIES', duration: '7 MIN READ', link: '#' },
        { title: 'MISSION_EFFICIENCY_HANDBOOK', duration: '6 MIN READ', link: '#' },
        { title: 'TRUST_SCORE_MECHANICS', duration: '4 MIN READ', link: '#' }
    ];

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        setSending(true);
        try {
            const res = await fetch(`${API_URL}/api/support/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    ...contactForm
                })
            });
            if (res.ok) {
                alert('COMMUNICATION_ESTABLISHED! Our team will respond within one solar cycle.');
                setContactForm({ subject: '', message: '', priority: 'normal' });
            }
        } catch (err) {
            console.error('Uplink failed:', err);
            alert('CRITICAL_ERROR: Communication uplink failed. Please retry.');
        } finally {
            setSending(false);
        }
    };

    const filteredFaqs = faqs.map(category => ({
        ...category,
        questions: category.questions.filter(q =>
            q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.a.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(category => category.questions.length > 0);

    return (
        <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '20px' : '0' }}>
            <div style={{ marginBottom: isMobile ? '2rem' : '4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: 'var(--accent)' }}>
                    <Shield size={20} />
                    <span style={{ fontSize: '0.8rem', fontWeight: '900', letterSpacing: '0.1em' }}>NEURAL_HUB_ACTIVE</span>
                </div>
                <h1 style={{ fontSize: isMobile ? '2rem' : '3.5rem', fontWeight: '900', letterSpacing: '-0.04em', marginBottom: '12px', lineHeight: 1 }}>SUPPORT_AND_MAINTENANCE</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: isMobile ? '0.9rem' : '1.1rem', fontWeight: '500' }}>Access system knowledge or establish a direct uplink with command.</p>
            </div>

            {/* Quick Actions Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: isMobile ? '2rem' : '4rem' }}>
                <motion.div
                    whileHover={!isMobile ? { y: -8 } : {}}
                    onClick={() => setActiveSection('contact')}
                    className="bento-card"
                    style={{
                        padding: isMobile ? '24px' : '32px',
                        background: 'var(--text)',
                        color: 'var(--bg)',
                        cursor: 'pointer',
                        borderRadius: '24px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                    }}
                >
                    <MessageCircle size={isMobile ? 32 : 40} style={{ marginBottom: '16px' }} />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '900', marginBottom: '8px' }}>LIVE_UPLINK</h3>
                    <p style={{ fontSize: '0.85rem', fontWeight: '600', opacity: 0.8 }}>Direct communication with tactical support.</p>
                </motion.div>

                <motion.div
                    whileHover={!isMobile ? { y: -8 } : {}}
                    className="bento-card glass"
                    style={{
                        padding: isMobile ? '24px' : '32px',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border)',
                        borderRadius: '24px'
                    }}
                >
                    <Phone size={isMobile ? 32 : 40} style={{ marginBottom: '16px', color: 'var(--text)' }} />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '900', marginBottom: '8px' }}>VOICE_CHANNEL</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>+1 (800) FIX-IT-NOW</p>
                </motion.div>

                <motion.div
                    whileHover={!isMobile ? { y: -8 } : {}}
                    className="bento-card glass"
                    style={{
                        padding: isMobile ? '24px' : '32px',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border)',
                        borderRadius: '24px'
                    }}
                >
                    <Mail size={isMobile ? 32 : 40} style={{ marginBottom: '16px', color: 'var(--text)' }} />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '900', marginBottom: '8px' }}>ENCRYPTED_MAIL</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>support@fixitnow.com</p>
                </motion.div>
            </div>

            {/* Section Tabs */}
            <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '32px',
                padding: '6px',
                background: 'var(--bg-secondary)',
                borderRadius: '16px',
                width: isMobile ? '100%' : 'fit-content',
                overflowX: isMobile ? 'auto' : 'visible',
                border: '1px solid var(--border)',
                scrollbarWidth: 'none'
            }}>
                {sections.map(section => {
                    const Icon = section.icon;
                    const isActive = activeSection === section.id;
                    return (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={isActive ? 'glass' : ''}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '12px 24px',
                                border: 'none',
                                background: isActive ? 'var(--text)' : 'transparent',
                                color: isActive ? 'var(--bg)' : 'var(--text-secondary)',
                                borderRadius: '14px',
                                fontSize: '0.8rem',
                                fontWeight: '900',
                                letterSpacing: '0.05em',
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                        >
                            <Icon size={16} />
                            {section.label}
                        </button>
                    );
                })}
            </div>

            {/* Content Area */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeSection}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                >
                    {/* FAQ Area */}
                    {activeSection === 'faq' && (
                        <div>
                            <div style={{ marginBottom: '32px', position: 'relative' }}>
                                <Search size={20} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', opacity: 0.5 }} />
                                <input
                                    type="text"
                                    placeholder="SEARCH_SYSTEM_KNOWLEDGE..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="input glass"
                                    style={{
                                        width: '100%',
                                        padding: isMobile ? '18px 18px 18px 52px' : '24px 24px 24px 64px',
                                        fontSize: isMobile ? '0.9rem' : '1.1rem',
                                        fontWeight: '600',
                                        background: 'var(--bg-secondary)',
                                        borderRadius: '18px'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '40px' }}>
                                {filteredFaqs.map((category, idx) => (
                                    <div key={idx} className="bento-card glass" style={{ padding: '32px', borderRadius: '32px', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                                        <h3 style={{ fontSize: '0.75rem', fontWeight: '900', color: 'var(--text-secondary)', marginBottom: '24px', letterSpacing: '0.1em' }}>{category.category}</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                            {category.questions.map((faq, qIdx) => (
                                                <details key={qIdx} style={{
                                                    background: 'var(--bg-tertiary)',
                                                    borderRadius: '20px',
                                                    overflow: 'hidden'
                                                }}>
                                                    <summary style={{
                                                        padding: '20px 24px',
                                                        fontWeight: '800',
                                                        fontSize: '0.95rem',
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        cursor: 'pointer',
                                                        listStyle: 'none'
                                                    }}>
                                                        <span>{faq.q.toUpperCase()}</span>
                                                        <ChevronRight size={18} />
                                                    </summary>
                                                    <div style={{
                                                        padding: '0 24px 24px',
                                                        color: 'var(--text-secondary)',
                                                        lineHeight: '1.6',
                                                        fontSize: '0.9rem',
                                                        fontWeight: '500'
                                                    }}>
                                                        {faq.a}
                                                    </div>
                                                </details>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Guides Area */}
                    {activeSection === 'guides' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                            {guides.map((guide, idx) => (
                                <motion.div
                                    key={idx}
                                    whileHover={{ y: -8, scale: 1.02 }}
                                    className="bento-card glass"
                                    style={{
                                        padding: '32px',
                                        background: 'var(--bg-secondary)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '32px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                        <div style={{ width: '48px', height: '48px', background: 'var(--text)', color: 'var(--bg)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Book size={24} />
                                        </div>
                                        <ExternalLink size={18} color="var(--text-secondary)" />
                                    </div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '900', marginBottom: '12px' }}>{guide.title}</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent)' }} />
                                        <span style={{ fontSize: '0.75rem', fontWeight: '900', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>{guide.duration}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* Contact Form Area */}
                    {activeSection === 'contact' && (
                        <div className="bento-card glass" style={{ maxWidth: '800px', margin: '0 auto', padding: isMobile ? '32px 20px' : '48px', borderRadius: isMobile ? '32px' : '40px', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                            <h3 style={{ fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: '900', marginBottom: '12px', letterSpacing: '-0.02em' }}>INITIATE_UPLINK</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '40px', fontWeight: '500' }}>
                                Deploy a secure communication channel to FixItNow command center.
                            </p>

                            <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px' }}>
                                    <div className="input-group">
                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '900', color: 'var(--text-secondary)', marginBottom: '12px', letterSpacing: '0.1em' }}>MODULE_SUBJECT</label>
                                        <input
                                            type="text"
                                            required
                                            value={contactForm.subject}
                                            onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                                            placeholder="NATURE_OF_INQUIRY..."
                                            className="input"
                                            style={{ background: 'var(--bg)', borderRadius: '14px', padding: '14px 18px' }}
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '900', color: 'var(--text-secondary)', marginBottom: '12px', letterSpacing: '0.1em' }}>PRIORITY_LEVEL</label>
                                        <select
                                            value={contactForm.priority}
                                            onChange={(e) => setContactForm({ ...contactForm, priority: e.target.value })}
                                            className="input"
                                            style={{ background: 'var(--bg)', borderRadius: '14px', padding: '14px 18px' }}
                                        >
                                            <option value="low">ROUTINE_INQUIRY</option>
                                            <option value="normal">STANDARD_ASSISTANCE</option>
                                            <option value="high">URGENT_DIRECTIVE</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '900', color: 'var(--text-secondary)', marginBottom: '12px', letterSpacing: '0.1em' }}>ENCRYPTED_MESSAGE_BODY</label>
                                    <textarea
                                        required
                                        value={contactForm.message}
                                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                                        rows={6}
                                        placeholder="PROVIDE_DETAIL_ON_MISSION_PARAMETERS_OR_SYSTEM_ERRORS..."
                                        className="input"
                                        style={{ background: 'var(--bg)', borderRadius: '24px', padding: '24px', resize: 'none' }}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={sending}
                                    className="btn btn-primary"
                                    style={{
                                        padding: '24px',
                                        borderRadius: '20px',
                                        fontSize: '1rem',
                                        fontWeight: '900',
                                        gap: '12px',
                                        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                                    }}
                                >
                                    <Send size={20} />
                                    {sending ? 'UPLINKING...' : 'INITIALIZE_TRANSMISSION'}
                                </button>
                            </form>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default SupportHelp;
