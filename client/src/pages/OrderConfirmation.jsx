import { Helmet } from 'react-helmet-async';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import OrderReceipt from '../components/receipt/OrderReceipt';
import { getOrderById } from '../firebase/ordersService';
import paymentsApi from '../api/paymentsApi';

export default function OrderConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [verifying, setVerifying] = useState(false);

  const initialOrder = useMemo(() => {
    try {
      return location.state?.order || JSON.parse(localStorage.getItem('khyathi-last-order') || 'null');
    } catch {
      return location.state?.order || null;
    }
  }, [location.state?.order]);

  const [order, setOrder] = useState(initialOrder);

  // Handle PayU redirect response
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const payuStatus = params.get('status');

    // Not a PayU redirect — skip
    if (!payuStatus) {
      return;
    }

    if (payuStatus === 'failure') {
      toast.error('Payment failed or was cancelled. Please try again.');
      localStorage.removeItem('khyathi-pending-order');
      navigate('/checkout', { replace: true });
      return;
    }

    if (payuStatus === 'success') {
      const pendingOrder = (() => {
        try {
          return JSON.parse(localStorage.getItem('khyathi-pending-order') || 'null');
        } catch {
          return null;
        }
      })();

      if (!pendingOrder) {
        // Pending order missing — payment may already have been confirmed
        return;
      }

      // Collect all PayU response params from the URL
      const payuParams = {};
      params.forEach((value, key) => {
        payuParams[key] = value;
      });

      setVerifying(true);

      paymentsApi
        .verifyPayuPayment({ ...payuParams, orderPayload: pendingOrder })
        .then((response) => {
          if (response.success) {
            localStorage.removeItem('khyathi-pending-order');
            localStorage.setItem('khyathi-last-order', JSON.stringify(response.order));
            setOrder(response.order);
            toast.success('Payment confirmed! Your order is placed.');
          } else {
            throw new Error('Verification failed');
          }
        })
        .catch((error) => {
          toast.error(error.message || 'Payment verification failed. Contact support.');
          navigate('/checkout', { replace: true });
        })
        .finally(() => {
          setVerifying(false);
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch order by ID if navigated directly to /receipt/:orderId
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

  // Show loading screen while verifying PayU payment
  if (verifying) {
    return (
      <>
        <Helmet>
          <title>Confirming Payment | Khyathi Collections</title>
        </Helmet>
        <section className="min-h-screen bg-[#f8f0e2] py-10">
          <div className="page-shell max-w-5xl">
            <div className="card-surface mx-auto max-w-2xl p-10 text-center">
              <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-4 border-gold border-t-transparent" />
              <h1 className="font-heading text-4xl text-primary">Confirming your payment...</h1>
              <p className="mt-3 text-sm text-muted">
                Please wait while we verify your payment with PayU. Do not close this tab.
              </p>
            </div>
          </div>
        </section>
      </>
    );
  }

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