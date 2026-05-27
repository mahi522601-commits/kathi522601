import { Link, useLocation } from 'react-router-dom';
import { Gem, Search, Shirt, UserRound } from 'lucide-react';
import { siteConfig } from '../../config/site';

const tabIcons = {
  jewellery: Gem,
  sarees: Shirt,
  search: Search,
  account: UserRound,
};

export default function BottomNav({ onOpenSearch }) {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-borderwarm bg-white/92 backdrop-blur-xl md:hidden">
      <div className="grid grid-cols-4">
        {siteConfig.mobileBottomNav.map((tab) => {
          const Icon = tabIcons[tab.key];
          const active =
            tab.key === 'search'
              ? location.pathname === '/search'
              : location.pathname === tab.path ||
                (tab.path !== '/' && location.pathname.startsWith(tab.path));

          const content = (
            <span
              className={`mx-2 my-2 flex flex-col items-center rounded-full px-2 py-2 text-[11px] transition ${
                active
                  ? 'bg-[#1c120a] text-white shadow-[0_10px_24px_rgba(28,18,10,0.18)]'
                  : 'text-[#8f7b67]'
              }`}
            >
              <Icon size={18} strokeWidth={1.8} />
              <span className="mt-1.5">{tab.label}</span>
            </span>
          );

          if (tab.key === 'search') {
            return (
              <button key={tab.key} type="button" onClick={onOpenSearch} className="flex">
                {content}
              </button>
            );
          }

          return (
            <Link key={tab.key} to={tab.path} className="flex">
              {content}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
