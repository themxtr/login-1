import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, ClipboardList, LogOut, Settings as SettingsIcon } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Records from './components/Records';
import Settings from './components/Settings';
import Login from './components/Login';
import Signup from './components/Signup';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const AppContent: React.FC = () => {
  const { user, loading, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'records' | 'settings'>('dashboard');
  
  const path = window.location.pathname;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="text-emerald-500 font-mono tracking-widest uppercase">Initializing Vault...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (path === '/signup') return <Signup />;
    return <Login />;
  }

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-img flex items-center justify-center">
            <LayoutDashboard className="text-white" size={24} />
          </div>
          <span>Vault.</span>
        </div>
        
        <nav className="nav-links">
          {[
            { id: 'dashboard', icon: <LayoutDashboard size={22} />, label: 'Overview' },
            { id: 'records', icon: <ClipboardList size={22} />, label: 'Transactions' },
            { id: 'settings', icon: <SettingsIcon size={22} />, label: 'Settings' },
          ].map((item) => (
            <motion.li
              key={item.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage(item.id as any)}
              className={currentPage === item.id ? 'active' : ''}
            >
              {item.icon}
              <span>{item.label}</span>
            </motion.li>
          ))}
        </nav>
        
        <div className="sidebar-footer">
          <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 mb-6">
            <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mb-1">PRO ACCOUNT</p>
            <p className="text-sm font-bold text-white">AI Insights Active</p>
          </div>
          <button 
            onClick={logout}
            className="btn-logout"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {currentPage === 'dashboard' && <Dashboard />}
            {currentPage === 'records' && <Records />}
            {currentPage === 'settings' && <Settings />}
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
