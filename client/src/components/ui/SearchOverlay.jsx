import { useDeferredValue, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getFeaturedProducts, searchProducts } from '../../firebase/productsService';
import { formatPrice } from '../../utils/formatPrice';
import { CloseIcon, SearchIcon } from './Icons';
import  LoadingSpinner  from './LoadingSpinner';

const popularTags = ['Saree', 'Georgette', 'Half Saree', 'Black', 'Wedding', 'Festive'];

export default function SearchOverlay({ open, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    getFeaturedProducts(4).then(setSuggestions).catch(() => {
      //
    });
  }, []);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    if (open) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose, open]);

  useEffect(() => {
    let mounted = true;

    async function runSearch() {
      if (!open) {
        return;
      }

      if (!deferredQuery.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const response = await searchProducts(deferredQuery);
        if (mounted) {
          setResults(response.slice(0, 8));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    runSearch();

    return () => {
      mounted = false;
    };
  }, [deferredQuery, open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[100] overflow-auto bg-[#faf7f2]/95 backdrop-blur"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <div className="page-shell py-10">
            <div className="flex items-center justify-between">
              <p className="font-heading text-4xl text-primary md:text-5xl">Search the store</p>
              <button type="button" onClick={onClose} className="rounded-full border border-borderwarm p-3 text-primary">
                <CloseIcon />
              </button>
            </div>

            <div className="mt-10 flex items-center gap-3 border-b border-primary pb-4">
              <SearchIcon className="h-6 w-6 text-primary" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search for sarees, dresses, colors..."
                className="w-full bg-transparent text-2xl text-primary outline-none placeholder:text-[#ad9a83] md:text-3xl"
              />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {popularTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setQuery(tag)}
                  className="rounded-full border border-borderwarm bg-white px-4 py-2 text-sm text-body transition hover:border-gold hover:text-primary"
                >
                  {tag}
                </button>
              ))}
            </div>

            <div className="mt-10">
              {loading ? (
                <LoadingSpinner label="Searching products" />
              ) : query.trim() ? (
                results.length ? (
                  <>
                    <p className="text-sm uppercase tracking-[0.18em] text-gold-dark">Results</p>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      {results.map((product) => (
                        <Link
                          key={product.id}
                          to={`/product/${product.id}`}
                          onClick={onClose}
                          className="card-surface overflow-hidden"
                        >
                          <img src={product.images[0]} alt={product.name} className="h-60 w-full object-cover" loading="lazy" />
                          <div className="p-4">
                            <p className="line-clamp-2 font-semibold text-primary">{product.name}</p>
                            <p className="mt-2 text-sm text-body">{formatPrice(product.salePrice)}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="rounded-[1.8rem] border border-dashed border-borderwarm bg-white px-6 py-14 text-center">
                    <p className="font-heading text-4xl text-primary">No products found</p>
                    <p className="mt-3 text-sm text-muted">Try another keyword like Georgette, Green, or Half Saree.</p>
                  </div>
                )
              ) : (
                <>
                  <p className="text-sm uppercase tracking-[0.18em] text-gold-dark">You May Also Like</p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {suggestions.map((product) => (
                      <Link
                        key={product.id}
                        to={`/product/${product.id}`}
                        onClick={onClose}
                        className="card-surface overflow-hidden"
                      >
                        <img src={product.images[0]} alt={product.name} className="h-60 w-full object-cover" loading="lazy" />
                        <div className="p-4">
                          <p className="line-clamp-2 font-semibold text-primary">{product.name}</p>
                          <p className="mt-2 text-sm text-body">{formatPrice(product.salePrice)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
