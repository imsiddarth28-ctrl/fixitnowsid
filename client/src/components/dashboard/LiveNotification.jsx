import { useEffect, useState } from 'react';
import { Bell, CheckCircle, Info } from 'lucide-react';

const LiveNotification = () => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        // Simulate a new notification after 5 seconds
        const timer = setTimeout(() => {
            const newNotif = {
                id: Date.now(),
                title: "Technician Arrived",
                message: "Marcus is at your door.",
                type: "success"
            };
            setNotifications(prev => [newNotif, ...prev]);

            // Auto remove after 5s
            setTimeout(() => {
                setNotifications(prev => prev.filter(n => n.id !== newNotif.id));
            }, 5000);
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    if (notifications.length === 0) return null;

    return (
        <div style={{
            position: 'fixed',
            top: '2rem',
            right: '2rem',
            zIndex: 2000,
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
        }}>
            {notifications.map(n => (
                <div key={n.id} className="notification-card animate-slide-in">
                    <div className={`notification-icon ${n.type}`}>
                        {n.type === 'success' ? <CheckCircle size={18} /> : <Info size={18} />}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{n.title}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{n.message}</div>
                    </div>
                </div>
            ))}

            <style>{`
                .notification-card {
                    background: var(--bg);
                    border: 1px solid var(--border);
                    padding: 1rem;
                    border-radius: 1rem;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    min-width: 250px;
                    backdrop-filter: blur(10px);
                }
                .notification-icon.success {
                    color: #10b981;
                }
                .animate-slide-in {
                    animation: slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                @keyframes slideIn {
                    from { transform: translateX(100px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default LiveNotification;
