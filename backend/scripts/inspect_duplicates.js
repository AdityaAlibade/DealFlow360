const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const customers = await prisma.customer.findMany({ orderBy: { createdAt: 'asc' } });
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'asc' } });
  const warehouses = await prisma.warehouse.findMany({ orderBy: { createdAt: 'asc' } });
  const requests = await prisma.productRequest.findMany({ orderBy: { createdAt: 'asc' } });
  const quotes = await prisma.quotation.findMany({ orderBy: { createdAt: 'asc' } });
  const orders = await prisma.order.findMany({ orderBy: { createdAt: 'asc' } });

  console.log('\n--- ALL CUSTOMERS (' + customers.length + ') ---');
  customers.forEach(c => console.log(JSON.stringify({ id: c.id, name: c.name, email: c.email, company: c.companyName, created: c.createdAt })));

  console.log('\n--- ALL PRODUCTS (' + products.length + ') ---');
  products.forEach(p => console.log(JSON.stringify({ id: p.id, sku: p.sku, name: p.name, price: p.unitPrice })));

  console.log('\n--- ALL WAREHOUSES (' + warehouses.length + ') ---');
  warehouses.forEach(w => console.log(JSON.stringify({ id: w.id, code: w.code, name: w.name, city: w.city })));

  console.log('\n--- ALL REQUESTS (' + requests.length + ') ---');
  requests.forEach(r => console.log(JSON.stringify({ id: r.id, reqNo: r.requestNumber, cust: r.customerName, status: r.status, items: r.items })));

  console.log('\n--- ALL QUOTES (' + quotes.length + ') ---');
  quotes.forEach(q => console.log(JSON.stringify({ id: q.id, quoteNo: q.quoteNumber, title: q.title, status: q.status })));

  console.log('\n--- ALL ORDERS (' + orders.length + ') ---');
  orders.forEach(o => console.log(JSON.stringify({ id: o.id, orderNo: o.orderNumber, status: o.status, custId: o.customerId })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
