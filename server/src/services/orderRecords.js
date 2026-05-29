import { createDocument, getDocument, listDocuments, updateDocument } from './firestore.js';
import {
  normalizeCouponCode,
  sanitizeCoupon,
  validateCouponForSubtotal,
} from './coupons.js';
import { quoteCartItems } from './cartPricing.js';

function buildOrderNumber(orderCount) {
  return `KC-${new Date().getFullYear()}-${String(orderCount + 1).padStart(4, '0')}`;
}

function buildReceiptNumber(orderCount) {
  return `KC-RCPT-${new Date().getFullYear()}-${String(orderCount + 1).padStart(4, '0')}`;
}

function getNextSequence(orders, field, year = new Date().getFullYear()) {
  const prefix = field === 'receiptNumber' ? `KC-RCPT-${year}-` : `KC-${year}-`;
  const maxSequence = orders.reduce((max, order) => {
    const value = String(order[field] || '');
    if (!value.startsWith(prefix)) {
      return max;
    }

    const sequence = Number(value.slice(prefix.length));
    return Number.isFinite(sequence) ? Math.max(max, sequence) : max;
  }, 0);

  return maxSequence + 1;
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

async function reserveOrderStock(items) {
  const requestedByProduct = new Map();

  for (const item of items) {
    const productId = String(item.productId || item.id || item._id || item.slug || '').trim();

    if (!productId || item.qty <= 0) {
      const error = new Error('Order contains an invalid product quantity');
      error.status = 400;
      throw error;
    }

    requestedByProduct.set(productId, (requestedByProduct.get(productId) || 0) + item.qty);
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
  const { id, _id, ...safePayload } = payload;
  const createdAt = payload.createdAt || new Date().toISOString();
  const initialStatus = payload.status || 'Pending';
  const duplicateKey = payload.idempotencyKey || payload.transactionId || payload.paymentId || payload.gatewayOrderId;

  if (duplicateKey) {
    const existingOrder = orders.find((order) =>
      [order.idempotencyKey, order.transactionId, order.paymentId, order.gatewayOrderId]
        .filter(Boolean)
        .includes(duplicateKey),
    );

    if (existingOrder) {
      return existingOrder;
    }
  }

  const cartQuote = await quoteCartItems(payload.items, { strictStock: true });
  const items = cartQuote.items;
  const subtotal = cartQuote.subtotal;
  const couponCode = normalizeCouponCode(payload.couponCode || payload.pricing?.couponCode);
  let couponPatch = null;
  let verifiedDiscount = Number(payload.discount ?? payload.pricing?.discount ?? 0);

  if (!items.length) {
    const error = new Error('Order must contain at least one available item');
    error.status = 400;
    throw error;
  }

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
    ...safePayload,
    items,
    couponCode: couponCode || null,
    discount: verifiedDiscount,
    total: Math.max(0, subtotal - verifiedDiscount),
    pricing: {
      ...(payload.pricing || {}),
      subtotal,
      discount: verifiedDiscount,
      couponCode: couponCode || null,
      shipping: Number(payload.pricing?.shipping || payload.shippingCharge || 0),
      total: Math.max(0, subtotal - verifiedDiscount),
    },
  };

  await reserveOrderStock(items);

  const orderYear = new Date(createdAt).getFullYear();
  const orderSequence = getNextSequence(orders, 'orderNumber', orderYear);
  const receiptSequence = getNextSequence(orders, 'receiptNumber', orderYear);
  const receiptNumber = safePayload.receiptNumber || buildReceiptNumber(receiptSequence - 1);
  const shouldCreateRewardCoupon = Array.isArray(normalizedPayload.items) && normalizedPayload.items.length > 0;
  const rewardCoupon = shouldCreateRewardCoupon
    ? {
        code: buildRewardCouponCode(orderSequence - 1),
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
    orderNumber: normalizedPayload.orderNumber || buildOrderNumber(orderSequence - 1),
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
