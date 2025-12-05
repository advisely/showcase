# Showcase - Package Dependencies

> Last updated: December 4, 2025

This document provides a comprehensive overview of all packages and libraries used by the Showcase presentation application.

## Dependencies Overview

| Library | Installed Version | Latest Version | Status | Comments |
|---------|------------------|----------------|--------|----------|
| **@dnd-kit/core** | 6.3.1 | 6.3.1 | ✅ Up to date | Drag and drop framework. Stable - no breaking changes. A new `@dnd-kit/react` package exists for future migration but is not required. |
| **@dnd-kit/utilities** | 3.2.2 | 3.2.2 | ✅ Up to date | Utility functions for @dnd-kit. Stable. |
| **file-saver** | 2.0.5 | 2.0.5 | ✅ Up to date | Browser file saving utility. Mature, stable package - no changes expected. |
| **framer-motion** | 12.23.25 | 12.23.25 | ✅ Up to date | Animation library. Consider future migration to `motion` package (renamed from framer-motion). |
| **idb** | 8.0.3 | 8.0.3 | ✅ Up to date | IndexedDB wrapper for storage. Stable. |
| **jszip** | 3.10.1 | 3.10.1 | ✅ Up to date | ZIP file creation for exports. Stable, mature package. |
| **lodash.debounce** | 4.0.8 | 4.0.8 | ✅ Up to date | Debounce utility function. Stable - no updates expected (lodash is feature-complete). |
| **lodash.throttle** | 4.1.1 | 4.1.1 | ✅ Up to date | Throttle utility function. Stable - no updates expected. |
| **react** | 19.2.1 | 19.2.1 | ✅ Up to date | UI component library. React 19 is stable. |
| **react-dom** | 19.2.1 | 19.2.1 | ✅ Up to date | React DOM renderer. Must match react version. |
| **zustand** | 5.0.9 | 5.0.9 | ✅ Up to date | Lightweight state management. Zustand v5 is stable. |

## Dev Dependencies

| Library | Installed Version | Latest Version | Status | Comments |
|---------|------------------|----------------|--------|----------|
| **@vitejs/plugin-react** | 5.1.1 | 5.1.1 | ✅ Up to date | React support for Vite. Enables JSX transform and Fast Refresh. |
| **vite** | 7.2.6 | 7.2.6 | ✅ Up to date | Development server and build tool. Vite 7 is stable. |

## Update Summary

### All Packages Up to Date

All dependencies are currently at their latest versions. No updates required.

### Packages at Latest Version
- @dnd-kit/core
- @dnd-kit/utilities
- @vitejs/plugin-react
- file-saver
- framer-motion
- idb
- jszip
- lodash.debounce
- lodash.throttle
- react
- react-dom
- vite
- zustand

## Package Details

### Core Framework

#### React 19.x
- **Purpose**: UI component library
- **Notes**: React 19 introduced concurrent features, automatic batching, and `use()` hook
- **Migration**: Already on v19 - fully compatible with all dependencies

#### Zustand 5.x
- **Purpose**: Lightweight state management
- **Notes**: v5 introduced improved TypeScript support and middleware improvements
- **Migration**: Already on v5 - stable API

### Animation & Interaction

#### Framer Motion 12.x (motion)
- **Purpose**: Animation library for React
- **Notes**:
  - Package was renamed from `framer-motion` to `motion`
  - v12 has no breaking changes for React users
  - Gesture callbacks API slightly changed but backward compatible
- **Future**: Consider migrating to `motion` package name (optional)

#### @dnd-kit/core 6.x
- **Purpose**: Drag and drop functionality
- **Notes**:
  - v6.3.1 added `Tab` key to end drag operations
  - v6.3.0 added `onDragPending` and `onDragAbort` events
- **Future**: A new `@dnd-kit/react` package exists but migration is optional

### Storage & Export

#### idb 8.x
- **Purpose**: IndexedDB wrapper for persistent storage
- **Notes**: Promise-based API for browser storage

#### jszip 3.x
- **Purpose**: Create ZIP archives for project export
- **Notes**: Used for bundling presentations with external video files

#### file-saver 2.x
- **Purpose**: Browser file download API
- **Notes**: Cross-browser file saving without server

### Build Tools

#### Vite 7.x
- **Purpose**: Development server and build tool
- **Notes**:
  - Fast HMR (Hot Module Replacement)
  - Native ESM support
  - Rollup-based production builds

#### @vitejs/plugin-react 5.x
- **Purpose**: React support for Vite
- **Notes**: Enables JSX transform and Fast Refresh

## Security Considerations

All dependencies are:
- ✅ Actively maintained
- ✅ No known security vulnerabilities
- ✅ From trusted sources (npm verified publishers)

Run `npm audit` periodically to check for security advisories.

## Upgrade Commands

```bash
# Update all patch versions (safe)
npm update

# Check for outdated packages
npm outdated

# Security audit
npm audit

# Fix security issues automatically
npm audit fix
```

## Notes for Future Updates

1. **@dnd-kit/react migration**: The dnd-kit team is working on a new React-specific package. Monitor for stable release before migrating.

2. **motion package migration**: Consider renaming import from `framer-motion` to `motion` when convenient (not required, just a rename).

3. **React 20**: No release date announced. React 19 will be supported long-term.

4. **Vite 8**: Monitor for release notes. Major versions may require config changes.

---

*Generated by Claude Code - Updated December 4, 2025*
