import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Search, MessageSquare, Bell, ChevronDown, CheckSquare, LogOut } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Wallet from './components/Wallet';
import Records from './components/Records';
import Settings from './components/Settings';
import Login from './components/Login';
import Signup from './components/Signup';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CurrencyProvider } from './contexts/CurrencyContext';

const AppContent: React.FC = () => {
  const { user, loading, logout, mockRole, setMockRole, displayName } = useAuth();
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'wallet' | 'analytics' | 'transaction' | 'help' | 'settings' | 'report'>('dashboard');
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const path = window.location.pathname;

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner"></div>
        <p className="font-semibold tracking-widest uppercase text-sm">Loading...</p>
      </div>
    );
  }

  if (!user) {
    if (path === '/signup') return <Signup />;
    return <Login />;
  }



  return (
    <div className="app-container">
      {/* Top Navbar */}
      <header className="top-nav">
        <div className="nav-left">
          <div className="logo">
            <div className="logo-img">
              <LayoutDashboard size={18} />
            </div>
          </div>
          
          <div className="dropdown-container">
            <button className="dropdown-trigger" onClick={() => setShowRoleMenu(!showRoleMenu)}>
              {mockRole.charAt(0) + mockRole.slice(1).toLowerCase()} account 
              <ChevronDown size={14} className="text-gray-400" />
            </button>
            
            <AnimatePresence>
              {showRoleMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="dropdown-menu align-left"
                >
                  {['ADMIN', 'ANALYST', 'VIEWER'].map((role) => (
                    <button 
                      key={role}
                      onClick={() => { setMockRole(role); setShowRoleMenu(false); }}
                      className={`dropdown-item ${mockRole === role ? 'active' : ''}`}
                    >
                      {role.charAt(0) + role.slice(1).toLowerCase()}
                      {mockRole === role && <CheckSquare size={14} />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <span className="dashboard-tag">Dashboard</span>
        </div>

        <div className="nav-center">
          <div className="search-bar">
            <Search size={18} className="text-gray-400" />
            <input type="text" placeholder="Search..." />
            <div className="search-hint">⌘F</div>
          </div>
        </div>

        <div className="nav-right">
          <div className="nav-action-group">
            <button className="nav-icon-btn">
              <MessageSquare size={18} /> Chat
            </button>
            <button className="nav-icon-btn">
              <Bell size={20} />
            </button>
          </div>
          
          <div className="dropdown-container">
            <div 
              className="profile-group"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <img src={`https://ui-avatars.com/api/?name=${displayName}&background=16a34a&color=fff`} className="avatar" alt="Avatar" />
              <div className="profile-info">
                <p className="profile-name">{displayName}</p>
                <p className="profile-handle">@{displayName.toLowerCase()}</p>
              </div>
              <ChevronDown size={14} className="text-gray-400" />
            </div>

            <AnimatePresence>
              {showProfileMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="dropdown-menu"
                >
                  <button 
                    onClick={logout}
                    className="dropdown-item danger-text"
                  >
                    <LogOut size={16} /> Sign out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Good morning, {displayName}</h1>
            <p className="page-subtitle">This is your finance report</p>
          </div>
          <ul className="tabs">
            <li className={currentPage === 'dashboard' ? 'active' : ''} onClick={() => setCurrentPage('dashboard')}>Overview</li>
            <li className={currentPage === 'wallet' ? 'active' : ''} onClick={() => setCurrentPage('wallet')}>Wallet</li>
            <li className={currentPage === 'transaction' ? 'active' : ''} onClick={() => setCurrentPage('transaction')}>Transaction</li>
            <li className={currentPage === 'settings' ? 'active' : ''} onClick={() => setCurrentPage('settings')}>Settings</li>
            
            {/* Analyst & Admin Tabs */}
            {(mockRole === 'ADMIN' || mockRole === 'ANALYST') && (
              <>
                <li className={currentPage === 'analytics' ? 'active' : ''} onClick={() => setCurrentPage('analytics')}>Analytics</li>
              </>
            )}

            {/* Admin Only Tabs */}
            {mockRole === 'ADMIN' && (
              <>
                <li className={currentPage === 'report' ? 'active' : ''} onClick={() => setCurrentPage('report')}>Report</li>
              </>
            )}
            
            <li className={currentPage === 'help' ? 'active' : ''} onClick={() => setCurrentPage('help')}>Help</li>
          </ul>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {currentPage === 'dashboard' && <Dashboard />}
            {currentPage === 'wallet' && <Wallet />}
            {currentPage === 'transaction' && <Records />}
            {currentPage === 'settings' && <Settings />}
            
            {/* Placeholders for un-implemented items */}
            {(currentPage === 'analytics' || currentPage === 'report' || currentPage === 'help') && (
              <div className="module-placeholder">
                <p>Module coming soon: {currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <AppContent />
      </CurrencyProvider>
    </AuthProvider>
  );
};

export default App;
