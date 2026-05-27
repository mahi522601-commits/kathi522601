import { createStoredOrder } from '../services/orderRecords.js';
import { env } from '../config/environment.js';
import {
  assertPayuConfigured,
  generatePayuHash,
  verifyPayuResponse,
  PAYU_BASE_URL,
} from '../services/payu.js';

function buildTxnId() {
  return `kc_${Date.now()}`;
}

// Step 1: Frontend calls this to get hash + params to submit to PayU
export async function createPayuOrder(req, res, next) {
  try {
    assertPayuConfigured();

    const { amount, customer = {}, items = [] } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, error: 'Valid amount is required' });
    }

    const txnid = buildTxnId();
    const amountStr = Number(amount).toFixed(2);
    const productinfo = `Khyathi Collections Order (${items.length} item${items.length !== 1 ? 's' : ''})`;
    const firstname = customer.fullName || customer.name || 'Customer';
    const email = customer.email || '';
    const phone = customer.phone || '';

    const hash = generatePayuHash({
      txnid,
      amount: amountStr,
      productinfo,
      firstname,
      email,
    });

    res.json({
      success: true,
      payuUrl: PAYU_BASE_URL,
      params: {
        key: env.payuMerchantKey,
        txnid,
        amount: amountStr,
        productinfo,
        firstname,
        email,
        phone,
        surl: `${env.clientUrl}/order-confirmation?status=success`,
        furl: `${env.clientUrl}/order-confirmation?status=failure`,
        hash,
      },
    });
  } catch (error) {
    next(error);
  }
}

// Step 2: PayU redirects to your frontend with response params
// Frontend sends them here for verification + order creation
export async function verifyPayuPayment(req, res, next) {
  try {
    const { orderPayload, ...payuParams } = req.body;

    const { status, txnid, mihpayid } = payuParams;

    if (!status || !txnid || !orderPayload) {
      return res.status(400).json({ success: false, error: 'Incomplete payment payload' });
    }

    if (status !== 'success') {
      return res.status(400).json({ success: false, error: 'Payment was not successful' });
    }

    const isValid = verifyPayuResponse(payuParams);

    if (!isValid) {
      return res.status(400).json({ success: false, error: 'Payment signature verification failed' });
    }

    const order = await createStoredOrder({
      ...orderPayload,
      paymentMethod: 'PayU',
      paymentGateway: 'payu',
      paymentStatus: 'Paid',
      transactionId: mihpayid,
      payuTxnId: txnid,
      payuPaymentId: mihpayid,
      status: orderPayload.status || 'Confirmed',
    });

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
}