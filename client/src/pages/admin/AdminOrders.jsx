import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import AdminSidebar from '../../components/admin/AdminSidebar';
import OrdersTable from '../../components/admin/OrdersTable';
import { deleteOrder, getOrders, updateOrder, updateOrderStatus } from '../../firebase/ordersService';

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

  async function saveOrderPatch(orderId, patch) {
    setSavingOrderId(orderId);
    try {
      const savedOrder = await updateOrder(orderId, patch);
      setOrders((current) => current.map((order) => (order.id === orderId ? { ...order, ...savedOrder } : order)));
      toast.success('Order updated');
    } catch (error) {
      toast.error(error.message || 'Unable to update order');
    } finally {
      setSavingOrderId('');
    }
  }

  async function removeOrder(orderId) {
    if (!window.confirm('Delete this order permanently?')) {
      return;
    }

    setSavingOrderId(orderId);
    try {
      await deleteOrder(orderId);
      setOrders((current) => current.filter((order) => order.id !== orderId));
      toast.success('Order deleted');
    } catch (error) {
      toast.error(error.message || 'Unable to delete order');
    } finally {
      setSavingOrderId('');
    }
  }

  return (
    <>
      <Helmet>
        <title>Admin Orders | Khyathi Collections</title>
      </Helmet>
      <section className="min-h-screen bg-[#0A1F44] py-8">
        <div className="page-shell grid gap-8 lg:grid-cols-[280px_1fr]">
          <AdminSidebar />
          <div className="space-y-8">
            <div className="rounded-[18px] border border-white/10 bg-gradient-to-br from-[#102A5A] to-[#0A1F44] p-6 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#C8A96B]">Fulfillment desk</p>
              <h1 className="mt-3 font-heading text-5xl text-white">Orders</h1>
              <p className="mt-2 text-sm text-[#d8c6aa]">Monitor, search, receipt-check, and update delivery statuses.</p>
            </div>
            <OrdersTable orders={orders} loading={loading} savingOrderId={savingOrderId} onSaveStatus={saveStatus} onSaveOrder={saveOrderPatch} onDeleteOrder={removeOrder} />
          </div>
        </div>
      </section>
    </>
  );
}
