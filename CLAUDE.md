# Claude Code - AI Development Team Configuration

> **AI-powered development team for Showcase presentation builder**

## 🤖 AI Team Configuration

This project is optimized for development with **Claude Code** and AI assistants. The tech stack and architecture are designed for AI-assisted development.

### Active AI Agents

- **Frontend Expert** - React 19, Framer Motion, @dnd-kit
- **State Management** - Zustand patterns and optimization
- **UI/UX Designer** - Component design and user experience
- **Performance Optimizer** - 60fps animations, bundle optimization

### Tech Stack

```javascript
{
  "framework": "React 19",
  "bundler": "Vite",
  "stateManagement": "Zustand",
  "animations": "Framer Motion",
  "dragAndDrop": "@dnd-kit/core",
  "storage": "IndexedDB (idb)",
  "utilities": "Lodash (debounce/throttle)"
}
```

## 📁 Project Structure

```
showcase/
├── src/
│   ├── components/          # React UI Components
│   │   ├── Card.jsx          # Draggable media cards
│   │   ├── TextField.jsx     # Text elements with typography
│   │   ├── Playfield.jsx     # Main infinite canvas
│   │   ├── Toolbar.jsx       # Top navigation bar
│   │   ├── ExpressionMenu.jsx # Text styling panel
│   │   ├── VerticalToolbar.jsx # Zoom/pan controls
│   │   ├── Minimap.jsx       # Navigation overview
│   │   ├── LayoutGuides.jsx  # Visual layout helpers
│   │   ├── BackgroundMenu.jsx # Background settings
│   │   └── ...
│   │
│   ├── store/
│   │   └── useStore.js       # Zustand global state
│   │
│   ├── utils/
│   │   ├── storage.js        # IndexedDB operations
│   │   └── export.js         # Import/export utilities
│   │
│   ├── App.jsx               # Root component
│   ├── App.css               # Global styles
│   └── main.jsx              # Entry point
│
├── PLAN.md                   # Roadmap & feature planning
├── CHANGELOG.md              # Version history
├── QUICKSTART.md             # User getting started guide
└── README.md                 # Project overview
```

## 🎯 Current Architecture

### State Management (Zustand)

**Global State Tree:**
```javascript
{
  // Content
  cards: [],              // Media cards (images/videos)
  textFields: [],         // Text elements

  // UI State
  background: {},         // Color/gradient/image with effects
  zoomLevel: 1,          // Canvas zoom (0.5-3)
  panX: 0, panY: 0,      // Canvas pan position
  interactionMode: 'cursor', // 'cursor' | 'hand'

  // Layout
  activeLayout: null,     // 'circle' | 'grid' | 'line' | etc.
  layoutSettings: {},     // Guide colors & styles

  // Editing
  editingTextField: null, // Currently editing text
  maximizedCard: null,    // Fullscreen card view

  // Storage
  isSaving: false,
  lastSaved: null,
  storageError: null
}
```

### Component Patterns

**Card Component** (Media)
- Draggable via @dnd-kit
- Resizable via corner handle
- Click to maximize
- Hover to show delete button
- Real-time position calculation during drag
- Zoom-compensated positioning

**TextField Component** (Text)
- Single-click → Edit text content directly (cursor appears, type immediately)
- Double-click → Edit properties (font, size, color)
- Draggable with smooth snappy feel
- 20 color presets + custom picker
- 10+ font families with live preview
- 16 size presets (12px-128px)

**Layout System**
- 5 auto-layout algorithms: Circle, Grid, Line, Curve, Snake
- Visual guides with customizable colors/stroke
- Pirate map markers (● start, ✕ end)
- Click guide to customize
- Persistent settings across sessions

## 🔧 Development Guidelines

### Adding New Features

1. **State First** - Add to `useStore.js` with actions
2. **Component** - Create in `src/components/`
3. **Integration** - Wire up in `Playfield.jsx` or `Toolbar.jsx`
4. **Persistence** - Update `saveToStorage()` and `loadFromStorage()`
5. **UI/UX** - Follow existing motion patterns (Framer Motion)

### Performance Rules

✅ **DO:**
- Use `React.memo` for expensive components
- Debounce save operations (current: 1s)
- Use CSS transforms for animations (GPU-accelerated)
- Leverage Zustand selectors to prevent re-renders
- Keep z-index layering consistent

❌ **AVOID:**
- Inline function definitions in render
- Large images without compression
- Synchronous storage operations
- Direct DOM manipulation (use refs sparingly)

### Coding Conventions

**Component Structure:**
```javascript
// 1. Imports
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import useStore from '../store/useStore';

// 2. Component
const MyComponent = ({ prop1, prop2 }) => {
  // 3. Store selectors (specific, not entire state)
  const specificValue = useStore(state => state.specificValue);
  const updateValue = useStore(state => state.updateValue);

  // 4. Local state
  const [localState, setLocalState] = useState(null);
  const ref = useRef(null);

  // 5. Effects
  useEffect(() => {
    // side effects
  }, [dependencies]);

  // 6. Handlers
  const handleClick = () => {
    // event handling
  };

  // 7. Render
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* JSX */}
    </motion.div>
  );
};

export default MyComponent;
```

**State Management:**
```javascript
// Good - Specific selector
const cards = useStore(state => state.cards);

// Bad - Entire state (causes unnecessary re-renders)
const state = useStore();
```

**Event Handlers:**
```javascript
// Good - Debounced save
const saveToStorage = useStore(state => state.saveToStorage);

// Bad - Direct save on every change
onChange={(e) => {
  updateValue(e.target.value);
  saveNow(); // Too frequent!
}}
```

## 🎨 Design System

### Color Palette

```css
/* Primary */
--primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
--primary: #667eea;
--primary-dark: #764ba2;

/* Background */
--bg-dark: #1a1a1a;
--bg-medium: #2a2a2a;
--bg-light: #3a3a3a;

/* Text */
--text-primary: #e0e0e0;
--text-secondary: #aaa;
--text-muted: #888;

/* Accents */
--success: #27ae60;
--error: #e74c3c;
--warning: #f39c12;
```

### Animation Patterns

```javascript
// Entrance
initial={{ opacity: 0, scale: 0.8 }}
animate={{ opacity: 1, scale: 1 }}
transition={{ duration: 0.2 }}

// Hover (buttons)
whileHover={{ scale: 1.05 }}
whileTap={{ scale: 0.95 }}

// Drag
transition: isDragging ? 'none' : 'left 0.2s, top 0.2s'
```

## 🚀 Quick Development Tasks

### Add a New Layout Algorithm

1. Edit `src/store/useStore.js`:
```javascript
arrangeInMyLayout: () => set((state) => {
  const updatedCards = state.cards.map((card, index) => ({
    ...card,
    position: calculatePosition(index) // Your logic
  }));
  return { cards: updatedCards, activeLayout: 'myLayout' };
})
```

2. Add button in `Toolbar.jsx` Elements menu

3. Add guide rendering in `LayoutGuides.jsx`

### Add a New Text Style

1. Update `ExpressionMenu.jsx` - Add option to UI
2. Store value in state when user changes it
3. Apply in `TextField.jsx` textStyle object

### Add New Media Type

1. Update `Card.jsx` - Add rendering logic
2. Update `OrientationModal.jsx` - Add orientation option if needed
3. Update export/import in `utils/export.js`

## 🐛 Common Issues & Solutions

### Issue: Changes Not Saving
**Solution:** Check `saveToStorage()` is called after state update. It's debounced 1s.

### Issue: Drag Performance Laggy
**Solution:**
- Check if too many re-renders (React DevTools Profiler)
- Ensure transform calculations use zoom compensation
- Verify `transition: 'none'` during drag

### Issue: Z-Index Conflicts
**Solution:** Follow layering system:
```
0: Background
1: Overlay (opacity/blur)
2: Layout guides
3: Cards (index + 1)
4: Text fields (cards.length + index + 1)
1000: Dragging element
```

### Issue: IndexedDB Quota Exceeded
**Solution:**
- Export as ZIP (videos external)
- Clear old presentations
- Compress images before upload

## 📝 Contributing

### Before Submitting PR

- [ ] Run `npm run dev` - No console errors
- [ ] Test drag & drop - Smooth, no lag
- [ ] Test save/load - Data persists
- [ ] Test responsive - Mobile to desktop
- [ ] Update CHANGELOG.md
- [ ] Update PLAN.md if adding planned feature

### Code Review Checklist

- [ ] Component uses proper Zustand selectors
- [ ] Animations use Framer Motion (not CSS transitions)
- [ ] State changes trigger save (debounced)
- [ ] No prop drilling (use store instead)
- [ ] Drag/drop uses @dnd-kit patterns
- [ ] Styling follows design system

## 🔗 Related Documentation

- **User Guide:** [QUICKSTART.md](./QUICKSTART.md) - For end users
- **Feature Planning:** [PLAN.md](./PLAN.md) - Roadmap and upcoming features
- **Changes:** [CHANGELOG.md](./CHANGELOG.md) - Version history
- **Overview:** [README.md](./README.md) - Project introduction

---

**Built with ❤️ by Yassine Boumiza**
**Optimized for AI-assisted development with Claude Code**
