const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  const customers = await prisma.customer.findMany();
  const products = await prisma.product.findMany();
  const warehouses = await prisma.warehouse.findMany();
  const requests = await prisma.productRequest.findMany();
  const quotes = await prisma.quotation.findMany();
  const orders = await prisma.order.findMany();
  const invoices = await prisma.invoice.findMany();
  const fulfillments = await prisma.fulfillment.findMany();
  const subscriptions = await prisma.subscription.findMany();

  console.log('=== USERS (' + users.length + ') ===');
  console.table(users.map(u => ({ id: u.id, email: u.email, name: u.fullName, role: u.role })));

  console.log('=== CUSTOMERS (' + customers.length + ') ===');
  console.table(customers.map(c => ({ id: c.id, name: c.name, email: c.email, company: c.companyName })));

  console.log('=== PRODUCTS (' + products.length + ') ===');
  console.table(products.map(p => ({ id: p.id, sku: p.sku, name: p.name, category: p.category, price: p.basePrice })));

  console.log('=== WAREHOUSES (' + warehouses.length + ') ===');
  console.table(warehouses.map(w => ({ id: w.id, code: w.code, name: w.name, location: w.location })));

  console.log('=== PRODUCT REQUESTS (' + requests.length + ') ===');
  console.table(requests.map(r => ({ id: r.id, reqNo: r.requestNumber, custId: r.customerId, status: r.status })));

  console.log('=== QUOTATIONS (' + quotes.length + ') ===');
  console.table(quotes.map(q => ({ id: q.id, quoteNo: q.quoteNumber, custId: q.customerId, status: q.status, total: q.totalAmount })));

  console.log('=== ORDERS (' + orders.length + ') ===');
  console.table(orders.map(o => ({ id: o.id, orderNo: o.orderNumber, custId: o.customerId, status: o.status, total: o.totalAmount })));

  console.log('=== INVOICES (' + invoices.length + ') ===');
  console.table(invoices.map(i => ({ id: i.id, invNo: i.invoiceNumber, status: i.status, total: i.totalAmount })));

  console.log('=== FULFILLMENTS (' + fulfillments.length + ') ===');
  console.table(fulfillments.map(f => ({ id: f.id, fulNo: f.fulfillmentNumber, status: f.status })));

  console.log('=== SUBSCRIPTIONS (' + subscriptions.length + ') ===');
  console.table(subscriptions.map(s => ({ id: s.id, contractNo: s.contractNumber, status: s.status })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
