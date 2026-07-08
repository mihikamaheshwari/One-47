# One47 Club & Cafe — Software Requirements Specification (SRS)

**Source:** Client deck `one47.pptx` (13 slides) · **Date:** 2026-07-08 · **Phase:** SDLC 1 — Requirement Analysis

## 1. Business Context

One47 Club & Cafe is a premium entertainment venue: 3 snooker tables + American pool,
a PS5 gaming zone, a café with curated food/beverage combos, and indoor games
(chess, carrom, darts, board games).

### 1.1 Problems to solve (Slide 4)
- "Is a table free?" answered dozens of times daily — no live availability
- Double bookings / scheduling conflicts
- Walk-ins leave when tables are full
- No centralized customer data or history
- Food orders disconnected from game bookings
- No loyalty / membership program

### 1.2 Vision (Slide 5)
End-to-end journey: **Discover → Book → Order → Pay → Confirm (WhatsApp) → Enjoy → Return (loyalty)**

## 2. Functional Requirements

| ID | Requirement | Source |
|----|-------------|--------|
| FR-1 | Cinematic homepage: hero + "Book Now" CTA, featured games, offers, membership CTA, testimonials, social links | Slide 3 |
| FR-2 | Live table status per activity (snooker / pool / PS5 / indoor) with real-time-style availability | Slide 7 |
| FR-3 | Booking flow: activity tabs → table/console → date & hourly slot → transparent pricing → confirm | Slides 6–7 |
| FR-4 | Instant WhatsApp-style booking confirmation (simulated until backend exists) | Slide 7 |
| FR-5 | Digital café menu with categories, combos, pre-ordering alongside a booking | Slide 6 |
| FR-6 | Tiered membership: Silver ₹499/mo (₹4,999/yr, 5% off), Gold ₹799/mo (₹7,999/yr, 10% off), Elite ₹1,299/mo (₹12,999/yr, 15% off) with benefits ladder (priority booking, birthday rewards, tournament access, events, 1×/2×/3× loyalty points) | Slide 8 |
| FR-7 | Tournament management: setup (game type/format/dates/rules), online registration, auto-generated knockout brackets, live scores + leaderboard, rewards/payouts | Slide 12 |
| FR-8 | Tournament types: Snooker, Pool, PS5 esports, Mixed-activity | Slide 12 |
| FR-9 | Owner dashboard (/admin): live occupancy & active bookings, daily revenue & café sales, peak hours, popular activities, repeat-customer stats, membership performance, automated reminders/review requests | Slide 9 |
| FR-10 | Admin management: bookings list, menu CRUD, tournament create/score-update/bracket-advance | Slides 9, 12 |
| FR-11 | Loyalty points earned per visit, multiplied by tier | Slides 5, 8 |

## 3. Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-1 | **Futuristic visual identity:** dark glassmorphism, gold accents, neon magenta/cyan edge lighting, emerald felt green (per brand imagery) |
| NFR-2 | **Heavy 3D & scroll-driven animation:** WebGL snooker scene, scroll-cinematic hero (cue strikes ball → ball zooms → becomes the "O" of One47), parallax, magnetic buttons, animated counters, page transitions |
| NFR-3 | Responsive: desktop-first cinematic, graceful mobile fallback |
| NFR-4 | Data layer is **dummy/localStorage behind a service interface** so a real database/API can be swapped in later without UI changes |
| NFR-5 | Performance: lazy-load 3D, cap devicePixelRatio, reduced-motion support |
| NFR-6 | Runs entirely client-side (no backend yet) |

## 4. Out of Scope (this phase)
Real payments, real WhatsApp API, authentication/accounts, real database — all stubbed with dummy data.

## 5. Success Criteria
- All pages functional with dummy data: Home, Menu, Booking, Tournaments, Membership, /admin
- Tournaments show dummy events with brackets (who vs who), live scoreboards, leaderboards
- Admin covers every dashboard metric from Slide 9 + management CRUD
- Signature scroll animation on homepage works end-to-end
