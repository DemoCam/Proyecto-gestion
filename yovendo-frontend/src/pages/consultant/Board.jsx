import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

const COLUMNS = [
  { status: 'NEW', label: 'Nuevos', icon: 'fiber_new', accent: 'text-primary', bar: 'bg-primary' },
  { status: 'IN_FOLLOW_UP', label: 'En seguimiento', icon: 'track_changes', accent: 'text-amber-600', bar: 'bg-amber-500' },
  { status: 'WON', label: 'Convertidos', icon: 'verified', accent: 'text-emerald-600', bar: 'bg-emerald-500' },
  { status: 'LOST', label: 'Perdidos', icon: 'cancel', accent: 'text-error', bar: 'bg-error' },
  { status: 'INACTIVE', label: 'Inactivos', icon: 'pause_circle', accent: 'text-on-surface-variant', bar: 'bg-outline' },
];

const formatDate = (value) => (value ? new Date(value).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }) : '');

export default function Board() {
  const [cards, setCards] = useState([]);
  const [due, setDue] = useState([]);
  const [draggingId, setDraggingId] = useState(null);
  const [overColumn, setOverColumn] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [boardRes, dueRes] = await Promise.all([
        api.get('/calls/board'),
        api.get('/calls/follow-ups/due'),
      ]);
      setCards(boardRes.data);
      setDue(dueRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const moveCard = async (customerId, newStatus) => {
    const card = cards.find((c) => c._id === customerId);
    if (!card || card.status === newStatus) return;

    setCards((prev) => prev.map((c) => (c._id === customerId ? { ...c, status: newStatus } : c)));
    try {
      await api.put(`/customers/${customerId}`, { status: newStatus });
      fetchData();
    } catch (error) {
      console.error(error);
      fetchData();
    }
  };

  const handleDrop = (status) => {
    if (draggingId) moveCard(draggingId, status);
    setDraggingId(null);
    setOverColumn(null);
  };

  return (
    <>
      <section className="mb-8 animate-fade-in">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-2 font-label">
          Seguimiento Comercial
        </p>
        <h2 className="text-3xl font-extrabold tracking-tight text-primary font-headline">Embudo de Clientes</h2>
        <p className="text-sm text-on-surface-variant mt-3 max-w-2xl">
          Arrastra cada cliente entre las etapas para actualizar su estado. Los seguimientos vencidos se resaltan en rojo.
        </p>
      </section>

      <div className="mb-8 p-5 bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10 animate-slide-up delay-100">
        <div className="flex items-center gap-3 mb-4">
          <span className="material-symbols-outlined text-error">notifications_active</span>
          <h3 className="font-extrabold text-on-surface font-headline">Seguimientos para hoy</h3>
          <span className="ml-auto px-3 py-1 bg-error/10 text-error text-xs font-bold rounded-full">{due.length}</span>
        </div>
        {due.length === 0 ? (
          <p className="text-sm text-on-surface-variant">No tienes seguimientos pendientes para hoy. Buen trabajo.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {due.map((call) => (
              <div
                key={call._id}
                className="flex items-center gap-3 px-4 py-2 bg-error/5 border border-error/20 rounded-xl"
              >
                <span className="material-symbols-outlined text-error text-lg">event_busy</span>
                <div>
                  <p className="text-sm font-bold text-on-surface">{call.customerId?.fullName || 'Cliente'}</p>
                  <p className="text-xs text-on-surface-variant">
                    {call.customerId?.phone || 'Sin telefono'} · vence {formatDate(call.nextFollowUpDate)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-on-surface-variant">Cargando embudo...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 animate-slide-up delay-200">
          {COLUMNS.map((column) => {
            const columnCards = cards.filter((c) => c.status === column.status);
            return (
              <div
                key={column.status}
                onDragOver={(e) => {
                  e.preventDefault();
                  setOverColumn(column.status);
                }}
                onDragLeave={() => setOverColumn((current) => (current === column.status ? null : current))}
                onDrop={() => handleDrop(column.status)}
                className={`flex flex-col rounded-2xl border transition-colors min-h-[12rem] ${
                  overColumn === column.status
                    ? 'border-primary bg-primary/5'
                    : 'border-outline-variant/10 bg-surface-container-low'
                }`}
              >
                <div className="flex items-center gap-2 px-4 py-3 border-b border-outline-variant/10">
                  <span className={`material-symbols-outlined text-lg ${column.accent}`}>{column.icon}</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant font-label">
                    {column.label}
                  </span>
                  <span className="ml-auto text-xs font-bold text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-full">
                    {columnCards.length}
                  </span>
                </div>

                <div className="flex flex-col gap-3 p-3 flex-1">
                  {columnCards.map((card) => (
                    <article
                      key={card._id}
                      draggable
                      onDragStart={() => setDraggingId(card._id)}
                      onDragEnd={() => {
                        setDraggingId(null);
                        setOverColumn(null);
                      }}
                      className={`p-3 bg-surface-container-lowest rounded-xl shadow-sm border cursor-grab active:cursor-grabbing transition-all hover:shadow-md ${
                        card.overdue ? 'border-error/40' : 'border-outline-variant/10'
                      } ${draggingId === card._id ? 'opacity-50' : ''}`}
                    >
                      <div className={`h-1 w-8 rounded-full mb-2 ${column.bar}`} />
                      <p className="text-sm font-bold text-on-surface truncate">{card.fullName}</p>
                      <p className="text-xs text-on-surface-variant mb-2">{card.phone || 'Sin telefono'}</p>
                      {card.nextFollowUpDate && (
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            card.overdue
                              ? 'bg-error/10 text-error'
                              : 'bg-amber-500/10 text-amber-600'
                          }`}
                        >
                          <span className="material-symbols-outlined text-xs">
                            {card.overdue ? 'priority_high' : 'schedule'}
                          </span>
                          {card.overdue ? 'Vencido' : 'Seguir'} {formatDate(card.nextFollowUpDate)}
                        </span>
                      )}
                    </article>
                  ))}
                  {columnCards.length === 0 && (
                    <p className="text-xs text-on-surface-variant/60 text-center py-6">Suelta clientes aqui</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
