import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './components/Layout';
import AdminUsers from './pages/admin/AdminUsers';
import InventoryDashboard from './pages/inventory/InventoryDashboard';
import ItemMovements from './pages/inventory/ItemMovements';
import NoModule from './pages/NoModule';
import { useAuth } from './context/AuthContext';

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* RUTAS DE ADMIN */}
      <Route element={<Layout requiredRole="ADMIN" />}>
        <Route path="/admin/users" element={<AdminUsers />} />
      </Route>

      {/* RUTAS DE SUPERVISOR */}
      <Route element={<Layout requiredRole="SUPERVISOR" />}>
        <Route path="/inventory" element={<InventoryDashboard />} />
        <Route path="/inventory/movements/:id" element={<ItemMovements />} />
      </Route>

      {/* RUTA DE SOPORTE / NO IMPLEMENTADO */}
      <Route path="/no-module" element={<NoModule />} />

      {/* REDIRECCIÓN INICIAL BASADA EN ROL */}
      <Route path="/" element={
        !user ? <Navigate to="/login" replace /> :
        user.role === 'ADMIN' ? <Navigate to="/admin/users" replace /> :
        user.role === 'SUPERVISOR' ? <Navigate to="/inventory" replace /> :
        <Navigate to="/no-module" replace />
      } />
    </Routes>
  );
}

export default App;
