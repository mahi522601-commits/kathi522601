import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';
import { formatPrice } from '../../utils/formatPrice';
import ColorSwatch from './ColorSwatch';
import QuantitySelector from './QuantitySelector';
import { CloseIcon, HeartIcon } from './Icons';
import SafeImage from './SafeImage';

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, scale: 0.95 },
};

export default function QuickViewModal({ open, onClose, product }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [activeImage, setActiveImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] || null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setSelectedColor(product?.colors?.[0] || null);
    setQuantity(1);
    setActiveImage(0);
  }, [product?.id, product?.slug]);

  if (!product) {
    return null;
  }

  const sourceImages = product.imageObjects?.length ? product.imageObjects : product.images || [];
  const images = sourceImages.length ? sourceImages : ['/logo.png'];
  const stockQuantity = Math.max(0, Math.floor(Number(product.stockQuantity || 0)));
  const isAvailable = product.inStock && !product.soldOut && stockQuantity > 0;

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            className="fixed inset-0 z-[80] bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed left-1/2 top-1/2 z-[90] w-[calc(100vw-2rem)] max-w-5xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[2rem] bg-[#fcfaf7] shadow-soft"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <button
              type="button"
              className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-primary shadow"
              onClick={onClose}
            >
              <CloseIcon className="h-5 w-5" />
            </button>

            <div className="grid max-h-[85vh] overflow-auto lg:grid-cols-2">
              <div className="bg-white p-5 md:p-7">
                <div className="overflow-hidden rounded-[1.6rem] bg-cream">
                  <SafeImage
                    src={typeof images[activeImage] === 'string' ? images[activeImage] : images[activeImage]?.displayUrl || images[activeImage]?.url || images[activeImage]?.thumbnail}
                    alt={product.name}
                    className="h-[360px] w-full object-cover md:h-[520px]"
                    loading="lazy"
                    minValidWidth={300}
                    minValidHeight={300}
                  />
                </div>
                <div className="mt-4 grid grid-cols-4 gap-3">
                  {images.slice(0, 4).map((image, index) => {
                    const thumbnail = typeof image === 'string' ? image : image.mediumUrl || image.medium?.url || image.thumbnail || image.displayUrl || image.url;
                    return (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() => setActiveImage(index)}
                      className={`overflow-hidden rounded-2xl border ${
                        activeImage === index ? 'border-primary' : 'border-borderwarm'
                      }`}
                    >
                      <SafeImage src={thumbnail} alt="" className="h-24 w-full object-cover" loading="lazy" />
                    </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-6 md:p-8">
                <p className="text-sm text-muted">Collections &gt; {product.category}</p>
                <h3 className="mt-3 font-heading text-4xl font-semibold text-primary">{product.name}</h3>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <p className="text-xl font-semibold text-primary">{formatPrice(product.salePrice)}</p>
                  <p className="text-base text-muted line-through">{formatPrice(product.originalPrice)}</p>
                  <span className="rounded-full bg-maroon px-3 py-1 text-xs font-semibold text-white">
                    {product.discountPercent}% OFF
                  </span>
                </div>

                <div className="mt-7">
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
                    Color: {selectedColor?.name || 'Select'}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {product.colors?.map((color) => (
                      <ColorSwatch
                        key={color.name}
                        color={color}
                        selected={selectedColor?.name === color.name}
                        onClick={() => setSelectedColor(color)}
                        showLabel
                      />
                    ))}
                  </div>
                </div>

                <div className="mt-7">
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">Quantity</p>
                  <div className="mt-3">
                    <QuantitySelector value={quantity} onChange={setQuantity} max={stockQuantity} />
                  </div>
                  {isAvailable ? (
                    <p className="mt-2 text-xs font-semibold text-emerald-700">{stockQuantity} available</p>
                  ) : null}
                </div>

                <div className="mt-8 space-y-3">
                  <button
                    type="button"
                    className={`action-button w-full ${
                      !isAvailable ? 'cursor-not-allowed bg-[#a8937b] hover:bg-[#a8937b]' : ''
                    }`}
                    onClick={() => {
                      if (addToCart(product, selectedColor, quantity)) {
                        onClose();
                      }
                    }}
                    disabled={!isAvailable}
                  >
                    {isAvailable ? 'Add to Cart' : 'Sold Out'}
                  </button>
                  <Link to={`/product/${product.id}`} className="action-button-outline w-full" onClick={onClose}>
                    View Full Product
                  </Link>
                  <button
                    type="button"
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-borderwarm px-5 py-3 text-sm font-semibold text-primary"
                    onClick={() => toggleWishlist(product.id)}
                  >
                    <HeartIcon filled={isInWishlist(product.id)} className="h-4 w-4" />
                    Add to Wishlist
                  </button>
                </div>

                <div className="mt-8 border-t border-borderwarm pt-6 text-sm leading-7 text-body">
                  <p>{product.description}</p>
                  <p className="mt-3">
                    <span className="font-semibold text-primary">Fabric:</span> {product.fabricDetails}
                  </p>
                  <p className="mt-2">
                    <span className="font-semibold text-primary">Care:</span> {product.careInstructions}
                  </p>
                  <p className="mt-2">
                    <span className="font-semibold text-primary">Delivery:</span> Free shipping on all orders
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
