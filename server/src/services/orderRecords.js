import { createDocument, getDocument, listDocuments, updateDocument } from './firestore.js';
import {
  normalizeCouponCode,
  sanitizeCoupon,
  validateCouponForSubtotal,
} from './coupons.js';

function buildOrderNumber(orderCount) {
  return `KC-${new Date().getFullYear()}-${String(orderCount + 1).padStart(4, '0')}`;
}

function buildReceiptNumber(orderCount) {
  return `KC-RCPT-${new Date().getFullYear()}-${String(orderCount + 1).padStart(4, '0')}`;
}

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate.toISOString();
}

function addMonths(date, months) {
  const nextDate = new Date(date);
  nextDate.setMonth(nextDate.getMonth() + months);
  return nextDate.toISOString().slice(0, 10);
}

function buildRewardCouponCode(orderCount) {
  return `KCLOVE${String(orderCount + 1).padStart(4, '0')}`;
}

function normalizeOrderItems(items) {
  return Array.isArray(items)
    ? items.map((item) => ({
        ...item,
        qty: Math.max(0, Math.floor(Number(item.qty || item.quantity || 0))),
      }))
    : [];
}

async function reserveOrderStock(items) {
  const requestedByProduct = new Map();

  for (const item of items) {
    if (!item.productId || item.qty <= 0) {
      const error = new Error('Order contains an invalid product quantity');
      error.status = 400;
      throw error;
    }

    requestedByProduct.set(item.productId, (requestedByProduct.get(item.productId) || 0) + item.qty);
  }

  const reservedProducts = [];

  for (const [productId, requestedQty] of requestedByProduct.entries()) {
    const product = await getDocument('products', productId);
    const stockQuantity = Math.max(0, Math.floor(Number(product?.stockQuantity || 0)));

    if (!product || product.soldOut || !product.inStock || stockQuantity <= 0) {
      const matchingItem = items.find((item) => item.productId === productId);
      const error = new Error(`${matchingItem?.name || 'This item'} is out of stock`);
      error.status = 409;
      throw error;
    }

    if (requestedQty > stockQuantity) {
      const error = new Error(`Only ${stockQuantity} stock available for ${product.name || 'this item'}`);
      error.status = 409;
      throw error;
    }

    reservedProducts.push({ product, requestedQty, stockQuantity });
  }

  for (const { product, requestedQty, stockQuantity } of reservedProducts) {
    const nextStock = stockQuantity - requestedQty;
    await updateDocument('products', product.id, {
      stockQuantity: nextStock,
      soldCount: Number(product.soldCount || 0) + requestedQty,
      inStock: nextStock > 0,
      soldOut: nextStock <= 0,
    });
  }
}

export async function createStoredOrder(payload) {
  const orders = await listDocuments('orders');
  const createdAt = payload.createdAt || new Date().toISOString();
  const initialStatus = payload.status || 'Pending';
  const items = normalizeOrderItems(payload.items);
  const subtotal = Number(payload.subtotal ?? payload.pricing?.subtotal ?? 0);
  const couponCode = normalizeCouponCode(payload.couponCode || payload.pricing?.couponCode);
  let couponPatch = null;
  let verifiedDiscount = Number(payload.discount ?? payload.pricing?.discount ?? 0);

  if (couponCode) {
    const usedCoupon = sanitizeCoupon(await getDocument('coupons', couponCode));
    const validation = validateCouponForSubtotal(usedCoupon, subtotal);
    if (!validation.valid) {
      const error = new Error(validation.error);
      error.status = validation.status;
      throw error;
    }

    verifiedDiscount = validation.discountAmount;
    couponPatch = {
      code: usedCoupon.code || couponCode,
      usedCount: Number(usedCoupon.usedCount || 0) + 1,
    };
  }

  const normalizedPayload = {
    ...payload,
    items,
    couponCode: couponCode || null,
    discount: verifiedDiscount,
    total: couponCode ? Math.max(0, subtotal - verifiedDiscount) : payload.total,
    pricing: {
      ...(payload.pricing || {}),
      subtotal,
      discount: verifiedDiscount,
      couponCode: couponCode || null,
      shipping: Number(payload.pricing?.shipping || payload.shippingCharge || 0),
      total: couponCode ? Math.max(0, subtotal - verifiedDiscount) : Number(payload.total || 0),
    },
  };

  await reserveOrderStock(items);

  const receiptNumber = payload.receiptNumber || buildReceiptNumber(orders.length);
  const shouldCreateRewardCoupon = Array.isArray(normalizedPayload.items) && normalizedPayload.items.length > 0;
  const rewardCoupon = shouldCreateRewardCoupon
    ? {
        code: buildRewardCouponCode(orders.length),
        discount: 10,
        minOrderValue: 0,
        maxUses: 1,
        usedCount: 0,
        expiresAt: addMonths(createdAt, 1),
        active: true,
        customerEmail: normalizedPayload.email || '',
        customerName: normalizedPayload.customerName || '',
        source: 'post-purchase',
      }
    : null;

  if (rewardCoupon) {
    await createDocument('coupons', rewardCoupon, rewardCoupon.code);
  }

  if (couponPatch) {
    await updateDocument('coupons', couponPatch.code, { usedCount: couponPatch.usedCount });
  }

  return createDocument('orders', {
    ...normalizedPayload,
    orderNumber: normalizedPayload.orderNumber || buildOrderNumber(orders.length),
    receiptNumber,
    transactionId:
      normalizedPayload.transactionId ||
      normalizedPayload.paymentId ||
      normalizedPayload.gatewayOrderId ||
      receiptNumber,
    status: initialStatus,
    deliveryStatus: normalizedPayload.deliveryStatus || initialStatus,
    expectedDeliveryAt: normalizedPayload.expectedDeliveryAt || addDays(createdAt, 5),
    statusHistory: normalizedPayload.statusHistory || [
      {
        status: initialStatus,
        label: initialStatus === 'Pending' ? 'Order placed' : 'Order confirmed',
        at: createdAt,
      },
    ],
    receipt: {
      id: normalizedPayload.receipt?.id || receiptNumber,
      generatedAt: normalizedPayload.receipt?.generatedAt || createdAt,
      storeName: 'Khyathi Collections',
      storeLocation: 'Narasaropet',
      storePhone: '93921 73693',
      expectedDeliveryText: 'Expected Delivery Within 5 Days',
      ...(normalizedPayload.receipt || {}),
    },
    rewardCoupon,
    createdAt,
    updatedAt: new Date().toISOString(),
  });
}
