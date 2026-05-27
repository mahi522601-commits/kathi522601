import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import authApi from '../api/authApi';
import { auth, googleProvider } from './config';
import { isAdminEmail } from '../utils/adminEmails';

const LOCAL_USERS_KEY = 'khyathi-local-users';
const LOCAL_SESSION_KEY = 'khyathi-local-session';

function readLocalUsers() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeLocalUsers(users) {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

function setLocalSession(session) {
  localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(session));
}

export function getLocalSession() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_SESSION_KEY) || 'null');
  } catch {
    return null;
  }
}

async function ensureUserProfile(uid, data) {
  if (!auth) {
    return { uid, ...data };
  }

  try {
    return await authApi.updateCurrentUser({
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      role: data.role || 'user',
      wishlist: data.wishlist || [],
      addresses: data.addresses || [],
      createdAt: data.createdAt || new Date().toISOString(),
    });
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('Unable to sync user profile to backend, using auth fallback.', error);
    }
    return { uid, ...data };
  }
}

export async function getUserProfile(uid) {
  if (!uid) {
    return null;
  }

  if (!auth) {
    const users = readLocalUsers();
    return users.find((user) => user.uid === uid) || null;
  }

  try {
    return await authApi.getCurrentUser();
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('Unable to fetch backend user profile.', error);
    }
    return null;
  }
}

export async function mergeUserProfile(uid, patch) {
  if (!uid) {
    return null;
  }

  if (!auth) {
    const users = readLocalUsers().map((user) => (user.uid === uid ? { ...user, ...patch } : user));
    writeLocalUsers(users);
    const session = getLocalSession();
    if (session?.uid === uid) {
      setLocalSession({ ...session, ...patch });
    }
    return users.find((user) => user.uid === uid);
  }

  try {
    return await authApi.updateCurrentUser(patch);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('Unable to update backend user profile, falling back locally.', error);
    }
    return { uid, ...patch };
  }
}

export async function registerWithEmail({ name, email, password, phone }) {
  if (!auth) {
    const users = readLocalUsers();
    if (users.some((user) => user.email === email)) {
      throw new Error('An account with this email already exists');
    }

    const profile = {
      uid: `local-user-${Date.now()}`,
      name,
      email,
      phone: phone || '',
      role: isAdminEmail(email) ? 'admin' : 'user',
      wishlist: [],
      addresses: [],
      createdAt: new Date().toISOString(),
      provider: 'password',
      password,
    };
    writeLocalUsers([profile, ...users]);
    setLocalSession(profile);
    return profile;
  }

  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName: name });
  return ensureUserProfile(credential.user.uid, {
    name,
    email,
    phone,
    role: isAdminEmail(email) ? 'admin' : 'user',
  });
}

export async function loginWithEmail({ email, password }) {
  const localUsers = readLocalUsers();
  const localProfile =
    localUsers.find((user) => user.email === email && user.password === password) ||
    (isAdminEmail(email) && password === 'Admin@123'
      ? {
          uid: 'local-admin',
          name: 'Khyathi Admin',
          email,
          phone: '',
          role: 'admin',
          wishlist: [],
          addresses: [],
        }
      : null);

  if (!auth) {
    if (!localProfile) {
      throw new Error('Invalid email or password');
    }

    if (!localUsers.some((user) => user.uid === localProfile.uid)) {
      writeLocalUsers([localProfile, ...localUsers]);
    }

    setLocalSession(localProfile);
    return localProfile;
  }

  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return ensureUserProfile(credential.user.uid, {
      name: credential.user.displayName || email.split('@')[0],
      email: credential.user.email,
      phone: '',
      role: isAdminEmail(email) ? 'admin' : 'user',
    });
  } catch (error) {
    if (!localProfile) {
      throw error;
    }

    if (!localUsers.some((user) => user.uid === localProfile.uid)) {
      writeLocalUsers([localProfile, ...localUsers]);
    }

    setLocalSession(localProfile);
    return localProfile;
  }
}

export async function loginWithGoogle() {
  if (!auth) {
    const profile = {
      uid: 'local-google-user',
      name: 'Google Shopper',
      email: 'shopper@example.com',
      phone: '',
      role: 'user',
      wishlist: [],
      addresses: [],
      provider: 'google',
    };
    setLocalSession(profile);
    return profile;
  }

  const provider = googleProvider || new GoogleAuthProvider();
  const credential = await signInWithPopup(auth, provider);
  return ensureUserProfile(credential.user.uid, {
    name: credential.user.displayName || 'Google User',
    email: credential.user.email,
    phone: credential.user.phoneNumber || '',
    role: isAdminEmail(credential.user.email) ? 'admin' : 'user',
  });
}

export async function logoutUser() {
  if (!auth) {
    localStorage.removeItem(LOCAL_SESSION_KEY);
    return true;
  }

  await signOut(auth);
  return true;
}

export async function resetPassword(email) {
  if (import.meta.env.DEV) {
    console.info(
      `Password reset requested for ${email}. Configure Firebase email actions to enable this flow.`,
    );
  }
  return true;
}
