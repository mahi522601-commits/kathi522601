import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Menu, Search, ShoppingBag, User } from 'lucide-react';
import MobileNav from './MobileNav';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';
import BrandLogo from '../ui/BrandLogo';
import { siteConfig } from '../../config/site';

function CountBadge({ count, tone = 'maroon' }) {
  if (count <= 0) {
    return null;
  }

  return (
    <motion.span
      key={count}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-sm"
      style={{ background: tone === 'maroon' ? 'var(--color-maroon)' : '#1a1a1a' }}
    >
      {count}
    </motion.span>
  );
}

export default function Header({ onOpenSearch, onOpenCart }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { itemCount } = useCart();
  const { wishlist } = useWishlist();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 18);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location]);

  return (
    <>
      <header
        className="sticky top-0 z-40 transition-all duration-500"
        style={{
          background: scrolled ? 'rgba(255, 253, 248, 0.96)' : '#faf7f2',
          borderBottom: '1px solid rgba(28,18,10,0.06)',
          boxShadow: scrolled ? '0 16px 36px -18px rgba(28,18,10,0.18)' : 'none',
        }}
      >
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
          <div className="relative flex h-[80px] items-center justify-between md:h-[96px]">
            <div className="flex flex-1 items-center justify-start gap-2">
              <button
                onClick={() => setMobileNavOpen(true)}
                className="icon-btn lg:hidden"
                type="button"
                aria-label="Open menu"
              >
                <Menu size={24} />
              </button>

              <nav className="hidden items-center gap-7 lg:flex xl:gap-9">
                {siteConfig.desktopNav.left.map((item) => (
                  <Link
                    key={item.label}
                    to={item.path}
                    className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#3c2a1b] transition-colors hover:text-gold"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
              <Link to="/" className="pointer-events-auto flex flex-col items-center" aria-label={siteConfig.name}>
                <motion.div whileHover={{ scale: 1.03 }}>
                  <BrandLogo size="lg" className="h-[54px] w-[54px] md:h-[72px] md:w-[72px]" />
                </motion.div>
                <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-gold-dark lg:hidden">
                  Home
                </span>
              </Link>
            </div>

            <div className="flex flex-1 items-center justify-end gap-2 md:gap-3 lg:gap-5">
              <nav className="hidden items-center gap-6 lg:flex xl:gap-8">
                {siteConfig.desktopNav.right.map((item) => (
                  <Link
                    key={item.label}
                    to={item.path}
                    className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#3c2a1b] transition-colors hover:text-gold"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <button
                onClick={onOpenSearch}
                className="icon-btn transition-transform hover:scale-110"
                type="button"
                aria-label="Open search"
              >
                <Search size={22} strokeWidth={1.5} />
              </button>

              <Link
                to="/wishlist"
                className="icon-btn relative hidden transition-transform hover:scale-110 sm:flex"
                aria-label="Wishlist"
              >
                <Heart size={22} strokeWidth={1.5} />
                <CountBadge count={wishlist.length} />
              </Link>

              <button
                onClick={onOpenCart}
                className="icon-btn relative transition-transform hover:scale-110"
                type="button"
                aria-label="Open cart"
              >
                <ShoppingBag size={22} strokeWidth={1.5} />
                <CountBadge count={itemCount} tone="dark" />
              </button>

              <Link
                to="/account"
                className="icon-btn hidden transition-transform hover:scale-110 sm:flex"
                aria-label="Account"
              >
                <User size={22} strokeWidth={1.5} />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
    </>
  );
}
