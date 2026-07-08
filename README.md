# One47 Club & Cafe — Digital Platform

Futuristic, animation-heavy website for One47 Club & Cafe (snooker · pool · PS5 · café),
built from the client requirements in `one47.pptx`. SDLC artifacts live in [docs/](docs/).

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production bundle in dist/
```

## Pages

| Route | What's there |
|-------|--------------|
| `/` | Scroll-cinematic 3D hero — the cue strikes the pack, the black ball rolls into the lens and becomes the **O of ONE47** — then activities, live matches, membership, testimonials |
| `/booking` | Activity tabs, live table status, hourly slot picker, café combo add-ons, WhatsApp-style confirmation |
| `/menu` | Digital café menu with category filters and a floating cart |
| `/tournaments` | Dummy tournaments with knockout brackets (who vs who), live scores, season leaderboard |
| `/membership` | Silver ₹499 / Gold ₹799 / Elite ₹1,299 tiers, monthly/yearly toggle, dummy join flow |
| `/admin` | Owner dashboard (demo PIN **1470**): revenue & café sales charts, peak hours, live floor control, bookings, menu CRUD, tournament management with auto-advancing brackets, member stats, automation toggles |

## Architecture notes

- **Dummy data by design** — everything flows through `src/services/api.js`
  (async-shaped facade over localStorage + `src/services/seed.js`). When the real
  backend/database arrives, replace that one file's internals; no UI changes needed.
- 3D scene: `src/three/SnookerScene.jsx` (three + @react-three/fiber), scroll-driven,
  lazy-loaded so the rest of the site stays light.
- Admin "Reset Demo Data" restores the seeded state at any time.

## Stack

Vite · React 19 · react-router · three / @react-three/fiber / drei · GSAP-style scroll choreography (hand-rolled, rAF-based) · hand-rolled SVG charts
