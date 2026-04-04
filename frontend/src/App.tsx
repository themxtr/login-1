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
          <img src="/logo.svg" alt="FinanceDash" className="w-10 h-10 shadow-lg shadow-primary/20 rounded-xl" />
          <span>FinanceDash</span>
        </div>
        
        <nav className="nav-links">
          {[
            { id: 'dashboard', icon: <LayoutDashboard size={22} />, label: 'Overview' },
            { id: 'records', icon: <ClipboardList size={22} />, label: 'Analytics' },
            { id: 'settings', icon: <SettingsIcon size={22} />, label: 'Settings' },
          ].map((item) => (
            <motion.li
              key={item.id}
              whileHover={{ x: 5 }}
              onClick={() => setCurrentPage(item.id as any)}
              className={currentPage === item.id ? 'active' : ''}
            >
              {item.icon}
              <span>{item.label}</span>
            </motion.li>
          ))}
        </nav>
        
        <div className="mt-auto pt-8 space-y-6">
          <div className="p-5 rounded-3xl bg-white/5 border border-glass-border">
            <p className="text-[10px] text-secondary font-bold uppercase tracking-widest mb-1">PRO PLAN</p>
            <p className="text-xs font-bold">Unlocking AI Insights</p>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-4 px-6 py-4 rounded-3xl text-secondary hover:bg-rose-500/10 hover:text-rose-500 transition-all font-bold"
          >
            <LogOut size={22} />
            <span className="text-sm tracking-wide">Sign Out</span>
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
