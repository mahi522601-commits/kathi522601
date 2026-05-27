import { Helmet } from 'react-helmet-async';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, RefreshCw, ShieldCheck, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import paymentsApi from '../api/paymentsApi';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { incrementCouponUsage, validateCoupon } from '../firebase/couponService';
import { formatPrice } from '../utils/formatPrice';
import { indianStates } from '../utils/indianCities';
import { siteConfig } from '../config/site';

const STEP_LABELS = ['Delivery', 'Payment', 'Review'];

const PAYMENT_APPS = [
  {
    id: 'phonepe',
    name: 'PhonePe',
    logo: 'पे',
    className: 'bg-[#5f259f] text-white',
  },
  {
    id: 'googlepay',
    name: 'Google Pay',
    logo: 'G',
    className: 'bg-white text-[#1a73e8]',
  },
  {
    id: 'paytm',
    name: 'Paytm',
    logo: 'Pay',
    className: 'bg-[#eaf7ff] text-[#00baf2]',
  },
];

export default function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const { userProfile, updateProfileFields } = useAuth();
  const [step, setStep] = useState(0);
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [saving, setSaving] = useState(false);
  const [paymentState, setPaymentState] = useState({ status: 'idle', message: '' });
  const [selectedPaymentApp, setSelectedPaymentApp] = useState(PAYMENT_APPS[0]);
  const [form, setForm] = useState({
    fullName: userProfile?.name || '',
    phone: userProfile?.phone || '',
    email: userProfile?.email || '',
    line1: '',
    line2: '',
    city: '',
    state: 'Andhra Pradesh',
    pincode: '',
  });

  useEffect(() => {
    if (!userProfile) {
      return;
    }
    setForm((current) => ({
      ...current,
      fullName: userProfile.name || current.fullName,
      phone: userProfile.phone || current.phone,
      email: userProfile.email || current.email,
    }));
  }, [userProfile]);

  const total = useMemo(() => subtotal - (coupon?.discountAmount || 0), [coupon, subtotal]);

  async function applyCoupon() {
    try {
      const response = await validateCoupon(couponCode, subtotal);
      setCoupon(response);
      toast.success(`Coupon applied. ${response.discount}% off`);
    } catch (error) {
      setCoupon(null);
      toast.error(error.message || 'Invalid coupon code');
    }
  }

  function validateDelivery() {
    const requiredFields = ['fullName', 'phone', 'email', 'line1', 'city', 'state', 'pincode'];

    for (const field of requiredFields) {
      if (!form[field]?.trim()) {
        toast.error(`Please fill ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }

    if (!/^\d{10,11}$/.test(form.phone.replace(/\s/g, ''))) {
      toast.error('Enter a valid phone number');
      return false;
    }

    if (!/^\d{6}$/.test(form.pincode)) {
      toast.error('Enter a valid 6-digit pincode');
      return false;
    }

    return true;
  }

  function buildOrderPayload(overrides = {}) {
    return {
      userId: userProfile?.uid || 'guest',
      customerName: form.fullName,
      email: form.email,
      phone: form.phone,
      address: {
        line1: form.line1,
        line2: form.line2,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
      },
      items,
      subtotal,
      couponCode: coupon?.code || null,
      discount: coupon?.discountAmount || 0,
      total,
      pricing: {
        subtotal,
        discount: coupon?.discountAmount || 0,
        couponCode: coupon?.code || null,
        shipping: 0,
        total,
      },
      ...overrides,
    };
  }

  async function finalizeCheckout(order) {
    if (coupon?.code) {
      try {
        await incrementCouponUsage(coupon.code);
      } catch {
        // Preserve the successful checkout flow even if coupon sync is delayed.
      }
    }

    if (userProfile?.uid) {
      try {
        await updateProfileFields({
          addresses: [
            {
              line1: form.line1,
              line2: form.line2,
              city: form.city,
              state: form.state,
              pincode: form.pincode,
            },
          ],
        });
      } catch {
        // Address sync can safely happen later without blocking order completion.
      }
    }

    localStorage.setItem('khyathi-last-order', JSON.stringify(order));
    clearCart();
    navigate(userProfile?.uid ? `/receipt/${order.id}` : '/order-confirmation', {
      state: { order },
      replace: true,
    });
  }

  async function handlePayuPayment() {
    if (saving) {
      return;
    }

    if (!items.length) {
      toast.error('Your cart is empty');
      return;
    }

    setSaving(true);
    setPaymentState({ status: 'processing', message: '' });

    try {
      const orderPayload = buildOrderPayload({
        paymentMethod: selectedPaymentApp.name,
        paymentStatus: 'Pending',
        status: 'Pending',
      });

      localStorage.setItem('khyathi-pending-order', JSON.stringify(orderPayload));

      const response = await paymentsApi.createPayuOrder({
        amount: total,
        customer: {
          fullName: form.fullName,
          phone: form.phone,
          email: form.email,
        },
        items,
      });

      const formEl = document.createElement('form');
      formEl.method = 'POST';
      formEl.action = response.payuUrl;

      Object.entries(response.params).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        formEl.appendChild(input);
      });

      document.body.appendChild(formEl);
      formEl.submit();

    } catch (error) {
      setSaving(false);
      toast.error(error.message || 'Unable to start payment checkout.');
      setPaymentState({
        status: 'failed',
        message: error.message || 'Unable to start payment checkout.',
      });
    }
  }

  async function handleFinalCheckout() {
    await handlePayuPayment();
  }

  if (!items.length && step === 0) {
    return (
      <section className="section-block">
        <div className="page-shell py-20 text-center">
          <p className="font-heading text-5xl text-primary">Your cart is empty</p>
          <button onClick={() => navigate('/collections')} className="action-button mt-6">
            Shop Now
          </button>
        </div>
      </section>
    );
  }

  return (
    <>
      <Helmet>
        <title>Checkout | Khyathi Collections</title>
      </Helmet>
      <section className="min-h-screen bg-gradient-to-b from-[#faf7f2] to-[#f2ede4] py-10">
        <div className="page-shell max-w-6xl">
          <div className="mb-10 flex items-center justify-center gap-0">
            {STEP_LABELS.map((label, index) => (
              <div key={label} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-300 ${
                      index < step
                        ? 'border-gold bg-gold text-white'
                        : index === step
                        ? 'scale-110 border-primary bg-primary text-white'
                        : 'border-borderwarm bg-white text-muted'
                    }`}
                  >
                    {index < step ? <Check size={16} /> : index + 1}
                  </div>
                  <span
                    className={`mt-1.5 text-xs font-semibold uppercase tracking-widest ${
                      index === step ? 'text-primary' : 'text-muted'
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {index < STEP_LABELS.length - 1 ? (
                  <div
                    className={`mx-2 mb-5 h-0.5 w-20 transition-all duration-500 sm:w-32 ${
                      index < step ? 'bg-gold' : 'bg-borderwarm'
                    }`}
                  />
                ) : null}
              </div>
            ))}
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            <AnimatePresence mode="wait">
              {step === 0 ? (
                <motion.div
                  key="delivery"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="card-surface p-6 md:p-8"
                >
                  <h2 className="mb-6 font-heading text-4xl text-primary">Delivery Details</h2>
                  <p className="mb-6 -mt-3 text-sm text-muted">
                    Fill in your delivery information carefully so we can keep every update smooth.
                  </p>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted">
                        Full Name *
                      </label>
                      <input
                        className="input-shell"
                        placeholder="e.g. Priya Sharma"
                        value={form.fullName}
                        onChange={(event) => setForm({ ...form, fullName: event.target.value })}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted">
                        Phone Number *
                      </label>
                      <input
                        className="input-shell"
                        placeholder="10 or 11 digit phone number"
                        value={form.phone}
                        onChange={(event) => setForm({ ...form, phone: event.target.value })}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        className="input-shell"
                        placeholder="for order updates"
                        value={form.email}
                        onChange={(event) => setForm({ ...form, email: event.target.value })}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted">
                        Address Line 1 *
                      </label>
                      <input
                        className="input-shell"
                        placeholder="House no., street, area"
                        value={form.line1}
                        onChange={(event) => setForm({ ...form, line1: event.target.value })}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted">
                        Address Line 2
                      </label>
                      <input
                        className="input-shell"
                        placeholder="Landmark or locality"
                        value={form.line2}
                        onChange={(event) => setForm({ ...form, line2: event.target.value })}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted">
                        City *
                      </label>
                      <input
                        className="input-shell"
                        placeholder="City"
                        value={form.city}
                        onChange={(event) => setForm({ ...form, city: event.target.value })}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted">
                        Pincode *
                      </label>
                      <input
                        className="input-shell"
                        placeholder="6-digit pincode"
                        value={form.pincode}
                        onChange={(event) => setForm({ ...form, pincode: event.target.value })}
                        maxLength={6}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted">
                        State *
                      </label>
                      <select
                        className="input-shell"
                        value={form.state}
                        onChange={(event) => setForm({ ...form, state: event.target.value })}
                      >
                        {indianStates.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="action-button mt-8 w-full py-4 text-base"
                    onClick={() => {
                      if (validateDelivery()) {
                        setStep(1);
                      }
                    }}
                  >
                    Continue to Payment
                  </button>
                </motion.div>
              ) : null}

              {step === 1 ? (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="card-surface space-y-8 p-6 md:p-8"
                >
                  <h2 className="font-heading text-4xl text-primary">Payment Method</h2>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {PAYMENT_APPS.map((app) => {
                      const selected = selectedPaymentApp.id === app.id;
                      return (
                        <button
                          key={app.id}
                          type="button"
                          className={`rounded-[1.35rem] border-2 bg-white p-4 text-left transition ${
                            selected
                              ? 'border-gold shadow-[0_14px_36px_rgba(201,168,76,0.22)]'
                              : 'border-borderwarm hover:border-gold/70'
                          }`}
                          onClick={() => setSelectedPaymentApp(app)}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div
                              className={`flex h-12 w-12 items-center justify-center rounded-2xl border border-black/5 text-lg font-black shadow-sm ${app.className}`}
                            >
                              {app.logo}
                            </div>
                            <div
                              className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                                selected ? 'border-gold' : 'border-borderwarm'
                              }`}
                            >
                              {selected ? <div className="h-2.5 w-2.5 rounded-full bg-gold" /> : null}
                            </div>
                          </div>
                          <p className="mt-4 font-semibold text-primary">{app.name}</p>
                        </button>
                      );
                    })}
                  </div>

                  {paymentState.status === 'failed' ? (
                    <div className="rounded-[1.4rem] border border-red-100 bg-red-50 px-4 py-4 text-sm text-red-700">
                      <p className="font-semibold">Payment could not be completed</p>
                      <p className="mt-1">{paymentState.message}</p>
                    </div>
                  ) : null}

                  <div className="flex gap-3 pt-2">
                    <button type="button" className="action-button-outline flex-1" onClick={() => setStep(0)}>
                      Back
                    </button>
                    <button type="button" className="action-button flex-1" onClick={() => setStep(2)}>
                      Review Order
                    </button>
                  </div>
                </motion.div>
              ) : null}

              {step === 2 ? (
                <motion.div
                  key="review"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="card-surface space-y-6 p-6 md:p-8"
                >
                  <h2 className="font-heading text-4xl text-primary">Review Your Order</h2>

                  <div className="rounded-2xl bg-cream p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted">
                        Delivery To
                      </p>
                      <button
                        type="button"
                        onClick={() => setStep(0)}
                        className="text-xs font-semibold text-gold hover:underline"
                      >
                        Edit
                      </button>
                    </div>
                    <p className="font-semibold text-primary">{form.fullName}</p>
                    <p className="mt-1 text-sm text-body">
                      {form.phone} | {form.email}
                    </p>
                    <p className="mt-1 text-sm text-body">
                      {form.line1}
                      {form.line2 ? `, ${form.line2}` : ''}
                    </p>
                    <p className="text-sm text-body">
                      {form.city}, {form.state} - {form.pincode}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-cream p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted">
                        Payment
                      </p>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="text-xs font-semibold text-gold hover:underline"
                      >
                        Edit
                      </button>
                    </div>
                    <p className="font-semibold text-primary">{selectedPaymentApp.name}</p>
                  </div>

                  <div className="space-y-3">
                    {items.map((item) => (
                      <div
                        key={`${item.productId}-${item.color}`}
                        className="flex gap-3 rounded-2xl border border-borderwarm bg-white p-3"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-16 w-14 rounded-xl object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-1 text-sm font-semibold text-primary">
                            {item.name}
                          </p>
                          <p className="mt-0.5 text-xs text-muted">
                            {item.color} | Qty {item.qty}
                          </p>
                        </div>
                        <p className="whitespace-nowrap text-sm font-semibold text-primary">
                          {formatPrice(item.salePrice * item.qty)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {paymentState.status === 'failed' ? (
                    <div className="rounded-[1.4rem] border border-red-100 bg-red-50 px-4 py-4 text-sm text-red-700">
                      <p className="font-semibold">Payment status</p>
                      <p className="mt-1">{paymentState.message}</p>
                    </div>
                  ) : null}

                  <div className="flex gap-3">
                    <button type="button" className="action-button-outline flex-1" onClick={() => setStep(1)}>
                      Back
                    </button>
                    <button
                      type="button"
                      className="action-button flex-1 py-4 text-base"
                      onClick={handleFinalCheckout}
                      disabled={saving}
                    >
                      {saving
                        ? 'Redirecting to PayU...'
                        : `Pay Securely | ${formatPrice(total)}`}
                    </button>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <aside className="card-surface sticky top-24 h-fit p-6">
              <h2 className="mb-5 font-heading text-3xl text-primary">Order Summary</h2>

              <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.color}`} className="flex gap-3">
                    <div className="relative">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-14 w-12 rounded-xl object-cover"
                      />
                      <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                        {item.qty}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-xs font-semibold text-primary">{item.name}</p>
                      <p className="text-xs text-muted">{item.color}</p>
                    </div>
                    <p className="text-xs font-semibold text-primary">
                      {formatPrice(item.salePrice * item.qty)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(event) => setCouponCode(event.target.value)}
                  className="input-shell text-sm"
                  placeholder="Coupon code"
                />
                <button
                  type="button"
                  className="action-button whitespace-nowrap px-4 text-sm"
                  onClick={applyCoupon}
                >
                  Apply
                </button>
              </div>
              {coupon ? (
                <p className="mt-2 text-xs font-semibold text-emerald-600">
                  {coupon.discount}% off applied
                </p>
              ) : null}

              <div className="mt-5 space-y-3 border-t border-borderwarm pt-5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Subtotal</span>
                  <span className="font-semibold text-primary">{formatPrice(subtotal)}</span>
                </div>
                {coupon ? (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount</span>
                    <span>-{formatPrice(coupon.discountAmount)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between">
                  <span className="text-muted">Shipping</span>
                  <span className="font-semibold text-emerald-600">FREE</span>
                </div>
                <div className="flex justify-between border-t border-borderwarm pt-3">
                  <span className="text-base font-bold text-primary">Total</span>
                  <span className="text-lg font-bold text-primary">{formatPrice(total)}</span>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2 rounded-2xl bg-cream p-3 text-xs text-muted">
                <ShieldCheck className="h-4 w-4 flex-shrink-0 text-emerald-500" />
                Secure checkout, free shipping, and direct support when you need it.
              </div>

              <a
                href={siteConfig.whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="mt-3 flex items-center gap-2 rounded-2xl border border-gold/30 bg-white p-3 text-xs font-semibold text-primary transition hover:border-gold"
              >
                WhatsApp support: {siteConfig.phoneDisplay}
              </a>
            </aside>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {paymentState.status === 'failed' ? (
          <motion.div
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 20 }}
              className="w-full max-w-md rounded-[24px] border border-red-100 bg-[#fffaf0] p-6 text-center shadow-2xl"
            >
              <motion.div
                animate={{ rotate: [0, -8, 8, 0], scale: [1, 1.08, 1] }}
                transition={{ duration: 0.7 }}
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600"
              >
                <XCircle size={34} />
              </motion.div>
              <h2 className="mt-5 font-heading text-4xl text-primary">Payment not completed</h2>
              <p className="mt-3 text-sm leading-6 text-body">
                {paymentState.message || 'Your payment was cancelled or interrupted. No duplicate payment was created.'}
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  className="action-button-outline flex-1"
                  onClick={() => setPaymentState({ status: 'idle', message: '' })}
                >
                  Review Order
                </button>
                <button
                  type="button"
                  className="action-button flex-1 gap-2"
                  disabled={saving}
                  onClick={handleFinalCheckout}
                >
                  <RefreshCw size={16} />
                  Retry Payment
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}