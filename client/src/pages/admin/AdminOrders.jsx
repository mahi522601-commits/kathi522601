import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import AdminSidebar from '../../components/admin/AdminSidebar';
import OrdersTable from '../../components/admin/OrdersTable';
import { getOrders, updateOrderStatus } from '../../firebase/ordersService';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingOrderId, setSavingOrderId] = useState('');

  useEffect(() => {
    getOrders()
      .then(setOrders)
      .catch(() => toast.error('Unable to load orders'))
      .finally(() => setLoading(false));
  }, []);

  async function saveStatus(orderId, status) {
    setSavingOrderId(orderId);
    try {
      const savedOrder = await updateOrderStatus(orderId, status);
      setOrders((current) =>
        current.map((order) =>
          order.id === orderId ? { ...order, ...savedOrder } : order,
        ),
      );
      toast.success('Order status updated');
    } catch (error) {
      toast.error(error.message || 'Unable to update order');
    } finally {
      setSavingOrderId('');
    }
  }

  return (
    <>
      <Helmet>
        <title>Admin Orders | Khyathi Collections</title>
      </Helmet>
      <section className="min-h-screen bg-[#120b07] py-8">
        <div className="page-shell grid gap-8 lg:grid-cols-[280px_1fr]">
          <AdminSidebar />
          <div className="space-y-8">
            <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-[#24140a] to-[#140b06] p-6 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#f6d878]">Fulfillment desk</p>
              <h1 className="mt-3 font-heading text-5xl text-white">Orders</h1>
              <p className="mt-2 text-sm text-[#d8c6aa]">Monitor, search, receipt-check, and update delivery statuses.</p>
            </div>
            <OrdersTable orders={orders} loading={loading} savingOrderId={savingOrderId} onSaveStatus={saveStatus} />
          </div>
        </div>
      </section>
    </>
  );
}
