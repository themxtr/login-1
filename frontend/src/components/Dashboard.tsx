import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp,
  TrendingDown,
  Calendar,
  Layers,
  Wallet,
  Zap,
  ShieldCheck,
  LayoutDashboard,
  PieChart
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { getDashboardSummary, type DashboardSummary } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await getDashboardSummary();
        setSummary(data);
      } catch (error) {
        console.error('Failed to fetch summary:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  // Format data for Recharts
  const trendData = summary?.monthlyTrends ? 
    // Pivot data: Group by month, separate income/expenses
    Object.values(summary.monthlyTrends.reduce((acc: any, curr) => {
      if (!acc[curr.month]) acc[curr.month] = { month: curr.month, income: 0, expenses: 0 };
      if (curr.type === 'INCOME') acc[curr.month].income = curr.total;
      else acc[curr.month].expenses = curr.total;
      return acc;
    }, {})) : [];

  const categoryData = summary?.categoryBreakdown || [];

  // Derived Stats
  const savingsRate = summary?.totalIncome ? Math.round(((summary.totalIncome - summary.totalExpenses) / summary.totalIncome) * 100) : 0;
  
  const topCategory = (summary?.categoryBreakdown && summary.categoryBreakdown.length > 0)
    ? [...summary.categoryBreakdown].sort((a: any, b: any) => b.totalAmount - a.totalAmount)[0] 
    : { category: 'None', totalAmount: 0 };
    
  const lastActivityText = summary?.recentActivity?.[0]
    ? `Last: ${summary.recentActivity[0].category} (-$${summary.recentActivity[0].amount.toLocaleString()})`
    : 'No recent activity';

  const stats = [
    { 
      label: 'Portfolio Balance', 
      value: `$${summary?.netBalance?.toLocaleString() || '0'}`, 
      icon: <Wallet size={24} />,
      trend: '+12.5%',
      color: 'bg-emerald-500/10 text-emerald-500 shadow-emerald-500/20',
      isUp: true
    },
    { 
      label: 'Income Flow', 
      value: `$${summary?.totalIncome?.toLocaleString() || '0'}`, 
      icon: <TrendingUp size={24} />,
      trend: '+4.3%',
      color: 'bg-indigo-500/10 text-indigo-500 shadow-indigo-500/20',
      isUp: true
    },
    { 
      label: 'Monthly Burn', 
      value: `$${summary?.totalExpenses?.toLocaleString() || '0'}`, 
      icon: <TrendingDown size={24} />,
      trend: '-2.1%',
      color: 'bg-rose-500/10 text-rose-500 shadow-rose-500/20',
      isDown: true
    },
    { 
      label: 'Efficiency Rate', 
      value: `${savingsRate}%`, 
      icon: <PieChart size={24} />,
      trend: 'Optimal',
      color: 'bg-amber-500/10 text-amber-500 shadow-amber-500/20',
      isNeutral: true
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-secondary font-bold tracking-widest uppercase text-xs">Synchronizing Vault</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-5xl font-extrabold tracking-tight"
          >
            Hi, {user?.email?.split('@')[0]}! 👋
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-secondary text-lg font-medium"
          >
            Welcome back. Your wealth portfolio is up <span className="text-emerald-500 font-bold">12.5%</span> this month.
          </motion.p>
        </div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3 bg-white/5 border border-glass-border p-2 rounded-2xl"
        >
          <div className="bg-emerald-500/10 p-3 rounded-xl text-emerald-500">
            <Calendar size={20} />
          </div>
          <div className="pr-4">
            <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">Today</p>
            <p className="text-sm font-bold">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>
        </motion.div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card stat-card"
          >
            <div className="flex justify-between items-start mb-6">
              <div className={`stat-icon-wrapper ${stat.color}`}>
                {stat.icon}
              </div>
              {stat.trend && (
                <div className={`trend-pill ${stat.isUp ? 'up' : stat.isDown ? 'down' : 'bg-white/5 text-secondary'}`}>
                  {stat.isUp ? <ArrowUpRight size={14} /> : stat.isDown ? <ArrowDownRight size={14} /> : null}
                  {stat.trend}
                </div>
              )}
            </div>
            <div>
              <p className="stat-label">{stat.label}</p>
              <h3 className="stat-value">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 card"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-500">
                <TrendingUp size={24} />
              </div>
              <div>
                <h4 className="text-xl font-bold">Performance Trends</h4>
                <p className="text-secondary text-sm">Monthly cashflow analysis</p>
              </div>
            </div>
          </div>
          
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--error)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--error)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} dy={10} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--bg-surface)', 
                    border: '1px solid var(--glass-border)',
                    borderRadius: '16px',
                    boxShadow: 'var(--shadow-lux)',
                    backdropFilter: 'blur(10px)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="income" 
                  stroke="var(--primary)" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#incomeGradient)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="expenses" 
                  stroke="var(--error)" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#expenseGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500">
              <Layers size={24} />
            </div>
            <div>
              <h4 className="text-xl font-bold">Allocations</h4>
              <p className="text-secondary text-sm">Category distribution</p>
            </div>
          </div>

          <div className="chart-container h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis 
                  type="category" 
                  dataKey="category" 
                  axisLine={false} 
                  tickLine={false} 
                  width={100}
                />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                <Bar dataKey="totalAmount" radius={[0, 4, 4, 0]} barSize={20}>
                  {categoryData.map((_entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index % 2 === 0 ? 'var(--primary)' : 'var(--accent)'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-8 space-y-4">
            <h5 className="text-sm font-bold text-secondary uppercase tracking-widest">Recent Activity</h5>
            <div className="space-y-4">
              {summary?.recentActivity?.slice(0, 4).map((tx) => (
                <div key={tx.id} className="flex items-center gap-4 group cursor-pointer p-2 hover:bg-white/5 rounded-2xl transition-all">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${tx.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                    {tx.category.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm">{tx.category}</p>
                    <p className="text-[10px] text-secondary">{new Date(tx.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-sm ${tx.type === 'INCOME' ? 'text-emerald-500' : 'text-white'}`}>
                      {tx.type === 'INCOME' ? '+' : '-'}${tx.amount.toLocaleString()}
                    </p>
                  </div>
                </div>
              )) || (
                <p className="text-sm text-secondary italic">No recent transactions found</p>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tertiary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card flex items-center gap-6"
        >
          <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500">
            <LayoutDashboard size={24} />
          </div>
          <div>
            <p className="text-muted text-[10px] font-bold uppercase tracking-widest">Asset Velocity</p>
            <p className="text-lg font-extrabold">{lastActivityText}</p>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="card flex items-center gap-6"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-muted text-[10px] font-bold uppercase tracking-widest">Vault Status</p>
            <p className="text-lg font-extrabold text-primary">Fully Encrypted</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="card !bg-primary/5 border-primary/20 flex flex-col gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/20 rounded-xl text-primary">
              <Zap size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm">Optimization Tip</h4>
              <p className="text-secondary text-[10px] uppercase font-bold tracking-tight">AI Insights</p>
            </div>
          </div>
          <p className="text-xs leading-relaxed text-secondary italic">
            "Your <strong>{topCategory?.category || 'None'}</strong> spending is { (topCategory?.totalAmount || 0) > 1000 ? 'high' : 'stable'} this month. 
            Keep up the good momentum!"
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
