import { colorMap } from '../utils/colorMap';
import { indianCities } from '../utils/indianCities';

function buildProduct(id, overrides) {
  const category = overrides.category || 'Sarees';
  const salePrice = overrides.salePrice || 2499;
  const originalPrice = overrides.originalPrice || Math.round(salePrice * 2.25);

  return {
    id,
    slug: overrides.slug || overrides.name.toLowerCase().replace(/\s+/g, '-'),
    description:
      overrides.description ||
      'An elegant festive silhouette with rich texture, graceful drape, and handcrafted detail designed for celebrations and memorable evenings.',
    fabricDetails:
      overrides.fabricDetails ||
      'Premium weave with soft fall, contrast blouse piece, and intricate border finishing.',
    careInstructions:
      overrides.careInstructions ||
      'Dry clean recommended. Store in a muslin cover and avoid direct perfume on embellishments.',
    category,
    originalPrice,
    salePrice,
    discountPercent: Math.round(((originalPrice - salePrice) / originalPrice) * 100),
    images: overrides.images,
    colors: overrides.colors || [
      { name: 'Red', hex: colorMap.Red },
      { name: 'Green', hex: colorMap.Green },
    ],
    inStock: overrides.inStock ?? true,
    soldOut: overrides.soldOut ?? false,
    isFeatured: overrides.isFeatured ?? false,
    isNewArrival: overrides.isNewArrival ?? false,
    soldCount: overrides.soldCount || 0,
    tags: overrides.tags || [category, 'festive', 'ethnic'],
    createdAt: overrides.createdAt || new Date().toISOString(),
    ...overrides,
  };
}

const sareeImages = [
  'https://images.unsplash.com/photo-1610030469668-88467f8a3e15?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1615201080543-bf4f3fc39ba8?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1610186594416-2c7c0131e35d?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1597983073652-4a464d5f9d38?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1610030469808-70a5f63b4ff8?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1605027990121-cbae9c0f9012?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1610030469661-b122f71369c1?auto=format&fit=crop&w=900&q=80',
];

const altImages = [
  'https://images.unsplash.com/photo-1615201080668-c392f4f1a3fb?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80',
];

export const sampleProducts = [
  buildProduct('prod-001', {
    name: 'Georgette Handwork Saree',
    category: 'Sarees',
    salePrice: 1650,
    originalPrice: 5000,
    images: [sareeImages[0], altImages[0], sareeImages[1], altImages[1]],
    colors: [
      { name: 'Red', hex: colorMap.Red },
      { name: 'Green', hex: colorMap.Green },
      { name: 'Blue', hex: colorMap.Blue },
    ],
    isFeatured: true,
    isNewArrival: true,
    soldCount: 45,
    tags: ['georgette', 'wedding', 'saree'],
  }),
  buildProduct('prod-002', {
    name: 'Soft Dola Pattu Heritage Saree',
    category: 'Sarees',
    salePrice: 2890,
    originalPrice: 6200,
    images: [sareeImages[2], altImages[2], sareeImages[3], altImages[3]],
    colors: [
      { name: 'Maroon', hex: colorMap.Maroon },
      { name: 'Gold', hex: colorMap.Gold },
      { name: 'Bottle Green', hex: colorMap['Bottle Green'] },
    ],
    isFeatured: true,
    soldCount: 61,
  }),
  buildProduct('prod-003', {
    name: 'Kanchi Pattu Half Saree Set',
    category: 'Half Sarees',
    salePrice: 3490,
    originalPrice: 7800,
    images: [sareeImages[4], altImages[4], sareeImages[5], altImages[5]],
    colors: [
      { name: 'Rani Pink', hex: colorMap['Rani Pink'] },
      { name: 'Parrot Green', hex: colorMap['Parrot Green'] },
    ],
    isFeatured: true,
    isNewArrival: true,
    soldCount: 38,
  }),
  buildProduct('prod-004', {
    name: 'Temple Border Half Saree',
    category: 'Half Sarees',
    salePrice: 2990,
    originalPrice: 6900,
    images: [sareeImages[6], altImages[6], sareeImages[7], altImages[7]],
    colors: [
      { name: 'Purple', hex: colorMap.Purple },
      { name: 'Gold', hex: colorMap.Gold },
      { name: 'Blue', hex: colorMap.Blue },
    ],
    soldCount: 22,
  }),
  buildProduct('prod-005', {
    name: 'Printed Anarkali Dress',
    category: 'Dresses',
    salePrice: 1890,
    originalPrice: 4200,
    images: [altImages[1], sareeImages[1], altImages[3], sareeImages[3]],
    colors: [
      { name: 'Baby Pink', hex: colorMap['Baby Pink'] },
      { name: 'Peach', hex: colorMap.Peach },
    ],
    isFeatured: true,
    soldCount: 57,
  }),
  buildProduct('prod-006', {
    name: 'Embroidered Festive Dress',
    category: 'Dresses',
    salePrice: 2290,
    originalPrice: 4900,
    images: [altImages[2], sareeImages[2], altImages[5], sareeImages[5]],
    colors: [
      { name: 'Wine', hex: colorMap.Wine },
      { name: 'Black', hex: colorMap.Black },
    ],
    soldCount: 18,
  }),
  buildProduct('prod-007', {
    name: 'Banarasi Dress Material Combo',
    category: 'Dress Materials',
    salePrice: 1450,
    originalPrice: 3000,
    images: [sareeImages[3], altImages[3], sareeImages[0], altImages[0]],
    colors: [
      { name: 'Mustard', hex: colorMap.Mustard },
      { name: 'Maroon', hex: colorMap.Maroon },
      { name: 'Teal', hex: colorMap.Teal },
    ],
    isNewArrival: true,
    soldCount: 31,
  }),
  buildProduct('prod-008', {
    name: 'Zigzag Viscose Dress Material',
    category: 'Dress Materials',
    salePrice: 1290,
    originalPrice: 2800,
    images: [altImages[4], sareeImages[4], altImages[6], sareeImages[6]],
    colors: [
      { name: 'Olive Green', hex: colorMap['Olive Green'] },
      { name: 'Orange', hex: colorMap.Orange },
    ],
    soldCount: 12,
  }),
  buildProduct('prod-009', {
    name: 'Wedding Edit Silk Saree',
    category: 'Sarees',
    salePrice: 3990,
    originalPrice: 8500,
    images: [sareeImages[1], altImages[5], sareeImages[5], altImages[2]],
    colors: [
      { name: 'Gold', hex: colorMap.Gold },
      { name: 'Maroon', hex: colorMap.Maroon },
      { name: 'Cream', hex: colorMap.Cream },
    ],
    isFeatured: true,
    soldCount: 68,
  }),
  buildProduct('prod-010', {
    name: 'Pista Green Designer Saree',
    category: 'Sarees',
    salePrice: 2590,
    originalPrice: 5600,
    images: [sareeImages[7], altImages[7], sareeImages[2], altImages[1]],
    colors: [
      { name: 'Pista Green', hex: colorMap['Pista Green'] },
      { name: 'Cream', hex: colorMap.Cream },
    ],
    soldCount: 41,
  }),
  buildProduct('prod-011', {
    name: 'Royal Navy Half Saree',
    category: 'Half Sarees',
    salePrice: 3290,
    originalPrice: 7100,
    images: [altImages[0], sareeImages[0], altImages[4], sareeImages[4]],
    colors: [
      { name: 'Navy', hex: colorMap.Navy },
      { name: 'Silver', hex: colorMap.Silver },
    ],
    soldCount: 27,
  }),
  buildProduct('prod-012', {
    name: 'Everyday Grace Cotton Dress',
    category: 'Dresses',
    salePrice: 1490,
    originalPrice: 3200,
    images: [altImages[6], sareeImages[6], altImages[2], sareeImages[2]],
    colors: [
      { name: 'Sky Blue', hex: colorMap['Sky Blue'] },
      { name: 'White', hex: colorMap.White },
    ],
    soldCount: 49,
  }),
  buildProduct('prod-013', {
    name: 'Heritage Temple Necklace Set',
    category: 'Jewellery',
    salePrice: 2190,
    originalPrice: 4890,
    images: [
      'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=900&q=80',
    ],
    colors: [
      { name: 'Antique Gold', hex: '#c19b55' },
      { name: 'Ruby', hex: colorMap.Red },
    ],
    isFeatured: true,
    isNewArrival: true,
    soldCount: 35,
    tags: ['temple jewellery', 'necklace', 'festive'],
    description:
      'A regal temple jewellery necklace set with sculpted detailing, warm antique polish, and statement festive elegance.',
    fabricDetails: 'Crafted with premium alloy base, antique finish, and matching earrings.',
    careInstructions: 'Store in a dry pouch and avoid moisture, perfume, and harsh chemicals.',
  }),
  buildProduct('prod-014', {
    name: 'Kundan Pearl Bridal Set',
    category: 'Jewellery',
    salePrice: 2890,
    originalPrice: 6200,
    images: [
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=900&q=80',
    ],
    colors: [
      { name: 'Pearl White', hex: '#f7f2ea' },
      { name: 'Gold', hex: colorMap.Gold },
    ],
    soldCount: 28,
    tags: ['kundan', 'bridal', 'pearls'],
    description:
      'A luminous bridal jewellery set combining kundan stones, pearl accents, and rich ceremonial presence.',
    fabricDetails: 'Premium kundan setting with layered pearl finish and matching drop earrings.',
    careInstructions: 'Wipe gently after use and keep away from direct perfume and humidity.',
  }),
  buildProduct('prod-015', {
    name: 'Lakshmi Antique Bangles',
    category: 'Jewellery',
    salePrice: 1490,
    originalPrice: 3200,
    images: [
      'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=80',
    ],
    colors: [
      { name: 'Antique Gold', hex: '#c19b55' },
      { name: 'Maroon', hex: colorMap.Maroon },
    ],
    soldCount: 19,
    tags: ['bangles', 'antique', 'lakshmi'],
    description:
      'Classic antique-finish bangles designed to pair beautifully with silk sarees and festive half-saree looks.',
    fabricDetails: 'Premium alloy bangles with carved motifs and rich heritage-inspired detailing.',
    careInstructions: 'Store flat, avoid water exposure, and clean softly with a dry cloth.',
  }),
];

export const sampleCollections = [
  {
    name: 'Jewellery',
    image:
      sampleProducts.find((product) => product.category === 'Jewellery')?.images[0] ||
      sampleProducts[0].images[0],
    description: 'Statement finishing pieces for weddings, festive looks, and gifting moments',
  },
  {
    name: 'Sarees',
    image: sampleProducts[0].images[0],
    description: 'Timeless drapes for festive and everyday grace',
  },
  {
    name: 'Half Sarees',
    image: sampleProducts[2].images[0],
    description: 'Young celebratory silhouettes with heritage charm',
  },
  {
    name: 'Dresses',
    image: sampleProducts[4].images[0],
    description: 'Effortless elegance in flowy occasion-ready styles',
  },
  {
    name: 'Dresses',
    image: sampleProducts[4].images[0],
    description: 'Effortless elegance in flowy occasion-ready styles',
  },
];

export const heroImages = sampleProducts.slice(0, 5).map((product) => product.images[0]);

export const heroSlides = sampleProducts.slice(0, 5).map((product, index) => ({
  id: `hero-slide-${index + 1}`,
  productId: product.id,
  image: product.images[0],
  eyebrow: index === 0 ? 'New Collection' : 'Editor Pick',
  title: product.name,
  subtitle: product.description,
}));

export const sampleTestimonials = [
  {
    id: 'testimonial-1',
    name: 'Harika M.',
    review:
      'The saree looked even richer in person. The drape, the finishing, and the delivery experience all felt premium.',
    productId: sampleProducts[0].id,
    productName: sampleProducts[0].name,
    image: sampleProducts[0].images[0],
  },
  {
    id: 'testimonial-2',
    name: 'Sowmya R.',
    review:
      'I ordered a half saree for an engagement and received so many compliments. Beautiful colors and true-to-photo fabric.',
    productId: sampleProducts[2].id,
    productName: sampleProducts[2].name,
    image: sampleProducts[2].images[0],
  },
  {
    id: 'testimonial-3',
    name: 'Keerthi V.',
    review:
      'The packaging was neat and the dress fit the mood of the event perfectly. Khyathi Collections feels very thoughtfully curated.',
    productId: sampleProducts[4].id,
    productName: sampleProducts[4].name,
    image: sampleProducts[4].images[0],
  },
];

export const instagramPosts = sampleProducts.slice(0, 8).map((product, index) => ({
  id: `insta-${index + 1}`,
  image: product.images[0],
  url: 'https://www.instagram.com/',
}));

export const sampleCoupons = [
  {
    code: 'WELCOME10',
    discount: 10,
    minOrderValue: 2000,
    maxUses: 100,
    usedCount: 12,
    expiresAt: '2026-12-31',
    active: true,
  },
  {
    code: 'FESTIVE15',
    discount: 15,
    minOrderValue: 3500,
    maxUses: 50,
    usedCount: 9,
    expiresAt: '2026-10-31',
    active: true,
  },
];

export const sampleNotifications = sampleProducts.slice(0, 6).map((product, index) => ({
  id: `notif-${index + 1}`,
  name: product.name,
  image: product.images[0],
  city: indianCities[index % indianCities.length],
}));
