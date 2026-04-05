import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, ArrowUpRight, ArrowDownRight, Calendar } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { getDashboardSummary } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';

const Dashboard = () => {
  const { mockRole } = useAuth();
  const { formatAmount } = useCurrency();
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Role visibility logic
  const isViewer = mockRole === 'VIEWER';
  const displayVal = (val: number | string | undefined | null) => {
    return formatAmount(Number(val || 0));
  };

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
      <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  // Format line chart data - Add fallback data if missing so graph doesn't break
  const rawTrendData = summary?.monthlyTrends || [];
  const trendData = rawTrendData.length > 0 ? 
    Object.values(rawTrendData.reduce((acc: any, curr: any) => {
      if (!acc[curr.month]) acc[curr.month] = { month: curr.month, income: 0, expenses: 0 };
      if (curr.type === 'INCOME') acc[curr.month].income = curr.total;
      else acc[curr.month].expenses = curr.total;
      return acc;
    }, {})) : [
      { month: 'No Data', income: 0, expenses: 0 },
      { month: 'Current', income: 0, expenses: 0 } // Baseline to prevent rendering errors
    ];

  // Format chart data - Use Income vs Expenses distribution
  const distributionData = [
    { 
      name: 'Expenses', 
      value: summary?.totals?.expenses || 0, 
      color: '#ef4444' // Red for expenses
    },
    { 
      name: 'Income', 
      value: summary?.totals?.income || 0, 
      color: '#22c55e' // Green for income
    }
  ];

  const totalForDistribution = distributionData.reduce((acc, curr) => acc + curr.value, 0);
  const getPercentage = (val: number) => {
    if (totalForDistribution === 0) return 0;
    return ((val / totalForDistribution) * 100).toFixed(0);
  };

  // Map success color if not defined as CSS variable
  if (distributionData[1].value > 0 && !distributionData[1].color) distributionData[1].color = '#22c55e';

  return (
    <div>
      {/* Top Cards Row */}
      <div className="grid-3 mb-6" style={{ marginBottom: '2rem' }}>
        {/* Balance Card */}
        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="card balance-card">
          <p className="card-label">My balance</p>
          <div className="card-value">
            {displayVal(summary?.totals?.balance)}
            <span className={Number(summary?.totals?.balanceChange) >= 0 ? "trend-positive" : "trend-negative"}>
              {Number(summary?.totals?.balanceChange) > 0 ? '+' : ''}{summary?.totals?.balanceChange || 0}% 
              <span className="trend-text">compare to last month</span>
            </span>
          </div>
          
          <div className="copy-group">
            <span className="copy-text">6549 7329 9821 2472</span>
            <button className="copy-btn">
              <Copy size={14} /> Copy
            </button>
          </div>

          <div className="btn-group">
            <button className="btn-primary" disabled={isViewer}>Send money</button>
            <button className="btn-secondary" disabled={isViewer}>Request money</button>
          </div>
        </motion.div>

        {/* Monthly Income Card */}
        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{delay: 0.1}} className="card balance-card">
          <div>
            <div className="card-icon-green">
              <ArrowUpRight size={20} />
            </div>
            <p className="card-label">Monthly income</p>
            <p className="card-value-sm">{displayVal(summary?.currentMonth?.income)}</p>
            <p className="trend-positive" style={{ background: 'transparent', padding: '0', marginTop: '0.5rem' }}>
              +{summary?.currentMonth?.incomeChange || 0}% <span className="trend-text">compared to last month</span>
            </p>
          </div>
        </motion.div>

        {/* Monthly Expense Card */}
        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{delay: 0.2}} className="card balance-card">
          <div>
            <div className="card-icon-red">
              <ArrowDownRight size={20} />
            </div>
            <p className="card-label">Monthly expenses</p>
            <p className="card-value-sm">{displayVal(summary?.currentMonth?.expenses)}</p>
            <p className="trend-negative" style={{ background: 'transparent', padding: '0', marginTop: '0.5rem' }}>
              {summary?.currentMonth?.expenseChange || 0}% <span className="trend-text">compared to last month</span>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Main Content Grid - Hidden for Viewer */}
      {!isViewer ? (
        <div className="grid-auto">
          {/* Left Column: Statistics */}
          <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{delay: 0.3}} className="card">
            <div className="section-header">
              <h3 className="section-title">Statistics</h3>
            </div>
            
            <div className="legend-group">
              <div className="legend-item"><div className="legend-dot dot-green"></div> Total income</div>
              <div className="legend-item"><div className="legend-dot dot-orange"></div> Total expenses</div>
            </div>

            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} dy={10} minTickGap={20} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="income" stroke="#10b981" fill="none" strokeWidth={3} />
                  <Area type="monotone" dataKey="expenses" stroke="#f97316" fill="none" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="stats-footer">
              <div className="stat-block">
                <p className="stat-sub">Average income</p>
                <p className="card-value-sm">{displayVal(summary?.averages?.income)}</p>
                <p className="trend-positive" style={{ background: 'transparent', padding: '0' }}>+9.8% <span className="trend-text">compare to last month</span></p>
              </div>
              <div className="stat-block">
                <p className="stat-sub">Average expenses</p>
                <p className="card-value-sm">{displayVal(summary?.averages?.expenses)}</p>
                <p className="trend-negative" style={{ background: 'transparent', padding: '0' }}>-8.7% <span className="trend-text">compare to last month</span></p>
              </div>
            </div>
          </motion.div>

          {/* Right Column: All Expenses & Banner */}
          <div className="card-layout">
            <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{delay: 0.4}} className="card">
              <div className="section-header" style={{ marginBottom: '1.5rem' }}>
                <h3 className="section-title">All expenses</h3>
                <div className="section-filter">
                  <Calendar size={16} /> Monthly
                </div>
              </div>
              
              <div className="expense-splits">
                <div className="split-item">
                  <p className="sub">Daily</p>
                  <p className="val">{displayVal(summary?.expenseSplits?.daily)}</p>
                </div>
                <div className="split-item">
                  <p className="sub">Weekly</p>
                  <p className="val">{displayVal(summary?.expenseSplits?.weekly)}</p>
                </div>
                <div className="split-item">
                  <p className="sub">Monthly</p>
                  <p className="val">{displayVal(summary?.expenseSplits?.monthly)}</p>
                </div>
              </div>

              <div className="radial-wrapper">
                 <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius="60%"
                      outerRadius="90%"
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any) => formatAmount(Number(value || 0))}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="donut-center">
                   <span className="percentage">{getPercentage(summary?.totals?.income || 0)}%</span>
                   <span className="label">Income</span>
                </div>
              </div>

              <div className="category-list">
                {distributionData.map((entry: any, i: number) => {
                  return (
                    <div key={i} className="category-item">
                      <div className="category-name">
                        <div className="legend-dot" style={{backgroundColor: entry.color}}></div>
                        {entry.name}
                      </div>
                      <div className="category-val">{getPercentage(entry.value)}%</div>
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
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ width: '64px', height: '64px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
            <Calendar size={32} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Advanced Analytics Hidden</h3>
          <p style={{ color: '#6b7280', maxWidth: '400px', margin: '0 auto' }}>You are currently on the Viewer perspective. Advanced financial trends and category distributions are restricted to Analyst and Admin personas.</p>
        </motion.div>
      )}

    </div>
  );
};

export default Dashboard;
