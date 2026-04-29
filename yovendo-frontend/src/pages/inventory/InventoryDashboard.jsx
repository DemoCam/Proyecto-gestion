import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

export default function InventoryDashboard() {
  const { user, logout } = useAuth();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ code: '', name: '', categoryId: '', unit: 'UND', currentStock: 0, costPrice: 0, salePrice: 0 });
  const [catForm, setCatForm] = useState({ name: '', description: '' });

  const normalizeItemForm = (data) => {
    const code = String(data.code || '').trim();
    const name = String(data.name || '').trim();
    const codeLooksLikeName = /[a-zA-Z]/.test(code);
    const nameLooksLikeCode = /^[0-9._-]+$/.test(name);

    if (codeLooksLikeName && nameLooksLikeCode) {
      return { ...data, code: name, name: code };
    }

    return { ...data, code, name };
  };

  const fetchData = async () => {
    try {
      const [itemsRes, catRes] = await Promise.all([api.get('/inventory/items'), api.get('/inventory/categories')]);
      setItems(itemsRes.data);
      setCategories(catRes.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { fetchData() }, []);

  const handleEdit = (item) => {
    setEditingId(item._id);
    setForm({
      code: item.code,
      name: item.name,
      categoryId: item.categoryId?._id || item.categoryId || '',
      unit: item.unit,
      currentStock: item.currentStock || 0,
      costPrice: item.costPrice || 0,
      salePrice: item.salePrice || 0
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const normalizedForm = normalizeItemForm(form);
      const payload = {
        ...normalizedForm,
        currentStock: Number(normalizedForm.currentStock) || 0,
        costPrice: Number(normalizedForm.costPrice) || 0,
        salePrice: Number(normalizedForm.salePrice) || 0,
      };

      if (editingId) {
        await api.put(`/inventory/items/${editingId}`, payload);
      } else {
        await api.post('/inventory/items', payload);
      }
      setShowModal(false);
      setForm({ code: '', name: '', categoryId: '', unit: 'UND', currentStock: 0, costPrice: 0, salePrice: 0 });
      setEditingId(null);
      fetchData();
    } catch (e) {
      alert('Error guardando insumo');
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/inventory/categories', catForm);
      setShowCategoryModal(false);
      setCatForm({ name: '', description: '' });
      fetchData(); // Reload categories dropdown
    } catch (e) {
      alert('Error creando categoría');
    }
  };

  return (
    <>
      <section className="mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-2 font-label">Resumen Operativo</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-primary font-headline">Gestión de Inventario</h2>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => {
              setForm({ code: '', name: '', categoryId: '', unit: 'UND', currentStock: 0, costPrice: 0, salePrice: 0 });
              setEditingId(null);
              setShowModal(true);
            }} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl font-semibold shadow-lg shadow-primary/10 hover:bg-primary-dim transition-all active:scale-95">
              <span className="material-symbols-outlined text-sm font-bold">add</span>
              <span>Agregar Artículo</span>
            </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="md:col-span-2 p-6 bg-surface-container-lowest rounded-xl shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1 font-label">Total de Insumos Activos</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-headline">{items.length}</span>
            <span className="text-xs font-medium text-primary">Unidades</span>
          </div>
        </div>
        <div className="md:col-span-2 p-6 bg-surface-container-lowest rounded-xl shadow-sm border-l-4 border-error/20">
          <p className="text-xs font-bold uppercase tracking-widest text-error mb-1 font-label">Alerta de Stock Bajo (crítico)</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-headline text-error">{items.filter(i => i.currentStock <= i.minimumStock).length}</span>
            <span className="text-xs font-medium text-error-dim">Requieren reposición inmediata</span>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-low rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-high/50">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant font-label">Código</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant font-label">Insumo</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant font-label text-center">Nivel Stock</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant font-label text-right">Precio Venta</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant font-label text-center">Trazabilidad / Kardex</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {items.map((item, index) => {
                const isLow = item.currentStock <= item.minimumStock;
                return (
                  <tr key={item._id} className={`transition-colors group animate-slide-up delay-${Math.min((index + 1) * 100, 500)} ${isLow ? 'bg-error/5 hover:bg-error/10' : 'bg-surface-container-lowest hover:bg-surface-container'}`}>
                    <td className="px-6 py-4 text-sm font-mono text-primary">{item.code}</td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-on-surface block">{item.name}</span>
                      <span className="text-xs px-2 py-0.5 mt-1 bg-surface-container rounded-lg text-on-surface-variant inline-block">
                        {item.categoryId?.name || 'General'}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-center font-bold text-sm ${isLow ? 'text-error' : ''}`}>
                        {item.currentStock} {item.unit}
                        {isLow && (
                            <div className="flex justify-center items-center gap-1 mt-1">
                              <span className="material-symbols-outlined text-error text-[10px]" style={{fontVariationSettings: "'FILL' 1"}}>warning</span>
                              <span className="text-[10px] uppercase font-bold text-error">Bajo</span>
                            </div>
                        )}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-semibold">${item.salePrice}</td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => handleEdit(item)} className="inline-flex p-2 rounded-lg hover:bg-surface-container-high transition-colors text-slate-600 hover:text-primary mr-2" title="Editar Insumo">
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </button>
                      <Link to={`/inventory/movements/${item._id}`} className="inline-flex p-2 rounded-lg hover:bg-surface-container-high transition-colors text-primary" title="Ver Historial (Kardex)">
                        <span className="material-symbols-outlined text-lg">history</span>
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-lg p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6 font-headline">{editingId ? 'Editar Insumo' : 'Matricular Nuevo Insumo'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4 font-body">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-1">Código Único</label>
                  <input required className="w-full px-3 py-2 bg-surface-container-low focus:bg-surface-container-lowest ghost-border focus:border-primary focus:ring-0 transition-all rounded-lg outline-none" value={form.code} onChange={e=>setForm({...form, code: e.target.value})} />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs uppercase tracking-widest text-on-surface-variant font-bold">Categoría</label>
                    <button type="button" onClick={() => setShowCategoryModal(true)} className="text-[10px] uppercase font-bold text-primary hover:text-primary-dim transition-colors flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">add_circle</span>
                      Nueva
                    </button>
                  </div>
                  <select required className="w-full px-3 py-2 bg-surface-container-low focus:bg-surface-container-lowest ghost-border focus:border-primary focus:ring-0 transition-all rounded-lg outline-none" value={form.categoryId} onChange={e=>setForm({...form, categoryId: e.target.value})}>
                    <option value="">Seleccionar...</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-1">Nombre Técnico</label>
                <input required className="w-full px-3 py-2 bg-surface-container-low focus:bg-surface-container-lowest ghost-border focus:border-primary focus:ring-0 transition-all rounded-lg outline-none" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-1">Stock Inicial / Actual</label>
                  <input type="number" required className="w-full px-3 py-2 bg-surface-container-low focus:bg-surface-container-lowest ghost-border focus:border-primary focus:ring-0 transition-all rounded-lg outline-none" value={form.currentStock} onChange={e=>setForm({...form, currentStock: parseInt(e.target.value) || 0})} />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-1">Unidad (E.g. UND, KG)</label>
                  <input required className="w-full px-3 py-2 bg-surface-container-low focus:bg-surface-container-lowest ghost-border focus:border-primary focus:ring-0 transition-all rounded-lg outline-none" value={form.unit} onChange={e=>setForm({...form, unit: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-1">Costo ($)</label>
                  <input type="number" required className="w-full px-3 py-2 bg-surface-container-low focus:bg-surface-container-lowest ghost-border focus:border-primary focus:ring-0 transition-all rounded-lg outline-none" value={form.costPrice} onChange={e=>setForm({...form, costPrice: Number(e.target.value) || 0})} />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-1">Venta ($)</label>
                  <input type="number" required className="w-full px-3 py-2 bg-surface-container-low focus:bg-surface-container-lowest ghost-border focus:border-primary focus:ring-0 transition-all rounded-lg outline-none" value={form.salePrice} onChange={e=>setForm({...form, salePrice: Number(e.target.value) || 0})} />
                </div>
              </div>
              <div className="pt-6 flex justify-end space-x-3">
                <button type="button" onClick={() => {
                  setShowModal(false);
                  setEditingId(null);
                  setForm({ code: '', name: '', categoryId: '', unit: 'UND', currentStock: 0, costPrice: 0, salePrice: 0 });
                }} className="px-5 py-2.5 font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Abortar</button>
                <button type="submit" className="px-5 py-2.5 bg-primary text-white font-medium rounded-xl shadow-md hover:bg-primary-dim transition-colors">Guardar en Base de Datos</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCategoryModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center z-[60] p-4 animate-fade-in">
          <div className="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-sm p-6 animate-scale-in">
            <h2 className="text-lg font-bold text-primary mb-4 font-headline">Nueva Categoría</h2>
            <form onSubmit={handleCategorySubmit} className="space-y-4 font-body">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Nombre Comercial</label>
                <input required autoFocus className="w-full px-3 py-2 bg-surface-container-low focus:bg-surface-container-lowest border border-outline-variant/30 focus:border-primary focus:ring-0 transition-all rounded-lg outline-none text-sm font-medium" placeholder="E.g. Electrónicos" value={catForm.name} onChange={e=>setCatForm({...catForm, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Descripción</label>
                <textarea className="w-full px-3 py-2 bg-surface-container-low focus:bg-surface-container-lowest border border-outline-variant/30 focus:border-primary focus:ring-0 transition-all rounded-lg outline-none text-sm font-medium h-20 resize-none" placeholder="Breve uso de la categoría..." value={catForm.description} onChange={e=>setCatForm({...catForm, description: e.target.value})}></textarea>
              </div>
              <div className="pt-2 flex justify-end gap-3 w-full">
                <button type="button" onClick={() => setShowCategoryModal(false)} className="flex-1 py-2 text-on-surface-variant font-bold hover:bg-surface-container-high rounded-xl transition-colors text-xs uppercase tracking-wider">Cancelar</button>
                <button type="submit" className="flex-1 py-2 bg-primary text-on-primary font-bold shadow-md hover:bg-primary-dim rounded-xl transition-all active:scale-95 text-xs uppercase tracking-wider flex items-center justify-center gap-1">Registrar <span className="material-symbols-outlined text-[14px]">done</span></button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
