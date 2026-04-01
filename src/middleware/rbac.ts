import express, { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';

export const rbacMiddleware = (allowedRoles: ('ADMIN' | 'ANALYST' | 'VIEWER')[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Your role (${req.user.role}) is not authorized to access this resource. Allowed: [${allowedRoles.join(', ')}]`,
      });
    }

    next();
  };
};
