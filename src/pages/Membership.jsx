import { useEffect, useState } from 'react';
import { useRevealObserver, TiltCard, Magnetic } from '../components/ui';
import { getTiers, addMember } from '../services/api';

export default function Membership() {
  const [tiers, setTiers] = useState([]);
  const [yearly, setYearly] = useState(false);
  const [joining, setJoining] = useState(null);
  const [name, setName] = useState('');
  const [done, setDone] = useState(null);

  useEffect(() => { getTiers().then(setTiers); }, []);
  useRevealObserver([tiers]);

  const join = async () => {
    if (!name.trim()) return;
    await addMember({ name: name.trim(), tier: joining.id });
    setDone({ tier: joining.name, name: name.trim() });
    setJoining(null); setName('');
  };

  return (
    <main className="page">
      <div className="container">
        <div className="page-head reveal in" style={{ textAlign: 'center' }}>
          <span className="eyebrow" style={{ justifyContent: 'center' }}>Membership</span>
          <h1 className="h-section">Three tiers. <span className="accent">Infinite frames.</span></h1>
          <div style={{ marginTop: 22 }}>
            <div className="billing-toggle">
              <button className={!yearly ? 'on' : ''} onClick={() => setYearly(false)}>MONTHLY</button>
              <button className={yearly ? 'on' : ''} onClick={() => setYearly(true)}>YEARLY · SAVE ~17%</button>
            </div>
          </div>
        </div>

        <div className="tier-grid">
          {tiers.map((t, i) => (
            <TiltCard key={t.id} max={6} className={`glass hud tier-card tier-${t.id} ${t.featured ? 'featured' : ''} reveal rv-scale reveal-d${i}`}>
              <span className="rarity">{{ silver: 'RARE', gold: 'EPIC', elite: 'LEGENDARY' }[t.id]}</span>
              <div className="tier-name display" style={{ color: t.id === 'elite' ? 'var(--neon-cyan)' : t.id === 'gold' ? 'var(--violet)' : '#9fd0ff' }}>
                {t.name.toUpperCase()}
              </div>
              <div className="tier-price">
                ₹{(yearly ? t.yearly : t.monthly).toLocaleString('en-IN')}
                <small> /{yearly ? 'year' : 'month'}</small>
              </div>
              <div className="pill pill-cyan" style={{ alignSelf: 'flex-start' }}>{t.discount}% OFF ALL BOOKINGS</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, margin: '10px 0 18px' }}>
                {t.perks.map((p) => <div key={p} className="tier-perk">{p}</div>)}
              </div>
              <Magnetic>
                <button
                  className={`btn ${t.featured ? 'btn-gold' : 'btn-ghost'}`}
                  style={{ width: '100%' }}
                  onClick={() => setJoining(t)}
                >
                  Join {t.name}
                </button>
              </Magnetic>
            </TiltCard>
          ))}
        </div>

        <p className="mono dim reveal" style={{ textAlign: 'center', fontSize: 11, letterSpacing: '.2em', marginTop: 44 }}>
          MEMBER PERKS APPLY AUTOMATICALLY AT CHECKOUT · CANCEL ANYTIME
        </p>
      </div>

      {joining && (
        <div className="modal-back" onClick={() => setJoining(null)}>
          <div className="glass" style={{ width: 'min(420px, 94vw)', padding: 34 }} onClick={(e) => e.stopPropagation()}>
            <h3 className="display" style={{ fontSize: 20 }}>Join {joining.name}</h3>
            <p className="dim" style={{ fontSize: 14, margin: '10px 0 22px' }}>
              ₹{(yearly ? joining.yearly : joining.monthly).toLocaleString('en-IN')} / {yearly ? 'year' : 'month'} — dummy signup, payment comes with the backend.
            </p>
            <div className="field">
              <label>Full name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoFocus />
            </div>
            <button className="btn btn-gold" style={{ width: '100%', marginTop: 20 }} onClick={join} disabled={!name.trim()}>
              Activate Membership
            </button>
          </div>
        </div>
      )}

      {done && (
        <div className="modal-back" onClick={() => setDone(null)}>
          <div className="glass" style={{ width: 'min(420px, 94vw)', padding: 40, textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div className="badge-coin display" style={{ margin: '0 auto 22px' }}>{done.tier[0]}</div>
            <h3 className="display" style={{ fontSize: 22 }}>Welcome, {done.name}!</h3>
            <p className="dim" style={{ margin: '12px 0 24px' }}>
              Your <b className="gold">{done.tier}</b> membership is active. Your discounts and loyalty
              multiplier now apply to every booking.
            </p>
            <button className="btn btn-ghost" onClick={() => setDone(null)}>Let’s Play</button>
          </div>
        </div>
      )}
    </main>
  );
}
