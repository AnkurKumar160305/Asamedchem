import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest, isAdmin } from '@/lib/getUser';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: { conversions: true }
    });

    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromRequest(req);
    if (!user || !isAdmin(user)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { id } = await params;
    const data = await req.json();
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        category: data.category,
        baseUnit: data.baseUnit,
        stockQuantity: data.stockQuantity,
        unitPrice: data.unitPrice,
      }
    });

    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_PRODUCT',
        userId: user.userId,
        details: `Updated product ${product.name} (ID: ${product.id})`
      }
    });

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromRequest(req);
    if (!user || !isAdmin(user)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { id } = await params;
    const product = await prisma.product.delete({
      where: { id }
    });

    await prisma.auditLog.create({
      data: {
        action: 'DELETE_PRODUCT',
        userId: user.userId,
        details: `Deleted product ${product.name} (ID: ${product.id})`
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
