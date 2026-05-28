import { createDocument, getDocument, listDocuments, updateDocument } from './firestore.js';

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

export async function createStoredOrder(payload) {
  const orders = await listDocuments('orders');
  const createdAt = payload.createdAt || new Date().toISOString();
  const initialStatus = payload.status || 'Pending';
  const receiptNumber = payload.receiptNumber || buildReceiptNumber(orders.length);
  const shouldCreateRewardCoupon = Array.isArray(payload.items) && payload.items.length > 0;
  const rewardCoupon = shouldCreateRewardCoupon
    ? {
        code: buildRewardCouponCode(orders.length),
        discount: 10,
        minOrderValue: 0,
        maxUses: 1,
        usedCount: 0,
        expiresAt: addMonths(createdAt, 1),
        active: true,
        customerEmail: payload.email || '',
        customerName: payload.customerName || '',
        source: 'post-purchase',
      }
    : null;

  if (rewardCoupon) {
    await createDocument('coupons', rewardCoupon, rewardCoupon.code);
  }

  if (payload.couponCode) {
    const usedCoupon = await getDocument('coupons', String(payload.couponCode).toUpperCase());
    if (usedCoupon) {
      await updateDocument('coupons', usedCoupon.code || usedCoupon.id, {
        usedCount: Number(usedCoupon.usedCount || 0) + 1,
      });
    }
  }

  return createDocument('orders', {
    ...payload,
    orderNumber: payload.orderNumber || buildOrderNumber(orders.length),
    receiptNumber,
    transactionId: payload.transactionId || payload.paymentId || payload.gatewayOrderId || receiptNumber,
    status: initialStatus,
    deliveryStatus: payload.deliveryStatus || initialStatus,
    expectedDeliveryAt: payload.expectedDeliveryAt || addDays(createdAt, 5),
    statusHistory: payload.statusHistory || [
      {
        status: initialStatus,
        label: initialStatus === 'Pending' ? 'Order placed' : 'Order confirmed',
        at: createdAt,
      },
    ],
    receipt: {
      id: payload.receipt?.id || receiptNumber,
      generatedAt: payload.receipt?.generatedAt || createdAt,
      storeName: 'Khyathi Collections',
      storeLocation: 'Narasaropet',
      storePhone: '93921 73693',
      expectedDeliveryText: 'Expected Delivery Within 5 Days',
      ...(payload.receipt || {}),
    },
    rewardCoupon,
    createdAt,
    updatedAt: new Date().toISOString(),
  });
}
