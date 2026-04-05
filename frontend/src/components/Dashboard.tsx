import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, ArrowUpRight, ArrowDownRight, Calendar } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar
} from 'recharts';
import { getDashboardSummary } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { mockRole } = useAuth();
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Role visibility logic
  const isViewer = mockRole === 'VIEWER';
  const displayVal = (val: number | string) => isViewer ? '****' : `$${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Format line chart data
  const trendData = summary?.monthlyTrends ? 
    Object.values(summary.monthlyTrends.reduce((acc: any, curr: any) => {
      if (!acc[curr.month]) acc[curr.month] = { month: curr.month, income: 0, expenses: 0 };
      if (curr.type === 'INCOME') acc[curr.month].income = curr.total;
      else acc[curr.month].expenses = curr.total;
      return acc;
    }, {})) : [];

  // Format Radial chart data
  const colors = ['#0ea5e9', '#f97316', '#ef4444', '#16a34a', '#8b5cf6'];
  const totalCatExpenses = summary?.categoryBreakdown?.reduce((a: any, b: any) => a + b.totalAmount, 0) || 1;
  const radialData = summary?.categoryBreakdown?.slice(0, 4).map((c: any, index: number) => ({
    name: c.category,
    value: c.totalAmount,
    fill: colors[index % colors.length]
  })) || [];

  return (
    <div className="space-y-6 pb-12 text-sm">
      
      {/* Top Cards Row */}
      <div className="grid-3">
        {/* Balance Card */}
        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="card balance-card">
          <p className="label mb-2">My balance</p>
          <div className="value">
            {displayVal(summary?.totals?.balance || 0)}
            <span className={summary?.totals?.balanceChange >= 0 ? "trend-positive" : "trend-negative"}>
              {summary?.totals?.balanceChange > 0 ? '+' : ''}{summary?.totals?.balanceChange || 0}% 
              <span className="trend-text font-normal text-xs text-gray-500">compare to last month</span>
            </span>
          </div>
          
          <div className="flex items-center gap-4 mb-6">
            <span className="font-mono text-gray-600 font-medium">6549 7329 9821 2472</span>
            <button className="flex items-center gap-1 text-emerald-600 font-bold hover:bg-emerald-50 px-2 py-1 rounded">
              <Copy size={14} /> Copy
            </button>
          </div>

          <div className="flex gap-4">
            <button className="btn-primary flex-1" disabled={isViewer}>Send money</button>
            <button className="btn-secondary flex-1" disabled={isViewer}>Request money</button>
          </div>
        </motion.div>

        {/* Monthly Income Card */}
        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{delay: 0.1}} className="card balance-card flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <ArrowUpRight size={20} />
            </div>
            <p className="label font-bold text-gray-800 mb-4">Monthly income</p>
            <p className="text-3xl font-extrabold text-gray-900 mb-2">{displayVal(summary?.currentMonth?.income || 0)}</p>
            <p className="text-sm font-semibold text-emerald-600">
              +{summary?.currentMonth?.incomeChange || 0}% <span className="text-gray-500 font-normal">compared to last month</span>
            </p>
          </div>
        </motion.div>

        {/* Monthly Expense Card */}
        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{delay: 0.2}} className="card balance-card flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4">
              <ArrowDownRight size={20} />
            </div>
            <p className="label font-bold text-gray-800 mb-4">Monthly expenses</p>
            <p className="text-3xl font-extrabold text-gray-900 mb-2">{displayVal(summary?.currentMonth?.expenses || 0)}</p>
            <p className="text-sm font-semibold text-red-500">
              {summary?.currentMonth?.expenseChange || 0}% <span className="text-gray-500 font-normal">compared to last month</span>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid-auto">
        
        {/* Left Column: Statistics */}
        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{delay: 0.3}} className="card p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold">Statistics</h3>
            <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1 text-gray-600 cursor-pointer font-medium hover:bg-gray-50">
              <Calendar size={16} /> Monthly
            </div>
          </div>
          
          <div className="flex items-center gap-6 mb-6 text-sm font-medium text-gray-600">
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-600"></div> Total income</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-500"></div> Total expenses</div>
          </div>

          <div className="h-64 w-full mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} dy={10} minTickGap={20} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="income" stroke="#10b981" fill="none" strokeWidth={3} />
                <Area type="monotone" dataKey="expenses" stroke="#f97316" fill="none" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex gap-16 border-t border-gray-100 pt-6">
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Average income</p>
              <p className="text-2xl font-bold mb-1">{displayVal(summary?.averages?.income || 0)}</p>
              <p className="text-xs text-emerald-600 font-semibold">+9.8% <span className="text-gray-400 font-normal">compare to last month</span></p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Average expenses</p>
              <p className="text-2xl font-bold mb-1">{displayVal(summary?.averages?.expenses || 0)}</p>
              <p className="text-xs text-red-500 font-semibold">-8.7% <span className="text-gray-400 font-normal">compare to last month</span></p>
            </div>
          </div>
        </motion.div>

        {/* Right Column: All Expenses & Banner */}
        <div className="flex flex-col gap-6">
          <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{delay: 0.4}} className="card p-6 flex-1">
            <h3 className="text-lg font-bold mb-6">All expenses</h3>
            
            <div className="flex justify-between mb-8">
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Daily</p>
                <p className="font-bold">{displayVal(summary?.expenseSplits?.daily || 0)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Weekly</p>
                <p className="font-bold">{displayVal(summary?.expenseSplits?.weekly || 0)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Monthly</p>
                <p className="font-bold">{displayVal(summary?.expenseSplits?.monthly || 0)}</p>
              </div>
            </div>

            <div className="h-64 w-full flex items-center justify-center relative">
               <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="100%" barSize={10} data={radialData}>
                  <RadialBar
                    background
                    dataKey="value"
                    cornerRadius={10}
                  />
                  <Tooltip />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3 mt-4">
              {radialData.map((entry: any, i: number) => {
                const percentage = Math.round((entry.value / totalCatExpenses) * 100);
                return (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-600 font-medium">
                      <div className="w-2 h-2 rounded-full" style={{backgroundColor: entry.fill}}></div>
                      {entry.name}
                    </div>
                    <div className="font-bold">{percentage}%</div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{delay: 0.5}} className="promo-banner">
            <h3>Secure Your Future with Our Comprehensive Retirement Plans!</h3>
            <button className="btn-white">Learn more</button>
          </motion.div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
