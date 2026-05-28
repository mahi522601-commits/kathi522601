import { Link, useLocation } from 'react-router-dom';
import { Gem, Search, Shirt, UserRound } from 'lucide-react';
import { siteConfig } from '../../config/site';
import BrandLogo from '../ui/BrandLogo';

const tabIcons = {
  jewellery: Gem,
  sarees: Shirt,
  search: Search,
  account: UserRound,
};

export default function BottomNav({ onOpenSearch }) {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-borderwarm bg-white/94 shadow-[0_-16px_34px_rgba(28,18,10,0.12)] backdrop-blur-xl md:hidden">
      <div className="relative grid grid-cols-5">
        {siteConfig.mobileBottomNav.map((tab) => {
          const Icon = tabIcons[tab.key];
          const active =
            tab.key === 'search'
              ? location.pathname === '/search'
              : location.pathname === tab.path ||
                (tab.path !== '/' && location.pathname.startsWith(tab.path));

          const content =
            tab.key === 'home' ? (
              <span className="relative -mt-6 mb-1 flex min-h-[76px] flex-col items-center justify-start text-[11px] font-semibold text-[#1c120a]">
                <span
                  className={`flex h-[54px] w-[54px] items-center justify-center transition-transform duration-200 ${
                    active ? 'scale-105' : ''
                  }`}
                >
                  <BrandLogo
                    size="md"
                    className="h-[54px] w-[54px]"
                    imageClassName="h-full w-full object-contain"
                    placeholderClassName="h-full w-full"
                  />
                </span>
                <span className="mt-1 leading-none">{tab.label}</span>
              </span>
            ) : (
              <span
                className={`mx-1 my-2 flex min-h-[58px] flex-col items-center justify-center rounded-full px-1.5 py-2 text-[11px] transition ${
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
              <button key={tab.key} type="button" onClick={onOpenSearch} className="flex justify-center">
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
