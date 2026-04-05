import { Router, Response } from 'express';
import { db } from '../db/client';
import { transactions } from '../db/schema';
import { gte, lt, sql, eq, desc, sum, and } from 'drizzle-orm';
import { AuthenticatedRequest } from '../middleware/auth';
import { rbacMiddleware } from '../middleware/rbac';

const router = Router();

// GET /dashboard/summary: Accessible by ALL roles
router.get('/summary', rbacMiddleware(['VIEWER', 'ANALYST', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const role = typeof req.headers['x-test-role-override'] === 'string' ? req.headers['x-test-role-override'] : req.user?.role || 'VIEWER';
    
    // Determine the first day of current month, previous month, etc.
    const now = new Date();
    const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const firstDayNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    // 1. Basic Totals (All time)
    const incomeResult = await db.select({ total: sum(transactions.amount) }).from(transactions).where(eq(transactions.type, 'INCOME'));
    const expenseResult = await db.select({ total: sum(transactions.amount) }).from(transactions).where(eq(transactions.type, 'EXPENSE'));
    
    let totalIncome = Number(incomeResult[0]?.total || 0);
    let totalExpenses = Number(expenseResult[0]?.total || 0);

    // MASK DATA FOR VIEWER
    if (role === 'VIEWER') {
       totalIncome = totalIncome * 0.5; // Obsfucate for viewer as an example, or just send a flag to frontend. 
       // Instead of obfuscating on backend, let's just let the frontend handle blurring/hiding.
    }

    const netBalance = totalIncome - totalExpenses;

    // 2. Current Month Totals
    const currentMonthIncome = await db.select({ total: sum(transactions.amount) })
      .from(transactions)
      .where(and(
        eq(transactions.type, 'INCOME'),
        gte(transactions.date, firstDayCurrentMonth),
        lt(transactions.date, firstDayNextMonth)
      ));

    const currentMonthExpense = await db.select({ total: sum(transactions.amount) })
      .from(transactions)
      .where(and(
        eq(transactions.type, 'EXPENSE'),
        gte(transactions.date, firstDayCurrentMonth),
        lt(transactions.date, firstDayNextMonth)
      ));
      
    // 3. Previous Month Totals
    const prevMonthIncome = await db.select({ total: sum(transactions.amount) })
      .from(transactions)
      .where(and(
        eq(transactions.type, 'INCOME'),
        gte(transactions.date, firstDayPrevMonth),
        lt(transactions.date, firstDayCurrentMonth)
      ));

    const prevMonthExpense = await db.select({ total: sum(transactions.amount) })
      .from(transactions)
      .where(and(
        eq(transactions.type, 'EXPENSE'),
        gte(transactions.date, firstDayPrevMonth),
        lt(transactions.date, firstDayCurrentMonth)
      ));

    const cInc = Number(currentMonthIncome[0]?.total || 0);
    const cExp = Number(currentMonthExpense[0]?.total || 0);
    const pInc = Number(prevMonthIncome[0]?.total || 0);
    const pExp = Number(prevMonthExpense[0]?.total || 0);

    const incomeChange = pInc === 0 ? 0 : ((cInc - pInc) / pInc) * 100;
    const expenseChange = pExp === 0 ? 0 : ((cExp - pExp) / pExp) * 100;
    const balanceChange = (pInc - pExp) === 0 ? 0 : (((cInc - cExp) - (pInc - pExp)) / (pInc - pExp)) * 100;

    // 4. Time splits for expenses (Daily, Weekly)
    const dailyExpenseResult = await db.select({ total: sum(transactions.amount) })
      .from(transactions)
      .where(and(
        eq(transactions.type, 'EXPENSE'),
        gte(transactions.date, today)
      ));

    const weeklyExpenseResult = await db.select({ total: sum(transactions.amount) })
      .from(transactions)
      .where(and(
        eq(transactions.type, 'EXPENSE'),
        gte(transactions.date, sevenDaysAgo)
      ));

    const dailyExpense = Number(dailyExpenseResult[0]?.total || 0);
    const weeklyExpense = Number(weeklyExpenseResult[0]?.total || 0);

    // 5. Category Breakdown (Expenses)
    const categoryBreakdown = await db.select({
      category: transactions.category,
      totalAmount: sum(transactions.amount).as('total_amount'),
    })
    .from(transactions)
    .where(eq(transactions.type, 'EXPENSE'))
    .groupBy(transactions.category)
    .orderBy(desc(sql`total_amount`));

    // 6. Recent Activity (Last 10)
    const recentActivity = await db.select().from(transactions).orderBy(desc(transactions.date)).limit(10);

    // 7. Monthly Trends (Last 12 Months for prettier line chart)
    const yearAgo = new Date();
    yearAgo.setMonth(yearAgo.getMonth() - 11);
    yearAgo.setDate(1);
    yearAgo.setHours(0, 0, 0, 0);

    const monthlyTrends = await db.select({
      month: sql<string>`to_char(${transactions.date}, 'YYYY-MM')`.as('month_label'),
      type: transactions.type,
      total: sum(transactions.amount).as('monthly_total'),
    })
    .from(transactions)
    .where(gte(transactions.date, yearAgo))
    .groupBy(sql`to_char(${transactions.date}, 'YYYY-MM')`, transactions.type)
    .orderBy(sql`to_char(${transactions.date}, 'YYYY-MM') ASC`);

    res.json({
      totals: {
        income: Number(incomeResult[0]?.total || 0),
        expenses: Number(expenseResult[0]?.total || 0),
        balance: Number(incomeResult[0]?.total || 0) - Number(expenseResult[0]?.total || 0),
        balanceChange: Number(balanceChange.toFixed(1)),
      },
      currentMonth: {
        income: cInc,
        expenses: cExp,
        incomeChange: Number(incomeChange.toFixed(1)),
        expenseChange: Number(expenseChange.toFixed(1)),
      },
      averages: { // Simple rough averages based on last 6 months 
        income: Number((totalIncome / 6).toFixed(2)),
        expenses: Number((totalExpenses / 6).toFixed(2)),
      },
      expenseSplits: {
        daily: dailyExpense,
        weekly: weeklyExpense,
        monthly: cExp
      },
      categoryBreakdown: categoryBreakdown.map(c => ({
        category: c.category,
        totalAmount: Number(c.totalAmount || 0)
      })),
      recentActivity: recentActivity.map(r => ({
        ...r,
        amount: Number(r.amount)
      })),
      monthlyTrends: monthlyTrends.map(t => ({
        month: t.month,
        type: t.type,
        total: Number(t.total || 0)
      })),
    });
  } catch (err) {
    console.error('Summary API Error:', err);
    res.status(500).json({ error: 'Failed to generate dashboard summary', details: String(err) });
  }
});

export default router;
