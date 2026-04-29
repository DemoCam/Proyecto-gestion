import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full py-6 mt-auto bg-transparent border-t border-outline-variant/15 animate-fade-in relative z-0">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="font-body text-xs font-bold tracking-widest text-on-surface-variant uppercase">
          © 2024 Yovendo. Eficiencia Editorial Corporativa.
        </p>
        <div className="flex gap-6">
          <a className="font-body text-[10px] font-bold tracking-widest text-on-surface-variant hover:text-primary transition-colors uppercase" href="#">Política de Privacidad</a>
          <a className="font-body text-[10px] font-bold tracking-widest text-on-surface-variant hover:text-primary transition-colors uppercase" href="#">Términos de Servicio</a>
        </div>
      </div>
    </footer>
  );
}
