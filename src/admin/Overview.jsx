import { useEffect, useState } from 'react';
import { getAnalytics, getTables, getBookings } from '../services/api';
import { CountUp } from '../components/ui';

const ACT_LABEL = { snooker: 'Snooker', pool: 'American Pool', ps5: 'PS5 Gaming', indoor: 'Indoor Games' };
const PILL = { confirmed: 'pill-green', pending: 'pill-gold', cancelled: 'pill-pink', completed: 'pill-cyan' };

const KPI_ICONS = {
  revenue: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M6 5h12M6 9h12M8 9c0 4 3 5 8 10M14 9c0 3-2 5-6 5" /></svg>,
  bookings: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M4 9.5h16M8 3v4M16 3v4" /></svg>,
  tables: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="8" width="18" height="8" rx="3" /></svg>,
  cafe: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M6 8h11v6a5 5 0 0 1-10 0zM17 9h1.5a2.5 2.5 0 0 1 0 5H17M8 4c.8.8.8 1.6 0 2.4M12 4c.8.8.8 1.6 0 2.4" /></svg>,
};

/* 7-day vertical bar chart */
function WeekBars({ data }) {
  const max = Math.max(...data.map((d) => d.v));
  return (
    <div className="wk-bars">
      {data.map((d, i) => (
        <div className="wk-col" key={d.l}>
          <div className="wk-bar" style={{ height: `${(d.v / max) * 100}%`, animationDelay: `${i * 70}ms` }} title={`₹${d.v.toLocaleString('en-IN')}`} />
          <span className="wk-l mono">{d.l}</span>
        </div>
      ))}
    </div>
  );
}

/* labeled horizontal meter */
function HBar({ label, pct }) {
  return (
    <div className="hbar">
      <div className="hbar-top"><span>{label}</span><span className="mono hbar-pct">{pct}%</span></div>
      <div className="hbar-track"><div className="hbar-fill" style={{ width: `${pct}%` }} /></div>
    </div>
  );
}

export default function Dashboard({ onViewAll }) {
  const [a, setA] = useState(null);
  const [tables, setTables] = useState([]);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    getAnalytics().then(setA);
    getTables().then(setTables);
    getBookings().then(setBookings);
  }, []);

  if (!a) return <p className="dim">Loading intelligence…</p>;

  const todayTotal = a.todayGame + a.todayCafe;
  const prev = a.revenue14d.at(-2);
  const delta = (((todayTotal - (prev.game + prev.cafe)) / (prev.game + prev.cafe)) * 100).toFixed(1);
  const week = a.revenue14d.slice(-7).map((d, i) => ({
    l: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    v: d.game + d.cafe,
  }));
  const weekTotal = week.reduce((s, d) => s + d.v, 0);
  const occupied = tables.filter((t) => t.status !== 'free').length;
  const cafeOrders = Math.round(a.todayCafe / 100);

  const bucket = (from, to) => Math.round(a.peakHours.slice(from, to).reduce((s, p) => s + p.v, 0) / (to - from));
  const peaks = [
    { l: '11–14', v: bucket(0, 3) },
    { l: '14–17', v: bucket(3, 6) },
    { l: '17–20', v: bucket(6, 9) },
    { l: '20–23', v: bucket(9, 12) },
    { l: '23–01', v: 66 },
  ];

  const recent = bookings.slice(0, 5);

  return (
    <div>
      {/* KPI cards */}
      <div className="kpi-grid">
        <div className="glass kpi">
          <span className="kpi-ico">{KPI_ICONS.revenue}</span>
          <div className="kpi-label">Today's Revenue</div>
          <div className="kpi-value">₹{(todayTotal / 1000).toFixed(1)}K</div>
          <div className="kpi-sub"><span className={delta >= 0 ? 'up' : 'down'}>{delta >= 0 ? '▲' : '▼'} {Math.abs(delta)}%</span> vs yesterday</div>
        </div>
        <div className="glass kpi">
          <span className="kpi-ico">{KPI_ICONS.bookings}</span>
          <div className="kpi-label">Active Bookings</div>
          <div className="kpi-value"><CountUp to={a.activeBookings + 14} /></div>
          <div className="kpi-sub"><span className="up">▲ 5</span> in the last hour</div>
        </div>
        <div className="glass kpi">
          <span className="kpi-ico">{KPI_ICONS.tables}</span>
          <div className="kpi-label">Tables Occupied</div>
          <div className="kpi-value">{occupied}/{tables.length}</div>
          <div className="kpi-sub">{tables.length ? Math.round((occupied / tables.length) * 100) : 0}% utilisation</div>
        </div>
        <div className="glass kpi">
          <span className="kpi-ico">{KPI_ICONS.cafe}</span>
          <div className="kpi-label">Café Orders</div>
          <div className="kpi-value"><CountUp to={cafeOrders} /></div>
          <div className="kpi-sub"><span className="down">▼ 2.1%</span> vs avg</div>
        </div>
      </div>

      {/* revenue week + popular */}
      <div className="adm-grid2">
        <div className="glass panel" style={{ marginTop: 0 }}>
          <div className="panel-h">
            <span className="panel-t">Revenue · Last 7 days</span>
            <span className="mono dim" style={{ fontSize: 12 }}>₹{(weekTotal / 100000).toFixed(1)}L total</span>
          </div>
          <WeekBars data={week} />
        </div>
        <div className="glass panel" style={{ marginTop: 0 }}>
          <div className="panel-h"><span className="panel-t">Popular Activities</span></div>
          {a.popular.map((p) => <HBar key={p.label} label={p.label === 'Pool' ? 'American Pool' : p.label === 'PS5 Zone' ? 'PS5 Gaming' : p.label} pct={p.pct} />)}
        </div>
      </div>

      {/* recent bookings + peak hours */}
      <div className="adm-grid2">
        <div className="glass panel" style={{ marginTop: 0 }}>
          <div className="panel-h">
            <span className="panel-t">Recent Bookings</span>
            <button className="adm-link" onClick={onViewAll}>View all</button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="tbl rb-tbl">
              <thead>
                <tr><th>Guest</th><th>Activity</th><th>Time</th><th>Status</th></tr>
              </thead>
              <tbody>
                {recent.map((b) => (
                  <tr key={b.id}>
                    <td><b>{b.customer.split(' ')[0]} {b.customer.split(' ')[1]?.[0] || ''}.</b></td>
                    <td>{ACT_LABEL[b.activity] || b.activity}</td>
                    <td className="mono">{b.slots[0]}</td>
                    <td><span className={`pill ${PILL[b.status]}`}>{b.status[0].toUpperCase() + b.status.slice(1)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="glass panel" style={{ marginTop: 0 }}>
          <div className="panel-h"><span className="panel-t">Peak Hours</span></div>
          {peaks.map((p) => <HBar key={p.l} label={p.l} pct={p.v} />)}
        </div>
      </div>
    </div>
  );
}
