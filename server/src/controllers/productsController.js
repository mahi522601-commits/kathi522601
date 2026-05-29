import { createDocument, deleteDocument, getDocument, listDocuments, updateDocument } from '../services/firestore.js';
import { deleteManyFromImgBB } from '../services/imgbb.js';

function sortProducts(products, sort) {
  switch (sort) {
    case 'price-low':
      return [...products].sort((left, right) => left.salePrice - right.salePrice);
    case 'price-high':
      return [...products].sort((left, right) => right.salePrice - left.salePrice);
    case 'best-selling':
    case 'trending':
      return [...products].sort((left, right) => (right.soldCount || 0) - (left.soldCount || 0));
    case 'newest':
      return [...products].sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));
    default:
      return [...products].sort((left, right) => Number(right.isFeatured) - Number(left.isFeatured));
  }
}

function normalizeColors(colors = []) {
  const normalized = (Array.isArray(colors) ? colors : [])
    .map((color) => {
      if (typeof color === 'string') {
        return { name: color.trim(), hex: '#000000' };
      }

      return {
        name: String(color?.name || '').trim(),
        hex: /^#[0-9a-f]{6}$/i.test(color?.hex || '') ? color.hex : '#000000',
      };
    })
    .filter((color) => color.name);

  return normalized.length ? normalized : [{ name: 'Default', hex: '#000000' }];
}

function normalizeProductPayload(payload) {
  const stockQuantity = Math.max(0, Math.floor(Number(payload.stockQuantity || 0)));

  return {
    ...payload,
    colors: normalizeColors(payload.colors),
    originalPrice: Number(payload.originalPrice || 0),
    salePrice: Number(payload.salePrice || 0),
    stockQuantity,
    inStock: Boolean(payload.inStock) && stockQuantity > 0,
    soldOut: Boolean(payload.soldOut) || stockQuantity <= 0,
  };
}

export async function getProducts(req, res, next) {
  try {
    const { category, search, featured, newArrivals, sort } = req.query;
    let products = await listDocuments('products');

    if (category) {
      products = products.filter((product) => product.category.toLowerCase() === category.toLowerCase());
    }

    if (search) {
      const query = search.toLowerCase();
      products = products.filter((product) =>
        [product.name, product.description, product.category, ...(product.tags || [])]
          .join(' ')
          .toLowerCase()
          .includes(query),
      );
    }

    if (featured === 'true') {
      products = products.filter((product) => product.isFeatured);
    }

    if (newArrivals === 'true') {
      products = products.filter((product) => product.isNewArrival);
    }

    products = sortProducts(products, sort);

    res.json({ success: true, products });
  } catch (error) {
    next(error);
  }
}

export async function getProduct(req, res, next) {
  try {
    const product = await getDocument('products', req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
}

export async function createProduct(req, res, next) {
  try {
    const payload = {
      ...normalizeProductPayload(req.body),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const product = await createDocument('products', payload, payload.id);
    res.status(201).json({ success: true, product });
  } catch (error) {
    next(error);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const existingProduct = await getDocument('products', req.params.id);
    if (!existingProduct) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const payload = normalizeProductPayload(req.body);
    const nextImages = Array.isArray(payload.images) ? payload.images : [];
    const nextImageKeys = new Set(
      nextImages.map((image) => image?.id || image?.url || image?.displayUrl || image).filter(Boolean),
    );
    const removedImages = (existingProduct.images || []).filter((image) => {
      const key = image?.id || image?.url || image?.displayUrl || image;
      return key && !nextImageKeys.has(key);
    });

    const product = await updateDocument('products', req.params.id, payload);

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    await deleteManyFromImgBB(removedImages);
    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
}

export async function removeProduct(req, res, next) {
  try {
    const product = await getDocument('products', req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    await deleteDocument('products', req.params.id);
    await deleteManyFromImgBB(product.images || product.imageObjects || []);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}
