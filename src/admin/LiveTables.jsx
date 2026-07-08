import { useEffect, useState } from 'react';
import { getTables, setTableStatus } from '../services/api';

const AUTOMATIONS = [
  { id: 'a1', label: 'Booking reminder — 2 hrs before slot (WhatsApp)', on: true },
  { id: 'a2', label: 'Google review request — 1 hr after visit', on: true },
  { id: 'a3', label: 'Win-back nudge — inactive 21 days', on: false },
  { id: 'a4', label: 'Birthday reward voucher — auto-issue', on: true },
];

export default function LiveTables() {
  const [tables, setTables] = useState([]);
  const [autos, setAutos] = useState(AUTOMATIONS);
  useEffect(() => { getTables().then(setTables); }, []);

  const cycle = { free: 'busy', busy: 'reserved', reserved: 'free' };

  return (
    <div>
      <div className="glass panel" style={{ marginTop: 0 }}>
        <div className="panel-h">
          <span className="panel-t">Live Floor — tap a table to cycle its status</span>
          <span className="chip"><span className="dot dot-live" /> REAL-TIME</span>
        </div>
        <div className="occ-grid">
          {tables.map((t) => (
            <button key={t.id} className="glass occ-card" style={{ cursor: 'pointer', textAlign: 'left', border: '1px solid var(--stroke)' }}
              onClick={async () => setTables(await setTableStatus(t.id, cycle[t.status]))}>
              <span className="occ-name">{t.name.split('—')[0]}</span>
              <span className="chip"><span className={`dot dot-${t.status}`} /> {t.status.toUpperCase()}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="glass panel">
        <div className="panel-h">
          <span className="panel-t">Automations</span>
          <span className="mono dim" style={{ fontSize: 10, letterSpacing: '.15em' }}>SIMULATED — WIRES TO WHATSAPP API LATER</span>
        </div>
        {autos.map((au) => (
          <div className="auto-row" key={au.id}>
            <span style={{ fontSize: 13.5 }}>{au.label}</span>
            <div className={`switch ${au.on ? 'on' : ''}`} role="switch" aria-checked={au.on}
              onClick={() => setAutos(autos.map((x) => (x.id === au.id ? { ...x, on: !x.on } : x)))} />
          </div>
        ))}
      </div>
    </div>
  );
}
