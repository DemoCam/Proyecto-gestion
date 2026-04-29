import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

const emptyForm = {
  fullName: '',
  phone: '',
  email: '',
  source: '',
  notes: '',
  status: 'NEW',
};

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetchCustomers = async () => {
    try {
      const { data } = await api.get('/customers');
      setCustomers(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (customer) => {
    setEditingId(customer._id);
    setForm({
      fullName: customer.fullName || '',
      phone: customer.phone || '',
      email: customer.email || '',
      source: customer.source || '',
      notes: customer.notes || '',
      status: customer.status || 'NEW',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/customers/${editingId}`, form);
      } else {
        await api.post('/customers', form);
      }
      setShowModal(false);
      fetchCustomers();
    } catch (error) {
      alert('Error guardando cliente');
    }
  };

  return (
    <>
      <section className="mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-2 font-label">Seguimiento Comercial</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-primary font-headline">Clientes y Contactos</h2>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl font-semibold shadow-lg shadow-primary/10 hover:bg-primary-dim transition-all active:scale-95">
            <span className="material-symbols-outlined text-sm font-bold">person_add</span>
            Nuevo Contacto
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-6 bg-surface-container-lowest rounded-xl shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1 font-label">Contactos</p>
          <span className="text-2xl font-extrabold font-headline">{customers.length}</span>
        </div>
        <div className="p-6 bg-surface-container-lowest rounded-xl shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1 font-label">En Seguimiento</p>
          <span className="text-2xl font-extrabold font-headline">{customers.filter((customer) => customer.status === 'IN_FOLLOW_UP').length}</span>
        </div>
        <div className="p-6 bg-surface-container-lowest rounded-xl shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-1 font-label">Convertidos</p>
          <span className="text-2xl font-extrabold font-headline">{customers.filter((customer) => customer.status === 'WON').length}</span>
        </div>
      </div>

      <div className="bg-surface-container-low rounded-2xl overflow-hidden shadow-sm border border-outline-variant/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-high/50">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant font-label">Cliente</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant font-label">Contacto</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant font-label">Origen</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant font-label">Estado</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant font-label text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {customers.map((customer) => (
                <tr key={customer._id} className="bg-surface-container-lowest hover:bg-surface-container transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-on-surface block">{customer.fullName}</span>
                    <span className="text-xs text-on-surface-variant">{customer.notes || 'Sin notas'}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">
                    <span className="block">{customer.phone}</span>
                    <span className="text-xs">{customer.email || 'Sin correo'}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">{customer.source || '-'}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-primary-container text-on-primary-container text-[10px] font-bold uppercase tracking-wider rounded-full">{customer.status}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => openEdit(customer)} className="inline-flex p-2 rounded-lg hover:bg-surface-container-high transition-colors text-primary" title="Editar cliente">
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-on-surface-variant text-sm font-medium">Aún no tienes clientes registrados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-lg p-6 animate-scale-in">
            <h2 className="text-xl font-bold text-primary mb-6 font-headline">{editingId ? 'Editar Contacto' : 'Nuevo Contacto'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4 font-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Nombre completo" value={form.fullName} onChange={(value) => setForm({ ...form, fullName: value })} required />
                <Field label="Teléfono" value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Correo" type="email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} />
                <Field label="Origen" value={form.source} onChange={(value) => setForm({ ...form, source: value })} />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Estado</label>
                <select className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 focus:border-primary rounded-lg outline-none" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="NEW">Nuevo</option>
                  <option value="IN_FOLLOW_UP">En seguimiento</option>
                  <option value="WON">Convertido</option>
                  <option value="LOST">Perdido</option>
                  <option value="INACTIVE">Inactivo</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Notas</label>
                <textarea className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 focus:border-primary rounded-lg outline-none h-24 resize-none" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}></textarea>
              </div>
              <ModalActions onCancel={() => setShowModal(false)} />
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function Field({ label, value, onChange, type = 'text', required = false }) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">{label}</label>
      <input required={required} type={type} className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 focus:border-primary rounded-lg outline-none" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function ModalActions({ onCancel }) {
  return (
    <div className="pt-6 flex justify-end gap-3">
      <button type="button" onClick={onCancel} className="px-5 py-2.5 font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancelar</button>
      <button type="submit" className="px-5 py-2.5 bg-primary text-white font-medium rounded-xl shadow-md hover:bg-primary-dim transition-colors">Guardar</button>
    </div>
  );
}
