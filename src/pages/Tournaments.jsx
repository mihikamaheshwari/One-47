import { useEffect, useState } from 'react';
import { useRevealObserver } from '../components/ui';
import { getTournaments, getLeaderboard } from '../services/api';

const STATUS_PILL = { live: 'pill-pink', upcoming: 'pill-cyan', completed: 'pill-green' };

export function Bracket({ rounds }) {
  if (!rounds?.length) {
    return <p className="dim mono" style={{ fontSize: 12, letterSpacing: '.15em', padding: '20px 0' }}>
      BRACKET GENERATES AUTOMATICALLY WHEN REGISTRATION CLOSES
    </p>;
  }
  return (
    <div className="bracket-wrap">
      <div className="bracket">
        {rounds.map((r) => (
          <div className="b-round" key={r.name}>
            <div className="b-round-name">{r.name}</div>
            {r.matches.map((m) => (
              <div key={m.id} className={`glass b-match ${m.live ? 'live-m' : ''}`}>
                {m.live && <span className="chip b-live-tag" style={{ background: 'var(--bg-2)' }}><span className="dot dot-live" /> LIVE</span>}
                <div className={`b-p ${m.winner === 'p1' ? 'winner' : ''}`}>
                  <span className="name">{m.p1 || 'TBD'}</span>
                  <span className="score">{m.p1 ? m.s1 : '–'}</span>
                </div>
                <div className={`b-p ${m.winner === 'p2' ? 'winner' : ''}`}>
                  <span className="name">{m.p2 || 'TBD'}</span>
                  <span className="score">{m.p2 ? m.s2 : '–'}</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Tournaments() {
  const [tournaments, setTournaments] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    getTournaments().then((ts) => {
      setTournaments(ts);
      setOpenId(ts.find((t) => t.status === 'live')?.id || ts[0]?.id);
    });
    getLeaderboard().then(setLeaderboard);
  }, []);
  useRevealObserver([tournaments, leaderboard]);

  const open = tournaments.find((t) => t.id === openId);

  return (
    <main className="page">
      <div className="container">
        <div className="page-head reveal in">
          <span className="eyebrow">Compete</span>
          <h1 className="h-section">Tournaments &amp; <span className="accent">glory.</span></h1>
          <p className="dim" style={{ maxWidth: 560, lineHeight: 1.8 }}>
            Automated brackets, live scores, instant payouts. Register online — the
            system pairs players and advances winners in real time.
          </p>
        </div>

        {/* tournament match-poster cards */}
        <div className="tr-list">
          {tournaments.map((t, i) => {
            const liveMatch = t.rounds?.flatMap((r) => r.matches).find((m) => m.live);
            const openRegistration = t.players.length === 1 && t.players[0] === 'Open Registration';
            return (
              <div key={t.id}
                className={`glass hud tr-card reveal ${i % 2 ? 'rv-right' : 'rv-left'} reveal-d${i % 2} ${openId === t.id ? 'open' : ''} ${t.status === 'live' ? 'live-t' : ''}`}
                onClick={() => setOpenId(t.id)}>
                <span className="tr-vs display" aria-hidden>VS</span>
                <div className="tr-top">
                  <div>
                    <div className="tr-name display">{t.name}</div>
                    <div className="mono dim" style={{ fontSize: 11, letterSpacing: '.16em', marginTop: 8 }}>
                      {t.type.toUpperCase()} · {t.format}
                    </div>
                  </div>
                  <span className={`pill ${STATUS_PILL[t.status]}`}>
                    {t.status === 'live' ? '● LIVE' : t.status.toUpperCase()}
                  </span>
                </div>

                <div className="tr-prize">
                  <span className="tr-prize-n display">₹{t.prizePool.toLocaleString('en-IN')}</span>
                  <span className="mono dim tr-prize-l">PRIZE POOL · ENTRY ₹{t.entryFee}</span>
                </div>

                {liveMatch && (
                  <div className="tr-live-strip">
                    <span className="dot dot-live" />
                    <span className="tls-p">{liveMatch.p1}</span>
                    <span className="tls-s mono">{liveMatch.s1} : {liveMatch.s2}</span>
                    <span className="tls-p" style={{ textAlign: 'right' }}>{liveMatch.p2}</span>
                  </div>
                )}

                <div className="tr-foot">
                  <span className="chip">{t.startDate}</span>
                  <div className="tr-avatars">
                    {openRegistration ? (
                      <span className="mono dim" style={{ fontSize: 11, letterSpacing: '.14em' }}>OPEN REGISTRATION</span>
                    ) : (
                      <>
                        {t.players.slice(0, 4).map((p) => (
                          <span key={p} className="tr-av" title={p}>{p.split(' ').map((w) => w[0]).join('')}</span>
                        ))}
                        {t.players.length > 4 && <span className="tr-av more">+{t.players.length - 4}</span>}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* open tournament: bracket */}
        {open && (
          <section style={{ marginTop: 70 }}>
            <div className="reveal in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <span className="eyebrow">{open.status === 'live' ? 'Live Bracket' : 'Bracket'}</span>
                <h2 className="h-section" style={{ fontSize: 'clamp(22px,3vw,36px)' }}>{open.name}</h2>
              </div>
              {open.highBreak && (
                <div className="chip" style={{ padding: '10px 18px' }}>
                  🏆 HIGH BREAK — <b className="gold">{open.highBreak.player} · {open.highBreak.score}</b>
                </div>
              )}
            </div>
            <Bracket rounds={open.rounds} />
            {open.status === 'upcoming' && (
              <button className="btn btn-neon" onClick={(e) => { e.preventDefault(); alert('Registration recorded (dummy). You will get a WhatsApp confirmation when the backend goes live.'); }}>
                Register — ₹{open.entryFee}
              </button>
            )}
          </section>
        )}

        {/* leaderboard */}
        <section style={{ marginTop: 80 }}>
          <div className="reveal">
            <span className="eyebrow">Season Rankings</span>
            <h2 className="h-section">The <span className="accent">leaderboard.</span></h2>
          </div>
          <div style={{ marginTop: 30 }}>
            <div className="lb-row" style={{ border: 'none' }}>
              <span className="mono dim" style={{ fontSize: 10, letterSpacing: '.2em' }}>RANK</span>
              <span className="mono dim" style={{ fontSize: 10, letterSpacing: '.2em' }}>PLAYER</span>
              <span className="mono dim" style={{ fontSize: 10, letterSpacing: '.2em' }}>POINTS</span>
              <span className="mono dim lb-hide-m" style={{ fontSize: 10, letterSpacing: '.2em' }}>WINS</span>
              <span className="mono dim" style={{ fontSize: 10, letterSpacing: '.2em' }}>TIER</span>
            </div>
            {leaderboard.map((r, i) => (
              <div key={r.rank} className={`glass lb-row reveal rv-left reveal-d${i % 4}`}>
                <span className="lb-rank">#{r.rank}</span>
                <span style={{ fontWeight: 600 }}>{r.player}</span>
                <span className="mono gold">{r.points.toLocaleString('en-IN')}</span>
                <span className="mono lb-hide-m">{r.wins}</span>
                <span className="dim mono" style={{ fontSize: 12 }}>{r.tier}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
