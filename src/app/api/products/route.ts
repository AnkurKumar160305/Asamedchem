import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest, isAdmin } from '@/lib/getUser';
import { generateSKU, convertToBaseUnit, getBaseUnit } from '@/lib/units';

export async function GET(req: Request) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const url = new URL(req.url);
    const search = url.searchParams.get('search') || '';
    const category = url.searchParams.get('category') || '';
    const unit = url.searchParams.get('unit') || '';
    const status = url.searchParams.get('status') || 'ACTIVE';

    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (category) where.category = category;
    if (unit) where.baseUnit = unit;

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Products GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = getUserFromRequest(req);
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Forbidden: Admin only' }, { status: 403 });
    }

    const data = await req.json();
    
    // Convert stock quantity to base unit before saving
    const inputUnit = data.baseUnit || 'g';
    const baseUnit = getBaseUnit(inputUnit);
    const stockInBase = convertToBaseUnit(Number(data.stockQuantity), inputUnit);
    
    // If user enters price per their unit, convert to price per base unit
    // e.g., ₹50 per kg → ₹0.05 per g
    let pricePerBase = Number(data.pricePerBaseUnit);
    if (inputUnit !== baseUnit) {
      // Price per input unit ÷ conversion factor = price per base unit
      pricePerBase = pricePerBase / convertToBaseUnit(1, inputUnit);
    }

    const sku = data.sku || generateSKU(data.category, data.name);

    const product = await prisma.product.create({
      data: {
        name: data.name,
        sku,
        category: data.category,
        description: data.description || '',
        baseUnit: baseUnit,
        stockQuantity: stockInBase,
        pricePerBaseUnit: pricePerBase,
        reorderLevel: data.reorderLevel ? Number(data.reorderLevel) : 10,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'PRODUCT_CREATED',
        userId: user.userId,
        entity: 'Product',
        entityId: product.id,
        newData: JSON.stringify({ name: product.name, sku: product.sku, baseUnit: product.baseUnit }),
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Products POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
