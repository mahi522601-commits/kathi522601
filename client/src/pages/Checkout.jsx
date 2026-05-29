import { Helmet } from 'react-helmet-async';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ImagePlus, ShieldCheck, Smartphone } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { validateCoupon } from '../firebase/couponService';
import { placeOrder } from '../firebase/ordersService';
import { uploadPaymentScreenshot } from '../firebase/storageService';
import { formatPrice } from '../utils/formatPrice';
import { indianStates } from '../utils/indianCities';
import { siteConfig } from '../config/site';

const STEP_LABELS = ['Delivery', 'Payment'];

const PAYMENT_APPS = [
  {
    id: 'phonepe',
    name: 'PhonePe',
    mark: 'पे',
    className: 'bg-[#5f259f] text-white',
  },
  {
    id: 'googlepay',
    name: 'Google Pay',
    mark: 'G',
    className: 'bg-white text-[#1a73e8]',
  },
  {
    id: 'paytm',
    name: 'Paytm',
    mark: 'Pay',
    className: 'bg-[#eaf7ff] text-[#00baf2]',
  },
];

function buildUpiUrl(app, amount) {
  const params = new URLSearchParams({
    pa: siteConfig.upiId,
    pn: siteConfig.upiName,
    am: Number(amount || 0).toFixed(2),
    cu: 'INR',
    tn: 'Khyathi Collections order payment',
  });
  const query = params.toString();

  if (app.id === 'phonepe') {
    return `phonepe://pay?${query}`;
  }
  if (app.id === 'googlepay') {
    return `tez://upi/pay?${query}`;
  }
  if (app.id === 'paytm') {
    return `paytmmp://pay?${query}`;
  }

  return `upi://pay?${query}`;
}

function resolveImageUrl(image) {
  if (!image) {
    return '';
  }

  if (typeof image === 'string') {
    return image;
  }

  return image.displayUrl || image.url || image.thumbnail || '';
}

export default function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const { userProfile, updateProfileFields } = useAuth();
  const [step, setStep] = useState(0);
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [saving, setSaving] = useState(false);
  const [selectedPaymentApp, setSelectedPaymentApp] = useState(PAYMENT_APPS[0]);
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [paymentPreview, setPaymentPreview] = useState('');
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

  useEffect(() => {
    if (!paymentScreenshot) {
      setPaymentPreview('');
      return undefined;
    }

    const preview = URL.createObjectURL(paymentScreenshot);
    setPaymentPreview(preview);
    return () => URL.revokeObjectURL(preview);
  }, [paymentScreenshot]);

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

  function openPaymentApp(app) {
    setSelectedPaymentApp(app);
    window.location.href = buildUpiUrl(app, total);
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

  async function finishOrder() {
    if (saving) {
      return;
    }

    if (!items.length) {
      toast.error('Your cart is empty');
      return;
    }

    if (!paymentScreenshot) {
      toast.error('Upload your payment screenshot');
      return;
    }

    setSaving(true);
    try {
      const uploadedProof = await uploadPaymentScreenshot(
        paymentScreenshot,
        `payment-proof-${form.phone || Date.now()}`,
      );
      const proofUrl = resolveImageUrl(uploadedProof);
      const order = await placeOrder(
        buildOrderPayload({
          paymentMethod: selectedPaymentApp.name,
          paymentGateway: selectedPaymentApp.id,
          paymentStatus: 'Verification Pending',
          status: 'Pending',
          deliveryStatus: 'Pending',
          paymentScreenshot: uploadedProof,
          paymentScreenshotUrl: proofUrl,
        }),
      );

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
          // Address sync can safely happen later.
        }
      }

      localStorage.setItem('khyathi-last-order', JSON.stringify(order));
      clearCart();
      toast.success('Payment proof uploaded. Receipt generated.');
      navigate(userProfile?.uid ? `/receipt/${order.id}` : '/order-confirmation', {
        state: { order },
        replace: true,
      });
    } catch (error) {
      toast.error(error.message || 'Unable to place order');
    } finally {
      setSaving(false);
    }
  }

  if (!items.length && step === 0) {
    return (
      <section className="section-block">
        <div className="page-shell py-20 text-center">
          <p className="font-heading text-4xl text-primary sm:text-5xl">Your cart is empty</p>
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
      <section className="min-h-screen bg-gradient-to-b from-[#faf7f2] to-[#f2ede4] py-6 sm:py-10">
        <div className="page-shell max-w-6xl">
          <div className="mb-7 flex items-center justify-center gap-0 sm:mb-10">
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
                  <div className={`mx-3 mb-5 h-0.5 w-24 ${index < step ? 'bg-gold' : 'bg-borderwarm'}`} />
                ) : null}
              </div>
            ))}
          </div>

          <div className="grid gap-5 lg:grid-cols-[1fr_380px] lg:gap-8">
            <AnimatePresence mode="wait">
              {step === 0 ? (
                <motion.div
                  key="delivery"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="card-surface p-4 sm:p-6 md:p-8"
                >
                  <h2 className="mb-5 font-heading text-3xl text-primary sm:text-4xl">Delivery Details</h2>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted">
                        Full Name *
                      </label>
                      <input className="input-shell" value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted">
                        Phone Number *
                      </label>
                      <input className="input-shell" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted">
                        Email Address *
                      </label>
                      <input type="email" className="input-shell" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted">
                        Address Line 1 *
                      </label>
                      <input className="input-shell" value={form.line1} onChange={(event) => setForm({ ...form, line1: event.target.value })} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted">
                        Address Line 2
                      </label>
                      <input className="input-shell" value={form.line2} onChange={(event) => setForm({ ...form, line2: event.target.value })} />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted">
                        City *
                      </label>
                      <input className="input-shell" value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted">
                        Pincode *
                      </label>
                      <input className="input-shell" value={form.pincode} onChange={(event) => setForm({ ...form, pincode: event.target.value })} maxLength={6} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted">
                        State *
                      </label>
                      <select className="input-shell" value={form.state} onChange={(event) => setForm({ ...form, state: event.target.value })}>
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
                    className="action-button mt-7 w-full py-4 text-base"
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
                  className="card-surface space-y-6 p-4 sm:p-6 md:p-8"
                >
                  <div>
                    <h2 className="font-heading text-3xl text-primary sm:text-4xl">Payment & Proof</h2>
                    <p className="mt-2 text-sm text-muted">
                      Pay using your preferred app, upload the payment screenshot, and your receipt will be generated.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {PAYMENT_APPS.map((app) => {
                      const selected = selectedPaymentApp.id === app.id;
                      return (
                        <button
                          key={app.id}
                          type="button"
                          className={`rounded-[16px] border-2 bg-white p-3 text-left transition sm:p-4 ${
                            selected ? 'border-gold shadow-[0_14px_36px_rgba(201,168,76,0.22)]' : 'border-borderwarm'
                          }`}
                          onClick={() => openPaymentApp(app)}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border border-black/5 text-lg font-black shadow-sm ${app.className}`}>
                              {app.mark}
                            </div>
                            {selected ? <Check className="text-emerald-600" size={18} /> : null}
                          </div>
                          <p className="mt-3 font-semibold text-primary">{app.name}</p>
                          <p className="mt-1 text-xs text-muted">Tap to open app</p>
                        </button>
                      );
                    })}
                  </div>

                  <div className="rounded-[16px] border border-borderwarm bg-cream p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                      <Smartphone className="mt-1 shrink-0 text-gold-dark" size={20} />
                      <div>
                        <p className="font-semibold text-primary">Pay to Khyathi Collections</p>
                        <p className="mt-1 text-sm text-body">Amount: {formatPrice(total)}</p>
                        <p className="break-all text-sm text-body">UPI ID: {siteConfig.upiId}</p>
                        <p className="text-sm text-body">Support phone: {siteConfig.phoneDisplay}</p>
                      </div>
                    </div>
                    <a className="action-button mt-4 w-full py-3 text-sm sm:w-auto" href={buildUpiUrl(selectedPaymentApp, total)}>
                      Open {selectedPaymentApp.name} and Pay
                    </a>
                  </div>

                  <label className="block rounded-[16px] border border-dashed border-gold bg-white p-4 text-center sm:p-5">
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(event) => setPaymentScreenshot(event.target.files?.[0] || null)}
                    />
                    {paymentPreview ? (
                      <img src={paymentPreview} alt="Payment screenshot preview" className="mx-auto max-h-52 rounded-[14px] object-contain sm:max-h-64" />
                    ) : (
                      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cream text-primary">
                        <ImagePlus size={24} />
                      </span>
                    )}
                    <span className="mt-3 block text-sm font-semibold text-primary">
                      {paymentScreenshot ? paymentScreenshot.name : 'Upload payment screenshot'}
                    </span>
                  </label>

                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={`${item.productId}-${item.color}`} className="flex gap-3 rounded-2xl border border-borderwarm bg-white p-3">
                        <img src={item.image} alt={item.name} className="h-16 w-14 rounded-xl object-cover" />
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-1 text-sm font-semibold text-primary">{item.name}</p>
                          <p className="mt-0.5 text-xs text-muted">{item.color} | Qty {item.qty}</p>
                        </div>
                        <p className="whitespace-nowrap text-sm font-semibold text-primary">{formatPrice(item.salePrice * item.qty)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button type="button" className="action-button-outline flex-1" onClick={() => setStep(0)}>
                      Back
                    </button>
                    <button type="button" className="action-button flex-1 py-4 text-base" onClick={finishOrder} disabled={saving}>
                      {saving ? 'Uploading Proof...' : `Get Receipt | ${formatPrice(total)}`}
                    </button>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <aside className="card-surface h-fit p-4 sm:p-6 lg:sticky lg:top-24">
              <h2 className="mb-5 font-heading text-3xl text-primary">Order Summary</h2>

              <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.color}`} className="flex gap-3">
                    <img src={item.image} alt={item.name} className="h-14 w-12 rounded-xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-xs font-semibold text-primary">{item.name}</p>
                      <p className="text-xs text-muted">{item.color} x {item.qty}</p>
                    </div>
                    <p className="text-xs font-semibold text-primary">{formatPrice(item.salePrice * item.qty)}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex gap-2">
                <input type="text" value={couponCode} onChange={(event) => setCouponCode(event.target.value)} className="input-shell text-sm" placeholder="Coupon code" />
                <button type="button" className="action-button whitespace-nowrap px-4 text-sm" onClick={applyCoupon}>
                  Apply
                </button>
              </div>
              {coupon ? <p className="mt-2 text-xs font-semibold text-emerald-600">{coupon.discount}% off applied</p> : null}

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
                Admin will verify your screenshot and confirm the payment.
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
