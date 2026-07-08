# One47 Club & Cafe — System & UX Design

**Phase:** SDLC 2 — Design · builds on `01-requirements.md`

## 1. Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Build | Vite + React 18 | Fast dev, component model for 6 pages |
| Routing | react-router-dom | SPA with /admin route |
| 3D | three + @react-three/fiber + @react-three/drei | Procedural snooker table, scroll-driven camera |
| Animation | GSAP + ScrollTrigger | Scroll-cinematic timeline, section reveals |
| State/Data | Service layer (`src/services/`) over localStorage + seeded dummy JSON | Swappable for real API later (NFR-4) |
| Charts | Hand-rolled SVG | Custom neon look, zero deps |

## 2. Sitemap

```
/            Home — 3D scroll cinematic + content sections
/booking     Activity tabs → live availability → slot picker → cart → WhatsApp confirm
/menu        Café digital menu + combos + cart (merges into booking order)
/tournaments Tournament list → detail: bracket, live scores, leaderboard
/membership  Silver/Gold/Elite pricing + join flow (dummy)
/admin       Owner dashboard: overview, bookings, menu CRUD, tournaments mgmt, members
```

## 3. Visual Language (rev. 2 — black / neon-pink cyberpunk)

- **Base:** true black `#050508` / `#0b0b12`
- **Primary neon:** hot pink `#ff1f7a`; **secondary:** violet `#9d4dff`; **tertiary:** cyan `#22d3ee` (sparse)
- **Felt (3D table):** magenta `#9c1157`, cushions `#6e0c3d`
- **Signature gradient:** pink → violet → cyan (`--grad-neon`), used for accents, progress bar, gradient borders, headline text
- **Glass:** gradient-tinted panels (pink→violet rgba), pink-tinted 1px strokes, `backdrop-filter: blur`; `.grad-border` for hero cards
- **Success/available semantics:** neon mint `#2ee6a8` (kept distinct so status dots stay readable)
- **Type:** display = "Unbounded", body = "Inter", data = "JetBrains Mono"
- **Scroll systems:** top neon progress bar, `[data-par]` parallax engine (orbs, badges), directional reveals (`rv-left/right/scale/blur/tilt`), scroll-linked outline text bands

## 4. Signature Animation Spec (Home)

Scroll-pinned WebGL stage (~400vh) driven by GSAP ScrollTrigger progress → R3F:

1. **0.00–0.15** — Neon room fades in; camera high orbit over emerald snooker table; balls racked; title "ONE47" floats
2. **0.15–0.35** — Camera swoops low behind the cue; cue draws back (anticipation)
3. **0.35–0.45** — **Cue strikes** — cue ball fires, red pack scatters (pre-baked physics paths), camera shakes subtly
4. **0.45–0.70** — Camera tracks the black ball rolling; it slows center-frame
5. **0.70–0.90** — Ball **zooms into the lens**; its silhouette becomes the **"O" of "ONE47 CLUB"** — 3D canvas cross-fades to DOM hero logo where the O ring = ball outline
6. **0.90–1.00** — Logo locks in, tagline + "Book Now" magnetic CTA rise; page unpins and content continues

### Additional animation inventory
- Neon flicker on section headers; cursor spotlight glow
- Activity cards: 3D tilt on hover + glare sweep
- Stats: count-up on enter; marquee ticker of offers
- Menu items: staggered flip-in; category morphing filter
- Booking slots: pulse for "filling fast", availability dots breathing
- Tournament bracket: SVG connector lines draw on scroll; winner glow pulses
- Membership cards: gold shimmer; Elite card floats with parallax
- Page transitions: cue-ball wipe (circle expand/contract)
- Admin: charts animate stroke-dashoffset; live occupancy dots ping
- `prefers-reduced-motion` → all cinematics collapse to static frames

## 5. Data Model (dummy, localStorage keys `one47:*`)

```ts
Table       { id, type: 'snooker'|'pool'|'ps5'|'indoor', name, status: 'free'|'busy'|'reserved', rate }
Booking     { id, customer, phone, activity, tableId, date, slots[], items[], total, status, createdAt }
MenuItem    { id, category, name, desc, price, tag?, available }
Combo       { id, name, includes[], price }
Tournament  { id, name, type, format, startDate, entryFee, prizePool, status: 'upcoming'|'live'|'completed',
              players[], rounds: [{ name, matches: [{ id, p1, p2, s1, s2, winner?, live? }] }] }
Member      { id, name, tier, joined, points, visits }
MembershipTier { id: 'silver'|'gold'|'elite', monthly, yearly, discount, perks[] }
```

Service layer: `services/store.js` (get/set/seed) + `services/api.js` (async-shaped CRUD facades — future DB drop-in).

## 6. Component Architecture

```
src/
  main.jsx / App.jsx (routes + transitions)
  components/ Nav, Footer, GlassCard, NeonHeading, MagneticButton, Cursor, PageWipe,
              TiltCard, CountUp, Marquee
  three/      SnookerScene.jsx (table, balls, cue, lights), useScrollProgress
  pages/      Home, Booking, Menu, Tournaments, Membership, Admin
  admin/      Overview, Bookings, MenuManager, TournamentManager, Members (tabs)
  services/   store.js, api.js, seed.js
  styles/     global.css (tokens, glass, neon utilities)
```

## 7. Test Plan (SDLC 4)
Browser preview: route smoke tests, scroll timeline checkpoints, booking end-to-end (select → cart → confirm), admin CRUD persistence across reload, console-error sweep, mobile viewport pass.
