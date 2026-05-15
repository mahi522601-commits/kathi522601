import { createDocument, getDocument, updateDocument } from '../services/firestore.js';
import { isAdminEmail } from '../utils/adminEmails.js';

function resolveRole(existingRole, email = '') {
  if (existingRole === 'admin' || isAdminEmail(email)) {
    return 'admin';
  }

  return 'user';
}

export async function getCurrentUser(req, res, next) {
  try {
    const uid = req.user?.uid;
    let user = await getDocument('users', uid);
    const email = user?.email || req.user?.email || '';

    if (!user && req.user?.email) {
      user = await createDocument(
        'users',
        {
          name: req.user.email.split('@')[0],
          email: req.user.email,
          phone: '',
          role: resolveRole(null, req.user.email),
          wishlist: [],
          addresses: [],
          createdAt: new Date().toISOString(),
        },
        uid,
      );
    } else if (user && user.role !== resolveRole(user.role, email)) {
      user = await updateDocument('users', uid, {
        role: resolveRole(user.role, email),
      });
    }

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
}

export async function updateCurrentUser(req, res, next) {
  try {
    const uid = req.user?.uid;
    const existing = await getDocument('users', uid);
    const { role, ...safePatch } = req.body;
    const email = safePatch.email || existing?.email || req.user?.email || '';
    const resolvedRole = resolveRole(existing?.role, email);

    let user = existing
      ? await updateDocument('users', uid, { ...safePatch, role: resolvedRole })
      : null;

    if (!existing || !user) {
      user = await createDocument(
        'users',
        {
          name: req.body.name || req.user?.email?.split('@')[0] || 'Customer',
          email,
          phone: req.body.phone || '',
          role: resolvedRole,
          wishlist: req.body.wishlist || [],
          addresses: req.body.addresses || [],
          createdAt: new Date().toISOString(),
        },
        uid,
      );
    }

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
}
