import app from './app';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Finance Dashboard Backend running on http://localhost:${PORT}`);
  console.log('Firebase Auth enabled with legacy mock header fallback.');
});
