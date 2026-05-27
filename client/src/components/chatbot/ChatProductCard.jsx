import { Link } from 'react-router-dom';
import { formatPrice } from '../../utils/formatPrice';

export default function ChatProductCard({ product }) {
  const image = product?.thumbnail || product?.images?.[0] || product?.imageObjects?.[0]?.thumbnail || product?.imageObjects?.[0]?.displayUrl;

  return (
    <Link
      to={`/product/${product.id}`}
      className="mt-2 flex items-center gap-3 rounded-2xl border border-[rgba(201,168,76,0.3)] bg-white/5 p-3"
    >
      <img src={image} alt={product.name} className="h-16 w-14 rounded-xl object-cover" loading="lazy" />
      <div>
        <p className="line-clamp-2 text-sm font-semibold text-white">{product.name}</p>
        <p className="mt-1 text-xs text-[rgba(201,168,76,0.9)]">{formatPrice(product.salePrice)}</p>
      </div>
    </Link>
  );
}
