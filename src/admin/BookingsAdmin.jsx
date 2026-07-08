import { useEffect, useState } from 'react';
import { getBookings, setBookingStatus, getTables } from '../services/api';

const PILL = { confirmed: 'pill-green', pending: 'pill-gold', cancelled: 'pill-pink' };

export default function BookingsAdmin() {
  const [bookings, setBookings] = useState([]);
  const [tables, setTables] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    getBookings().then(setBookings);
    getTables().then(setTables);
  }, []);

  const tableName = (id) => tables.find((t) => t.id === id)?.name.split('—')[0] || id;
  const shown = bookings.filter((b) => filter === 'all' || b.status === filter);

  const setStatus = async (id, status) => setBookings(await setBookingStatus(id, status));

  return (
    <div className="glass panel" style={{ marginTop: 0 }}>
      <div className="panel-h">
        <span className="panel-t">Bookings ({shown.length})</span>
        <div className="tabs">
          {['all', 'confirmed', 'pending', 'cancelled'].map((f) => (
            <button key={f} className={`tab ${filter === f ? 'active' : ''}`} style={{ padding: '8px 16px', fontSize: 10 }}
              onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>ID</th><th>Customer</th><th>Table</th><th>Date · Slots</th>
              <th>Café Items</th><th>Total</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((b) => (
              <tr key={b.id}>
                <td className="mono" style={{ color: 'var(--neon-cyan)' }}>{b.id.toUpperCase()}</td>
                <td>
                  <b>{b.customer}</b>
                  <span className="dim" style={{ display: 'block', fontSize: 12 }}>{b.phone}</span>
                </td>
                <td>{tableName(b.tableId)}</td>
                <td className="mono" style={{ fontSize: 12 }}>{b.date}<span className="dim" style={{ display: 'block' }}>{b.slots.join(', ')}</span></td>
                <td style={{ fontSize: 12, maxWidth: 180 }}>{b.items.length ? b.items.join(', ') : <span className="dim">—</span>}</td>
                <td className="mono gold">₹{b.total}</td>
                <td><span className={`pill ${PILL[b.status]}`}>{b.status}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {b.status !== 'confirmed' && <button className="mini-btn" onClick={() => setStatus(b.id, 'confirmed')}>✓</button>}
                    {b.status !== 'cancelled' && <button className="mini-btn danger" onClick={() => setStatus(b.id, 'cancelled')}>✕</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
