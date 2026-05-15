import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';
import ProductCard from '../ui/ProductCard';
import { ProductSkeleton } from '../ui/LoadingSpinner';

const PAGE_SIZE = 10;

export default function TopSellers() {
  const { products, loading } = useProducts({ sortBy: 'best-selling' });
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const mixedProducts = useMemo(() => {
    const sarees = products.filter((product) => product.category !== 'Jewellery');
    const jewellery = products.filter((product) => product.category === 'Jewellery');
    const mixed = [];
    const maxLength = Math.max(sarees.length, jewellery.length);

    for (let index = 0; index < maxLength; index += 1) {
      if (sarees[index]) mixed.push(sarees[index]);
      if (jewellery[index]) mixed.push(jewellery[index]);
    }

    return mixed.length ? mixed : products;
  }, [products]);

  const visibleProducts = mixedProducts.slice(0, visibleCount);
  const canLoadMore = visibleCount < mixedProducts.length;

  return (
    <section className="section-block bg-cream">
      <div className="page-shell">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-dark">
              Curated drop
            </p>
            <h2 className="section-title mt-2">Sarees & Jewellery Together</h2>
            <p className="section-subtitle mx-0 max-w-2xl">
              Browse a mixed luxury edit first, then keep revealing the next set without losing your place.
            </p>
          </div>
          <div className="rounded-full border border-gold/40 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Showing {Math.min(visibleCount, mixedProducts.length)} of {mixedProducts.length || 0}
          </div>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {loading
            ? Array.from({ length: PAGE_SIZE }).map((_, index) => <ProductSkeleton key={index} />)
            : visibleProducts.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>

        {!loading && canLoadMore ? (
          <div className="mt-10 flex justify-center">
            <motion.button
              type="button"
              className="action-button gap-2"
              whileTap={{ scale: 0.98 }}
              onClick={() => setVisibleCount((current) => current + PAGE_SIZE)}
            >
              View Next
              <ArrowRight size={16} />
            </motion.button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
