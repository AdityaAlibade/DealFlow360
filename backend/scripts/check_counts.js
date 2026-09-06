const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function go() {
  const users = await p.user.count();
  const customers = await p.customer.count();
  const products = await p.product.count();
  const stock = await p.stockLevel.count();
  const quotes = await p.quotation.count();
  const approvals = await p.approval.count();
  const orders = await p.order.count();
  const invoices = await p.invoice.count();
  const subs = await p.subscription.count();
  const plans = await p.subscriptionPlan.count();

  const total = users + customers + products + stock + quotes + approvals + orders + invoices + subs + plans;

  console.log('\n=== LIVE DATABASE RECORD COUNTS ===');
  console.log('Users             :', users);
  console.log('Customers         :', customers);
  console.log('Products          :', products);
  console.log('Stock Levels      :', stock);
  console.log('Quotations        :', quotes);
  console.log('Approvals         :', approvals);
  console.log('Orders            :', orders);
  console.log('Invoices          :', invoices);
  console.log('Subscriptions     :', subs);
  console.log('Subscription Plans:', plans);
  console.log('-----------------------------------');
  console.log('TOTAL RECORDS     :', total);
  console.log('===================================\n');

  await p.$disconnect();
}

go().catch(e => { console.error(e.message); process.exit(1); });
