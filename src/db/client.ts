import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Strip any sslmode from the URL — let the Pool ssl option handle it
// (sslmode in URL overrides Pool ssl options, breaking rejectUnauthorized: false)
const connStr = connectionString.replace(/[?&]sslmode=[^&]*/g, '');

const pool = new Pool({
  connectionString: connStr,
  ssl: { rejectUnauthorized: false }, // Required for Supabase self-signed cert
  max: 5,
  connectionTimeoutMillis: 8000,
  idleTimeoutMillis: 10000,
});

// Prevent uncaught exceptions from crashing the serverless function
pool.on('error', (err) => {
  console.error('[DB Pool Error]', err.message);
});

export const db = drizzle(pool, { schema });
export { pool };
