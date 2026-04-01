import { Router, Response } from 'express';
import { db } from '../db/client';
import { transactions } from '../db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { z as zod } from 'zod';
import { AuthenticatedRequest } from '../middleware/auth';
import { rbacMiddleware } from '../middleware/rbac';

const router = Router();

const transactionSchema = zod.object({
  amount: zod.number(),
  type: zod.enum(['INCOME', 'EXPENSE']),
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

// GET /records: Analyst and Admin can view records
router.get('/', rbacMiddleware(['ANALYST', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
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

// Admin only management routes
router.use(rbacMiddleware(['ADMIN']));

router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const body = transactionSchema.parse(req.body);
    const [newRecord] = await db.insert(transactions).values({
      ...body,
      userId: req.user!.id,
    }).returning();
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
      .where(eq(transactions.id, id))
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
      .where(eq(transactions.id, id))
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
