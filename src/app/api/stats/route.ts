import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/getUser';

export async function GET(req: Request) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const [
      totalProducts,
      products,
      totalOrders,
      totalQuotations,
      recentLogs,
    ] = await Promise.all([
      prisma.product.count({ where: { status: 'ACTIVE' } }),
      prisma.product.findMany({ where: { status: 'ACTIVE' } }),
      prisma.order.count(),
      prisma.quotation.count(),
      prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { user: { select: { name: true, email: true } } },
      }),
    ]);

    // Calculate inventory value
    const inventoryValue = products.reduce((sum, p) => {
      return sum + Number(p.stockQuantity) * Number(p.pricePerBaseUnit);
    }, 0);

    // Low stock alerts
    const lowStockProducts = products.filter(
      (p) => Number(p.stockQuantity) <= Number(p.reorderLevel)
    );

    // Revenue (sum of all order totals)
    const orders = await prisma.order.findMany({ select: { totalAmount: true } });
    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);

    return NextResponse.json({
      totalProducts,
      inventoryValue,
      totalOrders,
      totalQuotations,
      totalRevenue,
      lowStockProducts,
      recentActivity: recentLogs,
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
