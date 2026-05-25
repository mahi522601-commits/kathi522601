import { useEffect, useState } from 'react';

const blankCoupon = {
  code: '',
  discount: 10,
  minOrderValue: 0,
  maxUses: 100,
  expiresAt: '',
  active: true,
  usedCount: 0,
};

export default function CouponForm({ coupon, onSave, onCancel }) {
  const [form, setForm] = useState(blankCoupon);

  useEffect(() => {
    setForm(coupon ? { ...coupon, originalCode: coupon.code } : blankCoupon);
  }, [coupon]);

  async function handleSubmit(event) {
    event.preventDefault();
    await onSave({
      ...form,
      discount: Number(form.discount),
      minOrderValue: Number(form.minOrderValue),
      maxUses: Number(form.maxUses),
      usedCount: Number(form.usedCount || 0),
    });
    setForm(blankCoupon);
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div>
        <h2 className="font-heading text-3xl text-primary">{coupon ? 'Edit Coupon' : 'Create Coupon'}</h2>
        <p className="mt-1 text-sm text-muted">
          Fill each field clearly so checkout can validate the offer automatically.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          Coupon code customers type at checkout
          <input className="input-shell mt-2" placeholder="Example: SAREE10" value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })} required />
        </label>
        <label className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          Discount percentage
          <input type="number" min="1" max="95" className="input-shell mt-2" placeholder="10" value={form.discount} onChange={(event) => setForm({ ...form, discount: event.target.value })} required />
        </label>
        <label className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          Minimum order value
          <input type="number" min="0" className="input-shell mt-2" placeholder="0" value={form.minOrderValue} onChange={(event) => setForm({ ...form, minOrderValue: event.target.value })} required />
        </label>
        <label className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          Maximum total uses
          <input type="number" min="1" className="input-shell mt-2" placeholder="100" value={form.maxUses} onChange={(event) => setForm({ ...form, maxUses: event.target.value })} />
        </label>
        <label className="text-xs font-semibold uppercase tracking-[0.16em] text-muted md:col-span-2">
          Expiry date
          <input type="date" className="input-shell mt-2" value={form.expiresAt} onChange={(event) => setForm({ ...form, expiresAt: event.target.value })} required />
        </label>
      </div>
      <label className="inline-flex items-center gap-3 rounded-full border border-borderwarm bg-white px-4 py-3 text-sm font-semibold text-body">
        <input type="checkbox" checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} />
        Coupon is active and visible to checkout validation
      </label>
      <div className="flex gap-3">
        <button type="button" className="action-button-outline" onClick={onCancel}>
          Cancel Coupon Editing
        </button>
        <button type="submit" className="action-button">
          {coupon ? 'Update Existing Coupon' : 'Create New Coupon'}
        </button>
      </div>
    </form>
  );
}
