const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Parse JSON bodies
app.use(express.json());

// Disable caching for all files
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// In-memory leaderboard (top 10 scores)
let leaderboard = [
  { name: 'Lenny', score: 5000 },
  { name: 'Speedy', score: 4000 },
  { name: 'Racer', score: 3000 },
  { name: 'Nitro', score: 2000 },
  { name: 'Turbo', score: 1000 }
];

// Get leaderboard
app.get('/api/leaderboard', (req, res) => {
  res.json(leaderboard.slice(0, 10));
});

// Submit score
app.post('/api/score', (req, res) => {
  const { name, score } = req.body;

  if (!name || typeof score !== 'number') {
    return res.status(400).json({ error: 'Invalid name or score' });
  }

  // Clean name (max 12 chars, alphanumeric only)
  const cleanName = name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 12) || 'Player';

  // Add score to leaderboard
  leaderboard.push({ name: cleanName, score: score });

  // Sort by score descending and keep top 10
  leaderboard.sort((a, b) => b.score - a.score);
  leaderboard = leaderboard.slice(0, 10);

  // Find rank
  const rank = leaderboard.findIndex(entry => entry.name === cleanName && entry.score === score) + 1;

  res.json({
    success: true,
    rank: rank > 0 && rank <= 10 ? rank : null,
    leaderboard: leaderboard.slice(0, 10)
  });
});

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public'), {
  etag: false,
  lastModified: false
}));

// Serve index.html for root route
app.get('/', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Lenny Rider v4 - With Leaderboard!`);
  console.log(`Running on port ${PORT}`);
});
