import dotenv from 'dotenv';

// Load env vars FIRST before any other module reads process.env
dotenv.config();

// Now import app (which transitively imports db/client.ts that reads DATABASE_URL)
import app from './app';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Finance Dashboard Backend running on http://localhost:${PORT}`);
  console.log('Firebase Auth enabled with legacy mock header fallback.');
});
