
import { useState, useEffect } from 'react';
import socket from '../socket';
import { useAuth } from '../context/AuthContext';
import LiveMap from './LiveMap';

const JobAlerts = () => {
    const { user } = useAuth();
    const [incomingJob, setIncomingJob] = useState(null);
    const [activeJob, setActiveJob] = useState(null);

    useEffect(() => {
        if (!user) return;

        // Join my room to listen
        socket.emit('join', user.id);

        const handleNewJob = (data) => {
            console.log('New Job Request:', data);
            setIncomingJob(data);
            // Play sound?
        };

        const handleJobUpdate = (data) => { // User listener
            console.log('Job Update:', data);
            if (data.job.status === 'accepted') {
                alert(`Technician accepted! Stay put.`);
                setActiveJob(data.job);
            }
        };

        socket.on('new_job_request', handleNewJob);
        socket.on('job_update', handleJobUpdate);

        return () => {
            socket.off('new_job_request', handleNewJob);
            socket.off('job_update', handleJobUpdate);
        };
    }, [user]);

    const handleResponse = (status) => {
        if (!incomingJob) return;

        socket.emit('technician_response', {
            jobId: incomingJob.job._id,
            status: status,
            customerId: incomingJob.job.customerId
        });

        if (status === 'accepted') {
            setActiveJob(incomingJob.job);
        }
        setIncomingJob(null);
    };

    if (incomingJob) {
        return (
            <div style={{
                position: 'fixed', bottom: '2rem', right: '2rem',
                background: 'var(--bg-card)', padding: '1.5rem',
                borderRadius: 'var(--radius-lg)', border: '1px solid var(--accent-color)',
                boxShadow: '0 0 20px rgba(0,0,0,0.5)', zIndex: 2000, maxWidth: '350px'
            }} className="animate-fade-in">
                <h3 className="text-gradient" style={{ marginBottom: '0.5rem' }}>New Job Request!</h3>
                <p style={{ marginBottom: '0.5rem' }}><strong>Service:</strong> {incomingJob.job.serviceType}</p>
                <p style={{ marginBottom: '0.5rem', color: 'var(--text-muted)' }}>{incomingJob.job.description}</p>
                <p style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>📍 {incomingJob.job.location.address}</p>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={() => handleResponse('rejected')}
                        style={{ flex: 1, padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--error)', color: 'var(--error)' }}
                    >
                        Decline
                    </button>
                    <button
                        onClick={() => handleResponse('accepted')}
                        className="btn-primary"
                        style={{ flex: 1 }}
                    >
                        Accept
                    </button>
                </div>
            </div>
        );
    }

    // Active Job Status Banner (For tech or user)
    if (activeJob) {
        const isTechnician = user?.role === 'technician';

        const updateStatus = (newStatus) => {
            fetch(`http://localhost:5000/api/jobs/${activeJob._id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            }).then(res => res.json())
                .then(data => setActiveJob(data))
                .catch(err => console.error(err));
        };

        return (
            <div style={{
                position: 'fixed', bottom: '0', left: '0', right: '0',
                background: 'var(--bg-card)',
                borderTop: '1px solid var(--primary-color)',
                zIndex: 1999
            }}>
                {/* MAP (Only show if not completed) */}
                {activeJob.status !== 'completed' && (
                    <div style={{ padding: '0 2rem' }}>
                        <LiveMap
                            role={isTechnician ? 'technician' : 'customer'}
                            socket={socket}
                            jobId={activeJob._id}
                        />
                    </div>
                )}

                {/* INFO BAR */}
                <div style={{
                    padding: '1.5rem',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <strong>Current Job:</strong> {activeJob.serviceType}
                        <span style={{
                            marginLeft: '1rem',
                            color: activeJob.status === 'completed' ? 'var(--success)' : 'var(--accent-color)',
                            textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 'bold'
                        }}>
                            ● {activeJob.status.replace('_', ' ')}
                        </span>
                    </div>

                    {/* Technician Controls */}
                    {isTechnician && activeJob.status !== 'completed' && (
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            {activeJob.status === 'accepted' && (
                                <button className="btn-primary" onClick={() => updateStatus('arrived')}>Mark Arrived</button>
                            )}
                            {activeJob.status === 'arrived' && (
                                <button className="btn-primary" onClick={() => updateStatus('in_progress')}>Start Job</button>
                            )}
                            {activeJob.status === 'in_progress' && (
                                <button className="btn-primary" style={{ background: 'var(--success)' }} onClick={() => updateStatus('completed')}>Complete Job</button>
                            )}
                        </div>
                    )}

                    {activeJob.status === 'completed' && (
                        <button onClick={() => { setActiveJob(null); alert('Job Closed'); }} style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}>
                            Close
                        </button>
                    )}
                </div>
            </div>
        )
    }

    return null;
};

export default JobAlerts;
