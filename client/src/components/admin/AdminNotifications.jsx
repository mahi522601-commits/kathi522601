import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Check, CheckCheck, ExternalLink, MessageSquare, Package, ShoppingBag, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { getOrders } from '../../firebase/ordersService';
import { formatPrice } from '../../utils/formatPrice';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function buildNotifications(orders, messages) {
  const orderNotifs = orders.slice(0, 10).map(order => ({
    id: `order-${order.id}`,
    type: order.status === 'Pending' ? 'new_order' : 'order_update',
    title: order.status === 'Pending' ? 'New Order Received' : `Order ${order.status}`,
    body: `${order.orderNumber} · ${order.customerName} · ${formatPrice(order.total)}`,
    time: order.createdAt,
    read: false,
    link: '/admin/orders',
    icon: order.status === 'Pending' ? 'order' : 'package',
  }));

  const msgNotifs = (messages || []).slice(0, 5).map(msg => ({
    id: `msg-${msg.id}`,
    type: 'contact',
    title: 'New Contact Message',
    body: `${msg.name} · ${msg.email}`,
    time: msg.createdAt,
    read: false,
    link: '/admin/messages',
    icon: 'message',
  }));

  return [...orderNotifs, ...msgNotifs].sort((a, b) => new Date(b.time) - new Date(a.time));
}

const ICON_MAP = {
  order: ShoppingBag,
  package: Package,
  message: MessageSquare,
};

const TYPE_COLORS = {
  new_order: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  order_update: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  contact: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
};

export default function AdminNotifications() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [readIds, setReadIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('admin-notif-read') || '[]')); }
    catch { return new Set(); }
  });
  const panelRef = useRef(null);

  // Load notifications
  useEffect(() => {
    async function load() {
      try {
        const orders = await getOrders();
        // Try to load contact messages if endpoint exists
        let messages = [];
        try {
          const { data } = await axiosInstance.get('/contact/messages');
          messages = data.messages || [];
        } catch { /* no messages endpoint yet */ }
        setNotifications(buildNotifications(orders, messages));
      } catch { /* silently fail */ }
    }
    load();
    const interval = setInterval(load, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handler(e) { if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const unreadCount = notifications.filter(n => !readIds.has(n.id)).length;

  function markRead(id) {
    setReadIds(prev => {
      const next = new Set(prev);
      next.add(id);
      localStorage.setItem('admin-notif-read', JSON.stringify([...next]));
      return next;
    });
  }

  function markAllRead() {
    const next = new Set(notifications.map(n => n.id));
    setReadIds(next);
    localStorage.setItem('admin-notif-read', JSON.stringify([...next]));
  }

  return (
    <div ref={panelRef} className="relative">
      {/* Bell button */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white border border-borderwarm text-primary transition hover:bg-cream hover:shadow-sm"
      >
        <Bell size={18} />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-maroon text-white text-[10px] font-bold px-1"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-12 z-50 w-[380px] max-h-[520px] flex flex-col rounded-[1.6rem] border border-borderwarm bg-white shadow-[0_20px_60px_rgba(28,18,10,0.15)] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-borderwarm bg-cream/60">
              <div>
                <p className="font-heading text-2xl text-primary">Notifications</p>
                {unreadCount > 0 && (
                  <p className="text-xs text-muted mt-0.5">{unreadCount} unread</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button type="button" onClick={markAllRead} className="flex items-center gap-1.5 rounded-full border border-borderwarm px-3 py-1.5 text-xs font-semibold text-primary hover:bg-cream transition">
                    <CheckCheck size={12} />
                    Mark all read
                  </button>
                )}
                <button type="button" onClick={() => setOpen(false)} className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-cream text-muted">
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-borderwarm/60">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 text-muted">
                  <Bell size={32} className="opacity-30 mb-3" />
                  <p className="text-sm font-medium">No notifications yet</p>
                  <p className="text-xs mt-1 opacity-60">New orders and messages will appear here</p>
                </div>
              ) : (
                notifications.map(notif => {
                  const isRead = readIds.has(notif.id);
                  const colors = TYPE_COLORS[notif.type] || TYPE_COLORS.contact;
                  const Icon = ICON_MAP[notif.icon] || Bell;

                  return (
                    <motion.div
                      key={notif.id}
                      layout
                      className={`relative flex gap-3 px-5 py-4 transition-colors ${isRead ? 'bg-white' : 'bg-amber-50/30'} hover:bg-cream/60 cursor-pointer`}
                      onClick={() => markRead(notif.id)}
                    >
                      {/* Unread dot */}
                      {!isRead && (
                        <span className={`absolute left-2 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full ${colors.dot}`} />
                      )}

                      {/* Icon */}
                      <div className={`flex-shrink-0 h-9 w-9 rounded-2xl flex items-center justify-center ${colors.bg}`}>
                        <Icon size={16} className={colors.text} />
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold leading-snug ${isRead ? 'text-body' : 'text-primary'}`}>{notif.title}</p>
                        <p className="text-xs text-muted mt-0.5 line-clamp-1">{notif.body}</p>
                        <p className="text-[10px] text-muted/70 mt-1">{timeAgo(notif.time)}</p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        {!isRead && (
                          <button
                            type="button"
                            onClick={e => { e.stopPropagation(); markRead(notif.id); }}
                            className="h-6 w-6 rounded-full flex items-center justify-center hover:bg-white text-muted hover:text-primary transition"
                            title="Mark as read"
                          >
                            <Check size={12} />
                          </button>
                        )}
                        <Link
                          to={notif.link}
                          onClick={() => { markRead(notif.id); setOpen(false); }}
                          className="h-6 w-6 rounded-full flex items-center justify-center hover:bg-white text-muted hover:text-primary transition"
                          title="View"
                        >
                          <ExternalLink size={11} />
                        </Link>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-borderwarm px-5 py-3 bg-cream/40">
              <Link to="/admin/orders" onClick={() => setOpen(false)} className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary hover:text-gold transition">
                View All Orders
                <ExternalLink size={11} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
