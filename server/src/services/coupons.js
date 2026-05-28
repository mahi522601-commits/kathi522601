export function normalizeCouponCode(code = '') {
  return String(code).trim().toUpperCase().replace(/\s+/g, '');
}

function normalizeDate(value) {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return String(value).length <= 10 ? String(value) : date.toISOString().slice(0, 10);
}

export function sanitizeCoupon(input = {}, existing = {}) {
  const source = input || {};
  const base = existing || {};
  const rawMaxUses = source.maxUses ?? base.maxUses ?? 0;

  return {
    ...base,
    ...source,
    code: normalizeCouponCode(source.code || base.code || base.id),
    discount: Math.max(1, Math.min(95, Number(source.discount ?? base.discount ?? 0))),
    minOrderValue: Math.max(0, Number(source.minOrderValue ?? base.minOrderValue ?? 0)),
    maxUses: rawMaxUses === '' || rawMaxUses == null ? 0 : Math.max(0, Number(rawMaxUses)),
    usedCount: Math.max(0, Number(source.usedCount ?? base.usedCount ?? 0)),
    expiresAt: normalizeDate(source.expiresAt ?? base.expiresAt),
    active: source.active ?? base.active ?? true,
    updatedAt: new Date().toISOString(),
  };
}

export function validateCouponForSubtotal(coupon, subtotal) {
  if (!coupon || !coupon.code || !coupon.active) {
    return { valid: false, status: 404, error: 'Invalid coupon code' };
  }

  if (coupon.minOrderValue && subtotal < Number(coupon.minOrderValue)) {
    return {
      valid: false,
      status: 400,
      error: `Coupon valid on orders above Rs. ${coupon.minOrderValue}`,
    };
  }

  if (coupon.expiresAt) {
    const expiry = new Date(coupon.expiresAt);
    expiry.setHours(23, 59, 59, 999);
    if (expiry < new Date()) {
      return { valid: false, status: 400, error: 'Coupon has expired' };
    }
  }

  if (coupon.maxUses && Number(coupon.usedCount || 0) >= Number(coupon.maxUses)) {
    return { valid: false, status: 400, error: 'Coupon usage limit reached' };
  }

  return {
    valid: true,
    discountAmount: Math.min(subtotal, Math.round((subtotal * Number(coupon.discount || 0)) / 100)),
  };
}
