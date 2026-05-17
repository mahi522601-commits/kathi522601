function parseMultilineSecret(value) {
  return value?.replace(/\\n/g, '\n') || '';
}

const DEFAULT_CLIENT_URLS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

function parseClientUrls(value) {
  const rawUrls = String(value || '')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean);

  const hasPlaceholder = rawUrls.some((url) =>
    url.includes('your-frontend-url.com')
  );

  const usableUrls = hasPlaceholder ? [] : rawUrls;

  const shouldIncludeLocalDefaults =
    (process.env.NODE_ENV || 'development') !== 'production';

  if (shouldIncludeLocalDefaults) {
    return [...new Set([...DEFAULT_CLIENT_URLS, ...usableUrls])];
  }

  return usableUrls.length ? usableUrls : DEFAULT_CLIENT_URLS;
}

const hasFirebaseAdminConfig =
  Boolean(process.env.FIREBASE_PROJECT_ID) &&
  Boolean(process.env.FIREBASE_CLIENT_EMAIL) &&
  Boolean(process.env.FIREBASE_PRIVATE_KEY) &&
  !process.env.FIREBASE_PRIVATE_KEY.includes(
    'YOUR_PRIVATE_KEY_HERE'
  );

const clientUrls = parseClientUrls(process.env.CLIENT_URL);

export const env = {
  port: Number(process.env.PORT || 5000),

  nodeEnv: process.env.NODE_ENV || 'development',

  clientUrl: clientUrls[0] || 'http://localhost:5173',

  clientUrls,

  imgbbApiKey: process.env.IMGBB_API_KEY || '',

  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',

  firebaseProjectId: process.env.FIREBASE_PROJECT_ID || '',

  firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',

  firebasePrivateKey: parseMultilineSecret(
    process.env.FIREBASE_PRIVATE_KEY
  ),

  razorpayKeyId: process.env.RAZORPAY_KEY_ID || '',

  razorpayKeySecret:
    process.env.RAZORPAY_KEY_SECRET || '',

  hasFirebaseAdminConfig,

  useMockStore: !hasFirebaseAdminConfig,

  allowDevAuthBypass:
    (process.env.NODE_ENV || 'development') !==
      'production' && !hasFirebaseAdminConfig,
};

export function validateEnvironment() {
  if (env.nodeEnv === 'production') {
    const missing = [];

    if (!env.firebaseProjectId)
      missing.push('FIREBASE_PROJECT_ID');

    if (!env.firebaseClientEmail)
      missing.push('FIREBASE_CLIENT_EMAIL');

    if (!env.firebasePrivateKey)
      missing.push('FIREBASE_PRIVATE_KEY');

    if (!env.imgbbApiKey)
      missing.push('IMGBB_API_KEY');

    if (missing.length) {
      throw new Error(
        `Missing required environment variables: ${missing.join(
          ', '
        )}`
      );
    }
  }

  if (env.useMockStore) {
    console.warn(
      'Firebase Admin credentials are incomplete. Server will use development mock datastore.'
    );
  }
}