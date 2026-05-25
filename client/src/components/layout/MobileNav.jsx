import { AnimatePresence, motion } from 'framer-motion';
import { Gem, Home, MessageCircle, PhoneCall, Search, Shirt, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CloseIcon } from '../ui/Icons';
import BrandLogo from '../ui/BrandLogo';
import { siteConfig } from '../../config/site';

const drawerLinks = [
  { label: 'Home', path: '/', icon: Home },
  { label: 'Sarees', path: '/collections/sarees', icon: Shirt },
  { label: 'Jewellery', path: '/jewellery', icon: Gem },
  { label: 'Search', path: '/search', icon: Search },
  { label: 'Account', path: '/account', icon: UserRound },
];

export default function MobileNav({ open, onClose }) {
  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed inset-y-0 right-0 z-[60] w-[90vw] max-w-sm overflow-y-auto rounded-l-[30px] border-l border-white/70 bg-[#fbf8f4] p-5 shadow-[0_30px_90px_rgba(28,18,10,0.28)] md:hidden"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 24, stiffness: 220 }}
          >
            <div className="flex items-center justify-between rounded-[22px] bg-white p-3 shadow-sm">
              <div className="flex items-center gap-3">
                <BrandLogo size="sm" />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-gold-dark">
                    {siteConfig.name}
                  </p>
                  <p className="mt-1 text-xs text-muted">{siteConfig.location}</p>
                </div>
              </div>
              <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full bg-cream text-primary" onClick={onClose} aria-label="Close menu">
                <CloseIcon />
              </button>
            </div>

            <div className="mt-6 grid gap-3">
              {drawerLinks.map(({ icon: Icon, ...item }) => (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={onClose}
                  className="flex min-h-14 items-center justify-between rounded-[18px] border border-borderwarm bg-white px-4 py-3 text-primary shadow-sm transition hover:border-gold"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cream text-gold-dark">
                      <Icon size={18} />
                    </span>
                    <span className="font-heading text-2xl">{item.label}</span>
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Open</span>
                </Link>
              ))}
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-borderwarm bg-[#0A1F44] px-5 py-6 text-white">
              <p className="text-xs uppercase tracking-[0.2em] text-gold-dark">Need quick help?</p>
              <p className="mt-3 text-sm leading-6 text-white/78">
                Call us directly for saree styling help, delivery support, or product guidance.
              </p>
              <div className="mt-5 grid gap-3">
                <a
                  href={siteConfig.phoneHref}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold tracking-[0.08em] text-primary"
                >
                  <PhoneCall size={16} />
                  Call {siteConfig.phoneDisplay}
                </a>
                <a
                  href={siteConfig.whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-5 py-3 text-sm font-semibold tracking-[0.08em] text-white"
                >
                  <MessageCircle size={16} />
                  WhatsApp Support
                </a>
              </div>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
