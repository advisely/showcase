/**
 * Design Tokens for Showcase
 * Centralized styling constants following BakedShift patterns
 *
 * @see PLAN.md Phase 0.3 for documentation
 */

// =============================================================================
// SHADOW SYSTEM
// =============================================================================

/**
 * Light mode shadows
 * Elevation creates visual hierarchy
 */
export const shadows = {
  /** Subtle - table rows, list items, input fields */
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',

  /** Default - cards, containers, primary sections */
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',

  /** Elevated - hover states, focused cards */
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',

  /** High - modals, dropdowns, popovers */
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',

  /** Maximum - critical overlays, tooltips */
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',

  /** Inset - pressed states, inputs */
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',

  /** Focus - focus ring effect */
  glow: '0 0 20px rgb(102 126 234 / 0.5)',
};

/**
 * Dark mode shadows (Showcase default)
 * Higher opacity for contrast on dark backgrounds
 */
export const darkShadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.3)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.3)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.5), 0 8px 10px -6px rgb(0 0 0 / 0.4)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.6)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.3)',
  glow: '0 0 20px rgb(102 126 234 / 0.3)',
};

// =============================================================================
// SPACING SYSTEM
// =============================================================================

/**
 * Consistent spacing scale (in pixels)
 */
export const spacing = {
  /** 4px - Tight gaps, icon margins */
  xs: 4,

  /** 8px - Icon spacing, small gaps */
  sm: 8,

  /** 16px - Component spacing, padding */
  md: 16,

  /** 24px - Card padding, section gaps */
  lg: 24,

  /** 32px - Large section gaps */
  xl: 32,

  /** 48px - Page padding */
  '2xl': 48,

  /** 64px - Large section breaks */
  '3xl': 64,
};

// =============================================================================
// BORDER RADIUS
// =============================================================================

/**
 * Border radius scale (in pixels)
 */
export const borderRadius = {
  /** 4px - Small inputs, tags */
  sm: 4,

  /** 8px - Standard cards, buttons */
  md: 8,

  /** 12px - Prominent cards */
  lg: 12,

  /** 16px - Modals, featured cards */
  xl: 16,

  /** 9999px - Pills, avatars, fully rounded */
  full: 9999,
};

// =============================================================================
// COLOR PALETTE
// =============================================================================

/**
 * Primary brand colors
 */
export const colors = {
  // Primary gradient colors
  primary: '#667eea',
  primaryDark: '#764ba2',

  // Background colors (dark theme)
  bgDark: '#1a1a1a',
  bgMedium: '#2a2a2a',
  bgLight: '#3a3a3a',

  // Text colors
  textPrimary: '#e0e0e0',
  textSecondary: '#aaa',
  textMuted: '#888',

  // Status colors
  success: '#27ae60',
  error: '#e74c3c',
  warning: '#f39c12',
  info: '#3498db',

  // Accent colors
  cyan: 'rgba(0, 255, 255, 0.8)',
  purple: '#722ed1',
};

/**
 * Gradient presets
 */
export const gradients = {
  /** Primary brand gradient (135deg diagonal) */
  primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',

  /** Success gradient */
  success: 'linear-gradient(135deg, #27ae60 0%, #1e8449 100%)',

  /** Error gradient */
  error: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',

  /** Dark background gradient */
  dark: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',

  /** Subtle overlay for backgrounds */
  overlay: 'linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.5) 100%)',
};

// =============================================================================
// Z-INDEX LAYERS
// =============================================================================

/**
 * Z-index layering system
 * Matches existing Showcase patterns
 */
export const zIndex = {
  /** Background elements */
  background: 0,

  /** Overlay (opacity/blur effects) */
  overlay: 1,

  /** Layout guides */
  layoutGuides: 2,

  /** Base content layer */
  content: 10,

  /** Cards (dynamic: index + 1) */
  cards: 100,

  /** Text fields (dynamic: cards.length + index + 1) */
  textFields: 200,

  /** Floating UI elements */
  floating: 500,

  /** Dragging elements */
  dragging: 1000,

  /** Menus and dropdowns */
  menu: 1100,

  /** Modals */
  modal: 1200,

  /** Tooltips */
  tooltip: 1300,

  /** Notifications/toasts */
  notification: 1400,
};

// =============================================================================
// TYPOGRAPHY
// =============================================================================

/**
 * Font family stacks
 */
export const fontFamily = {
  sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
};

/**
 * Font size scale
 */
export const fontSize = {
  xs: '12px',
  sm: '14px',
  md: '16px',
  lg: '18px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '30px',
  '4xl': '36px',
};

/**
 * Font weight
 */
export const fontWeight = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
};

// =============================================================================
// TRANSITIONS
// =============================================================================

/**
 * CSS transition presets
 */
export const transitions = {
  fast: '0.15s ease-out',
  normal: '0.2s ease-in-out',
  slow: '0.3s ease-in-out',
  spring: '0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
};

// =============================================================================
// BREAKPOINTS
// =============================================================================

/**
 * Responsive breakpoints (in pixels)
 */
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

/**
 * Media query helpers
 */
export const media = {
  sm: `@media (min-width: ${breakpoints.sm}px)`,
  md: `@media (min-width: ${breakpoints.md}px)`,
  lg: `@media (min-width: ${breakpoints.lg}px)`,
  xl: `@media (min-width: ${breakpoints.xl}px)`,
  '2xl': `@media (min-width: ${breakpoints['2xl']}px)`,
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get shadow based on current theme
 * @param {'light' | 'dark'} theme
 * @returns {object} Shadow object
 */
export const getShadows = (theme = 'dark') => {
  return theme === 'dark' ? darkShadows : shadows;
};

/**
 * Create rgba color from hex
 * @param {string} hex - Hex color code
 * @param {number} alpha - Alpha value (0-1)
 * @returns {string} RGBA color string
 */
export const hexToRgba = (hex, alpha = 1) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return hex;

  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * Get spacing value in pixels
 * @param {string} key - Spacing key
 * @returns {string} Spacing value with px unit
 */
export const sp = (key) => {
  const value = spacing[key];
  return value ? `${value}px` : '0px';
};

/**
 * Get border radius value in pixels
 * @param {string} key - Border radius key
 * @returns {string} Border radius value with px unit
 */
export const br = (key) => {
  const value = borderRadius[key];
  return value ? `${value}px` : '0px';
};
