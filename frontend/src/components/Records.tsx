import { useEffect, useState } from 'react'
import { api } from '../services/api'
import type { Transaction } from '../services/api'
import { Plus, Trash2, Edit2, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'

const Records = () => {
  const { user } = useAuth()
  const [records, setRecords] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [filters, setFilters] = useState({ type: '', category: '' })
  
  const [formData, setFormData] = useState({
    amount: '',
    type: 'EXPENSE',
    category: '',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  })


  const fetchRecords = async () => {
    try {
      setLoading(true)
      const data = await api.getRecords(filters as any)
      setRecords(data)
    } catch (err: any) {
      console.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecords()
  }, [filters])

  const handleCreate = async (e: any) => {
    e.preventDefault()
    const amount = parseFloat(formData.amount)
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid positive amount.')
      return
    }

    try {
      await api.createRecord({
        ...formData,
        amount,
        date: new Date(formData.date).toISOString()
      } as any)
      setShowModal(false)
      setFormData({
        amount: '',
        type: 'EXPENSE',
        category: '',
        notes: '',
        date: new Date().toISOString().split('T')[0]
      })
      fetchRecords()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return
    try {
      await api.deleteRecord(id)
      fetchRecords()
    } catch (err: any) {
      alert(err.message)
    }
  }

  return (
    <div className="records-view">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          <select 
            className="btn btn-ghost glass"
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          >
            <option value="">All Types</option>
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
          </select>
          <input 
            type="text" 
            placeholder="Category..."
            className="btn btn-ghost glass"
            style={{ width: 150 }}
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          />
        </div>
        
        {user && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={20} /> Add Record
          </button>
        )}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {records.map((record) => (
                <motion.tr 
                  key={record.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <td>{new Date(record.date).toLocaleDateString()}</td>
                  <td>{record.category}</td>
                  <td>
                    <span className={`badge ${record.type === 'INCOME' ? 'badge-income' : 'badge-expense'}`}>
                      {record.type}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>${record.amount}</td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-ghost p-1" style={{ color: 'var(--primary-main)' }}><Edit2 size={16} /></button>
                      {user && (
                        <button 
                          className="btn btn-ghost p-1" 
                          style={{ color: 'var(--error)' }}
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
          <div className="p-8 text-center text-muted">No records found matching filters.</div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200
          }}>
            <motion.div 
              className="card"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{ width: 400 }}
            >
              <div className="flex justify-between mb-4">
                <h2>New Transaction</h2>
                <button onClick={() => setShowModal(false)} className="btn btn-ghost"><X size={20} /></button>
              </div>

              <form onSubmit={handleCreate}>
                <div className="mb-4">
                  <label className="text-sm">Amount</label>
                  <input 
                    type="number" required step="0.01" className="btn btn-ghost w-full border" 
                    value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>
                <div className="mb-4">
                  <label className="text-sm">Type</label>
                  <select 
                    className="btn btn-ghost w-full border"
                    value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="EXPENSE">Expense</option>
                    <option value="INCOME">Income</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="text-sm">Category</label>
                  <input 
                    type="text" required className="btn btn-ghost w-full border"
                    value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>
                <div className="mb-4">
                  <label className="text-sm">Date</label>
                  <input 
                    type="date" required className="btn btn-ghost w-full border"
                    value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <button type="submit" className="btn btn-primary w-full mt-4">Save Transaction</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Records
