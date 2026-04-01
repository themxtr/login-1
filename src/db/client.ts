import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

// Use Turso in production (set TURSO_DATABASE_URL + TURSO_AUTH_TOKEN env vars)
// Falls back to local SQLite file for local development
const client = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:sqlite.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
