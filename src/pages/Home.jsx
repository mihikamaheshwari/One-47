import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useRevealObserver, TiltCard, CountUp, Magnetic, OffersMarquee, OutlineBand, Stagger } from '../components/ui';
import ZoneArt from '../components/ZoneArt';
import { getTournaments, TESTIMONIALS } from '../services/api';

const SnookerScene = lazy(() => import('../three/SnookerScene'));

const clamp01 = (v) => Math.min(1, Math.max(0, v));

export default function Home() {
  const stageRef = useRef(null);
  const canvasWrapRef = useRef(null);
  const introRef = useRef(null);
  const revealRef = useRef(null);
  const ringRef = useRef(null);
  const progressRef = useRef(0);
  const heroActiveRef = useRef(true);
  const [heroActive, setHeroActive] = useState(true);
  const [liveMatches, setLiveMatches] = useState([]);

  useRevealObserver([liveMatches]);

  useEffect(() => {
    getTournaments().then((ts) => {
      const live = [];
      ts.forEach((t) =>
        t.rounds?.forEach((r) =>
          r.matches.forEach((m) => m.live && live.push({ ...m, tournament: t.name, type: t.type, round: r.name }))
        )
      );
      setLiveMatches(live.slice(0, 3));
    });
  }, []);

  /* drive the cinematic from scroll */
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = stageRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      const p = clamp01(-rect.top / Math.max(total, 1));
      progressRef.current = p;

      // pause the WebGL loop entirely once the hero stage is scrolled past
      const stageVisible = rect.bottom > -60;
      if (stageVisible !== heroActiveRef.current) {
        heroActiveRef.current = stageVisible;
        setHeroActive(stageVisible);
      }

      // intro copy fades out early
      if (introRef.current) {
        const k = 1 - clamp01(p / 0.09);
        introRef.current.style.opacity = k;
        introRef.current.style.transform = `translateY(${(1 - k) * -60}px)`;
        introRef.current.style.pointerEvents = k > 0.5 ? 'auto' : 'none';
      }
      // canvas fades as ball fills the frame
      if (canvasWrapRef.current) {
        canvasWrapRef.current.style.opacity = 1 - clamp01((p - 0.88) / 0.09);
      }
      // logo reveal crossfade — the ball becomes the O
      if (revealRef.current) {
        const k = clamp01((p - 0.85) / 0.12);
        revealRef.current.style.opacity = k;
        revealRef.current.style.pointerEvents = k > 0.8 ? 'auto' : 'none';
        if (ringRef.current) {
          const s = 3.4 - 2.4 * (k * k * (3 - 2 * k));
          ringRef.current.style.transform = `scale(${s})`;
        }
      }
      // once fully revealed, keep it pinned-looking while stage runs out
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <main>
      {/* ============ CINEMATIC HERO (pinned 3D stage) ============ */}
      <div className="hero-stage" ref={stageRef}>
        <div className="hero-sticky">
          <div className="hero-canvas" ref={canvasWrapRef}>
            <Suspense fallback={<div className="hero-loading mono">LOADING THE HALL…</div>}>
              <SnookerScene progressRef={progressRef} active={heroActive} />
            </Suspense>
            <div className="hero-vignette" aria-hidden />
          </div>

          {/* intro copy */}
          <div className="hero-intro" ref={introRef}>
            <span className="eyebrow flicker">PLAYER 1 · READY</span>
            <h1 className="display hero-title">
              THE HALL IS <span className="neon-text-pink">ALIVE</span>
            </h1>
            <p className="dim hero-sub">
              Snooker · Pool · PS5 · Café — scroll to take the shot.
            </p>
            <div className="scroll-hint mono">
              <span className="scroll-wheel" /> ▶ SCROLL TO BREAK
            </div>
          </div>

          {/* the ball becomes the O */}
          <div className="hero-reveal" ref={revealRef}>
            <div className="reveal-logo display">
              <span className="o-ring" ref={ringRef} aria-label="O" />
              <span className="reveal-rest">NE<span className="gold">47</span></span>
            </div>
            <div className="reveal-tag mono">CLUB &amp; CAFE — MORE THAN A CLUB</div>
            <p className="reveal-copy dim">
              Live table availability. Instant bookings. Café combos, tournaments
              and a loyalty engine — one seamless digital experience.
            </p>
            <div className="reveal-ctas">
              <Magnetic><Link to="/booking" className="btn btn-gold">Book a Table</Link></Magnetic>
              <Magnetic><Link to="/tournaments" className="btn btn-ghost">Live Tournaments</Link></Magnetic>
            </div>
          </div>
        </div>
      </div>

      <OffersMarquee />

      {/* ============ THE DESTINATION ============ */}
      <section className="block">
        <div className="orb orb-pink" style={{ width: 380, height: 380, top: -80, right: '-6%' }} data-par="0.25" />
        <div className="orb orb-violet" style={{ width: 300, height: 300, bottom: -60, left: '-4%' }} data-par="-0.2" />
        <div className="container">
          <div className="reveal rv-blur">
            <span className="eyebrow">The Destination</span>
            <h2 className="h-section"><Stagger text="One roof." /><br /><span className="accent">Four worlds.</span></h2>
          </div>
          <div className="grid-4">
            {[
              { art: 'snooker', t: 'Snooker & Pool', d: '3 championship snooker tables + American pool under tournament lighting.', to: '/booking', xp: 72, players: '2–4P' },
              { art: 'ps5', t: 'PS5 Gaming Zone', d: 'Next-gen pods with 4K OLED screens and racing rigs.', to: '/booking', xp: 58, players: '1–4P' },
              { art: 'cafe', t: 'Café & Dining', d: 'Signature cold brews, wood-fired pizza and combo deals.', to: '/menu', xp: 64, players: 'ALL' },
              { art: 'indoor', t: 'Indoor Games', d: 'Chess, carrom, darts and board-game lounge nights.', to: '/booking', xp: 45, players: '2–8P' },
            ].map((c, i) => (
              <TiltCard key={c.t} className={`glass glass-hover hud act-card reveal rv-scale reveal-d${i}`}>
                <Link to={c.to}>
                  <div className="act-img">
                    <ZoneArt kind={c.art} />
                    <span className="act-lvl">ZONE 0{i + 1} · {c.players}</span>
                  </div>
                  <div className="act-body">
                    <h3 className="display act-t">{c.t}</h3>
                    <p className="dim act-d">{c.d}</p>
                    <span className="mono act-link">ENTER ZONE →</span>
                    <div className="act-xp">
                      <div className="xp-top"><span>POPULARITY</span><span>{c.xp}%</span></div>
                      <div className="xp-track"><span className="xp-fill" style={{ width: `${c.xp}%` }} /></div>
                    </div>
                  </div>
                </Link>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* ============ STATS ============ */}
      <section className="stats-band">
        <div className="container stats-grid">
          {[
            { n: 147, suffix: '', label: 'The perfect break' },
            { n: 7, suffix: '', label: 'Tables & gaming pods' },
            { n: 2800, suffix: '+', label: 'Frames played monthly' },
            { n: 96, suffix: '%', label: 'Guests who return' },
          ].map((s, i) => (
            <div key={s.label} className={`stat reveal reveal-d${i}`}>
              <div className="stat-n display"><CountUp to={s.n} suffix={s.suffix} /></div>
              <div className="stat-l mono dim">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <OutlineBand text="PLAY · WIN · REPEAT" fillWords={['WIN']} dir={1} />

      {/* ============ KEY FEATURES ============ */}
      <section className="block">
        <div className="orb orb-cyan" style={{ width: 320, height: 320, top: '20%', left: '-8%' }} data-par="0.3" />
        <div className="container">
          <div className="reveal rv-blur">
            <span className="eyebrow">Zero Friction</span>
            <h2 className="h-section"><Stagger text="From craving to cue" /><br /><span className="accent">in three taps.</span></h2>
          </div>
          <div className="grid-3">
            {[
              { n: '01', sys: 'SYS://TABLES.LIVE', t: 'Live Table Status', d: 'Real-time availability for snooker, pool and gaming pods. See exactly what’s free before you leave home.', rv: 'rv-left' },
              { n: '02', sys: 'SYS://PRICE.LOCK', t: 'Transparent Pricing', d: 'Hourly rates up front, member discounts applied automatically. No hidden fees, ever.', rv: 'rv-scale' },
              { n: '03', sys: 'SYS://WA.CONFIRM', t: 'WhatsApp Confirmation', d: 'Book, pay, and get an instant WhatsApp confirmation with your table and time.', rv: 'rv-right' },
            ].map((f, i) => (
              <div key={f.n} className={`glass glass-hover hud feat-card reveal ${f.rv} reveal-d${i}`}>
                <span className="feat-scan" aria-hidden />
                <div className="feat-n" aria-hidden>{f.n}</div>
                <div className="feat-sys">{f.sys}</div>
                <h3 className="display feat-t">{f.t}</h3>
                <p className="dim feat-d">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ JOURNEY ============ */}
      <section className="block journey-block">
        <div className="orb orb-violet" style={{ width: 420, height: 420, top: '-10%', right: '-10%' }} data-par="-0.25" />
        <div className="container">
          <div className="reveal rv-blur">
            <span className="eyebrow">The Experience</span>
            <h2 className="h-section"><Stagger text="One seamless" /> <span className="accent">journey.</span></h2>
          </div>
          <div className="journey reveal rv-tilt">
            {['Discover', 'Book', 'Order', 'Pay', 'Confirm', 'Enjoy', 'Return'].map((s, i) => (
              <div className="j-step" key={s}>
                <div className="j-dot mono">{i + 1}</div>
                <div className="j-name display">{s}</div>
                <div className="j-sub mono dim">
                  {['Website & social', 'Activity & slot', 'Food & drinks', 'Online payment', 'WhatsApp alert', 'Visit & play', 'Loyalty rewards'][i]}
                </div>
              </div>
            ))}
            <div className="j-line" aria-hidden />
          </div>
        </div>
      </section>

      {/* ============ LIVE NOW ============ */}
      {liveMatches.length > 0 && (
        <section className="block live-block">
          <div className="container">
            <div className="reveal" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 18 }}>
              <div>
                <span className="eyebrow"><span className="dot dot-live" style={{ display: 'inline-block' }} /> Happening Now</span>
                <h2 className="h-section">Live at the <span className="accent">tables.</span></h2>
              </div>
              <Link to="/tournaments" className="btn btn-ghost">Full Brackets →</Link>
            </div>
            <div className="grid-3">
              {liveMatches.map((m, i) => (
                <div key={m.id + m.tournament} className={`glass hud live-card reveal reveal-d${i}`}>
                  <div className="live-head">
                    <span className="chip"><span className="dot dot-live" /> LIVE · {m.round}</span>
                    <span className="mono dim" style={{ fontSize: 11 }}>{m.type}</span>
                  </div>
                  <div className="live-vs">
                    <span className="live-p display">{m.p1}</span>
                    <span className="live-score mono">{m.s1} : {m.s2}</span>
                    <span className="live-p display" style={{ textAlign: 'right' }}>{m.p2}</span>
                  </div>
                  <div className="mono dim" style={{ fontSize: 11, letterSpacing: '.15em' }}>{m.tournament}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ MEMBERSHIP TEASER ============ */}
      <section className="block">
        <div className="orb orb-pink" style={{ width: 360, height: 360, bottom: '-15%', right: '10%' }} data-par="0.2" />
        <div className="container member-teaser glass grad-border reveal rv-left">
          <div>
            <span className="eyebrow">Membership</span>
            <h2 className="h-section">Go <span className="accent">Gold.</span> Or go Elite.</h2>
            <p className="dim" style={{ maxWidth: 460, lineHeight: 1.8 }}>
              Up to 15% off every booking, VIP tournament access, private events and
              3× loyalty points. From ₹499/month.
            </p>
            <div style={{ marginTop: 28 }}>
              <Magnetic><Link to="/membership" className="btn btn-neon">Compare Tiers</Link></Magnetic>
            </div>
          </div>
          <div className="member-badges" data-par="-0.15">
            {['SILVER', 'GOLD', 'ELITE'].map((t, i) => (
              <div key={t} className={`badge-coin display floaty`} style={{ animationDelay: `${i * 0.8}s` }}>{t[0]}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="block">
        <div className="orb orb-cyan" style={{ width: 280, height: 280, top: '30%', right: '-6%' }} data-par="0.35" />
        <div className="container">
          <div className="reveal rv-blur">
            <span className="eyebrow">Word on the Felt</span>
            <h2 className="h-section">Players <span className="accent">talk.</span></h2>
          </div>
          <div className="grid-3">
            {TESTIMONIALS.map((t, i) => (
              <div key={t.name} className={`glass glass-hover hud quote-card reveal rv-scale reveal-d${i}`}>
                <div className="q-head">
                  <span className="q-hex">{t.name[0]}</span>
                  <span className="q-meta">
                    <span className="q-log">PLAYER LOG // #{1047 + i * 33}</span>
                    <span className="display" style={{ fontSize: 14 }}>{t.name}</span>
                  </span>
                </div>
                <p className="quote-text">{t.text}</p>
                <div className="quote-who">
                  <span className="mono dim" style={{ fontSize: 11 }}>{t.role}</span>
                  <span className="q-verified">VERIFIED VISIT</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <OutlineBand text="FOCUS · AIM · PLAY" fillWords={['AIM']} dir={-1} />

      {/* ============ FINAL CTA ============ */}
      <section className="block final-cta">
        <div className="orb orb-pink" style={{ width: 460, height: 460, top: '10%', left: '50%', marginLeft: -230 }} data-par="0.15" />
        <div className="container" style={{ textAlign: 'center', position: 'relative' }}>
          <h2 className="display final-line reveal rv-scale">
            FOCUS. <span className="neon-text-cyan">AIM.</span> <span className="neon-text-pink">PLAY.</span>
          </h2>
          <p className="dim reveal reveal-d1" style={{ margin: '18px auto 34px', maxWidth: 420 }}>
            Your table is waiting. Book in under a minute and get instant confirmation.
          </p>
          <div className="reveal reveal-d2">
            <Magnetic strength={30}><Link to="/booking" className="btn btn-gold" style={{ padding: '20px 48px', fontSize: 15 }}>Book Now</Link></Magnetic>
          </div>
        </div>
      </section>
    </main>
  );
}
