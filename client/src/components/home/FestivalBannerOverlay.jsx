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
          className="fixed inset-0 z-[70] flex min-h-screen items-center justify-center overflow-hidden bg-black/72 px-3 py-6 text-white backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45 }}
        >
          <motion.div
            className="relative w-full max-w-[980px] overflow-hidden rounded-[28px] border border-[#f6d878]/45 bg-[#120b07] shadow-[0_32px_110px_rgba(0,0,0,0.5)]"
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              type="button"
              onClick={closeBanner}
              className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-black/35 text-white shadow-[0_12px_28px_rgba(0,0,0,0.24)] backdrop-blur-xl transition hover:scale-105 hover:bg-black/50"
              aria-label="Close festival banner"
            >
              <X size={19} />
            </button>

            <Link to={activeBanner.redirectUrl || '/collections'} onClick={closeBanner} className="block">
              <div className="relative min-h-[430px] overflow-hidden sm:min-h-[520px] md:min-h-[560px]">
                <img
                  src={imageUrl}
                  alt={activeBanner.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/84 via-black/34 to-black/5" />
                <div className="absolute inset-x-0 bottom-0 p-5 md:p-8">
                  <span className="inline-flex rounded-full border border-[#f6d878]/40 bg-white/12 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#f6d878] backdrop-blur-md">
                    Limited Festival Edit
                  </span>
                  <h1 className="mt-4 max-w-2xl font-heading text-4xl leading-none text-white md:text-6xl">
                    {activeBanner.title}
                  </h1>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-white/82 md:text-base">
                    {activeBanner.subtitle}
                  </p>
                  <span className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#fffaf0] px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-primary shadow-[0_18px_46px_rgba(246,216,120,0.22)]">
                    Explore Offers
                    <ArrowRight size={15} />
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        </motion.section>
      ) : null}
    </AnimatePresence>
  );
}
