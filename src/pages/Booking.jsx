import { useEffect, useMemo, useState } from 'react';
import { useRevealObserver } from '../components/ui';
import { getTables, getMenu, createBooking, takePendingCart, SLOTS } from '../services/api';

/* ---------- activity icons (inline, mono-line) ---------- */
const ICONS = {
  snooker: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3.5" />
    </svg>
  ),
  pool: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="7" width="18" height="10" rx="5" />
      <circle cx="9" cy="12" r="1.4" fill="currentColor" /><circle cx="15" cy="12" r="1.4" fill="currentColor" />
    </svg>
  ),
  ps5: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="8" width="18" height="9" rx="4.5" />
      <path d="M8 11.5 v3 M6.5 13 h3" /><circle cx="16.5" cy="12" r="0.8" fill="currentColor" /><circle cx="14" cy="14" r="0.8" fill="currentColor" />
    </svg>
  ),
  indoor: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="4" y="4" width="16" height="16" rx="3" /><path d="M12 4 v16 M4 12 h16" />
    </svg>
  ),
};

const ACTIVITIES = [
  { id: 'snooker', label: 'Snooker' },
  { id: 'pool', label: 'American Pool' },
  { id: 'ps5', label: 'PS5 Gaming' },
  { id: 'indoor', label: 'Indoor Games' },
];

const iso = (y, m, d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
const h12 = (s) => {
  const h = parseInt(s, 10);
  return `${((h + 11) % 12) + 1}:00 ${h >= 12 ? 'PM' : 'AM'}`;
};
const prettyDate = (s) => {
  const d = new Date(s + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
};

/* deterministic dummy "already booked" starts per activity+date */
function takenSlots(activity, date) {
  const seed = [...(activity + date)].reduce((s, c) => s + c.charCodeAt(0), 0);
  return SLOTS.filter((_, i) => (i * 5 + seed) % 9 === 0 || (i * 3 + seed) % 13 === 0);
}

/* ---------- month calendar ---------- */
function Calendar({ value, onChange }) {
  const [view, setView] = useState(() => {
    const d = new Date(value + 'T00:00:00');
    return { y: d.getFullYear(), m: d.getMonth() };
  });
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const firstDow = new Date(view.y, view.m, 1).getDay();
  const days = new Date(view.y, view.m + 1, 0).getDate();
  const atCurrentMonth = view.y === today.getFullYear() && view.m === today.getMonth();
  const monthName = new Date(view.y, view.m, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  const nav = (dir) => setView(({ y, m }) => {
    const d = new Date(y, m + dir, 1);
    return { y: d.getFullYear(), m: d.getMonth() };
  });
  return (
    <div className="glass cal">
      <div className="cal-head">
        <span className="cal-title display">{monthName}</span>
        <div className="cal-nav">
          <button onClick={() => nav(-1)} disabled={atCurrentMonth} aria-label="Previous month">‹</button>
          <button onClick={() => nav(1)} aria-label="Next month">›</button>
        </div>
      </div>
      <div className="cal-grid">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <span key={d + i} className="cal-dow mono">{d}</span>)}
        {Array.from({ length: firstDow }, (_, i) => <span key={'b' + i} className="cal-day blank" />)}
        {Array.from({ length: days }, (_, i) => {
          const d = i + 1;
          const dateStr = iso(view.y, view.m, d);
          const isPast = new Date(view.y, view.m, d) < today;
          return (
            <button key={d}
              className={`cal-day ${value === dateStr ? 'sel' : ''} ${isPast ? 'dis' : ''}`}
              onClick={() => onChange(dateStr)}>
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function Booking() {
  const [tables, setTables] = useState([]);
  const [menu, setMenu] = useState([]);
  const [activity, setActivity] = useState('snooker');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [start, setStart] = useState(null);
  const [hours, setHours] = useState(1);
  const [guests, setGuests] = useState(2);
  const [tableId, setTableId] = useState(null);
  const [cart, setCart] = useState([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmed, setConfirmed] = useState(null);

  useRevealObserver([activity]);

  useEffect(() => {
    getTables().then(setTables);
    getMenu().then((m) => setMenu(m.filter((x) => x.available && ['Signature Combos', 'Mains & Pizza'].includes(x.category))));
    // adopt items sent over from the menu page ("Attach to a Booking")
    const pending = takePendingCart();
    if (pending.length) {
      setCart(pending.map((p, i) => ({ key: 'menu-' + i + '-' + p.id, id: p.id, name: p.name, price: p.price })));
    }
  }, []);

  const activityTables = tables.filter((t) => t.type === activity);
  const baseRate = activityTables.length ? Math.min(...activityTables.map((t) => t.rate)) : 0;
  const table = tables.find((t) => t.id === tableId);
  const taken = useMemo(() => takenSlots(activity, date), [activity, date]);

  const startIdx = SLOTS.indexOf(start);
  const bookedSlots = start ? SLOTS.slice(startIdx, startIdx + hours) : [];
  const realHours = bookedSlots.length;
  const rate = table?.rate ?? baseRate;
  const gameTotal = rate * realHours;
  const foodTotal = cart.reduce((s, a) => s + a.price, 0);
  const total = gameTotal + foodTotal;
  const endLabel = start ? h12(String(parseInt(start, 10) + realHours) + ':00') : null;

  const pickActivity = (id) => { setActivity(id); setTableId(null); setStart(null); };
  const pickDate = (d) => { setDate(d); setStart(null); };
  const addItem = (m) => setCart((c) => [...c, { key: c.length + '-' + m.id, id: m.id, name: m.name, price: m.price }]);
  const removeItem = (key) => setCart((c) => c.filter((x) => x.key !== key));

  const canBook = table && realHours > 0 && name.trim() && phone.trim().length >= 10;

  const book = async () => {
    const booking = await createBooking({
      customer: name.trim(), phone: phone.trim(), activity,
      tableId, date, slots: bookedSlots, guests,
      items: cart.map((a) => a.name), total,
    });
    setConfirmed(booking);
    setStart(null); setCart([]);
  };

  return (
    <main className="page">
      <div className="container">
        <div className="page-head reveal in">
          <span className="eyebrow">Live Availability</span>
          <h1 className="h-section">Book your <span className="accent">table.</span></h1>
        </div>

        <div className="bk-grid">
          {/* ============ LEFT: STEPS ============ */}
          <div>
            {/* 1 · activity */}
            <div className="step-h" style={{ marginTop: 0 }}>
              <span className="step-n mono">1</span>
              <span className="step-t display">Choose your activity</span>
            </div>
            <div className="act-tiles">
              {ACTIVITIES.map((a) => {
                const min = tables.filter((t) => t.type === a.id).map((t) => t.rate);
                return (
                  <button key={a.id} className={`act-tile ${activity === a.id ? 'sel' : ''}`} onClick={() => pickActivity(a.id)}>
                    {ICONS[a.id]}
                    <span className="at-name">{a.label}</span>
                    <span className="at-rate mono">₹{min.length ? Math.min(...min) : '—'}/hr</span>
                  </button>
                );
              })}
            </div>

            {/* 2 · date */}
            <div className="step-h">
              <span className="step-n mono">2</span>
              <span className="step-t display">Pick a date</span>
            </div>
            <Calendar value={date} onChange={pickDate} />

            {/* 3 · time */}
            <div className="step-h">
              <span className="step-n mono">3</span>
              <span className="step-t display">Select a time slot</span>
            </div>
            <div className="ts-grid">
              {SLOTS.map((s, i) => (
                <button key={activity + date + s}
                  style={{ animationDelay: `${i * 35}ms` }}
                  className={`slot ts ${bookedSlots.includes(s) ? 'picked' : ''} ${taken.includes(s) ? 'taken' : ''}`}
                  onClick={() => setStart(s)}>
                  {h12(s)}
                </button>
              ))}
            </div>

            {/* 4 · table */}
            <div className="step-h">
              <span className="step-n mono">4</span>
              <span className="step-t display">Pick your table</span>
            </div>
            <div className="legend-row">
              <span className="lg"><i style={{ background: 'rgba(46,230,168,.2)', border: '1px solid var(--felt-bright)' }} /> Available</span>
              <span className="lg"><i style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.2)' }} /> Booked</span>
              <span className="lg"><i style={{ background: 'rgba(47,125,255,.35)', border: '1px solid var(--neon-pink)' }} /> Your pick</span>
            </div>
            <div className="tb-cards">
              {activityTables.map((t) => {
                const booked = t.status !== 'free';
                return (
                  <button key={t.id}
                    className={`tb-card ${tableId === t.id ? 'sel' : ''} ${booked ? 'booked' : ''}`}
                    onClick={() => !booked && setTableId(t.id)}>
                    <span className="tb-name">{t.name.split('—')[0].trim()}</span>
                    <span className="tb-sub dim">{t.name.split('—')[1]?.trim() || 'Standard setup'}</span>
                    <span className="chip" style={{ alignSelf: 'flex-start' }}>
                      <span className={`dot dot-${t.status}`} /> {booked ? 'Booked' : 'Available'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* 5 · café (optional) */}
            <div className="step-h">
              <span className="step-n mono">5</span>
              <span className="step-t display">Pre-order from the café <span className="mono dim" style={{ fontSize: 11, letterSpacing: '.2em' }}>· OPTIONAL</span></span>
            </div>
            <div className="add-grid">
              {menu.map((m) => (
                <div key={m.id} className="glass cafe-add">
                  <div>
                    <b style={{ fontSize: 14 }}>{m.name}</b>
                    <span className="dim" style={{ display: 'block', fontSize: 12, marginTop: 3 }}>{m.desc}</span>
                  </div>
                  <button className="mi-add" onClick={() => addItem(m)}>+ ₹{m.price}</button>
                </div>
              ))}
            </div>
          </div>

          {/* ============ RIGHT: RESERVATION PANEL ============ */}
          <aside className="glass resv">
            <div className="resv-h">
              <h3 className="display" style={{ fontSize: 19 }}>Your reservation</h3>
              <span className="chip"><span className="dot dot-live" /> LIVE PRICING</span>
            </div>
            <p className="dim" style={{ fontSize: 13, margin: '8px 0 6px' }}>Everything updates as you choose.</p>

            <div className="rv-row"><span className="rv-l">Activity</span><span className="rv-v">{ACTIVITIES.find((a) => a.id === activity)?.label}</span></div>
            <div className="rv-row"><span className="rv-l">Date</span><span className="rv-v">{date ? prettyDate(date) : '—'}</span></div>
            <div className="rv-row"><span className="rv-l">Time</span><span className="rv-v">{start ? `${h12(start)} – ${endLabel}` : '—'}</span></div>
            <div className="rv-row"><span className="rv-l">Table</span><span className="rv-v">{table ? table.name.split('—')[0].trim() : '—'}</span></div>

            <div className="rv-row">
              <span className="rv-l">Session length</span>
              <span className="len-pills">
                {[1, 2, 3].map((h) => (
                  <button key={h} className={`len-pill mono ${hours === h ? 'on' : ''}`} onClick={() => setHours(h)}>{h} hr</button>
                ))}
              </span>
            </div>

            <div className="rv-row">
              <span className="rv-l">Guests</span>
              <span className="guests">
                <button onClick={() => setGuests((g) => Math.max(1, g - 1))} aria-label="Fewer guests">−</button>
                <b>{guests}</b>
                <button onClick={() => setGuests((g) => Math.min(8, g + 1))} aria-label="More guests">+</button>
              </span>
            </div>

            {cart.length > 0 && (
              <div style={{ marginTop: 18 }}>
                <div className="resv-cafe-h">
                  <span className="mono dim" style={{ fontSize: 10, letterSpacing: '.26em' }}>PRE-ORDERED CAFÉ</span>
                  <span className="mono dim" style={{ fontSize: 10, letterSpacing: '.2em' }}>{cart.length} ITEM{cart.length > 1 ? 'S' : ''}</span>
                </div>
                {cart.map((c) => (
                  <div key={c.key} className="cafe-item">
                    <span>{c.name}</span>
                    <span style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <b className="mono gold">₹{c.price}</b>
                      <button className="ci-x" onClick={() => removeItem(c.key)} aria-label="Remove">✕</button>
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="rv-row" style={{ borderBottom: 'none', paddingBottom: 6 }}>
              <span className="rv-l">Table rate</span>
              <span className="rv-v mono" style={{ fontSize: 14 }}>
                {realHours > 0 ? `₹${rate} × ${realHours} hr = ₹${gameTotal}` : `₹${rate}/hr`}
              </span>
            </div>

            <div className="field" style={{ marginTop: 14 }}>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" aria-label="Your name" />
            </div>
            <div className="field" style={{ marginTop: 12 }}>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="WhatsApp number" aria-label="WhatsApp number" />
            </div>

            <div className="resv-total">
              <span className="dim">Total{realHours > 0 ? ` · ${realHours} hr${cart.length ? ' + café' : ''}` : ''}</span>
              <span className="display resv-amt">₹{total.toLocaleString('en-IN')}</span>
            </div>

            <button className="btn btn-gold confirm-btn" disabled={!canBook} onClick={book}>
              Confirm Booking →
            </button>
            <p className="fineprint mono dim">
              INSTANT WHATSAPP CONFIRMATION · FREE CANCELLATION UP TO 2 HRS BEFORE
            </p>
          </aside>
        </div>
      </div>

      {/* WhatsApp-style confirmation */}
      {confirmed && (
        <div className="modal-back" onClick={() => setConfirmed(null)}>
          <div className="wa-card" onClick={(e) => e.stopPropagation()}>
            <div className="wa-head">
              <div className="wa-avatar">47</div>
              <div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>One47 Club &amp; Cafe</div>
                <div style={{ color: '#c8f7d0', fontSize: 11 }}>online</div>
              </div>
            </div>
            <div className="wa-body">
              <div className="wa-bubble">
                {`✅ *Booking Confirmed!*

Hi ${confirmed.customer}, your table is locked in 🎱

*${confirmed.id.toUpperCase()}* · ${prettyDate(confirmed.date)}
${(tables.find((t) => t.id === confirmed.tableId) || {}).name || ''}
🕐 ${confirmed.slots.map(h12).join(', ')} · ${confirmed.guests} guest${confirmed.guests > 1 ? 's' : ''}
${confirmed.items.length ? '🍟 ' + confirmed.items.join(', ') : ''}
💰 Total: ₹${confirmed.total.toLocaleString('en-IN')}

Show this message at the desk. See you at the felt! — Team One47`}
              </div>
              <div className="wa-time">{new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} ✓✓</div>
              <button className="btn btn-ghost" style={{ width: '100%', marginTop: 20 }} onClick={() => setConfirmed(null)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
