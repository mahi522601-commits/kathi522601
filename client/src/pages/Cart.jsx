import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useCart } from '../hooks/useCart';
import { validateCoupon } from '../firebase/couponService';
import QuantitySelector from '../components/ui/QuantitySelector';
import { TrashIcon } from '../components/ui/Icons';
import { formatPrice } from '../utils/formatPrice';

export default function Cart() {
  const navigate = useNavigate();
  const { items, subtotal, updateQuantity, removeFromCart } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [couponPulse, setCouponPulse] = useState(false);
  const total = subtotal - (coupon?.discountAmount || 0);

  async function applyCoupon() {
    try {
      const response = await validateCoupon(couponCode.trim().toUpperCase(), subtotal);
      setCoupon(response);
      setCouponCode(response.code || couponCode.trim().toUpperCase());
      setCouponPulse(true);
      window.setTimeout(() => setCouponPulse(false), 1800);
      toast.success(`Coupon applied. You saved ${formatPrice(response.discountAmount)}.`);
    } catch (error) {
      setCoupon(null);
      setCouponPulse(false);
      toast.error(error.message || 'Invalid coupon code');
    }
  }

  return (
    <>
      <Helmet>
        <title>Your Cart | Khyathi Collections</title>
      </Helmet>
      <section className="section-block">
        <div className="page-shell">
          <h1 className="section-title">Your Cart</h1>

          {!items.length ? (
            <div className="mt-10 rounded-[1.8rem] border border-dashed border-borderwarm bg-white px-6 py-16 text-center">
              <p className="font-heading text-4xl text-primary">Your cart is empty</p>
              <p className="mt-3 text-sm text-muted">Let&apos;s find a piece you&apos;ll love wearing.</p>
              <Link to="/collections" className="action-button mt-6 inline-flex">
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.color}`} className="card-surface flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                    <img src={item.image} alt={item.name} className="h-32 w-28 rounded-[1.3rem] object-cover" loading="lazy" />
                    <div className="flex-1">
                      <p className="text-lg font-semibold text-primary">{item.name}</p>
                      <p className="mt-2 text-sm text-muted">Color: {item.color}</p>
                      <p className="mt-3 text-sm font-semibold text-primary">{formatPrice(item.salePrice)}</p>
                    </div>
                    <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                      <QuantitySelector compact value={item.qty} onChange={(value) => updateQuantity(item.productId, item.color, value)} />
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-primary"
                        onClick={() => removeFromCart(item.productId, item.color)}
                      >
                        <TrashIcon />
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <aside className={`card-surface h-fit p-6 transition ${couponPulse ? 'coupon-celebration' : ''}`}>
                <h2 className="font-heading text-3xl text-primary">Order Summary</h2>
                <div className="mt-6 flex gap-3">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                    className="input-shell"
                    placeholder="Coupon code"
                  />
                  <button type="button" className="action-button" onClick={applyCoupon}>
                    Apply
                  </button>
                </div>

                <div className="mt-6 space-y-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted">Subtotal</span>
                    <span className="font-semibold text-primary">{formatPrice(subtotal)}</span>
                  </div>
                  {coupon ? (
                    <div className="flex items-center justify-between text-emerald-600">
                      <span>Discount</span>
                      <span>-{formatPrice(coupon.discountAmount)}</span>
                    </div>
                  ) : null}
                  <div className="flex items-center justify-between">
                    <span className="text-muted">Shipping</span>
                    <span className="font-semibold text-primary">FREE</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-borderwarm pt-4">
                    <span className="font-semibold text-primary">Total</span>
                    <span className="text-lg font-semibold text-primary">{formatPrice(total)}</span>
                  </div>
                </div>

                <button type="button" className="action-button mt-6 w-full" onClick={() => navigate('/checkout')}>
                  Proceed To Checkout
                </button>
              </aside>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
