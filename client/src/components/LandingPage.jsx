import { useState, useEffect } from 'react';
import AuthModal from './AuthModal';

const LandingPage = ({ onFindTechnician, onJoinPro }) => {
    const [scrolled, setScrolled] = useState(false);
    const [location, setLocation] = useState('Detecting...');
    const [showAuth, setShowAuth] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setLocation(`${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)}`),
                () => setLocation('New York, NY')
            );
        } else {
            setLocation('Enable Location');
        }

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div style={{ width: '100%', minHeight: '100vh' }}>
            {/* Navbar */}
            <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} style={{
                position: 'fixed', top: '1rem', left: 0, right: 0,
                height: '80px', zIndex: 1000,
                display: 'flex', alignItems: 'center',
                transition: 'all 0.3s ease'
            }}>
                <div style={{ width: '100%', padding: '0 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
                        FixItNow
                    </div>

                    <div className="flex gap-2 desktop-only" style={{ alignItems: 'center' }}>
                        {['Services', 'How It Works'].map(link => (
                            <a key={link} href={`#${link.toLowerCase().replace(/ /g, '-')}`}
                                style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-muted)', textDecoration: 'none' }}>
                                {link}
                            </a>
                        ))}
                        <div style={{ padding: '0.5rem 1rem', background: 'var(--card)', borderRadius: '0.5rem', fontSize: '0.85rem', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            📍 <span>{location}</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <button onClick={() => setShowAuth(true)} style={{ background: 'transparent', border: 'none', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer' }}>
                            Log In
                        </button>
                        <button className="btn btn-primary" onClick={() => setShowAuth(true)} style={{ padding: '0.7rem 1.5rem', fontSize: '0.95rem' }}>
                            Get Started
                        </button>
                    </div>
                </div>
            </nav>

            {/* SAHAKAR Heading Section */}
            <section style={{
                paddingTop: 'calc(1rem + 80px + 0.5rem)',
                paddingBottom: '0',
                margin: '0',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'var(--bg)'
            }}>
                <h2 style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--text)',
                    margin: 0
                }}>
                    SAHAKAR
                </h2>
            </section>

            {/* Hero Section */}
            <section style={{
                minHeight: '80vh',
                display: 'flex',
                alignItems: 'center',
                padding: '2rem 2rem 4rem'
            }}>
                <div style={{
                    width: '100%',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '5rem',
                    alignItems: 'center'
                }}>
                    {/* Left: Text */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{
                            display: 'inline-block',
                            padding: '0.5rem 1.2rem',
                            background: 'var(--card)',
                            border: '1px solid var(--border)',
                            borderRadius: '0.5rem',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            width: 'fit-content'
                        }}>
                            ✨ AI-Powered Matching
                        </div>

                        <h1 style={{
                            fontSize: 'clamp(3.5rem, 7vw, 6rem)',
                            fontFamily: 'var(--font-heading)',
                            fontWeight: 800,
                            lineHeight: 1,
                            margin: 0,
                            background: 'linear-gradient(135deg, var(--text) 0%, var(--text-muted) 100%)',
                            WebkitBackgroundClip: 'text',
                            backgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            Fix Anything.<br />
                            <span style={{ color: 'var(--text-muted)' }}>In Minutes.</span>
                        </h1>

                        <p style={{
                            fontSize: '1.25rem',
                            color: 'var(--text-muted)',
                            lineHeight: 1.6,
                            maxWidth: '45ch',
                            margin: 0
                        }}>
                            Get <strong style={{ color: 'var(--text)', fontWeight: 600 }}>instant matches</strong> to verified pros. Live GPS tracking. No phone calls. Just results.
                        </p>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                            <button className="btn btn-primary" onClick={onFindTechnician} style={{ padding: '1rem 2.5rem', fontSize: '1.05rem' }}>
                                Find a Technician
                            </button>
                            <button className="btn btn-outline" onClick={onJoinPro} style={{ padding: '1rem 2rem', fontSize: '1.05rem' }}>
                                Join as Pro
                            </button>
                        </div>

                        <div style={{ display: 'flex', gap: '2rem', fontSize: '0.95rem', fontWeight: 600, opacity: 0.8, marginTop: '1rem' }}>
                            <span>🛡️ Insured</span>
                            <span>⭐ 4.9/5</span>
                            <span>⚡ 15min avg</span>
                        </div>
                    </div>

                    {/* Right: Visual */}
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <div style={{
                            width: '100%',
                            maxWidth: '550px',
                            aspectRatio: '1',
                            background: 'var(--card)',
                            border: '1px solid var(--border)',
                            borderRadius: '2rem',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: '0 40px 100px -20px rgba(0,0,0,0.1)'
                        }}>
                            {/* Grid Background */}
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
                                backgroundSize: '60px 60px',
                                opacity: 0.1
                            }}></div>

                            {/* Match Card */}
                            <div style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                width: '90%',
                                background: 'var(--bg)',
                                border: '1px solid var(--border)',
                                borderRadius: '1.5rem',
                                padding: '2rem',
                                boxShadow: '0 20px 60px -10px rgba(0,0,0,0.2)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <div style={{ width: '50px', height: '50px', background: '#eee', borderRadius: '50%' }}></div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Sarah Johnson</div>
                                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>⭐ 4.9 · Plumber</div>
                                        </div>
                                    </div>
                                    <div style={{ background: 'var(--success)', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 700 }}>
                                        MATCHED
                                    </div>
                                </div>

                                <div style={{ background: '#f5f5f5', height: '6px', borderRadius: '3px', overflow: 'hidden', marginBottom: '1.5rem' }}>
                                    <div style={{ background: 'var(--success)', width: '75%', height: '100%' }}></div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    <span>⏱️ Arriving in 8 min</span>
                                    <span>📍 0.5 miles away</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services */}
            <section id="services" style={{ padding: '6rem 2rem', background: 'var(--card)' }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    <h2 style={{ textAlign: 'center', fontSize: '3rem', fontWeight: 700, fontFamily: 'var(--font-heading)', marginBottom: '3rem' }}>
                        What can we fix?
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                        {[
                            { icon: '🚰', title: 'Plumbing', desc: 'Leaks, pipes, drains' },
                            { icon: '⚡', title: 'Electrical', desc: 'Wiring, outlets, lights' },
                            { icon: '🧹', title: 'Cleaning', desc: 'Deep clean, move-out' },
                            { icon: '🔨', title: 'Carpentry', desc: 'Repairs, assembly' },
                            { icon: '❄️', title: 'HVAC', desc: 'AC, heating, cooling' },
                            { icon: '🪟', title: 'Windows', desc: 'Repair, installation' },
                        ].map((service, i) => (
                            <div key={i} onClick={onFindTechnician} style={{
                                background: 'var(--bg)',
                                border: '1px solid var(--border)',
                                borderRadius: '1.5rem',
                                padding: '2.5rem',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                    e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(0,0,0,0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{service.icon}</div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>{service.title}</h3>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>{service.desc}</p>
                                <span style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '0.9rem' }}>Book now →</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" style={{ padding: '6rem 2rem' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '3rem', fontWeight: 700, fontFamily: 'var(--font-heading)', marginBottom: '1rem' }}>
                        Simple. Fast. Reliable.
                    </h2>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '4rem', maxWidth: '50ch' }}>
                        Book a pro in 3 taps. Track them live. Get it fixed.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '3rem' }}>
                        {[
                            { step: '1', title: 'Select & See Price', desc: 'Browse services. Get instant upfront pricing.' },
                            { step: '2', title: 'AI Matches You', desc: 'We notify the nearest 5-star rated pro.' },
                            { step: '3', title: 'Track & Pay', desc: 'Watch them arrive. Pay securely in-app.' },
                        ].map((item, i) => (
                            <div key={i} style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                                <div style={{
                                    width: '40px', height: '40px',
                                    background: 'var(--text)', color: 'var(--bg)',
                                    borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.1rem', fontWeight: 700,
                                    flexShrink: 0
                                }}>
                                    {item.step}
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>{item.title}</h4>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section style={{ padding: '6rem 2rem', background: 'var(--text)', color: 'var(--bg)' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '4rem', fontWeight: 800, fontFamily: 'var(--font-heading)', marginBottom: '1.5rem', color: 'var(--bg)' }}>
                        Ready to fix it?
                    </h2>
                    <p style={{ fontSize: '1.3rem', opacity: 0.9, marginBottom: '3rem' }}>
                        Join 50,000+ happy homeowners. Get matched in seconds.
                    </p>
                    <button className="btn" onClick={onFindTechnician} style={{
                        background: 'var(--bg)',
                        color: 'var(--text)',
                        padding: '1.2rem 3rem',
                        fontSize: '1.1rem',
                        fontWeight: 700
                    }}>
                        Get Started Now
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ padding: '4rem 2rem', borderTop: '1px solid var(--border)' }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '3rem' }}>
                    <div>
                        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.5rem', marginBottom: '1rem' }}>
                            FixItNow
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            AI-powered home services<br />© 2026 All rights reserved
                        </p>
                    </div>
                    <div>
                        <h4 style={{ fontWeight: 700, marginBottom: '1rem' }}>Product</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-muted)' }}>
                            <a href="#" style={{ textDecoration: 'none', color: 'inherit' }}>Features</a>
                            <a href="#" style={{ textDecoration: 'none', color: 'inherit' }}>Pricing</a>
                            <a href="#" style={{ textDecoration: 'none', color: 'inherit' }}>How It Works</a>
                        </div>
                    </div>
                    <div>
                        <h4 style={{ fontWeight: 700, marginBottom: '1rem' }}>Company</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-muted)' }}>
                            <a href="#" style={{ textDecoration: 'none', color: 'inherit' }}>About</a>
                            <a href="#" style={{ textDecoration: 'none', color: 'inherit' }}>Careers</a>
                            <a href="#" style={{ textDecoration: 'none', color: 'inherit' }}>Contact</a>
                            <a href="/admin" style={{ textDecoration: 'none', color: 'inherit', fontWeight: 600 }}>Admin Portal</a>
                        </div>
                    </div>
                    <div>
                        <h4 style={{ fontWeight: 700, marginBottom: '1rem' }}>Legal</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-muted)' }}>
                            <a href="#" style={{ textDecoration: 'none', color: 'inherit' }}>Privacy</a>
                            <a href="#" style={{ textDecoration: 'none', color: 'inherit' }}>Terms</a>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Auth Modal */}
            {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap');
                
                @media (max-width: 768px) { 
                    .desktop-only { display: none !important; }
                    section > div { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    );
};

export default LandingPage;
