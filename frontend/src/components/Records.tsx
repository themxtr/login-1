import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, X, Filter, Search, Calendar, DollarSign, Tag } from 'lucide-react';
import { api, type Transaction } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Records = () => {
  const { user } = useAuth();
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
      setRecords(data);
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
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    try {
      await api.deleteRecord(id);
      fetchRecords();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
            <select 
              className="pl-10 pr-4 py-2 bg-glass-bg border border-glass-border rounded-xl text-primary-text focus:outline-none focus:border-primary-main transition-all appearance-none"
              style={{ background: 'var(--bg-surface)', color: 'white', borderRadius: '12px', padding: '10px 20px 10px 40px' }}
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            >
              <option value="">All Types</option>
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
            </select>
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
            <input 
              type="text" 
              placeholder="Search category..."
              className="pl-10 pr-4 py-2 bg-glass-bg border border-glass-border rounded-xl text-primary-text focus:outline-none focus:border-primary-main transition-all"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '12px', padding: '10px 20px 10px 40px' }}
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            />
          </div>
        </div>
        
        {user && (
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-bg-deep font-bold rounded-xl shadow-lg shadow-primary/20 transition-all"
            onClick={() => setShowModal(true)}
          >
            <Plus size={20} /> Add Record
          </motion.button>
        )}
      </div>

      {/* Records Table */}
      <div className="card !p-0 overflow-hidden">
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Type</th>
                <th>Amount</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {records.map((record) => (
                  <motion.tr 
                    key={record.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <td className="text-secondary">{new Date(record.date).toLocaleDateString()}</td>
                    <td className="font-medium">{record.category}</td>
                    <td>
                      <span className={`badge ${record.type === 'INCOME' ? 'badge-income' : 'badge-expense'}`}>
                        {record.type}
                      </span>
                    </td>
                    <td className={`font-bold ${record.type === 'INCOME' ? 'text-primary' : 'text-error'}`}>
                      {record.type === 'INCOME' ? '+' : '-'}${record.amount.toLocaleString()}
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 hover:bg-white/5 rounded-lg text-secondary hover:text-white transition-colors">
                          <Edit2 size={16} />
                        </button>
                        {user && (
                          <button 
                            className="p-2 hover:bg-error/10 rounded-lg text-error/60 hover:text-error transition-colors"
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
            <div className="py-20 text-center text-secondary">
              <div className="mb-4 opacity-20">📭</div>
              <p>No records found. Start by adding a new transaction.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Record Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="modal-overlay">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="card modal-content"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">New Transaction</h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-secondary">Amount</label>
                  <div className="relative">
                    <DollarSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
                    <input 
                      type="number" required step="0.01" 
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-primary outline-none transition-all"
                      value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-secondary">Type</label>
                    <select 
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-primary outline-none appearance-none"
                      value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                      <option value="EXPENSE">Expense</option>
                      <option value="INCOME">Income</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-secondary">Date</label>
                    <div className="relative">
                      <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none" />
                      <input 
                        type="date" required 
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-primary outline-none"
                        value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-secondary">Category</label>
                  <div className="relative">
                    <Tag size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
                    <input 
                      type="text" required placeholder="e.g. Groceries, Rent, Salary"
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-primary outline-none"
                      value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    />
                  </div>
                </div>

                <button type="submit" className="w-full py-4 mt-4 bg-primary hover:bg-primary-hover text-bg-deep font-bold rounded-xl shadow-lg shadow-primary/20 transition-all">
                  Create Record
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
