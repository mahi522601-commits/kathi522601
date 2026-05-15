import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { env } from './environment.js';

let adminApp = null;
let adminAuth = null;
let adminDb = null;

if (env.hasFirebaseAdminConfig) {
  try {
    adminApp =
      getApps()[0] ||
      initializeApp({
        credential: cert({
          projectId: env.firebaseProjectId,
          clientEmail: env.firebaseClientEmail,
          privateKey: env.firebasePrivateKey,
        }),
      });
    adminAuth = getAuth(adminApp);
    adminDb = getFirestore(adminApp);
  } catch (error) {
    console.warn('Unable to initialize Firebase Admin. Falling back to mock datastore.', error);
  }
}

export { adminApp, adminAuth, adminDb };
