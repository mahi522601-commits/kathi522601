import { Helmet } from 'react-helmet-async';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProductCard from '../components/ui/ProductCard';
import { ProductSkeleton } from '../components/ui/LoadingSpinner';
import { useProducts } from '../hooks/useProducts';
import { categoryToSlug, slugToCategory } from '../utils/categories';
import { collectionCategories } from '../utils/constants';
import { colorMap } from '../utils/colorMap';

const PRODUCTS_PER_PAGE = 20;

export default function Shop() {
  const { category } = useParams();
  const defaultCategory = category ? slugToCategory(category) : 'All';
  const { products: allProducts, loading } = useProducts();
  const [selectedCategories, setSelectedCategories] = useState(
    defaultCategory === 'All' ? [] : [defaultCategory],
  );
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_PAGE);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    setVisibleCount(PRODUCTS_PER_PAGE);
    setSelectedCategories(defaultCategory === 'All' ? [] : [defaultCategory]);
  }, [defaultCategory]);

  const availableColors = useMemo(() => {
    const colorNames = new Set();
    allProducts.forEach((product) => {
      product.colors?.forEach((color) => colorNames.add(color.name));
    });
    return Array.from(colorNames);
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    return allProducts
      .filter((product) => {
        if (selectedCategories.length && !selectedCategories.includes(product.category)) {
          return false;
        }
        if (product.salePrice < priceRange[0] || product.salePrice > priceRange[1]) {
          return false;
        }
        if (
          selectedColors.length &&
          !selectedColors.some((color) => product.colors?.some((entry) => entry.name === color))
        ) {
          return false;
        }
        if (inStockOnly && (!product.inStock || product.soldOut)) {
          return false;
        }
        return true;
      })
      .sort((left, right) => {
        switch (sortBy) {
          case 'price-low':
            return left.salePrice - right.salePrice;
          case 'price-high':
            return right.salePrice - left.salePrice;
          case 'newest':
            return new Date(right.createdAt) - new Date(left.createdAt);
          case 'best-selling':
            return (right.soldCount || 0) - (left.soldCount || 0);
          default:
            return Number(right.isFeatured) - Number(left.isFeatured);
        }
      });
  }, [allProducts, inStockOnly, priceRange, selectedCategories, selectedColors, sortBy]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const categoryCounts = useMemo(() => {
    return allProducts.reduce((accumulator, product) => {
      accumulator[product.category] = (accumulator[product.category] || 0) + 1;
      return accumulator;
    }, {});
  }, [allProducts]);

  function toggleCategory(value) {
    setVisibleCount(PRODUCTS_PER_PAGE);
    setSelectedCategories((current) =>
      current.includes(value) ? current.filter((entry) => entry !== value) : [...current, value],
    );
  }

  function toggleColor(value) {
    setVisibleCount(PRODUCTS_PER_PAGE);
    setSelectedColors((current) =>
      current.includes(value) ? current.filter((entry) => entry !== value) : [...current, value],
    );
  }

  function clearAll() {
    setVisibleCount(PRODUCTS_PER_PAGE);
    setSelectedCategories(defaultCategory === 'All' ? [] : [defaultCategory]);
    setPriceRange([0, 10000]);
    setSelectedColors([]);
    setInStockOnly(false);
    setSortBy('featured');
  }

  const title = selectedCategories.length === 1 ? selectedCategories[0] : 'All Products';

  const sidebar = (
    <div className="rounded-[1.6rem] border border-borderwarm bg-white p-6">
      <div className="flex items-center justify-between">
        <p className="font-heading text-3xl text-primary">Filter</p>
        <button type="button" className="text-sm font-semibold text-muted" onClick={clearAll}>
          Clear All
        </button>
      </div>

      <div className="mt-8 space-y-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Category</p>
          <div className="mt-4 space-y-3">
            {collectionCategories.map((item) => {
              const categoryName = slugToCategory(categoryToSlug(item.name));
              return (
                <label key={item.name} className="flex items-center justify-between text-sm text-body">
                  <span className="inline-flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(categoryName)}
                      onChange={() => toggleCategory(categoryName)}
                    />
                    {item.name}
                  </span>
                  <span className="text-muted">({categoryCounts[item.name] || 0})</span>
                </label>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Price Range</p>
          <div className="mt-4 space-y-3">
            <input
              type="range"
              min="0"
              max="10000"
              step="100"
              value={priceRange[1]}
              onChange={(event) => {
                setVisibleCount(PRODUCTS_PER_PAGE);
                setPriceRange([0, Number(event.target.value)]);
              }}
              className="w-full accent-[#2c1a0e]"
            />
            <p className="text-sm text-muted">Rs. {priceRange[0]} â€” Rs. {priceRange[1]}</p>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Color</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {availableColors.map((color) => (
              <button
                key={color}
                type="button"
                title={color}
                onClick={() => toggleColor(color)}
                className={`h-7 w-7 rounded-full border-2 ${
                  selectedColors.includes(color) ? 'border-primary' : 'border-white ring-1 ring-black/10'
                }`}
                style={{ background: colorMap[color] || '#dddddd' }}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="inline-flex items-center gap-3 text-sm text-body">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(event) => {
                setVisibleCount(PRODUCTS_PER_PAGE);
                setInStockOnly(event.target.checked);
              }}
            />
            In Stock only
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>{title} | Khyathi Collections</title>
      </Helmet>
      <section className="section-block">
        <div className="page-shell">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="section-title">{title}</h1>
              <p className="section-subtitle mx-0 max-w-none">
                Showing {filteredProducts.length} products
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen((current) => !current)}
                className="rounded-full border border-borderwarm bg-white px-5 py-3 text-sm font-semibold text-primary lg:hidden"
              >
                {mobileFiltersOpen ? 'Hide Filters' : 'Show Filters'}
              </button>
              <select
                value={sortBy}
                onChange={(event) => {
                  setVisibleCount(PRODUCTS_PER_PAGE);
                  setSortBy(event.target.value);
                }}
                className="rounded-full border border-borderwarm bg-white px-5 py-3 text-sm text-primary outline-none"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest</option>
                <option value="best-selling">Best Selling</option>
              </select>
            </div>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[300px_1fr]">
            <div className={`${mobileFiltersOpen ? 'block' : 'hidden'} lg:block`}>{sidebar}</div>

            <div>
              <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
                {loading
                  ? Array.from({ length: 6 }).map((_, index) => <ProductSkeleton key={index} />)
                  : visibleProducts.map((product, index) => (
                      <ProductCard key={product.id} product={product} priority={index < 4} />
                    ))}
              </div>

              {!loading && !visibleProducts.length ? (
                <div className="mt-6 rounded-[1.7rem] border border-dashed border-borderwarm bg-white px-6 py-14 text-center">
                  <p className="font-heading text-4xl text-primary">No products found</p>
                  <p className="mt-3 text-sm text-muted">Try adjusting your filters or browsing another collection.</p>
                </div>
              ) : null}

              {!loading && visibleCount < filteredProducts.length ? (
                <div className="mt-8 text-center">
                  <button
                    type="button"
                    className="action-button"
                    onClick={() => setVisibleCount((current) => current + PRODUCTS_PER_PAGE)}
                  >
                    Load More
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
