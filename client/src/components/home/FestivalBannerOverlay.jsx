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
  const creditLine = activeBanner?.creditLine || 'Website made by WayzenTech';
  const creditContact = activeBanner?.creditContact || '9398724704';
  const creditParts = creditLine.match(/^(.*?)(Wayzen\s*Tech|WayzenTech)(.*)$/i);

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
            className="relative w-full max-w-[min(92vw,760px)] overflow-hidden rounded-[10px] border border-white/65 bg-[#f8f6fb] text-primary shadow-[0_34px_96px_rgba(0,0,0,0.48)]"
            initial={{ opacity: 0, y: 26, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.96 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative aspect-video overflow-hidden bg-white">
              <motion.div
                role="img"
                aria-label={activeBanner.title}
                className="absolute inset-0 h-full w-full"
                style={{
                  backgroundImage: `url("${imageUrl}")`,
                  backgroundSize: 'cover',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center center',
                }}
                initial={{ scale: 1.02 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              />
              <div className="pointer-events-none absolute inset-0 border border-white/70" />
            </div>
            <button
              type="button"
              onClick={closeBanner}
              className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/35 bg-black/50 text-white shadow-[0_18px_42px_rgba(0,0,0,0.28)] backdrop-blur-xl transition hover:scale-105 hover:bg-black/65"
              aria-label="Close festival banner"
            >
              <X size={20} />
            </button>
            <motion.div
              initial={{ opacity: 0, y: 34 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.7 }}
              className="relative z-10 bg-gradient-to-b from-white to-[#f4f1f8] px-5 pb-6 pt-7 text-center sm:px-8 sm:pb-8 sm:pt-8"
            >
              <h1 className="mx-auto max-w-xl font-heading text-3xl leading-tight text-[#1f1046] sm:text-4xl">
                {activeBanner.title}
              </h1>
              {activeBanner.subtitle ? (
                <p className="mx-auto mt-2 line-clamp-2 max-w-lg text-sm leading-6 text-[#6f6682]">
                  {activeBanner.subtitle}
                </p>
              ) : null}
              <div className="mt-5 flex justify-center">
                <Link
                  to={activeBanner.redirectUrl || '/collections'}
                  onClick={closeBanner}
                  className="inline-flex min-h-12 min-w-[260px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#32105f] to-[#7b3eed] px-7 py-3 text-base font-bold text-white shadow-[0_18px_46px_rgba(76,35,156,0.25)] transition hover:scale-[1.02]"
                >
                  Continue to Website
                  <ArrowRight size={15} />
                </Link>
              </div>
              <div className="mt-6 border-t border-[#ded8e8] pt-5 text-sm text-[#807790]">
                <span>{creditParts ? creditParts[1] : creditLine.replace(/Wayzen\s*Tech|WayzenTech/i, '').trim()}</span>
                <span className="font-extrabold text-[#3b1592]"> {creditParts ? creditParts[2].replace(/\s+/g, '') : 'WayzenTech'}</span>
                {creditParts?.[3] ? <span>{creditParts[3]}</span> : null}
                <span className="ml-3 inline-flex font-extrabold text-[#7b3eed]">{creditContact}</span>
              </div>
            </motion.div>
          </motion.div>
        </motion.section>
      ) : null}
    </AnimatePresence>
  );
}
