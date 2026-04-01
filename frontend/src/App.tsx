import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import Records from './components/Records';
import RoleSwitcher from './components/RoleSwitcher';
import Login from './components/Login';
import Signup from './components/Signup';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './App.css';

const AppContent: React.FC = () => {
  const { user, loading, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'records'>('dashboard');
  
  // Basic routing for Login/Signup if not authenticated
  const path = window.location.pathname;

  if (loading) {
    return <div className="loading-screen">Loading Finance Dash...</div>;
  }

  if (!user) {
    if (path === '/signup') return <Signup />;
    return <Login />;
  }

  return (
    <div className="app-container">
      <nav className="sidebar glass">
        <div className="logo">
          <div className="logo-icon">💰</div>
          <span>FinanceDash</span>
        </div>
        <ul className="nav-links">
          <li 
            className={currentPage === 'dashboard' ? 'active' : ''} 
            onClick={() => setCurrentPage('dashboard')}
          >
            Dashboard
          </li>
          <li 
            className={currentPage === 'records' ? 'active' : ''} 
            onClick={() => setCurrentPage('records')}
          >
            Records
          </li>
        </ul>
        <div className="sidebar-footer">
          <div className="user-info">
            <p className="user-email text-truncate">{user.email}</p>
            <button className="btn-logout" onClick={logout}>Logout</button>
          </div>
        </div>
      </nav>

      <main className="main-content">
        <header className="top-nav glass">
          <h1>{currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}</h1>
          <div className="user-profile">
            <img src={`https://ui-avatars.com/api/?name=${user.email}&background=2ecc71&color=fff`} alt="Avatar" />
          </div>
        </header>

        <div className="page-content">
          {currentPage === 'dashboard' ? <Dashboard /> : <Records />}
        </div>
      </main>

      {/* Role Switcher is still useful for testing different perspective logic in the UI */}
      <RoleSwitcher />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
