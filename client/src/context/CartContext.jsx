import { createContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { mergeUserProfile } from '../firebase/authService';
import { useAuth } from '../hooks/useAuth';

const CART_KEY = 'khyathi-cart';

export const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { userProfile } = useAuth();
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (userProfile?.uid) {
      mergeUserProfile(userProfile.uid, { cart: items }).catch(() => {
        //
      });
    }
  }, [items, userProfile?.uid]);

  const value = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.salePrice * item.qty, 0);
    const itemCount = items.reduce((sum, item) => sum + item.qty, 0);

    return {
      items,
      itemCount,
      subtotal,
      addToCart(product, color, quantity = 1) {
        if (product.soldOut || !product.inStock) {
          toast.error('This item is sold out');
          return;
        }

        setItems((current) => {
          const existingIndex = current.findIndex(
            (item) => item.productId === product.id && item.color === color?.name,
          );

          if (existingIndex >= 0) {
            const next = [...current];
            next[existingIndex] = {
              ...next[existingIndex],
              qty: next[existingIndex].qty + quantity,
            };
            return next;
          }

          return [
            ...current,
            {
              productId: product.id,
              name: product.name,
              image: product.images[0],
              category: product.category,
              color: color?.name || product.colors?.[0]?.name || 'Default',
              qty: quantity,
              salePrice: product.salePrice,
              originalPrice: product.originalPrice,
              slug: product.slug,
            },
          ];
        });

        toast.success('Added to cart');
      },
      updateQuantity(productId, color, qty) {
        setItems((current) =>
          current
            .map((item) =>
              item.productId === productId && item.color === color
                ? { ...item, qty: Math.max(1, qty) }
                : item,
            )
            .filter((item) => item.qty > 0),
        );
      },
      removeFromCart(productId, color) {
        setItems((current) =>
          current.filter((item) => !(item.productId === productId && item.color === color)),
        );
        toast('Removed from cart', { icon: '🛒' });
      },
      clearCart() {
        setItems([]);
      },
    };
  }, [items, userProfile?.uid]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
