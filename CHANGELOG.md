# Changelog

## [2.3.1] - 2025-12-04

### 🎯 Group Enhancements

- **Expanded Group Card Layout** - When expanding a group, cards now auto-arrange in a neat grid
  - Cards resize to fit inside group bounds (max 250px width)
  - Proper spacing and padding between cards
  - Cards maintain aspect ratio
  - Works on both toggle expand and page load

- **Expanded Groups Z-Index** - Fixed expanded groups appearing behind collapsed ones
  - Expanded groups now render above collapsed groups
  - Cards inside expanded groups layer correctly (z-index 200+)
  - Text fields layer above cards (z-index 300+)

- **Group Navigation in Fullscreen** - Navigate between cards in the same group
  - Left/right arrow buttons appear on screen edges
  - Keyboard navigation: ← → arrows to navigate, ESC to close
  - Group name and card counter displayed (e.g., "Part 1: Intro • 2 / 5")
  - Arrows hidden when at first/last card
  - Glass-effect buttons with purple hover gradient

### ✨ Auto-Save Improvements

- **Silent Auto-Save** - Auto-saves no longer cause UI flickering during drag
  - Saving indicator only shows for manual saves
  - Drag operations remain smooth at 60fps

- **Auto-Save Toggle** - Added ON/OFF switch in Save menu
  - Toggle auto-save without reloading
  - Visual toggle switch with status indicator
  - Setting persists across sessions

### 🐛 Bug Fixes

- **Drag Distance Limit** - Fixed groups/cards resetting after dragging too far
  - Switched from PointerSensor to MouseSensor for reliable long-distance dragging
  - Added TouchSensor for mobile support
  - Disabled autoScroll to prevent position jumps

- **Drag Cursor Tracking** - Fixed mouse pointer drifting away from element during drag
  - Proper zoom compensation for scaled canvas
  - Cursor now stays aligned with dragged element
  - Applies to cards, groups, and text fields

- **Expanded Group Load** - Cards now arrange correctly when loading saved expanded groups
  - Previously, cards would overlap if group was saved in expanded state
  - Now auto-rearranges on load to fit inside group bounds

---

## [2.1.1] - 2024-11-12

### 🎯 UX Improvements

- **Enhanced Text Editing Flow** - Improved text field interaction to match industry standards
  - Single-click now edits text content directly (type immediately, no extra steps)
  - Double-click opens properties menu for font, size, and color changes
  - Follows PowerPoint/Google Slides UX pattern for familiarity
  - No more need to delete and re-create text to edit content

### 🐛 Bug Fixes

- **Fixed Snake Layout Guide** - Updated wave frequency from 0.01 to 0.5
  - Snake guide now displays proper wavy S-curve pattern instead of straight line
  - Completes one full wave every 2 cards for clear visual pattern
  - Guide path perfectly matches actual card positions

### 📚 Documentation

- Updated all documentation files to reflect new text editing behavior
  - [README.md](README.md) - Updated text editing instructions
  - [QUICKSTART.md](QUICKSTART.md) - Updated quick start guide
  - [CLAUDE.md](CLAUDE.md) - Updated component patterns section
  - [PLAN.md](PLAN.md) - Updated completed features list

---

## [2.0.0] - 2024-11-10

### 🎉 Major Rewrite

Complete rebuild from vanilla JavaScript to modern React architecture.

### ✅ Fixed

- **Critical:** localStorage quota exceeded errors (replaced with IndexedDB)
- **Critical:** Laggy UI with 10+ cards (now smooth with 50+ cards)
- **Critical:** No save feedback (added real-time indicators)
- **Bug:** Save called on every mousemove (now debounced to 1s)
- **Bug:** Jumpy animations (now 60 FPS with Framer Motion)
- **Bug:** Unpredictable state management (centralized with Zustand)
- **Bug:** Blocking save operations (now async/non-blocking)

### ✨ Added

- **Feature:** Auto-save with debouncing (saves 1 second after last change)
- **Feature:** Real-time save status indicators
  - "💾 Saving..." during save
  - "✓ Saved at HH:MM:SS" after save
  - "⚠️ Storage Issue" on error
- **Feature:** Zoom level display (shows 50%-300%)
- **Feature:** Automatic data migration from localStorage to IndexedDB
- **Feature:** Hardware-accelerated drag & drop (@dnd-kit)
- **Feature:** Smooth spring-based animations (Framer Motion)
- **Feature:** Storage usage monitoring via console
- **Feature:** Better error messages and user feedback

### 🚀 Performance

- **5x faster** drag & drop operations
- **60 FPS** animations (was 20-30 FPS)
- **Non-blocking** save operations
- **Throttled** mouse events (16ms = 60fps)
- **Debounced** storage writes (1000ms delay)
- **Virtual DOM** prevents unnecessary reflows
- **Hardware acceleration** for transforms

### 🏗️ Architecture

- **React 19** - Modern UI framework
- **Vite** - Lightning-fast build tool
- **Zustand** - Lightweight state management (2.9KB)
- **Framer Motion** - Animation library
- **@dnd-kit** - Drag & drop system
- **IndexedDB (idb)** - Reliable browser storage
- **JSZip** - ZIP file handling
- **Lodash** - Utility functions

### 📦 Dependencies

```json
{
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "zustand": "^5.0.8",
  "framer-motion": "^12.23.24",
  "@dnd-kit/core": "^6.3.1",
  "@dnd-kit/utilities": "^3.2.2",
  "idb": "^8.0.3",
  "jszip": "^3.10.1",
  "lodash.debounce": "^4.0.8",
  "lodash.throttle": "^4.1.1",
  "file-saver": "^2.0.5"
}
```

### 🗂️ File Structure

```
src/
├── components/
│   ├── Card.jsx                 # Individual card with drag/resize
│   ├── Playfield.jsx            # Main canvas area
│   ├── Toolbar.jsx              # Top toolbar
│   ├── VerticalToolbar.jsx      # Left zoom controls
│   ├── OrientationModal.jsx     # Orientation selector
│   └── MaximizedView.jsx        # Fullscreen view
├── store/
│   └── useStore.js              # Zustand state management
├── utils/
│   ├── storage.js               # IndexedDB operations
│   └── export.js                # Import/export logic
├── App.jsx                      # Main app component
├── App.css                      # Global styles
└── main.jsx                     # Entry point
```

### 📝 Breaking Changes

1. **No direct HTML opening** - Must run dev server with `npm run dev`
2. **Build step required** - Production requires `npm run build`
3. **Node.js & npm required** - Dependencies must be installed
4. **Different deployment** - Upload `dist/` folder, not root files

### 🔄 Migration

Old localStorage data automatically migrates to IndexedDB on first load. No manual action required.

Backup files preserved:
- `index.html.old`
- `app.js.old`
- `styles.css.old`

### 📊 Performance Comparison

| Metric | v1.0 | v2.0 | Improvement |
|--------|------|------|-------------|
| Initial Load | 50ms | 200ms | Acceptable tradeoff |
| Drag 10 Cards | Laggy | Smooth | 5x faster |
| Drag 50 Cards | Unusable | Smooth | ∞ better |
| Save Time | Blocking | Non-blocking | Instant |
| Animation FPS | 20-30 | 60 | 2-3x smoother |
| Storage Limit | 5-10 MB | Unlimited* | ∞ better |

*Subject to browser quota (typically several GB)

### 📚 Documentation

- `README-NEW.md` - Full documentation
- `MIGRATION-GUIDE.md` - Upgrade guide
- `QUICKSTART.md` - 30-second start guide
- `CHANGELOG.md` - This file

### 🎯 Roadmap

See README-NEW.md for planned features.

---

## [1.0.0] - Previous

### Initial Release

Vanilla JavaScript implementation with:
- Drag & drop cards
- Image & video support
- Background customization
- Layout algorithms
- JSON/ZIP export
- localStorage persistence

---

**For detailed upgrade instructions, see [MIGRATION-GUIDE.md](./MIGRATION-GUIDE.md)**
