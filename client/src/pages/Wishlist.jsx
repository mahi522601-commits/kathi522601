import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ui/ProductCard';
import { useProducts } from '../hooks/useProducts';
import { useWishlist } from '../hooks/useWishlist';

export default function Wishlist() {
  const { wishlist } = useWishlist();
  const { products } = useProducts();
  const wishlistProducts = products.filter((product) => wishlist.includes(product.id));

  return (
    <>
      <Helmet>
        <title>Wishlist | Khyathi Collections</title>
      </Helmet>
      <section className="section-block">
        <div className="page-shell">
          <h1 className="section-title">Your Wishlist</h1>

          {wishlistProducts.length ? (
            <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
              {wishlistProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="mt-10 rounded-[1.8rem] border border-dashed border-borderwarm bg-white px-6 py-16 text-center">
              <p className="font-heading text-4xl text-primary">Nothing saved yet</p>
              <p className="mt-3 text-sm text-muted">Heart the pieces you love and they&apos;ll stay here.</p>
              <Link to="/collections" className="action-button mt-6 inline-flex">
                Explore Products
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
