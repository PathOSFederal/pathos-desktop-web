# Day 12 A6 Change Brief

## Scope

Quality, tooling guardrails, and integration hygiene for workspace validation.

## Changes

1. Added `scripts/check-boundaries.js` and root `pnpm check:boundaries`.
2. Wired boundary checks into root `lint` and `test` scripts.
3. Added desktop Vite aliases for `@pathos/*` package resolution stability.
4. Added `docs/dev/next-dev-lock.md` with Next lock and port conflict recovery steps.
5. Updated `docs/release/merge-ready-checklist.md` to include recursive gates and boundary checks.
6. Added optional helper script `scripts/day-artifacts.ps1` plus `pnpm docs:day-artifacts`.
7. Enforced single-lockfile hygiene with `.gitignore` entry for `apps/web/pnpm-lock.yaml`.

## Notes

Validation command results are captured in `docs/merge-notes.md` Day 12 A6 section.
