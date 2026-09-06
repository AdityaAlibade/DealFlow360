const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function test() {
  const quotes = await prisma.quotation.findMany({
    include: { customer: true, items: { include: { product: true } } }
  });
  console.log('Quotes in DB:');
  quotes.forEach(q => {
    console.log(`- ${q.id} | ${q.quoteNumber} | status:${q.status} | portalToken:${q.portalToken} | cust:${q.customer?.name} | items:${q.items.map(i => `${i.product?.name} x${i.quantity}`).join(', ')}`);
  });
}
test().catch(console.error).finally(() => prisma.$disconnect());
