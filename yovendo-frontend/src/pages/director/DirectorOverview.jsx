import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

export default function DirectorOverview() {
  const [summary, setSummary] = useState({
    consultants: 0,
    customers: 0,
    inFollowUp: 0,
    calls: 0,
    sales: 0,
    salesAmount: 0,
  });

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const [consultantsRes, customersRes, callsRes, salesRes] = await Promise.all([
          api.get('/users/consultants/count'),
          api.get('/customers/summary/director'),
          api.get('/calls/summary/director'),
          api.get('/sales/summary/director'),
        ]);

        setSummary({
          consultants: consultantsRes.data.total || 0,
          customers: customersRes.data.total || 0,
          inFollowUp: customersRes.data.inFollowUp || 0,
          calls: callsRes.data.total || 0,
          sales: salesRes.data.total || 0,
          salesAmount: salesRes.data.totalAmount || 0,
        });
      } catch (error) {
        console.error(error);
      }
    };

    fetchSummary();
  }, []);

  const cards = [
    { label: 'Consultores', value: summary.consultants, icon: 'groups', tone: 'text-primary' },
    { label: 'Ventas registradas', value: summary.sales, icon: 'point_of_sale', tone: 'text-emerald-600' },
    { label: 'Llamadas registradas', value: summary.calls, icon: 'call', tone: 'text-primary' },
    { label: 'Clientes en seguimiento', value: summary.inFollowUp, icon: 'track_changes', tone: 'text-error' },
  ];

  return (
    <>
      <section className="mb-10">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-2 font-label">Seguimiento General</p>
          <h2 className="text-3xl font-extrabold tracking-tight text-primary font-headline">Vista Base de Dirección</h2>
          <p className="text-sm text-on-surface-variant mt-3 max-w-2xl">
            Resumen operativo simple para Entrega 2. El tablero avanzado de dirección queda reservado para una fase posterior.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="p-6 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10">
            <div className="flex items-center justify-between mb-5">
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label">{card.label}</p>
              <span className={`material-symbols-outlined ${card.tone}`}>{card.icon}</span>
            </div>
            <span className="text-3xl font-extrabold font-headline text-on-surface">{card.value}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 p-6 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10">
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2 font-label">Actividad Comercial</p>
          <h3 className="text-xl font-extrabold text-primary font-headline mb-2">${Number(summary.salesAmount).toLocaleString()}</h3>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Valor comercial registrado por los consultores. Esta cifra funciona como señal base de seguimiento y no reemplaza reportes financieros.
          </p>
        </div>
        <div className="p-6 bg-primary-container/40 rounded-xl shadow-sm border border-primary/10">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2 font-label">Clientes Totales</p>
          <h3 className="text-3xl font-extrabold text-primary font-headline mb-2">{summary.customers}</h3>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Contactos registrados por consultores para seguimiento comercial.
          </p>
        </div>
      </div>
    </>
  );
}
