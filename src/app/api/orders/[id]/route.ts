import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/getUser';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { quote: { include: { items: { include: { product: true } } } } }
    });

    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await req.json();
    const order = await prisma.order.update({
      where: { id: params.id },
      data: { status: data.status }
    });

    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_ORDER_STATUS',
        userId: user.userId,
        details: `Updated order ${order.id} status to ${data.status}`
      }
    });

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
