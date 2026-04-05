import { Router, Response } from 'express';
import { db } from '../db/client';
import { notifications } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { AuthenticatedRequest } from '../middleware/auth';
import { rbacMiddleware } from '../middleware/rbac';

const router = Router();

// Everyone can see their own notifications
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userNotifs = await db.select()
      .from(notifications)
      .where(eq(notifications.userId, req.user!.id))
      .orderBy(desc(notifications.createdAt));
    
    res.json(userNotifs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

router.patch('/:id/read', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await db.update(notifications)
      .set({ isRead: 'true' })
      .where(and(eq(notifications.id, id as string), eq(notifications.userId, req.user!.id)));
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

export default router;
