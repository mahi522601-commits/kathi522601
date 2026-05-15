import { createStoredOrder } from '../services/orderRecords.js';
import { env } from '../config/environment.js';
import { createGatewayOrder, verifyGatewaySignature } from '../services/razorpay.js';

function buildReceipt() {
  return `kc_${Date.now()}`;
}

export async function createRazorpayOrder(req, res, next) {
  try {
    const { amount, currency = 'INR', customer = {}, items = [] } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, error: 'Valid amount is required' });
    }

    const gatewayOrder = await createGatewayOrder({
      amount: Number(amount) * 100,
      currency,
      receipt: buildReceipt(),
      notes: {
        customerName: customer.fullName || customer.name || 'Guest',
        customerPhone: customer.phone || '',
        itemCount: String(items.length || 0),
      },
    });

    res.json({
      success: true,
      keyId: env.razorpayKeyId,
      gatewayOrder,
    });
  } catch (error) {
    next(error);
  }
}

export async function verifyRazorpayPayment(req, res, next) {
  try {
    const {
      razorpay_payment_id: paymentId,
      razorpay_order_id: orderId,
      razorpay_signature: signature,
      orderPayload,
    } = req.body;

    if (!paymentId || !orderId || !signature || !orderPayload) {
      return res.status(400).json({ success: false, error: 'Incomplete payment payload' });
    }

    const signatureVerified = verifyGatewaySignature({ orderId, paymentId, signature });

    if (!signatureVerified) {
      return res.status(400).json({ success: false, error: 'Payment signature verification failed' });
    }

    const order = await createStoredOrder({
      ...orderPayload,
      paymentMethod: 'Razorpay',
      paymentGateway: 'razorpay',
      paymentStatus: 'Paid',
      gatewayOrderId: orderId,
      paymentId,
      razorpayPaymentId: paymentId,
      razorpayOrderId: orderId,
      transactionId: paymentId,
      status: orderPayload.status || 'Confirmed',
    });

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
}
