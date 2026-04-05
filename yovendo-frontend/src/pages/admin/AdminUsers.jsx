import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

export default function AdminUsers() {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '', roleId: '', documentNumber: '', phone: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, rolesRes] = await Promise.all([api.get('/users'), api.get('/roles')]);
      setUsers(usersRes.data);
      setRoles(rolesRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData() }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users', formData);
      setShowModal(false);
      setFormData({ firstName: '', lastName: '', email: '', password: '', roleId: '', documentNumber: '', phone: '' });
      fetchData();
    } catch (e) {
      alert('Error creando usuario');
    }
  };

  const toggleStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await api.put(`/users/${userId}/status`, { status: newStatus });
      fetchData();
    } catch (e) {
      alert('Error cambiando estado del usuario');
    }
  };

  return (
    <>
      <header className="flex justify-between items-center px-8 py-4 w-full bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 z-40 border-b border-slate-200">
        <div className="flex items-center gap-4">
          <h1 className="font-manrope tracking-tight font-bold text-slate-800 dark:text-slate-100 text-2xl">Gestión de Usuarios</h1>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary-dim text-on-primary px-5 py-2.5 rounded-lg font-medium text-sm transition-all hover:brightness-110 active:scale-95 shadow-lg shadow-primary/10">
            <span className="material-symbols-outlined text-lg">add</span>
            Crear Usuario
          </button>
        </div>
      </header>

      <section className="px-8 pb-12 pt-8">
        <div className="hidden md:grid grid-cols-12 px-6 py-4 mb-2 text-xs font-label uppercase tracking-widest text-on-surface-variant/70 font-semibold">
          <div className="col-span-4">Detalles del Usuario</div>
          <div className="col-span-3">Correo Electrónico</div>
          <div className="col-span-2">Rol</div>
          <div className="col-span-2">Estado</div>
          <div className="col-span-1 text-right">Acciones</div>
        </div>

        <div className="space-y-3">
          {users.map((u, index) => (
            <div key={u._id} className={`relative z-10 hover:z-50 grid grid-cols-1 md:grid-cols-12 items-center px-6 py-4 bg-surface-container-lowest rounded-2xl shadow-sm border border-slate-200/20 hover:border-primary/20 transition-all group animate-slide-up delay-${Math.min((index + 1) * 100, 500)}`}>
              <div className="col-span-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary-fixed text-primary font-bold flex items-center justify-center">
                    {u.firstName.charAt(0)}{u.lastName.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{u.firstName} {u.lastName}</p>
                  <p className="text-xs text-slate-500">Documento: {u.documentNumber || 'N/A'}</p>
                </div>
              </div>
              <div className="col-span-3 text-sm text-slate-600 mt-2 md:mt-0">
                  {u.email}
              </div>
              <div className="col-span-2 mt-2 md:mt-0">
                <span className="px-3 py-1 bg-primary-container text-on-primary-container text-[10px] font-bold uppercase tracking-wider rounded-full">
                    {u.roleId?.name || 'N/A'}
                </span>
              </div>
              <div className="col-span-2 mt-2 md:mt-0">
                <span className={`flex items-center gap-1.5 text-xs font-semibold ${u.status === 'ACTIVE' ? 'text-emerald-600' : 'text-slate-400'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                  {u.status}
                </span>
              </div>
              <div className="col-span-1 text-right mt-2 md:mt-0 relative group/action">
                <button className="p-2 rounded-lg hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-primary">
                  <span className="material-symbols-outlined">more_vert</span>
                </button>
                <div className="absolute right-0 top-full pt-1 hidden group-hover/action:block hover:block z-[999]">
                  <div className="w-48 bg-surface-container-lowest rounded-xl shadow-2xl border border-outline-variant/30 overflow-hidden animate-scale-in origin-top-right">
                    <button onClick={() => toggleStatus(u._id, u.status)} className={`w-full text-left px-4 py-3.5 text-xs font-bold transition-colors flex items-center gap-2 ${u.status === 'ACTIVE' ? 'text-error hover:bg-error/10' : 'text-emerald-700 hover:bg-emerald-50'}`}>
                      <span className="material-symbols-outlined text-[16px]">{u.status === 'ACTIVE' ? 'block' : 'check_circle'}</span>
                      {u.status === 'ACTIVE' ? 'Suspender Acceso' : 'Reactivar Acceso'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {users.length === 0 && (
              <div className="text-center p-8 text-slate-500">Ningun usuario registrado.</div>
          )}
        </div>
      </section>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4 font-headline">Nuevo Usuario</h2>
            <form onSubmit={handleSubmit} className="space-y-4 font-body">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                  <input required className="w-full border border-outline-variant/30 bg-surface-container-lowest rounded-lg px-3 py-2 outline-none focus:border-primary focus:ring-0" value={formData.firstName} onChange={e=>setFormData({...formData, firstName: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Apellido</label>
                  <input required className="w-full border border-outline-variant/30 bg-surface-container-lowest rounded-lg px-3 py-2 outline-none focus:border-primary focus:ring-0" value={formData.lastName} onChange={e=>setFormData({...formData, lastName: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Documento</label>
                    <input className="w-full border border-outline-variant/30 bg-surface-container-lowest rounded-lg px-3 py-2 outline-none focus:border-primary focus:ring-0" value={formData.documentNumber} onChange={e=>setFormData({...formData, documentNumber: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                    <input className="w-full border border-outline-variant/30 bg-surface-container-lowest rounded-lg px-3 py-2 outline-none focus:border-primary focus:ring-0" value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
                <input type="email" required className="w-full border border-outline-variant/30 bg-surface-container-lowest rounded-lg px-3 py-2 outline-none focus:border-primary focus:ring-0" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
                <input type="password" required className="w-full border border-outline-variant/30 bg-surface-container-lowest rounded-lg px-3 py-2 outline-none focus:border-primary focus:ring-0" value={formData.password} onChange={e=>setFormData({...formData, password: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Rol de Acceso</label>
                <select required className="w-full border border-outline-variant/30 bg-surface-container-lowest rounded-lg px-3 py-2 outline-none focus:border-primary focus:ring-0" value={formData.roleId} onChange={e=>setFormData({...formData, roleId: e.target.value})}>
                  <option value="">Seleccione un perfil corporativo...</option>
                  {roles.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
                </select>
              </div>
              <div className="pt-6 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancelar</button>
                <button type="submit" className="px-5 py-2.5 bg-primary text-white font-medium rounded-xl shadow-md hover:bg-primary-dim transition-colors">Confirmar Acción</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
