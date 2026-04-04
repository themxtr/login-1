import { Request, Response, NextFunction } from 'express';
import { admin } from '../lib/firebase';
import { db } from '../db/client';
import { users } from '../db/schema';

export type AuthenticatedRequest = Request & {
  user?: {
    id: string;
    role: 'ADMIN' | 'ANALYST' | 'VIEWER';
    email?: string;
    name?: string;
  };
};

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthenticatedRequest;
  const authHeader = authReq.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // FALLBACK for initial development OR if user specifically wants mock auth still.
    // However, the goal is real auth, so we should eventually remove this.
    const mockId = req.headers['x-user-id'] as string;
    const mockRole = req.headers['x-user-role'] as 'ADMIN' | 'ANALYST' | 'VIEWER';
    
    if (mockId && mockRole) {
      authReq.user = { id: mockId, role: mockRole };
      return next();
    }

    return res.status(401).json({
      error: 'Unauthorized',
      message: 'No valid Bearer token or legacy mock headers provided.'
    });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Role mapping - for now, we'll assign ADMIN to the primary email or first user.
    let role: 'ADMIN' | 'ANALYST' | 'VIEWER' = 'VIEWER';
    
    if (process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()).includes(decodedToken.email || '')) {
      role = 'ADMIN';
    }

    // Sync user to DB (Upsert)
    const name = decodedToken.name || (decodedToken.email ? decodedToken.email.split('@')[0] : 'User');
    
    await db.insert(users).values({
      id: decodedToken.uid,
      name,
      email: decodedToken.email!,
      role: role,
    }).onConflictDoUpdate({
      target: users.id,
      set: {
        email: decodedToken.email!,
        name,
        role: role,
      }
    });

    // Role override for testing (if provided by UI)
    const testRole = req.headers['x-test-role-override'] as 'ADMIN' | 'ANALYST' | 'VIEWER';
    const finalRole = (testRole && ['ADMIN', 'ANALYST', 'VIEWER'].includes(testRole)) ? testRole : role;

    authReq.user = {
      id: decodedToken.uid,
      email: decodedToken.email,
      name,
      role: finalRole
    };

    next();
  } catch (error: any) {
    console.error('Firebase Auth Error:', error.message);
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired Firebase ID token.'
    });
  }
};
