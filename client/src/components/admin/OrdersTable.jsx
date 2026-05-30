import { useEffect, useMemo, useState } from 'react';
import { Download, Eye, ReceiptText, Search, Trash2, X, ZoomIn, ZoomOut } from 'lucide-react';
import OrderReceipt from '../receipt/OrderReceipt';
import { formatPrice } from '../../utils/formatPrice';

const statusOptions = [
  'Pending',
  'Paid',
  'Confirmed',
  'Packed',
  'Shipped',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
];

const filterOptions = [
  'All',
  'Confirmed',
  'Packed',
  'Shipped',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
];

function getOrderId(order) {
  return order?._id || order?.id || order?.orderNumber || '';
}

function getProofUrl(order) {
  const image =
    order?.paymentScreenshot ||
    order?.paymentProof ||
    order?.paymentScreenshotUrl ||
    order?.paymentProofUrl ||
    order?.paymentReceiptUrl ||
    order?.screenshotUrl;

  if (!image) {
    return '';
  }

  if (typeof image === 'string') {
    return image;
  }

  return image.displayUrl || image.display_url || image.url || image.thumbnail || image.secure_url || image.mediumUrl || '';
}

function getItemImage(item) {
  const image = item?.image || item?.thumbnail || item?.productImage || item?.images?.[0];

  if (!image) {
    return '';
  }

  if (typeof image === 'string') {
    return image;
  }

  return image.displayUrl || image.url || image.thumbnail || image.secure_url || '';
}

function getAddress(order) {
  return [
    order.address?.line1,
    order.address?.line2,
    order.address?.city,
    order.address?.state,
    order.address?.pincode,
  ].filter(Boolean).join(', ');
}

function formatDateTime(value) {
  if (!value) {
    return 'Not available';
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function PaymentBadge({ status }) {
  const normalized = status || 'Pending';
  const paid = normalized === 'Paid';

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${
        paid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
      }`}
    >
      {normalized}
    </span>
  );
}

function StatusBadge({ status }) {
  const normalized = status || 'Pending';
  const cancelled = normalized === 'Cancelled';
  const delivered = normalized === 'Delivered';

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${
        cancelled
          ? 'bg-rose-100 text-rose-700'
          : delivered
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-cream text-primary'
      }`}
    >
      {normalized}
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
    'Database ID',
    'Customer Name',
    'Email',
    'Phone',
    'Shipping Address',
    'Products',
    'Total Quantity',
    'Total Amount',
    'Payment Method',
    'Payment Status',
    'Order Status',
    'Order Date Time',
    'Payment Screenshot',
  ];
  const rows = orders.map((order) => [
    order.orderNumber || getOrderId(order),
    getOrderId(order),
    order.customerName,
    order.email,
    order.phone,
    getAddress(order),
    order.items?.map((item) => `${item.name || item.productId} x ${item.qty || item.quantity || 0}`).join(' | '),
    order.items?.reduce((sum, item) => sum + Number(item.qty || item.quantity || 0), 0),
    order.total ?? order.pricing?.total,
    order.paymentMethod || order.paymentGateway || 'Not available',
    order.paymentStatus || 'Pending',
    order.status || order.deliveryStatus || 'Pending',
    order.createdAt ? formatDateTime(order.createdAt) : '',
    getProofUrl(order),
  ]);
  const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\r\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `khyathi-all-orders-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function downloadImage(url, orderNumber) {
  if (!url) {
    return;
  }

  const link = document.createElement('a');
  link.href = url;
  link.download = `${orderNumber || 'order'}-payment-proof.jpg`;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export default function OrdersTable({
  orders,
  loading = false,
  savingOrderId = '',
  deletingOrderId = '',
  onSaveStatus,
  onDeleteOrder,
}) {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [receiptOrder, setReceiptOrder] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [proofZoom, setProofZoom] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    if (!selectedOrder) {
      return;
    }

    const freshOrder = orders.find((order) => getOrderId(order) === getOrderId(selectedOrder));
    if (freshOrder) {
      setSelectedOrder((current) => ({ ...freshOrder, status: current.status || freshOrder.status }));
    }
  }, [orders]);

  useEffect(() => {
    setProofZoom(1);
  }, [proofPreview]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const status = order.status || order.deliveryStatus || 'Pending';
      if (statusFilter !== 'All' && status !== statusFilter) {
        return false;
      }

      if (!query) {
        return true;
      }

      const haystack = [
        order.orderNumber,
        getOrderId(order),
        order.customerName,
        order.phone,
      ].filter(Boolean).join(' ').toLowerCase();

      return haystack.includes(query);
    });
  }, [orders, search, statusFilter]);

  async function saveSelectedStatus() {
    if (!selectedOrder) {
      return;
    }

    const savedOrder = await onSaveStatus(getOrderId(selectedOrder), selectedOrder.status);
    if (savedOrder) {
      setSelectedOrder(savedOrder);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget || !onDeleteOrder) {
      return;
    }

    const targetId = getOrderId(deleteTarget);
    const deleted = await onDeleteOrder(targetId);

    if (deleted) {
      if (selectedOrder && getOrderId(selectedOrder) === targetId) {
        setSelectedOrder(null);
      }
      if (receiptOrder && getOrderId(receiptOrder) === targetId) {
        setReceiptOrder(null);
      }
      if (proofPreview && getOrderId(proofPreview) === targetId) {
        setProofPreview(null);
      }
      setDeleteTarget(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-[1.4rem] border border-borderwarm bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={17} />
            <input
              className="input-shell pl-11"
              placeholder="Search order ID, customer, or phone"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <div className="flex gap-2 overflow-x-auto pb-1 xl:pb-0">
            {filterOptions.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`whitespace-nowrap rounded-full border border-borderwarm px-4 py-3 text-sm font-semibold ${
                  statusFilter === status ? 'bg-primary text-white' : 'bg-white text-primary'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="action-button gap-2"
            onClick={() => exportOrdersCsv(orders)}
            disabled={!orders.length}
          >
            <Download size={16} />
            Export All CSV
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-[1.4rem] border border-borderwarm bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1280px] text-left text-sm">
            <thead className="bg-cream text-primary">
              <tr>
                <th className="px-4 py-4 font-semibold">Order</th>
                <th className="px-4 py-4 font-semibold">Customer</th>
                <th className="px-4 py-4 font-semibold">Products</th>
                <th className="px-4 py-4 font-semibold">Total</th>
                <th className="px-4 py-4 font-semibold">Payment</th>
                <th className="px-4 py-4 font-semibold">Order Status</th>
                <th className="px-4 py-4 font-semibold">Payment Proof</th>
                <th className="px-4 py-4 font-semibold">Receipt</th>
                <th className="px-4 py-4 font-semibold">Delete</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-8 text-center text-muted" colSpan={9}>
                    Loading orders...
                  </td>
                </tr>
              ) : filteredOrders.length ? filteredOrders.map((order) => {
                const proofUrl = getProofUrl(order);
                const totalQuantity = order.items?.reduce((sum, item) => sum + Number(item.qty || item.quantity || 0), 0) || 0;

                return (
                  <tr
                    key={getOrderId(order)}
                    className="cursor-pointer border-t border-borderwarm align-top transition hover:bg-[#fcf8f2]"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="px-4 py-4">
                      <p className="font-semibold text-primary">{order.orderNumber || getOrderId(order)}</p>
                      <p className="mt-1 text-xs text-muted">{formatDateTime(order.createdAt)}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-body">{order.customerName || 'Customer'}</p>
                      <p className="mt-1 text-xs text-muted">{order.email || 'No email'}</p>
                      <p className="mt-1 text-xs text-muted">{order.phone || 'No phone'}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-primary">{order.items?.length || 0} item types</p>
                      <p className="mt-1 text-xs text-muted">Qty {totalQuantity}</p>
                    </td>
                    <td className="px-4 py-4 font-semibold text-primary">{formatPrice(order.total ?? order.pricing?.total)}</td>
                    <td className="px-4 py-4">
                      <PaymentBadge status={order.paymentStatus} />
                      <p className="mt-2 text-xs text-muted">{order.paymentMethod || order.paymentGateway || 'Manual'}</p>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={order.status || order.deliveryStatus} />
                    </td>
                    <td className="px-4 py-4">
                      {proofUrl ? (
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 rounded-full border border-borderwarm px-3 py-2 text-xs font-semibold text-primary"
                          onClick={(event) => {
                            event.stopPropagation();
                            setProofPreview(order);
                          }}
                        >
                          <Eye size={14} />
                          View
                        </button>
                      ) : (
                        <span className="text-xs text-muted">Not uploaded</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        className="action-button-outline gap-2 px-3 py-2 text-xs"
                        onClick={(event) => {
                          event.stopPropagation();
                          setReceiptOrder(order);
                        }}
                      >
                        <ReceiptText size={14} />
                        View
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-full border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                        onClick={(event) => {
                          event.stopPropagation();
                          setDeleteTarget(order);
                        }}
                        disabled={deletingOrderId === getOrderId(order)}
                      >
                        <Trash2 size={14} />
                        {deletingOrderId === getOrderId(order) ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td className="px-4 py-8 text-center text-muted" colSpan={9}>
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder ? (
        <div className="rounded-[1.6rem] border border-borderwarm bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-dark">Order details</p>
              <p className="mt-1 font-heading text-3xl text-primary">{selectedOrder.orderNumber || getOrderId(selectedOrder)}</p>
              <p className="mt-1 text-sm text-muted">Placed {formatDateTime(selectedOrder.createdAt)}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <PaymentBadge status={selectedOrder.paymentStatus} />
                <StatusBadge status={selectedOrder.status || selectedOrder.deliveryStatus} />
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <select
                className="rounded-full border border-borderwarm bg-white px-4 py-3 text-sm outline-none"
                value={selectedOrder.status || 'Pending'}
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
                className="action-button-outline gap-2"
                onClick={() => setReceiptOrder(selectedOrder)}
              >
                <ReceiptText size={16} />
                Receipt
              </button>
              <button
                type="button"
                className="action-button-outline gap-2 border-rose-200 text-rose-700 hover:border-rose-300"
                onClick={() => setDeleteTarget(selectedOrder)}
                disabled={deletingOrderId === getOrderId(selectedOrder)}
              >
                <Trash2 size={16} />
                {deletingOrderId === getOrderId(selectedOrder) ? 'Deleting...' : 'Delete'}
              </button>
              <button
                type="button"
                className="action-button"
                onClick={saveSelectedStatus}
                disabled={savingOrderId === getOrderId(selectedOrder)}
              >
                {savingOrderId === getOrderId(selectedOrder) ? 'Saving...' : 'Save Status'}
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <div className="rounded-[1.2rem] bg-cream p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Customer</p>
              <div className="mt-3 space-y-1 text-sm leading-6 text-body">
                <p className="font-semibold text-primary">{selectedOrder.customerName || 'Customer'}</p>
                <p>{selectedOrder.email || 'No email'}</p>
                <p>{selectedOrder.phone || 'No phone'}</p>
              </div>
            </div>
            <div className="rounded-[1.2rem] bg-cream p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Shipping Address</p>
              <p className="mt-3 text-sm leading-6 text-body">{getAddress(selectedOrder) || 'No address saved'}</p>
            </div>
            <div className="rounded-[1.2rem] bg-cream p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Payment</p>
              <div className="mt-3 space-y-1 text-sm leading-6 text-body">
                <p>Method: <span className="font-semibold text-primary">{selectedOrder.paymentMethod || selectedOrder.paymentGateway || 'Manual'}</span></p>
                <p>Status: <span className="font-semibold text-primary">{selectedOrder.paymentStatus || 'Pending'}</span></p>
                <p>Total: <span className="font-semibold text-primary">{formatPrice(selectedOrder.total ?? selectedOrder.pricing?.total)}</span></p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Ordered Products</p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {selectedOrder.items?.map((item, index) => {
                const itemImage = getItemImage(item);
                return (
                  <div key={`${item.productId || item.name}-${item.color || index}`} className="flex gap-3 rounded-[1.2rem] bg-cream p-3">
                    {itemImage ? (
                      <img src={itemImage} alt={item.name || 'Ordered product'} className="h-20 w-16 rounded-xl object-cover" loading="lazy" />
                    ) : (
                      <div className="h-20 w-16 rounded-xl bg-white" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 font-semibold text-primary">{item.name || item.productId}</p>
                      <p className="mt-1 text-sm text-muted">{item.color || 'Default'} | Qty {item.qty || item.quantity || 0}</p>
                      <p className="mt-1 text-sm font-semibold text-primary">{formatPrice(item.lineTotal || Number(item.salePrice || item.price || 0) * Number(item.qty || item.quantity || 0))}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Payment Screenshot</p>
            {getProofUrl(selectedOrder) ? (
              <div className="mt-3 grid gap-4 rounded-[1.2rem] bg-cream p-4 sm:grid-cols-[180px_1fr]">
                <img
                  src={getProofUrl(selectedOrder)}
                  alt={`Payment proof for ${selectedOrder.orderNumber || getOrderId(selectedOrder)}`}
                  className="h-44 w-full rounded-xl bg-white object-contain"
                  loading="lazy"
                />
                <div className="flex flex-col justify-center gap-3">
                  <p className="text-sm text-body">Uploaded payment proof is available for admin verification.</p>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className="action-button-outline px-4 py-2 text-xs" onClick={() => setProofPreview(selectedOrder)}>
                      Preview
                    </button>
                    <button
                      type="button"
                      className="action-button px-4 py-2 text-xs"
                      onClick={() => downloadImage(getProofUrl(selectedOrder), selectedOrder.orderNumber)}
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
      ) : null}

      {deleteTarget ? (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[1.4rem] border border-[#ead7a2] bg-[#fffaf0] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-dark">Confirm delete</p>
                <h2 className="mt-2 font-heading text-3xl text-primary">Delete this order?</h2>
              </div>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-full bg-white p-2 text-primary disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Close delete confirmation"
                disabled={deletingOrderId === getOrderId(deleteTarget)}
              >
                <X size={18} />
              </button>
            </div>
            <p className="mt-4 text-sm leading-6 text-body">
              {deleteTarget.orderNumber || getOrderId(deleteTarget)} will be removed from admin orders. This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="action-button-outline"
                onClick={() => setDeleteTarget(null)}
                disabled={deletingOrderId === getOrderId(deleteTarget)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="action-button bg-maroon"
                onClick={confirmDelete}
                disabled={deletingOrderId === getOrderId(deleteTarget)}
              >
                {deletingOrderId === getOrderId(deleteTarget) ? 'Deleting...' : 'Delete Order'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {proofPreview ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
          <div className="flex max-h-full w-full max-w-5xl flex-col rounded-[1.4rem] bg-white p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="font-semibold text-primary">{proofPreview.orderNumber || getOrderId(proofPreview)} payment proof</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-borderwarm text-primary"
                  onClick={() => setProofZoom((current) => Math.max(0.6, Number((current - 0.2).toFixed(1))))}
                  aria-label="Zoom out payment proof"
                >
                  <ZoomOut size={16} />
                </button>
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-borderwarm text-primary"
                  onClick={() => setProofZoom((current) => Math.min(3, Number((current + 0.2).toFixed(1))))}
                  aria-label="Zoom in payment proof"
                >
                  <ZoomIn size={16} />
                </button>
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-borderwarm text-primary"
                  onClick={() => downloadImage(getProofUrl(proofPreview), proofPreview.orderNumber)}
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
            <div className="max-h-[78vh] overflow-auto rounded-[1rem] bg-[#120b07] p-3">
              <img
                src={getProofUrl(proofPreview)}
                alt={`Payment proof for ${proofPreview.orderNumber || getOrderId(proofPreview)}`}
                className="mx-auto max-w-none rounded-[1rem] object-contain transition-transform"
                style={{ width: `${proofZoom * 100}%` }}
              />
            </div>
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
