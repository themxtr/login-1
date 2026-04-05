import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, Target, Zap, 
  BarChart, LineChart as LucideLineChart,
  Activity, Info
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart as ReBarChart, Bar, Cell
} from 'recharts';
import { api } from '../services/api';
import { useCurrency } from '../contexts/CurrencyContext';

const Analytics = () => {
  const { formatAmount } = useCurrency();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.getAnalytics();
        setData(response);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  return (
    <div className="card-layout">
      {/* 1. Ratio Grid - The "Vital Signs" */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <RatioCard 
          title="Liquidity (Current)" 
          value={data?.ratios?.liquidity?.currentRatio} 
          subtitle="Target > 1.2"
          icon={<Zap size={20} />}
          status={data?.ratios?.liquidity?.currentRatio > 1.2 ? 'success' : 'warning'}
        />
        <RatioCard 
          title="Net Margin" 
          value={`${data?.ratios?.profitability?.netMargin}%`} 
          subtitle="Revenue Efficiency"
          icon={<TrendingUp size={20} />}
          status={data?.ratios?.profitability?.netMargin > 15 ? 'success' : 'neutral'}
        />
        <RatioCard 
          title="Solvency (D/E)" 
          value={data?.ratios?.solvency?.debtToEquity} 
          subtitle="Lower is Stable"
          icon={<Activity size={20} />}
          status={data?.ratios?.solvency?.debtToEquity < 0.5 ? 'success' : 'warning'}
        />
        <RatioCard 
          title="Return on Equity" 
          value={`${data?.ratios?.profitability?.roe}%`} 
          subtitle="Capital Yield"
          icon={<Target size={20} />}
          status={data?.ratios?.profitability?.roe > 10 ? 'success' : 'neutral'}
        />
      </div>

      <div className="grid-2" style={{ gap: '2rem' }}>
        {/* 2. Horizontal Analysis - Trend Line */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card">
          <div className="section-header" style={{ marginBottom: '1.5rem' }}>
            <div>
              <h3 className="section-title">Horizontal Analysis</h3>
              <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Revenue vs Profitability Trends (12M)</p>
            </div>
            <LucideLineChart className="text-primary" size={20} />
          </div>
          
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.horizontal}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  formatter={(val: any) => formatAmount(Number(val))}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* 3. Vertical Analysis - Cost Structure */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
          <div className="section-header" style={{ marginBottom: '1.5rem' }}>
            <div>
              <h3 className="section-title">Vertical Analysis</h3>
              <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Expense Distribution (% of Total Revenue)</p>
            </div>
            <BarChart className="text-warning" size={20} />
          </div>

          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={data?.vertical} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} width={80} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }} 
                  contentStyle={{ borderRadius: '12px', border: 'none' }}
                  formatter={(val: any) => [`${Number(val).toFixed(1)}%`, 'Share']}
                />
                <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={20}>
                  {data?.vertical?.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid-3" style={{ marginTop: '2rem' }}>
        {/* Efficiency Indicators */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card col-span-2">
          <h3 className="section-title" style={{ marginBottom: '1.5rem' }}>Efficiency & Operational Effectiveness</h3>
          <div className="grid-2">
             <div className="efficiency-item">
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div className="legend-dot" style={{ background: '#3b82f6' }}></div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Inventory Turnover</span>
                </div>
                <div className="progress-bg">
                  <div className="progress-fill" style={{ width: `${(data?.ratios?.efficiency?.inventoryTurnover / 8) * 100}%`, background: '#3b82f6' }}></div>
                </div>
                <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: '#6b7280' }}>
                  Your assets circulate {data?.ratios?.efficiency?.inventoryTurnover} times per year.
                </p>
             </div>
             <div className="efficiency-item">
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div className="legend-dot" style={{ background: '#10b981' }}></div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Collection Speed</span>
                </div>
                <div className="progress-bg">
                  <div className="progress-fill" style={{ width: '85%', background: '#10b981' }}></div>
                </div>
                <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: '#6b7280' }}>
                  Average receivables collection time: {data?.ratios?.efficiency?.receivablesSpeed} days.
                </p>
             </div>
          </div>
        </motion.div>

        {/* Insight Panel */}
        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="card" style={{ background: 'var(--primary)', color: 'white' }}>
          <h3 className="section-title" style={{ color: 'white', marginBottom: '1rem' }}>Financial Quality</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="insight-row">
              <p style={{ opacity: 0.7, fontSize: '0.75rem' }}>Cash Flow vs Profit</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                <span style={{ fontWeight: 700 }}>{data?.insights?.cashFlowVsProfit}</span>
                {data?.insights?.cashFlowVsProfit === 'Healthy' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              </div>
            </div>
            <div className="insight-row">
              <p style={{ opacity: 0.7, fontSize: '0.75rem' }}>Operational Efficiency</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                <span style={{ fontWeight: 700 }}>{data?.insights?.efficiencyScore}</span>
                <Zap size={16} fill="rgba(255,255,255,0.2)" />
              </div>
            </div>
            <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', marginTop: 'auto' }}>
              <p style={{ fontSize: '0.7rem', lineHeight: 1.4 }}>
                <Info size={12} style={{ marginRight: '0.25rem', display: 'inline' }} />
                Your ROE suggests high capital efficiency. Consider optimizing leverage to further enhance margins.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const RatioCard = ({ title, value, subtitle, icon, status }: any) => {
  const statusColor = status === 'success' ? '#10b981' : status === 'warning' ? '#f59e0b' : '#3b82f6';
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="card" 
      style={{ padding: '1.25rem', borderLeft: `4px solid ${statusColor}` }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.025em' }}>{title}</p>
        <div style={{ color: statusColor, opacity: 0.8 }}>{icon}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{value}</h2>
      </div>
      <p style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.25rem' }}>{subtitle}</p>
    </motion.div>
  );
};

export default Analytics;
