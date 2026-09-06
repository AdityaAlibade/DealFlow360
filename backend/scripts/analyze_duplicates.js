const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ select: { id: true, email: true, fullName: true, role: true } });
  const customers = await prisma.customer.findMany({ select: { id: true, name: true, email: true, companyName: true } });
  const products = await prisma.product.findMany({ select: { id: true, sku: true, name: true, category: true, basePrice: true } });
  const warehouses = await prisma.warehouse.findMany({ select: { id: true, code: true, name: true, location: true } });
  const requests = await prisma.productRequest.findMany({ include: { items: true } });
  const quotes = await prisma.quotation.findMany({ include: { items: true } });
  const orders = await prisma.order.findMany({ include: { items: true, fulfillments: true, backorders: true, invoices: true } });

  console.log('--- USERS ---');
  users.forEach(u => console.log(`${u.id}: ${u.email} (${u.fullName}) [${u.role}]`));

  console.log('\n--- CUSTOMERS ---');
  customers.forEach(c => console.log(`${c.id}: ${c.email} (${c.name} / ${c.companyName})`));

  console.log('\n--- PRODUCTS ---');
  products.forEach(p => console.log(`${p.id}: ${p.sku} (${p.name}) $${p.basePrice}`));

  console.log('\n--- WAREHOUSES ---');
  warehouses.forEach(w => console.log(`${w.id}: ${w.code} (${w.name} - ${w.location})`));

  console.log('\n--- REQUESTS ---');
  requests.forEach(r => console.log(`${r.id}: ${r.requestNumber} - Cust: ${r.customerId}, Status: ${r.status}, Items: ${r.items.map(i => `${i.productId} x${i.quantity}`).join(', ')}`));

  console.log('\n--- QUOTATIONS ---');
  quotes.forEach(q => console.log(`${q.id}: ${q.quoteNumber} - Cust: ${q.customerId}, Status: ${q.status}, ReqId: ${q.productRequestId}`));

  console.log('\n--- ORDERS ---');
  orders.forEach(o => console.log(`${o.id}: ${o.orderNumber} - Cust: ${o.customerId}, Quote: ${o.quotationId}, Status: ${o.status}`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
