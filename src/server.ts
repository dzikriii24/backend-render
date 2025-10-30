import app from './app';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000 || '0.0.0.0';

app.get('/ping', (req, res) => {
  res.send('Hallo, Percobaan Ping');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}).on('error', (err) => {
  console.error('Server error:', err);
});