# Orodho Family Tree

An interactive web-based family tree application for the Orodho family, designed to visualize family relationships, multiple marriages, and generational connections.

## Features

- **Interactive Visualization**: Pan, zoom, and navigate through the family tree
- **Person Details**: Click on any family member to view detailed information
- **Photo Support**: Display photos for each family member
- **Multiple Marriages**: Handles family members with multiple spouses
- **Status Indicators**: Visual distinction between living and deceased members
- **Gender-Based Styling**: Different colors for male and female family members
- **Relationship Mapping**: Clear visualization of marriages, parent-child relationships
- **Detailed Information**: Birth dates, death dates, descriptions, and more
- **Cross-Browser Position Sync**: Move family member cards and positions sync across all browsers and devices in real-time

## Prerequisites

Before you begin, ensure you have the following installed on your computer:

1. **Node.js** (version 16 or higher)
   - Download from: https://nodejs.org/
   - Choose the LTS (Long Term Support) version
   - After installation, verify by opening a terminal/command prompt and typing:
     ```bash
     node --version
     npm --version
     ```

## Getting Started

### 1. Installation

Open a terminal/command prompt in the project folder and run:

```bash
npm install
npm run install:backend
```

This will install all the necessary dependencies for both frontend and backend.

### 2. Running the Application

To start both the frontend and backend servers, run:

```bash
npm run dev
```

This will start:
- **Frontend**: http://localhost:5173 (Vite dev server)
- **Backend**: http://localhost:3001 (Express API server)

The application will open in your browser at `http://localhost:5173`.

**Note**: Both servers must be running for position synchronization to work across browsers. If you only want to run the frontend without backend, use `npm run dev:frontend`.

### 3. Building for Production

To create a production-ready build:

```bash
npm run build
```

The built files will be in the `dist` folder.

## How to Use the Application

### Navigating the Family Tree

- **Pan**: Click and drag on the background to move around
- **Zoom**: Use your mouse wheel or pinch gestures to zoom in/out
- **View Details**: Click on any person's card to see their full details
- **Reset View**: Use the controls in the bottom-left to fit the entire tree in view

### Understanding the Visual Elements

- **Green Border**: Living family members
- **Gray Border**: Deceased family members
- **Blue Photo Border**: Male family members
- **Pink Photo Border**: Female family members
- **Pink Heart Icon**: Indicates multiple marriages
- **Pink Lines**: Marriage connections
- **Gray Lines**: Parent-child connections

## Adding Your Own Family Data

### Method 1: Editing the JSON File (Recommended)

1. Open `src/data/familyData.json` in a text editor
2. Follow the existing structure to add new family members

#### Family Member Structure

```json
{
  "id": "unique-id-here",
  "name": "Full Name",
  "gender": "male" or "female",
  "birthDate": "YYYY-MM-DD",
  "deathDate": "YYYY-MM-DD" or null,
  "isDeceased": true or false,
  "photo": "/photos/filename.jpg",
  "description": "Brief biography or description",
  "parents": ["parent-id-1", "parent-id-2"],
  "spouses": [
    {
      "spouseId": "spouse-id",
      "marriageDate": "YYYY-MM-DD",
      "marriageOrder": 1,
      "children": ["child-id-1", "child-id-2"]
    }
  ]
}
```

#### Important Tips for Adding Data

1. **Unique IDs**: Each person must have a unique ID (e.g., "person-001", "person-002")
2. **Repeated Names**: You can have multiple people with the same name - just give them different IDs
3. **Multiple Marriages**: Add multiple objects in the `spouses` array
4. **No Spouse/Children**: Use empty array `[]` if someone has no spouses
5. **Living Members**: Set `deathDate` to `null` and `isDeceased` to `false`
6. **Photos**: Place photos in the `public/photos` folder

### Method 2: Adding Photos

1. Place your photos in the `public/photos/` folder
2. In the JSON file, reference them as: `/photos/your-photo-name.jpg`
3. Supported formats: .jpg, .jpeg, .png, .gif
4. Recommended size: 200x200 pixels or larger (square images work best)

#### Example of Adding a New Person

```json
{
  "id": "person-043",
  "name": "Jane Orodho",
  "gender": "female",
  "birthDate": "1990-05-15",
  "deathDate": null,
  "isDeceased": false,
  "photo": "/photos/jane-orodho.jpg",
  "description": "University professor specializing in history. Active community volunteer.",
  "parents": ["person-019", "person-033"],
  "spouses": []
}
```

## Position Synchronization

The application now includes a backend server that synchronizes node positions across all browsers and devices:

- **Real-time Sync**: When you move a family member card, the position is saved to the server
- **Cross-Browser**: Open the app in different browsers or devices, and positions will be the same
- **Persistent**: Positions are saved to a JSON file on the server, surviving server restarts
- **Automatic Saving**: Positions are automatically saved 500ms after you stop moving a card
- **Fallback**: If the backend server is not running, positions are saved locally to your browser

### How It Works

1. When you move a card, the position is sent to the backend API
2. The backend stores all positions in `backend/data/positions.json`
3. When anyone loads the page, positions are loaded from the server
4. If the server is unavailable, the app falls back to localStorage

## Project Structure

```
orodho-family-tree/
├── backend/                 # Backend server
│   ├── data/               # Position data storage
│   ├── server.js           # Express API server
│   └── package.json        # Backend dependencies
├── public/
│   └── photos/              # Store family photos here
├── src/
│   ├── components/          # React components
│   │   ├── FamilyTree.jsx   # Main tree visualization
│   │   ├── PersonNode.jsx   # Individual person cards
│   │   └── PersonDetail.jsx # Detail modal
│   ├── data/
│   │   └── familyData.json  # Family data storage
│   ├── utils/
│   │   └── familyTreeUtils.js # Helper functions
│   ├── App.jsx              # Main app component
│   ├── App.css              # Styling
│   └── main.jsx             # App entry point
├── package.json             # Dependencies
└── README.md                # This file
```

## Customization

### Changing Colors

Edit `src/components/PersonNode.jsx` and `src/App.css` to change colors:

- Male color: `#4A90E2` (blue)
- Female color: `#E91E63` (pink)
- Living border: `#4CAF50` (green)
- Deceased border: `#666` (gray)
- Marriage line: `#ff69b4` (hot pink)

### Layout Adjustments

In `src/utils/familyTreeUtils.js`, you can modify:

- `xSpacing`: Horizontal distance between family members (default: 250)
- `ySpacing`: Vertical distance between generations (default: 200)

## Migrating to Neon Database (Future)

When you're ready to move from JSON to a database:

1. Set up a Neon PostgreSQL database at https://neon.tech
2. Create a table schema based on the JSON structure
3. Update the data fetching logic in `src/App.jsx`
4. Replace the JSON import with API calls to your database

## Troubleshooting

### Application Won't Start

- Ensure Node.js is installed: `node --version`
- Delete `node_modules` folder and `package-lock.json`
- Run `npm install` again
- Try `npm run dev`

### Photos Not Showing

- Check that photos are in the `public/photos/` folder
- Verify the path in JSON starts with `/photos/`
- Make sure file names match exactly (case-sensitive)

### Tree Layout Issues

- Too crowded: Increase `xSpacing` and `ySpacing` values
- Too spread out: Decrease those values
- Members not connected: Check parent/spouse IDs match exactly

## Technical Details

### Built With

- **React** - UI framework
- **Vite** - Build tool and dev server
- **React Flow** - Graph visualization library
- **Lucide React** - Icon library

### Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review the example data in `familyData.json`
3. Ensure all IDs match correctly between family members

## Future Enhancements

Potential features to add:

- [ ] Search functionality
- [ ] Export to PDF
- [ ] Print-friendly view
- [ ] Admin panel for editing
- [ ] Database integration (Neon)
- [ ] Mobile-optimized layout
- [ ] Family statistics dashboard
- [ ] Timeline view

## License

This is a private family project. All rights reserved.

---

**Version**: 1.0.0
**Last Updated**: October 2025
**Created for**: Orodho Family
