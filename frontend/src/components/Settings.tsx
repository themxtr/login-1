import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Globe, Shield, Save, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { type Role } from '../services/api';

const Settings = () => {
  const { user, mockRole, setMockRole } = useAuth();
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState(user?.email?.split('@')[0] || '');
  const [currency, setCurrency] = useState('USD');
  
  const handleSave = () => {
    localStorage.setItem('currency', currency);
    localStorage.setItem('displayName', name);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleRoleSwitch = (role: Role) => {
    setMockRole(role);
    localStorage.setItem('mockRole', role);
  };

  const roles: { id: Role; desc: string }[] = [
    { id: 'ADMIN', desc: 'Full access to create, edit, and delete records.' },
    { id: 'ANALYST', desc: 'Read records and view dashboard analytics.' },
    { id: 'VIEWER', desc: 'Basic read-only access to records list.' }
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="settings-grid">
        {/* Profile Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
              <User size={20} />
            </div>
            <h3 className="text-xl font-bold">Profile Info</h3>
          </div>

          <div className="space-y-4">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="text" 
                value={user?.email || ''} 
                disabled 
                className="form-input opacity-50 cursor-not-allowed"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Display Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="form-input"
                placeholder="Your name"
              />
            </div>
          </div>
        </motion.div>

        {/* Preferences Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500">
              <Globe size={20} />
            </div>
            <h3 className="text-xl font-bold">Preferences</h3>
          </div>

          <div className="space-y-4">
            <div className="form-group">
              <label className="form-label">Default Currency</label>
              <select 
                className="form-select"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Regional Format</label>
              <select className="form-select">
                <option>United States (MM/DD/YYYY)</option>
                <option>Europe (DD/MM/YYYY)</option>
              </select>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Role Management Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
            <Shield size={20} />
          </div>
          <h3 className="text-xl font-bold">Perspective Management</h3>
        </div>

        <p className="text-secondary mb-6 max-w-2xl text-sm leading-relaxed">
          Switch roles to simulate different user experiences and test permission-based UI elements. 
          This affects your current session and API interaction.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {roles.map((r) => (
            <motion.div 
              key={r.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleRoleSwitch(r.id)}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                mockRole === r.id 
                  ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(16,185,129,0.1)]' 
                  : 'border-glass-border hover:border-white/20 hover:bg-white/5'
              }`}
            >
              <div className="flex justify-between items-center mb-3">
                <span className={`font-bold tracking-wide ${mockRole === r.id ? 'text-primary' : 'text-primary-text'}`}>{r.id}</span>
                {mockRole === r.id && (
                  <div className="bg-primary text-bg-deep p-1 rounded-full">
                    <Check size={12} strokeWidth={3} />
                  </div>
                )}
              </div>
              <p className="text-xs text-secondary leading-relaxed">
                {r.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSave}
          className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold transition-all shadow-xl ${
            saved ? 'bg-success text-white' : 'bg-primary text-bg-deep shadow-primary/20'
          }`}
        >
          {saved ? <Check size={20} /> : <Save size={20} />}
          {saved ? 'Settings Saved' : 'Save Changes'}
        </motion.button>
      </div>
    </div>
  );
};

export default Settings;
