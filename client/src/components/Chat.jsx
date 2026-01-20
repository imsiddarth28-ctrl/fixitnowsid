import { useState, useEffect, useRef } from 'react';
import { subscribeToEvent } from '../socket';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';
import { motion, AnimatePresence } from 'framer-motion';

const Chat = ({ jobId, receiverId, onClose }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const scrollRef = useRef(null);

    useEffect(() => {
        // Fetch history
        fetch(`${API_URL}/api/chat/${jobId}`)
            .then(res => res.json())
            .then(data => setMessages(data))
            .catch(err => console.error(err));

        const unsubscribe = subscribeToEvent(`job-${jobId}`, 'receive_message', (msg) => {
            setMessages(prev => {
                // Check if message already exists to avoid duplicates
                if (prev.find(m => m._id === msg._id)) return prev;
                return [...prev, msg];
            });
        });

        return () => unsubscribe();
    }, [jobId]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        const msgData = {
            jobId,
            senderId: user.id,
            senderRole: user.role,
            text: inputText,
            receiverId
        };

        try {
            await fetch(`${API_URL}/api/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(msgData)
            });
            setInputText('');
        } catch (err) {
            console.error('Send error:', err);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            style={{
                position: 'fixed',
                bottom: '100px',
                right: '20px',
                width: '350px',
                height: '450px',
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                zIndex: 3000,
                overflow: 'hidden',
                backdropFilter: 'blur(10px)',
                transformStyle: 'preserve-3d',
                perspective: '1000px'
            }}
        >
            {/* Header */}
            <div style={{
                padding: '1rem 1.5rem',
                borderBottom: '1px solid var(--border)',
                background: 'var(--text)',
                color: 'var(--bg)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }}></div>
                    <span style={{ fontWeight: 800, fontSize: '0.9rem', letterSpacing: '0.05em' }}>LIVE CHAT</span>
                </div>
                <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--bg)', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 800 }}>×</button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {messages.map((msg, idx) => (
                    <motion.div
                        initial={{ opacity: 0, x: msg.senderId === user.id ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={idx}
                        style={{
                            alignSelf: msg.senderId === user.id ? 'flex-end' : 'flex-start',
                            maxWidth: '80%',
                            padding: '0.8rem 1rem',
                            borderRadius: msg.senderId === user.id ? '1rem 1rem 0 1rem' : '1rem 1rem 1rem 0',
                            background: msg.senderId === user.id ? 'var(--text)' : 'var(--bg)',
                            color: msg.senderId === user.id ? 'var(--bg)' : 'var(--text)',
                            fontSize: '0.9rem',
                            border: '1px solid var(--border)',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
                        }}
                    >
                        {msg.text}
                    </motion.div>
                ))}
                <div ref={scrollRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={sendMessage} style={{ padding: '1.2rem', borderTop: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ display: 'flex', gap: '0.8rem', background: 'rgba(0,0,0,0.2)', padding: '0.4rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Encrypted message..."
                        style={{
                            flex: 1,
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text)',
                            padding: '0.6rem 0.8rem',
                            fontSize: '0.9rem',
                            outline: 'none'
                        }}
                    />
                    <motion.button
                        whileHover={{ scale: 1.05, background: 'var(--text)', color: 'var(--bg)' }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            color: 'var(--text)',
                            border: 'none',
                            width: '36px',
                            height: '36px',
                            borderRadius: '0.8rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    </motion.button>
                </div>
            </form>
        </motion.div>
    );
};

export default Chat;
