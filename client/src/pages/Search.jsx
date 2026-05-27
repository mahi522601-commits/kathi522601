import { Helmet } from 'react-helmet-async';
import { useDeferredValue, useMemo, useState } from 'react';
import ProductCard from '../components/ui/ProductCard';
import { useProducts } from '../hooks/useProducts';

export default function SearchPage() {
  const { products } = useProducts();
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  const results = useMemo(() => {
    if (!deferredQuery.trim()) {
      return products;
    }

    return products.filter((product) =>
      [product.name, product.category, product.description, ...(product.tags || [])]
        .join(' ')
        .toLowerCase()
        .includes(deferredQuery.toLowerCase()),
    );
  }, [deferredQuery, products]);

  return (
    <>
      <Helmet>
        <title>Search | Khyathi Collections</title>
      </Helmet>
      <section className="section-block">
        <div className="page-shell">
          <h1 className="section-title">Search</h1>
          <div className="mt-8">
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full border-b border-primary bg-transparent pb-4 text-2xl text-primary outline-none placeholder:text-[#ad9a83]"
              placeholder="Search by category, color, or product name..."
            />
          </div>

          {results.length ? (
            <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
              {results.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="mt-10 rounded-[1.8rem] border border-dashed border-borderwarm bg-white px-6 py-16 text-center">
              <p className="font-heading text-4xl text-primary">No matches yet</p>
              <p className="mt-3 text-sm text-muted">Try a broader search such as Saree or Festive.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
