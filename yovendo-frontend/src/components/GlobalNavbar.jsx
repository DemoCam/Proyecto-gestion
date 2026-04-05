import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function GlobalNavbar() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-surface-container-lowest/90 backdrop-blur-xl sticky top-0 w-full z-40 border-b border-outline-variant/15 flex justify-between items-center px-6 md:px-10 py-3 transition-all duration-300 shadow-sm shadow-black/5 animate-fade-in">
      <div className="flex items-center gap-3 md:hidden">
        <span className="material-symbols-outlined text-primary" style={{fontVariationSettings: "'FILL' 1"}}>webhook</span>
        <h1 className="text-xl font-bold tracking-tighter text-primary font-headline">Yovendo</h1>
      </div>
      <div className="hidden md:flex items-center gap-4">
          <div className="px-4 py-1.5 bg-surface-container-low rounded-lg border border-outline-variant/20 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Sistema En Línea</span>
          </div>
      </div>

      <div className="flex items-center gap-4 ml-auto">
        {user ? (
          <>
            <div className="hidden sm:block text-right mr-2">
              <p className="text-sm font-bold text-on-surface leading-tight">{user.firstName} {user.lastName}</p>
              <p className="text-[10px] text-primary uppercase tracking-widest font-mono font-bold">{user.role}</p>
            </div>
            <div className="w-10 h-10 rounded-full overflow-hidden bg-primary-fixed text-primary flex items-center justify-center font-extrabold text-sm border-2 border-primary-fixed-dim hover:scale-105 transition-transform cursor-pointer shadow-sm">
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </div>
            <div className="w-px h-8 bg-outline-variant/30 hidden sm:block mx-1"></div>
            <button onClick={logout} className="p-2 flex items-center justify-center rounded-xl bg-error/5 hover:bg-error/10 text-error transition-colors border border-error/10" title="Cerrar Sesión">
              <span className="material-symbols-outlined text-xl">logout</span>
            </button>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary" style={{fontVariationSettings: "'FILL' 1"}}>grid_view</span>
            <span className="text-lg font-extrabold tracking-tighter text-primary font-headline">Yovendo</span>
          </div>
        )}
      </div>
    </header>
  );
}
