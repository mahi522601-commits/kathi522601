import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../utils/formatPrice';
import { getFeaturedProducts } from '../../firebase/productsService';
import { validateCoupon } from '../../firebase/couponService';
import QuantitySelector from './QuantitySelector';
import { CloseIcon, TrashIcon } from './Icons';

const cartDrawerVariants = {
  hidden: { x: '100%' },
  visible: { x: 0, transition: { type: 'spring', damping: 25, stiffness: 200 } },
  exit: { x: '100%' },
};

export default function CartDrawer({ open, onClose }) {
  const { items, itemCount, subtotal, updateQuantity, removeFromCart, quoteLoading } = useCart();
  const navigate = useNavigate();
  const [orderNoteOpen, setOrderNoteOpen] = useState(false);
  const [couponOpen, setCouponOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponResult, setCouponResult] = useState(null);
  const [popularProducts, setPopularProducts] = useState([]);

  useEffect(() => {
    getFeaturedProducts(3).then(setPopularProducts).catch(() => {
      //
    });
  }, []);

  const total = useMemo(() => subtotal - (couponResult?.discountAmount || 0), [couponResult, subtotal]);

  async function applyCoupon() {
    try {
      const coupon = await validateCoupon(couponCode, subtotal);
      setCouponResult(coupon);
      toast.success(`Coupon applied! ${coupon.discount}% off`);
    } catch (error) {
      setCouponResult(null);
      toast.error(error.message || 'Invalid coupon code');
    }
  }

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            className="fixed inset-0 z-[70] bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed inset-y-0 right-0 z-[80] flex w-full max-w-[380px] flex-col bg-[#fcfaf7] shadow-soft"
            variants={cartDrawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="flex items-center justify-between border-b border-borderwarm px-6 py-5">
              <div>
                <p className="font-heading text-3xl text-primary">Your Cart</p>
                <p className="text-sm text-muted">({itemCount}) items</p>
              </div>
              <button type="button" onClick={onClose} className="text-primary">
                <CloseIcon />
              </button>
            </div>

            <div className="flex-1 overflow-auto px-6 py-5">
              {itemCount ? (
                <div className="space-y-4">
                  {quoteLoading && !items.length ? (
                    <div className="rounded-[1.4rem] border border-borderwarm bg-white p-4 text-sm text-muted">
                      Refreshing latest prices...
                    </div>
                  ) : items.map((item) => (
                    <div key={`${item.productId}-${item.color}`} className="rounded-[1.4rem] border border-borderwarm bg-white p-3">
                      <div className="flex gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-[88px] w-[70px] rounded-2xl object-cover"
                          loading="lazy"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="line-clamp-2 text-sm font-semibold text-primary">{item.name}</p>
                              <p className="mt-1 text-xs text-muted">Color: {item.color}</p>
                              <p className="mt-2 text-sm font-semibold text-primary">{formatPrice(item.salePrice)}</p>
                            </div>
                            <button
                              type="button"
                              className="rounded-full p-2 text-muted transition hover:bg-cream hover:text-primary"
                              onClick={() => removeFromCart(item.productId, item.color)}
                            >
                              <TrashIcon />
                            </button>
                          </div>
                          <div className="mt-3">
                            <QuantitySelector
                              compact
                              value={item.qty}
                              max={item.stockQuantity}
                              onChange={(value) => updateQuantity(item.productId, item.color, value)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-[1.7rem] border border-dashed border-borderwarm bg-white px-6 py-10 text-center">
                  <p className="font-heading text-3xl text-primary">Your cart is empty</p>
                  <p className="mt-3 text-sm text-muted">Start with a new arrival or explore our best sellers.</p>
                  <Link to="/collections" className="action-button mt-6 inline-flex" onClick={onClose}>
                    Continue Shopping
                  </Link>
                </div>
              )}

              <div className="mt-6 space-y-4">
                <div className="rounded-[1.4rem] border border-borderwarm bg-white">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-semibold text-primary"
                    onClick={() => setOrderNoteOpen((current) => !current)}
                  >
                    Add Order Note
                    <span>{orderNoteOpen ? 'âˆ’' : '+'}</span>
                  </button>
                  {orderNoteOpen ? (
                    <div className="border-t border-borderwarm px-5 pb-5">
                      <textarea rows="4" className="mt-4 w-full rounded-3xl border border-borderwarm p-4 text-sm outline-none" placeholder="Add a note for your order..." />
                    </div>
                  ) : null}
                </div>

                <div className="rounded-[1.4rem] border border-borderwarm bg-white">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-semibold text-primary"
                    onClick={() => setCouponOpen((current) => !current)}
                  >
                    Add Coupon Code
                    <span>{couponOpen ? 'âˆ’' : '+'}</span>
                  </button>
                  {couponOpen ? (
                    <div className="border-t border-borderwarm px-5 pb-5">
                      <div className="mt-4 flex gap-3">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(event) => setCouponCode(event.target.value)}
                          className="input-shell"
                          placeholder="Enter coupon"
                        />
                        <button type="button" className="action-button whitespace-nowrap" onClick={applyCoupon}>
                          Apply
                        </button>
                      </div>
                      {couponResult ? (
                        <p className="mt-3 text-sm text-emerald-600">
                          Coupon applied. You saved {formatPrice(couponResult.discountAmount)}.
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>

              {popularProducts.length ? (
                <div className="mt-8">
                  <p className="font-heading text-2xl text-primary">Popular Products</p>
                  <div className="mt-4 space-y-3">
                    {popularProducts.map((product) => (
                      <Link
                        key={product.id}
                        to={`/product/${product.id}`}
                        onClick={onClose}
                        className="flex items-center gap-3 rounded-[1.4rem] border border-borderwarm bg-white p-3"
                      >
                        <img src={product.images[0]} alt={product.name} className="h-16 w-14 rounded-2xl object-cover" loading="lazy" />
                        <div>
                          <p className="line-clamp-2 text-sm font-semibold text-primary">{product.name}</p>
                          <p className="mt-1 text-sm text-body">{formatPrice(product.salePrice)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="border-t border-borderwarm px-6 py-5">
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted">Subtotal</span>
                  <span className="font-semibold text-primary">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">Shipping</span>
                  <span className="font-semibold text-primary">Free</span>
                </div>
                {couponResult ? (
                  <div className="flex items-center justify-between text-emerald-600">
                    <span>Discount</span>
                    <span>-{formatPrice(couponResult.discountAmount)}</span>
                  </div>
                ) : null}
                <div className="flex items-center justify-between border-t border-borderwarm pt-3">
                  <span className="font-semibold text-primary">Total</span>
                  <span className="text-lg font-semibold text-primary">{formatPrice(total)}</span>
                </div>
              </div>

              <button
                type="button"
                className="action-button mt-5 w-full"
                onClick={() => {
                  navigate('/checkout');
                  onClose();
                }}
              >
                Proceed To Checkout
              </button>
              <Link to="/cart" className="mt-4 block text-center text-sm font-semibold text-primary" onClick={onClose}>
                View Cart
              </Link>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
