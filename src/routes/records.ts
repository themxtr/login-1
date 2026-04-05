import { Router, Response } from 'express';
import { db } from '../db/client';
import { transactions, notifications } from '../db/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import { z as zod } from 'zod';
import { AuthenticatedRequest } from '../middleware/auth';
import { rbacMiddleware } from '../middleware/rbac';

const router = Router();

const transactionSchema = zod.object({
  amount: zod.number(),
  type: zod.enum(['INCOME', 'EXPENSE']),
  financialGroup: zod.enum(['REVENUE', 'COGS', 'EXPENSE', 'ASSET', 'LIABILITY', 'EQUITY']).optional(),
  category: zod.string().min(1),
  date: zod.coerce.date(),
  notes: zod.string().optional(),
});

const filterSchema = zod.object({
  startDate: zod.preprocess((val) => val === '' ? undefined : val, zod.coerce.date().optional()),
  endDate: zod.preprocess((val) => val === '' ? undefined : val, zod.coerce.date().optional()),
  category: zod.string().optional(),
  type: zod.preprocess((val) => val === '' ? undefined : val, zod.enum(['INCOME', 'EXPENSE']).optional()),
});

// GET /records: All roles can view records, but management is restricted
router.get('/', rbacMiddleware(['VIEWER', 'ANALYST', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const filters = filterSchema.parse(req.query);
    const conditions = [];

    if (filters.startDate) conditions.push(gte(transactions.date, filters.startDate));
    if (filters.endDate) conditions.push(lte(transactions.date, filters.endDate));
    if (filters.category) conditions.push(eq(transactions.category, filters.category));
    if (filters.type) conditions.push(eq(transactions.type, filters.type));

    const allRecords = await db.select()
      .from(transactions)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(transactions.date);

    res.json(allRecords);
  } catch (err) {
    if (err instanceof zod.ZodError) {
      return res.status(400).json({ error: 'Invalid query parameters', details: err.errors });
    }
    res.status(500).json({ error: 'Failed to fetch records' });
  }
});

// Admin and Analyst management routes
router.use(rbacMiddleware(['ADMIN', 'ANALYST']));

router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const body = transactionSchema.parse(req.body);
    const [newRecord] = await db.insert(transactions).values({
      ...body,
      userId: req.user!.id,
    } as any).returning();

    // 1. Transaction Notification
    const notifType = body.type === 'INCOME' ? 'REVENUE_ADDED' : 'EXPENSE_ADDED';
    const notifMessage = body.type === 'INCOME' 
      ? `Successfully added revenue of $${body.amount} in ${body.category}`
      : `New expense of $${body.amount} recorded for ${body.category}`;

    await db.insert(notifications).values({
      userId: req.user!.id,
      type: notifType,
      message: notifMessage,
    } as any);

    // 2. High Spending Check (if expense > 1000)
    if (body.type === 'EXPENSE' && body.amount > 1000) {
      await db.insert(notifications).values({
        userId: req.user!.id,
        type: 'HIGH_SPENDING',
        message: `Alert: High spending detected! $${body.amount} spent on ${body.category}.`,
      } as any);
    }

    // 3. Low Balance Check
    const [balanceResult] = await db.select({
      balance: sql<number>`SUM(CASE WHEN type = 'INCOME' THEN amount ELSE -amount END)`
    }).from(transactions).where(eq(transactions.userId, req.user!.id));

    if (balanceResult && balanceResult.balance < 500) {
      await db.insert(notifications).values({
        userId: req.user!.id,
        type: 'LOW_BALANCE',
        message: `Low balance alert: Your current balance is $${balanceResult.balance?.toFixed(2) || '0.00'}.`,
      } as any);
    }

    res.status(201).json(newRecord);
  } catch (err: any) {
    console.error('Create Record Error:', err.message || err);
    if (err instanceof zod.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: err.errors });
    }
    res.status(500).json({ error: 'Failed to create record', message: err.message });
  }
});

router.patch('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const body = transactionSchema.partial().parse(req.body);
    
    const [updatedRecord] = await db.update(transactions)
      .set(body)
      .where(eq(transactions.id as any, id as string))
      .returning();
    
    if (!updatedRecord) {
      return res.status(404).json({ error: 'Record not found' });
    }
    
    res.json(updatedRecord);
  } catch (err) {
    if (err instanceof zod.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: err.errors });
    }
    res.status(500).json({ error: 'Failed to update record' });
  }
});

router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const [deletedRecord] = await db.delete(transactions)
      .where(eq(transactions.id as any, id as string))
      .returning();
    
    if (!deletedRecord) {
      return res.status(404).json({ error: 'Record not found' });
    }
    
    res.json({ message: 'Record deleted successfully', record: deletedRecord });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete record' });
  }
});

export default router;
