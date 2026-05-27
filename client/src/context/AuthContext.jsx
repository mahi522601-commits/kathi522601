import { createContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import toast from 'react-hot-toast';
import { auth } from '../firebase/config';
import {
  getLocalSession,
  getUserProfile,
  loginWithEmail,
  loginWithGoogle,
  logoutUser,
  mergeUserProfile,
  registerWithEmail,
  resetPassword,
} from '../firebase/authService';
import { isAdminEmail } from '../utils/adminEmails';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      const session = getLocalSession();
      setUser(session);
      setUserProfile(session);
      setLoading(false);
      return undefined;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setUserProfile(null);
        setLoading(false);
        return;
      }

      try {
        const profile = await getUserProfile(firebaseUser.uid);
        setUser(firebaseUser);

        const adminUser = isAdminEmail(firebaseUser.email);

        setUserProfile(
          profile
            ? { ...profile, role: profile.role === 'admin' || adminUser ? 'admin' : 'user' }
            : {
                uid: firebaseUser.uid,
                name: firebaseUser.displayName || 'Customer',
                email: firebaseUser.email,
                role: adminUser ? 'admin' : 'user',
              },
        );
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn('Unable to load server-backed user profile, using auth fallback.', error);
        }
        const adminUser = isAdminEmail(firebaseUser.email);
        setUser(firebaseUser);
        setUserProfile({
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || 'Customer',
          email: firebaseUser.email,
          role: adminUser ? 'admin' : 'user',
        });
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = useMemo(
    () => ({
      user,
      userProfile,
      loading,
      isAuthenticated: Boolean(user || userProfile),
      isAdmin: userProfile?.role === 'admin',
      async login(payload) {
        const profile = await loginWithEmail(payload);
        setUser(profile);
        setUserProfile(profile);
        toast.success('Welcome back');
        return profile;
      },
      async register(payload) {
        const profile = await registerWithEmail(payload);
        setUser(profile);
        setUserProfile(profile);
        toast.success('Account created successfully');
        return profile;
      },
      async googleLogin() {
        const profile = await loginWithGoogle();
        setUser(profile);
        setUserProfile(profile);
        toast.success('Signed in with Google');
        return profile;
      },
      async logout() {
        await logoutUser();
        setUser(null);
        setUserProfile(null);
        toast.success('Logged out');
      },
      async requestPasswordReset(email) {
        await resetPassword(email);
        toast.success('Password reset sent');
      },
      async updateProfileFields(patch) {
        const uid = userProfile?.uid || user?.uid;
        const nextProfile = await mergeUserProfile(uid, patch);
        setUserProfile(nextProfile);
        toast.success('Profile updated');
        return nextProfile;
      },
    }),
    [loading, user, userProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
