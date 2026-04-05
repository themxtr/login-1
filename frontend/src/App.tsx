import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Search, MessageSquare, Bell, ChevronDown, CheckSquare, LogOut } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Records from './components/Records';
import Settings from './components/Settings';
import Login from './components/Login';
import Signup from './components/Signup';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const AppContent: React.FC = () => {
  const { user, loading, logout, mockRole, setMockRole } = useAuth();
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'wallet' | 'analytics' | 'transaction' | 'settings'>('dashboard');
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const path = window.location.pathname;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 text-emerald-600">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="font-semibold tracking-widest uppercase text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (path === '/signup') return <Signup />;
    return <Login />;
  }

  // Generate a friendly name from email or fall back to 'Jaylon' to match mockup
  const displayName = user.email ? user.email.split('@')[0].replace(/[^a-zA-Z]/g, ' ') : 'Jaylon';
  const capitalizedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

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
          
          <div className="relative">
            <div className="role-switcher" onClick={() => setShowRoleMenu(!showRoleMenu)}>
              {mockRole.charAt(0) + mockRole.slice(1).toLowerCase()} account 
              <ChevronDown size={14} className="text-gray-400" />
            </div>
            
            <AnimatePresence>
              {showRoleMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50"
                >
                  {['ADMIN', 'ANALYST', 'VIEWER'].map((role) => (
                    <button 
                      key={role}
                      onClick={() => { setMockRole(role); setShowRoleMenu(false); }}
                      className={`w-full text-left px-4 py-2 text-sm font-medium hover:bg-gray-50 flex items-center justify-between ${mockRole === role ? 'text-emerald-600' : 'text-gray-700'}`}
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
            <div className="text-xs text-gray-400 font-mono px-2 py-1 bg-white rounded border border-gray-200">⌘F</div>
          </div>
        </div>

        <div className="nav-right">
          <button className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-semibold text-sm transition-colors">
            <MessageSquare size={18} /> Chat
          </button>
          <button className="text-gray-500 hover:text-gray-900 transition-colors">
            <Bell size={20} />
          </button>
          
          <div className="relative">
            <div 
              className="flex items-center gap-3 pl-4 border-l border-gray-200 cursor-pointer"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <img src={`https://ui-avatars.com/api/?name=${capitalizedName}&background=16a34a&color=fff`} className="avatar" alt="Avatar" />
              <div className="hidden sm:block">
                <p className="text-sm font-bold text-gray-900 leading-tight">{capitalizedName} Baptista</p>
                <p className="text-xs text-gray-500">@{displayName.toLowerCase()}baptista</p>
              </div>
              <ChevronDown size={14} className="text-gray-400" />
            </div>

            <AnimatePresence>
              {showProfileMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50"
                >
                  <button 
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
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
            <h1>Good morning, {capitalizedName}</h1>
            <p>This is your finance report</p>
          </div>
          <ul className="tabs hidden sm:flex">
            <li className={currentPage === 'dashboard' ? 'active' : ''} onClick={() => setCurrentPage('dashboard')}>Overview</li>
            <li className={currentPage === 'wallet' ? 'active' : ''} onClick={() => setCurrentPage('wallet')}>Wallet</li>
            <li className={currentPage === 'analytics' ? 'active' : ''} onClick={() => setCurrentPage('analytics')}>Analytics</li>
            <li className={currentPage === 'transaction' ? 'active' : ''} onClick={() => setCurrentPage('transaction')}>Transaction</li>
            <li className="text-gray-400">Help</li>
            <li className={currentPage === 'settings' ? 'active' : ''} onClick={() => setCurrentPage('settings')}>Settings</li>
            <li className="text-gray-400">Report</li>
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
            {currentPage === 'transaction' && <Records />}
            {currentPage === 'settings' && <Settings />}
            {(currentPage === 'wallet' || currentPage === 'analytics') && (
              <div className="py-20 text-center text-gray-400">Module coming soon</div>
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
      <AppContent />
    </AuthProvider>
  );
};

export default App;
