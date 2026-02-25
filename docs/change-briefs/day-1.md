# Day 1 Change Brief

Desktop now uses the same shared shell component as web.

What changed today:
- We moved the shell wrapper into the shared UI package (`@pathos/ui-web`) so both apps use one `AppShell` implementation.
- Web still renders the full PathOS shell experience through a web-specific adapter.
- Desktop now renders that same shared shell with Day 1 placeholder content: "Desktop Dashboard (shell parity WIP)".
- Desktop now loads shared styling primitives from `@pathos/ui-web` (`tokens.css` + `base.css`) so shell layout and colors look coherent.

What is still placeholder:
- Desktop navigation actions are placeholders (no full route transitions yet).
- Desktop right-rail advisor area is a placeholder panel.

What comes next (Day 2 focus):
- Improve desktop Tailwind/base parity for closer visual match.
- Add routing/navigation adapters so shell nav items perform real in-app navigation.
- Continue extracting reusable shell subcomponents where safe.
