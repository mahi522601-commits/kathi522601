import { useEffect, useMemo, useState } from 'react';
import ImageUploader from './ImageUploader';

const blankProduct = {
  name: '',
  category: 'Sarees',
  description: '',
  fabricDetails: '',
  careInstructions: '',
  originalPrice: 0,
  salePrice: 0,
  inStock: true,
  soldOut: false,
  isFeatured: false,
  isNewArrival: false,
  imageObjects: [],
  colors: [{ name: 'Red', hex: '#dc2626' }],
  tags: '',
};

export default function ProductForm({ product, onSave, onCancel, saving = false }) {
  const [form, setForm] = useState(blankProduct);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm(
      product
        ? {
            ...product,
            imageObjects: product.imageObjects || product.images || [],
            tags: Array.isArray(product.tags) ? product.tags.join(', ') : product.tags || '',
          }
        : blankProduct,
    );
  }, [product]);

  const discountPercent = useMemo(() => {
    const original = Number(form.originalPrice || 0);
    const sale = Number(form.salePrice || 0);
    if (!original || original <= sale) {
      return 0;
    }
    return Math.round(((original - sale) / original) * 100);
  }, [form.originalPrice, form.salePrice]);

  function updateColor(index, patch) {
    setForm((current) => ({
      ...current,
      colors: current.colors.map((color, colorIndex) =>
        colorIndex === index ? { ...color, ...patch } : color,
      ),
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!form.name.trim()) {
      setError('Product name is required.');
      return;
    }

    if (!form.description.trim()) {
      setError('Product description is required.');
      return;
    }

    if (Number(form.salePrice) <= 0 || Number(form.originalPrice) <= 0) {
      setError('Original and sale prices must be greater than zero.');
      return;
    }

    if (!form.imageObjects?.length) {
      setError('Upload at least one product image.');
      return;
    }

    await onSave({
      ...form,
      originalPrice: Number(form.originalPrice),
      salePrice: Number(form.salePrice),
      discountPercent,
      tags: form.tags
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    });
    setForm(blankProduct);
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {error ? (
        <div className="rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <input className="input-shell md:col-span-2" placeholder="Product Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
        <select className="input-shell" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
          <option value="Jewellery">Jewellery</option>
          <option value="Sarees">Sarees</option>
          <option value="Half Sarees">Half Sarees</option>
          <option value="Dresses">Dresses</option>
          <option value="Dress Materials">Dress Materials</option>
        </select>
        <input className="input-shell" placeholder="Tags (comma separated)" value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} />
        <textarea className="w-full rounded-[1.6rem] border border-borderwarm bg-white p-4 text-sm outline-none md:col-span-2" rows="4" placeholder="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        <textarea className="w-full rounded-[1.6rem] border border-borderwarm bg-white p-4 text-sm outline-none" rows="3" placeholder="Fabric Details" value={form.fabricDetails} onChange={(event) => setForm({ ...form, fabricDetails: event.target.value })} />
        <textarea className="w-full rounded-[1.6rem] border border-borderwarm bg-white p-4 text-sm outline-none" rows="3" placeholder="Care Instructions" value={form.careInstructions} onChange={(event) => setForm({ ...form, careInstructions: event.target.value })} />
        <input type="number" className="input-shell" placeholder="Original Price" value={form.originalPrice} onChange={(event) => setForm({ ...form, originalPrice: event.target.value })} required />
        <input type="number" className="input-shell" placeholder="Sale Price" value={form.salePrice} onChange={(event) => setForm({ ...form, salePrice: event.target.value })} required />
      </div>

      <div className="rounded-[1.4rem] border border-borderwarm bg-white p-5">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-primary">Colors</p>
          <button
            type="button"
            className="rounded-full border border-borderwarm px-3 py-2 text-sm text-primary"
            onClick={() => setForm((current) => ({ ...current, colors: [...current.colors, { name: '', hex: '#000000' }] }))}
          >
            Add Color
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {form.colors.map((color, index) => (
            <div key={`${color.name}-${index}`} className="grid gap-3 md:grid-cols-[1fr_140px_100px]">
              <input className="input-shell" placeholder="Color Name" value={color.name} onChange={(event) => updateColor(index, { name: event.target.value })} />
              <input type="color" className="h-12 w-full rounded-full border border-borderwarm bg-white px-3" value={color.hex} onChange={(event) => updateColor(index, { hex: event.target.value })} />
              <button
                type="button"
                className="rounded-full border border-borderwarm px-3 py-3 text-sm text-maroon"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    colors: current.colors.filter((_, colorIndex) => colorIndex !== index),
                  }))
                }
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <ImageUploader
        value={form.imageObjects || []}
        onChange={(imageObjects) => setForm({ ...form, imageObjects })}
        productName={form.name || 'product'}
      />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {[
          ['inStock', 'In Stock'],
          ['soldOut', 'Sold Out'],
          ['isFeatured', 'Featured'],
          ['isNewArrival', 'New Arrival'],
        ].map(([key, label]) => (
          <label key={key} className="inline-flex items-center gap-3 rounded-full border border-borderwarm bg-white px-4 py-3 text-sm text-body">
            <input
              type="checkbox"
              checked={Boolean(form[key])}
              onChange={(event) => setForm({ ...form, [key]: event.target.checked })}
            />
            {label}
          </label>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">Discount: {discountPercent}%</p>
        <div className="flex gap-3">
          <button type="button" className="action-button-outline" onClick={onCancel} disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="action-button" disabled={saving}>
            {saving ? 'Saving...' : product?.id ? 'Update Product' : 'Save Product'}
          </button>
        </div>
      </div>
    </form>
  );
}
