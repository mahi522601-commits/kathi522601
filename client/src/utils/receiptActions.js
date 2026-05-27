function receiptFileName(order) {
  const id = order?.receiptNumber || order?.orderNumber || order?.id || 'receipt';
  return `khyathi-${String(id).toLowerCase()}.pdf`;
}

export async function downloadReceiptPdf(element, order) {
  if (!element) {
    throw new Error('Receipt is not ready for download.');
  }

  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ]);

  const canvas = await html2canvas(element, {
    scale: Math.min(window.devicePixelRatio || 2, 3),
    backgroundColor: '#fffaf0',
    useCORS: true,
    allowTaint: false,
    imageTimeout: 15000,
    logging: false,
  });

  const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4', compress: true });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 8;
  const imageWidth = pageWidth - margin * 2;
  const imageHeight = (canvas.height * imageWidth) / canvas.width;
  let remainingHeight = imageHeight;
  let position = margin;
  const imageData = canvas.toDataURL('image/png');

  pdf.addImage(imageData, 'PNG', margin, position, imageWidth, imageHeight, undefined, 'FAST');
  remainingHeight -= pageHeight - margin * 2;

  while (remainingHeight > 0) {
    position = remainingHeight - imageHeight + margin;
    pdf.addPage();
    pdf.addImage(imageData, 'PNG', margin, position, imageWidth, imageHeight, undefined, 'FAST');
    remainingHeight -= pageHeight - margin * 2;
  }

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
