import { useEffect, useState } from 'react'
import { api } from '../services/api'
import type { DashboardSummary } from '../services/api'

const Dashboard = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    console.log('Dashboard: Fetching summary...')
    const fetchSummary = async () => {
      try {
        const data = await api.getSummary()
        console.log('Dashboard: Summary data received:', data)
        setSummary(data)
      } catch (err: any) {
        console.error('Dashboard Error:', err)
        setError(err.message || 'Error loading dashboard')
      } finally {
        setLoading(false)
      }
    }
    fetchSummary()
  }, [])

  if (loading) return <div style={{ padding: '20px', color: '#666' }}>Analyzing finances...</div>
  if (error) return <div style={{ color: 'red', border: '1px solid red', padding: '10px' }}>Dashboard Error: {error}</div>
  if (!summary) return <div>No summary data available</div>

  return (
    <div style={{ padding: '20px' }}>
      <h2>Summary Overview</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
        <div className="card">
          <p>Balance</p>
          <h3>${summary.totals.balance}</h3>
        </div>
        <div className="card">
          <p>Total Revenue</p>
          <h3 style={{ color: 'green' }}>${summary.totals.income}</h3>
        </div>
        <div className="card">
          <p>Total Costs</p>
          <h3 style={{ color: 'red' }}>${summary.totals.expenses}</h3>
        </div>
      </div>
      
      <div className="mt-4">
        <h3>Recent Transactions</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {summary.recentActivity.map((t: any) => (
            <li key={t.id} style={{ borderBottom: '1px solid #eee', padding: '10px 0', display: 'flex', justifyContent: 'space-between' }}>
              <span>{t.category}</span>
              <span style={{ fontWeight: 600 }}>{t.type === 'INCOME' ? '+' : '-'}${t.amount}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default Dashboard
