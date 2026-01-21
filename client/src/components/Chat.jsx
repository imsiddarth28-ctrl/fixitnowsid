import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Shield, CheckCheck, Clock, Paperclip, Smile, MoreVertical, MessageSquare } from 'lucide-react';
import Pusher from 'pusher-js';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';

const Chat = ({ jobId, otherUser, isCompact = false }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchMessages();
        const pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
            cluster: import.meta.env.VITE_PUSHER_CLUSTER,
        });

        const channel = pusher.subscribe(`job-${jobId}`);
        channel.bind('receive_message', (data) => {
            if (data.senderId !== user.id) {
                setMessages(prev => [...prev, data]);
            }
        });

        return () => {
            channel.unbind_all();
            channel.unsubscribe();
        };
    }, [jobId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchMessages = async () => {
        try {
            const res = await fetch(`${API_URL}/api/chat/${jobId}`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
            }
        } catch (err) {
            console.error('Failed to fetch messages:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSend = async (e) => {
        if (e) e.preventDefault();
        if (!newMessage.trim()) return;

        const messageData = {
            jobId,
            senderId: user.id,
            text: newMessage.trim(),
            timestamp: new Date().toISOString(),
        };

        // Optimistic UI update
        setMessages(prev => [...prev, { ...messageData, isOptimistic: true }]);
        setNewMessage('');

        try {
            const res = await fetch(`${API_URL}/api/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(messageData),
            });

            if (!res.ok) throw new Error('Failed to send');
        } catch (err) {
            console.error('Send error:', err);
        }
    };

    return (
        <div className="glass" style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            background: 'var(--bg)',
            borderLeft: !isCompact ? '1px solid var(--border)' : 'none',
            color: 'var(--text)',
            overflow: 'hidden'
        }}>
            {/* Chat Header */}
            <div style={{
                padding: '24px 32px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'var(--bg-secondary)',
                zIndex: 10
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '16px',
                        background: 'var(--text)',
                        color: 'var(--bg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '900',
                        fontSize: '1.2rem',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                    }}>
                        {otherUser?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                        <div style={{ fontWeight: '900', fontSize: '1.1rem', letterSpacing: '-0.02em' }}>{otherUser?.name || 'SYNC_USER'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800', letterSpacing: '0.05em' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 6px var(--success)' }}></div>
                            COMMS_ACTIVE
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '20px', color: 'var(--text-secondary)' }}>
                    <Shield size={20} />
                    <MoreVertical size={20} style={{ cursor: 'pointer' }} />
                </div>
            </div>

            {/* Messages Area */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '32px',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
                background: 'var(--bg)',
                scrollbarWidth: 'none'
            }}>
                {isLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-secondary)' }}>
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}>
                            <Clock size={32} />
                        </motion.div>
                    </div>
                ) : messages.length === 0 ? (
                    <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-secondary)', maxWidth: '280px' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '32px',
                            background: 'var(--bg-tertiary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 24px',
                            border: '1px solid var(--border)'
                        }}>
                            <MessageSquare size={32} style={{ opacity: 0.5 }} />
                        </div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '900', color: 'var(--text)', marginBottom: '8px', letterSpacing: '-0.02em' }}>SECURE_GRID_INIT</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: '500', lineHeight: '1.6' }}>All communications are encrypted and synchronized via neural link.</div>
                    </div>
                ) : (
                    messages.map((msg, i) => {
                        const isMe = msg.senderId === user.id;
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                style={{
                                    alignSelf: isMe ? 'flex-end' : 'flex-start',
                                    maxWidth: '80%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: isMe ? 'flex-end' : 'flex-start'
                                }}
                            >
                                <div style={{
                                    padding: '16px 20px',
                                    borderRadius: isMe ? '24px 24px 4px 24px' : '24px 24px 24px 4px',
                                    background: isMe ? 'var(--text)' : 'var(--bg-secondary)',
                                    color: isMe ? 'var(--bg)' : 'var(--text)',
                                    fontSize: '0.95rem',
                                    lineHeight: '1.5',
                                    fontWeight: '600',
                                    border: isMe ? 'none' : '1px solid var(--border)',
                                    boxShadow: isMe ? '0 12px 24px rgba(0,0,0,0.1)' : '0 4px 12px rgba(0,0,0,0.02)'
                                }}>
                                    {msg.text}
                                </div>
                                <div style={{
                                    marginTop: '8px',
                                    fontSize: '0.65rem',
                                    color: 'var(--text-secondary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontWeight: '800',
                                    letterSpacing: '0.05em'
                                }}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    {isMe && <CheckCheck size={14} color={msg.isOptimistic ? 'var(--text-secondary)' : 'var(--success)'} />}
                                </div>
                            </motion.div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{
                padding: '32px',
                background: 'var(--bg-secondary)',
                borderTop: '1px solid var(--border)'
            }}>
                <form
                    onSubmit={handleSend}
                    className="glass"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        background: 'var(--bg)',
                        padding: '10px 10px 10px 24px',
                        borderRadius: '24px',
                        border: '1px solid var(--border)'
                    }}
                >
                    <Paperclip size={20} className="icon-btn" style={{ color: 'var(--text-secondary)', cursor: 'pointer' }} />
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="input"
                        style={{
                            flex: 1,
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            fontSize: '1rem',
                            fontWeight: '600',
                            padding: '8px 0',
                            color: 'var(--text)'
                        }}
                    />
                    <Smile size={20} className="icon-btn" style={{ color: 'var(--text-secondary)', cursor: 'pointer' }} />
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="btn btn-primary"
                        style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '16px',
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Send size={20} />
                    </motion.button>
                </form>
                <div style={{
                    marginTop: '16px',
                    fontSize: '0.65rem',
                    color: 'var(--text-secondary)',
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    fontWeight: '800',
                    letterSpacing: '0.05em'
                }}>
                    <Shield size={12} />
                    SECURE_PROTOCOL_ENCRYPTED
                </div>
            </div>
        </div>
    );
};

export default Chat;
