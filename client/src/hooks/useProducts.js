import { useCallback, useEffect, useState } from 'react';
import { getProducts } from '../firebase/productsService';

export function useProducts(filters = {}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const refresh = useCallback(() => setReloadKey((current) => current + 1), []);

  useEffect(() => {
    let mounted = true;

    async function loadProducts() {
      setLoading(true);
      setError(null);

      try {
        const response = await getProducts(filters);
        if (mounted) {
          setProducts(response);
        }
      } catch (loadError) {
        if (mounted) {
          setError(loadError);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      mounted = false;
    };
  }, [
    filters.category,
    filters.categories?.join(','),
    filters.colors?.join(','),
    filters.inStockOnly,
    filters.priceRange?.join(','),
    filters.searchTerm,
    filters.sortBy,
    reloadKey,
  ]);

  return { products, loading, error, refresh };
}
