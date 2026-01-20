import { useState, useEffect, useRef } from 'react';
import { Send, X } from 'lucide-react';
import { subscribeToEvent } from '../socket';
import API_URL from '../config';

const Chat = ({ jobId, receiverId, onClose, isCompact = false }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Fetch chat history - optimized with abort controller
    useEffect(() => {
        const abortController = new AbortController();

        const fetchMessages = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${API_URL}/api/chat/${jobId}`, {
                    signal: abortController.signal
                });
                if (res.ok) {
                    const data = await res.json();
                    setMessages(data);
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

    // Real-time message listener - optimized
    useEffect(() => {
        if (!jobId) return;

        const handleNewMessage = (data) => {
            setMessages(prev => {
                // Prevent duplicates
                if (prev.some(msg => msg._id === data._id)) {
                    return prev;
                }
                return [...prev, data];
            });
        };

        const unsubscribe = subscribeToEvent(`job-${jobId}`, 'receive_message', handleNewMessage);
        return () => unsubscribe();
    }, [jobId]);

    // Auto-scroll to bottom - optimized
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Send message - optimized with immediate UI update
    const sendMessage = async (e) => {
        e?.preventDefault();
        if (!newMessage.trim() || sending) return;

        const messageText = newMessage.trim();
        setNewMessage('');
        setSending(true);

        // Optimistic UI update
        const tempMessage = {
            _id: `temp-${Date.now()}`,
            text: messageText,
            senderId: 'me',
            timestamp: new Date().toISOString(),
            isOptimistic: true
        };
        setMessages(prev => [...prev, tempMessage]);

        try {
            const res = await fetch(`${API_URL}/api/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jobId,
                    senderId: 'current-user',
                    senderRole: 'customer',
                    text: messageText,
                    receiverId
                })
            });

            if (res.ok) {
                const savedMessage = await res.json();
                // Replace optimistic message with real one
                setMessages(prev => prev.map(msg =>
                    msg._id === tempMessage._id ? savedMessage : msg
                ));
            } else {
                throw new Error('Failed to send');
            }
        } catch (err) {
            console.error('Send failed:', err);
            // Remove optimistic message on error
            setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
            setNewMessage(messageText); // Restore message
            alert('Failed to send message. Please try again.');
        } finally {
            setSending(false);
            inputRef.current?.focus();
        }
    };

    // Handle Enter key
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            background: 'var(--bg)',
            borderLeft: isCompact ? 'none' : '1px solid var(--border)'
        }}>
            {/* Header */}
            <div style={{
                padding: isCompact ? '1rem' : '1.5rem',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'var(--card)'
            }}>
                <div>
                    <div style={{
                        fontSize: isCompact ? '0.75rem' : '0.85rem',
                        fontWeight: 900,
                        color: '#3b82f6',
                        letterSpacing: '0.1em',
                        marginBottom: '0.3rem'
                    }}>
                        SECURE CHAT
                    </div>
                    <div style={{
                        fontSize: isCompact ? '0.8rem' : '0.9rem',
                        fontWeight: 700,
                        color: 'var(--text)'
                    }}>
                        End-to-End Encrypted
                    </div>
                </div>
                {onClose && (
                    <button
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
                            justifyContent: 'center'
                        }}
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* Messages */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: isCompact ? '1rem' : '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
            }}>
                {loading ? (
                    <div style={{
                        textAlign: 'center',
                        color: 'var(--text-muted)',
                        padding: '2rem',
                        fontSize: '0.9rem'
                    }}>
                        Loading messages...
                    </div>
                ) : messages.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        color: 'var(--text-muted)',
                        padding: '2rem',
                        fontSize: '0.9rem'
                    }}>
                        No messages yet. Start the conversation!
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.senderId === 'me' || msg.senderRole === 'customer';
                        return (
                            <div
                                key={msg._id}
                                style={{
                                    display: 'flex',
                                    justifyContent: isMe ? 'flex-end' : 'flex-start',
                                    opacity: msg.isOptimistic ? 0.6 : 1
                                }}
                            >
                                <div style={{
                                    maxWidth: '70%',
                                    padding: isCompact ? '0.6rem 1rem' : '0.8rem 1.2rem',
                                    borderRadius: '1rem',
                                    background: isMe ? '#3b82f6' : 'var(--card)',
                                    color: isMe ? 'white' : 'var(--text)',
                                    border: isMe ? 'none' : '1px solid var(--border)',
                                    wordBreak: 'break-word'
                                }}>
                                    <div style={{
                                        fontSize: isCompact ? '0.85rem' : '0.9rem',
                                        lineHeight: '1.5'
                                    }}>
                                        {msg.text}
                                    </div>
                                    <div style={{
                                        fontSize: '0.65rem',
                                        marginTop: '0.4rem',
                                        opacity: 0.7
                                    }}>
                                        {new Date(msg.timestamp).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} style={{
                padding: isCompact ? '1rem' : '1.5rem',
                borderTop: '1px solid var(--border)',
                background: 'var(--card)'
            }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
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
                            padding: isCompact ? '0.7rem 1rem' : '0.8rem 1.2rem',
                            borderRadius: '0.75rem',
                            border: '1px solid var(--border)',
                            background: 'var(--bg)',
                            color: 'var(--text)',
                            fontSize: isCompact ? '0.85rem' : '0.9rem',
                            outline: 'none'
                        }}
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        style={{
                            padding: isCompact ? '0.7rem' : '0.8rem',
                            borderRadius: '0.75rem',
                            border: 'none',
                            background: newMessage.trim() && !sending ? '#3b82f6' : 'var(--border)',
                            color: 'white',
                            cursor: newMessage.trim() && !sending ? 'pointer' : 'not-allowed',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: isCompact ? '40px' : '45px',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <Send size={isCompact ? 16 : 18} />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Chat;
