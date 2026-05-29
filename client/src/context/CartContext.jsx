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
        const stockQuantity = Math.max(0, Math.floor(Number(product.stockQuantity || 0)));
        const resolvedColor = color?.name || product.colors?.[0]?.name || 'Default';
        if (product.soldOut || !product.inStock || stockQuantity <= 0) {
          toast.error('This item is sold out');
          return false;
        }

        const existingItem = items.find(
          (item) => item.productId === product.id && item.color === resolvedColor,
        );
        const nextQty = (existingItem?.qty || 0) + quantity;

        if (nextQty > stockQuantity) {
          toast.error(`Only ${stockQuantity} in stock`);
          return false;
        }

        setItems((current) => {
          const existingIndex = current.findIndex(
            (item) => item.productId === product.id && item.color === resolvedColor,
          );
          const currentNextQty = (existingIndex >= 0 ? current[existingIndex].qty : 0) + quantity;

          if (existingIndex >= 0) {
            const next = [...current];
            next[existingIndex] = {
              ...next[existingIndex],
              qty: Math.min(currentNextQty, stockQuantity),
              stockQuantity,
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
              color: resolvedColor,
              qty: quantity,
              salePrice: product.salePrice,
              originalPrice: product.originalPrice,
              stockQuantity,
              slug: product.slug,
            },
          ];
        });

        toast.success('Added to cart');
        return true;
      },
      updateQuantity(productId, color, qty) {
        setItems((current) =>
          current
            .map((item) => {
              if (item.productId !== productId || item.color !== color) {
                return item;
              }

              const maxQty = Math.max(0, Math.floor(Number(item.stockQuantity || 0)));
              const nextQty = Math.max(1, qty);
              if (maxQty && nextQty > maxQty) {
                toast.error(`Only ${maxQty} in stock`);
                return { ...item, qty: maxQty };
              }

              return { ...item, qty: nextQty };
            })
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
