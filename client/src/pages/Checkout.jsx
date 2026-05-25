import { Helmet } from 'react-helmet-async';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Gift, ImageUp, ShieldCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { incrementCouponUsage, validateCoupon } from '../firebase/couponService';
import { placeOrder } from '../firebase/ordersService';
import { formatPrice } from '../utils/formatPrice';
import { indianStates } from '../utils/indianCities';
import { siteConfig } from '../config/site';

const STEP_LABELS = ['Delivery', 'UPI Payment', 'Proof'];
const UPI_ID = '9398724704@ybl';
const PAYMENT_APPS = ['PhonePe', 'Google Pay', 'Paytm'];

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const { userProfile, updateProfileFields } = useAuth();
  const [step, setStep] = useState(0);
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [couponPulse, setCouponPulse] = useState(false);
  const [saving, setSaving] = useState(false);
  const [paymentApp, setPaymentApp] = useState(PAYMENT_APPS[0]);
  const [paymentProof, setPaymentProof] = useState(null);
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
    if (!userProfile) return;
    setForm((current) => ({
      ...current,
      fullName: userProfile.name || current.fullName,
      phone: userProfile.phone || current.phone,
      email: userProfile.email || current.email,
    }));
  }, [userProfile]);

  const total = useMemo(() => Math.max(subtotal - (coupon?.discountAmount || 0), 0), [coupon, subtotal]);
  const upiUrl = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent('Khyathi Collections')}&am=${total}&cu=INR&tn=${encodeURIComponent('Khyathi order payment')}`;

  async function applyCoupon() {
    try {
      const response = await validateCoupon(couponCode, subtotal);
      setCoupon(response);
      setCouponPulse(true);
      window.setTimeout(() => setCouponPulse(false), 1300);
      toast.success(`Coupon applied. You saved ${formatPrice(response.discountAmount)}`);
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

  async function handleProofUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Upload a payment screenshot image');
      return;
    }
    const dataUrl = await fileToDataUrl(file);
    setPaymentProof({
      name: file.name,
      type: file.type,
      size: file.size,
      dataUrl,
      uploadedAt: new Date().toISOString(),
    });
    toast.success('Payment screenshot added');
  }

  async function submitOrder() {
    if (!paymentProof) {
      toast.error('Upload payment screenshot before confirming');
      return;
    }
    setSaving(true);
    try {
      const order = await placeOrder({
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
        pricing: { subtotal, discount: coupon?.discountAmount || 0, couponCode: coupon?.code || null, shipping: 0, total },
        paymentMethod: paymentApp,
        paymentGateway: 'upi-manual',
        paymentUpiId: UPI_ID,
        paymentStatus: 'Verification Pending',
        paymentProof,
        status: 'Payment Review',
      });

      if (coupon?.code) {
        await incrementCouponUsage(coupon.code).catch(() => {});
      }
      if (userProfile?.uid) {
        await updateProfileFields({
          addresses: [{ line1: form.line1, line2: form.line2, city: form.city, state: form.state, pincode: form.pincode }],
        }).catch(() => {});
      }
      localStorage.setItem('khyathi-last-order', JSON.stringify(order));
      clearCart();
      navigate(userProfile?.uid ? `/receipt/${order.id}` : '/order-confirmation', { state: { order }, replace: true });
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
          <p className="font-heading text-5xl text-primary">Your cart is empty</p>
          <button onClick={() => navigate('/collections')} className="action-button mt-6">Shop Now</button>
        </div>
      </section>
    );
  }

  return (
    <>
      <Helmet><title>Checkout | Khyathi Collections</title></Helmet>
      <section className="min-h-screen bg-gradient-to-b from-[#F8F8F8] to-[#E5D3B3]/55 py-10">
        <div className="page-shell max-w-6xl">
          <div className="mb-10 flex justify-center gap-3">
            {STEP_LABELS.map((label, index) => (
              <div key={label} className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] ${index === step ? 'bg-[#0A1F44] text-white' : index < step ? 'bg-[#C8A96B] text-[#0A1F44]' : 'bg-white text-muted'}`}>
                {index < step ? <Check size={14} className="mr-1 inline" /> : null}{label}
              </div>
            ))}
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div key="delivery" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }} className="card-surface p-6 md:p-8">
                  <h2 className="mb-6 font-heading text-4xl text-primary">Delivery Details</h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    {[
                      ['fullName', 'Full Name', 'e.g. Priya Sharma'],
                      ['phone', 'Phone Number', '10 digit phone number'],
                      ['email', 'Email Address', 'for order updates'],
                      ['line1', 'Address Line 1', 'House no., street, area'],
                      ['line2', 'Address Line 2', 'Landmark or locality'],
                      ['city', 'City', 'City'],
                      ['pincode', 'Pincode', '6-digit pincode'],
                    ].map(([key, label, placeholder]) => (
                      <label key={key} className={key === 'line1' || key === 'line2' ? 'md:col-span-2' : ''}>
                        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted">{label}</span>
                        <input className="input-shell" placeholder={placeholder} value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} />
                      </label>
                    ))}
                    <label className="md:col-span-2">
                      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted">State</span>
                      <select className="input-shell" value={form.state} onChange={(event) => setForm({ ...form, state: event.target.value })}>
                        {indianStates.map((state) => <option key={state} value={state}>{state}</option>)}
                      </select>
                    </label>
                  </div>
                  <button className="action-button mt-8 w-full" onClick={() => validateDelivery() && setStep(1)}>Continue to UPI Payment</button>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div key="upi" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }} className="card-surface space-y-6 p-6 md:p-8">
                  <h2 className="font-heading text-4xl text-primary">Pay with UPI</h2>
                  <div className="rounded-[16px] border border-gold/40 bg-[#0A1F44] p-5 text-white">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C8A96B]">Pay to UPI ID</p>
                    <p className="mt-2 text-2xl font-bold">{UPI_ID}</p>
                    <p className="mt-4 text-sm text-white/70">Amount: <span className="font-bold text-white">{formatPrice(total)}</span></p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {PAYMENT_APPS.map((app) => (
                      <button key={app} type="button" onClick={() => setPaymentApp(app)} className={`rounded-[14px] border p-4 text-sm font-bold ${paymentApp === app ? 'border-gold bg-[#E5D3B3] text-[#0A1F44]' : 'border-borderwarm bg-white text-primary'}`}>{app}</button>
                    ))}
                  </div>
                  <a href={upiUrl} className="action-button w-full">Open Selected UPI App</a>
                  <div className="flex gap-3">
                    <button className="action-button-outline flex-1" onClick={() => setStep(0)}>Back</button>
                    <button className="action-button flex-1" onClick={() => setStep(2)}>I Paid, Upload Screenshot</button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="proof" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }} className="card-surface space-y-6 p-6 md:p-8">
                  <h2 className="font-heading text-4xl text-primary">Upload Payment Screenshot</h2>
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-[18px] border-2 border-dashed border-gold/60 bg-[#F8F8F8] p-8 text-center">
                    <ImageUp className="text-[#C8A96B]" size={34} />
                    <span className="mt-3 font-semibold text-primary">Choose screenshot</span>
                    <span className="mt-1 text-sm text-muted">Admin will verify and confirm your order.</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleProofUpload} />
                  </label>
                  {paymentProof ? <img src={paymentProof.dataUrl} alt="Payment screenshot preview" className="max-h-80 rounded-[16px] border border-borderwarm object-contain" /> : null}
                  <div className="flex gap-3">
                    <button className="action-button-outline flex-1" onClick={() => setStep(1)}>Back</button>
                    <button className="action-button flex-1" disabled={saving} onClick={submitOrder}>{saving ? 'Submitting...' : 'Confirm Order'}</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <aside className={`card-surface sticky top-24 h-fit p-6 ${couponPulse ? 'coupon-celebration' : ''}`}>
              <h2 className="mb-5 font-heading text-3xl text-primary">Order Summary</h2>
              <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.color}`} className="flex gap-3">
                    <img src={item.image} alt={item.name} className="h-16 w-12 rounded-xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-xs font-semibold text-primary">{item.name}</p>
                      <p className="text-xs text-muted">{item.color} | Qty {item.qty}</p>
                    </div>
                    <p className="text-xs font-semibold text-primary">{formatPrice(item.salePrice * item.qty)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex gap-2">
                <input value={couponCode} onChange={(event) => setCouponCode(event.target.value.toUpperCase())} className="input-shell text-sm" placeholder="Coupon code" />
                <button type="button" className="action-button px-4 text-sm" onClick={applyCoupon}><Gift size={15} /></button>
              </div>
              {coupon ? <p className="mt-2 text-xs font-bold text-emerald-700">{coupon.discount}% off applied. You saved {formatPrice(coupon.discountAmount)}.</p> : null}
              <div className="mt-5 space-y-3 border-t border-borderwarm pt-5 text-sm">
                <div className="flex justify-between"><span className="text-muted">Subtotal</span><span className="font-semibold">{formatPrice(subtotal)}</span></div>
                {coupon ? <div className="flex justify-between text-emerald-700"><span>Discount</span><span>-{formatPrice(coupon.discountAmount)}</span></div> : null}
                <div className="flex justify-between"><span className="text-muted">Shipping</span><span className="font-semibold text-emerald-700">FREE</span></div>
                <div className="flex justify-between border-t border-borderwarm pt-3 text-lg font-bold"><span>Total</span><span>{formatPrice(total)}</span></div>
              </div>
              <div className="mt-5 flex items-center gap-2 rounded-[14px] bg-[#E5D3B3]/55 p-3 text-xs text-muted">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Upload screenshot after paying. Receipt is generated immediately for tracking.
              </div>
              <a href={siteConfig.whatsappHref} target="_blank" rel="noreferrer" className="mt-3 block rounded-[14px] border border-gold/40 bg-white p-3 text-xs font-semibold text-primary">WhatsApp support: {siteConfig.phoneDisplay}</a>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
