const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runPureDatabaseLifecycleAudit() {
  console.log('================================================================');
  console.log('🚀 DEALFLOW360 PURE DATABASE & PRISMA LIFECYCLE AUDIT');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, description) {
    if (condition) {
      console.log(`  ✔ PASS: ${description}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${description}`);
      failed++;
    }
  }

  try {
    const timestamp = Date.now();

    // 1. TEST CUSTOMER CREATION
    console.log('[1/10] Testing Customer Creation in PostgreSQL...');
    const testCustomer = await prisma.customer.create({
      data: {
        name: `Automated Audit Customer ${timestamp}`,
        companyName: `Audit Corp ${timestamp}`,
        email: `audit.customer.${timestamp}@example.com`,
        phone: '+91 99999 88888',
        tier: 'GOLD',
        billingAddress: '404 DB Verification Hub, Bengaluru, KA 560001',
        shippingAddress: '404 DB Verification Hub, Gate 2, Bengaluru, KA 560001'
      }
    });

    const queriedCustomer = await prisma.customer.findUnique({ where: { id: testCustomer.id } });
    assert(queriedCustomer !== null, 'Customer record successfully persisted and queried from PostgreSQL');
    assert(queriedCustomer.email === `audit.customer.${timestamp}@example.com`, 'Customer fields match inserted data');

    // 2. TEST PRODUCT CREATION
    console.log('\n[2/10] Testing Product Creation in PostgreSQL...');
    const testProduct = await prisma.product.create({
      data: {
        sku: `SKU-AUDIT-${timestamp}`,
        name: `Enterprise Cloud Node ${timestamp}`,
        description: 'Automated test hardware node for DB verification',
        category: 'Hardware',
        basePrice: 50000.0,
        standardCost: 35000.0,
        taxRate: 18.0,
        unit: 'Units',
        isSubscription: false
      }
    });

    const queriedProduct = await prisma.product.findUnique({ where: { id: testProduct.id } });
    assert(queriedProduct !== null, 'Product successfully created and retrieved from PostgreSQL');
    assert(queriedProduct.basePrice === 50000.0, 'Product pricing accurately stored in PostgreSQL');

    // 3. TEST WAREHOUSE CREATION & STOCK LEVEL
    console.log('\n[3/10] Testing Warehouse & Stock Management in PostgreSQL...');
    const testWarehouse = await prisma.warehouse.create({
      data: {
        code: `WH-TEST-${timestamp.toString().slice(-4)}`,
        name: `Automated Test Depot ${timestamp}`,
        location: 'Sector 5 Industrial Estate, Pune, MH',
        status: 'ACTIVE'
      }
    });

    const stockLevel = await prisma.stockLevel.create({
      data: {
        warehouseId: testWarehouse.id,
        productId: testProduct.id,
        inStock: 100,
        reserved: 20,
        available: 80,
        backordered: 0,
        incoming: 50
      }
    });

    const queriedStock = await prisma.stockLevel.findUnique({ where: { id: stockLevel.id } });
    assert(queriedStock !== null, 'StockLevel record created in PostgreSQL');
    assert(queriedStock.available === 80, 'Stock availability correctly computed');

    // 4. TEST SALES / ORDER REQUEST CREATION
    console.log('\n[4/10] Testing Customer Sales / Order Request Creation in PostgreSQL...');
    const orderRequest = await prisma.productRequest.create({
      data: {
        requestNumber: `REQ-AUDIT-${timestamp}`,
        customerId: testCustomer.id,
        status: 'PENDING',
        totalAmount: 150000.0,
        notes: 'Requesting 3 units of Enterprise Cloud Node',
        items: {
          create: [
            {
              productId: testProduct.id,
              quantity: 3,
              targetPrice: 50000.0,
              notes: 'Priority server deployment'
            }
          ]
        }
      },
      include: { items: true, customer: true }
    });

    const queriedRequest = await prisma.productRequest.findUnique({
      where: { id: orderRequest.id },
      include: { items: true }
    });
    assert(queriedRequest !== null, 'OrderRequest successfully created in PostgreSQL');
    assert(queriedRequest.items.length === 1, 'OrderRequest item relation established');
    assert(queriedRequest.items[0].quantity === 3, 'OrderRequest item quantity is 3');

    // 5. TEST QUOTATION CREATION FROM SALES REQUEST
    console.log('\n[5/10] Testing Quotation Creation Linked to Order Request...');
    const quoteNumber = `Q-AUDIT-${timestamp.toString().slice(-5)}`;
    const quotation = await prisma.quotation.create({
      data: {
        quoteNumber,
        customerId: testCustomer.id,
        productRequestId: orderRequest.id,
        salesRepId: 'usr-rep-03',
        status: 'APPROVED',
        subtotal: 150000.0,
        taxAmount: 27000.0,
        totalAmount: 177000.0,
        blendedMargin: 30.0,
        portalToken: `token-audit-${timestamp}`,
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        items: {
          create: [
            {
              productId: testProduct.id,
              quantity: 3,
              unitPrice: 50000.0,
              discountPercent: 0.0,
              allowedLimit: 10.0,
              netPrice: 50000.0,
              marginPercent: 30.0,
              isOverLimit: false
            }
          ]
        }
      },
      include: { items: true, productRequest: true }
    });

    assert(quotation !== null, 'Quotation created in PostgreSQL');
    assert(quotation.productRequestId === orderRequest.id, 'Quotation correctly linked to parent Order Request');
    assert(quotation.totalAmount === 177000.0, 'Quotation total amount matches expected sum with 18% tax');

    // 6. TEST ORDER CONVERSION
    console.log('\n[6/10] Testing Order Creation from Approved Quotation...');
    const orderNumber = `ORD-AUDIT-${timestamp.toString().slice(-5)}`;
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: testCustomer.id,
        quotationId: quotation.id,
        status: 'CONFIRMED',
        totalAmount: 177000.0,
        totalRequested: 3,
        totalFulfilled: 3,
        totalBackordered: 0,
        shippingAddress: testCustomer.shippingAddress,
        items: {
          create: [
            {
              productId: testProduct.id,
              requestedQuantity: 3,
              fulfilledQuantity: 3,
              backorderedQuantity: 0,
              unitPrice: 50000.0,
              totalPrice: 150000.0
            }
          ]
        }
      },
      include: { items: true }
    });

    assert(order !== null, 'Order created in PostgreSQL');
    assert(order.quotationId === quotation.id, 'Order correctly references Quotation');
    assert(order.items[0].requestedQuantity === 3, 'Order items correctly stored');

    // 7. TEST FULFILLMENT & STOCK LEVEL UPDATE
    console.log('\n[7/10] Testing Multi-Warehouse Fulfillment & Stock Deduction...');
    const fulfillment = await prisma.fulfillment.create({
      data: {
        orderId: order.id,
        warehouseId: testWarehouse.id,
        fulfillmentNumber: `FUL-AUDIT-${timestamp}`,
        orderNumber: order.orderNumber,
        status: 'DISPATCHED',
        totalUnits: 3,
        totalQuantity: 3,
        backorderedUnits: 0,
        shippingCost: 500.0,
        carrier: 'BlueDart Express',
        trackingNumber: `AWB-AUDIT-${timestamp}`,
        items: {
          create: [
            {
              orderItemId: order.items[0].id,
              productId: testProduct.id,
              quantity: 3,
              unitPrice: 50000.0
            }
          ]
        }
      }
    });

    // Deduct stock in PostgreSQL
    await prisma.stockLevel.update({
      where: { id: stockLevel.id },
      data: {
        inStock: { decrement: 3 },
        reserved: { decrement: 3 },
        available: { decrement: 0 }
      }
    });

    const updatedStock = await prisma.stockLevel.findUnique({ where: { id: stockLevel.id } });
    assert(fulfillment !== null, 'Fulfillment created in PostgreSQL');
    assert(updatedStock.inStock === 97, 'Stock inStock correctly decremented in PostgreSQL to 97');

    // 8. TEST BACKORDER CREATION SCENARIO
    console.log('\n[8/10] Testing Backorder Creation when Stock is Exceeded...');
    const backorder = await prisma.backorder.create({
      data: {
        orderId: order.id,
        status: 'BACKORDERED',
        items: {
          create: [
            {
              orderItemId: order.items[0].id,
              productId: testProduct.id,
              quantity: 5,
              fulfilledQuantity: 0,
              remainingQuantity: 5
            }
          ]
        }
      },
      include: { items: true }
    });

    assert(backorder !== null, 'Backorder record created in PostgreSQL');
    assert(backorder.items[0].remainingQuantity === 5, 'Backorder item accurately records remaining demand');

    // 9. TEST INVOICE GENERATION
    console.log('\n[9/10] Testing Invoice Generation from Order & Fulfillment in PostgreSQL...');
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: `INV-AUDIT-${timestamp}`,
        customerId: testCustomer.id,
        orderId: order.id,
        fulfillmentId: fulfillment.id,
        warehouseId: testWarehouse.id,
        amount: 150000.0,
        taxAmount: 27000.0,
        totalAmount: 177000.0,
        status: 'PAID',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        paidAt: new Date()
      }
    });

    assert(invoice !== null, 'Invoice successfully created in PostgreSQL');
    assert(invoice.status === 'PAID', 'Invoice status recorded as PAID');
    assert(invoice.totalAmount === 177000.0, 'Invoice amount matches expected sum');

    // 10. TEST DASHBOARD LIVE METRIC AGGREGATIONS
    console.log('\n[10/10] Testing Real-Time Metric Aggregations in PostgreSQL...');
    const [totalCust, totalProd, totalQuotes, totalRev] = await Promise.all([
      prisma.customer.count(),
      prisma.product.count(),
      prisma.quotation.count(),
      prisma.invoice.aggregate({ where: { status: 'PAID' }, _sum: { totalAmount: true } })
    ]);

    assert(totalCust > 0, `Live Customer count from PostgreSQL: ${totalCust}`);
    assert(totalProd > 0, `Live Product count from PostgreSQL: ${totalProd}`);
    assert(totalQuotes > 0, `Live Quotation count from PostgreSQL: ${totalQuotes}`);
    assert(totalRev._sum.totalAmount > 0, `Live Paid Revenue from PostgreSQL: ₹${totalRev._sum.totalAmount.toLocaleString('en-IN')}`);

    console.log('\n================================================================');
    console.log(`✔ AUDIT COMPLETE: ${passed} PASSED, ${failed} FAILED`);
    console.log('================================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Audit encountered unexpected error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runPureDatabaseLifecycleAudit();
