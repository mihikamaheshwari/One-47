import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Dashboard from '../admin/Overview';
import BookingsAdmin from '../admin/BookingsAdmin';
import LiveTables from '../admin/LiveTables';
import MenuManager from '../admin/MenuManager';
import TournamentManager from '../admin/TournamentManager';
import MembersAdmin from '../admin/MembersAdmin';
import { resetAll } from '../services/api';

/* mono-line sidebar icons */
const I = {
  grid: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></svg>,
  cal: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M4 9.5h16M8 3v4M16 3v4" /></svg>,
  table: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="8" width="18" height="8" rx="3" /><circle cx="8" cy="12" r="1.2" fill="currentColor" /><circle cx="16" cy="12" r="1.2" fill="currentColor" /></svg>,
  menu: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M7 3v8M10 3v8M8.5 11v10M16 3c-2 2-2 6 0 8v10M16 3c2 2 2 6 0 8" /></svg>,
  trophy: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M8 4h8v6a4 4 0 0 1-8 0z" /><path d="M8 5H4.5a3.5 3.5 0 0 0 3.6 4M16 5h3.5a3.5 3.5 0 0 1-3.6 4M12 14v4M8.5 20h7" /></svg>,
  user: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="8.5" r="3.5" /><path d="M5 20c1.4-3.4 4-5 7-5s5.6 1.6 7 5" /></svg>,
};

const TABS = [
  { id: 'dashboard', label: 'Dashboard', ico: I.grid },
  { id: 'bookings', label: 'Bookings', ico: I.cal },
  { id: 'live', label: 'Live Tables', ico: I.table },
  { id: 'menu', label: 'Menu Manager', ico: I.menu },
  { id: 'tournaments', label: 'Tournaments', ico: I.trophy },
  { id: 'members', label: 'Members', ico: I.user },
];

export default function Admin() {
  const [tab, setTab] = useState('dashboard');
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('one47:admin') === '1');
  const [pin, setPin] = useState('');
  const [err, setErr] = useState(false);
  const [clock, setClock] = useState(() => new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }));

  useEffect(() => { window.scrollTo(0, 0); }, [tab]);
  useEffect(() => {
    const t = setInterval(() => setClock(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })), 30000);
    return () => clearInterval(t);
  }, []);

  if (!authed) {
    const tryLogin = () => {
      if (pin === '1470') {
        sessionStorage.setItem('one47:admin', '1');
        setAuthed(true);
      } else setErr(true);
    };
    return (
      <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 20 }}>
        <div className="glass admin-login" style={{ margin: 0 }}>
          <span className="eyebrow" style={{ justifyContent: 'center' }}>Owner Access</span>
          <h1 className="display" style={{ fontSize: 26, margin: '14px 0 24px' }}>Admin Console</h1>
          <div className="field">
            <label>PIN (demo: 1470)</label>
            <input
              type="password" value={pin} autoFocus
              onChange={(e) => { setPin(e.target.value); setErr(false); }}
              onKeyDown={(e) => e.key === 'Enter' && tryLogin()}
              style={{ textAlign: 'center', letterSpacing: '.5em', fontSize: 20 }}
            />
          </div>
          {err && <p className="neon-text-pink" style={{ fontSize: 13, marginTop: 12 }}>Wrong PIN — try 1470</p>}
          <button className="btn btn-gold" style={{ width: '100%', marginTop: 22 }} onClick={tryLogin}>
            Enter Dashboard
          </button>
          <Link to="/" className="dim" style={{ display: 'block', marginTop: 18, fontSize: 13 }}>← Back to site</Link>
        </div>
      </main>
    );
  }

  const title = TABS.find((t) => t.id === tab)?.label;

  return (
    <div className="adm-shell">
      {/* ---------- sidebar ---------- */}
      <aside className="adm-side">
        <div className="adm-logo">
          <span className="adm-coin display">147</span>
          <span className="display adm-brand">ONE47</span>
        </div>
        <nav className="adm-nav">
          {TABS.map((t) => (
            <button key={t.id} className={`adm-item ${tab === t.id ? 'on' : ''}`} onClick={() => setTab(t.id)}>
              {t.ico} <span>{t.label}</span>
            </button>
          ))}
        </nav>
        <div className="adm-side-foot">
          <span className="adm-online"><span className="dot dot-free" /> System online</span>
          <button className="adm-exit" onClick={() => { resetAll(); location.reload(); }}>↺ Reset demo data</button>
          <button className="adm-exit" onClick={() => { sessionStorage.removeItem('one47:admin'); setAuthed(false); }}>⊘ Lock console</button>
          <Link to="/" className="adm-exit">← Exit to site</Link>
        </div>
      </aside>

      {/* ---------- main ---------- */}
      <div className="adm-main">
        <header className="adm-head">
          <h1 className="display">{title}</h1>
          <div className="adm-head-r">
            <span className="chip"><span className="dot dot-live" /> LIVE · {clock}</span>
            <span className="adm-avatar mono">OW</span>
          </div>
        </header>
        <div className="adm-body">
          {tab === 'dashboard' && <Dashboard onViewAll={() => setTab('bookings')} />}
          {tab === 'bookings' && <BookingsAdmin />}
          {tab === 'live' && <LiveTables />}
          {tab === 'menu' && <MenuManager />}
          {tab === 'tournaments' && <TournamentManager />}
          {tab === 'members' && <MembersAdmin />}
        </div>
      </div>
    </div>
  );
}
