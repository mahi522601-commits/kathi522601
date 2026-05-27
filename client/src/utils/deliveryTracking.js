export const DELIVERY_STEPS = ['Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];

export function getExpectedDeliveryDate(order) {
  const createdAt = order?.createdAt ? new Date(order.createdAt) : new Date();
  const expected = order?.expectedDeliveryAt
    ? new Date(order.expectedDeliveryAt)
    : new Date(createdAt.getTime() + 5 * 24 * 60 * 60 * 1000);
  return expected;
}

export function formatDeliveryDate(value) {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(value instanceof Date ? value : new Date(value));
}

export function getCurrentDeliveryStep(order) {
  const status = order?.deliveryStatus || order?.status || 'Confirmed';
  const index = DELIVERY_STEPS.indexOf(status);
  return index >= 0 ? index : 0;
}

export function getDeliveryCountdown(order) {
  const diff = getExpectedDeliveryDate(order).getTime() - Date.now();
  if (diff <= 0) {
    return 'Arriving any time now';
  }

  const days = Math.ceil(diff / (24 * 60 * 60 * 1000));
  return `${days} day${days === 1 ? '' : 's'} remaining`;
}
