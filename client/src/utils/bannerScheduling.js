export function resolveBannerImage(image) {
  return image?.displayUrl || image?.url || image?.thumbnail || image || '';
}

export function isBannerScheduled(banner, now = new Date()) {
  if (!(banner?.active ?? true)) {
    return false;
  }

  const current = now.getTime();
  const startsAt = banner.startDate ? new Date(`${banner.startDate}T00:00:00`).getTime() : -Infinity;
  const endsAt = banner.endDate ? new Date(`${banner.endDate}T23:59:59`).getTime() : Infinity;

  return current >= startsAt && current <= endsAt;
}

export function getActiveFestivalBanner(banners = []) {
  return banners.find((banner) => isBannerScheduled(banner) && resolveBannerImage(banner.image)) || null;
}

export function festivalDismissKey(bannerId) {
  return `khyathi-festival-banner-dismissed-${bannerId}`;
}
