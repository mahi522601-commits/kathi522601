import { AnimatePresence, motion } from 'framer-motion';
import { PhoneCall } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CloseIcon } from '../ui/Icons';
import BrandLogo from '../ui/BrandLogo';
import { siteConfig } from '../../config/site';

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
            className="fixed inset-y-0 right-0 z-[60] w-[86vw] max-w-sm overflow-y-auto bg-[#fbf8f4] p-6 md:hidden"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 24, stiffness: 220 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BrandLogo size="sm" />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-gold-dark">
                    {siteConfig.name}
                  </p>
                  <p className="mt-1 text-xs text-muted">{siteConfig.location}</p>
                </div>
              </div>
              <button type="button" className="text-primary" onClick={onClose} aria-label="Close menu">
                <CloseIcon />
              </button>
            </div>

            <div className="mt-10 space-y-5">
              {siteConfig.mobileDrawerLinks.map((item) => (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={onClose}
                  className="block border-b border-borderwarm pb-3 font-heading text-[2rem] text-primary"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="mt-10 rounded-[1.7rem] border border-borderwarm bg-white px-5 py-6">
              <p className="text-xs uppercase tracking-[0.2em] text-gold-dark">Need quick help?</p>
              <p className="mt-3 text-sm leading-6 text-body">
                Call us directly for saree styling help, delivery support, or product guidance.
              </p>
              <a
                href={siteConfig.phoneHref}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold tracking-[0.08em] text-white"
              >
                <PhoneCall size={16} />
                Call {siteConfig.phoneDisplay}
              </a>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
