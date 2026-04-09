import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function GlobalSidebar() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  return (
    <nav className="fixed left-0 top-0 flex flex-col py-6 px-4 bg-surface-container border-r border-outline-variant/20 h-screen w-72 z-50 transition-all duration-300 ease-in-out hidden md:flex">
        <div className="flex items-center gap-3 px-4 mb-10 animate-fade-in delay-100">
          <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-lg shadow-sm">
            <span className="material-symbols-outlined text-on-primary">webhook</span>
          </div>
          <div>
            <h2 className="font-headline font-black text-primary text-xl leading-tight">Yovendo</h2>
            <p className="text-[10px] font-body font-bold text-on-surface-variant uppercase tracking-widest">Enterprise</p>
          </div>
        </div>
        
        <div className="space-y-1 flex-1 animate-slide-up delay-200">
          <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-outline mb-3 mt-4">Navegación</p>
          
          {user.role === 'SUPERVISOR' && (
            <Link to="/inventory" className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 ease-in-out font-inter text-sm font-bold ${location.pathname.startsWith('/inventory') ? 'bg-primary text-on-primary shadow-md shadow-primary/20 scale-[1.02]' : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-high'}`}>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: location.pathname.startsWith('/inventory') ? "'FILL' 1" : "'FILL' 0" }}>inventory_2</span>
              Inventario Central
            </Link>
          )}

          {user.role === 'ADMIN' && (
            <Link to="/admin/users" className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 ease-in-out font-inter text-sm font-bold mt-1 ${location.pathname.startsWith('/admin') ? 'bg-primary text-on-primary shadow-md shadow-primary/20 scale-[1.02]' : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-high'}`}>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: location.pathname.startsWith('/admin') ? "'FILL' 1" : "'FILL' 0" }}>group</span>
              Gestión de Usuarios
            </Link>
          )}
        </div>
        
        <div className="mt-auto px-4 animate-scale-in delay-300">
          <div className="p-5 bg-primary-container/40 rounded-2xl border border-primary/10 backdrop-blur-sm">
             <p className="text-xs font-bold text-primary mb-1">Centro de Control</p>
             <p className="text-[10px] text-on-surface-variant mb-4 leading-relaxed">Infraestructura garantizada. Todas las operaciones registradas.</p>
             <button className="w-full py-2.5 bg-surface-container-lowest text-primary text-[10px] font-bold uppercase tracking-wider rounded-xl shadow-sm hover:scale-[1.02] transition-transform">Ver Registros</button>
          </div>
        </div>
    </nav>
  );
}
