import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { getSiteSettings, fallbackSiteSettings } from '../../firebase/settingsService';
import { useProducts } from '../../hooks/useProducts';
import { formatPrice } from '../../utils/formatPrice';

const AUTO_SLIDE_MS = 5000; // 5 seconds â€” more cinematic

function resolveImageUrl(image) {
  return image?.displayUrl || image?.url || image?.thumbnail || image || '';
}

const slideVariants = {
  enter: (dir) => ({ opacity: 0, scale: 1.08, x: dir > 0 ? 60 : -60 }),
  center: { opacity: 1, scale: 1, x: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: (dir) => ({ opacity: 0, scale: 0.96, x: dir > 0 ? -60 : 60, transition: { duration: 0.5, ease: 'easeIn' } }),
};

const textVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (delay = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.65, delay, ease: [0.25, 0.46, 0.45, 0.94] } }),
  exit: { opacity: 0, y: -30, transition: { duration: 0.35 } },
};

export default function HeroSection() {
  const { products } = useProducts();
  const [siteSettings, setSiteSettings] = useState(fallbackSiteSettings);
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const heroRef = useRef(null);
  const progressRef = useRef(null);
  const startRef = useRef(Date.now());

  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 500], [0, 80]);

  useEffect(() => {
    let mounted = true;
    getSiteSettings().then(s => { if (mounted) setSiteSettings(s); }).catch(() => {});
    return () => { mounted = false; };
  }, []);

  const slides = useMemo(() => {
    const fallbackProduct = products[0] || null;
    return (siteSettings.heroSlides || fallbackSiteSettings.heroSlides)
      .filter((slide) => slide.active ?? true)
      .map((slide) => {
        const product = products.find(e => e.id === slide.productId || e.slug === slide.productId) || fallbackProduct;
        return {
          ...slide,
          product,
          href: slide.redirectUrl || (product ? `/product/${product.id}` : '/collections'),
          imageUrl: resolveImageUrl(slide.image || product?.imageObjects?.[0] || product?.images?.[0]),
          title: product?.name || slide.title || 'Khyathi Collections',
          subtitle: slide.subtitle || product?.description || 'Discover refined drapes, premium fabrics, and occasion-ready elegance.',
          price: product?.salePrice || null,
          category: product?.category || 'Luxury Edit',
          tags: product?.tags || [],
        };
      })
      .filter(s => s.imageUrl);
  }, [products, siteSettings.heroSlides]);

  // Auto-slide with progress tracking
  useEffect(() => {
    if (!slides.length || isPaused) return;

    startRef.current = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startRef.current;
      setProgress(Math.min((elapsed / AUTO_SLIDE_MS) * 100, 100));
    };
    progressRef.current = setInterval(tick, 16);

    const timer = setTimeout(() => {
      setDirection(1);
      setActiveIndex(i => (i + 1) % slides.length);
      startRef.current = Date.now();
      setProgress(0);
    }, AUTO_SLIDE_MS);

    return () => { clearInterval(progressRef.current); clearTimeout(timer); };
  }, [activeIndex, slides.length, isPaused]);

  useEffect(() => { if (activeIndex >= slides.length) setActiveIndex(0); }, [activeIndex, slides.length]);

  function goTo(index) {
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
    setProgress(0);
    startRef.current = Date.now();
  }
  function prev() { goTo(activeIndex === 0 ? slides.length - 1 : activeIndex - 1); }
  function next() { goTo((activeIndex + 1) % slides.length); }

  const activeSlide = slides[activeIndex] || null;
  if (!activeSlide) return null;

  return (
    <section
      ref={heroRef}
      className="relative overflow-hidden"
      style={{ minHeight: 'min(92vh, 820px)', background: '#0e0a06' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background image with parallax */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={`bg-${activeIndex}`}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0"
          style={{ y: parallaxY }}
        >
          <img
            src={activeSlide.imageUrl}
            alt={activeSlide.title}
            className="h-full w-full object-cover object-top"
            style={{ transform: 'scale(1.05)' }}
            loading="eager"
          />
          {/* Cinematic gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
          {/* Subtle grain texture for luxury feel */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")', backgroundRepeat: 'repeat', backgroundSize: '120px' }} />
        </motion.div>
      </AnimatePresence>

      {/* Floating category tags â€” decorative */}
      <div className="pointer-events-none absolute top-8 right-8 hidden lg:flex flex-col gap-2 items-end z-10">
        {activeSlide.tags.slice(0, 3).map((tag, i) => (
          <motion.span
            key={`${tag}-${activeIndex}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 0.6, x: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/50 border border-white/15 rounded-full px-3 py-1"
          >
            {tag}
          </motion.span>
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 page-shell h-full flex items-center" style={{ minHeight: 'min(92vh, 820px)' }}>
        <div className="w-full grid lg:grid-cols-[1fr_auto] gap-8 items-center py-16 lg:py-20">
          {/* Text column */}
          <div className="max-w-[680px]">
            {/* Eyebrow */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`eye-${activeIndex}`}
                variants={textVariants}
                custom={0}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="flex items-center gap-3 mb-5"
              >
                <span className="h-px w-12 bg-gold/70" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.35em] text-gold">
                  {activeSlide.eyebrow || activeSlide.category}
                </span>
              </motion.div>
            </AnimatePresence>

            {/* Headline */}
            <AnimatePresence mode="wait">
              <motion.h1
                key={`h-${activeIndex}`}
                variants={textVariants}
                custom={0.1}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="font-heading text-white leading-[0.92]"
                style={{ fontSize: 'clamp(3rem, 6.5vw, 7rem)' }}
              >
                {activeSlide.title}
              </motion.h1>
            </AnimatePresence>

            {/* Subtitle */}
            <AnimatePresence mode="wait">
              <motion.p
                key={`sub-${activeIndex}`}
                variants={textVariants}
                custom={0.2}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="mt-5 text-white/65 leading-7 max-w-[480px]"
                style={{ fontSize: 'clamp(0.875rem, 1.2vw, 1.05rem)' }}
              >
                {activeSlide.subtitle}
              </motion.p>
            </AnimatePresence>

            {/* Price + CTA */}
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
                {activeSlide.price && (
                  <div className="border border-white/20 rounded-2xl px-5 py-3 backdrop-blur-sm bg-white/5">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">Starting At</p>
                    <p className="font-heading text-2xl text-gold mt-0.5">{formatPrice(activeSlide.price)}</p>
                  </div>
                )}
                <Link to={activeSlide.href} className="group inline-flex items-center gap-2 bg-white text-primary rounded-full px-7 py-3.5 text-sm font-semibold tracking-[0.08em] uppercase transition-all hover:bg-gold hover:text-white hover:shadow-[0_8px_32px_rgba(201,168,76,0.4)]">
                  Shop This Look
                  <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                </Link>
                <Link to="/collections" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium tracking-wide transition-colors">
                  Explore All
                  <ArrowRight size={13} />
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Slide thumbnails â€” vertical strip on desktop */}
          <div className="hidden lg:flex flex-col gap-3 items-end">
            {slides.map((slide, i) => (
              <motion.button
                key={slide.id}
                type="button"
                onClick={() => goTo(i)}
                whileHover={{ scale: 1.05 }}
                className={`relative overflow-hidden rounded-2xl transition-all duration-500 ${i === activeIndex ? 'opacity-100 ring-2 ring-gold ring-offset-2 ring-offset-black/60' : 'opacity-40 hover:opacity-70'}`}
                style={{ width: i === activeIndex ? 100 : 76, height: i === activeIndex ? 130 : 100 }}
              >
                <img src={slide.imageUrl} alt={slide.title} className="h-full w-full object-cover" />
                {i === activeIndex && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
                    <p className="text-[9px] font-semibold uppercase tracking-widest text-white/80 line-clamp-2 leading-tight">{slide.title}</p>
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar: dots + arrows + progress */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        {/* Progress bar */}
        <div className="h-0.5 bg-white/10">
          <motion.div
            className="h-full bg-gold"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.05, ease: 'linear' }}
          />
        </div>

        <div className="page-shell flex items-center justify-between py-5">
          {/* Slide counter + dots */}
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-white/40 tracking-widest tabular-nums">
              {String(activeIndex + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
            </span>
            <div className="flex items-center gap-1.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goTo(i)}
                  className={`transition-all duration-500 rounded-full bg-white ${i === activeIndex ? 'w-8 h-1.5 opacity-100' : 'w-1.5 h-1.5 opacity-30 hover:opacity-60'}`}
                />
              ))}
            </div>
          </div>

          {/* Arrows */}
          <div className="flex items-center gap-2">
            <button type="button" onClick={prev} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/60 transition hover:bg-white/10 hover:text-white">
              <ChevronLeft size={18} />
            </button>
            <button type="button" onClick={next} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/60 transition hover:bg-white/10 hover:text-white">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Pause indicator */}
      <AnimatePresence>
        {isPaused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-black/40 backdrop-blur px-3 py-1.5 text-[10px] text-white/50 uppercase tracking-widest z-20"
          >
            <span className="h-1 w-1 rounded-full bg-gold animate-pulse" />
            Paused
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
