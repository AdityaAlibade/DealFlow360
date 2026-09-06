const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== USERS ===');
  const users = await prisma.user.findMany();
  console.table(users.map(u => ({ id: u.id, email: u.email, name: u.fullName, role: u.role })));

  console.log('=== CUSTOMERS ===');
  const customers = await prisma.customer.findMany();
  console.table(customers.map(c => ({ id: c.id, name: c.name, email: c.email, company: c.companyName })));

  console.log('=== PRODUCTS ===');
  const products = await prisma.product.findMany();
  console.table(products.map(p => ({ id: p.id, sku: p.sku, name: p.name, category: p.category, price: p.basePrice })));

  console.log('=== WAREHOUSES ===');
  const warehouses = await prisma.warehouse.findMany();
  console.table(warehouses.map(w => ({ id: w.id, code: w.code, name: w.name, location: w.location })));

  console.log('=== PRODUCT REQUESTS ===');
  const requests = await prisma.productRequest.findMany({ include: { items: true } });
  console.table(requests.map(r => ({ id: r.id, reqNo: r.requestNumber, custId: r.customerId, status: r.status, items: r.items.length })));

  console.log('=== QUOTATIONS ===');
  const quotes = await prisma.quotation.findMany({ include: { items: true } });
  console.table(quotes.map(q => ({ id: q.id, quoteNo: q.quoteNumber, custId: q.customerId, status: q.status, total: q.totalAmount })));

  console.log('=== ORDERS ===');
  const orders = await prisma.order.findMany({ include: { items: true } });
  console.table(orders.map(o => ({ id: o.id, orderNo: o.orderNumber, custId: o.customerId, quoteId: o.quotationId, status: o.status, total: o.totalAmount })));

  console.log('=== FULFILLMENTS ===');
  const fulfillments = await prisma.fulfillment.findMany();
  console.table(fulfillments.map(f => ({ id: f.id, fulNo: f.fulfillmentNumber, orderId: f.orderId, status: f.status })));

  console.log('=== INVOICES ===');
  const invoices = await prisma.invoice.findMany();
  console.table(invoices.map(i => ({ id: i.id, invNo: i.invoiceNumber, orderId: i.orderId, status: i.status, total: i.totalAmount })));

  console.log('=== SUBSCRIPTIONS ===');
  const subs = await prisma.subscription.findMany();
  console.table(subs.map(s => ({ id: s.id, contractNo: s.contractNumber, custId: s.customerId, status: s.status })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
