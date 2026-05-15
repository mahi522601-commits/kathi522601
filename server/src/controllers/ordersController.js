import { getDocument, listDocuments, updateDocument } from '../services/firestore.js';
import { createStoredOrder } from '../services/orderRecords.js';

export async function getOrders(req, res, next) {
  try {
    const allOrders = await listDocuments('orders');
    const { userId, mine } = req.query;

    let orders = allOrders;

    if (req.user?.role !== 'admin' || mine === 'true') {
      orders = allOrders.filter((order) => order.userId === req.user?.uid);
    } else if (userId) {
      orders = allOrders.filter((order) => order.userId === userId);
    }

    orders.sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));

    res.json({ success: true, orders });
  } catch (error) {
    next(error);
  }
}

export async function getOrder(req, res, next) {
  try {
    const order = await getDocument('orders', req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    if (req.user?.role !== 'admin' && order.userId !== req.user?.uid) {
      return res.status(403).json({ success: false, error: 'You do not have access to this order' });
    }

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
}

export async function createOrder(req, res, next) {
  try {
    const order = await createStoredOrder({
      ...req.body,
      status: req.body.status || 'Pending',
    });
    res.status(201).json({ success: true, order });
  } catch (error) {
    next(error);
  }
}

export async function updateOrder(req, res, next) {
  try {
    const existingOrder = await getDocument('orders', req.params.id);
    if (!existingOrder) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const nextBody = { ...req.body, updatedAt: new Date().toISOString() };

    if (req.body.status && req.body.status !== existingOrder.status) {
      nextBody.deliveryStatus = req.body.deliveryStatus || req.body.status;
      nextBody.statusHistory = [
        ...(existingOrder.statusHistory || []),
        {
          status: req.body.status,
          label: req.body.status,
          at: nextBody.updatedAt,
        },
      ];
    }

    const order = await updateDocument('orders', req.params.id, nextBody);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
}
