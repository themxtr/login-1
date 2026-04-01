import { db } from './client';
import { users, transactions } from './schema';
import { randomUUID } from 'node:crypto';

async function seed() {
  console.log('Seeding database...');

  // 1. Create Users
  const [admin] = await db.insert(users).values({
    id: 'admin-id',
    name: 'Default Admin',
    email: 'admin@finance.com',
    role: 'ADMIN',
    status: 'ACTIVE',
  }).returning();

  const [analyst] = await db.insert(users).values({
    id: 'analyst-id',
    name: 'Sample Analyst',
    email: 'analyst@finance.com',
    role: 'ANALYST',
    status: 'ACTIVE',
  }).returning();

  const [viewer] = await db.insert(users).values({
    id: 'viewer-id',
    name: 'Sample Viewer',
    email: 'viewer@finance.com',
    role: 'VIEWER',
    status: 'ACTIVE',
  }).returning();

  console.log(`Created users: Admin (${admin.id}), Analyst (${analyst.id}), Viewer (${viewer.id})`);

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
      date: date,
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
      date: date,
      notes: `Rent for month -${i}`,
    });
  }

  // Random expenses
  for (let i = 0; i < 50; i++) {
    const type = Math.random() > 0.8 ? 'INCOME' : 'EXPENSE';
    const amount = type === 'INCOME' ? Math.floor(Math.random() * 200) : Math.floor(Math.random() * 100);
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 180)); // Last 6 months

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
  console.log('Inserted 62 sample transactions.');

  console.log('Seeding complete!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
