import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest, isAdmin } from '@/lib/getUser';

export async function GET(req: Request) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const conversions = await prisma.unitConversion.findMany({
      include: { product: true }
    });
    return NextResponse.json(conversions);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = getUserFromRequest(req);
    if (!user || !isAdmin(user)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const data = await req.json();
    const conversion = await prisma.unitConversion.create({
      data: {
        productId: data.productId,
        fromUnit: data.fromUnit,
        toUnit: data.toUnit,
        conversionFactor: data.conversionFactor,
      }
    });

    await prisma.auditLog.create({
      data: {
        action: 'CREATE_CONVERSION',
        userId: user.userId,
        details: `Created conversion ${data.fromUnit} -> ${data.toUnit} for product ${data.productId}`
      }
    });

    return NextResponse.json(conversion, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
