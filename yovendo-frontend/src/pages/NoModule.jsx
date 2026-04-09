import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function NoModule() {
  const { logout, user } = useAuth();

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Módulo No Disponible</h1>
      <p>Hola <strong>{user?.firstName}</strong>, el módulo para tu rol (<strong>{user?.role}</strong>) aún no ha sido implementado.</p>
      <hr />
      <button 
        onClick={logout}
        style={{
          padding: '10px 20px',
          backgroundColor: '#333',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Cerrar Sesión (Logout)
      </button>
    </div>
  );
}
