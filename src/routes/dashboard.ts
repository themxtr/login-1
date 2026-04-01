import { Router, Response } from 'express';
import { db } from '../db/client';
import { transactions } from '../db/schema';
import { gte, sql, eq, desc, sum } from 'drizzle-orm';
import { AuthenticatedRequest } from '../middleware/auth';
import { rbacMiddleware } from '../middleware/rbac';

const router = Router();

// GET /dashboard/summary: Accessible by ALL roles
router.get('/summary', rbacMiddleware(['VIEWER', 'ANALYST', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    // 1. Basic Totals (Income and Expenses separately for robustness)
    const incomeResult = await db.select({
      total: sum(transactions.amount),
    })
    .from(transactions)
    .where(eq(transactions.type, 'INCOME'));

    const expenseResult = await db.select({
      total: sum(transactions.amount),
    })
    .from(transactions)
    .where(eq(transactions.type, 'EXPENSE'));

    const income = Number(incomeResult[0]?.total || 0);
    const expenses = Number(expenseResult[0]?.total || 0);
    const balance = income - expenses;

    // 2. Category Breakdown (Expenses)
    const categoryBreakdown = await db.select({
      category: transactions.category,
      totalAmount: sum(transactions.amount).as('total_amount'),
    })
    .from(transactions)
    .where(eq(transactions.type, 'EXPENSE'))
    .groupBy(transactions.category)
    .orderBy(desc(sql`total_amount`));

    // 3. Recent Activity (Last 10)
    const recentActivity = await db.select()
      .from(transactions)
      .orderBy(desc(transactions.date))
      .limit(10);

    // 4. Monthly Trends (Last 6 Months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    sixMonthsAgo.setDate(1);

    // Use raw column name in GROUP BY to be safe, or repeat expression
    const monthlyTrends = await db.select({
      month: sql<string>`strftime('%Y-%m', datetime(${transactions.date} / 1000, 'unixepoch'))`.as('month_label'),
      type: transactions.type,
      total: sum(transactions.amount).as('monthly_total'),
    })
    .from(transactions)
    .where(gte(transactions.date, sixMonthsAgo))
    .groupBy(sql`month_label`, transactions.type)
    .orderBy(sql`month_label ASC`);

    res.json({
      totals: {
        income,
        expenses,
        balance,
      },
      categoryBreakdown: categoryBreakdown.map(c => ({
        category: c.category,
        totalAmount: Number(c.totalAmount)
      })),
      recentActivity,
      monthlyTrends: monthlyTrends.map(t => ({
        month: t.month,
        type: t.type,
        total: Number(t.total)
      })),
    });
  } catch (err) {
    console.error('Summary API Error:', err);
    res.status(500).json({ error: 'Failed to generate dashboard summary' });
  }
});

export default router;
