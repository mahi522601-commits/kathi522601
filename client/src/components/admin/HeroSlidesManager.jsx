import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Loader2, Save, Sparkles, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getSiteSettings, saveSiteSettings } from '../../firebase/settingsService';
import { formatPrice } from '../../utils/formatPrice';
import ImageUploader from './ImageUploader';

function imageUrl(image) {
  return image?.displayUrl || image?.url || image?.thumbnail || image || '';
}

function createSlide(product, image, index) {
  return {
    id: `hero-slide-${Date.now()}-${index}`,
    productId: product.id,
    image,
    type: 'homepage',
    active: true,
    redirectUrl: `/product/${product.id}`,
    eyebrow: index === 0 ? 'New Collection' : 'Editor Pick',
    title: product.name,
    subtitle: product.description,
  };
}

export default function HeroSlidesManager({ products = [] }) {
  const [siteSettings, setSiteSettings] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [draftImages, setDraftImages] = useState([]);
  const [draftMeta, setDraftMeta] = useState({
    title: '',
    active: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const productsById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );

  useEffect(() => {
    let mounted = true;

    async function loadSettings() {
      try {
        const settings = await getSiteSettings();
        if (!mounted) {
          return;
        }
        setSiteSettings(settings);
        setSelectedProductId(
          (current) => current || settings.heroSlides?.[0]?.productId || products[0]?.id || '',
        );
      } catch (error) {
        if (mounted) {
          toast.error('Unable to load hero slider settings');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadSettings();

    return () => {
      mounted = false;
    };
  }, [products]);

  useEffect(() => {
    if (!selectedProductId && products[0]?.id) {
      setSelectedProductId(products[0].id);
    }
  }, [products, selectedProductId]);

  function moveSlide(index, direction) {
    setSiteSettings((current) => {
      if (!current) {
        return current;
      }

      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= current.heroSlides.length) {
        return current;
      }

      const nextSlides = [...current.heroSlides];
      const [moved] = nextSlides.splice(index, 1);
      nextSlides.splice(targetIndex, 0, moved);
      return { ...current, heroSlides: nextSlides };
    });
  }

  function makeLeadSlide(index) {
    setSiteSettings((current) => {
      if (!current || index === 0) {
        return current;
      }

      const nextSlides = [...current.heroSlides];
      const [moved] = nextSlides.splice(index, 1);
      nextSlides.unshift(moved);
      return { ...current, heroSlides: nextSlides };
    });
  }

  function removeSlide(index) {
    setSiteSettings((current) => ({
      ...current,
      heroSlides: current.heroSlides.filter((_, slideIndex) => slideIndex !== index),
    }));
  }

  function addSlides() {
    const product = productsById.get(selectedProductId);
    if (!product) {
      toast.error('Choose a product to link these hero images');
      return;
    }

    if (!draftImages.length) {
      toast.error('Upload at least one hero image first');
      return;
    }

    const newSlides = draftImages.map((image, index) => ({
      ...createSlide(product, image, index),
      title: draftMeta.title || product.name,
      redirectUrl: draftMeta.redirectUrl || `/product/${product.id}`,
      type: 'homepage',
      active: draftMeta.active,
    }));
    setSiteSettings((current) => ({
      ...(current || { heroSlides: [] }),
      heroSlides: [...(current?.heroSlides || []), ...newSlides],
    }));
    setDraftImages([]);
    setDraftMeta({ title: '', active: true });
    toast.success(`${newSlides.length} hero slide(s) added`);
  }

  function updateSlide(index, patch) {
    setSiteSettings((current) => ({
      ...current,
      heroSlides: current.heroSlides.map((slide, slideIndex) =>
        slideIndex === index ? { ...slide, ...patch } : slide,
      ),
    }));
  }

  async function handleSave() {
    if (!siteSettings) {
      return;
    }

    if (!siteSettings.heroSlides?.length) {
      toast.error('Add at least one hero slide before saving');
      return;
    }

    setSaving(true);
    try {
      const saved = await saveSiteSettings(siteSettings);
      setSiteSettings(saved);
      toast.success('Hero slider updated successfully');
    } catch (error) {
      toast.error(error.message || 'Unable to save hero slider');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="card-surface p-6">
        <div className="flex items-center gap-3 text-body">
          <Loader2 className="animate-spin text-gold" size={18} />
          Loading hero slider settings...
        </div>
      </div>
    );
  }

  return (
    <div className="card-surface p-6 md:p-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-gold-dark">
            <Sparkles size={14} />
            Home Hero Slider
          </p>
          <h2 className="mt-2 font-heading text-4xl text-primary">Hero title and HD image</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Keep the hero clean: one title, one high-quality image, and an automatic Shop Now link to the selected product.
          </p>
        </div>
        <button
          type="button"
          className="action-button inline-flex items-center gap-2"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
          Save Hero Slides
        </button>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
        <div className="rounded-[1.8rem] border border-borderwarm bg-cream/70 p-5">
          <h3 className="font-heading text-2xl text-primary">Add New Slides</h3>
          <div className="mt-4 space-y-4">
            <label className="block text-sm font-semibold uppercase tracking-[0.16em] text-primary">
              Link product
              <select
                className="input-shell mt-2"
                value={selectedProductId}
                onChange={(event) => setSelectedProductId(event.target.value)}
              >
                <option value="">Select product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </label>
            <div>
              <input
                className="input-shell"
                placeholder="Banner title"
                value={draftMeta.title}
                onChange={(event) => setDraftMeta({ ...draftMeta, title: event.target.value })}
              />
            </div>
            <label className="inline-flex items-center gap-3 rounded-full border border-borderwarm bg-white px-4 py-3 text-sm font-semibold text-primary">
              <input
                type="checkbox"
                checked={draftMeta.active}
                onChange={(event) => setDraftMeta({ ...draftMeta, active: event.target.checked })}
              />
              Enable banner immediately
            </label>

            <ImageUploader
              value={draftImages}
              onChange={setDraftImages}
              productName={selectedProductId || 'hero-slide'}
            />

            <button type="button" className="action-button w-full" onClick={addSlides}>
              Add Uploaded Images to Hero
            </button>
          </div>
        </div>

        <div className="rounded-[1.8rem] border border-borderwarm bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-heading text-2xl text-primary">Current Slide Order</h3>
              <p className="mt-1 text-sm text-muted">
                Slide 1 is shown first on the homepage. Use the arrows to reorder.
              </p>
            </div>
            <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">
              {siteSettings?.heroSlides?.length || 0} slides
            </span>
          </div>

          {siteSettings?.heroSlides?.length ? (
            <div className="mt-5 grid gap-4">
              {siteSettings.heroSlides.map((slide, index) => {
                const product = productsById.get(slide.productId);
                return (
                  <div
                    key={slide.id}
                    className="grid gap-4 rounded-[1.5rem] border border-borderwarm bg-cream/50 p-4 md:grid-cols-[180px_1fr]"
                  >
                    <div className="overflow-hidden rounded-[1.25rem] bg-white shadow-sm">
                      <img
                        src={imageUrl(slide.image)}
                        alt={slide.title || product?.name || 'Hero slide'}
                        className="aspect-[4/5] h-full w-full object-cover"
                      />
                    </div>

                    <div className="flex flex-col gap-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-dark">
                            Slide {index + 1}
                          </p>
                          <h4 className="mt-2 font-heading text-3xl text-primary">
                            {product?.name || slide.title}
                          </h4>
                          <p className="mt-1 text-sm text-muted">
                            {product?.category || 'Featured Collection'}
                            {product?.salePrice ? ` • ${formatPrice(product.salePrice)}` : ''}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-body">
                            {slide.subtitle || product?.description}
                          </p>
                        </div>
                        {index === 0 ? (
                          <span className="rounded-full bg-gold px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
                            Live First
                          </span>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <input
                          className="input-shell min-w-[220px] flex-1 py-2 text-sm"
                          value={slide.title || ''}
                          onChange={(event) => updateSlide(index, { title: event.target.value })}
                          placeholder="Banner title"
                        />
                        <button
                          type="button"
                          className={`rounded-full px-4 py-2 text-sm font-semibold ${
                            slide.active ?? true ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                          }`}
                          onClick={() => updateSlide(index, { active: !(slide.active ?? true) })}
                        >
                          {slide.active ?? true ? 'Enabled' : 'Disabled'}
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 rounded-full border border-borderwarm px-4 py-2 text-sm text-primary transition hover:border-gold hover:text-gold disabled:opacity-30"
                          onClick={() => moveSlide(index, -1)}
                          disabled={index === 0}
                        >
                          <ArrowLeft size={14} />
                          Left
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 rounded-full border border-borderwarm px-4 py-2 text-sm text-primary transition hover:border-gold hover:text-gold disabled:opacity-30"
                          onClick={() => moveSlide(index, 1)}
                          disabled={index === siteSettings.heroSlides.length - 1}
                        >
                          Right
                          <ArrowRight size={14} />
                        </button>
                        <button
                          type="button"
                          className="rounded-full border border-borderwarm px-4 py-2 text-sm text-primary transition hover:border-gold hover:text-gold disabled:opacity-30"
                          onClick={() => makeLeadSlide(index)}
                          disabled={index === 0}
                        >
                          Make First
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 rounded-full border border-borderwarm px-4 py-2 text-sm text-maroon transition hover:border-maroon"
                          onClick={() => removeSlide(index)}
                        >
                          <Trash2 size={14} />
                          Remove
                        </button>
                      </div>
                      <div className="grid gap-3 md:grid-cols-[1fr_120px]">
                        <div className="overflow-hidden rounded-[18px] border border-borderwarm bg-white">
                          <img src={imageUrl(slide.image)} alt="" className="aspect-[16/7] w-full object-cover" />
                        </div>
                        <div className="overflow-hidden rounded-[18px] border border-borderwarm bg-white">
                          <img src={imageUrl(slide.image)} alt="" className="aspect-[9/16] w-full object-cover" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-5 rounded-[1.5rem] border border-dashed border-borderwarm bg-cream px-5 py-10 text-center text-muted">
              Upload HD hero images on the left. Each slide will show only the title and image on the homepage.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
