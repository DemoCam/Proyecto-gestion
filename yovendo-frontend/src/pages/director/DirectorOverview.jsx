import React, { useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import api from '../../utils/api';

const COLORS = {
  primary: '#545f73',
  primaryDim: '#485367',
  secondary: '#526074',
  tertiary: '#605c78',
  emerald: '#059669',
  error: '#9f403d',
  grid: '#a9b4b9',
};

const PERIODS = [
  { key: 'today', label: 'Hoy' },
  { key: 'month', label: 'Mes' },
  { key: 'year', label: 'Año' },
];

const MEDALS = ['military_tech', 'workspace_premium', 'social_leaderboard'];
const MEDAL_TONES = ['text-amber-500', 'text-slate-400', 'text-orange-700'];

const formatCurrency = (value) => `$${Number(value || 0).toLocaleString('es-CO')}`;

const emptyDashboard = {
  periods: { today: { count: 0, amount: 0 }, month: { count: 0, amount: 0 }, year: { count: 0, amount: 0 } },
  monthlyTrend: [],
  ranking: [],
  totals: { consultants: 0, customers: 0, inFollowUp: 0, calls: 0, sales: 0, salesAmount: 0 },
  meta: { monthlyGoal: 0, year: new Date().getFullYear() },
};

export default function DirectorOverview() {
  const [data, setData] = useState(emptyDashboard);
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(true);
  const [reminderState, setReminderState] = useState({ sending: false, message: '' });

  const runReminders = async () => {
    setReminderState({ sending: true, message: '' });
    try {
      const res = await api.post('/calls/reminders/run');
      const count = res.data?.reminders ?? 0;
      setReminderState({
        sending: false,
        message: count > 0 ? `Se enviaron ${count} recordatorio(s) a los consultores.` : 'No hay seguimientos pendientes por notificar.',
      });
    } catch (error) {
      console.error(error);
      setReminderState({ sending: false, message: 'No se pudieron enviar los recordatorios.' });
    }
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/sales/dashboard/director');
        setData({ ...emptyDashboard, ...res.data });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const activePeriod = data.periods[period] || { count: 0, amount: 0 };
  const periodLabel = PERIODS.find((p) => p.key === period)?.label ?? '';

  const topRanking = useMemo(() => data.ranking.slice(0, 8), [data.ranking]);
  const chartRanking = useMemo(
    () => topRanking.map((row) => ({ name: row.name.split(' ')[0] || row.name, totalAmount: row.totalAmount })),
    [topRanking],
  );

  const kpis = [
    {
      label: `Ventas (${periodLabel})`,
      value: formatCurrency(activePeriod.amount),
      hint: `${activePeriod.count} ventas registradas`,
      icon: 'point_of_sale',
      tone: 'text-emerald-600',
    },
    { label: 'Consultores', value: data.totals.consultants, hint: 'Equipo comercial', icon: 'groups', tone: 'text-primary' },
    {
      label: 'Clientes en seguimiento',
      value: data.totals.inFollowUp,
      hint: `${data.totals.customers} clientes totales`,
      icon: 'track_changes',
      tone: 'text-error',
    },
    { label: 'Llamadas', value: data.totals.calls, hint: 'Actividad de contacto', icon: 'call', tone: 'text-primary' },
  ];

  return (
    <>
      <section className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between animate-fade-in">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-2 font-label">
            Seguimiento de Consultores
          </p>
          <h2 className="text-3xl font-extrabold tracking-tight text-primary font-headline">Tablero de Dirección</h2>
          <p className="text-sm text-on-surface-variant mt-3 max-w-2xl">
            Seguimiento de ventas diarias, mensuales y anuales del equipo comercial para incentivar el desempeño.
          </p>
        </div>

        <div className="flex flex-col items-start gap-2 md:items-end">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={runReminders}
              disabled={reminderState.sending}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-on-primary text-sm font-bold shadow-md shadow-primary/20 hover:bg-primary-dim transition-all active:scale-95 disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-base">campaign</span>
              {reminderState.sending ? 'Enviando...' : 'Enviar recordatorios'}
            </button>
            <div className="flex items-center gap-1 p-1 bg-surface-container-high/60 rounded-xl w-fit">
              {PERIODS.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setPeriod(p.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
                    period === p.key
                      ? 'bg-primary text-on-primary shadow-md shadow-primary/20'
                      : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          {reminderState.message && (
            <p className="text-xs text-on-surface-variant">{reminderState.message}</p>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8 animate-slide-up delay-100">
        {kpis.map((card) => (
          <div
            key={card.label}
            className="p-6 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10"
          >
            <div className="flex items-center justify-between mb-5">
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label">{card.label}</p>
              <span className={`material-symbols-outlined ${card.tone}`}>{card.icon}</span>
            </div>
            <span className="text-3xl font-extrabold font-headline text-on-surface">{card.value}</span>
            <p className="text-xs text-on-surface-variant mt-2">{card.hint}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8 animate-slide-up delay-200">
        <div className="lg:col-span-2 p-6 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label">
                Tendencia de Ventas
              </p>
              <h3 className="text-lg font-extrabold text-primary font-headline">Año {data.meta.year}</h3>
            </div>
            <span className="material-symbols-outlined text-primary">trending_up</span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.monthlyTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} strokeOpacity={0.25} vertical={false} />
                <XAxis dataKey="label" stroke={COLORS.secondary} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  stroke={COLORS.secondary}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  width={70}
                  tickFormatter={(v) => `$${(v / 1000).toLocaleString('es-CO')}k`}
                />
                <Tooltip
                  formatter={(value) => [formatCurrency(value), 'Ventas']}
                  contentStyle={{ borderRadius: 12, border: `1px solid ${COLORS.grid}`, fontSize: 13 }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke={COLORS.primary}
                  strokeWidth={2.5}
                  fill="url(#salesGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-6 bg-primary-container/40 rounded-xl shadow-sm border border-primary/10 flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2 font-label">Ventas del Año</p>
            <h3 className="text-3xl font-extrabold text-primary font-headline mb-1">
              {formatCurrency(data.periods.year.amount)}
            </h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {data.periods.year.count} ventas acumuladas en {data.meta.year}.
            </p>
          </div>
          <div className="mt-6 pt-6 border-t border-primary/10">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1 font-label">Clientes Totales</p>
            <h3 className="text-2xl font-extrabold text-primary font-headline">{data.totals.customers}</h3>
            <p className="text-xs text-on-surface-variant mt-1">Contactos registrados por los consultores.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-scale-in delay-300">
        <div className="p-6 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10">
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label">
              Monto por Consultor
            </p>
            <span className="material-symbols-outlined text-primary">leaderboard</span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartRanking} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} strokeOpacity={0.25} horizontal={false} />
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke={COLORS.secondary}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  width={80}
                />
                <Tooltip
                  formatter={(value) => [formatCurrency(value), 'Monto']}
                  cursor={{ fill: COLORS.grid, fillOpacity: 0.1 }}
                  contentStyle={{ borderRadius: 12, border: `1px solid ${COLORS.grid}`, fontSize: 13 }}
                />
                <Bar dataKey="totalAmount" radius={[0, 6, 6, 0]} maxBarSize={26}>
                  {chartRanking.map((entry, index) => (
                    <Cell key={entry.name} fill={index < 3 ? COLORS.primary : COLORS.tertiary} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 bg-surface-container-low rounded-2xl overflow-hidden shadow-sm border border-outline-variant/10">
          <div className="px-6 py-5 flex items-center justify-between border-b border-outline-variant/10">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label">
                Ranking de Consultores
              </p>
              <h3 className="text-lg font-extrabold text-primary font-headline">Meta mensual {formatCurrency(data.meta.monthlyGoal)}</h3>
            </div>
            <span className="material-symbols-outlined text-primary">emoji_events</span>
          </div>

          {loading ? (
            <p className="px-6 py-10 text-sm text-on-surface-variant text-center">Cargando datos...</p>
          ) : data.ranking.length === 0 ? (
            <p className="px-6 py-10 text-sm text-on-surface-variant text-center">No hay consultores registrados aun.</p>
          ) : (
            <div className="divide-y divide-outline-variant/10">
              {data.ranking.map((row) => {
                const progress = Math.min(Math.round((row.goalProgress || 0) * 100), 100);
                return (
                  <div key={row.consultantId} className="px-6 py-4 hover:bg-surface-container transition-colors">
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <div className="flex items-center gap-3 min-w-0">
                        {row.isTop ? (
                          <span className={`material-symbols-outlined ${MEDAL_TONES[row.rank - 1]}`}>
                            {MEDALS[row.rank - 1]}
                          </span>
                        ) : (
                          <span className="w-6 text-center text-sm font-bold text-on-surface-variant">{row.rank}</span>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-on-surface truncate">{row.name}</p>
                          <p className="text-xs text-on-surface-variant">
                            {row.salesCount} ventas | {row.customers} clientes | {row.won} ganados
                          </p>
                        </div>
                      </div>
                      <p className="font-extrabold font-headline text-primary whitespace-nowrap">
                        {formatCurrency(row.totalAmount)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-surface-container-high rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-on-surface-variant w-10 text-right">{progress}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
