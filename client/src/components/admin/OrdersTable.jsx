import { useMemo, useState } from 'react';
import { Download, Eye, X } from 'lucide-react';
import OrderReceipt from '../receipt/OrderReceipt';
import { formatPrice } from '../../utils/formatPrice';

const statusOptions = ['Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];

function PaymentBadge({ status }) {
  const paid = status === 'Paid';

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${
        paid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
      }`}
    >
      {status || 'Pending'}
    </span>
  );
}

function escapeCsv(value) {
  const text = value == null ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function exportOrdersCsv(orders) {
  const headers = [
    'Order ID',
    'Customer Name',
    'Phone',
    'Address',
    'Product Names',
    'Quantity',
    'Total Amount',
    'Payment Status',
    'Delivery Status',
    'Order Date',
  ];
  const rows = orders.map((order) => [
    order.orderNumber || order.id,
    order.customerName,
    order.phone,
    [
      order.address?.line1,
      order.address?.line2,
      order.address?.city,
      order.address?.state,
      order.address?.pincode,
    ].filter(Boolean).join(', '),
    order.items?.map((item) => item.name).join(' | '),
    order.items?.reduce((sum, item) => sum + Number(item.qty || 0), 0),
    order.total,
    order.paymentStatus || 'Pending',
    order.deliveryStatus || order.status,
    order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN') : '',
  ]);
  const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\r\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `khyathi-orders-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function imageUrl(image) {
  if (!image) {
    return '';
  }

  if (typeof image === 'string') {
    return image;
  }

  return image.displayUrl || image.url || image.thumbnail || image.secure_url || '';
}

function downloadImage(url, orderNumber) {
  const link = document.createElement('a');
  link.href = url;
  link.download = `${orderNumber || 'order'}-payment-proof.jpg`;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export default function OrdersTable({ orders, loading = false, savingOrderId = '', onSaveStatus }) {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [receiptOrder, setReceiptOrder] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (statusFilter !== 'All' && order.status !== statusFilter) {
        return false;
      }

      const haystack = `${order.orderNumber} ${order.customerName}`.toLowerCase();
      if (search && !haystack.includes(search.toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [orders, search, statusFilter]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <input
          className="input-shell"
          placeholder="Search order number or customer"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          {['All', ...statusOptions].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`rounded-full px-4 py-3 text-sm font-semibold ${
                statusFilter === status ? 'bg-primary text-white' : 'bg-white text-primary'
              } border border-borderwarm`}
            >
              {status}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="action-button ml-auto gap-2"
          onClick={() => exportOrdersCsv(filteredOrders)}
          disabled={!filteredOrders.length}
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      <div className="overflow-hidden rounded-[1.4rem] border border-borderwarm bg-white">
        <div className="overflow-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-cream text-primary">
              <tr>
                <th className="px-4 py-4 font-semibold">Order ID</th>
                <th className="px-4 py-4 font-semibold">Customer</th>
                <th className="px-4 py-4 font-semibold">Date</th>
                <th className="px-4 py-4 font-semibold">Total</th>
                <th className="px-4 py-4 font-semibold">Payment</th>
                <th className="px-4 py-4 font-semibold">Status</th>
                <th className="px-4 py-4 font-semibold">Proof</th>
                <th className="px-4 py-4 font-semibold">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-8 text-center text-muted" colSpan={8}>
                    Loading orders...
                  </td>
                </tr>
              ) : filteredOrders.length ? filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="cursor-pointer border-t border-borderwarm transition hover:bg-[#fcf8f2]"
                  onClick={() => setSelectedOrder(order)}
                >
                  <td className="px-4 py-4 font-semibold text-primary">{order.orderNumber}</td>
                  <td className="px-4 py-4">{order.customerName}</td>
                  <td className="px-4 py-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-4">{formatPrice(order.total)}</td>
                  <td className="px-4 py-4">
                    {imageUrl(order.paymentScreenshot || order.paymentScreenshotUrl || order.paymentProofUrl) ? (
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-full border border-borderwarm px-3 py-2 text-xs font-semibold text-primary"
                        onClick={(event) => {
                          event.stopPropagation();
                          setProofPreview(order);
                        }}
                      >
                        <Eye size={14} />
                        View Screenshot
                      </button>
                    ) : (
                      <span className="text-xs text-muted">None</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <PaymentBadge status={order.paymentStatus} />
                  </td>
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <p className="font-semibold text-primary">{order.status}</p>
                      <p className="text-xs text-muted">{order.deliveryStatus || order.status}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <button
                      type="button"
                      className="action-button-outline px-3 py-2 text-xs"
                      onClick={(event) => {
                        event.stopPropagation();
                        setReceiptOrder(order);
                      }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td className="px-4 py-8 text-center text-muted" colSpan={8}>
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder ? (
        <div className="rounded-[1.6rem] border border-borderwarm bg-white p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="font-heading text-3xl text-primary">{selectedOrder.orderNumber}</p>
              <p className="mt-1 text-sm text-muted">{selectedOrder.customerName}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <PaymentBadge status={selectedOrder.paymentStatus} />
                <span className="rounded-full bg-cream px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                  Delivery: {selectedOrder.deliveryStatus || selectedOrder.status}
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <select
                className="rounded-full border border-borderwarm bg-white px-4 py-3 text-sm outline-none"
                value={selectedOrder.status}
                onChange={(event) =>
                  setSelectedOrder((current) => ({ ...current, status: event.target.value }))
                }
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="action-button-outline"
                onClick={() => setReceiptOrder(selectedOrder)}
              >
                View Receipt
              </button>
              <button
                type="button"
                className="action-button"
                onClick={() => onSaveStatus(selectedOrder.id, selectedOrder.status)}
                disabled={savingOrderId === selectedOrder.id}
              >
                {savingOrderId === selectedOrder.id ? 'Saving...' : 'Save Status'}
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Items</p>
              <div className="mt-3 space-y-3">
                {selectedOrder.items?.map((item) => (
                  <div key={`${item.productId}-${item.color}`} className="rounded-[1.2rem] bg-cream p-4">
                    <p className="font-semibold text-primary">{item.name}</p>
                    <p className="mt-1 text-sm text-muted">
                      {item.color} â€¢ Qty {item.qty}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Shipping Address</p>
              <div className="mt-3 rounded-[1.2rem] bg-cream p-4 text-sm leading-7 text-body">
                <p>{selectedOrder.customerName}</p>
                <p>{selectedOrder.phone}</p>
                <p>
                  {selectedOrder.address?.line1}, {selectedOrder.address?.line2}
                </p>
                <p>
                  {selectedOrder.address?.city}, {selectedOrder.address?.state} - {selectedOrder.address?.pincode}
                </p>
              </div>
            </div>
            <div className="lg:col-span-2">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Payment Screenshot</p>
              {imageUrl(selectedOrder.paymentScreenshot || selectedOrder.paymentScreenshotUrl || selectedOrder.paymentProofUrl) ? (
                <div className="mt-3 grid gap-4 rounded-[1.2rem] bg-cream p-4 sm:grid-cols-[160px_1fr]">
                  <img
                    src={imageUrl(selectedOrder.paymentScreenshot || selectedOrder.paymentScreenshotUrl || selectedOrder.paymentProofUrl)}
                    alt={`Payment proof for ${selectedOrder.orderNumber}`}
                    className="h-44 w-full rounded-xl object-contain sm:h-40"
                    loading="lazy"
                  />
                  <div className="flex flex-col justify-center gap-3">
                    <p className="text-sm text-body">
                      Uploaded payment proof for admin verification.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" className="action-button-outline px-4 py-2 text-xs" onClick={() => setProofPreview(selectedOrder)}>
                        Preview
                      </button>
                      <button
                        type="button"
                        className="action-button px-4 py-2 text-xs"
                        onClick={() => downloadImage(imageUrl(selectedOrder.paymentScreenshot || selectedOrder.paymentScreenshotUrl || selectedOrder.paymentProofUrl), selectedOrder.orderNumber)}
                      >
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-3 rounded-[1.2rem] bg-cream p-4 text-sm text-muted">
                  No payment screenshot uploaded for this order.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {proofPreview ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-[1.4rem] bg-white p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="font-semibold text-primary">{proofPreview.orderNumber} payment proof</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-borderwarm text-primary"
                  onClick={() => downloadImage(imageUrl(proofPreview.paymentScreenshot || proofPreview.paymentScreenshotUrl || proofPreview.paymentProofUrl), proofPreview.orderNumber)}
                  aria-label="Download payment proof"
                >
                  <Download size={16} />
                </button>
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-borderwarm text-primary"
                  onClick={() => setProofPreview(null)}
                  aria-label="Close payment proof"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            <img
              src={imageUrl(proofPreview.paymentScreenshot || proofPreview.paymentScreenshotUrl || proofPreview.paymentProofUrl)}
              alt={`Payment proof for ${proofPreview.orderNumber}`}
              className="max-h-[78vh] w-full rounded-[1rem] object-contain"
            />
          </div>
        </div>
      ) : null}

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
    </div>
  );
}
