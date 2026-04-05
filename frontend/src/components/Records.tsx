import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, X, Filter, Search } from 'lucide-react';
import { api, type Transaction } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';

const Records = () => {
  const { mockRole } = useAuth();
  const { formatAmount, currency: globalCurrency } = useCurrency();
  const isReadOnly = mockRole === 'VIEWER';
  const roleLabel = mockRole.charAt(0) + mockRole.slice(1).toLowerCase();

  const [records, setRecords] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({ type: '', category: '' });
  
  const [formData, setFormData] = useState({
    amount: '',
    type: 'EXPENSE',
    category: '',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const data = await api.getRecords(filters as any);
      setRecords(data || []);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [filters]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) return;

    try {
      await api.createRecord({
        ...formData,
        amount,
        date: new Date(formData.date).toISOString()
      } as any);
      setShowModal(false);
      setFormData({
        amount: '',
        type: 'EXPENSE',
        category: '',
        notes: '',
        date: new Date().toISOString().split('T')[0]
      });
      fetchRecords();
    } catch (err: any) {
      alert(`Asset creation failed: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (isReadOnly) return;
    if (!confirm('Are you sure you want to delete this asset record?')) return;
    try {
      await api.deleteRecord(id);
      fetchRecords();
    } catch (err: any) {
      alert(`Deletion failed: ${err.message}`);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="card-layout"
    >
      <div className="page-header" style={{ marginBottom: '2rem', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Asset Ledger</h1>
          <p className="page-subtitle">Detailed history of all indexed transactions</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'white', padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
          <div className={`w-2 h-2 rounded-full ${isReadOnly ? 'bg-warning' : 'bg-success'}`} style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isReadOnly ? 'var(--warning)' : 'var(--success)' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Perspective: {roleLabel}</span>
        </div>
      </div>

      {/* Header Toolbar */}
      <div className="toolbar card" style={{ padding: '1rem 1.5rem', borderRadius: '20px', display: 'flex', justifyContent: 'space-between' }}>
        <div className="toolbar-section">
          <div style={{ position: 'relative' }}>
            <Filter size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <select 
              className="form-select"
              style={{ paddingLeft: '2.5rem' }}
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            >
              <option value="">All Types</option>
              <option value="INCOME">Income / Revenue</option>
              <option value="EXPENSE">Expense / Burn</option>
            </select>
          </div>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Search category..."
              className="form-input"
              style={{ paddingLeft: '2.5rem', width: '250px' }}
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            />
          </div>
        </div>

        <div>
          {!isReadOnly && (
            <motion.button 
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              onClick={() => setShowModal(true)}
            >
              <Plus size={20} /> New Asset Record
            </motion.button>
          )}
        </div>
      </div>

      {/* Records Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--glass-border)' }}>
          <h3 className="section-title">Transaction History</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Detailed ledger of all movements</p>
        </div>
        
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Type</th>
              <th>Amount</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {records.map((record) => (
                <motion.tr 
                  key={record.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    {new Date(record.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td style={{ fontWeight: 700 }}>{record.category}</td>
                  <td>
                    <span className={`trend-pill ${record.type === 'INCOME' ? 'up' : 'down'}`}>
                      {record.type === 'INCOME' ? 'Revenue' : 'Expense'}
                    </span>
                  </td>
                  <td style={{ fontWeight: 800, color: record.type === 'INCOME' ? 'var(--success)' : 'var(--text-primary)' }}>
                    {record.type === 'INCOME' ? '+' : '-'}{formatAmount(record.amount)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button className="copy-btn" style={{ padding: '0.5rem' }}>
                        <Edit2 size={16} />
                      </button>
                      {!isReadOnly && (
                        <button 
                          className="copy-btn" 
                          style={{ padding: '0.5rem', color: 'var(--error)' }}
                          onClick={() => handleDelete(record.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>

        {records.length === 0 && !loading && (
          <div style={{ padding: '4rem', textAlign: 'center' }}>
            <Search size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
            <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>No records found.</p>
          </div>
        )}
      </div>

      {/* Add Record Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="modal-overlay">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="modal-content"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>New Entry</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Capture a new movement in your ledger</p>
                </div>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Transaction Amount</label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 800, color: 'var(--primary)' }}>
                      {globalCurrency === 'USD' ? '$' : '₹'}
                    </div>
                    <input 
                      type="number" required step="0.01" 
                      className="form-input"
                      style={{ paddingLeft: '2.5rem', fontSize: '1.25rem', fontWeight: 700 }}
                      placeholder="0.00"
                      value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select 
                      className="form-select"
                      value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                      <option value="EXPENSE">Expense</option>
                      <option value="INCOME">Income</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date</label>
                    <input 
                      type="date" required 
                      className="form-input"
                      value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <input 
                    type="text" required placeholder="e.g. Salary, Food, Rent"
                    className="form-input"
                    value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn-primary"
                  style={{ marginTop: '1rem', padding: '1rem' }}
                >
                  Post Transaction
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Records;
