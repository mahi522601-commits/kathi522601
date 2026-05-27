import { createDocument, deleteDocument, getDocument, listDocuments, updateDocument } from '../services/firestore.js';

export async function getCoupons(req, res, next) {
  try {
    const coupons = await listDocuments('coupons');
    res.json({ success: true, coupons });
  } catch (error) {
    next(error);
  }
}

export async function validateCoupon(req, res, next) {
  try {
    const code = (req.body.code || '').toUpperCase().trim();
    const subtotal = Number(req.body.subtotal || 0);
    const coupon = await getDocument('coupons', code);

    if (!coupon || !coupon.active) {
      return res.status(404).json({ success: false, error: 'Invalid coupon code' });
    }

    if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
      return res
        .status(400)
        .json({ success: false, error: `Coupon valid on orders above Rs. ${coupon.minOrderValue}` });
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return res.status(400).json({ success: false, error: 'Coupon has expired' });
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return res.status(400).json({ success: false, error: 'Coupon usage limit reached' });
    }

    const discountAmount = Math.round((subtotal * coupon.discount) / 100);
    res.json({ success: true, coupon: { ...coupon, discountAmount } });
  } catch (error) {
    next(error);
  }
}

export async function createCoupon(req, res, next) {
  try {
    const payload = {
      ...req.body,
      code: req.body.code.toUpperCase(),
      active: req.body.active ?? true,
    };
    const coupon = await createDocument('coupons', payload, payload.code);
    res.status(201).json({ success: true, coupon });
  } catch (error) {
    next(error);
  }
}

export async function updateCoupon(req, res, next) {
  try {
    const coupon = await updateDocument('coupons', req.params.code.toUpperCase(), {
      ...req.body,
      code: req.params.code.toUpperCase(),
    });

    if (!coupon) {
      return res.status(404).json({ success: false, error: 'Coupon not found' });
    }

    res.json({ success: true, coupon });
  } catch (error) {
    next(error);
  }
}

export async function removeCoupon(req, res, next) {
  try {
    await deleteDocument('coupons', req.params.code.toUpperCase());
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}
