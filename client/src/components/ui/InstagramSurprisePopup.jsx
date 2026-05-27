import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Instagram, Sparkles, X } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { siteConfig } from '../../config/site';

const POPUP_KEY = 'khyathi-instagram-surprise-dismissed';

export default function InstagramSurprisePopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(POPUP_KEY) === 'true') {
      return undefined;
    }

    const timer = window.setTimeout(() => setOpen(true), 5200);
    return () => window.clearTimeout(timer);
  }, []);

  function dismiss() {
    localStorage.setItem(POPUP_KEY, 'true');
    setOpen(false);
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[65] flex items-end justify-center bg-black/55 px-3 pb-3 pt-16 backdrop-blur-md sm:items-center sm:p-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 48, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 32, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 190, damping: 22 }}
            className="relative flex min-h-[calc(100dvh-1.5rem)] w-full max-w-md overflow-hidden rounded-[28px] border border-[#f6d878]/45 bg-[#140d08]/88 p-[1px] shadow-[0_28px_90px_rgba(0,0,0,0.42)] sm:min-h-0"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(246,216,120,0.34),transparent_38%),radial-gradient(circle_at_85%_22%,rgba(255,250,240,0.18),transparent_30%)]" />
            <motion.div
              className="absolute -right-14 -top-14 h-36 w-36 rounded-full bg-[#f6d878]/20 blur-3xl"
              animate={{ y: [0, 12, 0], opacity: [0.45, 0.75, 0.45] }}
              transition={{ duration: 4, repeat: Infinity }}
            />

            <div className="relative flex min-h-full w-full flex-col justify-center rounded-[27px] border border-white/10 bg-white/[0.08] px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-[calc(1.5rem+env(safe-area-inset-top))] text-center text-white backdrop-blur-xl sm:block sm:px-7 sm:pb-7 sm:pt-6">
              <button
                type="button"
                onClick={dismiss}
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur transition hover:scale-105 hover:bg-white/20"
                aria-label="Close Instagram popup"
              >
                <X size={18} />
              </button>

              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[#f6d878]/30 bg-[#fffaf0]/10">
                <BrandLogo size="lg" className="h-16 w-16" />
              </div>
              <div className="mx-auto mt-5 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#f6d878] via-[#d43f84] to-[#6c2bd9] text-white shadow-[0_0_34px_rgba(246,216,120,0.25)]">
                <Instagram size={24} />
              </div>
              <p className="mt-5 inline-flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#f6d878]">
                <Sparkles size={14} />
                Surprise Offers
              </p>
              <h2 className="mt-3 font-heading text-4xl leading-tight text-[#fffaf0]">
                Follow us on Instagram and get surprise offers
              </h2>
              <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-white/72">
                New festive drops, premium saree edits, and limited-time styling updates go live there first.
              </p>

              <a
                href={siteConfig.instagramUrl}
                target="_blank"
                rel="noreferrer"
                onClick={dismiss}
                className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#fffaf0] px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-primary shadow-[0_16px_46px_rgba(246,216,120,0.18)] transition hover:bg-[#f6d878]"
              >
                <Instagram size={18} />
                Follow Khyathi
              </a>

              <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-xs text-white/58">
                Website made by{' '}
                <a
                  className="font-semibold text-[#f6d878] transition hover:text-white"
                  href="https://www.instagram.com/way_zentech/"
                  target="_blank"
                  rel="noreferrer"
                >
                  WayZenTech
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
