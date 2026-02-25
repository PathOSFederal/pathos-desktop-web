# Testing Standards

> **Purpose**: Defines when and how to write tests in the PathOS Tier 1 Frontend repo.
> Emphasis on high-value tests; discourages time-wasting component tests.

---

## Minimum Gates (All Must Pass)

Before any PR can be merged, these commands must succeed:

```bash
pnpm lint       # Zero new errors introduced
pnpm typecheck  # Zero type errors
pnpm test       # All tests pass
pnpm build      # Production build succeeds
```

**Expectation for Unit Tests:**
- Business logic functions: 2–5 tests per function
- Bug fixes: 1 regression test per bug
- Adapters/mappers: 3–8 tests per mapper
- Store persistence behaviors: 1–3 tests per behavior

---

## When Tests Are Required

Tests are **required** for:

### 1. Business Logic Functions

Any function that makes decisions based on data. Examples:
- `filterJobs()` - filter logic
- `parseGradeLevel()` - parsing/transformation
- `matchesLocation()` - matching logic

### 2. Bug Fixes

When fixing a bug, add a test that **would have caught the bug**. This prevents regressions.

### 3. Adapters and Mappers

Functions that transform data between formats. Examples:
- `mapMockJobToCard()` - mock data → canonical format
- `mapUSAJobsToCard()` - USAJOBS API → canonical format

These are critical because data shape mismatches cause cascading failures.

### 4. Store Behavior with Persistence

When store actions affect what persists to localStorage:
- Saved searches CRUD
- Default filter settings
- Visibility toggles

---

## When Tests Are Optional

Tests are **optional** for:

### 1. Pure UI-Only Changes

- Styling updates (colors, spacing, typography)
- Layout changes that don't affect behavior
- Adding/removing purely decorative elements

### 2. Trivial One-Liner Utilities

Functions so simple that a test would just restate the implementation:

```typescript
// No test needed for this
function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString()}`;
}
```

### 3. React Component Structure

Don't write component tests unless there's **meaningful logic inside the component**.

❌ **Bad use of testing time:**

```typescript
// Testing that a component renders its children - adds no value
it('renders the title', () => {
  render(<Card title="Hello" />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});
```

✅ **Good use of testing time:**

```typescript
// Testing actual logic in the component
it('shows error state when data is invalid', () => {
  render(<JobCard job={{ ...invalidData }} />);
  expect(screen.getByRole('alert')).toHaveTextContent('Invalid job data');
});
```

---

## Test Budget Guidelines

Scope your test count based on change size:

| Change Size | Description | Suggested Test Count |
|-------------|-------------|---------------------|
| **Small** | Single function fix, minor enhancement | 1–3 tests |
| **Medium** | New utility file, store action, adapter | 3–8 tests |
| **Large** | New feature with multiple functions | 8–15 tests |

### Budget Philosophy

- **Aim for the minimum tests that catch real bugs**.
- Each test should prevent a specific failure mode.
- If you can't articulate what bug a test prevents, skip it.

---

## Test Structure

### File Naming

- Tests live next to their source file: `v1Mapper.ts` → `v1Mapper.test.ts`
- Or in a dedicated `__tests__` folder for larger modules.

### Test Organization

```typescript
import { describe, it, expect } from 'vitest';

describe('functionName', function () {
  // Happy path
  describe('with valid input', function () {
    it('should return expected result', function () {
      // ...
    });
  });

  // Edge cases
  describe('with missing fields', function () {
    it('should handle gracefully', function () {
      // ...
    });
  });

  // Error cases
  describe('with garbage input', function () {
    it('should not throw', function () {
      // ...
    });
  });
});
```

### Function Expression Style

Use `function` expressions (not arrow functions) for test callbacks. This matches the existing codebase style:

```typescript
// ✅ Preferred
it('should work', function () {
  expect(true).toBe(true);
});

// ❌ Avoid
it('should work', () => {
  expect(true).toBe(true);
});
```

---

## What Makes a Good Test

### 1. Tests a Real Failure Mode

```typescript
// Good: Tests that saved search doesn't share array references
it('should deep clone filter arrays when applying saved search', function () {
  const savedFilters = { seriesCodes: ['0343', '0560'] };
  const result = applySavedSearch(savedFilters);
  
  // Mutating the original should NOT affect the applied filters
  savedFilters.seriesCodes.push('9999');
  expect(result.seriesCodes).not.toContain('9999');
});
```

### 2. Fails Meaningfully

If the test passes when the bug exists, it's not a useful test.

### 3. Fast and Isolated

- No network calls (use mocks)
- No filesystem access
- No shared state between tests

---

## Test Commands

```bash
# Run all tests once
pnpm test

# Watch mode (re-run on file changes)
pnpm test:watch

# Run specific file
pnpm test lib/job-search/filter-jobs.test.ts

# With coverage
pnpm test --coverage
```

---

## Anti-Patterns to Avoid

### 1. Testing Implementation Details

```typescript
// ❌ Bad: Tests internal state shape
expect(store.getState()._internal.cache).toEqual({...});

// ✅ Good: Tests observable behavior
expect(store.getState().jobs).toHaveLength(5);
```

### 2. Snapshot Tests for Dynamic Content

Snapshot tests are fragile for content that changes frequently. Use them sparingly.

### 3. Over-Mocking

If you need to mock 5+ things to test a function, the function might need refactoring.

---

## Summary

| Category | Required? | Test Count |
|----------|-----------|------------|
| Business logic | ✅ Yes | 2–5 per function |
| Bug fixes | ✅ Yes | 1 per bug |
| Adapters/mappers | ✅ Yes | 3–8 per mapper |
| Store persistence | ✅ Yes | 1–3 per behavior |
| Pure styling | ❌ No | 0 |
| Component structure | ❌ No | 0 |

**Remember**: Time spent writing tests that don't catch bugs is time not spent on features or real bug fixes.

---

## Human Simulation Rule (conditional, required)

> **When triggered**: Manual simulation by a human is required before merge.
> **When not triggered**: Human simulation is not required for text-only/cosmetic changes that do not affect flows, stores, persistence, or SSR/hydration behavior.

### Triggers

Human simulation is **required** if a ticket/PR does any of the following:

1. **Adds/changes any Create / Save / Apply / Delete action** (alerts, saved searches, saved jobs, resume items, profile edits)
2. **Changes Zustand store logic** (actions/selectors/state shape)
3. **Changes persistence behavior** (localStorage keys, save/load, reset, Delete All Local Data)
4. **Affects UI where results appear in multiple places** (cross-screen visibility)
5. **Touches SSR/hydration-sensitive UI** (conditional rendering, portals/dialogs, nested interactive elements, client-only boundaries)

### Required Checks (when triggered)

#### A) Dev-mode simulation

1. Run `pnpm dev`
2. Perform the primary flow end-to-end: action → appears elsewhere → refresh → still there (when persistence is expected)
3. Confirm intended localStorage key exists and changes (or explicitly document "no persistence expected")
4. Console must be clean (no hydration errors/warnings)

#### B) Production-mode simulation (required when SSR/hydration/routing is involved)

1. Run `pnpm build && pnpm start`
2. Repeat the same flow and refresh checks
3. Console must be clean (no hydration mismatch)

### Evidence Requirement

Results must be recorded in `merge-notes.md` under a "Testing Evidence" section:

| Item | Value |
|------|-------|
| Mode tested | dev / production |
| Steps performed | [describe flow] |
| Result | pass / fail |
| localStorage key verified | [key name] or "none expected" |
| Console clean | yes / no |

---

## Create-Button Persistence Sanity Check (Required)

Any feature that creates persisted data (alerts, saved searches, settings) **must** pass this three-step manual verification before merge:

### The Three Checks

1. **Create → appears elsewhere**
   - Click the create button (e.g., "Create Alert", "Save Search")
   - Navigate to where that data should appear (e.g., Alerts tab, Alerts Center page)
   - Confirm the newly created item is visible

2. **Refresh → still there**
   - Hard refresh the browser (Ctrl+F5 or Cmd+Shift+R)
   - Confirm the item persists and still appears in the expected location

3. **Storage key exists/changes**
   - Open DevTools → Application → Local Storage
   - Confirm the intended localStorage key exists
   - Create a new item and confirm the storage value changes

### DevTools Helper

Run this in the browser console to find alert-related storage keys:

```javascript
Object.keys(localStorage).filter(function (k) { return k.toLowerCase().includes('alert'); })
```

### Recording Proof

Document each check in `merge-notes.md`:

```markdown
### Create-Button Persistence Sanity Check

| Check | Pass/Fail | Notes |
|-------|-----------|-------|
| Appears elsewhere | ✅ | Visible in Alerts Center |
| Survives refresh | ✅ | Still present after F5 |
| Storage key exists | ✅ | `pathos-job-alerts` updated |
```

**HARD RULE: If any of the three checks fail (appears elsewhere, survives refresh, storage key exists/changes), the feature is not merge-ready.**

---

*Last updated: December 2025*
