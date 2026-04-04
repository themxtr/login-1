import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, DollarSign, CreditCard, Activity, TrendingUp } from 'lucide-react';
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

  const stats = [
    { 
      label: 'Total Balance', 
      value: summary?.netBalance || 0, 
      icon: <DollarSign size={24} />, 
      color: 'bg-emerald-500/10 text-emerald-500',
      trend: '+12.5%', 
      isUp: true 
    },
    { 
      label: 'Monthly Income', 
      value: summary?.totalIncome || 0, 
      icon: <TrendingUp size={24} />, 
      color: 'bg-blue-500/10 text-blue-500',
      trend: '+8.2%', 
      isUp: true 
    },
    { 
      label: 'Monthly Expenses', 
      value: summary?.totalExpenses || 0, 
      icon: <CreditCard size={24} />, 
      color: 'bg-rose-500/10 text-rose-500',
      trend: '-2.4%', 
      isDown: true 
    },
    { 
      label: 'Active Budget', 
      value: 12450, 
      icon: <Activity size={24} />, 
      color: 'bg-amber-500/10 text-amber-500',
      trend: 'On Track', 
      isNeutral: true 
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <header className="space-y-2">
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-4xl font-extrabold tracking-tight"
        >
          Hi, {user?.email?.split('@')[0]}! 👋
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="text-secondary text-lg"
        >
          Welcome back. Here's what's happening with your accounts today.
        </motion.p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card"
          >
            <div className="flex justify-between items-start mb-6">
              <div className={`p-3 rounded-2xl ${stat.color}`}>
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
              <p className="text-secondary font-medium mb-1">{stat.label}</p>
              <h3 className="text-3xl font-bold tracking-tight">
                ${stat.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 card h-[450px] flex items-center justify-center border-dashed"
        >
          <div className="text-center space-y-4">
            <div className="bg-primary/10 p-4 rounded-full inline-block">
              <TrendingUp size={32} className="text-primary" />
            </div>
            <h4 className="text-xl font-bold">Analytics Engine Initializing</h4>
            <p className="text-secondary max-w-sm">
              We're processing your transaction patterns to provide deep wealth insights.
            </p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card overflow-hidden"
        >
          <h4 className="text-xl font-bold mb-6">Recent Activity</h4>
          <div className="space-y-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 group cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center font-bold text-secondary group-hover:bg-primary/20 group-hover:text-primary transition-all">
                  T{i}
                </div>
                <div className="flex-1">
                  <p className="font-bold">Transaction {i}</p>
                  <p className="text-xs text-secondary">Oct {10 + i}, 2023</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">-$120.00</p>
                  <p className="text-[10px] text-success font-bold uppercase tracking-widest">Success</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
