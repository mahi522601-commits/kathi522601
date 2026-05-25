import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Shirt, ShoppingBag, UserRound } from 'lucide-react';
import { siteConfig } from '../../config/site';
import { useCart } from '../../hooks/useCart';

const tabIcons = {
  home: Home,
  sarees: Shirt,
  search: Search,
  cart: ShoppingBag,
  account: UserRound,
};

export default function BottomNav({ onOpenSearch, onOpenCart }) {
  const location = useLocation();
  const { itemCount } = useCart();

  return (
    <nav className="fixed bottom-3 left-3 right-3 z-40 rounded-[24px] border border-white/70 bg-white/90 shadow-[0_18px_46px_rgba(28,18,10,0.16)] backdrop-blur-xl md:hidden">
      <div className="grid grid-cols-5 px-1 py-1">
        {siteConfig.mobileBottomNav.map((tab) => {
          const Icon = tabIcons[tab.key];
          const active =
            tab.key === 'search'
              ? location.pathname === '/search'
              : tab.key === 'cart'
                ? location.pathname === '/cart'
              : location.pathname === tab.path ||
                (tab.path !== '/' && location.pathname.startsWith(tab.path));

          const content = (
            <span
              className={`relative mx-1 flex min-h-[58px] flex-col items-center justify-center rounded-[18px] px-1 py-2 text-[10px] font-semibold transition ${
                active
                  ? 'bg-[#0A1F44] text-white shadow-[0_10px_24px_rgba(10,31,68,0.18)]'
                  : 'text-[#8f7b67]'
              }`}
            >
              <Icon size={18} strokeWidth={1.8} />
              <span className="mt-1.5">{tab.label}</span>
              {tab.key === 'cart' && itemCount > 0 ? (
                <span className="absolute right-2 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-maroon px-1 text-[9px] font-bold text-white">
                  {itemCount}
                </span>
              ) : null}
            </span>
          );

          if (tab.key === 'search') {
            return (
              <button key={tab.key} type="button" onClick={onOpenSearch} className="flex justify-center">
                {content}
              </button>
            );
          }

          if (tab.key === 'cart') {
            return (
              <button key={tab.key} type="button" onClick={onOpenCart} className="flex justify-center">
                {content}
              </button>
            );
          }

          return (
            <Link key={tab.key} to={tab.path} className="flex justify-center">
              {content}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
