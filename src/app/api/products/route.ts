import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest, isAdmin } from '@/lib/getUser';

export async function GET(req: Request) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const products = await prisma.product.findMany({
      include: { conversions: true }
    });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = getUserFromRequest(req);
    if (!user || !isAdmin(user)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const data = await req.json();
    const product = await prisma.product.create({
      data: {
        name: data.name,
        category: data.category,
        baseUnit: data.baseUnit,
        stockQuantity: data.stockQuantity || 0,
        unitPrice: data.unitPrice || 0,
      }
    });

    await prisma.auditLog.create({
      data: {
        action: 'CREATE_PRODUCT',
        userId: user.userId,
        details: `Created product ${product.name} (ID: ${product.id})`
      }
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
