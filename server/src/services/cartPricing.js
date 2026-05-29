import { getDocument } from './firestore.js';

function normalizeCartItem(item = {}) {
  return {
    productId: String(item.productId || item.id || '').trim(),
    color: String(item.color || '').trim(),
    qty: Math.max(0, Math.floor(Number(item.qty || item.quantity || 0))),
  };
}

export function normalizeCartItems(items = []) {
  if (!Array.isArray(items)) {
    return [];
  }

  const merged = new Map();
  for (const item of items.map(normalizeCartItem)) {
    if (!item.productId || item.qty <= 0) {
      continue;
    }

    const key = `${item.productId}::${item.color}`;
    const current = merged.get(key);
    merged.set(key, current ? { ...current, qty: current.qty + item.qty } : item);
  }

  return Array.from(merged.values());
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

export async function quoteCartItems(items = [], { strictStock = false } = {}) {
  const normalizedItems = normalizeCartItems(items);
  const quotedItems = [];
  const unavailableItems = [];

  for (const item of normalizedItems) {
    const product = await getDocument('products', item.productId);

    if (!product) {
      unavailableItems.push({ ...item, reason: 'Product is no longer available' });
      continue;
    }

    const stockQuantity = Math.max(0, Math.floor(Number(product.stockQuantity || 0)));
    const available = Boolean(product.inStock) && !product.soldOut && stockQuantity > 0;
    const requestedQty = item.qty;
    const safeQty = stockQuantity > 0 ? Math.min(requestedQty, stockQuantity) : 0;

    if (!available || safeQty <= 0) {
      unavailableItems.push({ ...item, name: product.name, reason: 'Out of stock' });
      continue;
    }

    if (strictStock && requestedQty > stockQuantity) {
      const error = new Error(`Only ${stockQuantity} stock available for ${product.name || 'this item'}`);
      error.status = 409;
      throw error;
    }

    const salePrice = Number(product.salePrice || 0);
    const originalPrice = Number(product.originalPrice || salePrice || 0);
    quotedItems.push({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      category: product.category,
      color: item.color || product.colors?.[0]?.name || 'Default',
      qty: strictStock ? requestedQty : safeQty,
      requestedQty,
      salePrice,
      originalPrice,
      price: salePrice,
      lineTotal: salePrice * (strictStock ? requestedQty : safeQty),
      image: resolveImage(product),
      stockQuantity,
      inStock: available,
    });
  }

  const subtotal = quotedItems.reduce((sum, item) => sum + item.lineTotal, 0);

  return {
    items: quotedItems,
    unavailableItems,
    subtotal,
    itemCount: quotedItems.reduce((sum, item) => sum + item.qty, 0),
  };
}
