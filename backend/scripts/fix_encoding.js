const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Sanitizing special non-ASCII characters in database to prevent WIN1252 psql errors...');
  
  // Fix products
  const products = await prisma.product.findMany();
  for (const p of products) {
    if (p.description && p.description.includes('₹')) {
      const cleanDesc = p.description.replace(/₹/g, 'INR ');
      await prisma.product.update({
        where: { id: p.id },
        data: { description: cleanDesc }
      });
      console.log(`Updated product ${p.name} (${p.sku}) description: ${cleanDesc}`);
    }
  }

  // Check any other text columns in all tables
  const tables = [
    'user', 'customer', 'product', 'warehouse', 'productRequest', 
    'quotation', 'quotationItem', 'order', 'orderItem', 'invoice', 
    'fulfillment', 'backorder', 'subscriptionPlan', 'dealApproval', 'dealHealth'
  ];

  for (const table of tables) {
    if (!prisma[table]) continue;
    const records = await prisma[table].findMany();
    for (const record of records) {
      let needsUpdate = false;
      const updatedData = {};
      for (const [k, v] of Object.entries(record)) {
        if (typeof v === 'string' && v.includes('₹')) {
          needsUpdate = true;
          updatedData[k] = v.replace(/₹/g, 'INR ');
        }
      }
      if (needsUpdate) {
        await prisma[table].update({
          where: { id: record.id },
          data: updatedData
        });
        console.log(`Updated [${table}] ID: ${record.id}`);
      }
    }
  }

  console.log('✔ Database characters sanitized for full WIN1252 / UTF-8 compatibility.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
