import React, { useEffect, useMemo, useState } from 'react';
import api from '../utils/api';

export default function NotificationsBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications],
  );

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications/me');
      setNotifications(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((current) =>
        current.map((notification) =>
          notification._id === id ? { ...notification, isRead: true } : notification,
        ),
      );
    } catch (error) {
      console.error(error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((current) => current.map((notification) => ({ ...notification, isRead: true })));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="relative p-2 flex items-center justify-center rounded-xl bg-surface-container-low hover:bg-surface-container-high text-primary transition-colors border border-outline-variant/20"
        title="Notificaciones"
      >
        <span className="material-symbols-outlined text-xl">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-error text-on-error text-[10px] font-bold flex items-center justify-center shadow-sm">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-80 max-w-[calc(100vw-2rem)] bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/20 overflow-hidden animate-scale-in origin-top-right z-[80]">
          <div className="px-4 py-3 border-b border-outline-variant/15 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-extrabold text-on-surface font-headline">Notificaciones</p>
              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">{unreadCount} sin leer</p>
            </div>
            <button
              type="button"
              onClick={markAllAsRead}
              className="text-[10px] font-bold text-primary hover:text-primary-dim uppercase tracking-wider"
            >
              Leer todo
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto divide-y divide-outline-variant/10">
            {notifications.slice(0, 8).map((notification) => (
              <button
                type="button"
                key={notification._id}
                onClick={() => markAsRead(notification._id)}
                className={`w-full text-left px-4 py-3 transition-colors hover:bg-surface-container-low ${
                  notification.isRead ? 'bg-surface-container-lowest' : 'bg-primary-container/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className={`material-symbols-outlined text-lg mt-0.5 ${notification.isRead ? 'text-outline' : 'text-primary'}`}>
                    {notification.type === 'WARNING' ? 'warning' : 'circle_notifications'}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-on-surface">{notification.title}</p>
                    <p className="text-xs text-on-surface-variant leading-relaxed mt-1">{notification.message}</p>
                    <p className="text-[10px] text-outline mt-2">{new Date(notification.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </button>
            ))}
            {notifications.length === 0 && (
              <div className="px-4 py-8 text-center text-xs text-on-surface-variant">
                No hay notificaciones para tu perfil.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
