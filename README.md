# Showcase - Flexible Presentation App

A modern, interactive presentation web application built with React 19, TypeScript, and Tailwind CSS. Create dynamic presentations with images and videos that you can arrange freely in a customizable playfield with smooth animations and desktop-like interactions.

## 🚀 Modern Tech Stack

- **React 19.1.0** - Latest React with improved performance
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Modern utility-first styling
- **Framer Motion** - Smooth animations and transitions
- **Zustand** - Lightweight state management
- **Vite** - Lightning-fast dev server and builds

## ✨ Features

### 🎴 Interactive Card System
- **Landscape & Portrait Modes** - Choose orientation for each media card
- **Drag & Drop** - Smooth dragging with real-time position updates
- **Resize** - Drag the resize handle to adjust card size
- **Click to Maximize** - Click any card to view in full-screen mode
- **Scroll Zoom** - Use mouse wheel to zoom in/out when viewing media
- **Smooth Animations** - Beautiful entrance and exit animations

### 🎬 Media Support
- **Images** - Upload and display JPG, PNG, GIF, and other formats
- **Videos** - Upload video files with automatic thumbnail
  - Shows video preview on cards
  - Play button overlay
  - Full video controls when maximized
  - Auto-play on maximize

### 🎨 Customizable Playfield
- **Background Color** - Choose any solid color
- **Background Image** - Upload custom background images
- **Clear Background** - Reset to default
- **Pan Navigation** - Click and drag to navigate the canvas

### 📐 Smart Layouts
Automatically arrange cards in various patterns:
- **⭕ Circle** - Circular arrangement
- **〰️ Curve** - Curved line (perfect for storylines)
- **▦ Grid** - Organized grid layout
- **━ Line** - Horizontal line arrangement

### 💾 Save & Load
- **Save Presentation** - Export as JSON with embedded media (base64)
- **Load Presentation** - Import previously saved presentations
- Full state preservation (positions, sizes, orientations, background)

## 🏃 Quick Start

### Development

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Production

```bash
# Build the app
npm run build

# The dist/ folder contains the production-ready files
# Deploy the contents to any static hosting service
```

## 📖 How to Use

### Adding Media
1. Click **"📎 Add Media"** button
2. Select images or videos
3. Choose **Landscape** or **Portrait** orientation
4. Cards appear on the playfield

### Working with Cards
- **Move** - Click and drag any card
- **Resize** - Drag the corner handle (appears on hover)
- **Maximize** - Click a card to view full-screen
- **Delete** - Click the ✕ button (appears on hover)
- **Zoom** - While maximized, scroll to zoom in/out

### Arranging Cards
Click the layout buttons to automatically arrange:
- ⭕ **Circle** - Circular arrangement
- 〰️ **Curve** - Smooth curved line
- ▦ **Grid** - Organized grid
- ━ **Line** - Horizontal line

### Customizing Background
- 🎨 **Color** - Click palette icon to pick a color
- 🖼️ **Image** - Click image icon to upload background
- 🗑️ **Clear** - Remove background customization

### Saving Your Work
1. Click **💾 Save** to download JSON file
2. Click **📂 Load** to restore a saved presentation

## 🏗️ Project Structure

```
showcase/
├── src/
│   ├── components/          # React components
│   │   ├── Card.tsx         # Draggable/resizable card
│   │   ├── Playfield.tsx    # Main canvas
│   │   ├── Toolbar.tsx      # Top toolbar
│   │   ├── OrientationModal.tsx
│   │   └── MaximizedView.tsx
│   ├── store/
│   │   └── useStore.ts      # Zustand state management
│   ├── types/
│   │   └── index.ts         # TypeScript types
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Entry point
│   └── index.css            # Tailwind styles
├── index.html               # HTML template
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
├── tailwind.config.js       # Tailwind config
└── vite.config.ts           # Vite config
```

## 🎯 Key Features Explained

### State Management
Uses **Zustand** for lightweight, performant state management:
- Card positions, sizes, and media
- Background settings
- Selection and maximization state
- Layout algorithms

### Animations
**Framer Motion** provides smooth animations:
- Card entrance/exit animations
- Modal transitions
- Smooth drag interactions
- Scale transformations

### TypeScript
Full type safety with interfaces for:
- Card data
- Background settings
- Presentation data
- Layout types

### Responsive Design
- Tailwind CSS utility classes
- Modern dark theme
- Smooth hover effects
- Desktop-optimized interactions

## 🎨 Customization

### Tailwind Theme
Edit `tailwind.config.js` to customize colors, spacing, etc.

### Card Styles
Modify `src/components/Card.tsx` for card appearance and behavior.

### Layout Algorithms
Update `src/store/useStore.ts` `arrangeCards` function for new layouts.

## 🔧 Technical Details

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires ES2020+ support
- Recommended: Latest browser versions

### Performance
- React 19 optimizations
- Zustand for minimal re-renders
- Framer Motion hardware acceleration
- Vite for optimized production builds

### File Formats
- **Images**: JPG, PNG, GIF, WebP, SVG
- **Videos**: MP4, WebM, MOV, and more
- **Save Format**: JSON with base64-encoded media

## 🚀 Deployment

Build and deploy to any static hosting:

```bash
npm run build
```

Deploy `dist/` folder to:
- Vercel
- Netlify
- GitHub Pages
- Cloudflare Pages
- AWS S3 + CloudFront
- Any static host

## 📝 License

Free to use and modify for personal and commercial projects.

---

**Built with React 19, TypeScript, Tailwind CSS, and ❤️**
