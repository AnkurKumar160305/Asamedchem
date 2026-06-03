import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/getUser';
import { convertToBaseUnit } from '@/lib/units';

export async function GET(req: Request) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const quotations = await prisma.quotation.findMany({
      include: { items: { include: { product: true } }, user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(quotations);
  } catch (error) {
    console.error('Quotations GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await req.json();
    if (!data.customerName || !data.items || data.items.length === 0) {
      return NextResponse.json({ error: 'Customer name and items are required' }, { status: 400 });
    }

    // Calculate line items with base unit conversion
    let subtotal = 0;
    const itemsData = [];

    for (const item of data.items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) continue;

      const orderedQty = Number(item.quantity);
      const orderedUnit = item.unit;
      const convertedQty = convertToBaseUnit(orderedQty, orderedUnit);
      const unitPrice = Number(product.pricePerBaseUnit);
      const totalPrice = convertedQty * unitPrice;

      subtotal += totalPrice;
      itemsData.push({
        productId: item.productId,
        orderedQuantity: orderedQty,
        orderedUnit,
        convertedQuantity: convertedQty,
        unitPrice,
        totalPrice,
      });
    }

    const tax = subtotal * 0.18; // 18% GST
    const total = subtotal + tax;

    const quotation = await prisma.quotation.create({
      data: {
        userId: user.userId,
        customerName: data.customerName,
        status: 'DRAFT',
        subtotal,
        tax,
        total,
        notes: data.notes || '',
        items: { create: itemsData },
      },
      include: { items: { include: { product: true } } },
    });

    await prisma.auditLog.create({
      data: {
        action: 'QUOTATION_CREATED',
        userId: user.userId,
        entity: 'Quotation',
        entityId: quotation.id,
        newData: JSON.stringify({ customerName: data.customerName, total, itemCount: itemsData.length }),
      },
    });

    return NextResponse.json(quotation, { status: 201 });
  } catch (error) {
    console.error('Quotation POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
