
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

const MainApp = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

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
    } else if (user && window.location.pathname === '/admin') {
      // If logged in as non-admin on admin page, logout or redirect home?
      // Let's force logout to allow admin login
      // logout(); // This might cause infinite loop if not careful.
      // Better: Don't auto-redirect. AdminLogin component checks '!user'.
      // If 'user' exists and is not admin, we should render 'Access Denied' or button to Logout.
    }
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
    return (
      <>
        <CustomerDashboard />
        <JobAlerts />
      </>
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
    return (
      <div>
        <nav className="glass-panel" style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 className="text-gradient">FixItNow Admin</h1>
          <button onClick={logout} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>Logout</button>
        </nav>
        <AdminDashboard />
      </div>
    )
  }

  return (
    <div className="app-container">
      {/* Navigation (Standard) - Hidden for Admin Dashboard / Customer Dashboard / Public Landing Page */}
      {((!user && activeTab !== 'home') || (user && user.role !== 'customer')) && (
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
            <button onClick={toggleTheme} style={{ fontSize: '1.2rem', padding: '0.5rem', background: 'transparent', border: 'none', cursor: 'pointer', opacity: 0.8 }}>
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

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
      <main className="container" style={{ marginTop: (!user || user.role !== 'customer') ? '8rem' : '2rem', paddingBottom: '4rem', textAlign: 'center' }}>

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

        {activeTab === 'dashboard' && user?.role === 'technician' && (
          <div className="animate-fade-in">
            <TechnicianDashboard />
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

      <JobAlerts />
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
