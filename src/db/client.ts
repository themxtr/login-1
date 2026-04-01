import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Supabase pooler requires SSL — append sslmode if not present
const connStr = connectionString.includes('sslmode')
  ? connectionString
  : `${connectionString}${connectionString.includes('?') ? '&' : '?'}sslmode=require`;

const pool = new Pool({
  connectionString: connStr,
  ssl: { rejectUnauthorized: false },
  max: 5,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 10000,
});

// Prevent uncaught exceptions from crashing the serverless function
pool.on('error', (err) => {
  console.error('[DB Pool Error]', err.message);
});

export const db = drizzle(pool, { schema });
export { pool };
