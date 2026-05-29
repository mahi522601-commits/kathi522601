function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildImage(url, index) {
  return {
    url,
    displayUrl: url,
    thumbnail: url,
    width: 1200,
    height: 1600,
    id: `img-${index + 1}`,
  };
}

function buildProduct(id, data) {
  const originalPrice = Number(data.originalPrice);
  const salePrice = Number(data.salePrice);
  const category = data.category || 'Sarees';

  return {
    id,
    slug: data.slug || slugify(data.name),
    description:
      data.description ||
      'A graceful festive drape with rich texture, striking contrast, and premium finishing.',
    fabricDetails:
      data.fabricDetails ||
      'Premium weave with soft fall, elegant border work, and a coordinated blouse piece.',
    careInstructions:
      data.careInstructions ||
      'Dry clean recommended. Store folded in muslin and avoid direct perfume on embellished areas.',
    originalPrice,
    salePrice,
    discountPercent: Math.round(((originalPrice - salePrice) / originalPrice) * 100),
    soldCount: data.soldCount || 0,
    viewCount: data.viewCount || 0,
    stockQuantity: ['Sarees', 'Half Sarees'].includes(category) ? 1 : data.stockQuantity ?? 10,
    inStock: data.inStock ?? true,
    soldOut: data.soldOut ?? false,
    isFeatured: data.isFeatured ?? false,
    isNewArrival: data.isNewArrival ?? false,
    tags: data.tags || [data.category, 'festive', 'ethnic'],
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
    ...data,
  };
}

const rawProducts = [
  {
    id: 'prod-001',
    name: 'Georgette Handwork Saree',
    category: 'Sarees',
    originalPrice: 5000,
    salePrice: 1650,
    images: [
      buildImage(
        'https://images.unsplash.com/photo-1610030469668-88467f8a3e15?auto=format&fit=crop&w=1200&q=80',
        0,
      ),
      buildImage(
        'https://images.unsplash.com/photo-1615201080668-c392f4f1a3fb?auto=format&fit=crop&w=1200&q=80',
        1,
      ),
      buildImage(
        'https://images.unsplash.com/photo-1615201080543-bf4f3fc39ba8?auto=format&fit=crop&w=1200&q=80',
        2,
      ),
    ],
    colors: [
      { name: 'Red', hex: '#dc2626' },
      { name: 'Green', hex: '#16a34a' },
      { name: 'Blue', hex: '#2563eb' },
    ],
    isFeatured: true,
    isNewArrival: true,
    soldCount: 45,
    tags: ['georgette', 'handwork', 'saree'],
  },
  {
    id: 'prod-002',
    name: 'Soft Dola Pattu Heritage Saree',
    category: 'Sarees',
    originalPrice: 6200,
    salePrice: 2890,
    images: [
      buildImage(
        'https://images.unsplash.com/photo-1610186594416-2c7c0131e35d?auto=format&fit=crop&w=1200&q=80',
        3,
      ),
      buildImage(
        'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80',
        4,
      ),
    ],
    colors: [
      { name: 'Maroon', hex: '#7f1d1d' },
      { name: 'Gold', hex: '#c8a951' },
      { name: 'Bottle Green', hex: '#1a4731' },
    ],
    isFeatured: true,
    soldCount: 61,
  },
  {
    id: 'prod-003',
    name: 'Kanchi Pattu Half Saree Set',
    category: 'Half Sarees',
    originalPrice: 7800,
    salePrice: 3490,
    images: [
      buildImage(
        'https://images.unsplash.com/photo-1610030469808-70a5f63b4ff8?auto=format&fit=crop&w=1200&q=80',
        5,
      ),
      buildImage(
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
        6,
      ),
    ],
    colors: [
      { name: 'Rani Pink', hex: '#e879b0' },
      { name: 'Parrot Green', hex: '#84cc16' },
    ],
    isFeatured: true,
    isNewArrival: true,
    soldCount: 38,
  },
  {
    id: 'prod-004',
    name: 'Temple Border Half Saree',
    category: 'Half Sarees',
    originalPrice: 6900,
    salePrice: 2990,
    images: [
      buildImage(
        'https://images.unsplash.com/photo-1605027990121-cbae9c0f9012?auto=format&fit=crop&w=1200&q=80',
        7,
      ),
      buildImage(
        'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80',
        8,
      ),
    ],
    colors: [
      { name: 'Purple', hex: '#9333ea' },
      { name: 'Gold', hex: '#c8a951' },
      { name: 'Blue', hex: '#2563eb' },
    ],
    soldCount: 22,
  },
  {
    id: 'prod-005',
    name: 'Printed Anarkali Dress',
    category: 'Dresses',
    originalPrice: 4200,
    salePrice: 1890,
    images: [
      buildImage(
        'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1200&q=80',
        9,
      ),
      buildImage(
        'https://images.unsplash.com/photo-1610030469661-b122f71369c1?auto=format&fit=crop&w=1200&q=80',
        10,
      ),
    ],
    colors: [
      { name: 'Baby Pink', hex: '#f9a8d4' },
      { name: 'Peach', hex: '#fbbf87' },
    ],
    isFeatured: true,
    soldCount: 57,
  },
  {
    id: 'prod-006',
    name: 'Banarasi Dress Material Combo',
    category: 'Dress Materials',
    originalPrice: 3000,
    salePrice: 1450,
    images: [
      buildImage(
        'https://images.unsplash.com/photo-1597983073652-4a464d5f9d38?auto=format&fit=crop&w=1200&q=80',
        11,
      ),
      buildImage(
        'https://images.unsplash.com/photo-1610030469668-88467f8a3e15?auto=format&fit=crop&w=1200&q=80',
        12,
      ),
    ],
    colors: [
      { name: 'Mustard', hex: '#ca8a04' },
      { name: 'Maroon', hex: '#7f1d1d' },
      { name: 'Teal', hex: '#0d9488' },
    ],
    isNewArrival: true,
    soldCount: 31,
  },
  {
    id: 'prod-013',
    name: 'Heritage Temple Necklace Set',
    category: 'Jewellery',
    originalPrice: 4890,
    salePrice: 2190,
    images: [
      buildImage(
        'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1200&q=80',
        13,
      ),
      buildImage(
        'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80',
        14,
      ),
      buildImage(
        'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=1200&q=80',
        15,
      ),
    ],
    colors: [
      { name: 'Antique Gold', hex: '#c19b55' },
      { name: 'Ruby', hex: '#dc2626' },
    ],
    isFeatured: true,
    isNewArrival: true,
    soldCount: 35,
    tags: ['temple jewellery', 'necklace', 'festive'],
    description:
      'A regal temple jewellery necklace set with sculpted detailing, warm antique polish, and statement festive elegance.',
    fabricDetails: 'Crafted with premium alloy base, antique finish, and matching earrings.',
    careInstructions: 'Store in a dry pouch and avoid moisture, perfume, and harsh chemicals.',
  },
  {
    id: 'prod-014',
    name: 'Kundan Pearl Bridal Set',
    category: 'Jewellery',
    originalPrice: 6200,
    salePrice: 2890,
    images: [
      buildImage(
        'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80',
        16,
      ),
      buildImage(
        'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1200&q=80',
        17,
      ),
      buildImage(
        'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=1200&q=80',
        18,
      ),
    ],
    colors: [
      { name: 'Pearl White', hex: '#f7f2ea' },
      { name: 'Gold', hex: '#c8a951' },
    ],
    soldCount: 28,
    tags: ['kundan', 'bridal', 'pearls'],
    description:
      'A luminous bridal jewellery set combining kundan stones, pearl accents, and rich ceremonial presence.',
    fabricDetails: 'Premium kundan setting with layered pearl finish and matching drop earrings.',
    careInstructions: 'Wipe gently after use and keep away from direct perfume and humidity.',
  },
  {
    id: 'prod-015',
    name: 'Lakshmi Antique Bangles',
    category: 'Jewellery',
    originalPrice: 3200,
    salePrice: 1490,
    images: [
      buildImage(
        'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=1200&q=80',
        19,
      ),
      buildImage(
        'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80',
        20,
      ),
      buildImage(
        'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1200&q=80',
        21,
      ),
    ],
    colors: [
      { name: 'Antique Gold', hex: '#c19b55' },
      { name: 'Maroon', hex: '#7f1d1d' },
    ],
    soldCount: 19,
    tags: ['bangles', 'antique', 'lakshmi'],
    description:
      'Classic antique-finish bangles designed to pair beautifully with silk sarees and festive half-saree looks.',
    fabricDetails: 'Premium alloy bangles with carved motifs and rich heritage-inspired detailing.',
    careInstructions: 'Store flat, avoid water exposure, and clean softly with a dry cloth.',
  },
];

function buildHeroSlide(product, index) {
  return {
    id: `hero-slide-${index + 1}`,
    productId: product.id,
    image: product.images[0],
    eyebrow: index === 0 ? 'New Collection' : 'Editor Pick',
    title: product.name,
    subtitle: product.description || 'Shop the latest luxury arrivals from Khyathi Collections.',
  };
}

export const seedData = {
  products: rawProducts.map((product) => buildProduct(product.id, product)),
  orders: [],
  users: [
    {
      id: 'local-admin',
      name: 'Khyathi Admin',
      email: 'admin@khyathi.com',
      phone: '',
      role: 'admin',
      wishlist: [],
      addresses: [],
      createdAt: new Date().toISOString(),
    },
  ],
  coupons: [
    {
      id: 'WELCOME10',
      code: 'WELCOME10',
      discount: 10,
      minOrderValue: 2000,
      maxUses: 100,
      usedCount: 12,
      expiresAt: '2026-12-31',
      active: true,
    },
    {
      id: 'FESTIVE15',
      code: 'FESTIVE15',
      discount: 15,
      minOrderValue: 3500,
      maxUses: 50,
      usedCount: 9,
      expiresAt: '2026-10-31',
      active: true,
    },
  ],
  reviews: [],
  contactMessages: [],
  settings: [
    {
      id: 'site',
      announcement: 'Free shipping on all orders',
      heroSlides: rawProducts.slice(0, 5).map(buildHeroSlide),
      instagramHandle: '@khyathi__collections',
      whatsappNumber: '9392173693',
      features: { chatbotEnabled: true, notificationsEnabled: true },
    },
  ],
};
