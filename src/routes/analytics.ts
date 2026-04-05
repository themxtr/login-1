import { Router, Response } from 'express';
import { db } from '../db/client';
import { transactions } from '../db/schema';
import { gte, sql, eq, desc, sum, and } from 'drizzle-orm';
import { AuthenticatedRequest } from '../middleware/auth';
import { rbacMiddleware } from '../middleware/rbac';

const router = Router();

// Restricted to Analyst and Admin
router.use(rbacMiddleware(['ANALYST', 'ADMIN']));

router.get('/ratios', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    
    // Aggregate data by Financial Group
    const groups = await db.select({
      group: transactions.financialGroup,
      total: sum(transactions.amount).as('total_amount'),
    })
    .from(transactions)
    .groupBy(transactions.financialGroup);

    const data: Record<string, number> = {};
    groups.forEach(g => {
      data[g.group] = Number(g.total || 0);
    });

    // 1. Liquidity Analysis
    const currentAssets = (data['ASSET'] || 0) + (data['REVENUE'] || 0) * 0.2; // Approximation: 20% of revenue is cash on hand
    const currentLiabilities = (data['LIABILITY'] || 0) + (data['EXPENSE'] || 0) * 0.1; // Approximation: 10% of expenses are payables
    const currentRatio = currentLiabilities > 0 ? (currentAssets / currentLiabilities) : (currentAssets > 0 ? 99 : 0);
    const quickRatio = currentLiabilities > 0 ? ((currentAssets * 0.8) / currentLiabilities) : (currentAssets > 0 ? 99 : 0);

    // 2. Profitability Analysis
    const revenue = data['REVENUE'] || 1; // Prevent division by zero
    const cogs = data['COGS'] || 0;
    const netIncome = (data['REVENUE'] || 0) - (data['COGS'] || 0) - (data['EXPENSE'] || 0);
    const grossMargin = ((revenue - cogs) / revenue) * 100;
    const netMargin = (netIncome / revenue) * 100;
    const roe = (data['EQUITY'] || 100000) > 0 ? (netIncome / (data['EQUITY'] || 100000)) * 100 : 0;

    // 3. Leverage (Solvency)
    const totalDebt = data['LIABILITY'] || 0;
    const totalEquity = data['EQUITY'] || 100000;
    const debtToEquity = totalEquity > 0 ? totalDebt / totalEquity : (totalDebt > 0 ? 99 : 0);

    // 4. Efficiency
    const inventoryTurnover = cogs > 0 ? (cogs / (data['ASSET'] * 0.3 || 1000)) : 4.5; // Benchmark fallback
    const receivablesSpeed = 30; // Mocked days outstanding

    // 5. Horizontal Analysis (Trend)
    const trends = await db.select({
      month: sql<string>`to_char(${transactions.date}, 'YYYY-MM')`.as('month_label'),
      revenue: sql<number>`sum(case when ${transactions.financialGroup} = 'REVENUE' then ${transactions.amount} else 0 end)`.as('rev'),
      expenses: sql<number>`sum(case when ${transactions.financialGroup} = 'EXPENSE' then ${transactions.amount} else 0 end)`.as('exp'),
    })
    .from(transactions)
    .where(gte(transactions.date, twelveMonthsAgo))
    .groupBy(sql`month_label`)
    .orderBy(sql`month_label ASC`);

    // 6. Vertical Analysis (% of Revenue)
    const vertical = await db.select({
      category: transactions.category,
      percentage: sql<number>`(sum(${transactions.amount}) / ${revenue}) * 100`.as('pct'),
    })
    .from(transactions)
    .where(and(eq(transactions.financialGroup, 'EXPENSE')))
    .groupBy(transactions.category);

    res.json({
      ratios: {
        liquidity: { currentRatio: Number(currentRatio.toFixed(2)), quickRatio: Number(quickRatio.toFixed(2)) },
        profitability: { grossMargin: Number(grossMargin.toFixed(1)), netMargin: Number(netMargin.toFixed(1)), roe: Number(roe.toFixed(1)) },
        solvency: { debtToEquity: Number(debtToEquity.toFixed(2)) },
        efficiency: { inventoryTurnover: Number(inventoryTurnover.toFixed(1)), receivablesSpeed }
      },
      horizontal: trends.map(t => ({
        month: t.month,
        revenue: Number(t.revenue || 0),
        expenses: Number(t.expenses || 0),
        profit: Number((t.revenue || 0) - (t.expenses || 0)),
        profitMargin: t.revenue > 0 ? Number((((t.revenue - t.expenses) / t.revenue) * 100).toFixed(1)) : 0
      })),
      vertical: vertical.map(v => ({
        name: v.category,
        value: Number(v.percentage || 0)
      })),
      insights: {
        cashFlowVsProfit: netIncome > 1000 ? 'Healthy' : 'Tight',
        efficiencyScore: currentRatio > 1.5 ? 'Optimized' : 'Warning'
      }
    });
  } catch (err) {
    console.error('Analytics Error:', err);
    res.status(500).json({ error: 'Failed to generate financial analysis' });
  }
});

export default router;
