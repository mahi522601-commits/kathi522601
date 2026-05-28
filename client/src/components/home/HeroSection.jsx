import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { getSiteSettings, fallbackSiteSettings } from '../../firebase/settingsService';
import { useProducts } from '../../hooks/useProducts';
import { formatPrice } from '../../utils/formatPrice';

const AUTO_SLIDE_MS = 4500;

function resolveImageUrl(image) {
  if (!image) {
    return '';
  }

  if (typeof image === 'string') {
    return image;
  }

  return image.url || image.displayUrl || image.medium?.url || image.thumbnail || '';
}

const imageVariants = {
  enter: (dir) => ({ opacity: 0, scale: 0.98, x: dir > 0 ? 42 : -42 }),
  center: {
    opacity: 1,
    scale: 1,
    x: 0,
    transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: (dir) => ({
    opacity: 0,
    scale: 1.02,
    x: dir > 0 ? -42 : 42,
    transition: { duration: 0.35, ease: 'easeIn' },
  }),
};

const textVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
  exit: { opacity: 0, y: -22, transition: { duration: 0.25 } },
};

export default function HeroSection() {
  const { products } = useProducts();
  const [siteSettings, setSiteSettings] = useState(fallbackSiteSettings);
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(null);
  const startRef = useRef(Date.now());

  useEffect(() => {
    let mounted = true;
    getSiteSettings()
      .then((settings) => {
        if (mounted) {
          setSiteSettings(settings);
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const slides = useMemo(() => {
    const fallbackProduct = products[0] || null;
    return (siteSettings.heroSlides || fallbackSiteSettings.heroSlides)
      .filter((slide) => slide.active ?? true)
      .map((slide) => {
        const product =
          products.find((entry) => entry.id === slide.productId || entry.slug === slide.productId) ||
          fallbackProduct;
        return {
          ...slide,
          product,
          href: slide.redirectUrl || (product ? `/product/${product.id}` : '/collections'),
          imageUrl: resolveImageUrl(slide.image || product?.imageObjects?.[0] || product?.images?.[0]),
          title: product?.name || slide.title || 'Khyathi Collections',
          subtitle:
            slide.subtitle ||
            product?.description ||
            'Discover refined drapes, premium fabrics, and occasion-ready elegance.',
          price: product?.salePrice || null,
          category: product?.category || 'Luxury Edit',
          tags: product?.tags || [],
        };
      })
      .filter((slide) => slide.imageUrl);
  }, [products, siteSettings.heroSlides]);

  useEffect(() => {
    if (typeof window === 'undefined' || slides.length < 2) {
      return;
    }

    const nextSlide = slides[(activeIndex + 1) % slides.length];
    if (!nextSlide?.imageUrl) {
      return;
    }

    const image = new Image();
    image.decoding = 'async';
    image.src = nextSlide.imageUrl;
  }, [activeIndex, slides]);

  useEffect(() => {
    if (!slides.length || isPaused) {
      return undefined;
    }

    startRef.current = Date.now();
    progressRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      setProgress(Math.min((elapsed / AUTO_SLIDE_MS) * 100, 100));
    }, 16);

    const timer = window.setTimeout(() => {
      setDirection(1);
      setActiveIndex((index) => (index + 1) % slides.length);
      startRef.current = Date.now();
      setProgress(0);
    }, AUTO_SLIDE_MS);

    return () => {
      window.clearInterval(progressRef.current);
      window.clearTimeout(timer);
    };
  }, [activeIndex, slides.length, isPaused]);

  useEffect(() => {
    if (activeIndex >= slides.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, slides.length]);

  function goTo(index) {
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
    setProgress(0);
    startRef.current = Date.now();
  }

  function prev() {
    goTo(activeIndex === 0 ? slides.length - 1 : activeIndex - 1);
  }

  function next() {
    goTo((activeIndex + 1) % slides.length);
  }

  const activeSlide = slides[activeIndex] || null;
  if (!activeSlide) {
    return null;
  }

  return (
    <section
      className="relative overflow-hidden bg-[#f8f1e6] text-primary"
      style={{ minHeight: 'min(86vh, 820px)' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gold/50" />
      <div className="pointer-events-none absolute inset-y-0 left-[6vw] hidden w-px bg-primary/10 lg:block" />
      <div className="pointer-events-none absolute inset-y-0 right-[6vw] hidden w-px bg-primary/10 lg:block" />

      <div className="pointer-events-none absolute inset-x-0 top-20 z-0 overflow-hidden text-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={`watermark-${activeIndex}`}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 0.07, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.45 }}
            className="font-heading text-[22vw] leading-none text-primary"
          >
            Sarees
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="relative z-10 page-shell flex min-h-[min(86vh,820px)] items-center py-14 lg:py-16">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[minmax(230px,0.72fr)_minmax(360px,0.9fr)_minmax(220px,0.62fr)] xl:grid-cols-[minmax(280px,0.72fr)_minmax(460px,0.9fr)_minmax(260px,0.62fr)]">
          <div className="order-2 max-w-[560px] lg:order-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={`eye-${activeIndex}`}
                variants={textVariants}
                custom={0}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="mb-5 flex items-center gap-3"
              >
                <span className="h-px w-12 bg-gold" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-gold-dark">
                  {activeSlide.eyebrow || activeSlide.category}
                </span>
              </motion.div>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.h1
                key={`h-${activeIndex}`}
                variants={textVariants}
                custom={0.1}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="font-heading leading-[0.95] text-primary"
                style={{ fontSize: 'clamp(3.2rem, 6.2vw, 7rem)' }}
              >
                {activeSlide.title}
              </motion.h1>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.p
                key={`sub-${activeIndex}`}
                variants={textVariants}
                custom={0.2}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="mt-5 max-w-[460px] text-sm leading-7 text-body sm:text-base"
              >
                {activeSlide.subtitle}
              </motion.p>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.div
                key={`cta-${activeIndex}`}
                variants={textVariants}
                custom={0.3}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="mt-8 flex flex-wrap items-center gap-4"
              >
                {activeSlide.price ? (
                  <div className="border-l-2 border-gold pl-4">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Starting At</p>
                    <p className="mt-0.5 font-heading text-2xl text-primary">
                      {formatPrice(activeSlide.price)}
                    </p>
                  </div>
                ) : null}
                <Link
                  to={activeSlide.href}
                  className="group inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.08em] text-white transition-all hover:bg-gold-dark"
                >
                  Shop This Look
                  <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/collections"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-gold-dark"
                >
                  Explore All
                  <ArrowRight size={13} />
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="order-1 mx-auto w-full max-w-[560px] lg:order-2">
            <div className="relative aspect-[3/4] min-h-[410px] overflow-hidden rounded-t-[16rem] border border-gold/40 bg-[#fffaf1] shadow-[0_28px_80px_rgba(28,18,10,0.18)] sm:min-h-[560px] lg:min-h-[640px]">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.img
                  key={`frame-${activeIndex}`}
                  custom={direction}
                  variants={imageVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  src={activeSlide.imageUrl}
                  alt={activeSlide.title}
                  className="absolute inset-0 h-full w-full object-contain object-center"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  draggable="false"
                />
              </AnimatePresence>
              <div className="pointer-events-none absolute inset-x-6 bottom-6 top-6 rounded-t-[16rem] border border-gold/25" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#fffaf1] to-transparent" />
            </div>
          </div>

          <div className="order-3 lg:pl-2">
            <div className="flex items-center justify-between gap-4 lg:block">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-dark">
                  {activeSlide.category}
                </p>
                <p className="mt-3 max-w-[260px] text-sm leading-6 text-body">
                  Fresh picks rotate smoothly with image-safe fitting for every screen size.
                </p>
              </div>

              <div className="mt-0 flex items-center gap-2 lg:mt-7">
                <button
                  type="button"
                  onClick={prev}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-primary/20 text-primary transition hover:border-gold hover:text-gold-dark"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={next}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-primary/20 text-primary transition hover:border-gold hover:text-gold-dark"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            <div className="mt-7 flex gap-2 overflow-hidden lg:grid lg:grid-cols-2">
              {slides.slice(0, 4).map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => goTo(index)}
                  className={`relative h-20 w-16 shrink-0 overflow-hidden rounded-t-full border transition lg:h-28 lg:w-full ${
                    index === activeIndex
                      ? 'border-gold opacity-100'
                      : 'border-primary/10 opacity-55 hover:opacity-85'
                  }`}
                >
                  <img
                    src={slide.imageUrl}
                    alt={slide.title}
                    className="h-full w-full object-cover object-top"
                    loading="lazy"
                    decoding="async"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10">
        <div className="overflow-hidden border-y border-gold/25 bg-[#1c120a] py-2 text-[#fffaf0]">
          <motion.div
            className="flex min-w-max gap-10 whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.24em]"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          >
            {Array.from({ length: 6 }).map((_, index) => (
              <span key={index}>Website Designed by WayZenTech - 9398724704</span>
            ))}
          </motion.div>
        </div>
        <div className="h-1 bg-primary/10">
          <motion.div
            className="h-full bg-gold"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.05, ease: 'linear' }}
          />
        </div>
        <div className="page-shell flex items-center justify-between py-5">
          <span className="text-xs font-semibold tracking-[0.2em] text-muted tabular-nums">
            {String(activeIndex + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
          </span>
          <div className="flex items-center gap-1.5">
            {slides.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => goTo(index)}
                className={`rounded-full bg-primary transition-all duration-500 ${
                  index === activeIndex ? 'h-1.5 w-9 opacity-100' : 'h-1.5 w-1.5 opacity-30 hover:opacity-60'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isPaused ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute left-1/2 top-5 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-primary/10 bg-white/80 px-3 py-1.5 text-[10px] uppercase tracking-widest text-muted backdrop-blur"
          >
            <span className="h-1 w-1 rounded-full bg-gold animate-pulse" />
            Paused
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
