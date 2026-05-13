import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import GlobalNavbar from '../components/GlobalNavbar';
import Footer from '../components/Footer';

export default function Login() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [cardMotion, setCardMotion] = useState({
    rotateX: 0,
    rotateY: 0,
    glowX: 50,
    glowY: 50,
    parallaxX: 0,
    parallaxY: 0,
    particleX: 0,
    particleY: 0,
  });
  const { login, user } = useAuth();

  const slides = [
    {
      image: '/login-bg.png',
      eyebrow: 'Plataforma Escalable',
      title: 'Ecosistema operativo conectado y en tiempo real.',
      copy: 'Sincronización de inventarios, gestión de usuarios y trazabilidad comercial desde una sola operación segura.',
      icon: 'language',
      orbit: ['Inventario', 'Roles', 'Ventas'],
      scene: 'network',
    },
    {
      image: '/hero.png',
      eyebrow: 'Gestión Comercial',
      title: 'Seguimiento claro para clientes, llamadas y ventas.',
      copy: 'Cada perfil trabaja con una interfaz enfocada en sus responsabilidades y con datos protegidos por rol.',
      icon: 'monitoring',
      orbit: ['Clientes', 'Llamadas', 'Reportes'],
      scene: 'dashboard',
    },
    {
      image: '/login-bg.png',
      eyebrow: 'Control Interno',
      title: 'Notificaciones internas para actuar a tiempo.',
      copy: 'Alertas de stock, movimientos y actividad comercial disponibles dentro de la aplicación.',
      icon: 'notifications',
      orbit: ['Alertas', 'Stock', 'Actividad'],
      scene: 'security',
    },
  ];

  const activeOrbit = slides[activeSlide].orbit;
  const activeScene = slides[activeSlide].scene;

  const handleCardMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    setCardMotion({
      rotateX: (0.5 - y) * 12,
      rotateY: (x - 0.5) * 16,
      glowX: x * 100,
      glowY: y * 100,
      parallaxX: (x - 0.5) * 28,
      parallaxY: (y - 0.5) * 28,
      particleX: (x - 0.5) * 52,
      particleY: (y - 0.5) * 52,
    });
  };

  const resetCardMotion = () => {
    setCardMotion({
      rotateX: 0,
      rotateY: 0,
      glowX: 50,
      glowY: 50,
      parallaxX: 0,
      parallaxY: 0,
      particleX: 0,
      particleY: 0,
    });
  };

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 4500);

    return () => window.clearInterval(intervalId);
  }, [slides.length]);

  if (user) {
    if (user.role === 'ADMIN') return <Navigate to="/admin/users" replace />;
    if (user.role === 'SUPERVISOR') return <Navigate to="/inventory" replace />;
    if (user.role === 'CONSULTOR') return <Navigate to="/consultant/customers" replace />;
    if (user.role === 'DIRECTOR') return <Navigate to="/director/overview" replace />;
    return <Navigate to="/no-module" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const formData = new FormData(e.target);

    try {
      await login(formData.get('email'), formData.get('password'));
    } catch (requestError) {
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
              {error && (
                <p className="text-error mt-4 text-xs font-bold bg-error/10 p-3 rounded-lg border border-error/20 flex items-center">
                  <span className="material-symbols-outlined text-sm mr-2">error</span>
                  {error}
                </p>
              )}
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

        <div
          className="hidden lg:block lg:w-[55%] relative bg-inverse-surface overflow-hidden"
          onMouseMove={handleCardMove}
          onMouseLeave={resetCardMotion}
          style={{
            '--parallax-x': `${cardMotion.parallaxX}px`,
            '--parallax-y': `${cardMotion.parallaxY}px`,
            '--bg-x': `${cardMotion.parallaxX * -0.28}px`,
            '--bg-y': `${cardMotion.parallaxY * -0.28}px`,
            '--atmosphere-x': `${cardMotion.parallaxX * -0.12}px`,
            '--atmosphere-y': `${cardMotion.parallaxY * -0.12}px`,
            '--copy-x': `${cardMotion.parallaxX * -0.16}px`,
            '--copy-y': `${cardMotion.parallaxY * -0.16}px`,
            '--scene-x': `${cardMotion.parallaxX * 0.38}px`,
            '--scene-y': `${cardMotion.parallaxY * 0.38}px`,
            '--card-1-x': `${cardMotion.parallaxX * 0.18}px`,
            '--card-1-y': `${cardMotion.parallaxY * 0.18}px`,
            '--card-2-x': `${cardMotion.parallaxX * -0.12}px`,
            '--card-2-y': `${cardMotion.parallaxY * -0.12}px`,
            '--card-3-x': `${cardMotion.parallaxX * 0.24}px`,
            '--card-3-y': `${cardMotion.parallaxY * 0.24}px`,
            '--particle-x': `${cardMotion.particleX}px`,
            '--particle-y': `${cardMotion.particleY}px`,
          }}
        >
          <div className="login-parallax-bg absolute inset-0 z-0 animate-scale-in">
            {slides.map((slide, index) => (
              <div
                key={slide.title}
                className={`absolute inset-0 bg-cover bg-center mix-blend-luminosity transition-all duration-1000 ease-out ${
                  index === activeSlide ? 'opacity-80 scale-105' : 'opacity-0 scale-100'
                }`}
                style={{ backgroundImage: `url('${slide.image}')` }}
              />
            ))}
            <div className="absolute inset-0 bg-primary/40 backdrop-brightness-75 mix-blend-multiply"></div>
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-inverse-surface to-transparent"></div>
          </div>
          <div className={`login-slide-atmosphere login-slide-atmosphere-${activeScene}`}></div>

          <div
            className="absolute right-10 top-12 z-10 w-[30rem] h-[30rem] [perspective:1200px] pointer-events-none"
            style={{
              '--card-rotate-x': `${cardMotion.rotateX}deg`,
              '--card-rotate-y': `${cardMotion.rotateY}deg`,
              '--card-glow-x': `${cardMotion.glowX}%`,
              '--card-glow-y': `${cardMotion.glowY}%`,
            }}
          >
            <div className="login-3d-scene absolute inset-0 [transform-style:preserve-3d]">
              <div className="login-depth-grid"></div>
              <div className={`login-slide-visual login-slide-visual-${activeScene}`}>
                <span></span>
                <span></span>
                <span></span>
              </div>

              <div className="login-3d-ring absolute left-1/2 top-1/2 w-80 h-80 -ml-40 -mt-40 rounded-full border border-primary-container/25 shadow-[0_0_70px_rgba(216,227,251,0.16)]"></div>
              <div className="login-3d-ring login-3d-ring-delayed absolute left-1/2 top-1/2 w-56 h-56 -ml-28 -mt-28 rounded-full border border-white/15"></div>

              <div className="login-access-card absolute left-1/2 top-1/2 w-72 h-44 -translate-x-1/2 -translate-y-1/2 rounded-[1.35rem] overflow-hidden border border-white/20 shadow-2xl">
                <div className="login-access-card-glow"></div>
                <div className="relative z-10 h-full p-5 flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="block text-[9px] uppercase tracking-[0.22em] text-primary-container/70 font-bold">Yovendo</span>
                      <span className="block mt-1 text-lg text-white font-black leading-none">Access Card</span>
                    </div>
                    <span className="material-symbols-outlined text-primary-container text-3xl">{slides[activeSlide].icon}</span>
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <div className="login-card-chip mb-4">
                        <span></span>
                        <span></span>
                      </div>
                      <span className="block text-[9px] uppercase tracking-[0.2em] text-primary-container/55 font-bold">Modulo activo</span>
                      <span className="block mt-1 text-sm text-white font-extrabold">{slides[activeSlide].eyebrow}</span>
                    </div>

                    <div className="text-right">
                      <span className="block text-[9px] uppercase tracking-[0.2em] text-primary-container/55 font-bold">Estado</span>
                      <span className="mt-1 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-primary-container font-black">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-container shadow-[0_0_12px_rgba(216,227,251,0.9)]"></span>
                        Seguro
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {activeOrbit.map((label, index) => (
                <div
                  key={`${slides[activeSlide].eyebrow}-${label}`}
                  className={`login-3d-card login-3d-card-${index + 1} absolute w-32 h-20 rounded-2xl bg-surface-container-lowest/10 backdrop-blur-2xl border border-white/15 shadow-2xl flex flex-col justify-center px-4`}
                >
                  <span className="text-[9px] uppercase tracking-[0.18em] text-primary-container/60 font-bold">Nodo</span>
                  <span className="mt-1 text-sm text-white font-black leading-none">{label}</span>
                </div>
              ))}

              <div className="login-3d-beam absolute left-20 top-20 w-40 h-40 rounded-full bg-primary-container/20 blur-3xl"></div>
              <div className="login-3d-dot login-3d-dot-1"></div>
              <div className="login-3d-dot login-3d-dot-2"></div>
              <div className="login-3d-dot login-3d-dot-3"></div>
            </div>
          </div>

          <div className="login-parallax-copy absolute bottom-16 left-16 right-16 z-10 animate-slide-up delay-500">
            <div className="p-8 bg-surface-container-lowest/10 backdrop-blur-[32px] rounded-3xl max-w-lg border border-white/10 shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-container to-transparent opacity-50"></div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary-container/20 flex items-center justify-center border border-white/10 shadow-inner">
                  <span className="material-symbols-outlined text-primary-container font-light">{slides[activeSlide].icon}</span>
                </div>
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary-container/80">
                  {slides[activeSlide].eyebrow}
                </span>
              </div>
              <h3 className="text-2xl font-black text-white mb-3 font-headline leading-tight tracking-tight">
                {slides[activeSlide].title}
              </h3>
              <p className="text-primary-container/70 text-xs leading-relaxed font-body font-medium">
                {slides[activeSlide].copy}
              </p>
              <div className="mt-8 flex items-center gap-2">
                {slides.map((slide, index) => (
                  <button
                    key={slide.eyebrow}
                    type="button"
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index === activeSlide ? 'w-12 bg-primary-container shadow-lg shadow-primary-container/20' : 'w-1.5 bg-white/20'
                    }`}
                    onClick={() => setActiveSlide(index)}
                    aria-label={`Ver slide ${index + 1}`}
                  />
                ))}
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
