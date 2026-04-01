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
const PORT = process.env.PORT || 3000;

// Base Middleware
app.use(cors());
app.use(express.json());

// Auth - Required for all routes
app.use(authMiddleware);

// Health Check
app.get('/health', (req: express.Request, res: express.Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// APIs
app.use('/records', recordsRouter);
app.use('/dashboard', dashboardRouter);
app.use('/users', usersRouter);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred',
  });
});

app.listen(PORT, () => {
  console.log(`Finance Dashboard Backend running on http://localhost:${PORT}`);
  console.log('Firebase Auth enabled with legacy mock header fallback.');
});
