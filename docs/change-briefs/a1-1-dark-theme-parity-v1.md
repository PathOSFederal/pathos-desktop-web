# Dark Theme Parity - Desktop Shell

## Overview
Implemented dark theme and surface hierarchy for the desktop shell to visually match the provided web dashboard screenshot. This is a shell/theme pass only with no new product features.

## Changes Made

### 1. Theme Tokens
Added comprehensive theme tokens in `packages/ui-web/src/styles/base.css`:
- **Background hierarchy**: `--bg` (very dark navy/black with subtle gradient), `--surface` (slightly lighter dark grey), `--surface-2` (lighter dark grey/blue-grey for inputs/chips)
- **Text colors**: `--text` (white/light off-white), `--text-muted` (medium grey)
- **Accent colors**: `--accent` (vibrant orange), `--accent-muted` (slightly desaturated orange)
- **Effects**: `--border` (subtle light grey), `--radius` (rounded corners), `--shadow` (soft dark shadows), `--focus-ring` (consistent focus styling)

### 2. Surface Hierarchy
Applied consistent surface hierarchy throughout:
- App background uses dark navy/black with subtle vertical gradient
- Cards and panels use `--surface` with borders and soft shadows
- Input fields and chips use `--surface-2` with borders for contrast

### 3. Sidebar Parity
Updated sidebar to match web dashboard:
- Dark sidebar background using `--bg`
- Section headers (OVERVIEW, CAREER & JOBS, SETTINGS) with uppercase styling and muted text color
- Active navigation state with orange left indicator bar and subtle background highlight
- Hover states for interactive navigation items

### 4. PathAdvisor Parity
Enhanced PathAdvisor rail component:
- Module header with orange accent icon
- Chip row with "Viewing: Job Search" and "Privacy: Visible" chips styled with `--surface-2`
- Suggested prompt rows styled as interactive list items
- Input bar docked at bottom with `--surface-2` background
- Circular accent send button with icon

### 5. Top Bar Parity
Updated top bar styling for dark theme consistency:
- Dark background using `--bg`
- Consistent button and icon styling
- Proper text color hierarchy

## Files Modified
- `packages/ui-web/src/styles/base.css` - Theme tokens and shared primitives
- `apps/desktop/renderer/src/styles.css` - Desktop renderer theme wiring
- `packages/ui-web/src/shell/PathAdvisorRail.tsx` - Visual parity updates
- `apps/desktop/renderer/src/desktop-shell-adapter-provider.tsx` - Sidebar structure and section headers

## Validation
- ✅ `pnpm check:boundaries` - Passed
- ✅ `pnpm -r typecheck` - All packages passed
- ✅ `pnpm -C apps/desktop build` - Build successful

## Notes
- This is a visual/theme pass only. No new product features were implemented.
- All changes maintain existing functionality while updating visual appearance.
- Theme tokens are used consistently throughout the codebase.
