import { Helmet } from 'react-helmet-async';
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Edit3, Plus, Trash2, X } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import ProductForm from '../../components/admin/ProductForm';
import { deleteProduct, saveProduct } from '../../firebase/productsService';
import { useProducts } from '../../hooks/useProducts';
import { formatPrice } from '../../utils/formatPrice';

function DeleteModal({ product, deleting, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        className="w-full max-w-md rounded-[24px] border border-[#ead7a2] bg-[#fffaf0] p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-dark">Confirm delete</p>
            <h2 className="mt-2 font-heading text-3xl text-primary">Delete this product?</h2>
          </div>
          <button type="button" onClick={onCancel} className="rounded-full bg-white p-2 text-primary" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <p className="mt-4 text-sm leading-6 text-body">
          {product?.name} will be removed from the storefront. This action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" className="action-button-outline" onClick={onCancel} disabled={deleting}>
            Cancel
          </button>
          <button type="button" className="action-button bg-maroon" onClick={onConfirm} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete Product'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminProducts() {
  const { products, loading, refresh } = useProducts();
  const [productRows, setProductRows] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setProductRows(products);
  }, [products]);

  const filteredProducts = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) {
      return productRows;
    }

    return productRows.filter((product) =>
      [product.name, product.category, ...(product.tags || [])].join(' ').toLowerCase().includes(term),
    );
  }, [productRows, search]);

  async function handleSave(product) {
    setSaving(true);
    try {
      const savedProduct = await saveProduct(product);
      setProductRows((current) => {
        const exists = current.some((entry) => entry.id === savedProduct.id);
        return exists
          ? current.map((entry) => (entry.id === savedProduct.id ? { ...entry, ...savedProduct } : entry))
          : [savedProduct, ...current];
      });
      toast.success(product.id ? 'Product updated successfully' : 'Product created successfully');
      setEditingProduct(null);
      setShowForm(false);
    } catch (error) {
      toast.error(error.message || 'Unable to save product');
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) {
      return;
    }

    setDeleting(true);
    try {
      await deleteProduct(deleteTarget.id);
      setProductRows((current) => current.filter((product) => product.id !== deleteTarget.id));
      toast.success('Product deleted');
      setDeleteTarget(null);
      refresh();
    } catch (error) {
      toast.error(error.message || 'Unable to delete product');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <Helmet>
        <title>Admin Products | Khyathi Collections</title>
      </Helmet>
      <section className="min-h-screen bg-[#0A1F44] py-8 text-white">
        <div className="page-shell grid gap-8 lg:grid-cols-[280px_1fr]">
          <AdminSidebar />
          <div className="space-y-8">
            <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-[#24140a] to-[#140b06] p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#f6d878]">Catalog control</p>
                  <h1 className="mt-3 font-heading text-5xl text-white">Products</h1>
                  <p className="mt-2 text-sm text-[#d8c6aa]">
                    Create, edit, price, stock, feature, and image-manage your storefront catalog.
                  </p>
                </div>
                <button
                  type="button"
                  className="action-button gap-2 bg-[#f6d878] text-primary"
                  onClick={() => {
                    setEditingProduct(null);
                    setShowForm((current) => !current);
                  }}
                >
                  <Plus size={16} />
                  {showForm ? 'Close Form' : 'Add Product'}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {showForm ? (
                <motion.div
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="rounded-[24px] border border-[#ead7a2]/40 bg-[#fffaf0] p-6 text-primary shadow-[0_24px_70px_rgba(0,0,0,0.18)] md:p-8"
                >
                  <ProductForm
                    product={editingProduct}
                    saving={saving}
                    onSave={handleSave}
                    onCancel={() => {
                      setShowForm(false);
                      setEditingProduct(null);
                    }}
                  />
                </motion.div>
              ) : null}
            </AnimatePresence>

            <div className="rounded-[24px] border border-white/10 bg-[#1c120a] p-5">
              <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="font-heading text-3xl text-white">Product Inventory</h2>
                  <p className="text-sm text-[#d8c6aa]">{filteredProducts.length} products visible</p>
                </div>
                <input
                  className="input-shell max-w-md bg-white text-primary"
                  placeholder="Search product, category, tag"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              <div className="overflow-hidden rounded-[18px] border border-white/10 bg-white">
                <div className="overflow-auto">
                  <table className="min-w-full text-left text-sm text-body">
                    <thead className="bg-[#f5ebd8]">
                      <tr>
                        <th className="px-4 py-4 font-semibold text-primary">Thumbnail</th>
                        <th className="px-4 py-4 font-semibold text-primary">Name</th>
                        <th className="px-4 py-4 font-semibold text-primary">Category</th>
                        <th className="px-4 py-4 font-semibold text-primary">Pricing</th>
                        <th className="px-4 py-4 font-semibold text-primary">Stock</th>
                        <th className="px-4 py-4 font-semibold text-primary">Featured</th>
                        <th className="px-4 py-4 font-semibold text-primary">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td className="px-4 py-8 text-center text-muted" colSpan={7}>
                            Loading products...
                          </td>
                        </tr>
                      ) : filteredProducts.length ? (
                        filteredProducts.map((product) => (
                          <tr key={product.id} className="border-t border-borderwarm">
                            <td className="px-4 py-4">
                              <img
                                src={product.thumbnails?.[0] || product.images?.[0]}
                                alt={product.name}
                                className="h-14 w-12 rounded-xl object-cover"
                                loading="lazy"
                              />
                            </td>
                            <td className="px-4 py-4">
                              <p className="font-semibold text-primary">{product.name}</p>
                              <p className="mt-1 line-clamp-1 max-w-xs text-xs text-muted">{product.description}</p>
                            </td>
                            <td className="px-4 py-4">{product.category}</td>
                            <td className="px-4 py-4">
                              <p className="font-semibold text-primary">{formatPrice(product.salePrice)}</p>
                              <p className="text-xs text-muted line-through">{formatPrice(product.originalPrice)}</p>
                            </td>
                            <td className="px-4 py-4">
                              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${product.inStock && !product.soldOut ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                {product.inStock && !product.soldOut ? 'In Stock' : 'Out'}
                              </span>
                            </td>
                            <td className="px-4 py-4">{product.isFeatured ? 'Yes' : 'No'}</td>
                            <td className="px-4 py-4">
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  className="rounded-full border border-borderwarm px-3 py-2 text-primary transition hover:border-gold hover:text-gold"
                                  onClick={() => {
                                    setEditingProduct(product);
                                    setShowForm(true);
                                  }}
                                >
                                  <Edit3 size={15} />
                                </button>
                                <button
                                  type="button"
                                  className="rounded-full border border-borderwarm px-3 py-2 text-maroon transition hover:border-maroon"
                                  onClick={() => setDeleteTarget(product)}
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="px-4 py-8 text-center text-muted" colSpan={7}>
                            No products found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {deleteTarget ? (
          <DeleteModal
            product={deleteTarget}
            deleting={deleting}
            onCancel={() => setDeleteTarget(null)}
            onConfirm={confirmDelete}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}
