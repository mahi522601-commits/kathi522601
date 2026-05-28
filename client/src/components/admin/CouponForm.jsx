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
  const isEditing = Boolean(coupon?.code);

  useEffect(() => {
    setForm(coupon ? { ...blankCoupon, ...coupon } : blankCoupon);
  }, [coupon]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.code.trim()) {
      return;
    }

    if (Number(form.discount) < 1 || Number(form.discount) > 95) {
      return;
    }

    await onSave({
      ...form,
      code: form.code.trim().toUpperCase().replace(/\s+/g, ''),
      discount: Number(form.discount),
      minOrderValue: Number(form.minOrderValue),
      maxUses: Number(form.maxUses),
      usedCount: Number(form.usedCount || 0),
    });
    setForm(blankCoupon);
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <input
          className="input-shell"
          placeholder="Code"
          value={form.code}
          onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase().replace(/\s+/g, '') })}
          disabled={isEditing}
          required
        />
        <input type="number" min="1" max="95" className="input-shell" placeholder="Discount %" value={form.discount} onChange={(event) => setForm({ ...form, discount: event.target.value })} required />
        <input type="number" min="0" className="input-shell" placeholder="Min Order Value" value={form.minOrderValue} onChange={(event) => setForm({ ...form, minOrderValue: event.target.value })} required />
        <input type="number" min="0" className="input-shell" placeholder="Max Uses (0 = unlimited)" value={form.maxUses} onChange={(event) => setForm({ ...form, maxUses: event.target.value })} />
        <input type="date" className="input-shell md:col-span-2" value={form.expiresAt} onChange={(event) => setForm({ ...form, expiresAt: event.target.value })} required />
      </div>
      <label className="inline-flex items-center gap-3 text-sm text-body">
        <input type="checkbox" checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} />
        Active
      </label>
      <div className="flex gap-3">
        <button type="button" className="action-button-outline" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="action-button">
          Save Coupon
        </button>
      </div>
    </form>
  );
}
