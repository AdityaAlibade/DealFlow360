const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- ALL REQUESTS ---');
  const reqs = await prisma.productRequest.findMany({ include: { items: true }, orderBy: { createdAt: 'asc' } });
  reqs.forEach(r => console.log(r.id, r.requestNumber, r.customerId, r.status, JSON.stringify(r.items.map(i => ({ prod: i.productId, qty: i.quantity, price: i.targetPrice })))));

  console.log('\n--- ALL QUOTES ---');
  const quotes = await prisma.quotation.findMany({ include: { items: true }, orderBy: { createdAt: 'asc' } });
  quotes.forEach(q => console.log(q.id, q.quoteNumber, q.customerId, q.productRequestId, q.status, q.totalAmount));

  console.log('\n--- ALL ORDERS ---');
  const orders = await prisma.order.findMany({ include: { items: true, fulfillments: true }, orderBy: { createdAt: 'asc' } });
  orders.forEach(o => console.log(o.id, o.orderNumber, o.customerId, o.quotationId, o.status, o.totalAmount));

  console.log('\n--- ALL SUBSCRIPTIONS ---');
  const subs = await prisma.subscription.findMany({ orderBy: { createdAt: 'asc' } });
  subs.forEach(s => console.log(s.id, s.contractNumber, s.customerId, s.status));
}

main().catch(console.error).finally(() => prisma.$disconnect());
