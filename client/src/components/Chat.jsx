import { useState, useEffect, useRef } from 'react';
import { Send, X, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { subscribeToEvent } from '../socket';
import API_URL from '../config';
import { useAuth } from '../context/AuthContext';

const Chat = ({ jobId, receiverId, onClose, isCompact = false }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Fetch chat history
    useEffect(() => {
        const abortController = new AbortController();

        const fetchMessages = async () => {
            if (!jobId) return;
            try {
                setLoading(true);
                const res = await fetch(`${API_URL}/api/messages/${jobId}`, {
                    signal: abortController.signal,
                    headers: { 'Cache-Control': 'no-cache' }
                });
                if (res.ok) {
                    const data = await res.json();
                    setMessages(Array.isArray(data) ? data : []);
                }
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Failed to fetch messages:', err);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
        return () => abortController.abort();
    }, [jobId]);

    // Real-time message listener
    useEffect(() => {
        if (!jobId) return;

        const handleNewMessage = (data) => {
            setMessages(prev => {
                // Prevent duplicates
                const isDuplicate = prev.some(msg =>
                    msg._id === data._id ||
                    (msg.text === data.text && Math.abs(new Date(msg.timestamp) - new Date(data.timestamp)) < 1000)
                );
                if (isDuplicate) return prev;
                return [...prev, data];
            });
        };

        const unsubscribe = subscribeToEvent(`job-${jobId}`, 'receive_message', handleNewMessage);
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [jobId]);

    // Auto-scroll
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'auto', block: 'end' });
        }
    }, [messages]);

    // Send message
    const sendMessage = async (e) => {
        e?.preventDefault();
        if (!newMessage.trim() || sending || !jobId) return;

        const messageText = newMessage.trim();
        const tempId = `temp-${Date.now()}-${Math.random()}`;

        setNewMessage('');
        setSending(true);

        // Optimistic UI update
        const tempMessage = {
            _id: tempId,
            text: messageText,
            senderId: user?.id || 'me',
            senderRole: user?.role || 'customer',
            timestamp: new Date().toISOString(),
            isOptimistic: true
        };

        setMessages(prev => [...prev, tempMessage]);

        try {
            const res = await fetch(`${API_URL}/api/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    jobId,
                    senderId: user?.id || 'current-user',
                    senderRole: user?.role || 'customer',
                    text: messageText,
                    receiverId: receiverId || 'receiver'
                })
            });

            if (res.ok) {
                const savedMessage = await res.json();
                setMessages(prev => prev.map(msg =>
                    msg._id === tempId ? { ...savedMessage, isOptimistic: false } : msg
                ));
            } else {
                const error = await res.json();
                throw new Error(error.message || 'Failed to send');
            }
        } catch (err) {
            console.error('Send failed:', err);
            // Mark as failed instead of removing
            setMessages(prev => prev.map(msg =>
                msg._id === tempId ? { ...msg, failed: true, isOptimistic: false } : msg
            ));
        } finally {
            setSending(false);
            if (inputRef.current) {
                inputRef.current.focus();
            }
        }
    };

    // Handle Enter key
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Retry failed message
    const retryMessage = (msg) => {
        setMessages(prev => prev.filter(m => m._id !== msg._id));
        setNewMessage(msg.text);
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            width: '100%',
            background: 'var(--bg)',
            borderLeft: isCompact ? '1px solid var(--border)' : 'none',
            position: 'relative'
        }}>
            {/* Header */}
            <div style={{
                padding: isCompact ? '0.75rem 1rem' : '1rem 1.5rem',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(59, 130, 246, 0.05)',
                backdropFilter: 'blur(10px)',
                flexShrink: 0
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Shield size={isCompact ? 16 : 18} color="#3b82f6" />
                    <div>
                        <div style={{
                            fontSize: isCompact ? '0.7rem' : '0.75rem',
                            fontWeight: 900,
                            color: '#3b82f6',
                            letterSpacing: '0.1em'
                        }}>
                            SECURE CHAT
                        </div>
                        <div style={{
                            fontSize: isCompact ? '0.65rem' : '0.7rem',
                            fontWeight: 600,
                            color: 'var(--text-muted)',
                            marginTop: '0.1rem'
                        }}>
                            End-to-End Encrypted
                        </div>
                    </div>
                </div>
                {onClose && (
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: '1px solid var(--border)',
                            borderRadius: '0.5rem',
                            padding: '0.5rem',
                            cursor: 'pointer',
                            color: 'var(--text)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <X size={16} />
                    </motion.button>
                )}
            </div>

            {/* Messages */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                overflowX: 'hidden',
                padding: isCompact ? '0.75rem' : '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: isCompact ? '0.75rem' : '1rem',
                background: 'var(--bg)'
            }}>
                {loading ? (
                    <div style={{
                        textAlign: 'center',
                        color: 'var(--text-muted)',
                        padding: '2rem 1rem',
                        fontSize: isCompact ? '0.8rem' : '0.9rem'
                    }}>
                        Loading messages...
                    </div>
                ) : messages.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        color: 'var(--text-muted)',
                        padding: '2rem 1rem',
                        fontSize: isCompact ? '0.8rem' : '0.9rem'
                    }}>
                        No messages yet. Start the conversation!
                    </div>
                ) : (
                    <AnimatePresence>
                        {messages.map((msg) => {
                            const isMe = msg.senderId === user?.id || msg.senderId === 'me';
                            return (
                                <motion.div
                                    key={msg._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    style={{
                                        display: 'flex',
                                        justifyContent: isMe ? 'flex-end' : 'flex-start',
                                        opacity: msg.isOptimistic ? 0.6 : 1
                                    }}
                                >
                                    <div style={{
                                        maxWidth: isCompact ? '85%' : '75%',
                                        padding: isCompact ? '0.6rem 0.9rem' : '0.75rem 1rem',
                                        borderRadius: isMe ? '1rem 1rem 0.2rem 1rem' : '1rem 1rem 1rem 0.2rem',
                                        background: isMe ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'var(--card)',
                                        color: isMe ? 'white' : 'var(--text)',
                                        border: isMe ? 'none' : '1px solid var(--border)',
                                        wordBreak: 'break-word',
                                        boxShadow: isMe ? '0 4px 12px rgba(59, 130, 246, 0.3)' : '0 2px 8px rgba(0,0,0,0.05)',
                                        position: 'relative'
                                    }}>
                                        <div style={{
                                            fontSize: isCompact ? '0.8rem' : '0.875rem',
                                            lineHeight: '1.5',
                                            marginBottom: '0.3rem'
                                        }}>
                                            {msg.text}
                                        </div>
                                        <div style={{
                                            fontSize: '0.65rem',
                                            opacity: 0.7,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            justifyContent: isMe ? 'flex-end' : 'flex-start'
                                        }}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                            {msg.failed && (
                                                <span
                                                    onClick={() => retryMessage(msg)}
                                                    style={{
                                                        color: '#ef4444',
                                                        cursor: 'pointer',
                                                        textDecoration: 'underline'
                                                    }}
                                                >
                                                    Failed - Tap to retry
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} style={{
                padding: isCompact ? '0.75rem' : '1rem',
                borderTop: '1px solid var(--border)',
                background: 'var(--card)',
                flexShrink: 0
            }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                        ref={inputRef}
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        disabled={sending}
                        style={{
                            flex: 1,
                            padding: isCompact ? '0.6rem 0.9rem' : '0.75rem 1rem',
                            borderRadius: '0.75rem',
                            border: '1px solid var(--border)',
                            background: 'var(--bg)',
                            color: 'var(--text)',
                            fontSize: isCompact ? '0.8rem' : '0.875rem',
                            outline: 'none',
                            transition: 'border-color 0.2s ease'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                    />
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        style={{
                            padding: isCompact ? '0.6rem 0.9rem' : '0.75rem 1rem',
                            borderRadius: '0.75rem',
                            border: 'none',
                            background: newMessage.trim() && !sending ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'var(--border)',
                            color: 'white',
                            cursor: newMessage.trim() && !sending ? 'pointer' : 'not-allowed',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: isCompact ? '38px' : '42px',
                            transition: 'all 0.2s ease',
                            boxShadow: newMessage.trim() && !sending ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none'
                        }}
                    >
                        <Send size={isCompact ? 14 : 16} />
                    </motion.button>
                </div>
            </form>
        </div>
    );
};

export default Chat;
