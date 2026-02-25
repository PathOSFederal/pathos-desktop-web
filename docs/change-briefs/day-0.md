# Day 0 Change Brief

Today we created a brand-new `pathos-desktop-web` monorepo so PathOS Web and PathOS Desktop can evolve together.

What was set up:

- A shared workspace structure using pnpm workspaces.
- A copied Next.js web app under `apps/web`.
- A brand-new Electron desktop app under `apps/desktop` that uses Vite + React 19.
- Shared packages under `packages/` for common UI, core constants, and adapter interfaces.

Why this matters:

- Both web and desktop now consume the same shared UI component (`SharedBanner`), which proves cross-platform sharing works.
- Desktop is now React-based and aligned with web technology, making future shared feature development faster and less duplicated.
- The repo is now organized for long-term maintainability with clear boundaries between apps and shared code.

Scope limits for Day 0:

- This is a bootstrap foundation only.
- Shared packages were intentionally kept minimal for wiring validation.
- Legacy desktop code remains in its original repository and was not migrated.
