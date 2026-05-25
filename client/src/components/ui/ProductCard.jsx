import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';
import { formatPrice } from '../../utils/formatPrice';
import Badge from './Badge';
import ColorSwatch from './ColorSwatch';
import { EyeIcon, HeartIcon } from './Icons';
import QuickViewModal from './QuickViewModal';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [showQuickView, setShowQuickView] = useState(false);
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || null);
  const visibleColors = useMemo(() => product.colors?.slice(0, 6) || [], [product.colors]);
  const extraCount = Math.max((product.colors?.length || 0) - visibleColors.length, 0);
  const primaryImage = product.thumbnails?.[0] || product.images?.[0];
  const hoverImage = product.thumbnails?.[1] || product.images?.[1] || primaryImage;

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
            <div className="relative h-[240px] bg-cream sm:h-[320px] lg:h-[360px]">
              <img
                src={primaryImage}
                alt={product.name}
                className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03] group-hover:opacity-0"
                loading="lazy"
              />
              <img
                src={hoverImage}
                alt={product.name}
                className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-500 group-hover:scale-[1.03] group-hover:opacity-100"
                loading="lazy"
              />
            </div>
          </Link>

          <div className="absolute left-3 top-3">
            {product.soldOut ? <Badge tone="muted">Sold Out</Badge> : <Badge>Sale</Badge>}
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
                product.soldOut ? 'bg-white/20 text-white/60' : 'bg-primary text-white'
              }`}
              disabled={product.soldOut}
              onClick={() => addToCart(product, selectedColor || product.colors?.[0], 1)}
            >
              {product.soldOut ? 'Sold Out' : 'Quick Add'}
            </button>
          </div>
        </div>

        <div className="space-y-3 p-3 sm:p-4">
          <Link to={`/product/${product.id}`} className="line-clamp-2 text-sm font-semibold text-primary sm:text-[15px]">
            {product.name}
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-primary">{formatPrice(product.salePrice)}</p>
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
