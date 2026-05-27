import { Helmet } from 'react-helmet-async';
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Download, RotateCcw, Route, X } from 'lucide-react';
import OrderReceipt from '../components/receipt/OrderReceipt';
import { getOrdersByUser } from '../firebase/ordersService';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { useProducts } from '../hooks/useProducts';
import { useWishlist } from '../hooks/useWishlist';
import { formatPrice } from '../utils/formatPrice';
import { formatDeliveryDate, getExpectedDeliveryDate } from '../utils/deliveryTracking';

export default function Account() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userProfile, updateProfileFields, logout } = useAuth();
  const { addToCart } = useCart();
  const { wishlist } = useWishlist();
  const { products } = useProducts();
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'profile');
  const [orders, setOrders] = useState([]);
  const [receiptOrder, setReceiptOrder] = useState(null);
  const [profileForm, setProfileForm] = useState({
    name: userProfile?.name || '',
    phone: userProfile?.phone || '',
  });

  useEffect(() => {
    if (userProfile?.uid) {
      getOrdersByUser(userProfile.uid).then(setOrders).catch(() => {
        //
      });
      setProfileForm({
        name: userProfile.name || '',
        phone: userProfile.phone || '',
      });
    }
  }, [userProfile]);

  const wishlistProducts = useMemo(
    () => products.filter((product) => wishlist.includes(product.id)).slice(0, 4),
    [products, wishlist],
  );

  async function saveProfile(event) {
    event.preventDefault();
    try {
      await updateProfileFields(profileForm);
    } catch (error) {
      toast.error(error.message || 'Unable to save profile');
    }
  }

  function reorder(order) {
    order.items?.forEach((item) => {
      const product = products.find((entry) => entry.id === item.productId || entry.slug === item.slug);
      if (product) {
        const color = product.colors?.find((entry) => entry.name === item.color) || { name: item.color };
        addToCart(product, color, item.qty || 1);
      }
    });
    toast.success('Order items added to cart');
    navigate('/cart');
  }

  return (
    <>
      <Helmet>
        <title>Account | Khyathi Collections</title>
      </Helmet>
      <section className="section-block">
        <div className="page-shell">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="section-title">My Account</h1>
              <p className="section-subtitle mx-0 max-w-none">
                Welcome back, {userProfile?.name || 'Customer'}
              </p>
            </div>
            <button type="button" className="action-button-outline" onClick={logout}>
              Logout
            </button>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[260px_1fr]">
            <div className="rounded-[1.6rem] border border-borderwarm bg-white p-4">
              {['profile', 'orders', 'wishlist'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`mb-2 w-full rounded-full px-4 py-3 text-left text-sm font-semibold capitalize ${
                    activeTab === tab ? 'bg-primary text-white' : 'bg-cream text-primary'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="card-surface p-6 md:p-8">
              {activeTab === 'profile' ? (
                <form className="space-y-4" onSubmit={saveProfile}>
                  <h2 className="font-heading text-3xl text-primary">Profile Details</h2>
                  <input className="input-shell" value={profileForm.name} onChange={(event) => setProfileForm({ ...profileForm, name: event.target.value })} />
                  <input className="input-shell" value={profileForm.phone} onChange={(event) => setProfileForm({ ...profileForm, phone: event.target.value })} placeholder="Phone Number" />
                  <input className="input-shell bg-[#f8f2eb]" value={userProfile?.email || ''} disabled />
                  <button type="submit" className="action-button">
                    Save Changes
                  </button>
                </form>
              ) : null}

              {activeTab === 'orders' ? (
                <div>
                  <h2 className="font-heading text-3xl text-primary">My Orders</h2>
                  {orders.length ? (
                    <div className="mt-6 space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="rounded-[1.4rem] bg-cream p-5">
                          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div>
                              <p className="font-semibold text-primary">{order.orderNumber}</p>
                              <div className="mt-2 flex flex-wrap gap-2">
                                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                                  {order.status}
                                </span>
                                <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${
                                  order.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                }`}>
                                  {order.paymentStatus || 'Pending'}
                                </span>
                              </div>
                              <p className="mt-2 text-sm text-muted">
                                ETA: {formatDeliveryDate(getExpectedDeliveryDate(order))}
                              </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                              <p className="font-semibold text-primary">{formatPrice(order.total)}</p>
                              <button
                                type="button"
                                className="action-button-outline gap-2 px-4 py-2 text-xs"
                                onClick={() => reorder(order)}
                              >
                                <RotateCcw size={14} />
                                Reorder
                              </button>
                              <Link
                                className="action-button-outline gap-2 px-4 py-2 text-xs"
                                to={`/track-order/${order.id}`}
                              >
                                <Route size={14} />
                                Track
                              </Link>
                              <Link
                                className="action-button-outline gap-2 px-4 py-2 text-xs"
                                to={`/receipt/${order.id}`}
                              >
                                <Download size={14} />
                                Invoice
                              </Link>
                              <button
                                type="button"
                                className="action-button-outline px-4 py-2 text-xs"
                                onClick={() => setReceiptOrder(order)}
                              >
                                View Receipt
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-6 text-sm text-muted">No orders yet.</p>
                  )}
                </div>
              ) : null}

              {activeTab === 'wishlist' ? (
                <div>
                  <h2 className="font-heading text-3xl text-primary">Saved Pieces</h2>
                  {wishlistProducts.length ? (
                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      {wishlistProducts.map((product) => (
                        <Link key={product.id} to={`/product/${product.id}`} className="rounded-[1.4rem] bg-cream p-4">
                          <img src={product.images[0]} alt={product.name} className="h-48 w-full rounded-[1.2rem] object-cover" loading="lazy" />
                          <p className="mt-3 font-semibold text-primary">{product.name}</p>
                          <p className="mt-1 text-sm text-body">{formatPrice(product.salePrice)}</p>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-6 text-sm text-muted">Your wishlist is still empty.</p>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {receiptOrder ? (
        <div className="fixed inset-0 z-[80] overflow-y-auto bg-black/55 px-3 py-6 backdrop-blur-sm">
          <div className="mx-auto max-w-5xl">
            <div className="mb-3 flex justify-end">
              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-primary shadow-lg"
                onClick={() => setReceiptOrder(null)}
                aria-label="Close receipt"
              >
                <X size={20} />
              </button>
            </div>
            <OrderReceipt order={receiptOrder} />
          </div>
        </div>
      ) : null}
    </>
  );
}
