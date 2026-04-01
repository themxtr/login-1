import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core';
import { randomUUID } from 'node:crypto';

export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  role: text('role', { enum: ['ADMIN', 'ANALYST', 'VIEWER'] }).notNull().default('VIEWER'),
  status: text('status', { enum: ['ACTIVE', 'INACTIVE'] }).notNull().default('ACTIVE'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const transactions = sqliteTable('transactions', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  userId: text('user_id').references(() => users.id).notNull(),
  amount: real('amount').notNull(),
  type: text('type', { enum: ['INCOME', 'EXPENSE'] }).notNull(),
  category: text('category').notNull(),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});
