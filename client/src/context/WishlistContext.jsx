import { createContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { mergeUserProfile } from '../firebase/authService';
import { useAuth } from '../hooks/useAuth';

const WISHLIST_KEY = 'khyathi-wishlist';

export const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { userProfile } = useAuth();
  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    if (userProfile?.uid) {
      mergeUserProfile(userProfile.uid, { wishlist }).catch(() => {
        //
      });
    }
  }, [userProfile?.uid, wishlist]);

  const value = useMemo(
    () => ({
      wishlist,
      isInWishlist: (id) => wishlist.includes(id),
      toggleWishlist(id) {
        setWishlist((current) => {
          const next = current.includes(id)
            ? current.filter((entry) => entry !== id)
            : [...current, id];

          toast[next.includes(id) ? 'success' : 'error'](
            next.includes(id) ? 'Added to wishlist' : 'Removed from wishlist',
          );
          return next;
        });
      },
      removeFromWishlist(id) {
        setWishlist((current) => current.filter((entry) => entry !== id));
        toast('Removed from wishlist', { icon: '♡' });
      },
      clearWishlist() {
        setWishlist([]);
      },
    }),
    [wishlist],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}
