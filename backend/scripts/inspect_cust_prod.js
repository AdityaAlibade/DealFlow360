const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const customers = await prisma.customer.findMany({ orderBy: { createdAt: 'asc' } });
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'asc' } });

  console.log('=== CUSTOMERS ===');
  customers.forEach(c => console.log(c.id, '|', c.name, '|', c.email, '|', c.companyName));

  console.log('\n=== PRODUCTS ===');
  products.forEach(p => console.log(p.id, '|', p.sku, '|', p.name, '|', p.category));
}
main().catch(console.error).finally(() => prisma.$disconnect());
