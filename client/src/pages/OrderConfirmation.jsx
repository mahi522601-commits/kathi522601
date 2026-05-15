import { Helmet } from 'react-helmet-async';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import OrderReceipt from '../components/receipt/OrderReceipt';
import { getOrderById } from '../firebase/ordersService';

export default function OrderConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId } = useParams();
  const initialOrder = useMemo(() => {
    try {
      return location.state?.order || JSON.parse(localStorage.getItem('khyathi-last-order') || 'null');
    } catch {
      return location.state?.order || null;
    }
  }, [location.state?.order]);
  const [order, setOrder] = useState(initialOrder);

  useEffect(() => {
    if (!orderId || initialOrder?.id === orderId) {
      return;
    }

    getOrderById(orderId).then((savedOrder) => {
      if (savedOrder) {
        setOrder(savedOrder);
      }
    });
  }, [initialOrder?.id, orderId]);

  return (
    <>
      <Helmet>
        <title>Receipt | Khyathi Collections</title>
      </Helmet>
      <section className="min-h-screen bg-[#f8f0e2] py-10">
        <div className="page-shell max-w-5xl">
          {order ? (
            <OrderReceipt
              order={order}
              successHero
              onContinueShopping={() => navigate('/collections')}
              onTrackOrder={() => navigate(`/track-order/${order.id}`)}
            />
          ) : (
            <div className="card-surface mx-auto max-w-2xl p-8 text-center">
              <h1 className="font-heading text-4xl text-primary">Receipt not found</h1>
              <p className="mt-3 text-sm text-muted">
                Please open My Orders from your account to view saved receipts.
              </p>
              <button type="button" className="action-button mt-6" onClick={() => navigate('/account')}>
                Go to Account
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
