import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest, isAdmin } from '@/lib/getUser';

export async function GET(req: Request) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!isAdmin(user)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const url = new URL(req.url);
    const type = url.searchParams.get('type') || 'products';

    let csv = '';

    if (type === 'products') {
      const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
      csv = 'SKU,Name,Category,Base Unit,Stock Quantity,Price Per Base Unit,Reorder Level,Status,Created At\n';
      for (const p of products) {
        csv += `"${p.sku}","${p.name}","${p.category}","${p.baseUnit}",${p.stockQuantity},${p.pricePerBaseUnit},${p.reorderLevel},"${p.status}","${p.createdAt.toISOString()}"\n`;
      }
    } else if (type === 'orders') {
      const orders = await prisma.order.findMany({
        include: { quotation: true, user: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      });
      csv = 'Order ID,Customer,User,Status,Total Amount,Created At\n';
      for (const o of orders) {
        csv += `"${o.id}","${o.quotation.customerName}","${o.user.email}","${o.status}",${o.totalAmount},"${o.createdAt.toISOString()}"\n`;
      }
    } else if (type === 'quotations') {
      const quotations = await prisma.quotation.findMany({
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      });
      csv = 'Quotation ID,Customer,User,Status,Subtotal,Tax,Total,Created At\n';
      for (const q of quotations) {
        csv += `"${q.id}","${q.customerName}","${q.user.email}","${q.status}",${q.subtotal},${q.tax},${q.total},"${q.createdAt.toISOString()}"\n`;
      }
    } else if (type === 'inventory') {
      const transactions = await prisma.inventoryTransaction.findMany({
        include: { product: { select: { name: true, sku: true } }, createdBy: { select: { email: true } } },
        orderBy: { createdAt: 'desc' },
      });
      csv = 'Product,SKU,Type,Quantity,Previous Stock,New Stock,Notes,User,Created At\n';
      for (const t of transactions) {
        csv += `"${t.product.name}","${t.product.sku}","${t.type}",${t.quantity},${t.previousStock},${t.newStock},"${t.notes}","${t.createdBy.email}","${t.createdAt.toISOString()}"\n`;
      }
    }

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${type}_export_${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
