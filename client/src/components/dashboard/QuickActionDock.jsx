import { Wrench, PhoneCall, CreditCard, History, Zap } from 'lucide-react';

const QuickActionDock = ({ onAction }) => {
    const actions = [
        { id: 'book', icon: Wrench, label: 'Book Service', primary: true },
        { id: 'emergency', icon: Zap, label: 'Emergency', danger: true },
        { id: 'support', icon: PhoneCall, label: 'Support' },
        { id: 'payments', icon: CreditCard, label: 'Payments' },
        { id: 'history', icon: History, label: 'History' },
    ];

    return (
        <div className="floating-nav">
            {actions.map((action) => (
                <button
                    key={action.id}
                    onClick={() => onAction(action.id)}
                    className={`dock-item ${action.primary ? 'primary' : ''} ${action.danger ? 'danger' : ''}`}
                    title={action.label}
                >
                    <action.icon size={20} />
                    <span className="dock-label">{action.label}</span>
                </button>
            ))}

            <style>{`
                .dock-item {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.75rem 1.25rem;
                    border-radius: 100px;
                    border: none;
                    background: transparent;
                    color: var(--text);
                    font-weight: 600;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    white-space: nowrap;
                    overflow: hidden;
                    max-width: 48px;
                }

                .dock-item:hover {
                    max-width: 200px;
                    background: rgba(var(--text-rgb), 0.1);
                }

                .dock-item.primary {
                    background: var(--text);
                    color: var(--bg);
                    max-width: 200px;
                }

                .dock-item.danger {
                    color: var(--error);
                }
                
                .dock-item.danger:hover {
                    background: rgba(239, 68, 68, 0.1);
                }

                .dock-label {
                    opacity: 0;
                    transform: translateX(-10px);
                    transition: all 0.3s ease;
                }

                .dock-item:hover .dock-label,
                .dock-item.primary .dock-label {
                    opacity: 1;
                    transform: translateX(0);
                }

                .primary .dock-label {
                    opacity: 1;
                    transform: translateX(0);
                }
            `}</style>
        </div>
    );
};

export default QuickActionDock;
