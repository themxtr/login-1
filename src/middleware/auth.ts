import { Request, Response, NextFunction } from 'express';
import { admin } from '../lib/firebase';

export type AuthenticatedRequest = Request & {
  user?: {
    id: string;
    role: 'ADMIN' | 'ANALYST' | 'VIEWER';
    email?: string;
  };
};

export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // FALLBACK for initial development OR if user specifically wants mock auth still.
    // However, the goal is real auth, so we should eventually remove this.
    const mockId = req.headers['x-user-id'] as string;
    const mockRole = req.headers['x-user-role'] as 'ADMIN' | 'ANALYST' | 'VIEWER';
    
    if (mockId && mockRole) {
      req.user = { id: mockId, role: mockRole };
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
    // In a real app, this would come from a database query or Custom Claims.
    let role: 'ADMIN' | 'ANALYST' | 'VIEWER' = 'VIEWER';
    
    // Quick heuristic: the first user or a specific dev email is ADMIN
    if (process.env.ADMIN_EMAILS?.includes(decodedToken.email || '')) {
      role = 'ADMIN';
    }

    req.user = {
      id: decodedToken.uid,
      email: decodedToken.email,
      role: role
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
