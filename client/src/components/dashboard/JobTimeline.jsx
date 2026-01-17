import { CheckCircle2, Clock, Calendar } from 'lucide-react';

const JobTimeline = () => {
    const jobs = [
        { id: 1, type: 'electrician', service: 'Electrician', date: 'Tomorrow', status: 'upcoming', icon: Clock },
        { id: 2, type: 'plumbing', service: 'Plumbing', date: 'Today 6pm', status: 'today', icon: Clock },
        { id: 3, type: 'ac', service: 'AC Repair', date: 'Yesterday', status: 'completed', icon: CheckCircle2 },
    ];

    return (
        <div className="innovative-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1rem', margin: 0 }}>Schedule</h3>
                <Calendar size={18} color="var(--text-muted)" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative' }}>
                {/* Vertical Line */}
                <div style={{
                    position: 'absolute',
                    left: '11px',
                    top: '10px',
                    bottom: '10px',
                    width: '2px',
                    background: 'var(--border)',
                    opacity: 0.5
                }}></div>

                {jobs.map((job) => (
                    <div key={job.id} style={{ display: 'flex', gap: '1rem', position: 'relative', zIndex: 1 }}>
                        <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: job.status === 'completed' ? '#10b981' : 'var(--bg)',
                            border: `2px solid ${job.status === 'completed' ? '#10b981' : 'var(--text)'}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: job.status === 'completed' ? 'white' : 'var(--text)'
                        }}>
                            <job.icon size={12} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{job.service}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{job.date}</div>
                        </div>
                        {job.status === 'today' && (
                            <div style={{
                                fontSize: '0.7rem',
                                padding: '2px 8px',
                                borderRadius: '100px',
                                background: 'rgba(var(--text-rgb), 0.1)',
                                fontWeight: 700
                            }}>
                                SOON
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <button style={{
                marginTop: '0.5rem',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left'
            }}>
                View All History →
            </button>
        </div>
    );
};

export default JobTimeline;
