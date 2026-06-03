/**
 * Generate a Quotation PDF using jspdf.
 * Called client-side from the Orders page.
 */
export async function generateQuotationPDF(quotation: any) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("AasaMedChem", 14, 20);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Smart Inventory & Quotation Management Platform", 14, 27);

  // Quotation Info
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(0.5);
  doc.line(14, 32, 196, 32);

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("QUOTATION", 14, 42);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Quotation #: ${quotation.quotationNumber || quotation.id.slice(-8)}`, 14, 50);
  doc.text(`Date: ${new Date(quotation.createdAt).toLocaleDateString()}`, 14, 56);
  doc.text(`Customer: ${quotation.customerName}`, 14, 62);
  doc.text(`Status: ${quotation.status}`, 14, 68);

  if (quotation.notes) {
    doc.text(`Notes: ${quotation.notes}`, 14, 74);
  }

  // Items Table Header
  let y = quotation.notes ? 84 : 78;
  doc.setFillColor(30, 41, 59);
  doc.rect(14, y, 182, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("Product", 16, y + 6);
  doc.text("Qty", 80, y + 6);
  doc.text("Unit", 100, y + 6);
  doc.text("Base Qty", 120, y + 6);
  doc.text("Unit Price", 148, y + 6);
  doc.text("Total", 175, y + 6);

  // Items
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  y += 12;

  const items = quotation.items || [];
  for (const item of items) {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.text(item.product?.name || "Product", 16, y);
    doc.text(String(item.orderedQuantity), 80, y);
    doc.text(item.orderedUnit, 100, y);
    doc.text(String(item.convertedQuantity), 120, y);
    doc.text(`₹${Number(item.unitPrice).toFixed(4)}`, 148, y);
    doc.text(`₹${Number(item.totalPrice).toFixed(2)}`, 175, y);
    y += 8;
  }

  // Totals
  y += 4;
  doc.line(14, y, 196, y);
  y += 8;
  doc.setFont("helvetica", "normal");
  doc.text("Subtotal:", 140, y);
  doc.text(`₹${Number(quotation.subtotal).toFixed(2)}`, 175, y);
  y += 7;
  doc.text("GST (18%):", 140, y);
  doc.text(`₹${Number(quotation.tax).toFixed(2)}`, 175, y);
  y += 7;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Total:", 140, y);
  doc.text(`₹${Number(quotation.total).toFixed(2)}`, 175, y);

  // Footer
  y += 20;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(128, 128, 128);
  doc.text("This is a computer-generated quotation and does not require a signature.", 14, y);
  doc.text(`Generated on ${new Date().toLocaleString()}`, 14, y + 5);

  doc.save(`quotation_${quotation.quotationNumber || quotation.id.slice(-8)}.pdf`);
}
