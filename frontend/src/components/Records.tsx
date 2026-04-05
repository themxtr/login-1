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
      {/* Header Toolbar */}
      <div className="toolbar">
        <div className="toolbar-section">
          <div className="relative">
            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
            <select 
              className="form-select pl-10"
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
              className="form-input pl-10"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            />
          </div>
        </div>

        <div className="ml-auto">
          {user && (
            <motion.button 
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary"
              onClick={() => setShowModal(true)}
            >
              <Plus size={20} className="inline mr-2" /> Add Transaction
            </motion.button>
          )}
        </div>
      </div>

      {/* Records Table */}
      <div className="card !p-0 overflow-hidden">
        <div className="p-8 border-b border-glass-border">
          <h3 className="text-xl font-bold">Transaction History</h3>
          <p className="text-secondary text-sm">Detailed ledger of all movements</p>
        </div>
        <div className="data-table-container px-8 pb-8">
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
                    <td className="text-muted font-medium">{new Date(record.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td className="font-bold">{record.category}</td>
                    <td>
                      <span className={`trend-pill ${record.type === 'INCOME' ? 'up' : 'down'}`}>
                        {record.type === 'INCOME' ? 'Revenue' : 'Expense'}
                      </span>
                    </td>
                    <td className={`font-bold text-lg ${record.type === 'INCOME' ? 'text-primary' : 'text-white'}`}>
                      {record.type === 'INCOME' ? '+' : '-'}${record.amount.toLocaleString()}
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-3 hover:bg-white/5 rounded-xl text-secondary hover:text-white transition-all">
                          <Edit2 size={16} />
                        </button>
                        {user && (
                          <button 
                            className="p-3 hover:bg-rose-500/10 rounded-xl text-rose-500/60 hover:text-rose-500 transition-all"
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
            <div className="py-20 text-center space-y-4">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={32} className="text-secondary" />
              </div>
              <p className="text-secondary font-medium text-lg">No records found within these parameters.</p>
              <button 
                onClick={() => setFilters({ type: '', category: '' })}
                className="text-primary font-bold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Record Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="modal-overlay">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="card modal-content max-w-lg w-full !p-10 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h2 className="text-3xl font-extrabold tracking-tight">New Entry</h2>
                  <p className="text-secondary text-sm">Capture a new movement in your ledger</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-3 hover:bg-white/5 rounded-2xl transition-all">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-8">
                <div className="form-group">
                  <label className="form-label">Transaction Amount</label>
                  <div className="relative">
                    <DollarSign size={24} className="absolute left-5 top-1/2 -translate-y-1/2 text-primary" />
                    <input 
                      type="number" required step="0.01" 
                      className="form-input pl-14 py-5 text-3xl font-bold tracking-tight bg-primary/5 border-primary/20"
                      placeholder="0.00"
                      value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select 
                      className="form-select py-4"
                      value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                      <option value="EXPENSE">Expense</option>
                      <option value="INCOME">Income</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date</label>
                    <div className="relative">
                      <Calendar size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500 pointer-events-none" />
                      <input 
                        type="date" required 
                        className="form-input pl-12 py-4"
                        value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <div className="relative">
                    <Tag size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" />
                    <input 
                      type="text" required placeholder="e.g. Groceries, Rent, Salary"
                      className="form-input pl-12 py-4"
                      value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    />
                  </div>
                </div>

                <motion.button 
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit" 
                  className="btn-primary w-full py-5 text-xl"
                >
                  Post Transaction
                </motion.button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Records;
