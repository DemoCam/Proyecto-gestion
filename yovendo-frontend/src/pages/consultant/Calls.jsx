import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

const emptyForm = {
  customerId: '',
  date: new Date().toISOString().slice(0, 16),
  result: '',
  notes: '',
  nextFollowUpDate: '',
  status: 'COMPLETED',
};

export default function Calls() {
  const [calls, setCalls] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetchData = async () => {
    try {
      const [callsRes, customersRes] = await Promise.all([api.get('/calls'), api.get('/customers')]);
      setCalls(callsRes.data);
      setCustomers(customersRes.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const statusLabels = {
    COMPLETED: 'Completada',
    PENDING_FOLLOW_UP: 'Pendiente seguimiento',
    NO_ANSWER: 'Sin respuesta',
    CANCELLED: 'Cancelada',
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, customerId: customers[0]?._id || '' });
    setShowModal(true);
  };

  const openEdit = (call) => {
    setEditingId(call._id);
    setForm({
      customerId: call.customerId?._id || call.customerId || '',
      date: call.date ? new Date(call.date).toISOString().slice(0, 16) : '',
      result: call.result || '',
      notes: call.notes || '',
      nextFollowUpDate: call.nextFollowUpDate ? new Date(call.nextFollowUpDate).toISOString().slice(0, 16) : '',
      status: call.status || 'COMPLETED',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        date: new Date(form.date).toISOString(),
        nextFollowUpDate: form.nextFollowUpDate ? new Date(form.nextFollowUpDate).toISOString() : undefined,
      };

      if (editingId) {
        const { customerId, ...updatePayload } = payload;
        await api.put(`/calls/${editingId}`, updatePayload);
      } else {
        await api.post('/calls', payload);
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      alert('Error guardando llamada');
    }
  };

  return (
    <>
      <section className="mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-2 font-label">Comunicación Comercial</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-primary font-headline">Historial de Llamadas</h2>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl font-semibold shadow-lg shadow-primary/10 hover:bg-primary-dim transition-all active:scale-95">
            <span className="material-symbols-outlined text-sm font-bold">add_call</span>
            Registrar Llamada
          </button>
        </div>
      </section>

      <div className="bg-surface-container-low rounded-2xl overflow-hidden shadow-sm border border-outline-variant/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-high/50">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant font-label">Fecha</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant font-label">Cliente</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant font-label">Resultado</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant font-label">Estado</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant font-label">Próximo Seguimiento</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant font-label text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {calls.map((call) => (
                <tr key={call._id} className="bg-surface-container-lowest hover:bg-surface-container transition-colors">
                  <td className="px-6 py-4 text-xs font-mono text-on-surface-variant">{new Date(call.date).toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-on-surface">{call.customerId?.fullName || 'Cliente'}</td>
                  <td className="px-6 py-4">
                    <span className="block text-sm text-on-surface">{call.result}</span>
                    <span className="text-xs text-on-surface-variant">{call.notes || '-'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-primary-container text-on-primary-container text-[10px] font-bold uppercase tracking-wider rounded-full">
                      {statusLabels[call.status] || call.status || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">{call.nextFollowUpDate ? new Date(call.nextFollowUpDate).toLocaleString() : '-'}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => openEdit(call)} className="inline-flex p-2 rounded-lg hover:bg-surface-container-high transition-colors text-primary" title="Editar llamada">
                      <span className="material-symbols-outlined text-lg">edit_note</span>
                    </button>
                  </td>
                </tr>
              ))}
              {calls.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-on-surface-variant text-sm font-medium">Aún no tienes llamadas registradas.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-lg p-6 animate-scale-in">
            <h2 className="text-xl font-bold text-primary mb-6 font-headline">{editingId ? 'Editar Llamada' : 'Registrar Llamada'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4 font-body">
              {!editingId && (
                <Select label="Cliente" value={form.customerId} onChange={(value) => setForm({ ...form, customerId: value })} required>
                  <option value="">Seleccionar cliente...</option>
                  {customers.map((customer) => <option key={customer._id} value={customer._id}>{customer.fullName}</option>)}
                </Select>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Fecha" type="datetime-local" value={form.date} onChange={(value) => setForm({ ...form, date: value })} required />
                <Field label="Próximo seguimiento" type="datetime-local" value={form.nextFollowUpDate} onChange={(value) => setForm({ ...form, nextFollowUpDate: value })} />
              </div>
              <Field label="Resultado" value={form.result} onChange={(value) => setForm({ ...form, result: value })} required />
              <Select label="Estado" value={form.status} onChange={(value) => setForm({ ...form, status: value })}>
                <option value="COMPLETED">Completada</option>
                <option value="PENDING_FOLLOW_UP">Pendiente seguimiento</option>
                <option value="NO_ANSWER">Sin respuesta</option>
                <option value="CANCELLED">Cancelada</option>
              </Select>
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

function Select({ label, value, onChange, children, required = false }) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">{label}</label>
      <select required={required} className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 focus:border-primary rounded-lg outline-none" value={value} onChange={(e) => onChange(e.target.value)}>
        {children}
      </select>
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
