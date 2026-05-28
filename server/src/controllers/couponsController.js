import { createDocument, deleteDocument, getDocument, listDocuments, updateDocument } from '../services/firestore.js';
import {
  normalizeCouponCode,
  sanitizeCoupon,
  validateCouponForSubtotal,
} from '../services/coupons.js';

export async function getCoupons(req, res, next) {
  try {
    const coupons = (await listDocuments('coupons')).map((coupon) => sanitizeCoupon(coupon));
    res.json({ success: true, coupons });
  } catch (error) {
    next(error);
  }
}

export async function validateCoupon(req, res, next) {
  try {
    const code = normalizeCouponCode(req.body.code);
    const subtotal = Number(req.body.subtotal || 0);
    const coupon = sanitizeCoupon(await getDocument('coupons', code));
    const validation = validateCouponForSubtotal(coupon, subtotal);

    if (!validation.valid) {
      return res.status(validation.status).json({ success: false, error: validation.error });
    }

    res.json({ success: true, coupon: { ...coupon, discountAmount: validation.discountAmount } });
  } catch (error) {
    next(error);
  }
}

export async function createCoupon(req, res, next) {
  try {
    const payload = sanitizeCoupon(req.body, { createdAt: new Date().toISOString() });
    if (!payload.code) {
      return res.status(400).json({ success: false, error: 'Coupon code is required' });
    }

    const existingCoupon = await getDocument('coupons', payload.code);
    if (existingCoupon) {
      return res.status(409).json({ success: false, error: 'Coupon code already exists' });
    }

    const coupon = await createDocument('coupons', payload, payload.code);
    res.status(201).json({ success: true, coupon });
  } catch (error) {
    next(error);
  }
}

export async function updateCoupon(req, res, next) {
  try {
    const code = normalizeCouponCode(req.params.code);
    const existingCoupon = await getDocument('coupons', code);

    if (!existingCoupon) {
      return res.status(404).json({ success: false, error: 'Coupon not found' });
    }

    const coupon = await updateDocument('coupons', code, sanitizeCoupon(req.body, existingCoupon));
    res.json({ success: true, coupon });
  } catch (error) {
    next(error);
  }
}

export async function removeCoupon(req, res, next) {
  try {
    await deleteDocument('coupons', normalizeCouponCode(req.params.code));
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}
