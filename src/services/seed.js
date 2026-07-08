// Seed data — dummy content until the real database is connected.
// Everything flows through services/api.js so a backend can replace this layer wholesale.

export const TABLES = [
  { id: 't-sn1', type: 'snooker', name: 'Snooker Table 1 — Championship', status: 'busy', rate: 300 },
  { id: 't-sn2', type: 'snooker', name: 'Snooker Table 2 — Classic', status: 'free', rate: 250 },
  { id: 't-sn3', type: 'snooker', name: 'Snooker Table 3 — Classic', status: 'free', rate: 250 },
  { id: 't-pl1', type: 'pool', name: 'American Pool — Neon Bay', status: 'reserved', rate: 200 },
  { id: 't-ps1', type: 'ps5', name: 'PS5 Pod A — 65" 4K OLED', status: 'busy', rate: 150 },
  { id: 't-ps2', type: 'ps5', name: 'PS5 Pod B — Racing Rig', status: 'free', rate: 180 },
  { id: 't-in1', type: 'indoor', name: 'Lounge Zone — Chess / Carrom / Darts', status: 'free', rate: 80 },
];

export const SLOTS = ['11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'];

export const MENU = [
  { id: 'm1', category: 'Signature Combos', name: 'Break & Bite', desc: '1 hr snooker + loaded nachos + 2 iced teas', price: 549, tag: 'BESTSELLER', available: true },
  { id: 'm2', category: 'Signature Combos', name: 'Player One Combo', desc: '1 hr PS5 + peri-peri fries + cold coffee', price: 399, tag: 'GAMER PICK', available: true },
  { id: 'm3', category: 'Signature Combos', name: 'Squad Frame', desc: '2 hr pool for 4 + margherita pizza + pitcher of mojito', price: 999, tag: 'GROUP', available: true },
  { id: 'm4', category: 'Coffee & Beverages', name: 'One47 Signature Cold Brew', desc: 'Slow-steeped 18 hrs, citrus notes', price: 189, tag: '', available: true },
  { id: 'm5', category: 'Coffee & Beverages', name: 'Neon Blue Lagoon', desc: 'Electric blue citrus cooler, glows under UV', price: 169, tag: 'INSTA-FAMOUS', available: true },
  { id: 'm6', category: 'Coffee & Beverages', name: 'Espresso Tonic 147', desc: 'Double shot over artisanal tonic', price: 199, tag: '', available: true },
  { id: 'm7', category: 'Coffee & Beverages', name: 'Classic Masala Chai', desc: 'House-spiced, served in kulhad', price: 99, tag: '', available: true },
  { id: 'm8', category: 'Bites & Starters', name: 'Loaded Nachos Supreme', desc: 'Cheese sauce, salsa, jalapeños, sour cream', price: 279, tag: '', available: true },
  { id: 'm9', category: 'Bites & Starters', name: 'Peri-Peri Fries', desc: 'Crispy fries in fiery peri-peri dust', price: 179, tag: '', available: true },
  { id: 'm10', category: 'Bites & Starters', name: 'Paneer Tikka Skewers', desc: 'Charred cottage cheese, mint chutney', price: 249, tag: '', available: true },
  { id: 'm11', category: 'Bites & Starters', name: 'Chicken Wings — Gold Rush', desc: 'Honey-sriracha glaze, sesame', price: 329, tag: 'SPICY', available: true },
  { id: 'm12', category: 'Mains & Pizza', name: 'Margherita 147', desc: 'San Marzano base, fresh basil, buffalo mozz', price: 349, tag: '', available: true },
  { id: 'm13', category: 'Mains & Pizza', name: 'BBQ Chicken Pizza', desc: 'Smoked BBQ sauce, red onion, cheddar', price: 429, tag: '', available: true },
  { id: 'm14', category: 'Mains & Pizza', name: 'Club Sandwich Stack', desc: 'Triple decker, fries on the side', price: 289, tag: '', available: true },
  { id: 'm15', category: 'Desserts', name: 'Black Ball Brownie', desc: 'Dark chocolate sphere, hot fudge poured tableside', price: 229, tag: 'SIGNATURE', available: true },
  { id: 'm16', category: 'Desserts', name: 'Gold Leaf Cheesecake', desc: 'Baked NY style with edible gold', price: 269, tag: 'PREMIUM', available: true },
];

export const TIERS = [
  {
    id: 'silver', name: 'Silver', monthly: 499, yearly: 4999, discount: 5,
    perks: ['5% off all bookings', 'Priority booking access', 'Birthday reward voucher', 'Earn loyalty points every visit'],
  },
  {
    id: 'gold', name: 'Gold', monthly: 799, yearly: 7999, discount: 10, featured: true,
    perks: ['10% off all bookings', 'Priority booking access', 'Birthday rewards', 'Tournament access', 'Exclusive event invitations', '2× loyalty points'],
  },
  {
    id: 'elite', name: 'Elite', monthly: 1299, yearly: 12999, discount: 15,
    perks: ['15% off all bookings', 'Top-priority booking', 'Premium birthday rewards', 'VIP tournament access', 'Exclusive private events', '3× loyalty points'],
  },
];

const P = (name, seed) => ({ name, seed });

export const TOURNAMENTS = [
  {
    id: 'tr1', name: 'One47 Winter Masters', type: 'Snooker', format: 'Knockout · Best of 5',
    startDate: '2026-07-18', entryFee: 500, prizePool: 25000, status: 'live',
    players: ['Arjun Mehta', 'Vikram Singh', 'Rahul Nair', 'Dev Patel', 'Sameer Khan', 'Karan Joshi', 'Aditya Rao', 'Manish Gupta'],
    rounds: [
      {
        name: 'Quarter Finals',
        matches: [
          { id: 'qf1', p1: 'Arjun Mehta', p2: 'Manish Gupta', s1: 3, s2: 1, winner: 'p1' },
          { id: 'qf2', p1: 'Vikram Singh', p2: 'Aditya Rao', s1: 3, s2: 2, winner: 'p1' },
          { id: 'qf3', p1: 'Rahul Nair', p2: 'Karan Joshi', s1: 3, s2: 0, winner: 'p1' },
          { id: 'qf4', p1: 'Dev Patel', p2: 'Sameer Khan', s1: 2, s2: 3, winner: 'p2' },
        ],
      },
      {
        name: 'Semi Finals',
        matches: [
          { id: 'sf1', p1: 'Arjun Mehta', p2: 'Vikram Singh', s1: 2, s2: 1, live: true },
          { id: 'sf2', p1: 'Rahul Nair', p2: 'Sameer Khan', s1: 0, s2: 0 },
        ],
      },
      { name: 'Final', matches: [{ id: 'f1', p1: null, p2: null, s1: 0, s2: 0 }] },
    ],
    highBreak: { player: 'Vikram Singh', score: 87 },
  },
  {
    id: 'tr2', name: 'Neon 8-Ball Shootout', type: 'Pool', format: 'Groups → Knockout · Race to 4',
    startDate: '2026-07-25', entryFee: 300, prizePool: 12000, status: 'upcoming',
    players: ['Riya Sharma', 'Tanmay Verma', 'Ishaan Kapoor', 'Neha Bansal', 'Rohit Malhotra', 'Zoya Ali', 'Farhan Sheikh', 'Priya Menon'],
    rounds: [
      {
        name: 'Quarter Finals',
        matches: [
          { id: 'qf1', p1: 'Riya Sharma', p2: 'Priya Menon', s1: 0, s2: 0 },
          { id: 'qf2', p1: 'Tanmay Verma', p2: 'Farhan Sheikh', s1: 0, s2: 0 },
          { id: 'qf3', p1: 'Ishaan Kapoor', p2: 'Zoya Ali', s1: 0, s2: 0 },
          { id: 'qf4', p1: 'Neha Bansal', p2: 'Rohit Malhotra', s1: 0, s2: 0 },
        ],
      },
      { name: 'Semi Finals', matches: [{ id: 'sf1', p1: null, p2: null, s1: 0, s2: 0 }, { id: 'sf2', p1: null, p2: null, s1: 0, s2: 0 }] },
      { name: 'Final', matches: [{ id: 'f1', p1: null, p2: null, s1: 0, s2: 0 }] },
    ],
  },
  {
    id: 'tr3', name: 'FC 26 Champions Night', type: 'PS5', format: 'Single Elimination · 90-min matches',
    startDate: '2026-07-12', entryFee: 200, prizePool: 8000, status: 'live',
    players: ['Kabir Anand', 'Yash Thakur', 'Om Prakash', 'Siddharth Iyer', 'Ankit Choudhary', 'Rehan Qureshi', 'Nikhil Saxena', 'Aarav Kulkarni'],
    rounds: [
      {
        name: 'Quarter Finals',
        matches: [
          { id: 'qf1', p1: 'Kabir Anand', p2: 'Aarav Kulkarni', s1: 3, s2: 1, winner: 'p1' },
          { id: 'qf2', p1: 'Yash Thakur', p2: 'Nikhil Saxena', s1: 2, s2: 2, live: true },
          { id: 'qf3', p1: 'Om Prakash', p2: 'Rehan Qureshi', s1: 1, s2: 4, winner: 'p2' },
          { id: 'qf4', p1: 'Siddharth Iyer', p2: 'Ankit Choudhary', s1: 0, s2: 0 },
        ],
      },
      { name: 'Semi Finals', matches: [{ id: 'sf1', p1: 'Kabir Anand', p2: null, s1: 0, s2: 0 }, { id: 'sf2', p1: 'Rehan Qureshi', p2: null, s1: 0, s2: 0 }] },
      { name: 'Final', matches: [{ id: 'f1', p1: null, p2: null, s1: 0, s2: 0 }] },
    ],
  },
  {
    id: 'tr4', name: 'The 147 Grand Slam', type: 'Mixed', format: 'Snooker + Pool + PS5 · Points League',
    startDate: '2026-08-02', entryFee: 750, prizePool: 50000, status: 'upcoming',
    players: ['Open Registration'],
    rounds: [],
  },
];

export const LEADERBOARD = [
  { rank: 1, player: 'Vikram Singh', points: 2840, wins: 18, tier: 'Elite' },
  { rank: 2, player: 'Arjun Mehta', points: 2610, wins: 16, tier: 'Gold' },
  { rank: 3, player: 'Rahul Nair', points: 2380, wins: 14, tier: 'Elite' },
  { rank: 4, player: 'Riya Sharma', points: 2115, wins: 12, tier: 'Gold' },
  { rank: 5, player: 'Kabir Anand', points: 1930, wins: 11, tier: 'Silver' },
  { rank: 6, player: 'Sameer Khan', points: 1720, wins: 9, tier: 'Gold' },
  { rank: 7, player: 'Zoya Ali', points: 1540, wins: 8, tier: 'Silver' },
  { rank: 8, player: 'Dev Patel', points: 1350, wins: 7, tier: '—' },
];

export const MEMBERS = [
  { id: 'u1', name: 'Vikram Singh', tier: 'elite', joined: '2026-01-12', points: 2840, visits: 64 },
  { id: 'u2', name: 'Arjun Mehta', tier: 'gold', joined: '2026-02-03', points: 2610, visits: 51 },
  { id: 'u3', name: 'Riya Sharma', tier: 'gold', joined: '2026-02-20', points: 2115, visits: 43 },
  { id: 'u4', name: 'Rahul Nair', tier: 'elite', joined: '2026-03-08', points: 2380, visits: 47 },
  { id: 'u5', name: 'Kabir Anand', tier: 'silver', joined: '2026-04-15', points: 1930, visits: 30 },
  { id: 'u6', name: 'Zoya Ali', tier: 'silver', joined: '2026-05-02', points: 1540, visits: 22 },
  { id: 'u7', name: 'Neha Bansal', tier: 'silver', joined: '2026-05-28', points: 860, visits: 12 },
  { id: 'u8', name: 'Sameer Khan', tier: 'gold', joined: '2026-06-10', points: 1720, visits: 26 },
];

export const BOOKINGS = [
  { id: 'b1001', customer: 'Aditya Rao', phone: '+91 98200 11223', activity: 'snooker', tableId: 't-sn1', date: '2026-07-08', slots: ['18:00', '19:00'], items: ['Loaded Nachos Supreme'], total: 879, status: 'confirmed', createdAt: '2026-07-07T14:22:00' },
  { id: 'b1002', customer: 'Riya Sharma', phone: '+91 99870 44556', activity: 'ps5', tableId: 't-ps1', date: '2026-07-08', slots: ['17:00'], items: ['Player One Combo'], total: 399, status: 'confirmed', createdAt: '2026-07-07T19:05:00' },
  { id: 'b1003', customer: 'Manish Gupta', phone: '+91 90040 77889', activity: 'pool', tableId: 't-pl1', date: '2026-07-09', slots: ['20:00', '21:00'], items: [], total: 400, status: 'pending', createdAt: '2026-07-08T09:41:00' },
  { id: 'b1004', customer: 'Zoya Ali', phone: '+91 98111 22334', activity: 'snooker', tableId: 't-sn2', date: '2026-07-09', slots: ['15:00'], items: ['One47 Signature Cold Brew', 'Peri-Peri Fries'], total: 618, status: 'confirmed', createdAt: '2026-07-08T10:15:00' },
  { id: 'b1005', customer: 'Farhan Sheikh', phone: '+91 96650 99887', activity: 'indoor', tableId: 't-in1', date: '2026-07-10', slots: ['16:00'], items: [], total: 80, status: 'cancelled', createdAt: '2026-07-08T11:30:00' },
];

// 14-day revenue series for the admin dashboard (game vs café)
export const REVENUE_14D = [
  { d: 'Jun 25', game: 9200, cafe: 4100 }, { d: 'Jun 26', game: 10400, cafe: 4800 },
  { d: 'Jun 27', game: 14800, cafe: 7300 }, { d: 'Jun 28', game: 16200, cafe: 8900 },
  { d: 'Jun 29', game: 11000, cafe: 5200 }, { d: 'Jun 30', game: 9800, cafe: 4600 },
  { d: 'Jul 01', game: 10900, cafe: 5100 }, { d: 'Jul 02', game: 12300, cafe: 6000 },
  { d: 'Jul 03', game: 15600, cafe: 8100 }, { d: 'Jul 04', game: 17800, cafe: 9600 },
  { d: 'Jul 05', game: 16900, cafe: 9200 }, { d: 'Jul 06', game: 12100, cafe: 5800 },
  { d: 'Jul 07', game: 11500, cafe: 5400 }, { d: 'Jul 08', game: 13400, cafe: 6300 },
];

export const PEAK_HOURS = [
  { h: '11a', v: 18 }, { h: '12p', v: 26 }, { h: '1p', v: 34 }, { h: '2p', v: 30 },
  { h: '3p', v: 38 }, { h: '4p', v: 47 }, { h: '5p', v: 62 }, { h: '6p', v: 78 },
  { h: '7p', v: 92 }, { h: '8p', v: 100 }, { h: '9p', v: 88 }, { h: '10p', v: 60 },
];

export const TESTIMONIALS = [
  { name: 'Aarav K.', role: 'Regular · Gold Member', text: 'The booking system is unreal — I check live table status from office and my table is ready when I arrive. Best snooker felt in the city.' },
  { name: 'Priya M.', role: 'PS5 Tournament Winner', text: 'Won the FC 26 night here. Live brackets on the big screen, crowd going crazy — felt like an esports arena.' },
  { name: 'Rohit & gang', role: 'Weekend Squad', text: 'We pre-order the Squad Frame combo, walk in, and everything is set. The neon lounge is our default Friday now.' },
];
