import { useEffect, useRef, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Nav, Footer, CursorGlow, ScrollProgress, useParallax } from './components/ui';
import Home from './pages/Home';
import Booking from './pages/Booking';
import Menu from './pages/Menu';
import Tournaments from './pages/Tournaments';
import Membership from './pages/Membership';
import Admin from './pages/Admin';

/* Cue-ball wipe on route change */
function PageWipe() {
  const loc = useLocation();
  const [animating, setAnimating] = useState(false);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    setAnimating(true);
    const t = setTimeout(() => setAnimating(false), 950);
    return () => clearTimeout(t);
  }, [loc.pathname]);
  return (
    <div className={`page-wipe ${animating ? 'animating' : ''}`} aria-hidden>
      <div className="wipe-ball" />
    </div>
  );
}

export default function App() {
  const loc = useLocation();
  const isAdmin = loc.pathname.startsWith('/admin');
  useParallax();
  return (
    <>
      {!isAdmin && <div className="ambient" aria-hidden />}
      {!isAdmin && <div id="grid-floor" aria-hidden />}
      <div id="scanlines" aria-hidden />
      {!isAdmin && <ScrollProgress />}
      <CursorGlow />
      <PageWipe />
      {!isAdmin && <Nav />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/tournaments" element={<Tournaments />} />
        <Route path="/membership" element={<Membership />} />
        <Route path="/admin/*" element={<Admin />} />
      </Routes>
      {!isAdmin && <Footer />}
    </>
  );
}
