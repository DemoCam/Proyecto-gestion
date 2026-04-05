import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';

export default function ItemMovements() {
  const { id } = useParams();
  const [movements, setMovements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ type: 'ENTRY', quantity: 1, reason: '' });

  const fetchData = async () => {
    try {
      const res = await api.get(`/inventory/items/${id}/movements`);
      setMovements(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { fetchData() }, [id]);

  const handleMovement = async (e) => {
    e.preventDefault();
    try {
      await api.post('/inventory/movements', { ...form, itemId: id, quantity: Number(form.quantity) });
      setShowModal(false);
      setForm({ type: 'ENTRY', quantity: 1, reason: '' });
      fetchData();
    } catch (e) {
      alert('Error registrando movimiento (Posible stock negativo)');
    }
  };

  const getTypeStyle = (type) => {
    switch (type) {
      case 'ENTRY': return 'bg-emerald-100/50 text-emerald-700';
      case 'EXIT': return 'bg-error/10 text-error';
      default: return 'bg-primary-container text-on-primary-container';
    }
  };
  
  const getTypeIcon = (type) => {
    switch (type) {
      case 'ENTRY': return 'south_west'; // Entrada (flecha hacia adentro)
      case 'EXIT': return 'north_east'; // Salida
      default: return 'sync';
    }
  };

  return (
    <>
      <section className="mb-10 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between md:items-end gap-6">
          <div className="flex items-center gap-4">
            <Link to="/inventory" className="p-2.5 rounded-xl hover:bg-surface-container-high transition-colors bg-surface-container-lowest border border-outline-variant/20 shadow-sm flex items-center justify-center text-primary group">
              <span className="material-symbols-outlined text-xl group-hover:-translate-x-1 transition-transform">arrow_left_alt</span>
            </Link>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-1 font-label">Registro Histórico</p>
              <h2 className="text-3xl font-extrabold tracking-tight text-primary font-headline">Kardex Logístico</h2>
            </div>
          </div>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl font-semibold shadow-lg shadow-primary/10 hover:bg-primary-dim transition-all active:scale-95">
            <span className="material-symbols-outlined text-sm font-bold">add</span>
            <span>Nuevo Movimiento M01</span>
          </button>
        </div>
      </section>

      <div className="bg-surface-container-low rounded-2xl overflow-hidden shadow-sm border border-outline-variant/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-high/50">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant font-label">Sello de Tiempo</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant font-label">Naturaleza Operativa</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant font-label text-center">Volumen</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant font-label text-center">Stock Residual</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant font-label">Justificación</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant font-label">Operador</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {movements.map((m, index) => (
                <tr key={m._id} className={`bg-surface-container-lowest hover:bg-surface-container transition-colors group animate-slide-up delay-${Math.min((index + 1) * 100, 500)}`}>
                  <td className="px-6 py-4 text-xs font-mono text-on-surface-variant">{new Date(m.createdAt).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getTypeStyle(m.type)}`}>
                      <span className="material-symbols-outlined text-[10px] font-bold">{getTypeIcon(m.type)}</span>
                      {m.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-sm">{m.quantity}</td>
                  <td className="px-6 py-4 text-center font-mono text-xs text-primary bg-surface-container-high/20">{m.newStock}</td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant italic max-w-xs truncate">{m.reason || '-'}</td>
                  <td className="px-6 py-4 text-xs font-semibold text-primary">{m.performedBy?.firstName} {m.performedBy?.lastName}</td>
                </tr>
              ))}
              {movements.length === 0 && <tr><td colSpan={6} className="p-12 text-center text-on-surface-variant text-sm font-medium">Historial vacío para esta ref.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface-container-lowest rounded-3xl shadow-2xl w-full max-w-sm p-8 animate-scale-in">
            <h2 className="text-xl font-bold text-primary mb-6 font-headline tracking-tight">Alterar Balance M01</h2>
            <form onSubmit={handleMovement} className="space-y-5 font-body">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1.5">Directriz</label>
                <select className="w-full px-4 py-2.5 bg-surface-container-low focus:bg-surface-container border border-outline-variant/20 focus:border-primary focus:ring-0 transition-all rounded-xl outline-none text-sm font-medium" value={form.type} onChange={e=>setForm({...form, type: e.target.value})}>
                  <option value="ENTRY">Abastecer (+)</option>
                  <option value="EXIT">Despachar (-)</option>
                  <option value="ADJUSTMENT">Ajuste Directo (=)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1.5">Cuantía a Procesar</label>
                <input type="number" min="0" required className="w-full px-4 py-2.5 bg-surface-container-low focus:bg-surface-container border border-outline-variant/20 focus:border-primary focus:ring-0 transition-all rounded-xl outline-none text-sm font-medium" value={form.quantity} onChange={e=>setForm({...form, quantity: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1.5">Memorando (Opcional)</label>
                <textarea className="w-full px-4 py-2.5 bg-surface-container-low focus:bg-surface-container border border-outline-variant/20 focus:border-primary focus:ring-0 transition-all rounded-xl outline-none text-sm font-medium h-24 resize-none" value={form.reason} onChange={e=>setForm({...form, reason: e.target.value})}></textarea>
              </div>
              <div className="pt-4 flex justify-end gap-3 w-full">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 text-on-surface-variant font-bold hover:bg-surface-container-low rounded-xl transition-colors text-xs uppercase tracking-wider">Cancelar</button>
                <button type="submit" className="flex-1 py-2.5 bg-primary text-on-primary font-bold shadow-md hover:bg-primary-dim rounded-xl transition-all active:scale-95 text-xs uppercase tracking-wider">Comprometer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
