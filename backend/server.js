const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Path to store positions
const POSITIONS_FILE = path.join(__dirname, 'data', 'positions.json');

// Path to family data
const FAMILY_DATA_FILE = path.join(__dirname, '..', 'src', 'data', 'familyData.json');

// Path to photos directory
const PHOTOS_DIR = path.join(__dirname, '..', 'public', 'photos');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      // Ensure photos directory exists
      await fs.access(PHOTOS_DIR);
    } catch {
      await fs.mkdir(PHOTOS_DIR, { recursive: true });
    }
    cb(null, PHOTOS_DIR);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Accept only image files
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (jpeg, jpg, png, gif) are allowed!'));
    }
  }
});

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

// POST endpoint to upload photo for a family member
app.post('/api/upload-photo/:memberId', upload.single('photo'), async (req, res) => {
  try {
    const { memberId } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Read family data
    const familyDataContent = await fs.readFile(FAMILY_DATA_FILE, 'utf8');
    const familyData = JSON.parse(familyDataContent);

    // Find the member and update their photo
    const member = familyData.familyMembers.find(m => m.id === memberId);

    if (!member) {
      // Delete uploaded file if member not found
      await fs.unlink(req.file.path);
      return res.status(404).json({ error: 'Family member not found' });
    }

    // Update photo path (use relative path for frontend)
    const photoPath = `/photos/${req.file.filename}`;
    member.photo = photoPath;

    // Save updated family data
    await fs.writeFile(FAMILY_DATA_FILE, JSON.stringify(familyData, null, 2), 'utf8');

    res.json({
      success: true,
      message: 'Photo uploaded successfully',
      photoPath: photoPath,
      memberId: memberId
    });
  } catch (error) {
    console.error('Error uploading photo:', error);
    // Try to delete uploaded file on error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }
    res.status(500).json({ error: 'Failed to upload photo' });
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
    console.log(`  POST   /api/upload-photo/:memberId - Upload photo for family member`);
    console.log(`  GET    /api/health    - Health check`);
  });
}

startServer().catch(console.error);
