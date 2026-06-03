import prisma from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Seeding database...');

  // Create demo admin
  const adminPassword = await bcrypt.hash('Password@123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@aasamedchem.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@aasamedchem.com',
      password: adminPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  // Create demo seller
  const sellerPassword = await bcrypt.hash('Password@123', 10);
  const seller = await prisma.user.upsert({
    where: { email: 'seller@aasamedchem.com' },
    update: {},
    create: {
      name: 'Seller User',
      email: 'seller@aasamedchem.com',
      password: sellerPassword,
      role: 'SELLER',
      status: 'ACTIVE',
    },
  });

  // Create sample products (stored in base units: g, mL, count)
  const products = [
    {
      name: 'Sulphuric Acid',
      category: 'Acids',
      description: 'Concentrated sulphuric acid for laboratory use',
      baseUnit: 'mL',
      stockQuantity: 50000,    // 50 L stored as 50000 mL
      pricePerBaseUnit: 0.15,  // ₹0.15 per mL = ₹150 per L
      reorderLevel: 5000,
      sku: 'ACI-SUL-0001',
    },
    {
      name: 'Sodium Chloride',
      category: 'Salts',
      description: 'Pure NaCl crystals for analytical use',
      baseUnit: 'g',
      stockQuantity: 25000,    // 25 kg stored as 25000 g
      pricePerBaseUnit: 0.05,  // ₹0.05 per g = ₹50 per kg
      reorderLevel: 2000,
      sku: 'SAL-SOD-0002',
    },
    {
      name: 'Ethanol',
      category: 'Solvents',
      description: '99.9% pure ethanol for synthesis',
      baseUnit: 'mL',
      stockQuantity: 100000,   // 100 L stored as 100000 mL
      pricePerBaseUnit: 0.20,  // ₹0.20 per mL = ₹200 per L
      reorderLevel: 10000,
      sku: 'SOL-ETH-0003',
    },
    {
      name: 'Glass Beakers (500mL)',
      category: 'Equipment',
      description: 'Borosilicate glass beakers 500mL',
      baseUnit: 'count',
      stockQuantity: 150,
      pricePerBaseUnit: 250,   // ₹250 per unit
      reorderLevel: 20,
      sku: 'EQU-GLA-0004',
    },
    {
      name: 'Potassium Permanganate',
      category: 'Chemicals',
      description: 'KMnO4 powder for titration',
      baseUnit: 'g',
      stockQuantity: 5000,     // 5 kg stored as 5000 g
      pricePerBaseUnit: 0.80,  // ₹0.80 per g = ₹800 per kg
      reorderLevel: 500,
      sku: 'CHE-POT-0005',
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: {},
      create: product,
    });
  }

  console.log('Seeded:');
  console.log(`  Admin: admin@aasamedchem.com / Password@123`);
  console.log(`  Seller: seller@aasamedchem.com / Password@123`);
  console.log(`  Products: ${products.length} items`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
