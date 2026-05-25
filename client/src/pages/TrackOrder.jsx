import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MessageCircle, Phone } from 'lucide-react';
import DeliveryTracker from '../components/orders/DeliveryTracker';
import { getOrderById } from '../firebase/ordersService';
import { siteConfig } from '../config/site';
import { formatPrice } from '../utils/formatPrice';

export default function TrackOrder() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getOrderById(orderId)
      .then((response) => {
        if (mounted) {
          setOrder(response);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [orderId]);

  return (
    <>
      <Helmet>
        <title>Track Order | Khyathi Collections</title>
      </Helmet>
      <section className="min-h-screen bg-[#f8f0e2] py-10">
        <div className="page-shell max-w-5xl">
          {loading ? (
            <div className="card-surface p-8 text-center text-muted">Loading tracking details...</div>
          ) : order ? (
            <div className="space-y-6">
              <div className="rounded-[28px] border border-[#ead7a2] bg-[#1c120a] p-6 text-[#fffaf0] shadow-[0_24px_80px_rgba(42,29,16,0.16)]">
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#f6d878]">
                  Order Tracking
                </p>
                <h1 className="mt-3 font-heading text-5xl">{order.orderNumber}</h1>
                <p className="mt-2 text-sm text-[#e8d8b4]">
                  Payment: {order.paymentStatus || 'Pending'} | Delivery: {order.deliveryStatus || order.status}
                </p>
              </div>

              <DeliveryTracker order={order} />

              <div className="grid gap-5 md:grid-cols-2">
                <div className="rounded-[22px] border border-[#ead7a2] bg-white p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Order Summary</p>
                  <div className="mt-4 space-y-3">
                    {order.items?.map((item) => (
                      <div key={`${item.productId}-${item.color}`} className="flex gap-3 rounded-[16px] bg-cream p-3">
                        <img src={item.image} alt={item.name} className="h-14 w-12 rounded-xl object-cover" />
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-1 text-sm font-semibold text-primary">{item.name}</p>
                          <p className="text-xs text-muted">{item.color} | Qty {item.qty}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 font-heading text-3xl text-primary">{formatPrice(order.total)}</p>
                </div>

                <div className="rounded-[22px] border border-[#ead7a2] bg-white p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Payment Details</p>
                  <div className="mt-4 space-y-2 text-sm text-body">
                    <p>Status: <span className="font-semibold text-primary">{order.paymentStatus || 'Pending'}</span></p>
                    <p>Method: <span className="font-semibold text-primary">{order.paymentMethod || 'UPI'}</span></p>
                    <p className="break-all">Transaction: <span className="font-semibold text-primary">{order.transactionId || order.paymentId || 'Not available'}</span></p>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <a className="action-button-outline gap-2" href={siteConfig.whatsappHref} target="_blank" rel="noreferrer">
                      <MessageCircle size={16} />
                      WhatsApp Support
                    </a>
                    <a className="action-button gap-2" href={siteConfig.phoneHref}>
                      <Phone size={16} />
                      Call {siteConfig.phoneDisplay}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card-surface p-8 text-center">
              <h1 className="font-heading text-4xl text-primary">Order not found</h1>
              <p className="mt-3 text-sm text-muted">Please check your account orders for the latest receipt.</p>
              <Link to="/account" className="action-button mt-6">Go to Account</Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
