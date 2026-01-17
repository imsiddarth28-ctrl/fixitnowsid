import { MapPin, Clock, Star, MessageSquare, X } from 'lucide-react';

const LiveJobCard = ({ job }) => {
    // Default mock data if no job is active
    const activeJob = job || {
        technician: {
            name: "Marcus Chen",
            rating: 4.9,
            photo: "https://i.pravatar.cc/150?u=marcus",
            distance: "1.2 miles",
            eta: "8 mins"
        },
        status: "Heading to your location",
        service: "AC Repair"
    };

    return (
        <div className="innovative-card" style={{
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            position: 'relative'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Active Service
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.25rem' }}>{activeJob.service}</div>
                </div>
                <div style={{ padding: '0.5rem', borderRadius: '50%', background: 'rgba(var(--text-rgb), 0.05)' }}>
                    <MapPin size={18} />
                </div>
            </div>

            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                background: 'rgba(var(--text-rgb), 0.03)',
                padding: '1rem',
                borderRadius: '1rem'
            }}>
                <img
                    src={activeJob.technician.photo}
                    alt={activeJob.technician.name}
                    style={{ width: '50px', height: '50px', borderRadius: '12px', objectFit: 'cover' }}
                />
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>{activeJob.technician.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        <Star size={14} fill="#f59e0b" color="#f59e0b" />
                        <span>{activeJob.technician.rating}</span>
                        <span>•</span>
                        <span>Top Rated</span>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ background: 'rgba(var(--text-rgb), 0.03)', padding: '0.75rem', borderRadius: '0.75rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>DISTANCE</div>
                    <div style={{ fontWeight: 700 }}>{activeJob.technician.distance}</div>
                </div>
                <div style={{ background: 'rgba(var(--text-rgb), 0.03)', padding: '0.75rem', borderRadius: '0.75rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>ETA</div>
                    <div style={{ fontWeight: 700, color: '#10b981' }}>{activeJob.technician.eta}</div>
                </div>
            </div>

            <div style={{ position: 'relative', height: '6px', background: 'rgba(var(--text-rgb), 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{
                    position: 'absolute',
                    height: '100%',
                    width: '65%',
                    background: 'var(--text)',
                    borderRadius: '3px',
                    boxShadow: '0 0 10px rgba(var(--text-rgb), 0.2)'
                }}></div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn" style={{ flex: 1, background: 'var(--text)', color: 'var(--bg)', gap: '0.5rem', padding: '0.75rem' }}>
                    <MessageSquare size={18} />
                    Chat
                </button>
                <button className="btn" style={{ border: '1px solid var(--border)', background: 'none', color: 'var(--text)', padding: '0.75rem' }}>
                    <X size={18} />
                </button>
            </div>
        </div>
    );
};

export default LiveJobCard;
