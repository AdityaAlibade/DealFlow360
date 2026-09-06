const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log('=== USERS ===', users.map(u => ({ id: u.id, email: u.email, name: u.name, role: u.role })));

  const stocks = await prisma.stock.findMany();
  console.log('=== STOCKS ===', stocks.length);
  const testStocks = stocks.filter(s => s.productId.includes('cmtp5') || s.warehouseId.includes('cmtp5'));
  console.log('Test Stocks:', testStocks.length);

  const testRequests = await prisma.productRequest.findMany({
    where: {
      OR: [
        { requestNumber: { startsWith: 'REQ-AUDIT' } },
        { customerName: { contains: 'Automated Audit' } }
      ]
    }
  });
  console.log('Test Requests:', testRequests.length);

  const testQuotes = await prisma.quotation.findMany({
    where: {
      OR: [
        { quoteNumber: { startsWith: 'Q-AUDIT' } },
        { title: { contains: 'Automated' } }
      ]
    }
  });
  console.log('Test Quotes:', testQuotes.length);

  const testOrders = await prisma.order.findMany({
    where: {
      OR: [
        { orderNumber: { startsWith: 'ORD-AUDIT' } },
        { customerName: { contains: 'Automated Audit' } }
      ]
    }
  });
  console.log('Test Orders:', testOrders.length);

  const testInvoices = await prisma.invoice.findMany({
    where: {
      OR: [
        { invoiceNumber: { startsWith: 'INV-AUDIT' } },
        { invoiceNumber: { contains: 'AUDIT' } }
      ]
    }
  });
  console.log('Test Invoices:', testInvoices.length);

  const testFulfillments = await prisma.fulfillment.findMany({
    where: {
      OR: [
        { fulfillmentNumber: { startsWith: 'FUL-AUDIT' } },
        { fulfillmentNumber: { contains: 'AUDIT' } }
      ]
    }
  });
  console.log('Test Fulfillments:', testFulfillments.length);

  // Check for duplicate orders/requests/quotations with same titles or duplicate references
  console.log('\n=== CHECKING DUPLICATE QUOTES & ORDERS & REQUESTS ===');
  const allQuotes = await prisma.quotation.findMany({ include: { items: true } });
  console.log('All Quotes count:', allQuotes.length);
  const allOrders = await prisma.order.findMany({ include: { items: true } });
  console.log('All Orders count:', allOrders.length);
  const allRequests = await prisma.productRequest.findMany();
  console.log('All Requests count:', allRequests.length);
}

main().catch(console.error).finally(() => prisma.$disconnect());
