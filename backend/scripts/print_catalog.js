const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  const customers = await prisma.customer.findMany();
  const products = await prisma.product.findMany();
  const warehouses = await prisma.warehouse.findMany();
  const requests = await prisma.productRequest.findMany();
  const quotations = await prisma.quotation.findMany();
  const orders = await prisma.order.findMany();

  console.log(`\n=== USERS (${users.length}) ===`);
  users.forEach(u => console.log(`  * ${u.fullName} (${u.email}) -> ${u.role}`));

  console.log(`\n=== CUSTOMERS (${customers.length}) ===`);
  customers.forEach(c => console.log(`  * ${c.name} (${c.email}) -> ${c.companyName}`));

  console.log(`\n=== PRODUCTS (${products.length}) ===`);
  products.forEach(p => console.log(`  * [${p.sku}] ${p.name} -> ₹${p.basePrice}`));

  console.log(`\n=== WAREHOUSES (${warehouses.length}) ===`);
  warehouses.forEach(w => console.log(`  * [${w.code}] ${w.name} -> ${w.location}`));

  console.log(`\n=== REQUESTS (${requests.length}) ===`);
  requests.forEach(r => console.log(`  * [${r.requestNumber}] ${r.status}`));

  console.log(`\n=== QUOTATIONS (${quotations.length}) ===`);
  quotations.forEach(q => console.log(`  * [${q.quoteNumber}] ${q.status} (₹${q.totalAmount})`));

  console.log(`\n=== ORDERS (${orders.length}) ===`);
  orders.forEach(o => console.log(`  * [${o.orderNumber}] ${o.status} (₹${o.totalAmount})`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
