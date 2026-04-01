import dotenv from 'dotenv';
dotenv.config();

import { db } from './client';
import { users, transactions } from './schema';
import { Pool } from 'pg';

async function seed() {
  console.log('🌱 Seeding Supabase database...');

  // 1. Create Users (no hardcoded IDs — PostgreSQL generates UUIDs)
  const [admin] = await db.insert(users).values({
    name: 'Default Admin',
    email: 'admin@finance.com',
    role: 'ADMIN',
    status: 'ACTIVE',
  }).onConflictDoNothing().returning();

  const [analyst] = await db.insert(users).values({
    name: 'Sample Analyst',
    email: 'analyst@finance.com',
    role: 'ANALYST',
    status: 'ACTIVE',
  }).onConflictDoNothing().returning();

  if (!admin) {
    console.log('Users already seeded — skipping.');
    process.exit(0);
  }

  console.log(`✅ Created users: Admin (${admin.id}), Analyst (${analyst?.id})`);

  // 2. Create Sample Transactions
  const categories = ['Housing', 'Food', 'Salary', 'Investment', 'Entertainment', 'Utilities', 'Transportation'];
  const sampleTransactions: (typeof transactions.$inferInsert)[] = [];

  // Monthly salary (6 months)
  for (let i = 0; i < 6; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    date.setDate(1);
    sampleTransactions.push({
      userId: admin.id,
      amount: 5000,
      type: 'INCOME' as const,
      category: 'Salary',
      date,
      notes: `Salary for month -${i}`,
    });
  }

  // Monthly Rent
  for (let i = 0; i < 6; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    date.setDate(1);
    sampleTransactions.push({
      userId: admin.id,
      amount: 1500,
      type: 'EXPENSE' as const,
      category: 'Housing',
      date,
      notes: `Rent for month -${i}`,
    });
  }

  // Random expenses
  for (let i = 0; i < 50; i++) {
    const type = Math.random() > 0.8 ? 'INCOME' : 'EXPENSE';
    const amount = type === 'INCOME' ? Math.floor(Math.random() * 200) : Math.floor(Math.random() * 100);
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 180));
    sampleTransactions.push({
      userId: admin.id,
      amount,
      type,
      category: categories[Math.floor(Math.random() * categories.length)],
      date,
      notes: `Sample ${type.toLowerCase()} record #${i}`,
    });
  }

  await db.insert(transactions).values(sampleTransactions);
  console.log(`✅ Inserted ${sampleTransactions.length} sample transactions.`);
  console.log('🎉 Seeding complete!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
