# 🎨 Showcase - Modern Interactive Presentation Builder

> Transform your ideas into stunning visual presentations with drag-and-drop simplicity and professional polish.

![Version](https://img.shields.io/badge/version-2.4.0-blue.svg)
![React](https://img.shields.io/badge/React-19-61dafb.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

---

## 🌟 What is Showcase?

Showcase is a **desktop-class web application** that lets you create beautiful, interactive presentations by simply dragging images and videos onto an infinite canvas. No slides, no templates, no constraints—just pure creative freedom.

### ✨ Why Choose Showcase?

| Feature | Traditional Tools | Showcase |
|---------|------------------|----------|
| 📊 **Layout** | Fixed slides | Infinite canvas with zoom & pan |
| 🎯 **Arrangement** | Manual positioning | Smart layouts (Circle, Grid, Snake, etc.) |
| 🎨 **Backgrounds** | Limited options | Color, Gradient, or Custom Images |
| 💾 **Storage** | File-based | Auto-save with unlimited capacity |
| ⚡ **Performance** | Can lag with media | Smooth 60fps with hardware acceleration |
| 🎬 **Animations** | Basic transitions | Buttery-smooth Framer Motion |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ installed
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation (3 Simple Steps)

```bash
# 1️⃣ Install dependencies
npm install

# 2️⃣ Start the development server
npm run dev

# 3️⃣ Open your browser
# Visit http://localhost:3003 (or the port shown in terminal)
```

**That's it! You're ready to create.** 🎉

---

## 🎮 How to Use Showcase

### 📸 Adding Media (Your First Step)

1. Click the **"📎 Add Media"** button in the top toolbar
2. Select images or videos from your computer (you can select multiple!)
3. Choose orientation:
   - **Landscape** (16:9) - Great for photos and videos
   - **Portrait** (9:16) - Perfect for mobile screenshots
4. Watch your media appear on the canvas!

### ✍️ Adding Text & Typography

Create beautiful text overlays with full typography control:

**To Add Text:**
1. Click the **"✍️ Expression"** button in the toolbar
2. Customize your text properties:
   - **Font Family** - Choose from 10+ fonts with live preview
   - **Font Size** - Select from 12px to 128px (16 preset sizes)
   - **Color** - Pick from 20 preset colors or use custom color picker
3. Click **"Add Text Field"** to place it on the canvas

**To Edit Existing Text:**
- **Single-click** any text field → Edit the text content directly (type immediately)
- **Double-click** text field → Opens properties menu for font/size/color changes
- **Drag** to reposition (smooth, snappy movement like cards)
- **Delete** using the ❌ button (appears on hover)

**Font Options:**
- Sans-serif (default), Serif, Monospace
- Cursive, Fantasy, Arial, Verdana
- Helvetica, Times New Roman, Comic Sans

**Color Presets Include:**
- Basic colors: White, Black, Red, Green, Blue
- Vibrant colors: Yellow, Magenta, Cyan, Orange, Purple
- Pastels: Soft pink, Turquoise, Sky blue, Golden yellow, Deep purple
- Plus custom hex/RGB input for unlimited possibilities!

### 🎯 Arranging Your Content

#### Manual Positioning
- **Drag cards** anywhere on the canvas
- **Resize cards** by dragging the bottom-right corner
- **Delete cards** by clicking the ❌ button (appears on hover)

#### Smart Auto-Layouts

Click any layout button in the toolbar to instantly organize your cards:

| Layout | Icon | Best For | Visual Pattern | Guide Markers |
|--------|------|----------|----------------|---------------|
| **Circle** | ⭕ | Highlighting central theme | Cards arranged in a perfect circle | Center dot |
| **Grid** | ▦ | Galleries & portfolios | Organized rows and columns | Rectangle frames |
| **Line** | ━ | Timelines & sequences | Horizontal alignment | Start ● → End ✕ |
| **Curve** | 〰️ | Dynamic presentations | Smooth sine wave | Start ● → End ✕ |
| **Snake** | 〰 | Creative layouts | Multi-wave S-pattern | Start ● → End ✕ |

💡 **Pro Tip**: Line, Curve, and Snake layouts include pirate treasure map-style markers - a circle (●) marks the start and an X (✕) marks the end!

🎯 **Layout Persistence**: Your selected layout and customizations are automatically saved and will reappear on reload!

### 🎨 Customizing Layout Guides

When you apply a layout, visual guides appear on your canvas.

**To customize guides:**

1. **Click on any guide** (circle, line, etc.)
2. A customization menu appears with:
   - **Thickness slider** - Drag left/right to adjust (1-20px)
   - **8 preset colors** - Click to select
   - **Custom color input** - Enter hex (#FF00FF) or rgb/rgba values
3. Changes apply instantly!

### 🖼️ Background Customization

Click the **🎨 button** (positioned to the left of the minimap) in the bottom-right corner to access:

#### Color Mode 🎨
- Solid background color
- Color picker + hex code input
- Perfect for clean, professional looks

#### Gradient Mode 🌈
- Two-color linear gradients
- Adjustable angle (0-360°)
- Live preview before applying
- Great for modern, eye-catching backgrounds

#### Image Mode 📷
- Upload custom background images
- **Overlay opacity slider (0-100%)** - Darken/lighten image for better card visibility
- **Background blur slider (0-20px)** - Apply blur effect to background while keeping cards sharp
- Smart layering - opacity and blur only affect background, not your content
- Remove or replace anytime
- Ideal for branding and thematic presentations

💡 **Pro Tip**: Combine opacity and blur for a beautiful depth-of-field effect that makes your cards pop!

### 🔍 Navigation & View Controls

#### Left Sidebar Tools

| Button | Function | Shortcut |
|--------|----------|----------|
| 👆/✋ | Toggle Cursor/Hand mode | - |
| ➕ | Zoom in | Scroll up |
| ➖ | Zoom out | Scroll down |
| 🎯 | Reset view to 100% | - |

#### Navigation Modes

**Cursor Mode (👆)**
- Drag cards to reposition
- Resize and delete cards
- Click empty space to pan canvas

**Hand Mode (✋)**
- Entire canvas becomes draggable
- Perfect for exploring large presentations
- Cards are locked (can't accidentally move them)

#### Mini-Map 🗺️
- Bottom-left corner shows entire canvas overview
- Blue rectangle = your current view
- Click/drag inside minimap to jump to any area
- Automatically scales with zoom level

### 💾 Saving & Loading

#### Presentation Name
- **Editable title** in the top toolbar - click to rename your presentation
- Press **Enter** or click away to save the name
- Press **Escape** to discard changes
- Name is used in filename when exporting

#### Auto-Save
Your work is **automatically saved** every second to your browser's storage (IndexedDB). No "Save" button needed—just create!

#### Manual Export Options

| Button | Format | What's Included | Best For |
|--------|--------|-----------------|----------|
| 💾 **Save** | JSON | All settings & embedded images | Sharing & backup |
| 📦 **Export** | ZIP | Complete package with videos | Large presentations |
| 📂 **Load** | JSON/ZIP | Everything restored | Continuing previous work |

#### File Naming Convention
Files are saved as: `showcase-presentationName-YYYY-MM-DD-hh-mm-ss.json`
- Example: `showcase-my-portfolio-2025-12-04-15-30-45.json`

**Export includes (File Format v2.1):**
- Project name and metadata
- All cards with positions and sizes
- All text fields with content, fonts, sizes, and colors
- Groups with all settings (expanded/collapsed state, styles)
- Background settings (color/gradient/image with opacity and blur)
- Canvas state (zoom level, pan position)
- Layout configuration and guide customizations
- Animation speeds (card and group animations)
- Card backdrop opacity settings
- All visual states persist across sessions

---

## 🛠️ Advanced Features

### Z-Index Layering System
Showcase uses a sophisticated layering system for optimal visual hierarchy:

1. **Layer 0**: Background image or color (bottom)
2. **Layer 1**: Opacity overlay with optional blur
3. **Layer 2**: Layout guides (circles, lines, curves, grids, snakes)
4. **Layer 3**: Media cards (your content)
5. **Layer 4**: UI controls (top)

This ensures your content is always sharp and visible, even with blur effects!

### Keyboard Shortcuts (Coming Soon)
- `Ctrl/Cmd + Z` - Undo
- `Ctrl/Cmd + Y` - Redo
- `Space + Drag` - Pan canvas
- `Delete` - Remove selected card

### Performance Tips

✅ **DO:**
- Use compressed images (WebP, optimized JPG)
- Keep videos under 100MB each
- Close minimap if working with 100+ cards

⚠️ **AVOID:**
- Uncompressed PNG files (use JPG instead)
- 4K videos (1080p is plenty)
- Loading 500+ cards at once

---

## 🎯 Use Cases & Examples

### 📊 Business Presentations
1. Add company logo as background image
2. Arrange product photos in grid layout
3. Adjust overlay opacity for professional look
4. Export as ZIP for client delivery

### 🎨 Creative Portfolios
1. Upload artwork in portrait orientation
2. Use snake layout for dynamic arrangement
3. Customize guide colors to match brand
4. Enable hand mode for smooth navigation

### 📚 Educational Content
1. Add infographic images
2. Arrange in circle around central concept
3. Use gradient background for visual interest
4. Share JSON file with students

### 🏠 Personal Projects
1. Import vacation photos
2. Create curved timeline arrangement
3. Add background image of destination
4. Navigate with minimap for storytelling

---

## 📦 Project Structure

```
showcase/
├── 📁 src/
│   ├── 📁 components/          # React UI Components
│   │   ├── Card.jsx           # Draggable media cards
│   │   ├── Playfield.jsx      # Main infinite canvas
│   │   ├── Toolbar.jsx        # Top menu bar
│   │   ├── VerticalToolbar.jsx # Zoom controls
│   │   ├── Minimap.jsx        # Navigation overview
│   │   ├── LayoutGuides.jsx   # Visual layout helpers
│   │   ├── LayoutCustomizationMenu.jsx
│   │   ├── BackgroundMenu.jsx # Background settings panel
│   │   └── ...                # More components
│   │
│   ├── 📁 store/
│   │   └── useStore.js        # Zustand state management
│   │
│   ├── 📁 utils/
│   │   ├── storage.js         # IndexedDB operations
│   │   └── export.js          # Import/export utilities
│   │
│   ├── App.jsx                # Main application
│   ├── App.css                # Global styles
│   └── main.jsx               # Entry point
│
├── index.html                 # HTML template
├── vite.config.js            # Vite configuration
├── package.json              # Dependencies
└── README.md                 # You are here!
```

---

## 🔧 Tech Stack

Showcase is built with cutting-edge web technologies for maximum performance:

### Core Framework
- **React 19** - Latest UI library with concurrent features
- **Vite** - Lightning-fast bundler (10x faster than Webpack)
- **Zustand** - Tiny (2.9KB) state management

### Visual & Interaction
- **Framer Motion** - Smooth 60fps animations
- **@dnd-kit** - Hardware-accelerated drag & drop
- **CSS Transforms** - GPU-optimized rendering

### Storage & Data
- **IndexedDB (idb)** - Unlimited browser storage
- **JSZip** - Client-side ZIP creation
- **Lodash** - Throttle/debounce utilities

### Why This Stack?

| Technology | Benefit |
|------------|---------|
| React 19 | Virtual DOM prevents expensive reflows |
| Vite | Instant hot module reload (HMR) |
| Zustand | No boilerplate, just `set()` and `get()` |
| Framer Motion | Spring physics for natural animations |
| @dnd-kit | Touch & pointer events, accessibility |
| IndexedDB | Store 100s of images without limits |

---

## 🚀 Performance Benchmarks

| Metric | v1.0 (Vanilla JS) | v2.0 (React) | Improvement |
|--------|-------------------|--------------|-------------|
| **Initial Load** | ~50ms | ~200ms | Acceptable trade-off |
| **Drag Smoothness** | Laggy @ 10+ cards | Smooth @ 50+ cards | **5x better** |
| **Save Operation** | Blocks UI | Background | **Instant** |
| **Animation FPS** | 20-30 fps | 60 fps | **2-3x smoother** |
| **Storage Limit** | 5-10 MB | Unlimited* | **∞ better** |
| **Cards Supported** | ~50 | 500+ | **10x more** |

*Subject to browser quota (typically several GB)

---

## 🔍 Troubleshooting

### 🐛 Common Issues & Solutions

#### Port Already in Use
```bash
# Vite automatically finds the next available port
# Check terminal output for actual port (3001, 3002, etc.)
```

#### Browser Storage Full
```javascript
// Open browser console and check quota:
const info = await navigator.storage.estimate();
console.log('Used:', (info.usage / 1024 / 1024).toFixed(2), 'MB');
console.log('Available:', (info.quota / 1024 / 1024).toFixed(2), 'MB');
```

**Solution:** Export your work as ZIP, clear browser data, then reload.

#### Cards Not Dragging Smoothly
1. Check Chrome DevTools → Performance tab
2. Reduce number of cards (try exporting old ones)
3. Close other browser tabs
4. Try incognito mode (extensions can slow things down)

#### Background Image Not Showing
1. Click 🎨 button (left of minimap) → Image mode
2. Check if image uploaded successfully (preview thumbnail shows)
3. Adjust overlay opacity slider (try reducing it to 0% temporarily)
4. Verify blur isn't too high (reset to 0px if needed)
5. Try a different image format (JPG works best)

#### Layout Guides Not Visible
1. Ensure you've clicked a layout button (Circle, Grid, etc.)
2. Check that you have at least 1 card on canvas
3. Layout guides persist - reload the page to restore saved layouts
4. Click guide → customize color to contrast background
5. Increase stroke width slider (try 8-10px for better visibility)

#### Opacity/Blur Affecting My Cards
This shouldn't happen! If it does:
1. Check z-index is correct (overlay should be below cards)
2. Refresh the page to reset layering
3. Report as a bug - this violates the layering system

---

## 🗺️ Roadmap

### Recently Added ✅
- [x] 📝 **Editable Presentation Name** - Rename directly in toolbar (v2.4)
- [x] 🖥️ **Fullscreen Presentation Mode** - Clean view with centered title (v2.4)
- [x] 💾 **Enhanced Save System** - All settings now exported (v2.4)
- [x] 📁 **Smart File Naming** - `showcase-name-YYYY-MM-DD-hh-mm-ss` format (v2.4)
- [x] 🎬 **Configurable Animation Speeds** - Card & group settings (v2.4)
- [x] 📑 **Groups & Organization** - Create Parts, Chapters, Sections
- [x] 🗂️ **Thumbnail & Expanded Views** - Toggle between compact and full-size cards
- [x] 🔄 **Auto-arrange on Expand** - Cards layout in grid when group expands
- [x] ◀️▶️ **Fullscreen Navigation** - Browse cards in same group with arrows
- [x] ⌨️ **Keyboard Navigation** - Arrow keys in fullscreen view
- [x] 💾 **Auto-Save Toggle** - Enable/disable in Save menu
- [x] ✍️ **Text fields with full typography control**
- [x] 🎨 **20 color presets + custom color picker**
- [x] 📝 **Click-to-edit text properties**
- [x] 🔤 **10+ font families with live preview**
- [x] 🎨 Background opacity control (0-100%)
- [x] 🌫️ Background blur effect (0-20px)
- [x] 🗺️ Pirate treasure map markers (● start, ✕ end)
- [x] 💾 Layout guide persistence
- [x] 🎯 Smart z-index layering system
- [x] 📱 Responsive design (smartphone to desktop)

### Coming Soon
- [ ] 🔄 Undo/Redo functionality
- [ ] 🎨 Text background/border options
- [ ] ✏️ Drawing tools & annotations
- [ ] 🎭 Presentation mode with transitions
- [ ] ⌨️ Full keyboard shortcut support
- [ ] 📱 Touch gesture support (pinch, swipe)

### Future Ideas
- [ ] 👥 Real-time collaboration
- [ ] ☁️ Cloud storage integration
- [ ] 📄 Export to PDF/PowerPoint
- [ ] 🎨 Templates library
- [ ] 🔗 Shareable presentation links
- [ ] 🌙 Dark mode UI

**Want to contribute?** Check out our [issues](https://github.com/yourusername/showcase/issues) or suggest features!

---

## 🎓 Learning Resources

### New to React?
- [React Official Docs](https://react.dev) - Best place to start
- [Vite Guide](https://vitejs.dev/guide/) - Understand the build tool

### Want to Extend Showcase?
1. **Add a new layout algorithm** → Edit `src/store/useStore.js`
2. **Create custom card types** → See `src/components/Card.jsx`
3. **Add keyboard shortcuts** → Check `src/components/Playfield.jsx`

---

## 📄 License

MIT License - **Free to use and modify!**

### What This Means:
✅ Use for personal projects
✅ Use for commercial products
✅ Modify and redistribute
✅ No attribution required (but appreciated!)

---

## 🙏 Credits & Acknowledgments

### Built With Love By
- **Author**: Yassine Boumiza
- **Original Concept**: Showcase v1.0 (Vanilla JavaScript)
- **v2.0 Rebuild**: React 19 + Modern Stack
- **Icons**: Unicode emoji (no dependencies!)

### Powered By Open Source
- React Team - For the amazing framework
- Vercel - For Vite
- pmndrs - For Zustand
- Framer - For Framer Motion
- Clauderic - For @dnd-kit

### Special Thanks
- You, for using Showcase! 🎉
- Contributors who report bugs and suggest features
- The open-source community

---

## 🤝 Contributing

We welcome contributions! Here's how:

### Quick Contribution Guide
1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** changes (`git commit -m 'Add amazing feature'`)
4. **Push** to branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Contribution Ideas
- 🐛 Bug fixes
- ✨ New features
- 📚 Documentation improvements
- 🎨 UI/UX enhancements
- 🧪 Test coverage
- ♿ Accessibility improvements

---

## 💬 Support & Community

### Get Help
- 📖 **Documentation**: You're reading it!
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/yourusername/showcase/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/yourusername/showcase/discussions)

### Stay Updated
- ⭐ Star the repo to get notified of updates
- 👀 Watch for new releases
- 🍴 Fork to create your own version

---

## 🎉 Ready to Create?

```bash
npm run dev
```

**Open http://localhost:3003 and start building something amazing!**

---

<div align="center">

### Made with ❤️ and React

**Created by Yassine Boumiza**

**[⬆ Back to Top](#-showcase---modern-interactive-presentation-builder)**

</div>
