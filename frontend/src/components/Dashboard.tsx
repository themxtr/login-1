import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Activity, Wallet } from 'lucide-react';
import { api } from '../services/api';
import type { DashboardSummary } from '../services/api';

const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Dashboard = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await api.getSummary();
        setSummary(data);
      } catch (err: any) {
        setError(err.message || 'Error loading dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );

  if (error) return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="card border-error/20 bg-error/5 p-6 text-error text-center"
    >
      Failed to load dashboard: {error}
    </motion.div>
  );

  if (!summary) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Stats Grid */}
      <div className="dashboard-grid">
        <motion.div whileHover={{ scale: 1.02 }} className="card stat-card">
          <div className="flex justify-between items-start">
            <div>
              <p className="stat-label">Net Balance</p>
              <h3 className="stat-value">${summary.totals.balance.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <Wallet size={24} />
            </div>
          </div>
          <p className="text-xs text-secondary mt-4 flex items-center gap-1">
            <TrendingUp size={14} /> Total accumulated savings
          </p>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} className="card stat-card">
          <div className="flex justify-between items-start">
            <div>
              <p className="stat-label">Total Income</p>
              <h3 className="stat-value text-primary">${summary.totals.income.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <ArrowUpRight size={24} />
            </div>
          </div>
          <p className="text-xs text-secondary mt-4">Lifetime earnings</p>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} className="card stat-card">
          <div className="flex justify-between items-start">
            <div>
              <p className="stat-label">Total Expenses</p>
              <h3 className="stat-value text-error">${summary.totals.expenses.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-error/10 rounded-xl text-error">
              <ArrowDownRight size={24} />
            </div>
          </div>
          <p className="text-xs text-secondary mt-4">Lifetime spending</p>
        </motion.div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Trend Area Chart */}
        <div className="card h-full">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="text-accent" />
            <h3 className="text-lg font-bold">Financial Trends (6M)</h3>
          </div>
          <div className="chart-container" style={{ height: 400 }}>
             <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={summary.monthlyTrends}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="total" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category breakdown bar chart */}
        <div className="card h-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-accent/10 rounded-lg text-accent">📊</div>
            <h3 className="text-lg font-bold">Spending by Category</h3>
          </div>
          <div className="chart-container" style={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.categoryBreakdown}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="category" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
                <Bar dataKey="totalAmount" radius={[8, 8, 0, 0]}>
                  {summary.categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity Table (Compact) */}
      <div className="card">
        <h3 className="text-lg font-bold mb-6">Recent Activity</h3>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Status</th>
                <th className="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {summary.recentActivity.map((t: any) => (
                <motion.tr 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key={t.id}
                >
                  <td>{t.category}</td>
                  <td>
                    <span className={`badge ${t.type === 'INCOME' ? 'badge-income' : 'badge-expense'}`}>
                      {t.type}
                    </span>
                  </td>
                  <td className={`text-right font-bold ${t.type === 'INCOME' ? 'text-primary' : 'text-error'}`}>
                    {t.type === 'INCOME' ? '+' : '-'}${t.amount.toLocaleString()}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
