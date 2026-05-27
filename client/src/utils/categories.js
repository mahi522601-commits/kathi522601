export function slugToCategory(slug) {
  const value = decodeURIComponent(slug || '').toLowerCase();

  const map = {
    jewellery: 'Jewellery',
    sarees: 'Sarees',
    'half-sarees': 'Half Sarees',
    dresses: 'Dresses',
    'dress-materials': 'Dress Materials',
  };

  return map[value] || 'All';
}

export function categoryToSlug(category) {
  return category.toLowerCase().replace(/\s+/g, '-');
}
