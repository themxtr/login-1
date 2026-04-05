import { motion } from 'framer-motion';
import { CreditCard, Plus, ArrowUpRight, ArrowDownRight, Smartphone, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Wallet = () => {
  const { mockRole } = useAuth();
  const isViewer = mockRole === 'VIEWER';
  
  const displayVal = (val: number) => {
    if (isViewer) return '****';
    return `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="card-layout">
      {/* Wallet Summary */}
      <div className="grid-2">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ background: 'linear-gradient(135deg, #111827, #374151)', color: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <p style={{ color: '#9ca3af', fontSize: '0.85rem', fontWeight: 600 }}>Total Balance</p>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 800 }}>{displayVal(24500.50)}</h2>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.75rem', borderRadius: '12px' }}>
              <CreditCard size={28} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <div style={{ flex: 1 }}>
              <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Card Number</p>
              <p style={{ fontFamily: 'monospace', fontSize: '1.1rem', letterSpacing: '2px' }}>**** **** **** 4281</p>
            </div>
            <div>
              <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Valid Thru</p>
              <p style={{ fontFamily: 'monospace', fontSize: '1.1rem' }}>12/28</p>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions & Limits */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card balance-card">
          <div className="section-header" style={{ marginBottom: '1.5rem' }}>
            <h3 className="section-title">Quick Actions</h3>
          </div>
          <div className="grid-3" style={{ marginBottom: '1.5rem', gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <button className="btn-secondary" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', border: 'none', background: 'rgba(22, 163, 74, 0.05)' }} disabled={isViewer}>
              <ArrowUpRight size={20} />
              <span style={{ fontSize: '0.75rem' }}>Send</span>
            </button>
            <button className="btn-secondary" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', border: 'none', background: 'rgba(59, 130, 246, 0.05)', color: '#3b82f6' }} disabled={isViewer}>
              <ArrowDownRight size={20} />
              <span style={{ fontSize: '0.75rem' }}>Receive</span>
            </button>
            <button className="btn-secondary" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', border: 'none', background: 'rgba(139, 92, 246, 0.05)', color: '#8b5cf6' }} disabled={isViewer}>
              <Smartphone size={20} />
              <span style={{ fontSize: '0.75rem' }}>Top Up</span>
            </button>
          </div>
          
          <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '1rem', border: '1px solid #e5e7eb' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Monthly Limit</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{displayVal(1250)} / {displayVal(5000)}</span>
             </div>
             <div style={{ width: '100%', height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '25%', height: '100%', background: '#16a34a' }}></div>
             </div>
          </div>
        </motion.div>
      </div>

      {/* Linked Accounts */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card">
        <div className="section-header" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="card-icon-green" style={{ marginBottom: 0, width: 32, height: 32, background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              <ShieldCheck size={16} />
            </div>
            <h3 className="section-title">Linked Payment Methods</h3>
          </div>
          <button className="copy-btn" disabled={isViewer} style={{ background: 'rgba(22, 163, 74, 0.1)' }}>
            <Plus size={16} /> Add Method
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', border: '1px solid #e5e7eb', borderRadius: '12px', background: '#f9fafb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 48, height: 32, background: '#111827', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '0.7rem', fontStyle: 'italic' }}>VISA</div>
              <div>
                <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>Visa Classic</p>
                <p style={{ color: '#6b7280', fontSize: '0.75rem' }}>**** 4281 • Expires 12/28</p>
              </div>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', background: 'rgba(22, 163, 74, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>Primary</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', border: '1px solid #e5e7eb', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 48, height: 32, background: '#f59e0b', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '0.7rem', fontStyle: 'italic' }}>MC</div>
              <div>
                <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>Mastercard Gold</p>
                <p style={{ color: '#6b7280', fontSize: '0.75rem' }}>**** 8842 • Expires 08/25</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Wallet;
