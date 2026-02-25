# Day 2 Change Brief

Desktop now behaves like a real PathOS desktop client with working in-app navigation.

What changed:
- Desktop has real routes for Dashboard, Career, and Settings.
- The left sidebar navigation now switches between those pages.
- The top bar now presents the PathOS brand and a Desktop environment label.
- A PathAdvisor rail remains part of the shell across pages.

Settings and persistence:
- Settings now includes a local preference toggle for showing/hiding the PathAdvisor panel.
- This preference is stored locally in `pathos.desktop.preferences.v1` and is restored when the app reloads.

What is still placeholder:
- Dashboard/Career/Settings page content is intentionally lightweight.
- PathAdvisor panel content is placeholder UI for now.

What comes next:
- Extract richer desktop screen content from web parity components.
- Improve visual parity and interaction polish across desktop shell surfaces.
- Start wiring desktop pages to backend contracts and shared domain adapters.
