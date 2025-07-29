import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const PORT = process.env.PORT || 5000;

// Serve static files
app.use(express.static('.'));

// API placeholder endpoints
app.get('/api/*', (req, res) => {
  res.json({ message: 'API endpoint - configure with your database' });
});

// Serve the React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Top Web Directories running on port ${PORT}`);
});
