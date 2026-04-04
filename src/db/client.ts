import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

// pg's URL parser truncates usernames at dots (e.g., postgres.project-ref → postgres).
// Use Node's URL class to parse the string and pass individual params to bypass this bug.
const parsed = new URL(connectionString);


const pool = new Pool({
  host: parsed.hostname,
  port: parseInt(parsed.port) || 5432,
  database: parsed.pathname.replace(/^\//, ''),
  user: parsed.username,         // Preserves full username: postgres.yrikrxxbnouodwqtfjur
  password: parsed.password,
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
