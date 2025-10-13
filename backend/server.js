const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Path to store positions
const POSITIONS_FILE = path.join(__dirname, 'data', 'positions.json');

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = path.join(__dirname, 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Initialize positions file if it doesn't exist
async function initPositionsFile() {
  try {
    await fs.access(POSITIONS_FILE);
  } catch {
    await fs.writeFile(POSITIONS_FILE, JSON.stringify({}), 'utf8');
  }
}

// GET endpoint to retrieve positions
app.get('/api/positions', async (req, res) => {
  try {
    const data = await fs.readFile(POSITIONS_FILE, 'utf8');
    const positions = JSON.parse(data);
    res.json(positions);
  } catch (error) {
    console.error('Error reading positions:', error);
    res.status(500).json({ error: 'Failed to read positions' });
  }
});

// POST endpoint to save positions
app.post('/api/positions', async (req, res) => {
  try {
    const positions = req.body;
    await fs.writeFile(POSITIONS_FILE, JSON.stringify(positions, null, 2), 'utf8');
    res.json({ success: true, message: 'Positions saved successfully' });
  } catch (error) {
    console.error('Error saving positions:', error);
    res.status(500).json({ error: 'Failed to save positions' });
  }
});

// DELETE endpoint to reset positions
app.delete('/api/positions', async (req, res) => {
  try {
    await fs.writeFile(POSITIONS_FILE, JSON.stringify({}), 'utf8');
    res.json({ success: true, message: 'Positions reset successfully' });
  } catch (error) {
    console.error('Error resetting positions:', error);
    res.status(500).json({ error: 'Failed to reset positions' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Start server
async function startServer() {
  await ensureDataDir();
  await initPositionsFile();

  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
    console.log(`API endpoints available:`);
    console.log(`  GET    /api/positions - Get saved positions`);
    console.log(`  POST   /api/positions - Save positions`);
    console.log(`  DELETE /api/positions - Reset positions`);
    console.log(`  GET    /api/health    - Health check`);
  });
}

startServer().catch(console.error);
