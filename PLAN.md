# 🗺️ Showcase Development Roadmap

> **Feature planning and development phases for visual presentation builder**

## 🎯 Vision

Transform Showcase into the ultimate **visual storytelling platform** - not slides, not documents, but pure creative freedom on an infinite canvas. Focus on visual elements, professional design tools, and seamless presentation delivery.

---

## ✅ Completed (v2.4.0 - Current)

### Core Foundation
- [x] **React 19 Migration** - Complete rebuild from vanilla JS
- [x] **Infinite Canvas** - Zoom, pan, drag & drop
- [x] **Media Cards** - Images & videos with resize
- [x] **IndexedDB Storage** - Unlimited capacity, auto-save
- [x] **5 Layout Algorithms** - Circle, Grid, Line, Curve, Snake

### Visual Enhancements
- [x] **Background System** - Color, gradient, custom images
- [x] **Opacity Control** - 0-100% overlay for backgrounds
- [x] **Blur Effects** - 0-20px background blur
- [x] **Layout Guides** - Visual helpers with customization
- [x] **Pirate Map Markers** - Start (●) and end (✕) indicators
- [x] **Smart Z-Index** - Layering system for visual clarity

### Text & Typography (v2.1)
- [x] **Text Fields** - Full typography control
- [x] **10+ Font Families** - With live preview
- [x] **16 Size Presets** - 12px to 128px
- [x] **20 Color Presets** - Quick-pick palette
- [x] **Inline Editing** - Single-click to edit text content
- [x] **Properties Menu** - Double-click for font/size/color changes

### UX Improvements
- [x] **Minimap** - Canvas overview with navigation
- [x] **Dual Modes** - Cursor (edit) & Hand (pan)
- [x] **Export Options** - JSON (embedded) & ZIP (hybrid)
- [x] **Responsive Design** - Mobile to desktop support
- [x] **Persistent Settings** - Layouts & guides survive reload

### Presentation & Save (v2.4)
- [x] **Editable Presentation Name** - Rename directly in toolbar
- [x] **Fullscreen Mode** - Clean presentation view with centered title
- [x] **Enhanced Save System** - File format v2.1 with all settings
- [x] **Smart File Naming** - `showcase-name-YYYY-MM-DD-hh-mm-ss` format
- [x] **Animation Speed Controls** - Configurable for cards and groups
- [x] **Complete Settings Export** - Zoom, pan, animations, all preferences

---

## 🗂️ Groups & Organization Feature (v2.3)

> **Goal:** Organize cards into logical groups (Parts, Chapters, Sections) for structured presentations

### ✅ Implemented Features

#### Group System
- **Dynamic Groups** - Create unlimited groups with custom names (Parts, Chapters, Sections, etc.)
- **Visual Containers** - Draggable, resizable containers on the canvas
- **Card Assignment** - Drag cards into groups or assign via right-click
- **Group Colors** - 8 preset colors + custom color picker
- **Collapsible** - Collapse groups to save canvas space

#### Group Visual Settings
- **Card Indicators** - 5 styles:
  - `● Dot` - Small colored circle in corner
  - `▢ Border` - Colored border around card
  - `▔ Banner` - Colored bar at top
  - `◧ Tint` - Color overlay on card
  - `○ None` - No visual indicator
- **Container Boundary** - Solid/dashed/dotted border styles
- **Background Opacity** - 0-30% group background color
- **Show/Hide Header** - Toggle group name bar

#### Inner Layout Options
- **Free** - Cards positioned freely within group
- **Grid** - Auto-arrange cards in grid
- **Line** - Auto-arrange cards in horizontal line
- **Circle** - Auto-arrange cards in circular pattern

#### Groups Panel (Sidebar)
- Toggle sidebar with 📑 button
- Create new groups with "+ Add" button
- Drag to reorder groups
- Click to pan to group on canvas
- Card count per group
- Ungrouped cards indicator

### Technical Implementation

**New Files:**
- `src/components/GroupContainer.jsx` - Draggable container component
- `src/components/GroupsPanel.jsx` - Sidebar management panel
- `src/components/GroupSettingsModal.jsx` - Visual settings configuration

**Store Additions (`useStore.js`):**
```javascript
// State
groups: [],
currentGroupId: 0,
selectedGroupId: null,
groupsPanelOpen: false,
editingGroupId: null,
groupSettingsModalOpen: false,
groupColors: ['#3498db', '#9b59b6', '#27ae60', ...],

// Actions
addGroup, updateGroup, deleteGroup, reorderGroups,
setSelectedGroupId, assignCardToGroup, removeCardFromGroup,
getCardsInGroup, getUngroupedCards, arrangeCardsInGroup,
autoResizeGroup, panToGroup
```

**Card Integration:**
- Added `groupId` property to cards
- Group indicator rendering based on settings
- Drag-to-group assignment

**Persistence:**
- Groups saved to IndexedDB
- Includes all style settings and layout preferences

### Use Cases
- **Presentations** - Part 1: Introduction, Part 2: Analysis, Part 3: Conclusion
- **Portfolios** - Chapter 1: Web Design, Chapter 2: Mobile Apps
- **Documentation** - Section by topic or category
- **Storyboards** - Scene grouping for visual narratives

---

## 🎬 Fullscreen Card Navigation (v2.3.1)

> **Goal:** Seamlessly browse through cards in a group during fullscreen view

### ✅ Implemented Features

#### Navigation Controls
- **Arrow Buttons** - Left (‹) and right (›) buttons on screen edges
- **Keyboard Support** - ← → arrow keys to navigate, ESC to close
- **Smart Visibility** - Left arrow hidden on first card, right hidden on last
- **Glass-effect Design** - Frosted glass buttons with purple gradient on hover

#### Visual Feedback
- **Group Name Display** - Shows current group name
- **Card Counter** - Shows position (e.g., "2 / 5")
- **Smooth Transitions** - Animated button entrance with Framer Motion
- **Zoom Hint** - Updated to show navigation tip when applicable

#### Auto-Arrange on Expand
- **Grid Layout** - Cards auto-arrange in grid when group expands
- **Responsive Sizing** - Cards resize to fit group (max 250px width)
- **Load Support** - Already-expanded groups rearrange on page load
- **Aspect Ratio** - Cards maintain 3:2 ratio

### Technical Implementation

**Modified Files:**
- `src/components/MaximizedView.jsx` - Navigation arrows and keyboard handling
- `src/store/useStore.js` - toggleGroupExpanded with card arrangement, loadFromStorage fix

**Key Code:**
```javascript
// Navigation handlers with useCallback for performance
const goToPrev = useCallback(() => {
  if (hasPrev) {
    setMaximizedCard(groupCards[currentIndex - 1].id);
    setScale(1);
  }
}, [hasPrev, groupCards, currentIndex]);

// Keyboard navigation in useEffect
const handleKeyDown = (e) => {
  if (e.key === 'ArrowLeft') goToPrev();
  else if (e.key === 'ArrowRight') goToNext();
  else if (e.key === 'Escape') handleClose();
};
```

---

## 🔧 Bug Fixes & Performance (v2.3.1)

### Auto-Save Flickering Fix
- **Issue:** Dragging caused UI flickering due to auto-save updating `isSaving` state
- **Fix:** Made auto-saves "silent" - only manual saves show indicator
- **Added:** Auto-Save ON/OFF toggle in Save menu

### Drag Distance Limit Fix
- **Issue:** Groups/cards reset position after dragging beyond a certain distance
- **Fix:** Changed from PointerSensor to MouseSensor + TouchSensor
- **Added:** `autoScroll={false}` on DndContext

### Drag Cursor Tracking Fix
- **Issue:** Mouse pointer drifted away from element during drag
- **Fix:** Proper zoom compensation: `dragOffset = transform / zoomLevel`

### Expanded Groups Z-Index Fix
- **Issue:** Expanded groups appeared behind collapsed groups
- **Fix:** Tiered z-index system:
  - Collapsed groups: 1-99
  - Expanded groups: 100+
  - Cards: 200+
  - Text fields: 300+
  - Dragging element: 1000

---

## 🚀 Phase 1: Visual Elements (Weeks 1-4)

> **Goal:** Rich visual toolset for design and composition

### 1.1 Shape Tools (Week 1) 🔶
**Priority:** HIGH | **Complexity:** MEDIUM

**Features:**
- Circle, Rectangle, Triangle, Star, Arrow shapes
- Fill color with opacity slider
- Stroke color, width, style (solid/dashed)
- Drag, resize, rotate like cards
- Click to edit properties panel

**Technical:**
- New `Shape.jsx` component
- Add `shapes: []` to Zustand store
- Use SVG for crisp scaling
- Reuse drag/drop patterns from cards

**Use Cases:**
- Highlight areas in screenshots
- Create diagrams and flowcharts
- Visual emphasis and decoration

---

### 1.2 Advanced Text Styling (Week 2) ✍️
**Priority:** HIGH | **Complexity:** MEDIUM

**Features:**
- **Text Shadow** - Offset X/Y, blur, color
- **Text Stroke** - Width and color
- **Background Box** - Padding, rounded corners, opacity
- **Rotation** - Any angle (0-360°)
- **Letter Spacing** - Tighten or expand
- **Line Height** - Multi-line text control

**Technical:**
- Extend `TextField.jsx` with new style properties
- Update `ExpressionMenu.jsx` with advanced controls
- Use CSS `text-shadow`, `text-stroke`, transforms
- Add rotation handle (like resize corner)

**Use Cases:**
- Headings with dramatic shadows
- Text on busy backgrounds (needs box/stroke)
- Angled text for creative layouts

---

### 1.3 Lines & Connectors (Week 3) 📏
**Priority:** MEDIUM | **Complexity:** HIGH

**Features:**
- Straight lines with endpoints
- Curved bezier lines (drag control points)
- Arrows (single/double ended)
- Line styles: solid, dashed, dotted
- Thickness and color control
- Snap to element centers/edges

**Technical:**
- New `Line.jsx` component
- Use SVG `<path>` for curves
- Implement control point dragging
- Add snapping logic (detect nearby elements)

**Use Cases:**
- Flowcharts and diagrams
- Connect related images
- Timeline connections

---

### 1.4 Icon Library (Week 4) 🎨
**Priority:** MEDIUM | **Complexity:** MEDIUM

**Features:**
- 100+ built-in icons (business, tech, arrows, social)
- Searchable icon picker
- Adjustable size and color
- Drag from picker to canvas
- Category filtering

**Technical:**
- Use heroicons or lucide-react (MIT licensed)
- New `Icon.jsx` component
- Modal picker with search
- Store as `icons: []` array in state

**Use Cases:**
- Infographics with visual symbols
- Navigation and UI mockups
- Professional presentations

---

## 🎬 Phase 2: Enhanced Media (Weeks 5-8)

> **Goal:** Professional-grade media handling and effects

### 2.1 Image Filters & Effects (Week 5) 🌈
**Priority:** MEDIUM | **Complexity:** MEDIUM

**Features:**
- **Brightness** - Lighten/darken slider
- **Contrast** - Enhance or reduce
- **Saturation** - Color intensity
- **Blur** - Artistic blur (separate from background)
- **Grayscale** - Black and white toggle
- **Sepia** - Vintage photo effect

**Technical:**
- Use CSS `filter` property
- Add `filters: {}` to card state
- Slider controls in card properties
- Real-time preview

**Use Cases:**
- Vintage photo collections
- Highlight one image (desaturate others)
- Artistic effects

---

### 2.2 Image Masks & Frames (Week 6) 🖼️
**Priority:** MEDIUM | **Complexity:** MEDIUM

**Features:**
- **Circle Mask** - Crop to circle
- **Rounded Corners** - Custom radius
- **Frame Presets** - Polaroid, film strip, device mockups
- **Border Styles** - Width, color, shadow
- **Drop Shadows** - Professional card shadows

**Technical:**
- Use CSS `clip-path` for masks
- SVG borders for complex frames
- Pre-designed frame templates

**Use Cases:**
- Portfolio presentations
- Product mockups (phone/laptop screens)
- Profile pictures

---

### 2.3 Video Controls Enhancement (Week 7) 🎥
**Priority:** LOW | **Complexity:** MEDIUM

**Features:**
- **Trim** - Set start/end points
- **Mute Toggle** - Audio on/off
- **Autoplay** - On view option
- **Loop** - Repeat continuously
- **Playback Speed** - 0.5x to 2x

**Technical:**
- Use HTML5 video API
- Add timeline scrubber UI
- Store trim points in state
- Update `Card.jsx` video rendering

**Use Cases:**
- Demo videos with specific sections
- Background ambient videos
- Tutorial presentations

---

### 2.4 Stickers & Decorative Elements (Week 8) 🎉
**Priority:** LOW | **Complexity:** LOW

**Features:**
- Badges: "NEW", "SALE", "HOT"
- Ribbons and banners
- Speech bubbles
- Checkmarks, stars, ratings
- Pre-styled with color variants

**Technical:**
- SVG-based components
- Picker modal like icons
- Store as `stickers: []` in state

**Use Cases:**
- Product launches
- E-commerce showcases
- Achievement highlights

---

## 📐 Phase 3: Professional Tools (Weeks 9-12)

> **Goal:** Design precision and workflow efficiency

### 3.1 Grouping System (Week 9) 🗂️
**Priority:** HIGH | **Complexity:** HIGH

**Features:**
- Select multiple elements (Shift+click or drag box)
- Group selected elements
- Move/resize/delete group as unit
- Ungroup elements
- Lock groups to prevent edits
- Nested groups support

**Technical:**
- Add selection state to store
- Bounding box calculation for groups
- Transform group as single entity
- Update all children positions on group move

**Use Cases:**
- Complex compositions
- Reusable element sets
- Lock background elements

---

### 3.2 Layers Panel (Week 10) 📚
**Priority:** HIGH | **Complexity:** MEDIUM

**Features:**
- Visual layer stack (sidebar or floating)
- Drag to reorder z-index
- Show/hide individual layers
- Lock layers (prevent edits)
- Rename layers
- Thumbnail preview

**Technical:**
- New `LayersPanel.jsx` component
- Sync with current z-index system
- Drag & drop reordering (react-beautiful-dnd)
- Update store on layer changes

**Use Cases:**
- Manage 50+ elements
- Control complex compositions
- Hide/show without deleting

---

### 3.3 Alignment Tools (Week 11) 📐
**Priority:** MEDIUM | **Complexity:** MEDIUM

**Features:**
- **Align:** Left, Center, Right, Top, Middle, Bottom
- **Distribute:** Evenly space horizontal/vertical
- **Smart Guides:** Distance measurements
- **Snap to Grid:** Optional grid overlay
- **Maintain Aspect Ratio:** Lock proportions on resize

**Technical:**
- Calculate bounds of selected elements
- Apply transformations to positions
- Add temporary guide lines (like Figma)
- Grid overlay with CSS

**Use Cases:**
- Precision layouts
- Professional alignment
- Consistent spacing

---

### 3.4 Properties Panel (Week 12) 🎛️
**Priority:** MEDIUM | **Complexity:** MEDIUM

**Features:**
- Permanent side panel (collapsible)
- Shows selected element properties
- Real-time editing without menus
- Position X/Y input (numeric)
- Size W/H input (numeric)
- Rotation input
- All style controls in one place

**Technical:**
- New `PropertiesPanel.jsx` component
- Subscribe to selected element
- Two-way binding with state
- Collapse/expand animation

**Use Cases:**
- Faster workflow (no menu clicking)
- Precise numeric input
- Single source of truth for properties

---

## 🎭 Phase 4: Presentation & Polish (Weeks 13-16)

> **Goal:** Delivery and user experience excellence

### 4.1 Presentation Mode (Week 13) 🎬
**Priority:** HIGH | **Complexity:** HIGH

**Features:**
- **Full-screen Mode** - Hide UI, show only content
- **Scene System** - Define "slides" as canvas regions
- **Keyboard Navigation** - Arrow keys to move between scenes
- **Smooth Transitions** - Pan/zoom animations
- **Presenter View** - Notes and next slide preview (optional)

**Technical:**
- Add `scenes: []` to store (regions with zoom/pan)
- Full-screen API
- Animation sequences with Framer Motion
- Keyboard event handling

**Use Cases:**
- Live presentations
- Client pitches
- Portfolio walkthroughs

---

### 4.2 Entrance Animations (Week 14) ✨
**Priority:** MEDIUM | **Complexity:** MEDIUM

**Features:**
- **Animations:** Fade in, Slide in, Zoom in, Bounce
- **Stagger Delay** - Sequential animations
- **Duration Control** - Speed slider
- **Preview Mode** - See animations before presenting
- **Trigger:** On scene enter or on click

**Technical:**
- Extend Framer Motion variants
- Add `animation: {}` to each element
- Timeline orchestration
- Play/pause controls in edit mode

**Use Cases:**
- Dynamic reveals
- Storytelling flow
- Professional presentations

---

### 4.3 Template Library (Week 15) 📚
**Priority:** MEDIUM | **Complexity:** MEDIUM

**Features:**
- **Pre-made Layouts:**
  - Portfolio (3-column grid with text)
  - Product Showcase (hero + features)
  - Timeline (horizontal flow with dates)
  - Comparison (side-by-side cards)
  - About Me (bio + photos)
- **One-click Apply** - Replaces current canvas
- **Customizable** - Edit after applying
- **User Templates** - Save current as template

**Technical:**
- Template JSON files in `public/templates/`
- Import templates into state
- Template picker modal
- Export current state as template

**Use Cases:**
- Quick start projects
- Consistent branding
- Share designs

---

### 4.4 Color Palette Manager (Week 16) 🎨
**Priority:** LOW | **Complexity:** LOW

**Features:**
- **Document Palette** - Auto-extract from images
- **Custom Palettes** - Save frequently used colors
- **Brand Kits** - Named palette sets
- **Apply to Elements** - Quick color switching
- **Import/Export** - Share palettes

**Technical:**
- Color extraction library (vibrant.js)
- Store palettes in `colorPalettes: []`
- Palette picker UI
- JSON export for sharing

**Use Cases:**
- Brand consistency
- Color scheme exploration
- Quick theming

---

## 🌟 Phase 5: Advanced Features (Weeks 17-20+)

> **Future enhancements and power user features**

### 5.1 Hotspots & Interactivity 🎯
- Clickable areas on images
- Actions: Navigate URL, Show/Hide elements, Play video
- Hover effects
- Interactive presentations

### 5.2 Drawing Tools ✏️
- Freehand pen
- Highlighter
- Eraser
- Annotations mode

### 5.3 Collaborative Features 👥
- Real-time multiplayer (WebRTC or Yjs)
- Comments and feedback
- Version history
- Share links (read-only or edit)

### 5.4 Cloud Integration ☁️
- Cloud storage (AWS S3 / Cloudflare R2)
- Cross-device sync
- Public gallery
- Embed presentations

### 5.5 Export Enhancements 📄
- PDF export
- PowerPoint export (pptxgenjs)
- Video export (canvas recording)
- Print-optimized layouts

---

## 📊 Priority Matrix

| Feature | Priority | Complexity | Impact | Phase |
|---------|----------|----------|--------|-------|
| Shape Tools | HIGH | MEDIUM | HIGH | 1.1 |
| Advanced Text | HIGH | MEDIUM | HIGH | 1.2 |
| Grouping | HIGH | HIGH | HIGH | 3.1 |
| Layers Panel | HIGH | MEDIUM | HIGH | 3.2 |
| Presentation Mode | HIGH | HIGH | VERY HIGH | 4.1 |
| Lines & Connectors | MEDIUM | HIGH | MEDIUM | 1.3 |
| Icon Library | MEDIUM | MEDIUM | MEDIUM | 1.4 |
| Image Filters | MEDIUM | MEDIUM | MEDIUM | 2.1 |
| Alignment Tools | MEDIUM | MEDIUM | HIGH | 3.3 |
| Entrance Animations | MEDIUM | MEDIUM | MEDIUM | 4.2 |
| Template Library | MEDIUM | MEDIUM | HIGH | 4.3 |

---

## 🎯 Success Metrics

### Phase 1 (Visual Elements)
- [ ] 90% of users add at least one shape
- [ ] 80% of users use advanced text styling
- [ ] Average 5+ elements per presentation

### Phase 2 (Enhanced Media)
- [ ] 70% of presentations use image filters
- [ ] 50% of users apply frames/masks
- [ ] Video engagement increases 40%

### Phase 3 (Professional Tools)
- [ ] 85% of power users use grouping
- [ ] Average 20+ elements per presentation
- [ ] Layers panel used in 60% of sessions

### Phase 4 (Presentation)
- [ ] 75% of users try presentation mode
- [ ] 50% use entrance animations
- [ ] Template usage in 40% of new projects

---

## 🔄 Iteration Principles

1. **Ship Fast** - Weekly releases, get feedback early
2. **User First** - Every feature solves a real use case
3. **Performance** - Maintain 60fps, optimize bundle size
4. **Polish** - Animations and UX delight matter
5. **Backwards Compatible** - Old projects always load

---

## 📝 Notes & Considerations

### Technical Debt
- Refactor drag system (abstract @dnd-kit patterns)
- Split large components (Toolbar, Playfield)
- Add comprehensive tests (Vitest + React Testing Library)
- Optimize bundle (code splitting, lazy loading)

### Accessibility
- Keyboard shortcuts (Phase 4+)
- Screen reader support
- High contrast mode
- Focus indicators

### Mobile Experience
- Touch gestures (pinch, swipe)
- Mobile-optimized UI
- Simplified editing on small screens

---

## 🔧 Phase 0: Bug Fixes & Animation System (v2.2)

> **Goal:** Fix critical bugs and establish consistent animation/design system

### 0.1 Critical Bug Fixes ✅

**Priority:** CRITICAL | **Complexity:** LOW

| Bug | File | Issue | Fix |
|-----|------|-------|-----|
| Mousewheel zoom broken | `Playfield.jsx:121` | `containerRef` used before declaration | Move ref declaration before useEffect |
| ID collision on reload | `useStore.js:554-555` | Uses array length instead of max ID | Calculate max ID from existing items |
| Video files not persisting | `useStore.js:12` | `Map` cannot be JSON serialized | Replace with Object for serialization |
| Memory leak in panning | `Playfield.jsx:171-213` | Event listeners accumulate | Use stable ref for panStart |
| Notification race condition | `useStore.js:162-168` | Multiple timeouts interfere | Track notification ID |

---

### 0.2 Animation System (BakedShift Pattern) 🎬

**Priority:** HIGH | **Complexity:** MEDIUM

**New Files:**
- `src/lib/animations.js` - Centralized Framer Motion variants
- `src/lib/theme.js` - Design tokens (shadows, spacing, colors)

#### Core Animation Variants

```javascript
// Spring physics - bouncy, natural feel
export const springTransition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
};

// Smooth tween for subtle effects
export const smoothTransition = {
  type: 'tween',
  duration: 0.3,
  ease: 'easeInOut',
};

// Stagger pattern for lists
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};
```

#### Animation Usage by Component

| Component | Animation | Pattern |
|-----------|-----------|---------|
| Card.jsx | `cardHover` | Lift + shadow on hover |
| Toast.jsx | `toastAnimation` | Slide-down with spring |
| ExpressionMenu.jsx | `menuSlideIn` | Slide from right |
| BackgroundMenu.jsx | `menuSlideIn` | Slide from right |
| MaximizedView.jsx | `modalOverlay` + `modalContent` | Fade overlay + scale content |
| Toolbar dropdowns | `staggerContainer` + `staggerItem` | Sequential item entrance |

---

### 0.3 Design Tokens System 🎨

**Priority:** HIGH | **Complexity:** LOW

#### Shadow Hierarchy

```javascript
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',      // Subtle: inputs, list items
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',    // Default: cards, containers
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',  // Elevated: hover states
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.15)', // High: modals, dropdowns
  glow: '0 0 20px rgb(102 126 234 / 0.5)',  // Focus states
};

// Dark mode (app default)
export const darkShadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.4)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.4)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.5)',
  glow: '0 0 20px rgb(102 126 234 / 0.3)',
};
```

#### Spacing & Border Radius

```javascript
export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
export const borderRadius = { sm: 4, md: 8, lg: 12, xl: 16, full: 9999 };
```

---

### 0.4 Error Boundary & Resilience 🛡️

**Priority:** HIGH | **Complexity:** LOW

**Features:**
- Wrap App.jsx with error boundary component
- Graceful error display with retry option
- Log errors for debugging
- Prevent full app crash from single component failure

**Technical:**
- New `ErrorBoundary.jsx` component
- React error boundary pattern with `componentDidCatch`
- Styled error UI matching app theme

---

### 0.5 Accessibility Foundations ♿

**Priority:** MEDIUM | **Complexity:** LOW

**Features:**
- Respect `prefers-reduced-motion` media query
- Add `aria-label` to icon buttons
- Keyboard focus indicators
- Semantic HTML improvements

**Technical:**
```javascript
// Animation helper for accessibility
export const getMotionProps = (prefersReducedMotion) => ({
  initial: prefersReducedMotion ? false : 'hidden',
  animate: 'visible',
  transition: prefersReducedMotion ? { duration: 0 } : undefined,
});
```

---

### 0.6 Code Cleanup 🧹

**Priority:** LOW | **Complexity:** LOW

- [x] Remove `SimpleCard.jsx` (debug component)
- [ ] Add `useCallback` for event handlers in hot paths
- [ ] Add `useMemo` for computed layout values
- [ ] Split large components (Toolbar, Playfield) - Phase 3+

---

## 📊 Updated Priority Matrix

| Feature | Priority | Complexity | Impact | Phase | Status |
|---------|----------|----------|--------|-------|--------|
| **Critical Bug Fixes** | CRITICAL | LOW | VERY HIGH | 0.1 | ✅ Done |
| **Animation System** | HIGH | MEDIUM | HIGH | 0.2 | ✅ Done |
| **Design Tokens** | HIGH | LOW | MEDIUM | 0.3 | ✅ Done |
| **Error Boundary** | HIGH | LOW | HIGH | 0.4 | ✅ Done |
| **Groups & Organization** | HIGH | HIGH | VERY HIGH | v2.3 | ✅ Done |
| Shape Tools | HIGH | MEDIUM | HIGH | 1.1 | Pending |
| Advanced Text | HIGH | MEDIUM | HIGH | 1.2 | Pending |
| Grouping (Selection-based) | HIGH | HIGH | HIGH | 3.1 | Pending |
| Layers Panel | HIGH | MEDIUM | HIGH | 3.2 | Pending |
| Presentation Mode | HIGH | HIGH | VERY HIGH | 4.1 | Pending |

---

## 🎯 Animation Timing Reference

| Animation Type | Duration | Easing |
|----------------|----------|--------|
| Micro-interactions | 150-200ms | ease-out |
| Card hover | 200-300ms | spring |
| Page transitions | 300-400ms | custom bezier |
| Modal enter/exit | 200-300ms | spring |
| Stagger delay | 50-100ms | linear |
| Toast notifications | 200ms in, 150ms out | spring |

---

**Current Version:** 2.4.0
**File Format Version:** 2.1
**Next Review:** After Phase 1 completion
**Last Updated:** December 4, 2025
**Maintained by:** Yassine Boumiza & AI Development Team
