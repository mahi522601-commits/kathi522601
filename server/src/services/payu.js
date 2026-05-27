import crypto from 'crypto';
import { env } from '../config/environment.js';

export const PAYU_BASE_URL =
  env.payuMode === 'LIVE'
    ? 'https://secure.payu.in/_payment'
    : 'https://test.payu.in/_payment';

export function assertPayuConfigured() {
  if (!env.payuMerchantKey || !env.payuMerchantSalt) {
    const error = new Error(
      'PayU is not configured. Add PAYU_MERCHANT_KEY and PAYU_MERCHANT_SALT in environment variables.',
    );
    error.status = 400;
    throw error;
  }
}

// Hash formula: sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||salt)
export function generatePayuHash({ txnid, amount, productinfo, firstname, email }) {
  assertPayuConfigured();

  const hashString = [
    env.payuMerchantKey,
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    '', '', '', '', '', // udf1-udf5
    '', '', '', '', '', // reverse fields (empty)
    env.payuMerchantSalt,
  ].join('|');

  return crypto.createHash('sha512').update(hashString).digest('hex');
}

// Verify hash from PayU response (reverse hash)
// Formula: sha512(salt|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
export function verifyPayuResponse(params) {
  assertPayuConfigured();

  const {
    status, txnid, amount, productinfo,
    firstname, email, mihpayid,
    hash: receivedHash,
  } = params;

  const hashString = [
    env.payuMerchantSalt,
    status,
    '', '', '', '', '',       // udf5 to udf1 (reverse, empty)
    email,
    firstname,
    productinfo,
    amount,
    txnid,
    env.payuMerchantKey,
  ].join('|');

  const expectedHash = crypto.createHash('sha512').update(hashString).digest('hex');

  return expectedHash === receivedHash;
}