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

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const previousStock = Number(existing.stockQuantity);
    const newStock = Number(data.stockQuantity ?? existing.stockQuantity);

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: data.name ?? existing.name,
        category: data.category ?? existing.category,
        description: data.description ?? existing.description,
        baseUnit: data.baseUnit ?? existing.baseUnit,
        stockQuantity: newStock,
        pricePerBaseUnit: data.pricePerBaseUnit !== undefined ? Number(data.pricePerBaseUnit) : existing.pricePerBaseUnit,
        reorderLevel: data.reorderLevel !== undefined ? Number(data.reorderLevel) : existing.reorderLevel,
        status: data.status ?? existing.status,
      }
    });

    // Log stock adjustment transaction if stock changed
    if (previousStock !== newStock) {
      const diff = newStock - previousStock;
      const type = diff > 0 ? 'STOCK_IN' : 'STOCK_OUT';
      
      await prisma.inventoryTransaction.create({
        data: {
          productId: product.id,
          type,
          quantity: Math.abs(diff),
          previousStock,
          newStock,
          notes: data.notes || 'Manual stock adjustment',
          createdById: user.userId,
        }
      });

      // Low stock notifications
      if (newStock <= Number(product.reorderLevel)) {
        const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
        for (const admin of admins) {
          await prisma.notification.create({
            data: {
              userId: admin.id,
              title: 'Low Stock Alert',
              message: `Product "${product.name}" stock (${newStock} ${product.baseUnit}) has fallen below reorder level (${product.reorderLevel} ${product.baseUnit}).`,
            }
          });
        }
      }
    }

    await prisma.auditLog.create({
      data: {
        action: 'PRODUCT_UPDATED',
        userId: user.userId,
        entity: 'Product',
        entityId: product.id,
        oldData: JSON.stringify({ stockQuantity: previousStock, name: existing.name }),
        newData: JSON.stringify({ stockQuantity: newStock, name: product.name }),
      }
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Product update error:', error);
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
