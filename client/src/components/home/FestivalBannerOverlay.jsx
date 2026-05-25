import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, X } from 'lucide-react';
import { fallbackSiteSettings, getSiteSettings } from '../../firebase/settingsService';
import {
  festivalDismissKey,
  getActiveFestivalBanner,
  resolveBannerImage,
} from '../../utils/bannerScheduling';

export default function FestivalBannerOverlay() {
  const [settings, setSettings] = useState(fallbackSiteSettings);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let mounted = true;
    getSiteSettings()
      .then((response) => {
        if (mounted) {
          setSettings(response);
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  const activeBanner = useMemo(
    () => getActiveFestivalBanner(settings.festivalBanners || []),
    [settings.festivalBanners],
  );

  useEffect(() => {
    if (!activeBanner?.id) {
      return;
    }

    setDismissed(localStorage.getItem(festivalDismissKey(activeBanner.id)) === 'true');
  }, [activeBanner?.id]);

  function closeBanner() {
    if (activeBanner?.id) {
      localStorage.setItem(festivalDismissKey(activeBanner.id), 'true');
    }
    setDismissed(true);
  }

  const imageUrl = resolveBannerImage(activeBanner?.image);

  return (
    <AnimatePresence>
      {activeBanner && imageUrl && !dismissed ? (
        <motion.section
          className="fixed inset-0 z-[70] flex min-h-screen items-center justify-center overflow-hidden bg-black/70 px-4 py-8 text-white backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45 }}
        >
          <motion.div
            className="relative aspect-video w-full max-w-[min(92vw,760px)] overflow-hidden rounded-[22px] border border-white/35 bg-black shadow-[0_30px_90px_rgba(0,0,0,0.42)]"
            initial={{ opacity: 0, y: 26, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.96 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              role="img"
              aria-label={activeBanner.title}
              className="absolute inset-0 h-full w-full"
              style={{
                backgroundImage: `url("${imageUrl}")`,
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center center',
              }}
              initial={{ scale: 1.02 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/86 via-black/22 to-black/30" />
            <div className="pointer-events-none absolute inset-2 rounded-[17px] border border-white/50 sm:inset-3" />
            <button
              type="button"
              onClick={closeBanner}
              className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/35 text-white shadow-[0_18px_42px_rgba(0,0,0,0.28)] backdrop-blur-xl transition hover:scale-105 hover:bg-white/20"
              aria-label="Close festival banner"
            >
              <X size={20} />
            </button>
            <motion.div
              initial={{ opacity: 0, y: 34 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.7 }}
              className="absolute inset-x-0 bottom-0 z-10 px-4 pb-11 pt-14 text-center sm:px-8 sm:pb-14"
            >
              <span className="inline-flex rounded-full border border-[#f6d878]/40 bg-black/30 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.22em] text-[#f6d878] backdrop-blur-md">
                Festival Edit
              </span>
              <h1 className="mx-auto mt-3 max-w-xl font-heading text-3xl leading-none text-white sm:text-5xl">
                {activeBanner.title}
              </h1>
              <p className="mx-auto mt-3 line-clamp-2 max-w-lg text-xs leading-5 text-white/82 sm:text-sm">
                {activeBanner.subtitle}
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                <Link
                  to={activeBanner.redirectUrl || '/collections'}
                  onClick={closeBanner}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[#fffaf0] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary shadow-[0_18px_46px_rgba(246,216,120,0.22)] transition hover:bg-[#f6d878]"
                >
                  Continue Website
                  <ArrowRight size={15} />
                </Link>
                <button
                  type="button"
                  onClick={closeBanner}
                  className="inline-flex min-h-10 items-center justify-center rounded-full border border-white/35 bg-black/30 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-md transition hover:bg-white/15"
                >
                  Wrong Option
                </button>
              </div>
            </motion.div>
            <div className="absolute inset-x-0 bottom-2 z-20 px-4 text-center text-[9px] font-semibold uppercase tracking-[0.12em] text-white/86 sm:bottom-3 sm:text-[10px]">
              {activeBanner.creditLine || 'Website made by WayzenTech'} | {activeBanner.creditContact || '9398724704'}
            </div>
          </motion.div>
        </motion.section>
      ) : null}
    </AnimatePresence>
  );
}
