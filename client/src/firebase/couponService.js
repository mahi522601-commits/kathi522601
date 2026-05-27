import couponApi from '../api/couponApi';
import { sampleCoupons } from './seedData';

export async function getCoupons() {
  try {
    return await couponApi.list();
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('Falling back to sample coupons.', error);
    }
    return sampleCoupons;
  }
}

export async function validateCoupon(code, subtotal) {
  try {
    return await couponApi.validate(code, subtotal);
  } catch (error) {
    throw new Error(error.response?.data?.error || error.message || 'Invalid coupon code');
  }
}

export async function saveCoupon(coupon) {
  try {
    if (coupon.id || coupon.code) {
      return await couponApi.update(coupon.code || coupon.id, coupon);
    }
    return await couponApi.create(coupon);
  } catch (error) {
    throw new Error(error.response?.data?.error || error.message || 'Unable to save coupon');
  }
}

export async function deleteCoupon(code) {
  try {
    return await couponApi.remove(code);
  } catch (error) {
    throw new Error(error.response?.data?.error || error.message || 'Unable to delete coupon');
  }
}

export async function incrementCouponUsage() {
  return true;
}
