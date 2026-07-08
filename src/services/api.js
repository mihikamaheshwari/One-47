// Dummy data service — localStorage-backed, async-shaped.
// Swap the internals for real HTTP calls when the backend/database lands;
// every page consumes only this facade.

import * as seed from './seed';

const NS = 'one47:';
const delay = (ms = 120) => new Promise((r) => setTimeout(r, ms));

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(NS + key);
    if (raw) return JSON.parse(raw);
  } catch { /* corrupted → reseed */ }
  save(key, fallback);
  return structuredClone(fallback);
}

function save(key, value) {
  localStorage.setItem(NS + key, JSON.stringify(value));
}

export function resetAll() {
  Object.keys(localStorage)
    .filter((k) => k.startsWith(NS))
    .forEach((k) => localStorage.removeItem(k));
}

/* ---------- tables & availability ---------- */
export async function getTables() { await delay(); return load('tables', seed.TABLES); }
export async function setTableStatus(id, status) {
  const tables = load('tables', seed.TABLES);
  const t = tables.find((x) => x.id === id);
  if (t) t.status = status;
  save('tables', tables);
  return tables;
}
export const SLOTS = seed.SLOTS;

/* ---------- menu ---------- */
export async function getMenu() { await delay(); return load('menu', seed.MENU); }
export async function upsertMenuItem(item) {
  const menu = load('menu', seed.MENU);
  const i = menu.findIndex((m) => m.id === item.id);
  if (i >= 0) menu[i] = item;
  else menu.push({ ...item, id: 'm' + Date.now() });
  save('menu', menu);
  return menu;
}
export async function deleteMenuItem(id) {
  const menu = load('menu', seed.MENU).filter((m) => m.id !== id);
  save('menu', menu);
  return menu;
}

/* ---------- bookings ---------- */
export async function getBookings() { await delay(); return load('bookings', seed.BOOKINGS); }
export async function createBooking(b) {
  const bookings = load('bookings', seed.BOOKINGS);
  const booking = {
    ...b,
    id: 'b' + (1000 + bookings.length + Math.floor(Math.random() * 90)),
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  };
  bookings.unshift(booking);
  save('bookings', bookings);
  return booking;
}
export async function setBookingStatus(id, status) {
  const bookings = load('bookings', seed.BOOKINGS);
  const b = bookings.find((x) => x.id === id);
  if (b) b.status = status;
  save('bookings', bookings);
  return bookings;
}

/* ---------- pending café cart (menu → booking handoff) ---------- */
export function setPendingCart(items) {
  save('pendingCart', items);
}
export function takePendingCart() {
  const items = load('pendingCart', []);
  save('pendingCart', []);
  return items;
}

/* ---------- membership ---------- */
export async function getTiers() { await delay(); return seed.TIERS; }
export async function getMembers() { await delay(); return load('members', seed.MEMBERS); }
export async function addMember(m) {
  const members = load('members', seed.MEMBERS);
  members.unshift({ ...m, id: 'u' + Date.now(), points: 0, visits: 0, joined: new Date().toISOString().slice(0, 10) });
  save('members', members);
  return members;
}

/* ---------- tournaments ---------- */
export async function getTournaments() { await delay(); return load('tournaments', seed.TOURNAMENTS); }
export async function getLeaderboard() { await delay(); return seed.LEADERBOARD; }

export async function saveTournament(t) {
  const list = load('tournaments', seed.TOURNAMENTS);
  const i = list.findIndex((x) => x.id === t.id);
  if (i >= 0) list[i] = t;
  else list.unshift({ ...t, id: 'tr' + Date.now() });
  save('tournaments', list);
  return list;
}

export async function deleteTournament(id) {
  const list = load('tournaments', seed.TOURNAMENTS).filter((t) => t.id !== id);
  save('tournaments', list);
  return list;
}

/** Update a match score; if a winner is set, advance them into the next round. */
export async function updateMatch(tournamentId, roundIdx, matchIdx, patch) {
  const list = load('tournaments', seed.TOURNAMENTS);
  const t = list.find((x) => x.id === tournamentId);
  if (!t) return list;
  const match = t.rounds[roundIdx].matches[matchIdx];
  Object.assign(match, patch);
  if (patch.winner) {
    match.live = false;
    const winnerName = patch.winner === 'p1' ? match.p1 : match.p2;
    const next = t.rounds[roundIdx + 1];
    if (next && winnerName) {
      const nm = next.matches[Math.floor(matchIdx / 2)];
      if (matchIdx % 2 === 0) nm.p1 = winnerName;
      else nm.p2 = winnerName;
    }
  }
  save('tournaments', list);
  return list;
}

/** Generate a fresh knockout bracket from a list of player names. */
export function generateBracket(players) {
  const n = players.length;
  const roundsCount = Math.ceil(Math.log2(Math.max(n, 2)));
  const size = 2 ** roundsCount;
  const seeded = [...players];
  while (seeded.length < size) seeded.push(null); // byes
  const names = { 2: 'Final', 4: 'Semi Finals', 8: 'Quarter Finals', 16: 'Round of 16', 32: 'Round of 32' };
  const rounds = [];
  let count = size / 2;
  let current = seeded;
  for (let r = 0; r < roundsCount; r++) {
    const matches = [];
    for (let m = 0; m < count; m++) {
      matches.push({
        id: `r${r}m${m}`,
        p1: r === 0 ? current[m * 2] : null,
        p2: r === 0 ? current[m * 2 + 1] : null,
        s1: 0, s2: 0,
      });
    }
    rounds.push({ name: names[count * 2] || `Round ${r + 1}`, matches });
    count /= 2;
  }
  return rounds;
}

/* ---------- analytics (dashboard) ---------- */
export async function getAnalytics() {
  await delay();
  const bookings = load('bookings', seed.BOOKINGS);
  const tables = load('tables', seed.TABLES);
  const members = load('members', seed.MEMBERS);
  const today = seed.REVENUE_14D.at(-1);
  return {
    revenue14d: seed.REVENUE_14D,
    peakHours: seed.PEAK_HOURS,
    todayGame: today.game,
    todayCafe: today.cafe,
    occupancy: Math.round((tables.filter((t) => t.status !== 'free').length / tables.length) * 100),
    activeBookings: bookings.filter((b) => b.status === 'confirmed').length,
    repeatRate: 68,
    memberCount: members.length,
    tierSplit: ['silver', 'gold', 'elite'].map((tier) => ({
      tier,
      count: members.filter((m) => m.tier === tier).length,
    })),
    popular: [
      { label: 'Snooker', pct: 44 }, { label: 'PS5 Zone', pct: 27 },
      { label: 'Pool', pct: 19 }, { label: 'Indoor Games', pct: 10 },
    ],
  };
}

export const TESTIMONIALS = seed.TESTIMONIALS;
