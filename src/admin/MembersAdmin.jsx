import { useEffect, useState } from 'react';
import { getMembers } from '../services/api';

const TIER_PILL = { elite: 'pill-pink', gold: 'pill-gold', silver: 'pill-cyan' };

export default function MembersAdmin() {
  const [members, setMembers] = useState([]);
  useEffect(() => { getMembers().then(setMembers); }, []);

  const totalPoints = members.reduce((s, m) => s + m.points, 0);
  const mrr = members.reduce((s, m) => s + ({ silver: 499, gold: 799, elite: 1299 }[m.tier] || 0), 0);

  return (
    <div>
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="glass kpi" style={{ '--kc': 'rgba(77,163,255,.16)' }}>
          <div className="kpi-label">Members</div>
          <div className="kpi-value gold">{members.length}</div>
          <div className="kpi-sub">across all tiers</div>
        </div>
        <div className="glass kpi" style={{ '--kc': 'rgba(25,201,116,.14)' }}>
          <div className="kpi-label">Est. Monthly Recurring</div>
          <div className="kpi-value" style={{ color: 'var(--felt-bright)' }}>₹{mrr.toLocaleString('en-IN')}</div>
          <div className="kpi-sub">from active subscriptions</div>
        </div>
        <div className="glass kpi" style={{ '--kc': 'rgba(61,139,255,.14)' }}>
          <div className="kpi-label">Loyalty Points Issued</div>
          <div className="kpi-value" style={{ color: 'var(--neon-pink)' }}>{totalPoints.toLocaleString('en-IN')}</div>
          <div className="kpi-sub">redeemable on bookings &amp; café</div>
        </div>
      </div>

      <div className="glass panel">
        <div className="panel-h"><span className="panel-t">Member Directory</span></div>
        <div style={{ overflowX: 'auto' }}>
          <table className="tbl">
            <thead><tr><th>Member</th><th>Tier</th><th>Joined</th><th>Visits</th><th>Points</th></tr></thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id}>
                  <td><b>{m.name}</b></td>
                  <td><span className={`pill ${TIER_PILL[m.tier]}`}>{m.tier}</span></td>
                  <td className="mono" style={{ fontSize: 12 }}>{m.joined}</td>
                  <td className="mono">{m.visits}</td>
                  <td className="mono gold">{m.points.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
