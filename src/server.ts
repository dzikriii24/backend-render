// src/server.ts
import app from './app';
import dotenv from 'dotenv';

dotenv.config();

// ✅ FIX: Convert PORT to number
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});