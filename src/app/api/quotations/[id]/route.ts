import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/getUser';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: { items: { include: { product: true } }, user: { select: { name: true, email: true } } },
    });

    if (!quotation) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(quotation);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const data = await req.json();

    const existing = await prisma.quotation.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const oldStatus = existing.status;
    const quotation = await prisma.quotation.update({
      where: { id },
      data: { status: data.status },
    });

    await prisma.auditLog.create({
      data: {
        action: 'QUOTATION_STATUS_UPDATED',
        userId: user.userId,
        entity: 'Quotation',
        entityId: quotation.id,
        oldData: JSON.stringify({ status: oldStatus }),
        newData: JSON.stringify({ status: data.status }),
      },
    });

    // Notify the user who created the quotation
    await prisma.notification.create({
      data: {
        userId: existing.userId,
        title: `Quotation ${data.status}`,
        message: `Your quotation for "${existing.customerName}" has been ${data.status.toLowerCase()} by the administrator.`,
      },
    });

    return NextResponse.json(quotation);
  } catch (error) {
    console.error('Quotation update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
