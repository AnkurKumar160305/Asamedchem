import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/getUser';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const quotation = await prisma.quotation.findUnique({
      where: { id: params.id },
      include: { items: { include: { product: true } } }
    });

    if (!quotation) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(quotation);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await req.json();
    const quotation = await prisma.quotation.update({
      where: { id: params.id },
      data: {
        status: data.status,
      }
    });

    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_QUOTATION_STATUS',
        userId: user.userId,
        details: `Updated quotation ${quotation.id} status to ${data.status}`
      }
    });

    return NextResponse.json(quotation);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
