import { adminAuth } from '../config/firebase.js';
import { env } from '../config/environment.js';
import { getDocument } from '../services/firestore.js';
import { isAdminEmail } from '../utils/adminEmails.js';

export async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : '';
  const isLocalAdminToken =
    env.localAdminToken && bearerToken === env.localAdminToken;

  if ((!bearerToken && env.allowDevAuthBypass) || isLocalAdminToken) {
    req.user = {
      uid: 'local-admin',
      email: 'admin@khyathi.com',
      role: 'admin',
      source: isLocalAdminToken ? 'local-admin-token' : 'dev-bypass',
    };
    return next();
  }

  if (!bearerToken) {
    return res.status(401).json({ success: false, error: 'Missing authorization token' });
  }

  try {
    if (!adminAuth && env.allowDevAuthBypass) {
      req.user = {
        uid: 'local-admin',
        email: 'admin@khyathi.com',
        role: 'admin',
        source: 'mock-token',
      };
      return next();
    }

    const decodedToken = await adminAuth.verifyIdToken(bearerToken);
    const profile = await getDocument('users', decodedToken.uid);

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role:
        profile?.role === 'admin' || isAdminEmail(decodedToken.email)
          ? 'admin'
          : decodedToken.role || 'user',
    };
    return next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
}
