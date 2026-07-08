import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useRevealObserver } from '../components/ui';
import { getMenu, setPendingCart } from '../services/api';

export default function Menu() {
  const [menu, setMenu] = useState([]);
  const [cat, setCat] = useState('All');
  const [cart, setCart] = useState([]);

  useEffect(() => { getMenu().then(setMenu); }, []);
  useRevealObserver([menu, cat]);

  const cats = useMemo(() => ['All', ...new Set(menu.map((m) => m.category))], [menu]);
  const items = menu.filter((m) => m.available && (cat === 'All' || m.category === cat));
  const total = cart.reduce((s, c) => s + c.price, 0);

  const add = (item) => setCart((c) => [...c, item]);
  const clear = () => { setCart([]); setPendingCart([]); };
  // hand the cart to the booking page
  const attach = () => setPendingCart(cart.map(({ id, name, price }) => ({ id, name, price })));

  return (
    <main className="page">
      <div className="container">
        <div className="page-head reveal in">
          <span className="eyebrow">Café &amp; Dining</span>
          <h1 className="h-section">The digital <span className="accent">menu.</span></h1>
          <p className="dim" style={{ maxWidth: 520, lineHeight: 1.8 }}>
            Order from your table or pre-order with a booking — food arrives when you do.
          </p>
        </div>

        <div className="menu-cats">
          {cats.map((c) => (
            <button key={c} className={`tab ${cat === c ? 'active' : ''}`} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>

        <div className="menu-grid">
          {items.map((item, i) => (
            <div key={item.id} className={`glass hud menu-item reveal ${i % 2 ? 'rv-right' : 'rv-left'} reveal-d${i % 4}`}>
              <div className="mi-main">
                <div className="mi-row">
                  <span className="mi-idx mono">{String(i + 1).padStart(2, '0')}</span>
                  <span className="mi-name">{item.name}</span>
                  <span className="mi-dots" aria-hidden />
                  <span className="mi-price mono">₹{item.price}</span>
                </div>
                <p className="mi-desc dim">{item.desc}</p>
                <div className="mi-foot">
                  <span className="mi-cat mono">{item.category.toUpperCase()}</span>
                  {item.tag && <span className="mi-tag">{item.tag}</span>}
                  <button className="mi-add" onClick={() => add(item)}>+ ADD</button>
                </div>
              </div>
              <div className="mi-stub" aria-hidden>
                <span className="mi-stub-txt mono">ONE47 · CAFÉ</span>
                <span className="mi-barcode" />
              </div>
            </div>
          ))}
        </div>
        {items.length === 0 && <p className="dim">Loading the kitchen…</p>}
      </div>

      {cart.length > 0 && (
        <div className="cart-bar">
          <span className="mono" style={{ fontSize: 13 }}>
            {cart.length} item{cart.length > 1 ? 's' : ''} · <b className="gold">₹{total}</b>
          </span>
          <button className="btn btn-ghost" style={{ padding: '10px 18px', fontSize: 11 }} onClick={clear}>Clear</button>
          <Link to="/booking" className="btn btn-gold" style={{ padding: '10px 22px', fontSize: 11 }} onClick={attach}>
            Attach to a Booking →
          </Link>
        </div>
      )}
    </main>
  );
}
