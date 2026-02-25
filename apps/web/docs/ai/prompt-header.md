# Cursor Prompt Header

> **Usage**: Copy this header to the beginning of any Cursor prompt to ensure consistent behavior.

**Follow `docs/ai/process-card.md` for the active process.**

---

## Standard Header (Copy This)

```
Do not commit or push.

Cursor: Read these first (if present):
docs/ai/cursor-house-rules.md, docs/ai/testing-standards.md, docs/ai/prompt-header.md

## CI-Equivalent Definition of Done (Required)

All work must be "CI-equivalent green" before requesting a review or opening/refreshing a PR. This means you must run the same checks CI runs, in this order, and log the commands + outputs in `docs/merge-notes/current.md`:

1) Policy validation (must pass first):
- Set DAY environment variable: `DAY=<N> pnpm ci:validate` (PowerShell: `$env:DAY="<N>"; pnpm ci:validate`)
- `pnpm ci:validate` (validates day artifacts, change brief, and day labels match the specified day)

2) Quality gates:
- `pnpm lint` (warnings are allowed; only hard failures block merging)
- `pnpm typecheck`
- `pnpm test`
- `pnpm build` (run locally unless explicitly excluded for a documented reason)

If any command fails, you must fix the issue and rerun the full suite until all are green.

**Warnings Policy:** Warnings in lint/typecheck/test/build output are allowed for now. Only hard failures block merging. A dedicated "Warnings Cleanup Day" will be scheduled in the future to eliminate warnings and optionally tighten rules.

Patch artifacts are part of "done" and must reflect the current diff. Use `pnpm docs:day-patches --day <N>` to generate both patches automatically. Then record `Get-Item ... | Format-List` outputs in `docs/merge-notes/current.md`:
- `artifacts/day-<N>.patch` (cumulative: develop → working tree, excludes artifacts/)
- `artifacts/day-<N>-run.patch` (incremental: current run, HEAD → working tree)

Required deliverables must be present AND tracked (not left untracked), including:
- `docs/change-briefs/day-<N>.md`
- `docs/merge-notes/current.md` (archived prior day notes go to `docs/merge-notes/archive/day-<N>.md` when starting a new day)

Do not commit or push. Provide text-only suggested commit message/PR title in current.md, but never execute git commit/push steps.


Hard rules:
- Do NOT use var, use let/const only.
- Avoid ?., ??, and ... (spread).
- Over-comment new/modified code (teaching-level header + explain why/how).
- Do not run git commit or git push.
- Always update docs/merge-notes/current.md with git state, diff outputs, and patch artifact.
- Always update docs/change-briefs/day-XX.md for the current day.

Before finishing:
- Run pnpm ci:validate, pnpm lint, pnpm typecheck, pnpm test, pnpm build
- Paste all outputs to docs/merge-notes/current.md

Required git logging steps (must be pasted into docs/merge-notes/current.md):

Preflight (at START of run):
git status --porcelain

git status
git branch --show-current

Commit-range reporting (reference only - does not influence patch naming):
git diff --name-status develop...HEAD
git diff --stat develop...HEAD

Canonical review baseline (matches patch generation):
git diff --name-status develop -- . ':(exclude)artifacts'
git diff --stat develop -- . ':(exclude)artifacts'

Patch generation (required at END of every run):

**Preferred method (automated):**
```bash
pnpm docs:day-patches --day <N>
```

**Manual method (PowerShell UTF-8):**

git add -N .
New-Item -ItemType Directory -Force artifacts | Out-Null
git diff --binary develop -- . ":(exclude)artifacts" | Out-File -FilePath artifacts/day-<N>.patch -Encoding utf8
Get-Item artifacts/day-<N>.patch | Format-List Name,Length,LastWriteTime

git diff --binary HEAD -- . ":(exclude)artifacts" | Out-File -FilePath artifacts/day-<N>-run.patch -Encoding utf8
Get-Item artifacts/day-<N>-run.patch | Format-List Name,Length,LastWriteTime

Replace "<N>" with the current day number (e.g., day-15).

Note: Since we do NOT commit during runs, HEAD often does not advance. Therefore use develop baseline (not develop...HEAD) for the cumulative patch.

### Patch artifact: single source of truth

- Always generate both patches using: `pnpm docs:day-patches --day <N>` (generates both cumulative and incremental)
- Always run `Get-Item artifacts/day-<N>.patch artifacts/day-<N>-run.patch | Format-List Name,Length,LastWriteTime` and paste the literal output into current.md
- Do not paraphrase file sizes (no "~260KB" or estimates)
- Append a "Patch Artifacts (FINAL)" block at the end of each run — mark it as FINAL and authoritative
- Do not edit prior "Patch Artifacts" blocks (current.md is append-only)
- Do not paste the full diff into current.md

### End-of-run requirement: regenerate patch artifacts

At the end of every Cursor run:

1. After all changes and after running `pnpm gates` (lint, typecheck, test, build), regenerate patch artifacts so they match the final diff.
2. Use `pnpm docs:day-patches --day <N>` (preferred) or manual PowerShell UTF-8 commands (do **NOT** use `>` as it can produce UTF-16).
3. If any change is made after patch generation, regenerate the patches again before stopping.
4. Paste the final patch file metadata output into `docs/merge-notes/current.md`.

> **Why not `develop...HEAD`?** Since we do NOT commit during runs, HEAD often does not advance. The canonical patch must reflect develop → working tree to accurately show all changes for review.

### Snapshot template

Use this structure in docs/merge-notes/current.md:

```markdown
### Patch Artifacts (FINAL)

**Command:**
pnpm docs:day-patches --day 15
Get-Item artifacts/day-15.patch artifacts/day-15-run.patch | Format-List Name,Length,LastWriteTime

**Output:**
Name          : day-15.patch
Length        : 266248
LastWriteTime : 12/14/2025 12:30:00 AM

Name          : day-15-run.patch
Length        : 12345
LastWriteTime : 12/14/2025 12:30:00 AM
```

---

[Your task description here]
```

---

## Required Prompt Sections

Every prompt must include these sections (in order):

1. **Ticket metadata**: Day/Ticket number, branch name, goal, scope
2. **Pre-flight logging**: Commands for current.md (`git status`, `git branch --show-current`, plus canonical baseline: `git diff --name-status develop -- . ':(exclude)artifacts'`, `git diff --stat develop -- . ':(exclude)artifacts'`)
3. **Human Simulation Gate decision**: Required yes/no + triggers hit + why (see `docs/ai/testing-standards.md`)
4. **Command gates**: `pnpm ci:validate`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` (when relevant)
5. **Patch artifact generation**: Cumulative (`day-<N>.patch`) + incremental (`day-<N>-run.patch`) using `pnpm docs:day-patches --day <N>`
6. **AI Acceptance Checklist**: Flow, stores, storage keys, failure mode, how tested (when triggered)
7. **Testing Evidence**: Mode, steps, result, localStorage key, console clean (when Human Simulation Gate is required)

> **Reminder**: Do not commit/push, no `var`, keep diffs minimal.

---

## Compact Header (For Simple Tasks)

```
# PathOS — Quick Task

Read `docs/ai/cursor-house-rules.md` first. No `var`, over-comment, run all checks.

Task: [Your task here]
```

---

## Notes

- The prompt header ensures Cursor knows where to find project-specific rules.
- For complex changes, use the standard header.
- For simple fixes, the compact header is sufficient.
- Always ensure the AI reads the house rules before making changes.
- The git logging steps create a reproducible patch artifact and document branch state.

---

*Last updated: December 2025*
