import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/getUser';

export async function GET(req: Request) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const quotations = await prisma.quotation.findMany({
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(quotations);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await req.json();
    
    // Calculate total amount
    const totalAmount = data.items.reduce((sum: number, item: any) => {
      return sum + (Number(item.quantity) * Number(item.unitPrice));
    }, 0);

    const quotation = await prisma.quotation.create({
      data: {
        customerName: data.customerName,
        totalAmount,
        status: 'DRAFT',
        items: {
          create: data.items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.unitPrice,
            totalPrice: Number(item.quantity) * Number(item.unitPrice),
          }))
        }
      },
      include: { items: true }
    });

    await prisma.auditLog.create({
      data: {
        action: 'CREATE_QUOTATION',
        userId: user.userId,
        details: `Created quotation ${quotation.id} for ${data.customerName}`
      }
    });

    return NextResponse.json(quotation, { status: 201 });
  } catch (error) {
    console.error('Quotation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
