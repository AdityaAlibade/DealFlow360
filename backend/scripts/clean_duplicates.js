const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteOrdersHelper(orderIds) {
  if (!orderIds || orderIds.length === 0) return;

  // 1. Invoices
  await prisma.invoice.deleteMany({ where: { orderId: { in: orderIds } } });

  // 2. Backorder items & backorders
  const backorders = await prisma.backorder.findMany({ where: { orderId: { in: orderIds } }, select: { id: true } });
  const boIds = backorders.map(b => b.id);
  if (boIds.length > 0) {
    await prisma.backorderItem.deleteMany({ where: { backorderId: { in: boIds } } });
    await prisma.backorder.deleteMany({ where: { id: { in: boIds } } });
  }
  // Also delete any backorderItems pointing to order items of these orders
  const orderItems = await prisma.orderItem.findMany({ where: { orderId: { in: orderIds } }, select: { id: true } });
  const oiIds = orderItems.map(oi => oi.id);
  if (oiIds.length > 0) {
    await prisma.backorderItem.deleteMany({ where: { orderItemId: { in: oiIds } } });
    await prisma.fulfillmentItem.deleteMany({ where: { orderItemId: { in: oiIds } } });
  }

  // 3. Fulfillments
  const fulfillments = await prisma.fulfillment.findMany({ where: { orderId: { in: orderIds } }, select: { id: true } });
  const fIds = fulfillments.map(f => f.id);
  if (fIds.length > 0) {
    await prisma.fulfillmentItem.deleteMany({ where: { fulfillmentId: { in: fIds } } });
    await prisma.fulfillmentSplit.deleteMany({ where: { fulfillmentId: { in: fIds } } });
    await prisma.fulfillment.deleteMany({ where: { id: { in: fIds } } });
  }

  // 4. Order items
  await prisma.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });

  // 5. Orders
  await prisma.order.deleteMany({ where: { id: { in: orderIds } } });
}

async function deleteQuotationsHelper(quoteIds) {
  if (!quoteIds || quoteIds.length === 0) return;

  // Find linked orders first and delete them
  const linkedOrders = await prisma.order.findMany({ where: { quotationId: { in: quoteIds } }, select: { id: true } });
  if (linkedOrders.length > 0) {
    await deleteOrdersHelper(linkedOrders.map(o => o.id));
  }

  // Delete invoices referencing quotation
  await prisma.invoice.deleteMany({ where: { quotationId: { in: quoteIds } } });

  // Delete fulfillments referencing quotation
  const fList = await prisma.fulfillment.findMany({ where: { quotationId: { in: quoteIds } }, select: { id: true } });
  if (fList.length > 0) {
    const fIds = fList.map(f => f.id);
    await prisma.fulfillmentItem.deleteMany({ where: { fulfillmentId: { in: fIds } } });
    await prisma.fulfillmentSplit.deleteMany({ where: { fulfillmentId: { in: fIds } } });
    await prisma.fulfillment.deleteMany({ where: { id: { in: fIds } } });
  }

  // Delete subscriptions referencing quotation
  await prisma.subscription.deleteMany({ where: { quotationId: { in: quoteIds } } });

  // Delete negotiations
  await prisma.negotiation.deleteMany({ where: { quotationId: { in: quoteIds } } });

  // Delete approvals
  await prisma.approval.deleteMany({ where: { quotationId: { in: quoteIds } } });

  // Delete alerts
  await prisma.dealHealthAlert.deleteMany({ where: { quotationId: { in: quoteIds } } });

  // Delete items
  await prisma.quotationItem.deleteMany({ where: { quotationId: { in: quoteIds } } });

  // Delete quotations
  await prisma.quotation.deleteMany({ where: { id: { in: quoteIds } } });
}

async function deleteProductRequestsHelper(reqIds) {
  if (!reqIds || reqIds.length === 0) return;

  // Unlink or delete linked quotations
  const linkedQuotes = await prisma.quotation.findMany({ where: { productRequestId: { in: reqIds } }, select: { id: true } });
  if (linkedQuotes.length > 0) {
    await deleteQuotationsHelper(linkedQuotes.map(q => q.id));
  }

  // Delete items
  await prisma.productRequestItem.deleteMany({ where: { requestId: { in: reqIds } } });

  // Delete request
  await prisma.productRequest.deleteMany({ where: { id: { in: reqIds } } });
}

async function main() {
  console.log('--- STARTING DATABASE DUPLICATE CLEANUP ---');

  // 1. DELETE AUDIT TEST ARTIFACTS
  console.log('\n[1/5] Removing Audit Test Records...');

  // Test Orders
  const auditOrders = await prisma.order.findMany({
    where: {
      OR: [
        { orderNumber: { contains: 'AUDIT' } },
        { customer: { name: { contains: 'Automated Audit' } } }
      ]
    },
    select: { id: true }
  });
  if (auditOrders.length > 0) {
    await deleteOrdersHelper(auditOrders.map(o => o.id));
    console.log(`- Deleted ${auditOrders.length} test orders`);
  }

  // Test Quotes
  const auditQuotes = await prisma.quotation.findMany({
    where: {
      OR: [
        { quoteNumber: { contains: 'AUDIT' } },
        { customer: { name: { contains: 'Automated Audit' } } }
      ]
    },
    select: { id: true }
  });
  if (auditQuotes.length > 0) {
    await deleteQuotationsHelper(auditQuotes.map(q => q.id));
    console.log(`- Deleted ${auditQuotes.length} test quotes`);
  }

  // Test Product Requests
  const auditRequests = await prisma.productRequest.findMany({
    where: {
      OR: [
        { requestNumber: { contains: 'AUDIT' } },
        { customer: { name: { contains: 'Automated Audit' } } }
      ]
    },
    select: { id: true }
  });
  if (auditRequests.length > 0) {
    await deleteProductRequestsHelper(auditRequests.map(r => r.id));
    console.log(`- Deleted ${auditRequests.length} test requests`);
  }

  // Test Customers
  const auditCustomers = await prisma.customer.findMany({
    where: {
      OR: [
        { name: { contains: 'Automated Audit' } },
        { email: { contains: 'audit.customer' } }
      ]
    },
    select: { id: true }
  });
  if (auditCustomers.length > 0) {
    await prisma.customer.deleteMany({ where: { id: { in: auditCustomers.map(c => c.id) } } });
    console.log(`- Deleted ${auditCustomers.length} test customers`);
  }

  // Test Products
  const auditProducts = await prisma.product.findMany({
    where: {
      OR: [
        { sku: { startsWith: 'SKU-AUDIT-' } },
        { name: { contains: 'Enterprise Cloud Node' } }
      ]
    },
    select: { id: true }
  });
  if (auditProducts.length > 0) {
    const pIds = auditProducts.map(p => p.id);
    await prisma.stockLevel.deleteMany({ where: { productId: { in: pIds } } });
    await prisma.product.deleteMany({ where: { id: { in: pIds } } });
    console.log(`- Deleted ${auditProducts.length} test products`);
  }

  // Test Warehouses
  const auditWarehouses = await prisma.warehouse.findMany({
    where: {
      OR: [
        { code: { startsWith: 'WH-TEST-' } },
        { name: { contains: 'Automated Test Depot' } }
      ]
    },
    select: { id: true }
  });
  if (auditWarehouses.length > 0) {
    const wIds = auditWarehouses.map(w => w.id);
    await prisma.stockLevel.deleteMany({ where: { warehouseId: { in: wIds } } });
    await prisma.warehouse.deleteMany({ where: { id: { in: wIds } } });
    console.log(`- Deleted ${auditWarehouses.length} test warehouses`);
  }

  // 2. CLEAN DUPLICATE CLONED ORDERS & FULFILLMENTS
  console.log('\n[2/5] Cleaning duplicate cloned orders...');
  const duplicateOrderNumbers = [
    'ORD-2026-1011', 'ORD-2026-1012', 'ORD-2026-1013', 'ORD-2026-1014', 'ORD-2026-1015', 'ORD-2026-1016', 'ORD-2026-1017',
    'ORD-2026-1018', 'ORD-2026-1019', 'ORD-2026-1020', 'ORD-2026-1021', 'ORD-2026-1022', 'ORD-2026-1023', 'ORD-2026-1024',
    'ORD-2026-1025', 'ORD-2026-1026', 'ORD-2026-1027', 'ORD-2026-1028', 'ORD-2026-1029', 'ORD-2026-1030', 'ORD-2026-1031',
    'ORD-2026-1032', 'ORD-2026-1033', 'ORD-2026-1034', 'ORD-2026-1035', 'ORD-2026-1038'
  ];
  const duplicateOrders = await prisma.order.findMany({
    where: { orderNumber: { in: duplicateOrderNumbers } },
    select: { id: true }
  });
  if (duplicateOrders.length > 0) {
    await deleteOrdersHelper(duplicateOrders.map(o => o.id));
    console.log(`- Deleted ${duplicateOrders.length} duplicate orders`);
  }

  // 3. CLEAN DUPLICATE CLONED QUOTATIONS & REQUESTS
  console.log('\n[3/5] Cleaning duplicate cloned quotations and product requests...');
  const duplicateQuoteNumbers = [
    'Q-2026-1005', 'Q-2026-1006', 'Q-2026-1007', 'Q-2026-1008', 'Q-2026-1009', 'Q-2026-1010',
    'Q-2026-1011', 'Q-2026-1012', 'Q-2026-1013', 'Q-2026-1014', 'Q-2026-1015', 'Q-2026-1020'
  ];
  const duplicateQuotes = await prisma.quotation.findMany({
    where: { quoteNumber: { in: duplicateQuoteNumbers } },
    select: { id: true }
  });
  if (duplicateQuotes.length > 0) {
    await deleteQuotationsHelper(duplicateQuotes.map(q => q.id));
    console.log(`- Deleted ${duplicateQuotes.length} duplicate quotations`);
  }

  const duplicateRequestNumbers = [
    'REQ-2026-1003', 'REQ-2026-1004', 'REQ-2026-1005', 'REQ-2026-1006', 'REQ-2026-1007', 'REQ-2026-1008',
    'REQ-2026-1010', 'REQ-2026-1011', 'REQ-2026-1012', 'REQ-2026-1013', 'REQ-2026-1014', 'REQ-2026-1019'
  ];
  const duplicateRequests = await prisma.productRequest.findMany({
    where: { requestNumber: { in: duplicateRequestNumbers } },
    select: { id: true }
  });
  if (duplicateRequests.length > 0) {
    await deleteProductRequestsHelper(duplicateRequests.map(r => r.id));
    console.log(`- Deleted ${duplicateRequests.length} duplicate requests`);
  }

  // 4. CLEAN DUPLICATE SUBSCRIPTIONS
  console.log('\n[4/5] Cleaning duplicate subscriptions...');
  const duplicateSubs = await prisma.subscription.findMany({
    where: { contractNumber: { in: ['SUB-2026-1002', 'SUB-2026-1003', 'SUB-2026-1004'] } },
    select: { id: true }
  });
  if (duplicateSubs.length > 0) {
    await prisma.subscription.deleteMany({ where: { id: { in: duplicateSubs.map(s => s.id) } } });
    console.log(`- Deleted ${duplicateSubs.length} duplicate subscriptions`);
  }

  // 5. CLEAN REDUNDANT TEST USERS
  console.log('\n[5/5] Cleaning redundant test user accounts...');
  const testUsers = await prisma.user.findMany({
    where: {
      email: {
        in: [
          'admin.test@dealflow360.com',
          'salesmanager.test@dealflow360.com',
          'salesrep.test@dealflow360.com',
          'financemanager.test@dealflow360.com',
          'customer.test@example.com'
        ]
      }
    },
    select: { id: true }
  });
  if (testUsers.length > 0) {
    await prisma.user.deleteMany({ where: { id: { in: testUsers.map(u => u.id) } } });
    console.log(`- Deleted ${testUsers.length} redundant test user accounts`);
  }

  console.log('\n============================================================');
  console.log('✔ DATABASE CLEANUP COMPLETED SUCCESSFULLY');
  console.log('============================================================\n');
}

main()
  .catch((e) => {
    console.error('Error during cleanup:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
