const fs = require('fs').promises;
const path = require('path');

const POSITIONS_FILE = path.join('/tmp', 'positions.json');

// Initialize positions file
async function initPositionsFile() {
  try {
    await fs.access(POSITIONS_FILE);
  } catch {
    await fs.writeFile(POSITIONS_FILE, JSON.stringify({}), 'utf8');
  }
}

exports.handler = async (event, context) => {
  await initPositionsFile();

  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // GET - Retrieve positions
    if (event.httpMethod === 'GET') {
      const data = await fs.readFile(POSITIONS_FILE, 'utf8');
      const positions = JSON.parse(data);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(positions),
      };
    }

    // POST - Save positions
    if (event.httpMethod === 'POST') {
      const positions = JSON.parse(event.body);
      await fs.writeFile(POSITIONS_FILE, JSON.stringify(positions, null, 2), 'utf8');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'Positions saved successfully' }),
      };
    }

    // DELETE - Reset positions
    if (event.httpMethod === 'DELETE') {
      await fs.writeFile(POSITIONS_FILE, JSON.stringify({}), 'utf8');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'Positions reset successfully' }),
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
