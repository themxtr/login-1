import { Router, Response } from 'express';
import { db } from '../db/client';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/auth';
import { rbacMiddleware } from '../middleware/rbac';

const router = Router();

const createUserSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['ADMIN', 'ANALYST', 'VIEWER']).default('VIEWER'),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

const updateUserSchema = z.object({
  name: z.string().optional(),
  role: z.enum(['ADMIN', 'ANALYST', 'VIEWER']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

// Admin only routes
router.use(rbacMiddleware(['ADMIN']));

router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const allUsers = await db.select().from(users);
    res.json(allUsers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const body = createUserSchema.parse(req.body);
    const userId = body.id || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const [newUser] = await db.insert(users).values({
      ...body,
      id: userId,
    } as any).returning();
    res.status(201).json(newUser);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: err.errors });
    }
    res.status(500).json({ error: 'Failed to create user' });
  }
});

router.patch('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const body = updateUserSchema.parse(req.body);
    
    const [updatedUser] = await db.update(users)
      .set(body)
      .where(eq(users.id as any, id as string))
      .returning();
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(updatedUser);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: err.errors });
    }
    res.status(500).json({ error: 'Failed to update user' });
  }
});

export default router;
