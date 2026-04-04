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
        <div className="flex-1 flex flex-col min-h-0 bg-white/5 border-r border-glass-border">
          <div className="p-8">
            <div className="flex items-center gap-4 mb-12">
              <img src="/logo.svg" alt="FinanceDash" className="w-10 h-10 shadow-lg shadow-primary/20 rounded-xl" />
              <span className="text-2xl font-black tracking-tight bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
                FinanceDash
              </span>
            </div>
            
            <nav className="space-y-4">
              {[
                { id: 'dashboard', icon: <LayoutDashboard size={22} />, label: 'Overview' },
                { id: 'records', icon: <ClipboardList size={22} />, label: 'Analytics' },
                { id: 'settings', icon: <SettingsIcon size={22} />, label: 'Settings' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id as any)}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-3xl font-bold transition-all ${
                    currentPage === item.id 
                      ? 'bg-primary text-bg-deep shadow-xl shadow-primary/20' 
                      : 'text-secondary hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {item.icon}
                  <span className="text-sm tracking-wide">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
          
          <div className="mt-auto p-8 space-y-4">
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
