import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import GlobalNavbar from '../components/GlobalNavbar';
import Footer from '../components/Footer';

export default function Login() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    if (user.role === 'ADMIN') return <Navigate to="/admin/users" replace />;
    if (user.role === 'SUPERVISOR') return <Navigate to="/inventory" replace />;
    return <Navigate to="/no-module" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const formData = new FormData(e.target);
    try {
      await login(formData.get('email'), formData.get('password'));
    } catch (error) {
      setError('Credenciales inválidas, verifica o contacta a soporte.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body selection:bg-primary-container">
      <GlobalNavbar />
      
      <main className="flex-grow flex items-stretch animate-fade-in relative min-h-0">
        <div className="w-full lg:w-[45%] flex flex-col justify-center px-8 md:px-16 lg:px-24 xl:px-32 py-12 bg-surface-container-lowest z-10 shadow-2xl relative">
          <div className="max-w-md w-full animate-slide-up delay-100 mx-auto lg:mx-0">
            <div className="mb-10">
              <span className="text-[10px] uppercase tracking-widest text-primary font-bold mb-3 block">
                Portal Corporativo
              </span>
              <h1 className="text-4xl font-black text-on-surface tracking-tight mb-2 font-headline leading-none">
                Iniciar Sesión
              </h1>
              <p className="text-on-surface-variant text-sm font-medium mt-3 leading-relaxed">
                Ingresa tus credenciales autorizadas explícitamente para acceder a las infraestructuras de Yovendo.
              </p>
              {error && <p className="text-error mt-4 text-xs font-bold bg-error/10 p-3 rounded-lg border border-error/20 flex items-center justify-between"><span className="material-symbols-outlined text-sm mr-2">error</span> {error}</p>}
            </div>
            
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-1.5 animate-slide-up delay-200">
                <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-bold" htmlFor="email">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline-variant text-[20px]">mail</span>
                  <input 
                    className="w-full pl-12 pr-4 py-3.5 bg-surface-container-low focus:bg-surface-container-lowest border border-outline-variant/30 focus:border-primary focus:ring-0 outline-none text-on-surface transition-all duration-300 rounded-xl text-sm font-medium" 
                    id="email" 
                    name="email" 
                    placeholder="E.g. admin@yovendo.com" 
                    type="email" 
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5 animate-slide-up delay-300">
                <div className="flex justify-between items-center">
                  <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-bold" htmlFor="password">
                    Contraseña de Acceso
                  </label>
                  <a className="text-[10px] font-bold text-primary hover:text-primary-dim hover:underline underline-offset-4 transition-all" href="#">
                    ¿Olvidaste tu clave?
                  </a>
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline-variant text-[20px]">lock</span>
                  <input 
                    className="w-full pl-12 pr-4 py-3.5 bg-surface-container-low focus:bg-surface-container-lowest border border-outline-variant/30 focus:border-primary focus:ring-0 outline-none text-on-surface transition-all duration-300 rounded-xl text-sm font-medium tracking-widest placeholder:tracking-normal" 
                    id="password" 
                    name="password" 
                    placeholder="••••••••" 
                    type="password" 
                    required
                  />
                </div>
              </div>
              <div className="pt-4 animate-slide-up delay-400">
                <button 
                  className="w-full bg-primary text-on-primary py-4 text-sm font-bold tracking-wider rounded-xl hover:bg-primary-dim active:scale-[0.98] transition-all duration-300 shadow-xl shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100 uppercase" 
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Validando Integridad...' : 'Continuar al Dashboard'}
                  <span className={`material-symbols-outlined text-sm ${loading ? 'animate-spin' : ''}`}>{loading ? 'sync' : 'arrow_forward'}</span>
                </button>
              </div>
            </form>

            <div className="mt-12 pt-8 border-t border-outline-variant/20 animate-fade-in delay-500">
              <p className="text-xs text-on-surface-variant font-medium">
                ¿Incidencias técnicas? 
                <a className="text-primary font-bold hover:underline decoration-2 underline-offset-4 ml-1" href="#">
                  Contactar al Centro de Soporte
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Professional Visual */}
        <div className="hidden lg:block lg:w-[55%] relative bg-inverse-surface overflow-hidden">
          <div className="absolute inset-0 z-0 scale-105 animate-scale-in transition-transform duration-1000 ease-out">
            <div 
              className="w-full h-full bg-cover bg-center mix-blend-luminosity opacity-80" 
              style={{backgroundImage: "url('/login-bg.png')"}}
            ></div>
            <div className="absolute inset-0 bg-primary/40 backdrop-brightness-75 mix-blend-multiply"></div>
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-inverse-surface to-transparent"></div>
          </div>
          
          <div className="absolute bottom-16 left-16 right-16 z-10 animate-slide-up delay-500">
            <div className="p-8 bg-surface-container-lowest/10 backdrop-blur-[32px] rounded-3xl max-w-lg border border-white/10 shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-container to-transparent opacity-50"></div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary-container/20 flex items-center justify-center border border-white/10 shadow-inner">
                  <span className="material-symbols-outlined text-primary-container font-light">language</span>
                </div>
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary-container/80">Plataforma Escalable</span>
              </div>
              <h3 className="text-2xl font-black text-white mb-3 font-headline leading-tight tracking-tight">Ecosistema operativo conectado y en tiempo real.</h3>
              <p className="text-primary-container/70 text-xs leading-relaxed font-body font-medium">
                Sincronización instantánea de inventarios, gestión de acreditaciones y controles de seguridad con cifrado asimétrico garantizado en cada transacción logística.
              </p>
              <div className="mt-8 flex items-center gap-2">
                <div className="h-1.5 w-12 bg-primary-container rounded-full shadow-lg shadow-primary-container/20"></div>
                <div className="h-1.5 w-1.5 bg-white/20 rounded-full"></div>
                <div className="h-1.5 w-1.5 bg-white/20 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="bg-surface-container-lowest px-8 py-2 md:hidden">
         <Footer />
      </div>
      <div className="absolute bottom-0 w-full hidden md:block">
         <Footer />
      </div>
    </div>
  );
}
