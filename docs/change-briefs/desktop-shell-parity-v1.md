# Desktop Shell Parity v1 - Change Brief

## What Changed

This change improves the desktop app's shared shell to match the web app's look and feel. The improvements focus on foundational polish for layout, chrome, spacing, typography, empty/loading states, and the PathAdvisor rail.

### Shell Layout Parity

**Spacing Improvements:**
- Aligned page padding to 24px consistently across screens
- Standardized card spacing with 16px gaps (increased from 12px)
- Improved grid gutters for better visual rhythm
- Enhanced section header spacing with proper margin-bottom (24px)

**Typography Scale:**
- Standardized main titles to 28px with proper font-weight (700) and line-height (1.2)
- Improved section headers with consistent sizing (16px, font-weight 600)
- Refined body text styling (14px, line-height 1.5)
- Enhanced helper text with proper muted foreground color

**Content Area Width/Centering:**
- Added max-width constraint (1400px) to prevent overly wide content
- Centered content areas with auto margins
- Ensured proper box-sizing for consistent padding behavior

**Scroll Behavior:**
- Maintained consistent page-level scrolling
- Improved inner panel scroll behavior with proper overflow handling
- Added min-height: 0 to flex containers to prevent scroll issues

### Chrome Parity

**Navigation Sidebar:**
- Redesigned sidebar structure with proper header section (PathOS branding)
- Added section headers ("EXPLORER") matching web app style
- Improved selected state with orange left border (3px width) matching web
- Enhanced hover states with proper background transitions
- Standardized spacing and padding throughout sidebar
- Improved typography with proper font sizes and weights

**Top Bar:**
- Enhanced top bar styling with better spacing (24px padding)
- Improved logo and branding elements
- Better button styling with proper hover states
- Refined typography for route labels

**Button and Icon Sizing:**
- Standardized button padding and sizing
- Improved icon alignment and spacing
- Enhanced interactive element density

### Generic Empty + Loading States

**Empty States:**
- Improved empty state styling with better padding (16px vertical)
- Removed excessive centering for more natural text flow
- Enhanced color contrast for better readability

**Loading States:**
- Added subtle loading animation (animated dots)
- Improved visual feedback during loading
- Better typography and spacing

### PathAdvisor Rail Baseline

**Intentional Feel:**
- Redesigned rail header with proper branding
- Added trust-first microcopy: "PathAdvisor uses your career and resume details to give tailored advice for promotions, lateral moves, and job announcements."
- Added privacy messaging: "Local-first. Private by default."
- Improved input placeholder text: "Ask about job impact, PCS, relocation..."

**Stable Layout:**
- Fixed rail width (320px, min-width: 280px)
- Proper flex-shrink: 0 to prevent compression
- Improved internal spacing and padding
- Better scroll behavior for messages area

**Silent-by-Default:**
- Removed chatty placeholder messages
- Clean initial state with helpful but non-intrusive guidance
- No automatic popups or multi-advisor confusion

**Enhanced Input:**
- Improved input styling with better focus states
- Added Enter key support for sending messages
- Disabled state for send button when input is empty
- Better accessibility with proper aria-labels

## Why This Improves UX

### Visual Consistency
Users switching between web and desktop apps now experience a consistent visual language. The matching spacing, typography, and chrome elements reduce cognitive load and make the desktop app feel like a first-class experience rather than a scaffolded version.

### Better Information Hierarchy
The improved typography scale and spacing create a clearer information hierarchy. Users can more easily scan content, identify important sections, and understand the relationship between different UI elements.

### Professional Polish
The refined chrome elements (navigation, top bar, PathAdvisor rail) give the desktop app a more polished, professional appearance. The consistent styling and proper hover/active states make interactions feel intentional and responsive.

### Trust and Clarity
The PathAdvisor rail improvements emphasize trust-first messaging and clear, helpful guidance without being chatty or intrusive. Users understand what PathAdvisor does and how to use it without feeling overwhelmed.

### Reduced Visual Noise
The improved empty and loading states are calmer and less distracting. They provide helpful context without drawing unnecessary attention, allowing users to focus on their primary tasks.

## Technical Details

### Files Modified
- `packages/ui-web/src/styles/base.css`: Enhanced shared styles for spacing, typography, and layout
- `packages/ui-web/src/shell/PathAdvisorRail.tsx`: Improved rail component with better UX
- `apps/desktop/renderer/src/styles.css`: Updated desktop-specific styles to match web
- `apps/desktop/renderer/src/desktop-shell-adapter-provider.tsx`: Enhanced sidebar structure

### Design Tokens
All styling uses CSS custom properties (design tokens) from `packages/ui-web/src/styles/tokens.css`, ensuring consistent theming across web and desktop.

### Responsive Behavior
The improvements maintain responsive behavior where appropriate, with desktop-specific optimizations for the desktop app's fixed viewport.

## Validation

All changes passed validation:
- ✅ `pnpm check:boundaries`: No forbidden imports
- ✅ `pnpm -r typecheck`: All TypeScript checks pass
- ✅ `pnpm -C apps/desktop build`: Desktop app builds successfully

## Next Steps

This foundational work sets the stage for future feature screens. The consistent shell and styling patterns can now be applied to new screens as they're developed, ensuring they feel integrated rather than scaffolded.
