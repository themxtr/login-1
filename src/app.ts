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

// CORS — allow all origins (same-origin in production, but needed for dev)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Id', 'X-User-Role'],
}));
app.options('*', cors()); // Handle CORS preflight for all routes

app.use(express.json());

// Health Check — NO auth required (for diagnostics)
app.get('/api/health', async (req: express.Request, res: express.Response) => {
  let dbStatus = 'unknown';
  try {
    const { pool } = await import('./db/client');
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    dbStatus = 'connected';
  } catch (e: any) {
    dbStatus = `error: ${e.message}`;
  }
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    db: dbStatus,
    env: {
      hasDb: !!process.env.DATABASE_URL,
      hasFirebase: !!process.env.FIREBASE_PROJECT_ID,
      dbUrl: process.env.DATABASE_URL?.slice(0, 50) + '...',
    }
  });
});

// Auth — required for all API routes below
app.use(authMiddleware);

// APIs
app.use('/api/records', recordsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/users', usersRouter);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred',
  });
});

export default app;
