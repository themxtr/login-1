import { createClient } from '@libsql/client';

async function check() {
  const client = createClient({ url: 'file:sqlite.db' });
  const rs = await client.execute("SELECT name FROM sqlite_master WHERE type='table';");
  console.log(rs.rows.map(r => r.name));
  process.exit(0);
}

check();
