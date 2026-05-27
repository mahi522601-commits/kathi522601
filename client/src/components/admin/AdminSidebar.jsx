import { NavLink } from 'react-router-dom';
import { BarChart3, Image, MessageSquare, Package, Percent, ShoppingBag } from 'lucide-react';
import AdminNotifications from './AdminNotifications';
import BrandLogo from '../ui/BrandLogo';

const adminLinks = [
  { label: 'Dashboard', path: '/admin', icon: BarChart3 },
  { label: 'Banners', path: '/admin/banners', icon: Image },
  { label: 'Products', path: '/admin/products', icon: Package },
  { label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
  { label: 'Coupons', path: '/admin/coupons', icon: Percent },
  { label: 'Messages', path: '/admin/messages', icon: MessageSquare },
];

export default function AdminSidebar() {
  return (
    <aside className="sticky top-8 h-fit rounded-[24px] border border-[#6f5428]/40 bg-[#1c120a] p-5 text-white shadow-[0_24px_70px_rgba(28,18,10,0.24)]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <BrandLogo size="sm" className="h-12 w-12" />
          <div>
            <p className="font-heading text-2xl">Admin Panel</p>
            <p className="text-xs uppercase tracking-[0.16em] text-[#dcc8af]">Khyathi Collections</p>
          </div>
        </div>
        {/* Notifications bell â€” renders with its own state */}
        <AdminNotifications />
      </div>

      <div className="mt-8 grid gap-2">
        {adminLinks.map((item) => {
          const Icon = item.icon;
          return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/admin'}
            className={({ isActive }) =>
              `rounded-[14px] px-4 py-3 text-sm font-semibold transition flex items-center gap-3 ${
                isActive
                  ? 'bg-[#f6d878] text-[#1c120a] shadow-[0_14px_34px_rgba(201,168,76,0.22)]'
                  : 'bg-white/10 text-[#f4eadc] hover:bg-white/20'
              }`
            }
          >
            <Icon size={17} />
            {item.label}
            {item.label === 'Messages' && (
              <MessagesUnreadBadge />
            )}
          </NavLink>
          );
        })}
      </div>
    </aside>
  );
}

// Small badge for unread messages count in sidebar
function MessagesUnreadBadge() {
  const count = (() => {
    try {
      const msgs = JSON.parse(localStorage.getItem('khyathi-contact-messages') || '[]');
      const readIds = new Set(JSON.parse(localStorage.getItem('admin-msgs-read') || '[]'));
      return msgs.filter(m => !readIds.has(m.id)).length;
    } catch { return 0; }
  })();

  if (!count) return null;
  return (
    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-maroon text-white text-[10px] font-bold px-1">
      {count}
    </span>
  );
}
