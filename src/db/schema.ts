import { pgTable, text, real, uuid, timestamp, pgEnum } from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['ADMIN', 'ANALYST', 'VIEWER']);
export const statusEnum = pgEnum('status', ['ACTIVE', 'INACTIVE']);
export const transactionTypeEnum = pgEnum('transaction_type', ['INCOME', 'EXPENSE']);
export const financialGroupEnum = pgEnum('financial_group', ['REVENUE', 'COGS', 'EXPENSE', 'ASSET', 'LIABILITY', 'EQUITY']);
export const notificationTypeEnum = pgEnum('notification_type', ['EXPENSE_ADDED', 'REVENUE_ADDED', 'LOW_BALANCE', 'HIGH_SPENDING']);

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
  amount: real('amount').notNull(), // This will be the USD-normalized amount for analytics
  currency: text('currency').notNull().default('USD'),
  originalAmount: real('original_amount'),
  exchangeRateAtEntry: real('exchange_rate_at_entry').default(1.0),
  type: transactionTypeEnum('type').notNull(),
  financialGroup: financialGroupEnum('financial_group').notNull().default('EXPENSE'),
  category: text('category').notNull(),
  date: timestamp('date').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  type: notificationTypeEnum('type').notNull(),
  message: text('message').notNull(),
  isRead: text('is_read').default('false'), // Using text for simpler boolean handling in some drizzle versions
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
