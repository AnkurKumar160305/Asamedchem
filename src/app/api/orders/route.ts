import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/getUser';

export async function GET(req: Request) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const orders = await prisma.order.findMany({
      include: { quote: { include: { items: true } } },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { quoteId } = await req.json();

    const quote = await prisma.quotation.findUnique({ where: { id: quoteId } });
    if (!quote || quote.status !== 'ACCEPTED') {
      return NextResponse.json({ error: 'Quote must be accepted to create an order' }, { status: 400 });
    }

    const order = await prisma.order.create({
      data: {
        quoteId,
        status: 'PENDING'
      }
    });

    await prisma.auditLog.create({
      data: {
        action: 'CREATE_ORDER',
        userId: user.userId,
        details: `Created order ${order.id} from quote ${quoteId}`
      }
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
