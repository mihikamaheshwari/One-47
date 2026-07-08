import { useEffect, useState } from 'react';
import { getMenu, upsertMenuItem, deleteMenuItem } from '../services/api';

const EMPTY = { name: '', category: 'Bites & Starters', desc: '', price: '', tag: '', available: true };
const CATS = ['Signature Combos', 'Coffee & Beverages', 'Bites & Starters', 'Mains & Pizza', 'Desserts'];

export default function MenuManager() {
  const [menu, setMenu] = useState([]);
  const [draft, setDraft] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => { getMenu().then(setMenu); }, []);

  const set = (k) => (e) => setDraft({ ...draft, [k]: e.target.value });

  const submit = async () => {
    if (!draft.name.trim() || !Number(draft.price)) return;
    const item = { ...draft, price: Number(draft.price), id: editingId || undefined };
    setMenu(await upsertMenuItem(item));
    setDraft(EMPTY); setEditingId(null);
  };

  const edit = (item) => { setDraft({ ...item, price: String(item.price) }); setEditingId(item.id); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const toggle = async (item) => setMenu(await upsertMenuItem({ ...item, available: !item.available }));
  const del = async (id) => setMenu(await deleteMenuItem(id));

  return (
    <div>
      <div className="glass panel" style={{ marginTop: 0 }}>
        <div className="panel-h">
          <span className="panel-t">{editingId ? 'Edit Item' : 'Add Menu Item'}</span>
          {editingId && <button className="mini-btn" onClick={() => { setDraft(EMPTY); setEditingId(null); }}>cancel edit</button>}
        </div>
        <div className="form-grid">
          <div className="field"><label>Name</label><input value={draft.name} onChange={set('name')} placeholder="e.g. Truffle Fries" /></div>
          <div className="field"><label>Category</label>
            <select value={draft.category} onChange={set('category')}>
              {CATS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="field"><label>Price (₹)</label><input type="number" value={draft.price} onChange={set('price')} placeholder="199" /></div>
          <div className="field"><label>Tag (optional)</label><input value={draft.tag} onChange={set('tag')} placeholder="BESTSELLER" /></div>
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label>Description</label>
            <input value={draft.desc} onChange={set('desc')} placeholder="Short tasty description" />
          </div>
        </div>
        <button className="btn btn-gold" style={{ marginTop: 20 }} onClick={submit}>
          {editingId ? 'Save Changes' : '+ Add to Menu'}
        </button>
      </div>

      <div className="glass panel">
        <div className="panel-h"><span className="panel-t">Menu ({menu.length} items)</span></div>
        <div style={{ overflowX: 'auto' }}>
          <table className="tbl">
            <thead><tr><th>Item</th><th>Category</th><th>Price</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {menu.map((m) => (
                <tr key={m.id} style={{ opacity: m.available ? 1 : 0.45 }}>
                  <td><b>{m.name}</b> {m.tag && <span className="mi-tag" style={{ marginLeft: 6 }}>{m.tag}</span>}
                    <span className="dim" style={{ display: 'block', fontSize: 12 }}>{m.desc}</span></td>
                  <td style={{ fontSize: 12 }}>{m.category}</td>
                  <td className="mono gold">₹{m.price}</td>
                  <td><span className={`pill ${m.available ? 'pill-green' : 'pill-pink'}`}>{m.available ? 'live' : 'hidden'}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="mini-btn" onClick={() => edit(m)}>edit</button>
                      <button className="mini-btn gold" onClick={() => toggle(m)}>{m.available ? 'hide' : 'show'}</button>
                      <button className="mini-btn danger" onClick={() => del(m.id)}>delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
