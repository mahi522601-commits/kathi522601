import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import cartApi from '../api/cartApi';
import { mergeUserProfile } from '../firebase/authService';
import { useAuth } from '../hooks/useAuth';

const CART_KEY = 'khyathi-cart';

export const CartContext = createContext(null);

function normalizeStoredItem(item = {}) {
  return {
    productId: String(item.productId || item.id || '').trim(),
    color: String(item.color || '').trim(),
    qty: Math.max(1, Math.floor(Number(item.qty || item.quantity || 1))),
  };
}

function readStoredCart() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    return Array.isArray(parsed)
      ? parsed.map(normalizeStoredItem).filter((item) => item.productId)
      : [];
  } catch {
    return [];
  }
}

function sameCartItems(left = [], right = []) {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((item, index) =>
    item.productId === right[index]?.productId &&
    item.color === right[index]?.color &&
    item.qty === right[index]?.qty,
  );
}

function resolveImage(product) {
  const image = product.imageObjects?.[0] || product.images?.[0];
  if (!image) {
    return '';
  }
  if (typeof image === 'string') {
    return image;
  }
  return image.thumbnail || image.mediumUrl || image.medium?.url || image.displayUrl || image.url || '';
}

function buildOptimisticItem(product, color, qty) {
  const salePrice = Number(product.salePrice || 0);
  return {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    category: product.category,
    color: color || product.colors?.[0]?.name || 'Default',
    qty,
    salePrice,
    originalPrice: Number(product.originalPrice || salePrice),
    price: salePrice,
    lineTotal: salePrice * qty,
    image: resolveImage(product),
    stockQuantity: Math.max(0, Math.floor(Number(product.stockQuantity || 0))),
    inStock: Boolean(product.inStock) && !product.soldOut,
  };
}

export function CartProvider({ children }) {
  const { userProfile } = useAuth();
  const [cartItems, setCartItems] = useState(readStoredCart);
  const [quotedItems, setQuotedItems] = useState([]);
  const [unavailableItems, setUnavailableItems] = useState([]);
  const [quoteLoading, setQuoteLoading] = useState(false);

  const refreshQuote = useCallback(async (items = cartItems) => {
    if (!items.length) {
      setQuotedItems([]);
      setUnavailableItems([]);
      return;
    }

    setQuoteLoading(true);
    try {
      const quote = await cartApi.quote(items);
      const liveItems = quote.items || [];
      const nextCartItems = liveItems.map((item) => ({
        productId: item.productId,
        color: item.color || '',
        qty: item.qty,
      }));

      if (!sameCartItems(items, nextCartItems)) {
        setCartItems(nextCartItems);
      }

      setQuotedItems(liveItems);
      setUnavailableItems(quote.unavailableItems || []);
    } catch (error) {
      toast.error(error.message || 'Unable to refresh cart prices');
    } finally {
      setQuoteLoading(false);
    }
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
    refreshQuote(cartItems);
  }, [cartItems, refreshQuote]);

  useEffect(() => {
    if (userProfile?.uid) {
      mergeUserProfile(userProfile.uid, { cart: cartItems }).catch(() => {
        //
      });
    }
  }, [cartItems, userProfile?.uid]);

  const value = useMemo(() => {
    const subtotal = quotedItems.reduce((sum, item) => sum + Number(item.salePrice || 0) * item.qty, 0);
    const itemCount = cartItems.reduce((sum, item) => sum + item.qty, 0);

    return {
      items: quotedItems,
      rawItems: cartItems,
      unavailableItems,
      quoteLoading,
      itemCount,
      subtotal,
      refreshQuote: () => refreshQuote(cartItems),
      addToCart(product, color, quantity = 1) {
        const stockQuantity = Math.max(0, Math.floor(Number(product.stockQuantity || 0)));
        const resolvedColor = color?.name || product.colors?.[0]?.name || 'Default';

        if (product.soldOut || !product.inStock || stockQuantity <= 0) {
          toast.error('This item is sold out');
          return false;
        }

        const existingItem = cartItems.find(
          (item) => item.productId === product.id && item.color === resolvedColor,
        );
        const nextQty = (existingItem?.qty || 0) + quantity;

        if (nextQty > stockQuantity) {
          toast.error(`Only ${stockQuantity} in stock`);
          return false;
        }

        setCartItems((current) => {
          const existingIndex = current.findIndex(
            (item) => item.productId === product.id && item.color === resolvedColor,
          );

          if (existingIndex >= 0) {
            return current.map((item, index) =>
              index === existingIndex ? { ...item, qty: nextQty } : item,
            );
          }

          return [...current, { productId: product.id, color: resolvedColor, qty: quantity }];
        });

        setQuotedItems((current) => {
          const existingIndex = current.findIndex(
            (item) => item.productId === product.id && item.color === resolvedColor,
          );

          if (existingIndex >= 0) {
            return current.map((item, index) =>
              index === existingIndex ? { ...item, qty: nextQty, lineTotal: item.salePrice * nextQty } : item,
            );
          }

          return [...current, buildOptimisticItem(product, resolvedColor, quantity)];
        });

        toast.success('Added to cart');
        return true;
      },
      updateQuantity(productId, color, qty) {
        setCartItems((current) =>
          current
            .map((item) => {
              if (item.productId !== productId || item.color !== color) {
                return item;
              }
              return { ...item, qty: Math.max(1, Math.floor(Number(qty || 1))) };
            })
            .filter((item) => item.qty > 0),
        );
      },
      removeFromCart(productId, color) {
        setCartItems((current) =>
          current.filter((item) => !(item.productId === productId && item.color === color)),
        );
        setQuotedItems((current) =>
          current.filter((item) => !(item.productId === productId && item.color === color)),
        );
        toast('Removed from cart');
      },
      clearCart() {
        setCartItems([]);
        setQuotedItems([]);
        setUnavailableItems([]);
      },
    };
  }, [cartItems, quotedItems, unavailableItems, quoteLoading, refreshQuote]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
