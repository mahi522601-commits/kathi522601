import settingsApi from '../api/settingsApi';
import { sampleProducts } from './seedData';

function normalizeImage(image, fallback = '') {
  if (!image) {
    return {
      id: fallback || `image-${Date.now()}`,
      url: fallback,
      displayUrl: fallback,
      thumbnail: fallback,
      width: 1200,
      height: 1600,
    };
  }

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
    id: image.id || image.url || fallback || `image-${Date.now()}`,
    url: image.url || image.displayUrl || image.thumbnail || fallback,
    displayUrl: image.displayUrl || image.url || image.thumbnail || fallback,
    thumbnail: image.thumbnail || image.displayUrl || image.url || fallback,
    deleteUrl: image.deleteUrl,
    width: image.width || 1200,
    height: image.height || 1600,
  };
}

function buildFallbackSlides() {
  return sampleProducts.slice(0, 5).map((product, index) => ({
    id: `hero-slide-${index + 1}`,
    productId: product.id,
    image: normalizeImage(product.imageObjects?.[0] || product.images?.[0]),
    eyebrow: index === 0 ? 'New Collection' : 'Editor Pick',
    title: product.name,
    subtitle: product.description,
  }));
}

export const fallbackSiteSettings = {
  id: 'site',
  announcement: 'Free shipping on all orders',
  heroSlides: buildFallbackSlides(),
  festivalBanners: [],
  instagramHandle: '@khyathi_collections',
  whatsappNumber: '+919999999999',
  features: { chatbotEnabled: true, notificationsEnabled: true },
};

function normalizeHeroSlide(slide, index) {
  const fallbackSlide = fallbackSiteSettings.heroSlides[index] || fallbackSiteSettings.heroSlides[0];
  return {
    id: slide?.id || fallbackSlide?.id || `hero-slide-${index + 1}`,
    productId: slide?.productId || fallbackSlide?.productId || sampleProducts[0].id,
    image: normalizeImage(slide?.image || slide?.displayUrl || slide?.url, fallbackSlide?.image?.displayUrl),
    eyebrow: slide?.eyebrow || fallbackSlide?.eyebrow || 'New Collection',
    title: slide?.title || fallbackSlide?.title || 'Khyathi Collections',
    subtitle:
      slide?.subtitle ||
      fallbackSlide?.subtitle ||
      'Discover refined drapes, premium fabrics, and occasion-ready elegance.',
    redirectUrl: slide?.redirectUrl || slide?.href || '',
    type: slide?.type || 'homepage',
    active: slide?.active ?? true,
  };
}

function normalizeFestivalBanner(banner, index) {
  return {
    id: banner?.id || `festival-banner-${index + 1}`,
    title: banner?.title || 'Khyathi Collections',
    subtitle: banner?.subtitle || 'Festival offers crafted for your celebrations.',
    image: normalizeImage(banner?.image || banner?.displayUrl || banner?.url),
    redirectUrl: banner?.redirectUrl || '/collections',
    startDate: banner?.startDate || '',
    endDate: banner?.endDate || '',
    active: banner?.active ?? true,
    createdAt: banner?.createdAt || new Date().toISOString(),
  };
}

export function normalizeSiteSettings(settings = {}) {
  const rawSlides =
    settings.heroSlides ||
    settings.heroImages?.map((image, index) => ({
      id: `hero-slide-${index + 1}`,
      productId: sampleProducts[index % sampleProducts.length]?.id,
      image,
    })) ||
    fallbackSiteSettings.heroSlides;

  return {
    ...fallbackSiteSettings,
    ...settings,
    heroSlides: rawSlides.map(normalizeHeroSlide),
    festivalBanners: (settings.festivalBanners || []).map(normalizeFestivalBanner),
    features: {
      ...fallbackSiteSettings.features,
      ...(settings.features || {}),
    },
  };
}

export async function getSiteSettings() {
  try {
    const response = await settingsApi.getSite();
    return normalizeSiteSettings(response);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('Falling back to local site settings.', error);
    }
    return normalizeSiteSettings(fallbackSiteSettings);
  }
}

export async function saveSiteSettings(patch) {
  const payload = normalizeSiteSettings(patch);
  const response = await settingsApi.updateSite(payload);
  return normalizeSiteSettings(response);
}
