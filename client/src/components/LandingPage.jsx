import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap, Shield, Clock, ArrowRight, User,
    CheckCircle, Globe, Star, Sparkles, MoveRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LandingPage = ({ onFindTechnician, onJoinPro }) => {
    const { user } = useAuth();

    const FeatureCard = ({ icon: Icon, title, desc, index }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className="bento-card"
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
            }}
        >
            <div style={{
                width: '56px', height: '56px', borderRadius: '18px',
                background: 'var(--bg-tertiary)', display: 'flex',
                alignItems: 'center', justifyContent: 'center'
            }}>
                <Icon size={28} color="var(--text)" />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '700' }}>{title}</h3>
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{desc}</p>
        </motion.div>
    );

    return (
        <div style={{ background: 'var(--bg)', color: 'var(--text)', transition: 'all 0.3s ease' }}>
            {/* Hero Section */}
            <section style={{
                padding: 'calc(var(--container-padding) * 2) 0',
                textAlign: 'center',
                maxWidth: '1200px',
                margin: '0 auto'
            }}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        padding: '8px 16px', borderRadius: '100px',
                        background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                        fontSize: '0.8rem', fontWeight: '700', marginBottom: '32px'
                    }}>
                        <Sparkles size={14} />
                        NEXT-GEN HOME SERVICES
                    </div>

                    <h1 className="text-gradient" style={{
                        fontSize: 'clamp(3rem, 10vw, 6rem)',
                        fontWeight: '800',
                        letterSpacing: '-0.04em',
                        lineHeight: '0.9',
                        marginBottom: '32px'
                    }}>
                        Instant Experts.<br />
                        <span style={{ opacity: 0.5 }}>Zero Friction.</span>
                    </h1>

                    <p style={{
                        fontSize: '1.25rem',
                        color: 'var(--text-secondary)',
                        maxWidth: '650px',
                        margin: '0 auto 48px',
                        lineHeight: '1.6'
                    }}>
                        The premium marketplace for on-demand home maintenance. Verified professionals, real-time tracking, unparalleled service quality.
                    </p>

                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                            onClick={onFindTechnician}
                            className="btn btn-primary"
                            style={{ padding: '1.2rem 2.5rem', fontSize: '1.1rem', borderRadius: 'var(--radius-lg)' }}
                        >
                            Find an Expert <ArrowRight size={20} />
                        </button>
                        <button
                            onClick={onJoinPro}
                            className="btn btn-secondary"
                            style={{ padding: '1.2rem 2.5rem', fontSize: '1.1rem', borderRadius: 'var(--radius-lg)' }}
                        >
                            Join as a Professional
                        </button>
                    </div>
                </motion.div>

                {/* Social Proof / Stats */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 1 }}
                    style={{
                        marginTop: '100px',
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '80px',
                        flexWrap: 'wrap'
                    }}
                >
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>4.9/5</div>
                        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Avg. Rating</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>150k+</div>
                        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Jobs Done</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>12 Min</div>
                        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Avg. Response</div>
                    </div>
                </motion.div>
            </section>

            {/* Features Grid */}
            <section style={{
                padding: '80px 0',
                maxWidth: '1200px',
                margin: '0 auto'
            }}>
                <div className="bento-grid">
                    <div style={{ gridColumn: 'span 4' }}>
                        <FeatureCard
                            index={0}
                            icon={Zap}
                            title="Instant Booking"
                            desc="Connect with available professionals in seconds. No more waiting on hold or endless calling."
                        />
                    </div>
                    <div style={{ gridColumn: 'span 4' }}>
                        <FeatureCard
                            index={1}
                            icon={Shield}
                            title="Fully Verified"
                            desc="Every pro undergoes a rigorous background check and skills assessment for your peace of mind."
                        />
                    </div>
                    <div style={{ gridColumn: 'span 4' }}>
                        <FeatureCard
                            index={2}
                            icon={Clock}
                            title="Real-time Tracking"
                            desc="See exactly where your pro is and get live ETAs as they travel to your location."
                        />
                    </div>
                </div>
            </section>

            {/* Bottom CTA */}
            <section style={{ padding: '100px 0', textAlign: 'center' }}>
                <div className="glass" style={{ padding: '80px 40px', borderRadius: '40px', maxWidth: '1000px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '24px' }}>Ready to experience the future?</h2>
                    <button className="btn btn-primary" onClick={onFindTechnician} style={{ padding: '1.2rem 3rem', fontSize: '1.1rem' }}>
                        Book Your First Service
                    </button>
                </div>
            </section>

            {/* Simple Footer */}
            <footer style={{
                padding: '80px 0',
                borderTop: '1px solid var(--border)',
                textAlign: 'center',
                background: 'var(--bg-secondary)'
            }}>
                <div style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '12px', fontFamily: 'var(--font-heading)' }}>FixItNow</div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>© 2026 FixItNow Inc. All rights reserved.</p>
                <div style={{
                    display: 'flex', justifyContent: 'center', gap: '32px',
                    marginTop: '32px', fontSize: '0.9rem', color: 'var(--text)', fontWeight: '600'
                }}>
                    <a href="#" style={{ textDecoration: 'none', color: 'inherit', opacity: 0.7 }}>Privacy Policy</a>
                    <a href="#" style={{ textDecoration: 'none', color: 'inherit', opacity: 0.7 }}>Terms of Service</a>
                    <a href="#" style={{ textDecoration: 'none', color: 'inherit', opacity: 0.7 }}>Support Center</a>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
