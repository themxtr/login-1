import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, ClipboardList, LogOut, Wallet, Settings as SettingsIcon } from 'lucide-react';
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
          <div className="logo-icon"><Wallet className="text-emerald-500" /></div>
          <span>FinanceDash</span>
        </div>
        
        <ul className="nav-links">
          <motion.li 
            whileHover={{ x: 5 }}
            className={currentPage === 'dashboard' ? 'active' : ''} 
            onClick={() => setCurrentPage('dashboard')}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </motion.li>
          <motion.li 
            whileHover={{ x: 5 }}
            className={currentPage === 'records' ? 'active' : ''} 
            onClick={() => setCurrentPage('records')}
          >
            <ClipboardList size={20} />
            <span>Records</span>
          </motion.li>
          <motion.li 
            whileHover={{ x: 5 }}
            className={currentPage === 'settings' ? 'active' : ''} 
            onClick={() => setCurrentPage('settings')}
          >
            <SettingsIcon size={20} />
            <span>Settings</span>
          </motion.li>
        </ul>

        <div className="sidebar-footer">
          <div className="flex items-center gap-3 mb-6 p-2 bg-white/5 rounded-xl">
             <img 
               src={`https://ui-avatars.com/api/?name=${user.email}&background=10b981&color=fff&bold=true`} 
               alt="User" 
               className="w-10 h-10 rounded-lg shadow-lg"
             />
             <div className="overflow-hidden">
               <p className="text-sm font-bold truncate">{user.email?.split('@')[0]}</p>
               <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Account Holder</p>
             </div>
          </div>
          <button className="btn-logout flex items-center justify-center gap-2" onClick={logout}>
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="top-nav">
          <motion.h1 
            key={currentPage}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="capitalize"
          >
            {currentPage}
          </motion.h1>
          <div className="flex items-center gap-4">
             <div className="hidden md:block text-right">
               <p className="text-sm font-medium">{user.email}</p>
               <p className="text-xs text-secondary">Verified Session</p>
             </div>
             <div className="w-10 h-10 rounded-full border border-emerald-500/20 p-0.5">
               <img 
                 src={`https://ui-avatars.com/api/?name=${user.email}&background=10b981&color=fff`} 
                 alt="Profile" 
                 className="w-full h-full rounded-full"
               />
             </div>
          </div>
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
