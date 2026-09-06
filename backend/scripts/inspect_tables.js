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

  console.log('=== USERS ===');
  console.table(users.map(u => ({ id: u.id, email: u.email, name: u.name, role: u.role })));

  console.log('=== CUSTOMERS ===');
  console.table(customers.map(c => ({ id: c.id, name: c.name, email: c.email, company: c.companyName })));

  console.log('=== PRODUCTS ===');
  console.table(products.map(p => ({ id: p.id, sku: p.sku, name: p.name, price: p.unitPrice })));

  console.log('=== WAREHOUSES ===');
  console.table(warehouses.map(w => ({ id: w.id, code: w.code, name: w.name, city: w.city })));

  console.log('=== PRODUCT REQUESTS ===');
  console.table(requests.map(r => ({ id: r.id, reqNo: r.requestNumber, cust: r.customerName, status: r.status, estValue: r.estimatedValue })));

  console.log('=== QUOTATIONS ===');
  console.table(quotes.map(q => ({ id: q.id, quoteNo: q.quoteNumber, title: q.title, status: q.status, total: q.total })));

  console.log('=== ORDERS ===');
  console.table(orders.map(o => ({ id: o.id, orderNo: o.orderNumber, cust: o.customerName, status: o.status, total: o.total })));

  console.log('=== INVOICES ===');
  console.table(invoices.map(i => ({ id: i.id, invNo: i.invoiceNumber, status: i.status, total: i.totalAmount })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
