import axios from 'axios';
import crypto from 'crypto';
import { env } from '../config/environment.js';

const RAZORPAY_BASE_URL = 'https://api.razorpay.com/v1';

function buildAuthHeader() {
  const token = Buffer.from(`${env.razorpayKeyId}:${env.razorpayKeySecret}`).toString('base64');
  return `Basic ${token}`;
}

export function assertRazorpayConfigured() {
  if (!env.razorpayKeyId || !env.razorpayKeySecret) {
    const error = new Error(
      'Razorpay is not configured yet. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in server/.env.',
    );
    error.status = 400;
    throw error;
  }
}

export async function createGatewayOrder({
  amount,
  currency = 'INR',
  receipt,
  notes = {},
}) {
  assertRazorpayConfigured();

  const { data } = await axios.post(
    `${RAZORPAY_BASE_URL}/orders`,
    {
      amount: Math.round(Number(amount)),
      currency,
      receipt,
      notes,
    },
    {
      headers: {
        Authorization: buildAuthHeader(),
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    },
  );

  return data;
}

export function verifyGatewaySignature({ orderId, paymentId, signature }) {
  assertRazorpayConfigured();

  const expectedSignature = crypto
    .createHmac('sha256', env.razorpayKeySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return expectedSignature === signature;
}
