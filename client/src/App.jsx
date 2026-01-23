
import { useState, useEffect } from 'react'
import PaymentForm from './components/PaymentForm';
import TechnicianList from './components/TechnicianList';

import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import AuthModal from './components/AuthModal';
import JobAlerts from './components/JobAlerts';
import TechnicianDashboard from './components/TechnicianDashboard';
import BookingHistory from './components/BookingHistory';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import CustomerDashboard from './components/CustomerDashboard';
import LandingPage from './components/LandingPage';
import ActiveJobTracking from './components/ActiveJobTracking';
import { subscribeToEvent } from './socket';
import API_URL from './config';

import ThemeToggle from './components/ThemeToggle'; // Add this import

const MainApp = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeJob, setActiveJob] = useState(null);
  const { user, logout, loading } = useAuth(); // Add loading
  const { theme, toggleTheme } = useTheme();

  // Handle Initial Loading State
  if (loading) {
    return (
      <div style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)'
      }}>
        <div className="spinner" /> {/* Assuming CSS spinner exists or just text */}
      </div>
    );
  }

  // Rest of the component logic...


  // Pusher listener for active jobs
  useEffect(() => {
    if (!user) return;

    const handleJobUpdate = (data) => {
      const { status } = data.job;
      if (status === 'accepted' || status === 'arrived' || status === 'in_progress' || status === 'completed') {
        setActiveJob(data.job);
      } else if (status === 'rejected' || status === 'cancelled') {
        // Only clear if the current activeJob is the one being rejected/cancelled
        setActiveJob(prev => (prev?._id === data.job._id ? null : prev));
        if (user?.role === 'customer' && status === 'rejected') {
          alert('Your booking request was declined. Please try another technician.');
        }
      }
    };

    const unsubscribe = subscribeToEvent(`user-${user.id}`, 'job_update', handleJobUpdate);
    return () => unsubscribe();
  }, [user]);

  // URL Routing Simulation
  useEffect(() => {
    if (window.location.pathname === '/admin') {
      // If already logged in as something else, logout or just show login (context will handle user state)
      // Ideally we check if user needs to be logged out.
      // For simplicity, let's just set the tab.
      setActiveTab('admin-login');
    }
  }, []);

  // Effect to redirect admin to dashboard on login
  useEffect(() => {
    if (user?.role === 'admin') {
      setActiveTab('admin-dashboard');
    }
  }, [user]);

  // AUTO-RECOVER ACTIVE JOB ON MOUNT
  useEffect(() => {
    if (!user) return;
    const recoverJob = async () => {
      try {
        const res = await fetch(`${API_URL}/api/bookings/user/${user.id}?role=${user.role}`);
        const jobs = await res.json();
        // Find the most recent non-completed/non-rejected job
        const active = jobs.find(j =>
          !['completed', 'rejected', 'cancelled'].includes(j.status)
        );
        if (active) setActiveJob(active);
      } catch (err) {
        console.error('Failed to recover active job:', err);
      }
    };
    recoverJob();
  }, [user]);

  const handlePaymentSuccess = () => {
    alert('Payment Successful!');
    setActiveTab('home');
  };

  const handleLoginSuccess = (role) => {
    setShowAuthModal(false);
    if (role === 'technician') {
      setActiveTab('dashboard');
    } else {
      setActiveTab('home');
    }
  };

  // IF CUSTOMER: Render dedicated Dashboard Layout
  if (user?.role === 'customer' && !activeTab.startsWith('admin')) {
    // Show tracking view only when explicitly on 'home' tab AND there's an active job
    if (activeTab === 'home' && activeJob && !['completed', 'rejected', 'cancelled'].includes(activeJob.status)) {
      return (
        <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
          <ActiveJobTracking
            job={activeJob}
            user={user}
            onStatusUpdate={(updatedJob) => {
              setActiveJob(updatedJob);
              // If job is completed, stay on tracking to show receipt
              // User can manually go back to dashboard
            }}
            onBack={() => setActiveTab('dashboard')}
          />
          <JobAlerts activeJob={activeJob} setActiveJob={setActiveJob} />
        </div>
      );
    }
    // Otherwise show the customer dashboard
    return (
      <>
        <CustomerDashboard
          activeJob={activeJob}
          setActiveJob={setActiveJob}
          setActiveTab={setActiveTab}
        />
        <JobAlerts activeJob={activeJob} setActiveJob={setActiveJob} />
      </>
    );
  }

  // IF TECHNICIAN: Render dedicated Dashboard Layout
  if (user?.role === 'technician' && !activeTab.startsWith('admin')) {
    return (
      <div style={{ background: 'var(--bg)', minHeight: '100vh', width: '100%' }}>
        {activeTab === 'home' ? (
          activeJob ? (
            <ActiveJobTracking
              job={activeJob}
              user={user}
              onStatusUpdate={setActiveJob}
              onBack={() => setActiveTab('dashboard')}
            />
          ) : (
            <TechnicianDashboard activeJob={activeJob} setActiveJob={setActiveJob} setActiveTab={setActiveTab} />
          )
        ) : (
          <TechnicianDashboard activeJob={activeJob} setActiveJob={setActiveJob} setActiveTab={setActiveTab} />
        )}
        <JobAlerts activeJob={activeJob} setActiveJob={setActiveJob} />
      </div>
    );
  }



  // Dedicated Admin Login Route
  if (activeTab === 'admin-login') {
    if (!user) return <AdminLogin />;
    if (user.role !== 'admin') {
      return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'white' }}>
          <h2>Logged in as {user.name} ({user.role})</h2>
          <p>You do not have admin permissions.</p>
          <button onClick={logout} className="btn-primary" style={{ marginTop: '1rem' }}>Logout</button>
          <br />
          <a href="#" onClick={() => setActiveTab('home')} style={{ color: 'var(--text-muted)' }}>Go Home</a>
        </div>
      );
    }
  }

  // Admin Dashboard View (Full Page)
  if (activeTab === 'admin-dashboard' && user?.role === 'admin') {
    return <AdminDashboard />;
  }

  // Main App Shell
  return (
    <div className="app-container">
      {/* Navigation (Standard) - Strictly hidden for Admins and Customers (who have their own navs) */}
      {(!user || (user.role !== 'admin' && user.role !== 'customer')) && activeTab !== 'home' && (
        <nav className={`navbar ${theme}`} style={{
          position: 'fixed',
          top: '1rem',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '90%',
          maxWidth: '1400px',
          height: '80px',
          padding: '0 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 1000,
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '1rem',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <h1 onClick={() => setActiveTab('home')} style={{ fontSize: '1.5rem', fontWeight: 800, cursor: 'pointer', fontFamily: 'var(--font-heading)', margin: 0 }}>FixItNow</h1>
            <div className="desktop-only" style={{ display: 'flex', gap: '1.5rem' }}>
              <a href="#" onClick={() => setActiveTab('home')} style={{ fontSize: '0.95rem', fontWeight: 500, color: activeTab === 'home' ? 'var(--text)' : 'var(--text-muted)', textDecoration: 'none' }}>Home</a>
              <a href="#" onClick={() => setActiveTab('services')} style={{ fontSize: '0.95rem', fontWeight: 500, color: activeTab === 'services' ? 'var(--text)' : 'var(--text-muted)', textDecoration: 'none' }}>Experts</a>
              {user?.role === 'technician' && (
                <>
                  <a href="#" onClick={() => setActiveTab('dashboard')} style={{ fontSize: '0.95rem', fontWeight: 500, color: activeTab === 'dashboard' ? 'var(--text)' : 'var(--text-muted)', textDecoration: 'none' }}>Dashboard</a>
                  <a href="#" onClick={() => setActiveTab('history')} style={{ fontSize: '0.95rem', fontWeight: 500, color: activeTab === 'history' ? 'var(--text)' : 'var(--text-muted)', textDecoration: 'none' }}>History</a>
                </>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <ThemeToggle />

            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user.name}</span>
                <button onClick={logout} style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}>Logout</button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <button onClick={() => setShowAuthModal(true)} style={{ background: 'transparent', border: 'none', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', color: 'var(--text)' }}>
                  Log In
                </button>
                <button className="btn btn-primary" onClick={() => setShowAuthModal(true)} style={{ padding: '0.7rem 1.5rem', fontSize: '0.95rem' }}>
                  Get Started
                </button>
              </div>
            )}
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className="container" style={{
        marginTop: (!user || user.role !== 'customer') ? '8rem' : '2rem',
        paddingBottom: '4rem',
        textAlign: 'center',
        maxWidth: '1400px',
        width: '100%',
        margin: '0 auto'
      }}>

        {/* PUBLIC HOME (Only when not logged in) */}
        {!user && activeTab === 'home' && (
          <LandingPage
            onFindTechnician={() => setActiveTab('services')}
            onJoinPro={() => setShowAuthModal(true)}
          />
        )}

        {activeTab === 'services' && (
          <div className="animate-fade-in">
            <TechnicianList />
          </div>
        )}

        {activeTab === 'payment' && (
          <div className="animate-fade-in">
            <PaymentForm
              amount={150.00}
              onSuccess={handlePaymentSuccess}
              onCancel={() => setActiveTab('home')}
            />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="animate-fade-in">
            <BookingHistory />
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="animate-fade-in glass-panel" style={{ padding: '3rem', maxWidth: '600px', margin: '0 auto' }}>
            <h2 className="text-gradient">My Profile</h2>
            {user ? (
              <div style={{ textAlign: 'left', marginTop: '2rem' }}>
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Role:</strong> {user.role}</p>
                <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>More settings coming soon...</p>
              </div>
            ) : (
              <div style={{ marginTop: '2rem' }}>
                <p>Please login to view your profile.</p>
                <button className="btn btn-primary" style={{ marginTop: '1.5rem', padding: '0.8rem 2rem' }} onClick={() => setShowAuthModal(true)}>Log In / Sign Up</button>
              </div>
            )}
          </div>
        )}

      </main>

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleLoginSuccess}
        />
      )}

      <JobAlerts activeJob={activeJob} setActiveJob={setActiveJob} setActiveTab={setActiveTab} />
    </div>
  )
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App
