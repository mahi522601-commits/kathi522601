import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { CalendarDays, Download, MessageCircle, Printer, ReceiptText, Share2, ShoppingBag, Truck } from 'lucide-react';
import BrandLogo from '../ui/BrandLogo';
import DeliveryTracker from '../orders/DeliveryTracker';
import { siteConfig } from '../../config/site';
import { formatPrice } from '../../utils/formatPrice';
import { downloadReceiptPdf, printReceipt, shareReceipt } from '../../utils/receiptActions';
import { formatDeliveryDate, getExpectedDeliveryDate } from '../../utils/deliveryTracking';

function formatDateTime(value) {
  if (!value) {
    return 'Not available';
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function getUnitPrice(item) {
  return Number(item.price || item.salePrice || 0);
}

function getAddress(address = {}) {
  return [
    address.line1,
    address.line2,
    [address.city, address.state].filter(Boolean).join(', '),
    address.pincode,
  ]
    .filter(Boolean)
    .join(', ');
}

function StatusBadge({ children, tone = 'gold' }) {
  const toneClass =
    tone === 'green'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : 'border-[#ead7a2] bg-[#fff6da] text-[#8b6724]';

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${toneClass}`}>
      {children}
    </span>
  );
}

export default function OrderReceipt({
  order,
  compact = false,
  showActions = true,
  successHero = false,
  onContinueShopping,
  onTrackOrder,
}) {
  const receiptRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  if (!order) {
    return null;
  }

  const receipt = order.receipt || {};
  const receiptNumber = order.receiptNumber || receipt.id || order.orderNumber;
  const paymentId = order.razorpayPaymentId || order.paymentId || 'Not available';
  const transactionId = order.transactionId || paymentId;
  const expectedDate = formatDeliveryDate(getExpectedDeliveryDate(order));
  const whatsappText = encodeURIComponent(
    `Hello Khyathi Collections, please find my receipt.\nCustomer: ${order.customerName}\nOrder ID: ${order.orderNumber}\nAmount: ${formatPrice(order.total)}\nExpected delivery within 5 days (${expectedDate}).\nSupport: ${siteConfig.phoneDisplay}`,
  );

  async function handleDownload() {
    try {
      setDownloading(true);
      await downloadReceiptPdf(receiptRef.current, order);
      toast.success('Receipt PDF downloaded');
    } catch (error) {
      toast.error(error.message || 'Unable to download receipt');
    } finally {
      setDownloading(false);
    }
  }

  async function handleShare() {
    try {
      await shareReceipt(order);
      toast.success(navigator.share ? 'Receipt shared' : 'Receipt link copied');
    } catch (error) {
      if (error.name !== 'AbortError') {
        toast.error('Unable to share receipt');
      }
    }
  }

  return (
    <div className="space-y-6">
      {successHero ? (
        <div className="relative overflow-hidden rounded-[24px] border border-[#ead7a2] bg-[#fff8e8] px-6 py-8 text-center shadow-[0_24px_70px_rgba(143,103,36,0.12)]">
          <div className="pointer-events-none absolute inset-0 opacity-70">
            <div className="success-sparkle success-sparkle-1" />
            <div className="success-sparkle success-sparkle-2" />
            <div className="success-sparkle success-sparkle-3" />
          </div>
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[#ead7a2] bg-white text-emerald-600 shadow-[0_18px_42px_rgba(46,125,50,0.14)]">
            <ShoppingBag size={34} />
          </div>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.26em] text-gold-dark">
            Your order has been confirmed
          </p>
          <h1 className="mt-3 font-heading text-4xl text-primary md:text-5xl">
            Delivery within 5 days
          </h1>
          <p className="mt-2 text-sm font-semibold text-body">Expected by {expectedDate}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button type="button" className="action-button" onClick={onContinueShopping}>
              Continue Shopping
            </button>
            <button type="button" className="action-button-outline" onClick={onTrackOrder}>
              Track Order
            </button>
            <a
              className="action-button-outline gap-2"
              href={`https://wa.me/91${siteConfig.phone}?text=${encodeURIComponent(`Hello Khyathi Collections, I need help with order ${order.orderNumber}.`)}`}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={16} />
              WhatsApp Support
            </a>
          </div>
        </div>
      ) : null}

      {showActions ? (
        <div className="flex flex-wrap items-center justify-end gap-3">
          <button type="button" className="action-button-outline gap-2" onClick={handleShare}>
            <Share2 size={16} />
            Share
          </button>
          <button type="button" className="action-button-outline gap-2" onClick={() => printReceipt(receiptRef.current)}>
            <Printer size={16} />
            Print
          </button>
          <button type="button" className="action-button gap-2" onClick={handleDownload} disabled={downloading}>
            <Download size={16} />
            {downloading ? 'Preparing...' : 'Download PDF'}
          </button>
          <a
            className="action-button-outline gap-2"
            href={`https://wa.me/91${siteConfig.phone}?text=${whatsappText}`}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle size={16} />
            Send Receipt to WhatsApp
          </a>
        </div>
      ) : null}

      <article
        ref={receiptRef}
        className={`receipt-sheet overflow-hidden rounded-[22px] border border-[#d8c090] bg-white text-primary shadow-[0_24px_80px_rgba(42,29,16,0.12)] ${compact ? 'text-sm' : ''}`}
      >
        <header className="border-b border-[#d8c090] bg-[#0A1F44] px-5 py-5 text-white md:px-7">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <BrandLogo size="lg" className="rounded-full bg-white p-1" />
              <div>
                <p className="font-heading text-3xl leading-none">Khyathi Collections</p>
                <p className="mt-1 text-xs uppercase tracking-[0.22em] text-[#C8A96B]">
                  One Page Digital Receipt
                </p>
              </div>
            </div>
            <div className="grid gap-2 text-left text-sm md:text-right">
              <p className="font-semibold">{siteConfig.location}</p>
              <p>Phone: {siteConfig.phoneDisplay}</p>
              <p>Receipt: {receiptNumber}</p>
            </div>
          </div>
        </header>

        <div className="grid gap-3 border-b border-[#ead7a2] bg-[#fff8e8] px-5 py-4 md:grid-cols-4 md:px-7">
          <div className="rounded-[14px] border border-[#ead7a2] bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Customer</p>
            <p className="mt-2 font-semibold">{order.customerName}</p>
            <p className="mt-1 text-sm text-body">{order.phone}</p>
            <p className="mt-1 line-clamp-3 text-sm leading-6 text-body">{getAddress(order.address)}</p>
          </div>
          <div className="rounded-[14px] border border-[#ead7a2] bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Order</p>
            <p className="mt-2 text-sm text-body">Order ID: <span className="font-semibold text-primary">{order.orderNumber}</span></p>
            <p className="mt-1 text-sm text-body">Date: <span className="font-semibold text-primary">{formatDateTime(order.createdAt)}</span></p>
            <p className="mt-1 break-all text-xs text-muted">Txn: {transactionId}</p>
          </div>
          <div className="rounded-[14px] border border-[#ead7a2] bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Payment</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <StatusBadge tone={order.paymentStatus === 'Paid' ? 'green' : 'gold'}>
                {order.paymentStatus || 'Pending'}
              </StatusBadge>
              <StatusBadge>{order.paymentMethod || 'Order placed'}</StatusBadge>
            </div>
            {order.paymentUpiId ? (
              <p className="mt-2 text-xs text-muted">UPI: {order.paymentUpiId}</p>
            ) : null}
            <p className="mt-2 font-heading text-3xl">{formatPrice(order.total)}</p>
          </div>
          <div className="rounded-[14px] border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-center gap-2 text-emerald-700">
              <CalendarDays size={18} />
              <p className="text-xs font-semibold uppercase tracking-[0.18em]">Delivery</p>
            </div>
            <p className="mt-2 font-heading text-2xl text-emerald-800">Within 5 days</p>
            <p className="mt-1 text-sm font-semibold text-emerald-800">Expected by {expectedDate}</p>
          </div>
        </div>

        <section className="px-5 py-4 md:px-7">
          <div className="mb-3 flex items-center gap-2 text-primary">
            <ReceiptText size={18} />
            <p className="text-sm font-semibold uppercase tracking-[0.16em]">Items and Amount</p>
          </div>
          <div className="overflow-hidden rounded-[14px] border border-[#ead7a2] bg-white">
            <div className="hidden grid-cols-[1.3fr_0.7fr_0.4fr_0.6fr_0.7fr] gap-3 bg-[#f5ebd8] px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-primary md:grid">
              <span>Product</span>
              <span>Category</span>
              <span>Qty</span>
              <span>Price</span>
              <span className="text-right">Subtotal</span>
            </div>
            <div className="divide-y divide-[#eee0c3]">
              {order.items?.map((item) => (
                <div
                  key={`${item.productId}-${item.color}`}
                  className="grid grid-cols-1 gap-3 px-4 py-3 text-sm md:grid-cols-[1.3fr_0.7fr_0.4fr_0.6fr_0.7fr] md:items-center"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <img src={item.image} alt={item.name} className="h-16 w-14 rounded-[12px] object-cover" />
                    <div className="min-w-0">
                      <p className="font-semibold text-primary">{item.name}</p>
                      <p className="text-xs text-muted">{item.color}</p>
                    </div>
                  </div>
                  <p>{item.category || 'Luxury Collection'}</p>
                  <p>{item.qty}</p>
                  <p>{formatPrice(getUnitPrice(item))}</p>
                  <p className="font-semibold text-primary md:text-right">
                    {formatPrice(getUnitPrice(item) * Number(item.qty || 1))}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 px-5 pb-5 md:grid-cols-[1.2fr_0.8fr] md:px-7">
          <div className="rounded-[14px] border border-[#ead7a2] bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Delivery</p>
                <p className="mt-1 font-semibold text-primary">
                  {receipt.expectedDeliveryText || 'Delivery within 5 days'}
                </p>
                <p className="mt-1 text-sm text-body">{expectedDate}</p>
              </div>
              <Truck className="text-gold-dark" size={22} />
            </div>
            <div className="mt-5">
              <DeliveryTracker order={order} compact />
            </div>
          </div>

          <div className="rounded-[14px] border border-[#C8A96B] bg-[#0A1F44] p-4 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#e8c97a]">Total Amount</p>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(order.pricing?.subtotal ?? order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount</span>
                <span>-{formatPrice(order.pricing?.discount ?? order.discount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>FREE</span>
              </div>
              <div className="flex justify-between border-t border-white/20 pt-3 text-lg font-semibold">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-[#e8d8b4] bg-[#f5ebd8] px-5 py-4 text-sm text-body md:px-7">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-heading text-2xl text-primary">Thank you for shopping with us.</p>
              <p className="mt-1">For support, call {siteConfig.phoneDisplay} or message us on WhatsApp.</p>
            </div>
            <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              <a href={siteConfig.instagramUrl} target="_blank" rel="noreferrer">Instagram</a>
              <a href={siteConfig.whatsappHref} target="_blank" rel="noreferrer">WhatsApp Support</a>
              <span>Customer Support</span>
            </div>
          </div>
        </footer>
      </article>
    </div>
  );
}
