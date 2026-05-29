import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';
import { formatPrice } from '../../utils/formatPrice';
import Badge from './Badge';
import ColorSwatch from './ColorSwatch';
import { EyeIcon, HeartIcon } from './Icons';
import QuickViewModal from './QuickViewModal';
import SafeImage from './SafeImage';

function resolveCardImage(image) {
  if (!image) {
    return '';
  }

  if (typeof image === 'string') {
    return image;
  }

  return image.thumbnail || image.medium?.url || image.displayUrl || image.url || '';
}

export default function ProductCard({ product, priority = false }) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [showQuickView, setShowQuickView] = useState(false);
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || null);
  const visibleColors = useMemo(() => product.colors?.slice(0, 6) || [], [product.colors]);
  const extraCount = Math.max((product.colors?.length || 0) - visibleColors.length, 0);
  const cardImages = useMemo(() => {
    const sourceImages = product.imageObjects?.length ? product.imageObjects : product.images || [];
    return sourceImages.map(resolveCardImage).filter(Boolean).slice(0, 2);
  }, [product.imageObjects, product.images]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const primaryImage = cardImages[0] || '/logo.png';
  const isAvailable = product.inStock && !product.soldOut && Number(product.stockQuantity || 0) > 0;

  useEffect(() => {
    setActiveImageIndex(0);
  }, [product.id]);

  useEffect(() => {
    if (cardImages.length < 2) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setActiveImageIndex((current) => (current + 1) % cardImages.length);
    }, 3000);

    return () => window.clearInterval(timer);
  }, [cardImages.length]);

  return (
    <>
      <motion.article
        layout
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        className="group card-surface overflow-hidden"
      >
        <div className="relative overflow-hidden">
          <Link to={`/product/${product.id}`} className="block">
            <div className="relative aspect-[9/16] min-h-[310px] bg-cream sm:min-h-[420px] lg:min-h-[460px]">
              {(cardImages.length ? cardImages : [primaryImage]).map((image, index) => (
                <SafeImage
                  key={`${image}-${index}`}
                  src={image}
                  alt={product.name}
                  className={`absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03] ${
                    index === activeImageIndex ? 'opacity-100' : 'opacity-0'
                  }`}
                  loading={priority && index === 0 ? 'eager' : 'lazy'}
                  fetchPriority={priority && index === 0 ? 'high' : 'auto'}
                  decoding="async"
                />
              ))}
            </div>
          </Link>

          <div className="absolute left-3 top-3">
            {isAvailable ? <Badge>Sale</Badge> : <Badge tone="muted">Sold Out</Badge>}
          </div>

          <button
            type="button"
            className={`absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 shadow transition ${
              isInWishlist(product.id) ? 'text-maroon' : 'text-primary'
            }`}
            onClick={() => toggleWishlist(product.id)}
          >
            <HeartIcon filled={isInWishlist(product.id)} className="h-4 w-4" />
          </button>

          <div className="absolute inset-x-0 bottom-0 translate-y-full space-y-2 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent px-4 pb-4 pt-14 text-white transition duration-300 group-hover:translate-y-0">
            <button
              type="button"
              className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.18em] text-white/90"
              onClick={() => setShowQuickView(true)}
            >
              <EyeIcon />
              Quick View
            </button>
            <button
              type="button"
              className={`flex h-10 w-full items-center justify-center rounded-full text-sm font-semibold ${
                isAvailable ? 'bg-primary text-white' : 'bg-white/20 text-white/60'
              }`}
              disabled={!isAvailable}
              onClick={() => addToCart(product, selectedColor || product.colors?.[0], 1)}
            >
              {isAvailable ? 'Quick Add' : 'Sold Out'}
            </button>
          </div>
        </div>

        <div className="space-y-2 p-3 sm:space-y-3 sm:p-4">
          <Link to={`/product/${product.id}`} className="line-clamp-2 text-sm font-semibold text-primary sm:text-[15px]">
            {product.name}
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-primary sm:text-base">{formatPrice(product.salePrice)}</p>
            <p className="text-sm text-muted line-through">{formatPrice(product.originalPrice)}</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {visibleColors.map((color) => (
                <ColorSwatch
                  key={color.name}
                  color={color}
                  selected={selectedColor?.name === color.name}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
            {extraCount > 0 ? <span className="text-xs text-muted">+{extraCount}</span> : null}
          </div>
        </div>
      </motion.article>

      <QuickViewModal
        open={showQuickView}
        onClose={() => setShowQuickView(false)}
        product={product}
      />
    </>
  );
}
