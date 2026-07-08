import { useEffect, useState } from 'react';
import { getTournaments, saveTournament, deleteTournament, updateMatch, generateBracket } from '../services/api';
import { Bracket } from '../pages/Tournaments';

const EMPTY = { name: '', type: 'Snooker', format: 'Knockout · Best of 5', startDate: '', entryFee: 300, prizePool: 10000, players: '' };

export default function TournamentManager() {
  const [list, setList] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [draft, setDraft] = useState(EMPTY);
  const [creating, setCreating] = useState(false);

  useEffect(() => { getTournaments().then((t) => { setList(t); setOpenId(t[0]?.id); }); }, []);

  const open = list.find((t) => t.id === openId);
  const set = (k) => (e) => setDraft({ ...draft, [k]: e.target.value });

  const create = async () => {
    const players = draft.players.split(/[,\n]/).map((p) => p.trim()).filter(Boolean);
    if (!draft.name.trim() || players.length < 2) return;
    const t = {
      ...draft,
      entryFee: Number(draft.entryFee) || 0,
      prizePool: Number(draft.prizePool) || 0,
      startDate: draft.startDate || new Date().toISOString().slice(0, 10),
      status: 'upcoming',
      players,
      rounds: generateBracket(players),
    };
    const next = await saveTournament(t);
    setList(next); setOpenId(next[0].id);
    setDraft(EMPTY); setCreating(false);
  };

  const patchMatch = async (ri, mi, patch) => {
    setList(await updateMatch(open.id, ri, mi, patch));
  };

  const setStatus = async (status) => setList(await saveTournament({ ...open, status }));
  const remove = async () => {
    const next = await deleteTournament(open.id);
    setList(next); setOpenId(next[0]?.id || null);
  };

  return (
    <div>
      {/* selector + create */}
      <div className="glass panel" style={{ marginTop: 0 }}>
        <div className="panel-h">
          <span className="panel-t">Tournaments</span>
          <button className="btn btn-neon" style={{ padding: '10px 20px', fontSize: 11 }} onClick={() => setCreating(!creating)}>
            {creating ? 'Close' : '+ New Tournament'}
          </button>
        </div>
        <div className="tabs">
          {list.map((t) => (
            <button key={t.id} className={`tab ${openId === t.id ? 'active' : ''}`} onClick={() => setOpenId(t.id)}>
              {t.name}
            </button>
          ))}
        </div>

        {creating && (
          <div style={{ marginTop: 24, borderTop: '1px solid var(--stroke)', paddingTop: 24 }}>
            <div className="form-grid">
              <div className="field"><label>Name</label><input value={draft.name} onChange={set('name')} placeholder="Monsoon Masters" /></div>
              <div className="field"><label>Type</label>
                <select value={draft.type} onChange={set('type')}>
                  {['Snooker', 'Pool', 'PS5', 'Mixed'].map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="field"><label>Format</label><input value={draft.format} onChange={set('format')} /></div>
              <div className="field"><label>Start date</label><input type="date" value={draft.startDate} onChange={set('startDate')} /></div>
              <div className="field"><label>Entry fee (₹)</label><input type="number" value={draft.entryFee} onChange={set('entryFee')} /></div>
              <div className="field"><label>Prize pool (₹)</label><input type="number" value={draft.prizePool} onChange={set('prizePool')} /></div>
              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <label>Players (comma or newline separated — bracket auto-generates)</label>
                <textarea rows={3} value={draft.players} onChange={set('players')} placeholder="Arjun, Vikram, Rahul, Dev, Sameer, Karan, Aditya, Manish" />
              </div>
            </div>
            <button className="btn btn-gold" style={{ marginTop: 18 }} onClick={create}>Generate Bracket &amp; Create</button>
          </div>
        )}
      </div>

      {/* manage open tournament */}
      {open && (
        <div className="glass panel">
          <div className="panel-h">
            <div>
              <span className="panel-t">{open.name}</span>
              <span className="dim mono" style={{ display: 'block', fontSize: 11, marginTop: 6 }}>
                {open.type} · {open.format} · Prize ₹{open.prizePool.toLocaleString('en-IN')}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              {['upcoming', 'live', 'completed'].map((s) => (
                <button key={s} className={`mini-btn ${open.status === s ? 'gold' : ''}`} onClick={() => setStatus(s)}>{s}</button>
              ))}
              <button className="mini-btn danger" onClick={remove}>delete</button>
            </div>
          </div>

          {/* score control per round */}
          {open.rounds.map((r, ri) => (
            <div key={r.name} style={{ marginTop: 18 }}>
              <div className="mono" style={{ fontSize: 11, letterSpacing: '.3em', color: 'var(--neon-cyan)', marginBottom: 10 }}>
                {r.name.toUpperCase()}
              </div>
              {r.matches.map((m, mi) => (
                <div key={m.id} className="glass" style={{ padding: '14px 18px', marginBottom: 10, display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
                    <b style={{ minWidth: 120 }}>{m.p1 || 'TBD'}</b>
                    <div className="score-ctl">
                      <button onClick={() => m.p1 && patchMatch(ri, mi, { s1: Math.max(0, m.s1 - 1) })}>−</button>
                      <span className="v">{m.s1}</span>
                      <button onClick={() => m.p1 && patchMatch(ri, mi, { s1: m.s1 + 1 })}>+</button>
                    </div>
                    <span className="dim mono">vs</span>
                    <div className="score-ctl">
                      <button onClick={() => m.p2 && patchMatch(ri, mi, { s2: Math.max(0, m.s2 - 1) })}>−</button>
                      <span className="v">{m.s2}</span>
                      <button onClick={() => m.p2 && patchMatch(ri, mi, { s2: m.s2 + 1 })}>+</button>
                    </div>
                    <b style={{ minWidth: 120 }}>{m.p2 || 'TBD'}</b>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {m.winner ? (
                      <span className="pill pill-gold">🏆 {m.winner === 'p1' ? m.p1 : m.p2}</span>
                    ) : (
                      <>
                        <button className={`mini-btn ${m.live ? 'gold' : ''}`}
                          onClick={() => patchMatch(ri, mi, { live: !m.live })}>
                          {m.live ? '● live' : 'go live'}
                        </button>
                        {m.p1 && <button className="mini-btn" onClick={() => patchMatch(ri, mi, { winner: 'p1' })}>win: {m.p1.split(' ')[0]}</button>}
                        {m.p2 && <button className="mini-btn" onClick={() => patchMatch(ri, mi, { winner: 'p2' })}>win: {m.p2.split(' ')[0]}</button>}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}

          {/* live preview */}
          <div style={{ marginTop: 26, borderTop: '1px solid var(--stroke)', paddingTop: 8 }}>
            <div className="mono dim" style={{ fontSize: 10, letterSpacing: '.24em', marginTop: 14 }}>PUBLIC BRACKET PREVIEW</div>
            <Bracket rounds={open.rounds} />
          </div>
        </div>
      )}
    </div>
  );
}
