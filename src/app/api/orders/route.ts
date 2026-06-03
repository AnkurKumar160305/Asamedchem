import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/getUser';

export async function GET(req: Request) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const orders = await prisma.order.findMany({
      include: {
        quotation: { include: { items: { include: { product: true } } } },
        items: { include: { product: true } },
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Orders GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { quotationId } = await req.json();
    if (!quotationId) {
      return NextResponse.json({ error: 'quotationId is required' }, { status: 400 });
    }

    // Verify quotation is APPROVED
    const quotation = await prisma.quotation.findUnique({
      where: { id: quotationId },
      include: { items: { include: { product: true } } },
    });

    if (!quotation) return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    if (quotation.status !== 'APPROVED') {
      return NextResponse.json({ error: 'Only APPROVED quotations can become orders' }, { status: 400 });
    }

    // Check if order already exists for this quotation
    const existingOrder = await prisma.order.findUnique({ where: { quotationId } });
    if (existingOrder) {
      return NextResponse.json({ error: 'Order already exists for this quotation' }, { status: 409 });
    }

    // Create order with items copied from quotation
    const order = await prisma.order.create({
      data: {
        quotationId,
        userId: user.userId,
        status: 'PENDING',
        totalAmount: Number(quotation.total),
        items: {
          create: quotation.items.map((item) => ({
            productId: item.productId,
            quantity: Number(item.orderedQuantity),
            unit: item.orderedUnit,
            convertedQuantity: Number(item.convertedQuantity),
            price: Number(item.totalPrice),
          })),
        },
      },
      include: { items: true, quotation: true },
    });

    // Deduct stock from inventory
    for (const item of quotation.items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (product) {
        const previousStock = Number(product.stockQuantity);
        const deduction = Number(item.convertedQuantity);
        const newStock = previousStock - deduction;

        await prisma.product.update({
          where: { id: item.productId },
          data: { stockQuantity: Math.max(0, newStock) },
        });

        await prisma.inventoryTransaction.create({
          data: {
            productId: item.productId,
            type: 'STOCK_OUT',
            quantity: deduction,
            previousStock,
            newStock: Math.max(0, newStock),
            notes: `Order ${order.id} - ${item.orderedQuantity} ${item.orderedUnit}`,
            createdById: user.userId,
          },
        });
      }
    }

    await prisma.auditLog.create({
      data: {
        action: 'ORDER_CREATED',
        userId: user.userId,
        entity: 'Order',
        entityId: order.id,
        newData: JSON.stringify({ quotationId, totalAmount: Number(quotation.total) }),
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Orders POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
