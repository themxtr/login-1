import { pgTable, text, real, uuid, timestamp, pgEnum } from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['ADMIN', 'ANALYST', 'VIEWER']);
export const statusEnum = pgEnum('status', ['ACTIVE', 'INACTIVE']);
export const transactionTypeEnum = pgEnum('transaction_type', ['INCOME', 'EXPENSE']);
export const financialGroupEnum = pgEnum('financial_group', ['REVENUE', 'COGS', 'EXPENSE', 'ASSET', 'LIABILITY', 'EQUITY']);

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  role: roleEnum('role').notNull().default('VIEWER'),
  status: statusEnum('status').notNull().default('ACTIVE'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const transactions = pgTable('transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  amount: real('amount').notNull(),
  type: transactionTypeEnum('type').notNull(),
  financialGroup: financialGroupEnum('financial_group').notNull().default('EXPENSE'),
  category: text('category').notNull(),
  date: timestamp('date').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
