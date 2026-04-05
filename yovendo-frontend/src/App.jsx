import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './components/Layout';
import AdminUsers from './pages/admin/AdminUsers';
import InventoryDashboard from './pages/inventory/InventoryDashboard';
import ItemMovements from './pages/inventory/ItemMovements';

function App() {
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

      {/* RUTA POR DEFECTO */}
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
