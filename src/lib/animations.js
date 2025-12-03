/**
 * Animation System for Showcase
 * Centralized Framer Motion variants following BakedShift patterns
 *
 * @see PLAN.md Phase 0.2 for documentation
 */

// =============================================================================
// TRANSITION CONFIGURATIONS
// =============================================================================

/**
 * Spring physics - bouncy, natural feel
 * Use for: card interactions, buttons, modals
 */
export const springTransition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
};

/**
 * Smooth tween - predictable, subtle
 * Use for: fades, slides, background changes
 */
export const smoothTransition = {
  type: 'tween',
  duration: 0.3,
  ease: 'easeInOut',
};

/**
 * Quick transition - micro-interactions
 * Use for: hover states, button feedback
 */
export const quickTransition = {
  type: 'tween',
  duration: 0.15,
  ease: 'easeOut',
};

/**
 * Custom easing for page-level animations
 */
export const customEase = [0.25, 0.46, 0.45, 0.94];

// =============================================================================
// FADE ANIMATIONS
// =============================================================================

/**
 * Simple fade in/out
 */
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: smoothTransition },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

/**
 * Fade in from below - page headers, cards entering
 */
export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: springTransition },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

/**
 * Fade in from above - dropdowns, alerts
 */
export const fadeInDown = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: springTransition },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

/**
 * Fade in from right - slide-in panels
 */
export const fadeInLeft = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: springTransition },
  exit: { opacity: 0, x: 20, transition: { duration: 0.15 } },
};

/**
 * Fade in from left - list items
 */
export const fadeInRight = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: springTransition },
  exit: { opacity: 0, x: -10, transition: { duration: 0.15 } },
};

// =============================================================================
// SCALE ANIMATIONS
// =============================================================================

/**
 * Scale in - modals, popovers
 */
export const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: springTransition },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

/**
 * Scale in from small - icons, badges
 */
export const popIn = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 400, damping: 25 },
  },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.15 } },
};

// =============================================================================
// STAGGER ANIMATIONS (Lists & Grids)
// =============================================================================

/**
 * Container for staggered children
 * Usage: Apply to parent element containing staggered items
 */
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05, // 50ms between each child
      delayChildren: 0.1, // Initial delay before first child
    },
  },
};

/**
 * Individual staggered item
 * Usage: Apply to each child element
 */
export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: springTransition },
};

/**
 * Stagger from left (horizontal lists)
 */
export const staggerItemHorizontal = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: springTransition },
};

/**
 * Dynamic index-based animation
 * Use for dynamically generated lists with custom delays
 * @param {number} index - Item index in list
 * @returns {object} Framer Motion variants
 */
export const listItemAnimation = (index) => ({
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      delay: index * 0.05, // 50ms stagger per item
      ...springTransition,
    },
  },
});

// =============================================================================
// INTERACTIVE VARIANTS
// =============================================================================

/**
 * Card hover effect - lift and shadow
 * Use with: initial="rest" whileHover="hover" whileTap="tap"
 */
export const cardHover = {
  rest: {
    scale: 1,
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    transition: { duration: 0.2 },
  },
  hover: {
    scale: 1.02,
    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.2)',
    transition: springTransition,
  },
  tap: {
    scale: 0.98,
  },
};

/**
 * Button press feedback
 * Use with: initial="rest" whileTap="pressed"
 */
export const buttonPress = {
  rest: { scale: 1 },
  hover: { scale: 1.02 },
  pressed: { scale: 0.95 },
};

/**
 * Icon button hover
 * Use with: whileHover="hover" whileTap="tap"
 */
export const iconButtonHover = {
  rest: { scale: 1, rotate: 0 },
  hover: { scale: 1.1, rotate: 5 },
  tap: { scale: 0.9 },
};

// =============================================================================
// MENU & PANEL ANIMATIONS
// =============================================================================

/**
 * Menu slide in from right
 * Use for: ExpressionMenu, BackgroundMenu, side panels
 */
export const menuSlideIn = {
  hidden: { opacity: 0, x: 20, scale: 0.95 },
  visible: { opacity: 1, x: 0, scale: 1, transition: springTransition },
  exit: { opacity: 0, x: 20, scale: 0.95, transition: { duration: 0.15 } },
};

/**
 * Dropdown menu animation
 * Use for: Toolbar dropdowns
 */
export const dropdownMenu = {
  hidden: { opacity: 0, y: -10, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 400, damping: 30 },
  },
  exit: { opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.15 } },
};

// =============================================================================
// MODAL ANIMATIONS
// =============================================================================

/**
 * Modal overlay (backdrop)
 */
export const modalOverlay = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

/**
 * Modal content
 */
export const modalContent = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 400, damping: 30 },
  },
  exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.2 } },
};

// =============================================================================
// TOAST / NOTIFICATION ANIMATIONS
// =============================================================================

/**
 * Toast notification
 * Slides down from top with spring physics
 */
export const toastAnimation = {
  hidden: { opacity: 0, y: -20, scale: 0.9 },
  visible: { opacity: 1, y: 0, scale: 1, transition: springTransition },
  exit: { opacity: 0, y: -20, scale: 0.9, transition: { duration: 0.2 } },
};

// =============================================================================
// PAGE TRANSITIONS
// =============================================================================

/**
 * Page-level transition
 */
export const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: customEase },
  },
  exit: { opacity: 0, y: -8, transition: { duration: 0.3 } },
};

// =============================================================================
// SPECIAL EFFECTS
// =============================================================================

/**
 * Infinite pulse - loading states, notifications
 * Use with: animate={pulseAnimation}
 */
export const pulseAnimation = {
  scale: [1, 1.05, 1],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

/**
 * Shimmer loading skeleton
 * Use for: skeleton loaders, placeholder content
 */
export const shimmer = {
  initial: { x: '-100%' },
  animate: {
    x: '100%',
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: 'linear',
    },
  },
};

/**
 * Gentle float - decorative elements
 */
export const floatAnimation = {
  y: [0, -10, 0],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

// =============================================================================
// ACCESSIBILITY HELPERS
// =============================================================================

/**
 * Check if user prefers reduced motion
 * @returns {boolean}
 */
export const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get motion props respecting user preferences
 * @param {boolean} reducedMotion - Whether reduced motion is preferred
 * @returns {object} Motion props for Framer Motion
 */
export const getMotionProps = (reducedMotion = prefersReducedMotion()) => ({
  initial: reducedMotion ? false : 'hidden',
  animate: 'visible',
  exit: reducedMotion ? undefined : 'exit',
  transition: reducedMotion ? { duration: 0 } : undefined,
});

/**
 * Disable animations conditionally
 * @param {object} variants - Framer Motion variants
 * @param {boolean} disabled - Whether to disable animations
 * @returns {object} Modified variants or empty object
 */
export const conditionalAnimation = (variants, disabled = false) => {
  if (disabled) {
    return {
      hidden: {},
      visible: {},
      exit: {},
    };
  }
  return variants;
};

// =============================================================================
// MOBILE HELPERS
// =============================================================================

/**
 * Check if device supports touch
 * @returns {boolean}
 */
export const isTouchDevice = () => {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

/**
 * Get hover props that are disabled on touch devices
 * @param {object} hoverProps - Props to apply on hover
 * @returns {object} Empty object on touch devices, hoverProps otherwise
 */
export const getTouchSafeHover = (hoverProps) => {
  return isTouchDevice() ? {} : hoverProps;
};
