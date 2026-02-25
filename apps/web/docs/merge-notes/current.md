# Day 44 — Guided USAJOBS Click-to-Explain Prototype

## Ticket Metadata
- **Day:** 44
- **Branch (expected):** `feature/day-44-guided-usajobs-click-to-explain-v1`
- **Branch (observed):** `feature/day-43-pathadvisor-anchor-focus-architecture` (from `.git/HEAD`)
- **Goal:** Guided USAJOBS Mode with click-to-explain PathAdvisor guidance
- **Scope:** New workspace route, state machine, goal persistence, trust microcopy, tests

---

## Pre-flight Logging

**Command:** `git status --porcelain`
```
Command: git status --porcelain
The term 'git' is not recognized as the name of a cmdlet, function, script file, or operable program. Check the spelling of the name, or if a path was included, verify that the path is correct and try again.
```

**Command:** `git status`
```
Command: git status
The term 'git' is not recognized as the name of a cmdlet, function, script file, or operable program. Check the spelling of the name, or if a path was included, verify that the path is correct and try again.
```

**Command:** `git branch --show-current`
```
Command: git branch --show-current
The term 'git' is not recognized as the name of a cmdlet, function, script file, or operable program. Check the spelling of the name, or if a path was included, verify that the path is correct and try again.
```

**Command:** `git diff --name-status develop...HEAD`
```
Command: git diff --name-status develop...HEAD
The term 'git' is not recognized as the name of a cmdlet, function, script file, or operable program. Check the spelling of the name, or if a path was included, verify that the path is correct and try again.
```

**Command:** `git diff --stat develop...HEAD`
```
Command: git diff --stat develop...HEAD
The term 'git' is not recognized as the name of a cmdlet, function, script file, or operable program. Check the spelling of the name, or if a path was included, verify that the path is correct and try again.
```

**Command:** `git diff --name-status develop -- . ':(exclude)artifacts'`
```
Command: git diff --name-status develop -- . ':(exclude)artifacts'
The term 'git' is not recognized as the name of a cmdlet, function, script file, or operable program. Check the spelling of the name, or if a path was included, verify that the path is correct and try again.
```

**Command:** `git diff --stat develop -- . ':(exclude)artifacts'`
```
Command: git diff --stat develop -- . ':(exclude)artifacts'
The term 'git' is not recognized as the name of a cmdlet, function, script file, or operable program. Check the spelling of the name, or if a path was included, verify that the path is correct and try again.
```

---

## Human Simulation Gate

| Item | Value |
|------|-------|
| Required | Yes |
| Triggers hit | Changes Zustand store logic, adds persistence key, adds new route with client-only UI |
| Why | Guided USAJOBS store persists goals and adds a new click-to-explain flow |

---

## Summary of Changes
- Added Guided USAJOBS workspace with embedded iframe, click-to-explain overlay, and right-side PathAdvisor panel
- Implemented explicit interaction state machine and response builder
- Added local goal inputs with SSR-safe persistence
- Added trust boundary microcopy and OPSEC privacy details
- Added unit tests for state transitions and basic render coverage

---

## Files Changed
- `app/dashboard/usajobs/page.tsx`
- `components/app-shell.tsx`
- `components/guided-usajobs/GuidedUsaJobsWorkspace.tsx`
- `components/guided-usajobs/GuidedUsaJobsWorkspace.test.tsx`
- `components/path-os-sidebar.tsx`
- `docs/change-briefs/day-44.md`
- `docs/merge-notes/archive/day-42-v2.md`
- `docs/owner-map.generated.md`
- `docs/owner-map.md`
- `hooks/use-delete-all-local-data.ts`
- `lib/guided-usajobs/responseBuilder.ts`
- `lib/guided-usajobs/screenshot.ts`
- `lib/guided-usajobs/stateMachine.test.ts`
- `lib/guided-usajobs/stateMachine.ts`
- `lib/guided-usajobs/types.ts`
- `lib/storage-keys.ts`
- `store/guidedUsaJobsStore.ts`
- `store/index.ts`

---

## Behavior Changes
- New `/dashboard/usajobs` route with embedded USAJOBS and click-to-explain workflow
- Ask PathAdvisor toggle now arms a selection overlay instead of using DOM inspection
- Local goal context persists in `pathos-guided-usajobs-goals-v1`

---

## Follow-ups / Deferred
- Regenerate `docs/owner-map.generated.md` using `pnpm docs:owner-map` once pnpm is available
- Run full CI-equivalent gate commands when pnpm and git are available
- Verify iframe embedding behavior in browser (block vs allow) and adjust timeout

---

## Command Gates (CI-Equivalent)

**Command:** `pnpm ci:validate` (DAY=44)
```
Command: pnpm ci:validate
The term 'pnpm' is not recognized as the name of a cmdlet, function, script file, or operable program. Check the spelling of the name, or if a path was included, verify that the path is correct and try again.
```

**Command:** `pnpm lint`
```
Command: pnpm lint
The term 'pnpm' is not recognized as the name of a cmdlet, function, script file, or operable program. Check the spelling of the name, or if a path was included, verify that the path is correct and try again.
```

**Command:** `pnpm typecheck`
```
Command: pnpm typecheck
The term 'pnpm' is not recognized as the name of a cmdlet, function, script file, or operable program. Check the spelling of the name, or if a path was included, verify that the path is correct and try again.
```

**Command:** `pnpm test`
```
Command: pnpm test
The term 'pnpm' is not recognized as the name of a cmdlet, function, script file, or operable program. Check the spelling of the name, or if a path was included, verify that the path is correct and try again.
```

**Command:** `pnpm build`
```
Command: pnpm build
The term 'pnpm' is not recognized as the name of a cmdlet, function, script file, or operable program. Check the spelling of the name, or if a path was included, verify that the path is correct and try again.
```

---

## Other Commands

**Command:** `pnpm docs:owner-map`
```
pnpm : The term 'pnpm' is not recognized as the name of a cmdlet, function, script file, or operable program. Check the spelling of the name, or if a path was included, verify that the path is correct and try again.
```

---

## AI Acceptance Checklist

| Item | Value |
|------|-------|
| Flow | Ask toggle → `guidedUsaJobsStore.applyEvent()` → local screenshot capture → response builder → PathAdvisor panel |
| Store(s) | `guidedUsaJobsStore` |
| Storage key(s) | `pathos-guided-usajobs-goals-v1` |
| Failure mode | Explanations not generated or goals not persisted |
| How tested | Unit tests for state transitions; render test for workspace (manual testing pending) |

---

## Testing Evidence

| Item | Value |
|------|-------|
| Mode tested | Not run (pnpm unavailable) |
| Steps performed | N/A |
| Result | Not run |
| localStorage key verified | Not run |
| Console clean | Not run |

---

## Patch Artifacts (FINAL)

**Command:**
`pnpm docs:day-patches --day 44`

**Output:**
```
pnpm : The term 'pnpm' is not recognized as the name of a cmdlet, function, script file, or operable program. Check the spelling of the name, or if a path was included, verify that the path is correct and try again.
```

---

## Suggested Commit Message / PR Title
- **Commit:** `Day 44: Guided USAJOBS click-to-explain prototype`
- **PR Title:** `Day 44 — Guided USAJOBS click-to-explain prototype`
