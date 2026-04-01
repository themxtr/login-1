import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

const pool = new Pool({
  connectionString,
  // SSL required for Supabase
  ssl: process.env.NODE_ENV === 'production' || connectionString.includes('supabase')
    ? { rejectUnauthorized: false }
    : false,
  max: 10,
});

export const db = drizzle(pool, { schema });
