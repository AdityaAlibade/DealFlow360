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
  const backorders = await prisma.backorder.findMany();
  const subscriptions = await prisma.subscription.findMany();

  console.log('=== DB RECORD SUMMARY ===');
  console.log(`Users (${users.length}):`);
  users.forEach(u => console.log(`  - [${u.id}] ${u.name} <${u.email}> (${u.role})`));

  console.log(`\nCustomers (${customers.length}):`);
  customers.forEach(c => console.log(`  - [${c.id}] ${c.name} <${c.email}> (Company: ${c.companyName})`));

  console.log(`\nProducts (${products.length}):`);
  products.forEach(p => console.log(`  - [${p.id}] [${p.sku}] ${p.name} ($${p.unitPrice})`));

  console.log(`\nWarehouses (${warehouses.length}):`);
  warehouses.forEach(w => console.log(`  - [${w.id}] [${w.code}] ${w.name} (${w.city})`));

  console.log(`\nProduct Requests (${requests.length}):`);
  requests.forEach(r => console.log(`  - [${r.id}] [${r.requestNumber}] ${r.customerName} - ${r.status}`));

  console.log(`\nQuotations (${quotes.length}):`);
  quotes.forEach(q => console.log(`  - [${q.id}] [${q.quoteNumber}] ${q.title} - ${q.status}`));

  console.log(`\nOrders (${orders.length}):`);
  orders.forEach(o => console.log(`  - [${o.id}] [${o.orderNumber}] ${o.customerName} - ${o.status}`));

  console.log(`\nInvoices (${invoices.length}):`);
  invoices.forEach(i => console.log(`  - [${i.id}] [${i.invoiceNumber}] ${i.customerName} - ${i.status}`));

  console.log(`\nFulfillments (${fulfillments.length}):`);
  fulfillments.forEach(f => console.log(`  - [${f.id}] [${f.fulfillmentNumber}] Order:${f.orderId} - ${f.status}`));

  console.log(`\nBackorders (${backorders.length}):`);
  backorders.forEach(b => console.log(`  - [${b.id}] [${b.backorderNumber}] Product:${b.productId} - ${b.status}`));

  console.log(`\nSubscriptions (${subscriptions.length}):`);
  subscriptions.forEach(s => console.log(`  - [${s.id}] [${s.subscriptionNumber}] Customer:${s.customerId} - ${s.status}`));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
