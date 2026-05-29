function receiptFileName(order) {
  const id = order?.receiptNumber || order?.orderNumber || order?.id || 'receipt';
  return `khyathi-${String(id).toLowerCase()}.pdf`;
}

export async function downloadReceiptPdf(element, order) {
  if (!order) {
    throw new Error('Receipt is not ready for download.');
  }

  const { default: jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4', compress: true });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 12;
  const right = pageWidth - margin;
  const primary = [28, 18, 10];
  const gold = [184, 139, 45];
  const muted = [105, 90, 72];
  const money = (value) => `Rs. ${Number(value || 0).toLocaleString('en-IN')}`;
  let y = 14;

  pdf.setFillColor(...primary);
  pdf.roundedRect(margin, y, pageWidth - margin * 2, 34, 4, 4, 'F');
  pdf.setTextColor(255, 250, 240);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.text('Khyathi Collections', margin + 6, y + 12);
  pdf.setFontSize(8);
  pdf.setTextColor(232, 201, 122);
  pdf.text('ADVANCED DIGITAL RECEIPT', margin + 6, y + 20);
  pdf.setTextColor(255, 250, 240);
  pdf.text(`Receipt: ${order.receiptNumber || order.orderNumber || order.id}`, right - 6, y + 12, { align: 'right' });
  pdf.text(`Order: ${order.orderNumber || order.id}`, right - 6, y + 20, { align: 'right' });
  y += 43;

  pdf.setTextColor(...primary);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Customer', margin, y);
  pdf.text('Payment', margin + 96, y);
  y += 6;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(...muted);
  const address = [
    order.address?.line1,
    order.address?.line2,
    [order.address?.city, order.address?.state].filter(Boolean).join(', '),
    order.address?.pincode,
  ].filter(Boolean).join(', ');
  pdf.text([order.customerName || '', order.phone || '', address].filter(Boolean), margin, y, {
    maxWidth: 82,
    lineHeightFactor: 1.35,
  });
  pdf.text([
    `Status: ${order.paymentStatus || 'Pending'}`,
    `Method: ${order.paymentMethod || 'UPI / Manual verification'}`,
    `Date: ${order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN') : 'Not available'}`,
  ], margin + 96, y, { maxWidth: 88, lineHeightFactor: 1.35 });
  y += 28;

  pdf.setFillColor(245, 235, 216);
  pdf.roundedRect(margin, y, pageWidth - margin * 2, 9, 2, 2, 'F');
  pdf.setTextColor(...primary);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.text('Product', margin + 4, y + 6);
  pdf.text('Qty', margin + 120, y + 6);
  pdf.text('Amount', right - 4, y + 6, { align: 'right' });
  y += 13;

  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...muted);
  const visibleItems = (order.items || []).slice(0, 7);
  visibleItems.forEach((item) => {
    const name = `${item.name || 'Product'}${item.color ? ` (${item.color})` : ''}`;
    pdf.text(pdf.splitTextToSize(name, 108).slice(0, 2), margin + 4, y);
    pdf.text(String(item.qty || 1), margin + 121, y);
    pdf.text(money(Number(item.price || item.salePrice || 0) * Number(item.qty || 1)), right - 4, y, { align: 'right' });
    y += 10;
  });

  if ((order.items || []).length > visibleItems.length) {
    pdf.text(`+ ${(order.items || []).length - visibleItems.length} more item(s) included in this order`, margin + 4, y);
    y += 8;
  }

  y += 3;
  pdf.setDrawColor(234, 215, 162);
  pdf.line(margin, y, right, y);
  y += 8;
  const totalsX = right - 70;
  pdf.setFontSize(9);
  pdf.text('Subtotal', totalsX, y);
  pdf.text(money(order.pricing?.subtotal ?? order.subtotal), right, y, { align: 'right' });
  y += 7;
  pdf.text('Discount', totalsX, y);
  pdf.text(`-${money(order.pricing?.discount ?? order.discount)}`, right, y, { align: 'right' });
  y += 7;
  pdf.text('Shipping', totalsX, y);
  pdf.text('FREE', right, y, { align: 'right' });
  y += 9;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.setTextColor(...primary);
  pdf.text('Total', totalsX, y);
  pdf.text(money(order.total), right, y, { align: 'right' });

  y += 18;
  pdf.setFillColor(255, 246, 218);
  pdf.roundedRect(margin, y, pageWidth - margin * 2, 22, 3, 3, 'F');
  pdf.setTextColor(...gold);
  pdf.setFontSize(8);
  pdf.text('DELIVERY', margin + 5, y + 7);
  pdf.setTextColor(...primary);
  pdf.setFontSize(10);
  pdf.text(order.receipt?.expectedDeliveryText || 'Expected Delivery Within 5 Days', margin + 5, y + 15);
  pdf.setTextColor(...muted);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.text('For support, call 93921 73693 or message Khyathi Collections on WhatsApp.', right - 5, y + 15, { align: 'right' });
  pdf.text('Thank you for shopping with us.', pageWidth / 2, 286, { align: 'center' });
  pdf.save(receiptFileName(order));
}

export function printReceipt(element) {
  if (!element) {
    throw new Error('Receipt is not ready to print.');
  }

  const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=900,height=1100');
  if (!printWindow) {
    window.print();
    return;
  }

  const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map((node) => node.outerHTML)
    .join('');

  printWindow.document.write(`
    <!doctype html>
    <html>
      <head>
        <title>Khyathi Collections Receipt</title>
        ${styles}
      </head>
      <body style="margin:0;background:#fffaf0;">
        <div style="padding:24px;">${element.outerHTML}</div>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => printWindow.print(), 400);
}

export async function shareReceipt(order) {
  const shareText = `Khyathi Collections order ${order?.orderNumber || ''} is confirmed. Expected delivery within 5 days.`;
  const shareUrl = `${window.location.origin}/receipt/${order?.id || ''}`;

  if (navigator.share) {
    await navigator.share({
      title: 'Khyathi Collections Receipt',
      text: shareText,
      url: shareUrl,
    });
    return;
  }

  await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
}
