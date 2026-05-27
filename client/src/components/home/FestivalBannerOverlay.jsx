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
          className="fixed inset-0 z-[70] min-h-screen overflow-hidden bg-black text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45 }}
        >
          <motion.div
            role="img"
            aria-label={activeBanner.title}
            className="absolute inset-0 h-full w-full object-cover"
            style={{
              backgroundImage: `url("${imageUrl}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
            }}
            initial={{ scale: 1.04 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/35" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-transparent to-black/25" />

          <button
            type="button"
            onClick={closeBanner}
            className="fixed right-4 top-4 z-20 flex h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-white/15 text-white shadow-[0_18px_42px_rgba(0,0,0,0.28)] backdrop-blur-xl transition hover:scale-105 hover:bg-white/25 sm:right-6 sm:top-6"
            style={{ paddingTop: 'env(safe-area-inset-top)' }}
            aria-label="Close festival banner"
          >
            <X size={21} />
          </button>

          <div className="relative z-10 flex min-h-screen items-end px-5 pb-24 pt-20 sm:px-8 md:items-center md:pb-16 lg:px-14">
            <motion.div
              initial={{ opacity: 0, y: 34 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.7 }}
              className="max-w-xl pb-[env(safe-area-inset-bottom)]"
            >
              <span className="inline-flex rounded-full border border-[#f6d878]/40 bg-black/30 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#f6d878] backdrop-blur-md">
                Festival Edit
              </span>
              <h1 className="mt-5 font-heading text-[3.2rem] leading-[0.9] text-white sm:text-6xl md:text-7xl">
                {activeBanner.title}
              </h1>
              <p className="mt-5 max-w-md text-sm leading-7 text-white/78 sm:text-base">
                {activeBanner.subtitle}
              </p>
              <Link
                to={activeBanner.redirectUrl || '/collections'}
                onClick={closeBanner}
                className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#fffaf0] px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-primary shadow-[0_18px_46px_rgba(246,216,120,0.22)] transition hover:bg-[#f6d878]"
              >
                Explore Offers
                <ArrowRight size={16} />
              </Link>
            </motion.div>
          </div>
        </motion.section>
      ) : null}
    </AnimatePresence>
  );
}
