import { createDocument, getDocument, updateDocument } from '../services/firestore.js';
import { seedData } from '../data/seedData.js';

const defaultSiteSettings =
  seedData.settings.find((entry) => entry.id === 'site') || {
    id: 'site',
    announcement: 'Free shipping on all orders',
    heroSlides: [],
    instagramHandle: '@khyathi_collections',
    whatsappNumber: '+919999999999',
    features: { chatbotEnabled: true, notificationsEnabled: true },
  };

async function ensureSiteSettings() {
  const existing = await getDocument('settings', 'site');
  if (existing) {
    return existing;
  }

  return createDocument('settings', defaultSiteSettings, 'site');
}

export async function getSiteSettings(req, res, next) {
  try {
    const settings = await ensureSiteSettings();
    res.json({ success: true, settings });
  } catch (error) {
    next(error);
  }
}

export async function saveSiteSettings(req, res, next) {
  try {
    const existing = await getDocument('settings', 'site');
    const payload = {
      ...(existing || defaultSiteSettings),
      ...req.body,
      id: 'site',
    };

    const settings = existing
      ? await updateDocument('settings', 'site', payload)
      : await createDocument('settings', payload, 'site');

    res.json({ success: true, settings });
  } catch (error) {
    next(error);
  }
}
