import ordersApi from '../api/ordersApi';

const LOCAL_ORDERS_KEY = 'khyathi-orders';

function readLocalOrders() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_ORDERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeLocalOrders(orders) {
  localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
}

function normalizeOrder(order) {
  const createdAt = order.createdAt || new Date().toISOString();
  const status = order.status || 'Pending';
  const id = order.id || order._id;
  const receiptNumber =
    order.receiptNumber ||
    `KC-RCPT-${new Date(createdAt).getFullYear()}-${String(order.orderNumber || id || Date.now()).slice(-4)}`;

  return {
    ...order,
    id,
    _id: order._id || id,
    status,
    deliveryStatus: order.deliveryStatus || status,
    receiptNumber,
    transactionId: order.transactionId || order.paymentId || order.gatewayOrderId || receiptNumber,
    expectedDeliveryAt:
      order.expectedDeliveryAt ||
      new Date(new Date(createdAt).getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    receipt: {
      id: receiptNumber,
      generatedAt: createdAt,
      storeName: 'Khyathi Collections',
      storeLocation: 'Narasaropet',
      storePhone: '93921 73693',
      expectedDeliveryText: 'Expected Delivery Within 5 Days',
      ...(order.receipt || {}),
    },
    statusHistory: order.statusHistory || [
      {
        status,
        label: status === 'Pending' ? 'Order placed' : 'Order confirmed',
        at: createdAt,
      },
    ],
    createdAt,
    updatedAt: order.updatedAt || new Date().toISOString(),
  };
}

export async function placeOrder(order) {
  try {
    const payload = {
      ...order,
      customerName: order.customerName || order.customer?.name,
      phone: order.phone || order.customer?.phone,
      email: order.email || order.customer?.email,
      pricing: order.pricing || {
        subtotal: order.subtotal,
        discount: order.discount || 0,
        couponCode: order.couponCode || null,
        shipping: order.shippingCharge || 0,
        total: order.total,
      },
    };
    const savedOrder = normalizeOrder(await ordersApi.create(payload));
    localStorage.setItem('khyathi-last-order', JSON.stringify(savedOrder));
    return savedOrder;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('Falling back to local order storage.', error);
    } else {
      throw error;
    }

    const localOrder = {
      id: `order-${Date.now()}`,
      ...order,
      orderNumber: `KC-${new Date().getFullYear()}-${String(readLocalOrders().length + 1).padStart(4, '0')}`,
      createdAt: new Date().toISOString(),
      status: order.status || 'Pending',
    };
    const normalizedOrder = normalizeOrder(localOrder);
    const orders = [normalizedOrder, ...readLocalOrders()];
    writeLocalOrders(orders);
    localStorage.setItem('khyathi-last-order', JSON.stringify(normalizedOrder));
    return normalizedOrder;
  }
}

export async function getOrders() {
  try {
    const orders = await ordersApi.list();
    return orders
      .map(normalizeOrder)
      .sort((left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0));
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('Falling back to local orders.', error);
      return readLocalOrders();
    }
    throw error;
  }
}

export async function getOrdersByUser(userId) {
  try {
    const orders = await ordersApi.list({ userId });
    return orders.map(normalizeOrder);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('Falling back to local user orders.', error);
    }
    return readLocalOrders().filter((order) => order.userId === userId);
  }
}

export async function getOrderById(orderId) {
  try {
    return normalizeOrder(await ordersApi.get(orderId));
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('Falling back to local order lookup.', error);
    }

    const lastOrder = JSON.parse(localStorage.getItem('khyathi-last-order') || 'null');
    const localOrder = readLocalOrders().find((order) => order.id === orderId) || lastOrder;
    return localOrder ? normalizeOrder(localOrder) : null;
  }
}

export async function updateOrderStatus(orderId, status) {
  try {
    return normalizeOrder(await ordersApi.update(orderId, { status }));
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('Falling back to local order status update.', error);
    } else {
      throw error;
    }

    const orders = readLocalOrders().map((order) =>
      order.id === orderId
        ? normalizeOrder({
            ...order,
            status,
            deliveryStatus: status,
            updatedAt: new Date().toISOString(),
            statusHistory: [
              ...(order.statusHistory || []),
              { status, label: status, at: new Date().toISOString() },
            ],
          })
        : order,
    );
    writeLocalOrders(orders);
    return true;
  }
}

export async function updateOrder(orderId, patch) {
  try {
    return normalizeOrder(await ordersApi.update(orderId, patch));
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('Falling back to local order update.', error);
    } else {
      throw error;
    }

    const orders = readLocalOrders().map((order) =>
      order.id === orderId
        ? normalizeOrder({
            ...order,
            ...patch,
            updatedAt: new Date().toISOString(),
          })
        : order,
    );
    writeLocalOrders(orders);
    return orders.find((order) => order.id === orderId) || true;
  }
}

export async function deleteOrder(orderId) {
  try {
    await ordersApi.remove(orderId);
    return true;
  } catch (error) {
    if (!import.meta.env.DEV) {
      throw error;
    }

    console.warn('Falling back to local order delete.', error);
    const orders = readLocalOrders().filter((order) => order.id !== orderId && order._id !== orderId);
    writeLocalOrders(orders);

    try {
      const lastOrder = JSON.parse(localStorage.getItem('khyathi-last-order') || 'null');
      if (lastOrder && (lastOrder.id === orderId || lastOrder._id === orderId)) {
        localStorage.removeItem('khyathi-last-order');
      }
    } catch {
      localStorage.removeItem('khyathi-last-order');
    }

    return true;
  }
}
