# One47 — Test Report (SDLC Phase 4)

**Date:** 2026-07-08 · **Environment:** Vite dev server, Chromium preview · **Result: PASS**

| # | Test | Result |
|---|------|--------|
| 1 | Home renders: hero canvas, nav (6 links), 8 sections, live-match cards | ✅ |
| 2 | WebGL support + R3F canvas mount | ✅ (rendering verified; note below) |
| 3 | Booking: activity tabs (4), table list with live status chips | ✅ |
| 4 | Booking: slot picking, combo add-on, price math (2hr × ₹250 + ₹549 = ₹1,049) | ✅ |
| 5 | Booking: WhatsApp-style confirmation modal with ID/table/slots/total | ✅ |
| 6 | Menu: 16 items, 6 category filters, cart bar totals (₹948 for 2 items) | ✅ |
| 7 | Tournaments: 4 events, status pills, QF/SF/Final bracket, live match glow, 8-row leaderboard | ✅ |
| 8 | Membership: 3 tiers, correct pricing, monthly/yearly toggle, featured Gold card | ✅ |
| 9 | Admin: PIN gate (1470), 5 tabs + reset/lock | ✅ |
| 10 | Admin Overview: 4 KPIs, 7-table live floor (status cycling), revenue chart, 12 peak-hour bars, popularity meters, 4 automation toggles | ✅ |
| 11 | Admin Bookings: new customer booking appears; status filters; confirm/cancel actions | ✅ |
| 12 | Admin Menu CRUD: item added (16 → 17), persisted to localStorage | ✅ |
| 13 | Admin Tournaments: score stepper, "go live", winner → auto-advance into Final | ✅ |
| 14 | Admin Members: KPIs (8 members, MRR ₹6,492, points issued) + directory | ✅ |
| 15 | Data persistence across reload (localStorage) + demo reset | ✅ |
| 16 | Production build (`npm run build`) | ✅ 1.5s, 3D chunk lazy-split |

**Known constraint of the test environment:** the preview tab runs hidden, so Chromium
suspends `requestAnimationFrame`; the 3D scene and screenshots cannot be captured
headlessly. WebGL context, scene mount and all scroll/DOM logic were verified; the
cinematic runs when the page is viewed in a visible browser window.

**Cleanup:** test bookings/menu items were cleared; app reseeds pristine demo data on load.
