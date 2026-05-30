import { Helmet } from 'react-helmet-async';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import AdminSidebar from '../../components/admin/AdminSidebar';
import OrdersTable from '../../components/admin/OrdersTable';
import { deleteOrder, getOrders, updateOrderStatus } from '../../firebase/ordersService';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingOrderId, setSavingOrderId] = useState('');
  const [deletingOrderId, setDeletingOrderId] = useState('');

  const loadOrders = useCallback(async ({ quiet = false } = {}) => {
    if (!quiet) {
      setLoading(true);
    }

    try {
      const nextOrders = await getOrders();
      setOrders(nextOrders);
    } catch {
      if (!quiet) {
        toast.error('Unable to load orders');
      }
    } finally {
      if (!quiet) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadOrders();
    const interval = window.setInterval(() => loadOrders({ quiet: true }), 15000);
    return () => window.clearInterval(interval);
  }, [loadOrders]);

  async function saveStatus(orderId, status) {
    setSavingOrderId(orderId);
    try {
      const savedOrder = await updateOrderStatus(orderId, status);
      setOrders((current) =>
        current.map((order) =>
          order.id === orderId || order._id === orderId ? { ...order, ...savedOrder } : order,
        ).sort((left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0)),
      );
      toast.success('Order status updated');
      return savedOrder;
    } catch (error) {
      toast.error(error.message || 'Unable to update order');
      return null;
    } finally {
      setSavingOrderId('');
    }
  }

  async function removeOrder(orderId) {
    setDeletingOrderId(orderId);
    try {
      await deleteOrder(orderId);
      setOrders((current) => current.filter((order) => order.id !== orderId && order._id !== orderId));
      toast.success('Order deleted');
      return true;
    } catch (error) {
      toast.error(error.message || 'Unable to delete order');
      return false;
    } finally {
      setDeletingOrderId('');
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
            <OrdersTable
              orders={orders}
              loading={loading}
              savingOrderId={savingOrderId}
              deletingOrderId={deletingOrderId}
              onSaveStatus={saveStatus}
              onDeleteOrder={removeOrder}
            />
          </div>
        </div>
      </section>
    </>
  );
}
