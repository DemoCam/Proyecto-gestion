import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import GlobalSidebar from './GlobalSidebar';
import GlobalNavbar from './GlobalNavbar';
import Footer from './Footer';

export default function Layout({ requiredRole }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole && user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="bg-background text-on-surface selection:bg-primary/20 min-h-screen flex w-full">
      <GlobalSidebar />
      <div className="flex flex-col flex-1 min-w-0 md:ml-72 transition-all duration-300 relative min-h-screen">
        <GlobalNavbar />
        <main className="flex-1 w-full p-6 lg:p-10 animate-fade-in flex flex-col">
          <div className="max-w-7xl mx-auto w-full flex-grow">
            <Outlet />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
