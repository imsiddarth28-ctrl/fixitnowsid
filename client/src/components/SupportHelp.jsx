import { useState } from 'react';
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

    const sections = [
        { id: 'faq', label: 'FAQs', icon: HelpCircle },
        { id: 'guides', label: 'Guides', icon: Book },
        { id: 'contact', label: 'Contact Us', icon: MessageCircle }
    ];

    const faqs = user?.role === 'customer' ? [
        {
            category: 'Booking',
            questions: [
                { q: 'How do I book a service?', a: 'Browse available technicians, select one, choose your service type, and confirm booking. You\'ll receive instant confirmation.' },
                { q: 'Can I cancel a booking?', a: 'Yes, you can cancel before the technician accepts. Once accepted, contact support for cancellation.' },
                { q: 'How do I track my technician?', a: 'Once your booking is accepted, you\'ll see real-time tracking on the map with live location updates.' }
            ]
        },
        {
            category: 'Payments',
            questions: [
                { q: 'What payment methods are accepted?', a: 'We accept credit/debit cards, UPI, net banking, and digital wallets.' },
                { q: 'When am I charged?', a: 'Payment is processed after service completion. You\'ll receive a detailed receipt.' },
                { q: 'How do refunds work?', a: 'Refunds are processed within 5-7 business days to your original payment method.' }
            ]
        },
        {
            category: 'Safety',
            questions: [
                { q: 'Are technicians verified?', a: 'Yes, all technicians undergo background checks and skill verification before joining.' },
                { q: 'Can I rate my technician?', a: 'Absolutely! After service completion, you can rate and review your experience.' },
                { q: 'What if I\'m not satisfied?', a: 'Contact support immediately. We offer service guarantees and will resolve any issues.' }
            ]
        }
    ] : [
        {
            category: 'Getting Started',
            questions: [
                { q: 'How do I receive job requests?', a: 'Set your status to "Available" in your dashboard. You\'ll receive instant notifications for nearby jobs.' },
                { q: 'Can I decline a job?', a: 'Yes, you can accept or decline any job request. Your acceptance rate affects your ranking.' },
                { q: 'How do I update my location?', a: 'Your location updates automatically when you\'re active. Ensure location permissions are enabled.' }
            ]
        },
        {
            category: 'Earnings',
            questions: [
                { q: 'When do I get paid?', a: 'Payments are released after job completion and customer confirmation, typically within 24 hours.' },
                { q: 'What are the platform fees?', a: 'FixItNow charges a 20% service fee on each completed job.' },
                { q: 'How can I increase my earnings?', a: 'Maintain high ratings, complete more jobs, and be available during peak hours.' }
            ]
        },
        {
            category: 'Account',
            questions: [
                { q: 'How do I improve my rating?', a: 'Provide excellent service, communicate clearly, arrive on time, and maintain professionalism.' },
                { q: 'Can I work in multiple areas?', a: 'Yes, you can update your service area in profile settings to cover multiple locations.' },
                { q: 'What if I need to take a break?', a: 'Simply set your status to "Unavailable". You won\'t receive job requests until you\'re back.' }
            ]
        }
    ];

    const guides = user?.role === 'customer' ? [
        { title: 'How to Book Your First Service', duration: '3 min read', link: '#' },
        { title: 'Understanding Service Pricing', duration: '5 min read', link: '#' },
        { title: 'Using Real-Time Tracking', duration: '4 min read', link: '#' },
        { title: 'Payment Methods & Receipts', duration: '3 min read', link: '#' },
        { title: 'Rating & Reviewing Technicians', duration: '2 min read', link: '#' }
    ] : [
        { title: 'Getting Started as a Technician', duration: '5 min read', link: '#' },
        { title: 'Maximizing Your Earnings', duration: '7 min read', link: '#' },
        { title: 'Best Practices for Service Delivery', duration: '6 min read', link: '#' },
        { title: 'Understanding the Rating System', duration: '4 min read', link: '#' },
        { title: 'Managing Your Availability', duration: '3 min read', link: '#' }
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
                alert('Message sent! Our team will respond within 24 hours.');
                setContactForm({ subject: '', message: '', priority: 'normal' });
            }
        } catch (err) {
            console.error('Send failed:', err);
            alert('Failed to send message. Please try again.');
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
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '0.5rem' }}>Support & Help</h2>
                <p style={{ color: 'var(--text-muted)' }}>Get help with your FixItNow experience</p>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{
                    padding: '1.5rem',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    borderRadius: '1rem',
                    color: 'white',
                    cursor: 'pointer'
                }}
                    onClick={() => setActiveSection('contact')}>
                    <MessageCircle size={32} style={{ marginBottom: '1rem' }} />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.3rem' }}>Live Chat</h3>
                    <p style={{ fontSize: '0.85rem', opacity: 0.9 }}>Get instant help from our team</p>
                </div>
                <div style={{
                    padding: '1.5rem',
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '1rem',
                    cursor: 'pointer'
                }}>
                    <Phone size={32} style={{ marginBottom: '1rem', color: '#10b981' }} />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.3rem' }}>Call Us</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>+1 (800) 123-4567</p>
                </div>
                <div style={{
                    padding: '1.5rem',
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '1rem',
                    cursor: 'pointer'
                }}>
                    <Mail size={32} style={{ marginBottom: '1rem', color: '#f59e0b' }} />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.3rem' }}>Email</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>support@fixitnow.com</p>
                </div>
            </div>

            {/* Section Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)' }}>
                {sections.map(section => {
                    const Icon = section.icon;
                    return (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '1rem 1.5rem',
                                border: 'none',
                                background: 'transparent',
                                color: activeSection === section.id ? 'var(--text)' : 'var(--text-muted)',
                                fontWeight: 700,
                                fontSize: '0.95rem',
                                cursor: 'pointer',
                                borderBottom: activeSection === section.id ? '2px solid var(--text)' : '2px solid transparent',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <Icon size={18} />
                            {section.label}
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {/* FAQ Section */}
                {activeSection === 'faq' && (
                    <div>
                        {/* Search */}
                        <div style={{ marginBottom: '2rem' }}>
                            <div style={{ position: 'relative' }}>
                                <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="text"
                                    placeholder="Search for answers..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem 0.75rem 3rem',
                                        borderRadius: '0.75rem',
                                        border: '1px solid var(--border)',
                                        background: 'var(--card)',
                                        color: 'var(--text)',
                                        fontSize: '0.95rem'
                                    }}
                                />
                            </div>
                        </div>

                        {/* FAQ Categories */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {filteredFaqs.map((category, idx) => (
                                <div key={idx}>
                                    <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1rem' }}>{category.category}</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {category.questions.map((faq, qIdx) => (
                                            <details key={qIdx} style={{
                                                padding: '1.5rem',
                                                background: 'var(--card)',
                                                border: '1px solid var(--border)',
                                                borderRadius: '0.75rem',
                                                cursor: 'pointer'
                                            }}>
                                                <summary style={{ fontWeight: 700, fontSize: '0.95rem', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    {faq.q}
                                                    <ChevronRight size={20} style={{ transition: 'transform 0.2s' }} />
                                                </summary>
                                                <p style={{ marginTop: '1rem', color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '0.9rem' }}>
                                                    {faq.a}
                                                </p>
                                            </details>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Guides Section */}
                {activeSection === 'guides' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {guides.map((guide, idx) => (
                            <div key={idx} style={{
                                padding: '1.5rem',
                                background: 'var(--card)',
                                border: '1px solid var(--border)',
                                borderRadius: '0.75rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                    <Book size={24} color="#3b82f6" />
                                    <ExternalLink size={18} color="var(--text-muted)" />
                                </div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem' }}>{guide.title}</h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{guide.duration}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Contact Section */}
                {activeSection === 'contact' && (
                    <div style={{ maxWidth: '600px' }}>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1rem' }}>Send us a message</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                            Our support team typically responds within 24 hours
                        </p>

                        <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                                    Subject
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={contactForm.subject}
                                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                                    placeholder="What do you need help with?"
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
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                                    Priority
                                </label>
                                <select
                                    value={contactForm.priority}
                                    onChange={(e) => setContactForm({ ...contactForm, priority: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '0.5rem',
                                        border: '1px solid var(--border)',
                                        background: 'var(--card)',
                                        color: 'var(--text)',
                                        fontSize: '0.95rem'
                                    }}
                                >
                                    <option value="low">Low - General inquiry</option>
                                    <option value="normal">Normal - Need assistance</option>
                                    <option value="high">High - Urgent issue</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                                    Message
                                </label>
                                <textarea
                                    required
                                    value={contactForm.message}
                                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                                    rows={6}
                                    placeholder="Describe your issue or question in detail..."
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

                            <button
                                type="submit"
                                disabled={sending}
                                style={{
                                    padding: '0.75rem 2rem',
                                    borderRadius: '0.75rem',
                                    border: 'none',
                                    background: 'var(--text)',
                                    color: 'var(--bg)',
                                    fontWeight: 800,
                                    fontSize: '0.95rem',
                                    cursor: sending ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    opacity: sending ? 0.6 : 1
                                }}
                            >
                                <Send size={18} />
                                {sending ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default SupportHelp;
