import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getSiteSettings, fallbackSiteSettings } from '../../firebase/settingsService';
import { useProducts } from '../../hooks/useProducts';

const AUTO_SLIDE_MS = 2000;

function resolveImageUrl(image) {
  return image?.displayUrl || image?.url || image?.thumbnail || image || '';
}

export default function HeroSection() {
  const { products } = useProducts();
  const [siteSettings, setSiteSettings] = useState(fallbackSiteSettings);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let mounted = true;
    getSiteSettings().then((settings) => mounted && setSiteSettings(settings)).catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const slides = useMemo(() => {
    return (siteSettings.heroSlides || fallbackSiteSettings.heroSlides)
      .filter((slide) => slide.active ?? true)
      .map((slide, index) => {
        const product = products.find((item) => item.id === slide.productId || item.slug === slide.productId);
        const imageUrl = resolveImageUrl(slide.image || product?.imageObjects?.[0] || product?.images?.[0]);
        return {
          id: slide.id || `hero-${index}`,
          title: slide.title || product?.name || 'Khyathi Collections',
          imageUrl,
          href: slide.redirectUrl || (product ? `/product/${product.id}` : '/collections'),
        };
      })
      .filter((slide) => slide.imageUrl);
  }, [products, siteSettings.heroSlides]);

  useEffect(() => {
    if (slides.length < 2) {
      return undefined;
    }
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, AUTO_SLIDE_MS);
    return () => clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    if (activeIndex >= slides.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, slides.length]);

  const activeSlide = slides[activeIndex];
  if (!activeSlide) {
    return null;
  }

  return (
    <section className="relative min-h-[82vh] overflow-hidden bg-[#0A1F44]">
      <AnimatePresence mode="wait">
        <motion.img
          key={activeSlide.id}
          src={activeSlide.imageUrl}
          alt={activeSlide.title}
          className="absolute inset-0 h-full w-full object-cover object-top"
          loading="eager"
          decoding="async"
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-r from-[#0A1F44]/86 via-[#0A1F44]/36 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#0A1F44]/78 to-transparent" />

      <div className="page-shell relative z-10 flex min-h-[82vh] items-center">
        <div className="max-w-3xl py-20 text-[#F8F8F8]">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#C8A96B]">
            Khyathi Collections
          </p>
          <AnimatePresence mode="wait">
            <motion.h1
              key={activeSlide.title}
              className="mt-5 font-heading text-6xl leading-none md:text-8xl"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.45 }}
            >
              {activeSlide.title}
            </motion.h1>
          </AnimatePresence>
          <Link
            to={activeSlide.href}
            className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#C8A96B] px-7 py-4 text-sm font-bold uppercase tracking-[0.16em] text-[#0A1F44] shadow-[0_18px_46px_rgba(0,0,0,0.24)] transition hover:bg-[#F8F8F8]"
          >
            Shop Now
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      <div className="page-shell absolute inset-x-0 bottom-6 z-10 flex gap-2">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            className={`h-1.5 rounded-full transition-all ${
              index === activeIndex ? 'w-12 bg-[#C8A96B]' : 'w-5 bg-white/40'
            }`}
            onClick={() => setActiveIndex(index)}
            aria-label={`Show ${slide.title}`}
          />
        ))}
      </div>
    </section>
  );
}
