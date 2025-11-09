# FlexPresent - Flexible Presentation App

A modern, flexible presentation web application that breaks free from traditional slide-based presentations. Create dynamic, interactive presentations with images and videos that you can arrange freely in a customizable playfield.

## Features

### 🎴 Card System
- **Landscape & Portrait Modes**: Choose orientation for each media card
- **Drag & Drop**: Move cards freely around the playfield
- **Resize**: Adjust card size using the resize handle in the bottom-right corner
- **Click to Maximize**: Click any card to view it in full-screen mode
- **Scroll Zoom**: When a card is maximized, use mouse wheel to zoom in/out

### 🎬 Media Support
- **Images**: Upload and display JPG, PNG, GIF, and other image formats
- **Videos**: Upload video files with automatic thumbnail generation
  - Shows first frame as preview
  - Play button overlay on cards
  - Full video controls when maximized
  - Click to play functionality

### 🎨 Customizable Playfield
- **Background Color**: Choose any solid color for your playfield
- **Background Image**: Upload a custom background image
- **Clear Background**: Reset to default background
- **Pan Navigation**: Click and drag the playfield to navigate

### 📐 Smart Layouts
Automatically arrange your cards in various patterns:
- **Circle**: Arrange cards in a circular pattern
- **Curve**: Place cards along a curved line (perfect for storylines)
- **Grid**: Organize cards in a neat grid layout
- **Line**: Arrange cards in a horizontal line

### 💾 Save & Load
- **Save Presentation**: Export your entire presentation as a JSON file
  - Preserves card positions, sizes, and orientations
  - Saves background settings
  - Includes all media (embedded as base64)
- **Load Presentation**: Import previously saved presentations

## How to Use

### Getting Started
1. Open `index.html` in a modern web browser
2. Click "Add Media" to upload images or videos
3. Choose orientation (Landscape or Portrait)
4. Your cards will appear on the playfield

### Working with Cards
- **Move**: Click and drag any card to reposition it
- **Resize**: Drag the corner handle to resize
- **Maximize**: Click a card to view it full-screen
- **Delete**: Hover over a card and click the X button
- **Zoom**: While maximized, scroll to zoom in/out

### Arranging Cards
Use the layout buttons to automatically arrange your cards:
- ⭕ **Circle** - Circular arrangement
- 〰️ **Curve** - Curved line (great for storytelling)
- ▦ **Grid** - Organized grid layout
- ━ **Line** - Horizontal line

### Customizing Background
- 🎨 Click the palette icon to choose a color
- 🖼️ Click the image icon to upload a background image
- 🗑️ Click the trash icon to clear the background

### Saving Your Work
1. Click the "Save" button (💾)
2. A JSON file will be downloaded
3. To load it later, click "Load" (📂) and select the file

## Technical Details

### Technologies Used
- Pure HTML5, CSS3, and JavaScript (ES6+)
- No external dependencies
- Responsive design
- Modern browser APIs:
  - File API for media uploads
  - FileReader for base64 encoding
  - DOM manipulation
  - CSS transforms and animations

### Browser Compatibility
- Chrome/Edge: Fully supported
- Firefox: Fully supported
- Safari: Fully supported
- Mobile browsers: Supported with touch events

### File Structure
```
showcase/
├── index.html          # Main HTML structure
├── styles.css          # All styling and animations
├── app.js             # Application logic
└── README.md          # Documentation
```

## Features Breakdown

### Card Interaction
Each card supports:
- Dragging (click and hold, then move)
- Resizing (drag bottom-right corner)
- Deletion (hover and click X)
- Maximization (single click)

### Video Handling
- Automatic thumbnail generation from first frame
- Play icon overlay on video cards
- Full controls when maximized
- Wait for user interaction before playing

### Layout Algorithms
- **Circle**: Distributes cards evenly around a circle using trigonometry
- **Curve**: Uses Bezier curve mathematics for smooth arrangement
- **Grid**: Calculates optimal rows/columns based on card count
- **Line**: Even horizontal spacing across the playfield

## Tips & Best Practices

1. **Organization**: Use layout tools to quickly organize many cards
2. **Background**: Choose backgrounds that complement your content
3. **Card Sizes**: Resize cards to emphasize important content
4. **Videos**: Use videos sparingly for maximum impact
5. **Save Often**: Save your presentations regularly
6. **Storytelling**: Use the curve layout to create visual narratives

## Keyboard & Mouse Reference

### Mouse Actions
- **Click**: Select/Maximize card
- **Drag**: Move card or pan playfield
- **Scroll** (on maximized view): Zoom in/out
- **Drag corner**: Resize card

### Tips
- Hold and drag on empty playfield area to pan
- Click quickly on a card to maximize (don't hold too long)
- Use scroll wheel for precise zooming when viewing media

## Future Enhancements

Potential features for future versions:
- Text cards with formatting
- Drawing tools
- Animations and transitions
- Presentation mode with auto-advance
- Collaboration features
- Export to PDF or images
- Undo/Redo functionality
- Keyboard shortcuts
- Touch gesture support
- Cloud storage integration

## License

Free to use and modify for personal and commercial projects.

## Support

For issues or questions, please refer to the documentation or modify the code to suit your needs.

---

**Enjoy creating flexible, dynamic presentations!**
