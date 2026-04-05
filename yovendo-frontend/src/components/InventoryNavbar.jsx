import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function InventoryNavbar() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-xl fixed top-0 w-full z-40 border-b border-outline-variant/20">
        <div className="flex justify-between items-center px-6 h-16 w-full max-w-none">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">inventory_2</span>
            <h1 className="text-xl font-bold tracking-tighter text-slate-700 dark:text-slate-200 font-manrope">Yovendo</h1>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <nav className="flex gap-6">
              {user?.role === 'ADMIN' && (
                  <Link to="/admin/users" className="text-slate-500 hover:bg-slate-200/50 transition-colors px-3 py-1 rounded-xl text-sm font-medium">Panel de Accesos</Link>
              )}
              <Link to="/inventory" className="text-slate-900 font-bold bg-slate-200/50 transition-colors px-3 py-1 rounded-xl text-sm">Inventario Central</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={logout} className="p-2 rounded-full hover:bg-red-50 transition-colors text-red-500" title="Cerrar Sesión">
              <span className="material-symbols-outlined">logout</span>
            </button>
            <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant/20 bg-primary text-white flex items-center justify-center text-xs font-bold">
              {user?.firstName?.charAt(0)}
            </div>
          </div>
        </div>
    </header>
  );
}
