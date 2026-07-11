import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

/* touch devices get no hover-driven effects — they feel broken on a phone */
const CAN_HOVER = typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches;

/* ---------- Scroll reveal: adds .in when element enters viewport ---------- */
export function useRevealObserver(deps = []) {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal:not(.in), .stag:not(.in)');
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('in')),
      { threshold: 0.06, rootMargin: '0px 0px 60px 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/* ---------- Neon scroll progress bar ---------- */
export function ScrollProgress() {
  const ref = useRef(null);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - innerHeight;
      if (ref.current) ref.current.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); if (raf) cancelAnimationFrame(raf); };
  }, []);
  return <div id="scroll-progress" ref={ref} aria-hidden />;
}

/* ---------- Parallax engine + scroll-velocity glitch ---------- */
export function useParallax() {
  const loc = useLocation();
  useEffect(() => {
    let raf = 0;
    let lastY = scrollY, lastT = performance.now(), glitchTimer = 0;
    const update = () => {
      raf = 0;
      // read phase (all rects first), then write phase — avoids layout thrash
      const els = document.querySelectorAll('[data-par]');
      const jobs = [];
      els.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -300 || r.top > innerHeight + 300) return; // offscreen: skip
        const speed = parseFloat(el.dataset.par) || 0.2;
        jobs.push([el, ((r.top + r.height / 2 - innerHeight / 2) * -speed).toFixed(1)]);
      });
      jobs.forEach(([el, v]) => el.style.setProperty('--par', v));
      // fast scroll → RGB-split glitch on headings
      const now = performance.now();
      const v = Math.abs(scrollY - lastY) / Math.max(now - lastT, 1);
      lastY = scrollY; lastT = now;
      if (v > 2.4) {
        document.body.classList.add('scroll-fast');
        clearTimeout(glitchTimer);
        glitchTimer = setTimeout(() => document.body.classList.remove('scroll-fast'), 120);
      }
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => {
      window.removeEventListener('scroll', on); window.removeEventListener('resize', on);
      if (raf) cancelAnimationFrame(raf); clearTimeout(glitchTimer);
      document.body.classList.remove('scroll-fast');
    };
  }, [loc.pathname]);
}

/* ---------- Character-stagger heading (observer adds .in) ---------- */
export function Stagger({ text, className = '' }) {
  return (
    <span className={`stag ${className}`}>
      {[...text].map((c, i) => (
        <span key={i} style={{ '--ci': i }}>{c === ' ' ? ' ' : c}</span>
      ))}
    </span>
  );
}

/* ---------- Scroll-linked outline text band ---------- */
export function OutlineBand({ text, dir = 1, fillWords = [] }) {
  const ref = useRef(null);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.parentElement.getBoundingClientRect();
      const p = (r.top + r.height) / (innerHeight + r.height); // 1 → 0 across viewport
      el.style.transform = `translateX(${(p - 0.5) * dir * 34 - 10}%)`;
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', on, { passive: true });
    return () => { window.removeEventListener('scroll', on); if (raf) cancelAnimationFrame(raf); };
  }, [dir]);
  const words = Array(3).fill(text).join(' · ').split(' ');
  return (
    <div className="band" aria-hidden>
      <div className="band-track" ref={ref}>
        {words.map((w, i) => (
          <span key={i} className={fillWords.some((f) => w.includes(f)) ? 'fill' : ''}>{w} </span>
        ))}
      </div>
    </div>
  );
}

/* ---------- Cursor spotlight ---------- */
export function CursorGlow() {
  const ref = useRef(null);
  useEffect(() => {
    if (!CAN_HOVER) return;
    // transform-only updates: left/top would force layout on every pointermove
    const move = (e) => {
      if (ref.current) {
        ref.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      }
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, []);
  return <div id="cursor-glow" ref={ref} aria-hidden />;
}

/* ---------- Magnetic button ---------- */
export function Magnetic({ children, strength = 22 }) {
  const ref = useRef(null);
  if (!CAN_HOVER) return <span style={{ display: 'inline-block' }}>{children}</span>;
  const onMove = (e) => {
    const el = ref.current;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * strength;
    const y = ((e.clientY - r.top) / r.height - 0.5) * strength;
    el.style.transform = `translate(${x}px, ${y}px)`;
  };
  const onLeave = () => { ref.current.style.transform = 'translate(0,0)'; };
  return (
    <span ref={ref} onPointerMove={onMove} onPointerLeave={onLeave}
      style={{ display: 'inline-block', transition: 'transform .3s cubic-bezier(.2,.8,.2,1)' }}>
      {children}
    </span>
  );
}

/* ---------- 3D tilt card ---------- */
export function TiltCard({ children, className = '', max = 10, style }) {
  const ref = useRef(null);
  if (!CAN_HOVER) return <div className={className} style={style}>{children}</div>;
  const onMove = (e) => {
    const el = ref.current;
    const r = el.getBoundingClientRect();
    const rx = ((e.clientY - r.top) / r.height - 0.5) * -2 * max;
    const ry = ((e.clientX - r.left) / r.width - 0.5) * 2 * max;
    el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
  };
  const onLeave = () => { ref.current.style.transform = 'perspective(900px) rotateX(0) rotateY(0)'; };
  return (
    <div ref={ref} className={className} onPointerMove={onMove} onPointerLeave={onLeave}
      style={{ transition: 'transform .35s cubic-bezier(.2,.8,.2,1)', transformStyle: 'preserve-3d', ...style }}>
      {children}
    </div>
  );
}

/* ---------- Animated counter ---------- */
export function CountUp({ to, prefix = '', suffix = '', duration = 1600 }) {
  const ref = useRef(null);
  const [val, setVal] = useState(0);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const tick = (t) => {
        const p = Math.min((t - t0) / duration, 1);
        setVal(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, [to, duration]);
  return <span ref={ref}>{prefix}{val.toLocaleString('en-IN')}{suffix}</span>;
}

/* ---------- Nav ---------- */
const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/booking', label: 'Book' },
  { to: '/menu', label: 'Menu' },
  { to: '/tournaments', label: 'Tournaments' },
  { to: '/membership', label: 'Membership' },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  useEffect(() => { setOpen(false); window.scrollTo(0, 0); }, [loc.pathname]);

  // lock page scroll behind the mobile menu overlay — and guarantee release:
  // the cleanup runs on every close path (link tap, route change, resize, esc)
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // never leave the menu (and its scroll lock) stuck: close it when the
  // viewport grows past the burger breakpoint (matchMedia AND resize — some
  // environments only fire one of them) or on Escape
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 961px)');
    const closeIfDesktop = () => { if (window.innerWidth > 960) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    mq.addEventListener ? mq.addEventListener('change', closeIfDesktop) : mq.addListener(closeIfDesktop);
    window.addEventListener('resize', closeIfDesktop);
    window.addEventListener('keydown', onKey);
    return () => {
      mq.removeEventListener ? mq.removeEventListener('change', closeIfDesktop) : mq.removeListener(closeIfDesktop);
      window.removeEventListener('resize', closeIfDesktop);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  const close = () => setOpen(false);

  return (
    <header className={`nav ${scrolled ? 'nav-solid' : ''}`}>
      <div className="container nav-inner">
        <Link to="/" className="brand display" onClick={close}>
          <span className="brand-o">O</span>NE<span className="gold">47</span>
          <span className="brand-sub">CLUB &amp; CAFE</span>
        </Link>
        <nav
          className={`nav-links ${open ? 'open' : ''}`}
          onClick={(e) => { if (e.target === e.currentTarget) close(); }}
        >
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'} onClick={close}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              {l.label}
            </NavLink>
          ))}
          <Link to="/booking" className="btn btn-gold nav-cta" onClick={close}>Book Now</Link>
        </nav>
        <button className={`burger ${open ? 'open' : ''}`} onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>
          <span /><span /><span />
        </button>
      </div>
    </header>
  );
}

/* ---------- Footer ---------- */
export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <div className="brand display" style={{ fontSize: 22 }}>
            <span className="brand-o">O</span>NE<span className="gold">47</span>
          </div>
          <p className="dim" style={{ marginTop: 14, maxWidth: 320, fontSize: 14, lineHeight: 1.7 }}>
            Premium snooker, American pool, PS5 gaming and café culture —
            one exceptional space, one seamless digital experience.
          </p>
        </div>
        <div>
          <h4 className="foot-h">Explore</h4>
          {LINKS.map((l) => <Link key={l.to} className="foot-link" to={l.to}>{l.label}</Link>)}
        </div>
        <div>
          <h4 className="foot-h">Visit</h4>
          <p className="foot-link">Mon–Sun · 11:00 — 23:00</p>
          <p className="foot-link">One47 Club &amp; Cafe, MG Road</p>
          <p className="foot-link">+91 98765 00147</p>
          <p className="foot-link">hello@one47.club</p>
        </div>
        <div>
          <h4 className="foot-h">Social</h4>
          {['Instagram', 'YouTube', 'WhatsApp'].map((s) => (
            <a key={s} className="foot-link" href="#" onClick={(e) => e.preventDefault()}>{s} ↗</a>
          ))}
        </div>
      </div>
      <div className="container footer-base">
        <span className="mono dim" style={{ fontSize: 12 }}>© 2026 One47 Club &amp; Cafe — More than a club.</span>
        <span className="mono dim" style={{ fontSize: 12 }}>FOCUS · AIM · PLAY</span>
      </div>
    </footer>
  );
}

/* ---------- Offers marquee ---------- */
export function OffersMarquee() {
  const items = [
    <>HAPPY HOURS <b>2–5 PM</b> · 20% OFF ALL TABLES</>,
    <>STUDENT TUESDAYS · <b>₹99</b> PS5 HOUR</>,
    <>WINTER MASTERS · PRIZE POOL <b>₹25,000</b></>,
    <>ELITE MEMBERS GET <b>3× LOYALTY POINTS</b></>,
    <>SQUAD FRAME COMBO · <b>₹999</b> FOR 4 PLAYERS</>,
  ];
  const track = [...items, ...items];
  return (
    <div className="marquee" aria-hidden>
      <div className="marquee-track">
        {track.map((it, i) => <span key={i}>◆ {it}</span>)}
      </div>
    </div>
  );
}
