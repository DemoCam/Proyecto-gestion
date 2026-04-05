import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminSidebar() {
  const { user, logout } = useAuth();

  return (
    <nav className="fixed left-0 top-0 flex flex-col py-6 px-4 bg-slate-100 dark:bg-slate-950 h-screen w-72 border-r-0 z-50 transition-all duration-300 ease-in-out">
        <div className="flex items-center gap-3 px-4 mb-10">
          <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-lg">
            <span className="material-symbols-outlined text-on-primary">security</span>
          </div>
          <div>
            <h2 className="font-manrope font-black text-slate-800 dark:text-slate-100 text-lg leading-tight">Yovendo Admin</h2>
            <p className="text-xs font-inter font-medium text-slate-500 uppercase tracking-widest">Enterprise Tier</p>
          </div>
        </div>
        <div className="space-y-1 flex-1">
          <Link to="/inventory" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ease-in-out text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/30 dark:hover:bg-slate-800/30 font-inter text-sm font-medium">
            <span className="material-symbols-outlined">dashboard</span>
            Dashboard / Inventario
          </Link>
          <Link to="/admin/users" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ease-in-out bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-sm font-inter text-sm font-medium">
            <span className="material-symbols-outlined">group</span>
            Gestión de Usuarios
          </Link>
        </div>
        <div className="mt-auto flex flex-col gap-3">
            <button onClick={logout} className="flex px-4 py-3 items-center gap-3 bg-red-50 text-red-600 rounded-xl font-medium w-full hover:bg-red-100 transition-colors">
              <span className="material-symbols-outlined">logout</span>
              Cerrar Sesión
            </button>
            <div className="px-4 py-4 bg-slate-200/30 dark:bg-slate-900/50 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm bg-primary text-white flex items-center justify-center font-bold">
                  {user?.firstName?.charAt(0)}
              </div>
              <div className="overflow-hidden">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{user?.firstName} {user?.lastName}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{user?.role}</p>
              </div>
            </div>
        </div>
    </nav>
  );
}
