import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import './lib/firebase'; // Initialize Firebase Admin
import { authMiddleware } from './middleware/auth';
import recordsRouter from './routes/records';
import dashboardRouter from './routes/dashboard';
import usersRouter from './routes/users';

dotenv.config();

const app = express();

// Base Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Id', 'X-User-Role'],
}));
app.use(express.json());

// Auth - Required for all routes
app.use(authMiddleware);

// Health Check
app.get('/api/health', (req: express.Request, res: express.Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// APIs - prefixed with /api for Vercel routing
app.use('/api/records', recordsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/users', usersRouter);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred',
  });
});

export default app;
