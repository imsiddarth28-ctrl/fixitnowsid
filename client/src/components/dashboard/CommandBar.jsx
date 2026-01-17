import { Bell, Moon, Sun, Search, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const CommandBar = ({ jobStatus = "Technician on the way" }) => {
    const { user } = useAuth();

    return (
        <div className="glass-morphism" style={{
            margin: '1.5rem 2rem',
            padding: '1rem 2rem',
            borderRadius: '100px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 100
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'var(--text)',
                        color: 'var(--bg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800
                    }}>
                        F
                    </div>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                            Good evening, {user?.name?.split(' ')[0]} 👋
                        </div>
                    </div>
                </div>

                <div className="status-badge status-online">
                    <div className="status-pulse"></div>
                    {jobStatus}
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'rgba(var(--text-rgb), 0.05)',
                    padding: '0.5rem 1rem',
                    borderRadius: '100px',
                    border: '1px solid rgba(var(--text-rgb), 0.1)'
                }}>
                    <Search size={16} color="var(--text-muted)" />
                    <input
                        type="text"
                        placeholder="Search services..."
                        style={{
                            background: 'none',
                            border: 'none',
                            outline: 'none',
                            color: 'var(--text)',
                            fontSize: '0.9rem',
                            width: '200px'
                        }}
                    />
                </div>

                <button className="icon-btn">
                    <Bell size={20} />
                </button>

                <button className="icon-btn" onClick={() => document.documentElement.classList.toggle('dark')}>
                    <Sun size={20} className="sun-icon" />
                    <Moon size={20} className="moon-icon" />
                </button>

                <div style={{
                    height: '24px',
                    width: '1px',
                    background: 'var(--border)',
                    margin: '0 0.5rem'
                }}></div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{user?.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Premium Member</div>
                    </div>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: 'var(--card-hover)',
                        border: '1px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <User size={18} />
                    </div>
                </div>
            </div>

            <style>{`
                .icon-btn {
                    background: none;
                    border: none;
                    color: var(--text);
                    cursor: pointer;
                    padding: 0.5rem;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                }
                .icon-btn:hover {
                    background: rgba(var(--text-rgb), 0.1);
                }
                .dark .sun-icon { display: none; }
                &:not(.dark) .moon-icon { display: none; }
            `}</style>
        </div>
    );
};

export default CommandBar;
