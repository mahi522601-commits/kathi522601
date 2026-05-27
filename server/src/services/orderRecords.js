import { createDocument, listDocuments } from './firestore.js';

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

export async function createStoredOrder(payload) {
  const orders = await listDocuments('orders');
  const createdAt = payload.createdAt || new Date().toISOString();
  const initialStatus = payload.status || 'Pending';
  const receiptNumber = payload.receiptNumber || buildReceiptNumber(orders.length);

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
    createdAt,
    updatedAt: new Date().toISOString(),
  });
}
