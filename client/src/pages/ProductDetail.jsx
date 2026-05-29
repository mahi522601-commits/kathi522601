import { Helmet } from 'react-helmet-async';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Breadcrumb from '../components/ui/Breadcrumb';
import ColorSwatch from '../components/ui/ColorSwatch';
import ImageGallery from '../components/ui/ImageGallery';
import ProductCard from '../components/ui/ProductCard';
import QuantitySelector from '../components/ui/QuantitySelector';
import  LoadingSpinner  from '../components/ui/LoadingSpinner';
import { useCart } from '../hooks/useCart';
import { useProducts } from '../hooks/useProducts';
import { useWishlist } from '../hooks/useWishlist';
import { formatPrice } from '../utils/formatPrice';
import { HeartIcon } from '../components/ui/Icons';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, loading } = useProducts();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const product = useMemo(
    () => products.find((entry) => entry.id === id || entry.slug === id) || null,
    [id, products],
  );
  const relatedProducts = useMemo(
    () =>
      products
        .filter((entry) => entry.category === product?.category && entry.id !== product?.id)
        .slice(0, 4),
    [product?.category, product?.id, products],
  );
  const stockQuantity = Math.max(0, Math.floor(Number(product?.stockQuantity || 0)));
  const isAvailable = Boolean(product?.inStock) && !product?.soldOut && stockQuantity > 0;

  useEffect(() => {
    if (product) {
      setSelectedColor(product.colors?.[0] || null);
      setQuantity(1);
    }
  }, [product]);

  if (loading) {
    return <LoadingSpinner label="Loading product" />;
  }

  if (!product) {
    return (
      <section className="section-block">
        <div className="page-shell rounded-[1.8rem] border border-dashed border-borderwarm bg-white px-6 py-16 text-center">
          <p className="font-heading text-4xl text-primary">Product not found</p>
          <Link to="/collections" className="action-button mt-6 inline-flex">
            Browse Collections
          </Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <Helmet>
        <title>{product.name} | Khyathi Collections</title>
      </Helmet>
      <section className="section-block">
        <div className="page-shell">
          <Breadcrumb
            items={[
              { label: 'Home', path: '/' },
              { label: product.category, path: `/collections/${product.category.toLowerCase().replace(/\s+/g, '-')}` },
              { label: product.name },
            ]}
          />

          <div className="mt-8 grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <ImageGallery images={product.imageObjects || product.images} productName={product.name} />
            </div>

            <div>
              <h1 className="font-heading text-5xl text-primary">{product.name}</h1>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <p className="text-2xl font-semibold text-primary">{formatPrice(product.salePrice)}</p>
                <p className="text-lg text-muted line-through">{formatPrice(product.originalPrice)}</p>
                <span className="rounded-full bg-maroon px-3 py-1 text-xs font-semibold text-white">
                  {product.discountPercent}% OFF
                </span>
              </div>

              <div className="mt-8">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
                  Color: {selectedColor?.name || ''}
                </p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {product.colors?.map((color) => (
                    <ColorSwatch
                      key={color.name}
                      color={color}
                      selected={selectedColor?.name === color.name}
                      onClick={() => setSelectedColor(color)}
                      showLabel
                    />
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Quantity</p>
                <div className="mt-3">
                  <QuantitySelector value={quantity} onChange={setQuantity} max={stockQuantity} />
                </div>
                {isAvailable ? (
                  <p className="mt-2 text-xs font-semibold text-emerald-700">{stockQuantity} available</p>
                ) : null}
              </div>

              <div className="mt-8 space-y-3">
                <button
                  type="button"
                  className={`action-button w-full ${
                    !isAvailable ? 'cursor-not-allowed bg-[#a8937b] hover:bg-[#a8937b]' : ''
                  }`}
                  disabled={!isAvailable}
                  onClick={() => addToCart(product, selectedColor, quantity)}
                >
                  {isAvailable ? 'Add to Cart' : 'Sold Out'}
                </button>
                <button
                  type="button"
                  className={`action-button-outline w-full ${!isAvailable ? 'cursor-not-allowed opacity-60' : ''}`}
                  disabled={!isAvailable}
                  onClick={() => {
                    if (addToCart(product, selectedColor, quantity)) {
                      navigate('/checkout');
                    }
                  }}
                >
                  Buy Now
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
                  onClick={() => toggleWishlist(product.id)}
                >
                  <HeartIcon filled={isInWishlist(product.id)} className="h-4 w-4" />
                  Add to Wishlist
                </button>
              </div>

              <div className="mt-8 border-t border-borderwarm pt-7 text-sm leading-7 text-body">
                <p>{product.description}</p>
                <p className="mt-4">
                  <span className="font-semibold text-primary">Fabric Details:</span> {product.fabricDetails}
                </p>
                <p className="mt-3">
                  <span className="font-semibold text-primary">Care Instructions:</span> {product.careInstructions}
                </p>
                <p className="mt-3">
                  <span className="font-semibold text-primary">Delivery Info:</span> Free shipping on all orders
                </p>
              </div>
            </div>
          </div>

          <div className="mt-16">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-4xl text-primary">You May Also Like</h2>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
              {relatedProducts.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
