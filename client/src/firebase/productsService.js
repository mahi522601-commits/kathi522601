import productsApi from '../api/productsApi';
import { sampleProducts } from './seedData';

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeImages(images = []) {
  if (!Array.isArray(images)) {
    return [];
  }

  return images.map((image) => {
    if (typeof image === 'string') {
      return {
        id: image,
        url: image,
        displayUrl: image,
        thumbnail: image,
        width: 1200,
        height: 1600,
      };
    }

    return {
      id: image.id || image.url,
      url: image.url || image.displayUrl || image.thumbnail,
      displayUrl: image.displayUrl || image.url || image.thumbnail,
      thumbnail: image.thumbnail || image.displayUrl || image.url,
      deleteUrl: image.deleteUrl,
      width: image.width || 1200,
      height: image.height || 1600,
    };
  });
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

function normalizeProduct(product, index = 0) {
  const salePrice = Number(product.salePrice || 0);
  const originalPrice = Number(product.originalPrice || salePrice || 0);
  const imageObjects = normalizeImages(product.images || []);

  return {
    ...product,
    id: product.id || `prod-${Date.now()}-${index}`,
    slug: product.slug || slugify(product.name || `product-${index}`),
    description: product.description || '',
    fabricDetails: product.fabricDetails || '',
    careInstructions: product.careInstructions || '',
    category: product.category || 'Sarees',
    originalPrice,
    salePrice,
    discountPercent:
      product.discountPercent ||
      Math.round(((originalPrice - salePrice) / Math.max(originalPrice, 1)) * 100),
    colors: normalizeColors(product.colors),
    imageObjects,
    images: imageObjects.map((image) => image.displayUrl),
    thumbnails: imageObjects.map((image) => image.thumbnail),
    inStock: product.inStock ?? true,
    soldOut: product.soldOut ?? false,
    isFeatured: product.isFeatured ?? false,
    isNewArrival: product.isNewArrival ?? false,
    soldCount: product.soldCount || 0,
    viewCount: product.viewCount || 0,
    tags: product.tags || [],
    createdAt: product.createdAt || new Date().toISOString(),
    updatedAt: product.updatedAt || new Date().toISOString(),
  };
}

function filterProducts(products, filters = {}) {
  return products
    .filter((product) => {
      if (filters.category && filters.category !== 'All' && product.category !== filters.category) {
        return false;
      }

      if (filters.categories?.length && !filters.categories.includes(product.category)) {
        return false;
      }

      if (filters.inStockOnly && (!product.inStock || product.soldOut)) {
        return false;
      }

      if (filters.priceRange) {
        const [minPrice, maxPrice] = filters.priceRange;
        if (product.salePrice < minPrice || product.salePrice > maxPrice) {
          return false;
        }
      }

      if (filters.colors?.length) {
        const names = product.colors.map((color) => color.name);
        if (!filters.colors.some((color) => names.includes(color))) {
          return false;
        }
      }

      if (filters.searchTerm) {
        const haystack = [
          product.name,
          product.category,
          product.description,
          ...(product.tags || []),
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(filters.searchTerm.toLowerCase())) {
          return false;
        }
      }

      return true;
    })
    .sort((left, right) => {
      switch (filters.sortBy) {
        case 'price-low':
          return left.salePrice - right.salePrice;
        case 'price-high':
          return right.salePrice - left.salePrice;
        case 'newest':
          return new Date(right.createdAt) - new Date(left.createdAt);
        case 'best-selling':
          return (right.soldCount || 0) - (left.soldCount || 0);
        default:
          return Number(right.isFeatured) - Number(left.isFeatured);
      }
    });
}

async function fetchProducts(filters = {}) {
  const params = {};

  if (filters.category && filters.category !== 'All') {
    params.category = filters.category;
  }

  if (filters.searchTerm) {
    params.search = filters.searchTerm;
  }

  if (filters.sortBy) {
    params.sort = filters.sortBy;
  }

  if (filters.featured) {
    params.featured = true;
  }

  if (filters.newArrivals) {
    params.newArrivals = true;
  }

  const products = await productsApi.list(params);
  return products.map(normalizeProduct);
}

export async function getProducts(filters = {}) {
  try {
    const products = await fetchProducts(filters);
    return filterProducts(products, filters);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('Falling back to local seed products.', error);
    }
    return filterProducts(sampleProducts.map(normalizeProduct), filters);
  }
}

export async function getProductById(id) {
  try {
    return normalizeProduct(await productsApi.get(id));
  } catch (error) {
    const products = await getProducts();
    return products.find((product) => product.id === id || product.slug === id) || null;
  }
}

export async function getFeaturedProducts(limitCount = 8) {
  const products = await getProducts({ sortBy: 'best-selling' });
  return products.filter((product) => product.isFeatured).slice(0, limitCount);
}

export async function getNewArrivals(limitCount = 8) {
  const products = await getProducts({ sortBy: 'newest' });
  return products.filter((product) => product.isNewArrival).slice(0, limitCount);
}

export async function saveProduct(product) {
  const payload = {
    ...product,
    colors: normalizeColors(product.colors),
    images: (product.imageObjects || normalizeImages(product.images || [])).map((image) => ({
      id: image.id || image.url || image.displayUrl || image,
      url: image.url || image.displayUrl || image.thumbnail || image,
      displayUrl: image.displayUrl || image.url || image.thumbnail || image,
      thumbnail: image.thumbnail || image.displayUrl || image.url || image,
      deleteUrl: image.deleteUrl,
      width: image.width || 1200,
      height: image.height || 1600,
    })),
    slug: product.slug || slugify(product.name),
  };

  const response = product.id
    ? await productsApi.update(product.id, payload)
    : await productsApi.create(payload);

  return normalizeProduct(response);
}

export async function deleteProduct(id) {
  return productsApi.remove(id);
}

export async function incrementSoldCount() {
  return true;
}

export async function searchProducts(term) {
  return getProducts({ searchTerm: term });
}

export async function getCollectionsOverview() {
  const products = await getProducts();
  return products.reduce((accumulator, product) => {
    accumulator[product.category] = (accumulator[product.category] || 0) + 1;
    return accumulator;
  }, {});
}
