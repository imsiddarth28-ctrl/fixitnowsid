import { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import {
    Zap, Shield, Clock, ArrowRight, Star,
    CheckCircle, Activity, Box, Layers
} from 'lucide-react';

const LandingPage = ({ onFindTechnician, onJoinPro }) => {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    // Parallax & 3D Tilt Logic for Hero
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useTransform(y, [-500, 500], [10, -10]);
    const rotateY = useTransform(x, [-500, 500], [-10, 10]);

    const handleMouseMove = (event) => {
        const { clientX, clientY } = event;
        const width = window.innerWidth;
        const height = window.innerHeight;
        const centerX = width / 2;
        const centerY = height / 2;
        x.set(clientX - centerX);
        y.set(clientY - centerY);
    };

    const springConfig = { stiffness: 100, damping: 30 };
    const springRotateX = useSpring(rotateX, springConfig);
    const springRotateY = useSpring(rotateY, springConfig);

    return (
        <div ref={containerRef} style={{ background: 'var(--bg)', overflow: 'hidden' }} onMouseMove={handleMouseMove}>

            {/* Background Gradients */}
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: 'none' }}>
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                        rotate: [0, 90, 0]
                    }}
                    transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
                    style={{
                        position: 'absolute',
                        top: '-20%', left: '-10%',
                        width: '50vw', height: '50vw',
                        background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(0,0,0,0) 70%)',
                        borderRadius: '50%',
                        filter: 'blur(60px)'
                    }}
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.2, 0.4, 0.2],
                        x: [0, 100, 0]
                    }}
                    transition={{ duration: 25, repeat: Infinity, repeatType: "reverse" }}
                    style={{
                        position: 'absolute',
                        bottom: '-20%', right: '-10%',
                        width: '60vw', height: '60vw',
                        background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, rgba(0,0,0,0) 70%)',
                        borderRadius: '50%',
                        filter: 'blur(80px)'
                    }}
                />
            </div>

            {/* HERO SECTION */}
            <section style={{
                position: 'relative',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                perspective: '1000px',
                zIndex: 1,
                padding: '120px 20px 80px'
            }}>
                <div style={{ maxWidth: '1400px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                    {/* 3D Floating Elements */}
                    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                        <FloatingIcon icon={Box} delay={0} x={-400} y={-200} size={40} color="var(--accent)" />
                        <FloatingIcon icon={Activity} delay={1} x={400} y={100} size={50} color="#10b981" />
                        <FloatingIcon icon={Layers} delay={2} x={-300} y={300} size={30} color="#f59e0b" />
                    </div>

                    <motion.div
                        style={{
                            textAlign: 'center',
                            rotateX: springRotateX,
                            rotateY: springRotateY,
                            transformStyle: 'preserve-3d',
                            marginBottom: '4rem'
                        }}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="glass"
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: '8px',
                                padding: '8px 24px', borderRadius: '100px',
                                fontSize: '0.85rem', fontWeight: '800', letterSpacing: '0.05em',
                                marginBottom: '32px', border: '1px solid var(--accent)',
                                color: 'var(--accent)', boxShadow: '0 0 20px rgba(59,130,246,0.2)'
                            }}
                        >
                            <span className="pulse-dot" style={{ background: 'var(--accent)' }}></span>
                            FUTURE OF MAINTENANCE
                        </motion.div>

                        <h1 className="text-gradient" style={{
                            fontSize: 'clamp(3.5rem, 12vw, 8rem)',
                            fontWeight: '900',
                            letterSpacing: '-0.04em',
                            lineHeight: '0.9',
                            marginBottom: '32px',
                            textShadow: '0 20px 40px rgba(0,0,0,0.1)'
                        }}>
                            Fix It <br />
                            <span style={{
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundImage: 'linear-gradient(to right, var(--text), var(--text-secondary))'
                            }}>Right Now.</span>
                        </h1>

                        <p style={{
                            fontSize: '1.25rem',
                            color: 'var(--text-secondary)',
                            maxWidth: '600px',
                            margin: '0 auto 48px',
                            lineHeight: '1.6',
                            fontWeight: '500'
                        }}>
                            Experience the next dimension of home service.
                            Instant connection to top-tier experts with real-time
                            holographic tracking and military-grade encryption.
                        </p>

                        <div style={{
                            display: 'flex', gap: '20px', justifyContent: 'center',
                            flexWrap: 'wrap', transform: 'translateZ(50px)'
                        }}>
                            <motion.button
                                whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(59,130,246,0.4)' }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onFindTechnician}
                                className="btn btn-primary"
                                style={{
                                    padding: '1.2rem 3.5rem',
                                    fontSize: '1.1rem',
                                    borderRadius: '100px',
                                    fontWeight: '800'
                                }}
                            >
                                Find Expert <ArrowRight size={20} />
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05, background: 'var(--text)', color: 'var(--bg)' }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onJoinPro}
                                className="glass"
                                style={{
                                    padding: '1.2rem 3rem',
                                    fontSize: '1.1rem',
                                    borderRadius: '100px',
                                    fontWeight: '700',
                                    border: '1px solid var(--border)'
                                }}
                            >
                                Join as Pro
                            </motion.button>
                        </div>
                    </motion.div>

                    {/* 3D Dashboard Preview */}
                    <motion.div
                        initial={{ opacity: 0, rotateX: 20, y: 100 }}
                        animate={{ opacity: 1, rotateX: 10, y: 0 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        style={{
                            width: '100%',
                            maxWidth: '1000px',
                            aspectRatio: '16/9',
                            background: 'var(--bg-secondary)',
                            borderRadius: '24px',
                            border: '1px solid var(--border)',
                            boxShadow: '0 50px 100px -20px rgba(0,0,0,0.3)',
                            position: 'relative',
                            overflow: 'hidden',
                            perspective: '1000px',
                            transformStyle: 'preserve-3d'
                        }}
                    >
                        {/* Mock UI Elements */}
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '60px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: '12px' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }} />
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }} />
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }} />
                        </div>
                        <div style={{ position: 'absolute', inset: 0, top: '60px', display: 'flex' }}>
                            <div style={{ width: '240px', borderRight: '1px solid var(--border)', padding: '24px' }}>
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} style={{ height: '40px', borderRadius: '8px', background: 'var(--bg-tertiary)', marginBottom: '12px', opacity: 0.5 }} />
                                ))}
                            </div>
                            <div style={{ flex: 1, padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
                                <div className="glass" style={{ height: '200px', borderRadius: '16px', background: 'var(--bg-tertiary)' }} />
                                <div className="glass" style={{ height: '200px', borderRadius: '16px', background: 'var(--bg-tertiary)' }} />
                                <div className="glass" style={{ height: '100px', borderRadius: '16px', background: 'var(--bg-tertiary)', gridColumn: 'span 2' }} />
                            </div>
                        </div>

                        {/* Overlay Gradient */}
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, var(--bg) 100%)', pointerEvents: 'none' }} />
                    </motion.div>
                </div>
            </section>

            {/* FEATURES SECTION */}
            <section style={{ padding: '100px 20px', position: 'relative', zIndex: 1 }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        style={{ textAlign: 'center', marginBottom: '80px' }}
                    >
                        <h2 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '16px' }}>Engineered for Perfection</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>Advanced tools for a seamless experience</p>
                    </motion.div>

                    <div className="bento-grid">
                        <FeatureCard
                            icon={Zap}
                            title="Instant Sync"
                            desc="Real-time websocket connection for zero-latency updates between customer and technician."
                            delay={0}
                            colSpan={4}
                        />
                        <FeatureCard
                            icon={Shield}
                            title="Secure Core"
                            desc="Enterprise-grade security protocols protecting every transaction and datastream."
                            delay={0.1}
                            colSpan={4}
                        />
                        <FeatureCard
                            icon={Clock}
                            title="Precision Timing"
                            desc="Live GPS tracking and sophisticated ETA algorithms."
                            delay={0.2}
                            colSpan={4}
                        />
                    </div>
                </div>
            </section>

            {/* STATS 3D */}
            <section style={{ padding: '40px 20px 120px' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>
                    <StatBox label="Active Pros" value="2,400+" color="#3b82f6" />
                    <StatBox label="Safe Jobs" value="100%" color="#10b981" />
                    <StatBox label="Avg Rating" value="4.98" color="#f59e0b" />
                </div>
            </section>
        </div>
    );
};

// Components
const FloatingIcon = ({ icon: Icon, delay, x, y, size, color }) => (
    <motion.div
        animate={{
            y: [0, -20, 0],
            rotate: [0, 10, -10, 0]
        }}
        transition={{
            duration: 6,
            delay: delay,
            repeat: Infinity,
            ease: "easeInOut"
        }}
        style={{
            position: 'absolute',
            left: '50%', top: '50%',
            marginLeft: x, marginTop: y,
            filter: `drop-shadow(0 10px 20px ${color}40)`
        }}
    >
        <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '20px', border: '1px solid var(--border)' }}>
            <Icon size={size} color={color} />
        </div>
    </motion.div>
);

const FeatureCard = ({ icon: Icon, title, desc, delay, colSpan }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay, duration: 0.5 }}
        whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
        className="glass"
        style={{
            gridColumn: `span ${colSpan}`,
            padding: '40px',
            borderRadius: '24px',
            border: '1px solid var(--border)',
            background: 'var(--bg-secondary)',
            display: 'flex', flexDirection: 'column', gap: '20px'
        }}
    >
        <div style={{
            width: '60px', height: '60px', borderRadius: '16px',
            background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}>
            <Icon size={32} color="var(--text)" />
        </div>
        <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '8px' }}>{title}</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{desc}</p>
        </div>
    </motion.div>
);

const StatBox = ({ label, value, color }) => (
    <motion.div
        whileHover={{ scale: 1.1, rotate: [0, -2, 2, 0] }}
        className="glass"
        style={{
            padding: '30px 50px',
            borderRadius: '20px',
            textAlign: 'center',
            border: '1px solid var(--border)',
            minWidth: '200px'
        }}
    >
        <div style={{ fontSize: '3.5rem', fontWeight: '900', color: color, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', marginTop: '8px', letterSpacing: '0.1em' }}>{label}</div>
    </motion.div>
);

export default LandingPage;
