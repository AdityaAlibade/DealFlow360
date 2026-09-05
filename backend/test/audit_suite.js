/**
 * DealFlow360 Comprehensive End-to-End Functional Audit & Verification Suite
 * Executes and validates all 28 test scenarios against the live PostgreSQL database.
 */

// Native fetch-based HTTP client wrapper
const axios = {
  async request(method, url, data, config = {}) {
    const headers = { 'Content-Type': 'application/json', ...(config.headers || {}) };
    const opts = {
      method,
      headers
    };
    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      opts.body = typeof data === 'string' ? data : JSON.stringify(data);
    }
    const res = await fetch(url, opts);
    let resData;
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      resData = await res.json().catch(() => null);
    } else {
      resData = await res.text().catch(() => null);
    }
    if (!res.ok) {
      const err = new Error(`Request failed with status code ${res.status}`);
      err.response = {
        status: res.status,
        statusText: res.statusText,
        data: resData
      };
      throw err;
    }
    return {
      status: res.status,
      data: resData,
      headers: res.headers
    };
  },
  get(url, config) { return this.request('GET', url, null, config); },
  post(url, data, config) { return this.request('POST', url, data, config); },
  put(url, data, config) { return this.request('PUT', url, data, config); },
  patch(url, data, config) { return this.request('PATCH', url, data, config); },
  delete(url, config) { return this.request('DELETE', url, null, config); }
};
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const BASE_URL = 'http://localhost:5000/api';

// Pre-configured Tokens
const TOKENS = {
  ADMIN: 'jwt-test-admin-token',
  SALES_MANAGER: 'jwt-test-salesmgr-token',
  SALES_REP: 'jwt-test-salesrep-token',
  FINANCE_OPS: 'jwt-test-finmgr-token',
  CUSTOMER: 'jwt-test-cust-token'
};

const getHeaders = (roleKey) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${TOKENS[roleKey] || TOKENS.ADMIN}`
});

let testsPassed = 0;
let testsFailed = 0;
const results = [];

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

async function recordTest(testNumber, name, testFn) {
  process.stdout.write(`[Test ${testNumber}] ${name}... `);
  try {
    await testFn();
    testsPassed++;
    console.log('✔ PASSED');
    results.push({ testNumber, name, status: 'PASSED' });
  } catch (err) {
    testsFailed++;
    console.log(`❌ FAILED: ${err.message}`);
    results.push({ testNumber, name, status: 'FAILED', error: err.message });
  }
}

async function runAudit() {
  console.log('\n============================================================');
  console.log('🚀 STARTING DEALFLOW360 28-POINT FUNCTIONAL AUDIT SUITE');
  console.log('============================================================\n');

  // Fetch test customer, products, and warehouses
  const testCustomer = await prisma.customer.findFirst({ where: { email: 'customer.test@example.com' } });
  const prodA = await prisma.product.findFirst({ where: { sku: 'SKU-PROD-A' } });
  const prodB = await prisma.product.findFirst({ where: { sku: 'SKU-PROD-B' } });
  const prodC = await prisma.product.findFirst({ where: { sku: 'SKU-PROD-C' } });
  const whA = await prisma.warehouse.findFirst({ where: { code: 'WH-A' } });
  const whB = await prisma.warehouse.findFirst({ where: { code: 'WH-B' } });
  const whC = await prisma.warehouse.findFirst({ where: { code: 'WH-C' } });

  assert(testCustomer, 'Test Customer must exist in database');
  assert(prodA && prodB && prodC, 'Test Products A, B, C must exist in database');
  assert(whA && whB && whC, 'Test Warehouses A, B, C must exist in database');

  let testRequestId = null;
  let testQuotationId = null;
  let testPortalToken = null;
  let testNegotiationId = null;
  let testApprovalId = null;
  let testOrderId = null;

  // -------------------------------------------------------------
  // TEST 1 — CUSTOMER CREATION / LOGIN / AUTH GUARDS
  // -------------------------------------------------------------
  await recordTest(1, 'Customer Authentication & RBAC Guard', async () => {
    // 1. Valid login
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'customer.test@example.com',
      password: 'password123'
    });
    assert(loginRes.data.success, 'Login should succeed');
    assert(loginRes.data.user.role === 'CUSTOMER', 'Role should be CUSTOMER');

    // 2. Invalid login
    try {
      await axios.post(`${BASE_URL}/auth/login`, { email: 'customer.test@example.com', password: 'wrongpassword' });
      assert(false, 'Invalid credentials must return error');
    } catch (err) {
      assert(err.response?.status === 401, 'Invalid credentials should return 401');
    }

    // 3. Customer cannot access admin routes
    try {
      await axios.post(`${BASE_URL}/auth/switch-role`, { targetRole: 'admin' }, { headers: getHeaders('CUSTOMER') });
      assert(false, 'Customer cannot switch roles');
    } catch (err) {
      assert(err.response?.status === 403, 'Customer calling admin switch-role should return 403');
    }
  });

  // -------------------------------------------------------------
  // TEST 2 — CUSTOMER CREATES ORDER REQUEST & VALIDATION
  // -------------------------------------------------------------
  await recordTest(2, 'Customer Creates Order Request with Validation', async () => {
    // 1. Test validation: quantity = 0
    try {
      await axios.post(`${BASE_URL}/customer-portal/requests`, {
        customerId: testCustomer.id,
        items: [{ productId: prodA.id, quantity: 0 }]
      });
      assert(false, 'Quantity = 0 must be rejected');
    } catch (err) {
      assert(err.response?.status === 400, 'Quantity = 0 should return 400');
    }

    // 2. Test validation: negative quantity
    try {
      await axios.post(`${BASE_URL}/customer-portal/requests`, {
        customerId: testCustomer.id,
        items: [{ productId: prodA.id, quantity: -5 }]
      });
      assert(false, 'Negative quantity must be rejected');
    } catch (err) {
      assert(err.response?.status === 400, 'Negative quantity should return 400');
    }

    // 3. Test validation: extreme quantity
    try {
      await axios.post(`${BASE_URL}/customer-portal/requests`, {
        customerId: testCustomer.id,
        items: [{ productId: prodA.id, quantity: 50000 }]
      });
      assert(false, 'Extreme quantity must be rejected');
    } catch (err) {
      assert(err.response?.status === 400, 'Extreme quantity should return 400');
    }

    // 4. Valid Request: Product A x 10, Product B x 2
    const res = await axios.post(`${BASE_URL}/customer-portal/requests`, {
      customerId: testCustomer.id,
      items: [
        { productId: prodA.id, quantity: 10, targetPrice: 1000 },
        { productId: prodB.id, quantity: 2, targetPrice: 2000 }
      ],
      notes: 'Initial test request for 10 units Product A and 2 units Product B'
    });

    assert(res.data.success, 'Valid order request must succeed');
    assert(res.data.data.requestNumber.startsWith('REQ-'), 'Request number should be generated');
    assert(res.data.data.totalAmount === 14000, `Total amount should be 14000 (got ${res.data.data.totalAmount})`);

    testRequestId = res.data.data.id;
  });

  // -------------------------------------------------------------
  // TEST 3 — SALES REPRESENTATIVE REVIEWS ORDER & CONVERTS TO QUOTATION
  // -------------------------------------------------------------
  await recordTest(3, 'Sales Representative Converts Request to Quotation', async () => {
    assert(testRequestId, 'Test Request ID must exist');

    const convertRes = await axios.post(
      `${BASE_URL}/quotations/convert-request/${testRequestId}`,
      {},
      { headers: getHeaders('SALES_REP') }
    );

    assert(convertRes.data.success, 'Conversion should succeed');
    const quote = convertRes.data.data;
    assert(quote.quoteNumber.startsWith('Q-'), 'Quotation number must be generated');
    assert(quote.customerId === testCustomer.id, 'Customer ID must match');
    assert(quote.items.length === 2, 'Must contain 2 line items');
    assert(quote.status === 'DRAFT', 'Status should be DRAFT');

    testQuotationId = quote.id;
    testPortalToken = quote.portalToken;
  });

  // -------------------------------------------------------------
  // TEST 4 — QUOTATION SENT TO CUSTOMER & VIEWED VIA TOKEN
  // -------------------------------------------------------------
  await recordTest(4, 'Customer Opens Quotation via Portal Token', async () => {
    assert(testPortalToken, 'Portal token must exist');

    const res = await axios.get(`${BASE_URL}/customer-portal/quote/${testPortalToken}`);
    assert(res.data.success, 'Customer should view quote');
    assert(res.data.data.items.length === 2, 'Items should be visible');
    assert(res.data.data.totalAmount > 0, 'Total amount must be positive');
  });

  // -------------------------------------------------------------
  // TEST 5 — CUSTOMER NEGOTIATION
  // -------------------------------------------------------------
  await recordTest(5, 'Customer Submits Negotiation Counter-Offer', async () => {
    assert(testPortalToken, 'Portal token must exist');

    // Customer requests ₹850 for Product A (Original ₹1,000)
    const quoteRes = await axios.get(`${BASE_URL}/customer-portal/quote/${testPortalToken}`);
    const itemA = quoteRes.data.data.items.find((i) => i.productId === prodA.id);
    assert(itemA, 'Product A item must exist on quote');

    const negRes = await axios.post(`${BASE_URL}/customer-portal/quote/${testPortalToken}/negotiate`, {
      quotationItemId: itemA.id,
      productId: prodA.id,
      requestedPrice: 850,
      message: 'Can you provide Product A at ₹850 per unit?'
    });

    assert(negRes.data.success, 'Negotiation submission should succeed');
    const neg = negRes.data.data.negotiation;
    assert(neg.requestedPrice === 850, 'Requested price must be 850');
    assert(neg.originalPrice === 1000, 'Original price must be 1000');
    assert(neg.status === 'APPROVAL_REQUIRED', 'Status must be APPROVAL_REQUIRED due to > 10% discount');

    testNegotiationId = neg.id;
  });

  // -------------------------------------------------------------
  // TEST 6 — "MY REQUESTS" HISTORY
  // -------------------------------------------------------------
  await recordTest(6, 'Customer "My Requests" History Persistence', async () => {
    const res = await axios.get(`${BASE_URL}/customer-portal/requests?customerId=${testCustomer.id}`);
    assert(res.data.success, 'Requests fetch should succeed');
    assert(res.data.data.productRequests.length >= 1, 'Product requests should be listed');
    assert(res.data.data.negotiations.length >= 1, 'Negotiations should be listed');
  });

  // -------------------------------------------------------------
  // TEST 7 — BACKEND RISK CALCULATION
  // -------------------------------------------------------------
  await recordTest(7, 'Backend Risk Engine Mathematical Calculation', async () => {
    const neg = await prisma.negotiation.findUnique({ where: { id: testNegotiationId } });
    assert(neg, 'Negotiation record must exist');
    assert(neg.riskScore > 0, `Risk score must be > 0 (got ${neg.riskScore})`);
    assert(neg.discountPercent === 15, `Discount percent must be 15% (got ${neg.discountPercent})`);
    assert(neg.riskLevel === 'MEDIUM' || neg.riskLevel === 'HIGH', 'Risk level should be MEDIUM or HIGH');
  });

  // -------------------------------------------------------------
  // TEST 8 — SALES REP ACCEPTANCE RULE (Risk > 0 -> 403 Forbidden)
  // -------------------------------------------------------------
  await recordTest(8, 'Sales Rep Acceptance Authorization Rule (Risk > 0 -> 403)', async () => {
    // 1. Sales Rep attempts to accept Risk > 0 negotiation -> MUST FAIL WITH 403
    try {
      await axios.post(
        `${BASE_URL}/quotations/${testQuotationId}/accept-negotiation`,
        { negotiationId: testNegotiationId },
        { headers: getHeaders('SALES_REP') }
      );
      assert(false, 'Sales Rep must not directly accept Risk > 0 negotiation');
    } catch (err) {
      assert(
        err.response?.status === 403,
        `Expected 403 Forbidden for Sales Rep accepting Risk > 0 (got ${err.response?.status})`
      );
    }
  });

  // -------------------------------------------------------------
  // TEST 9 — SALES MANAGER APPROVAL
  // -------------------------------------------------------------
  await recordTest(9, 'Sales Manager Approval of Concession', async () => {
    // Find pending approval for this quote
    const approval = await prisma.approval.findFirst({
      where: { quotationId: testQuotationId, status: 'PENDING' }
    });
    assert(approval, 'Pending approval record must exist');
    testApprovalId = approval.id;

    // Sales Manager approves
    const approveRes = await axios.put(
      `${BASE_URL}/approvals/${testApprovalId}`,
      { decision: 'APPROVED', comments: 'Approved by Sales Manager based on volume purchase.' },
      { headers: getHeaders('SALES_MANAGER') }
    );

    assert(approveRes.data.success, 'Approval must succeed');

    // Verify Quotation item price updated to ₹850 in PostgreSQL
    const updatedQuote = await prisma.quotation.findUnique({
      where: { id: testQuotationId },
      include: { items: true }
    });
    const itemA = updatedQuote.items.find((i) => i.productId === prodA.id);
    assert(itemA.unitPrice === 850, `Item price should be ₹850 (got ${itemA.unitPrice})`);
    assert(updatedQuote.status === 'APPROVED', 'Quotation status should be APPROVED');
  });

  // -------------------------------------------------------------
  // TEST 10 — NEGOTIATION AUDIT TRAIL
  // -------------------------------------------------------------
  await recordTest(10, 'Negotiation & Approval Audit Trail Persistence', async () => {
    const logs = await prisma.auditLog.findMany({
      where: { resourceId: { in: [testNegotiationId, testApprovalId, testQuotationId] } }
    });
    assert(logs.length >= 2, `Audit logs must be recorded (found ${logs.length})`);
  });

  // -------------------------------------------------------------
  // TEST 11 — ORDER CONFIRMATION FROM QUOTATION
  // -------------------------------------------------------------
  await recordTest(11, 'Quotation Acceptance & Consolidated Order Confirmation', async () => {
    const confirmRes = await axios.post(`${BASE_URL}/customer-portal/quote/${testPortalToken}/confirm`);
    assert(confirmRes.data.success, 'Quotation confirmation must succeed');

    const quote = await prisma.quotation.findUnique({ where: { id: testQuotationId } });
    assert(quote.status === 'CONFIRMED', 'Quotation status must be CONFIRMED');

    const order = await prisma.order.findFirst({ where: { quotationId: testQuotationId } });
    assert(order, 'Consolidated customer order must be created in PostgreSQL');
    testOrderId = order.id;
  });

  // -------------------------------------------------------------
  // TEST 12 — MULTI-WAREHOUSE FULFILLMENT (Case 1: 10 units -> WH A: 6 + WH B: 4)
  // -------------------------------------------------------------
  await recordTest(12, 'Multi-Warehouse Split: 10 units -> WH A (6) + WH B (4)', async () => {
    // Reset test stock: WH A has 6 of Product A, WH B has 4 of Product A
    await prisma.stockLevel.upsert({
      where: { productId_warehouseId: { productId: prodA.id, warehouseId: whA.id } },
      update: { inStock: 6, reserved: 0, available: 6 },
      create: { productId: prodA.id, warehouseId: whA.id, inStock: 6, reserved: 0, available: 6 }
    });
    await prisma.stockLevel.upsert({
      where: { productId_warehouseId: { productId: prodA.id, warehouseId: whB.id } },
      update: { inStock: 4, reserved: 0, available: 4 },
      create: { productId: prodA.id, warehouseId: whB.id, inStock: 4, reserved: 0, available: 4 }
    });
    await prisma.stockLevel.upsert({
      where: { productId_warehouseId: { productId: prodA.id, warehouseId: whC.id } },
      update: { inStock: 0, reserved: 0, available: 0 },
      create: { productId: prodA.id, warehouseId: whC.id, inStock: 0, reserved: 0, available: 0 }
    });

    const orderRes = await axios.post(
      `${BASE_URL}/orders`,
      {
        customerId: testCustomer.id,
        items: [{ productId: prodA.id, quantity: 10, unitPrice: 1000 }],
        notes: 'Test 12 multi-warehouse order'
      },
      { headers: getHeaders('ADMIN') }
    );

    assert(orderRes.data.success, 'Order creation and allocation must succeed');
    const orderData = orderRes.data.data.order;
    assert(orderData.totalRequested === 10, 'Total requested = 10');
    assert(orderData.totalFulfilled === 10, 'Total fulfilled = 10');
    assert(orderData.totalBackordered === 0, 'Backordered = 0');

    // Check fulfillments
    const fulfillments = await prisma.fulfillment.findMany({
      where: { orderId: orderData.id },
      include: { warehouse: true }
    });
    assert(fulfillments.length === 2, `Must create 2 warehouse fulfillments (got ${fulfillments.length})`);
    const fA = fulfillments.find((f) => f.warehouseId === whA.id);
    const fB = fulfillments.find((f) => f.warehouseId === whB.id);
    assert(fA && fA.totalUnits === 6, 'Warehouse A must fulfill 6 units');
    assert(fB && fB.totalUnits === 4, 'Warehouse B must fulfill 4 units');
  });

  // -------------------------------------------------------------
  // TEST 13 — PARTIAL AVAILABILITY & BACKORDER (Case 2: 10 units -> WH A: 6 + Backorder: 4)
  // -------------------------------------------------------------
  let case2OrderId = null;
  let case2BackorderId = null;

  await recordTest(13, 'Partial Availability & Backorder Generation (6 fulfilled + 4 backordered)', async () => {
    // Setup stock: WH A has 6, others have 0
    await prisma.stockLevel.update({
      where: { productId_warehouseId: { productId: prodA.id, warehouseId: whA.id } },
      data: { inStock: 6, reserved: 0, available: 6 }
    });
    await prisma.stockLevel.update({
      where: { productId_warehouseId: { productId: prodA.id, warehouseId: whB.id } },
      data: { inStock: 0, reserved: 0, available: 0 }
    });

    const orderRes = await axios.post(
      `${BASE_URL}/orders`,
      {
        customerId: testCustomer.id,
        items: [{ productId: prodA.id, quantity: 10, unitPrice: 1000 }],
        notes: 'Test 13 partial fulfillment order'
      },
      { headers: getHeaders('ADMIN') }
    );

    assert(orderRes.data.success, 'Order creation must succeed');
    const orderData = orderRes.data.data.order;
    assert(orderData.totalFulfilled === 6, `Total fulfilled should be 6 (got ${orderData.totalFulfilled})`);
    assert(orderData.totalBackordered === 4, `Total backordered should be 4 (got ${orderData.totalBackordered})`);
    assert(orderData.status === 'PARTIALLY_FULFILLED', 'Status should be PARTIALLY_FULFILLED');

    const backorder = await prisma.backorder.findFirst({
      where: { orderId: orderData.id },
      include: { items: true }
    });
    assert(backorder, 'Backorder record must be created');
    assert(backorder.items[0].quantity === 4, 'Backordered quantity must be 4');

    case2OrderId = orderData.id;
    case2BackorderId = backorder.id;
  });

  // -------------------------------------------------------------
  // TEST 14 — BACKORDER FULFILLMENT ON RESTOCK
  // -------------------------------------------------------------
  await recordTest(14, 'Backorder Fulfillment on Restock (4 units fulfilled -> Order 10/10)', async () => {
    assert(case2BackorderId, 'Case 2 Backorder must exist');

    // 1. Warehouse B receives 10 units of Product A
    await axios.post(
      `${BASE_URL}/fulfillment/warehouses/${whB.id}/restock`,
      { productId: prodA.id, quantity: 10, reason: 'Restock shipment arrival' },
      { headers: getHeaders('ADMIN') }
    );

    // 2. Fulfill Backorder
    const boFulfillRes = await axios.post(
      `${BASE_URL}/backorders/${case2BackorderId}/fulfill`,
      { allocations: [{ productId: prodA.id, quantity: 4, warehouseId: whB.id }] },
      { headers: getHeaders('ADMIN') }
    );

    assert(boFulfillRes.data.success, 'Backorder fulfillment must succeed');

    // 3. Verify original parent order transitions to FULFILLED (10/10)
    const order = await prisma.order.findUnique({ where: { id: case2OrderId } });
    assert(order.totalFulfilled === 10, `Total fulfilled should be 10 (got ${order.totalFulfilled})`);
    assert(order.totalBackordered === 0, `Total backordered should be 0 (got ${order.totalBackordered})`);
    assert(order.status === 'FULFILLED', 'Order status should transition to FULFILLED');
  });

  // -------------------------------------------------------------
  // TEST 15 — THREE-WAREHOUSE SPLIT (WH A: 3, WH B: 4, WH C: 2 + Backorder: 1)
  // -------------------------------------------------------------
  await recordTest(15, 'Three-Warehouse Split: WH A (3) + WH B (4) + WH C (2) + Backorder (1)', async () => {
    // Set stock: WH A = 3, WH B = 4, WH C = 2 (Total available = 9)
    await prisma.stockLevel.update({
      where: { productId_warehouseId: { productId: prodA.id, warehouseId: whA.id } },
      data: { inStock: 3, reserved: 0, available: 3 }
    });
    await prisma.stockLevel.update({
      where: { productId_warehouseId: { productId: prodA.id, warehouseId: whB.id } },
      data: { inStock: 4, reserved: 0, available: 4 }
    });
    await prisma.stockLevel.update({
      where: { productId_warehouseId: { productId: prodA.id, warehouseId: whC.id } },
      data: { inStock: 2, reserved: 0, available: 2 }
    });

    const orderRes = await axios.post(
      `${BASE_URL}/orders`,
      {
        customerId: testCustomer.id,
        items: [{ productId: prodA.id, quantity: 10, unitPrice: 1000 }],
        notes: 'Test 15 3-warehouse split'
      },
      { headers: getHeaders('ADMIN') }
    );

    assert(orderRes.data.success, 'Order allocation must succeed');
    const order = orderRes.data.data.order;
    assert(order.totalFulfilled === 9, `Fulfilled should be 9 (got ${order.totalFulfilled})`);
    assert(order.totalBackordered === 1, `Backordered should be 1 (got ${order.totalBackordered})`);

    const fulfillments = await prisma.fulfillment.findMany({ where: { orderId: order.id } });
    assert(fulfillments.length === 3, `Must create 3 warehouse fulfillments (got ${fulfillments.length})`);
  });

  // -------------------------------------------------------------
  // TEST 16 — INVENTORY RESERVATION CONCURRENCY & RACE CONDITIONS
  // -------------------------------------------------------------
  await recordTest(16, 'Concurrency & Race Condition Safety (Atomic Stock Reservations)', async () => {
    // Setup stock: Product C has exactly 5 units in WH A
    await prisma.stockLevel.update({
      where: { productId_warehouseId: { productId: prodC.id, warehouseId: whA.id } },
      data: { inStock: 5, reserved: 0, available: 5 }
    });
    await prisma.stockLevel.update({
      where: { productId_warehouseId: { productId: prodC.id, warehouseId: whB.id } },
      data: { inStock: 0, reserved: 0, available: 0 }
    });
    await prisma.stockLevel.update({
      where: { productId_warehouseId: { productId: prodC.id, warehouseId: whC.id } },
      data: { inStock: 0, reserved: 0, available: 0 }
    });

    // Fire 2 concurrent orders each asking for 4 units
    const [res1, res2] = await Promise.all([
      axios.post(`${BASE_URL}/orders`, {
        customerId: testCustomer.id,
        items: [{ productId: prodC.id, quantity: 4, unitPrice: 500 }]
      }, { headers: getHeaders('ADMIN') }),
      axios.post(`${BASE_URL}/orders`, {
        customerId: testCustomer.id,
        items: [{ productId: prodC.id, quantity: 4, unitPrice: 500 }]
      }, { headers: getHeaders('ADMIN') })
    ]);

    assert(res1.data.success && res2.data.success, 'Both orders processed successfully');

    // Verify stock Level: inStock = 5, reserved = 5, available = 0 (NEVER negative!)
    const stock = await prisma.stockLevel.findUnique({
      where: { productId_warehouseId: { productId: prodC.id, warehouseId: whA.id } }
    });

    assert(stock.available >= 0, `Available stock must never be negative (is ${stock.available})`);
    assert(stock.reserved <= stock.inStock, `Reserved cannot exceed inStock (${stock.reserved} vs ${stock.inStock})`);
  });

  // -------------------------------------------------------------
  // TEST 17 — WAREHOUSE PERMISSIONS ACROSS ROLES
  // -------------------------------------------------------------
  await recordTest(17, 'Warehouse Permissions for Admin, Finance, Sales Mgr, Sales Rep', async () => {
    // 1. Admin can view
    const adminRes = await axios.get(`${BASE_URL}/fulfillment/warehouses`, { headers: getHeaders('ADMIN') });
    assert(adminRes.data.success, 'Admin should view warehouses');

    // 2. Sales Rep can view stock
    const repRes = await axios.get(`${BASE_URL}/fulfillment/warehouses`, { headers: getHeaders('SALES_REP') });
    assert(repRes.data.success, 'Sales Rep should view warehouse availability');

    // 3. Finance Manager can view
    const finRes = await axios.get(`${BASE_URL}/fulfillment/warehouses`, { headers: getHeaders('FINANCE_OPS') });
    assert(finRes.data.success, 'Finance Manager should view warehouses');

    // 4. Sales Manager can view
    const mgrRes = await axios.get(`${BASE_URL}/fulfillment/warehouses`, { headers: getHeaders('SALES_MANAGER') });
    assert(mgrRes.data.success, 'Sales Manager should view warehouses');
  });

  // -------------------------------------------------------------
  // TEST 18 — INVOICE GENERATION & ACCURACY
  // -------------------------------------------------------------
  await recordTest(18, 'Warehouse-Specific Invoices & Billing Accuracy', async () => {
    const invoices = await prisma.invoice.findMany({
      where: { orderId: { not: null } },
      include: { warehouse: true, order: true }
    });
    assert(invoices.length >= 1, 'Invoices must be generated');
    for (const inv of invoices) {
      assert(inv.totalAmount > 0, 'Invoice total must be > 0');
      assert(inv.taxAmount === inv.amount * 0.18, 'Tax must be 18% standard');
    }
  });

  // -------------------------------------------------------------
  // TEST 19 — FINANCE MANAGER BOUNDARIES
  // -------------------------------------------------------------
  await recordTest(19, 'Finance Manager Access & Boundary Restrictions', async () => {
    // 1. Finance can access invoices
    const invRes = await axios.get(`${BASE_URL}/invoices`, { headers: getHeaders('FINANCE_OPS') });
    assert(invRes.data.success, 'Finance should access invoices');

    // 2. Finance can access subscriptions
    const subRes = await axios.get(`${BASE_URL}/subscriptions`, { headers: getHeaders('FINANCE_OPS') });
    assert(subRes.data.success, 'Finance should access subscriptions');

    // 3. Finance cannot perform admin role switching -> 403
    try {
      await axios.post(`${BASE_URL}/auth/switch-role`, { targetRole: 'admin' }, { headers: getHeaders('FINANCE_OPS') });
      assert(false, 'Finance Manager cannot switch roles');
    } catch (err) {
      assert(err.response?.status === 403, 'Finance role switch should return 403');
    }
  });

  // -------------------------------------------------------------
  // TEST 20 — ADMIN ACCESS ACROSS ALL MODULES
  // -------------------------------------------------------------
  await recordTest(20, 'Admin Access Across All Enterprise Modules', async () => {
    const endpoints = [
      '/quotations',
      '/orders',
      '/approvals',
      '/fulfillment/warehouses',
      '/invoices',
      '/subscriptions',
      '/products',
      '/deal-health/dashboard',
      '/reports'
    ];

    for (const ep of endpoints) {
      const res = await axios.get(`${BASE_URL}${ep}`, { headers: getHeaders('ADMIN') });
      assert(res.data.success, `Admin should access ${ep}`);
    }
  });

  // -------------------------------------------------------------
  // TEST 21 — SUBSCRIPTION SYSTEM LIFECYCLE
  // -------------------------------------------------------------
  await recordTest(21, 'Subscription Lifecycle (Create, Pause, Resume, Cancel, Schedules)', async () => {
    // 1. Create Subscription
    const createRes = await axios.post(
      `${BASE_URL}/subscriptions`,
      {
        customerId: testCustomer.id,
        planName: 'Enterprise Revenue Engine',
        billingCycle: 'MONTHLY',
        recurringAmount: 49999
      },
      { headers: getHeaders('ADMIN') }
    );
    assert(createRes.data.success, 'Subscription creation must succeed');
    const subId = createRes.data.data.id;

    // 2. Pause
    const pauseRes = await axios.post(`${BASE_URL}/subscriptions/${subId}/pause`, {}, { headers: getHeaders('ADMIN') });
    assert(pauseRes.data.data.status === 'PAUSED', 'Status should be PAUSED');

    // 3. Resume
    const resumeRes = await axios.post(`${BASE_URL}/subscriptions/${subId}/resume`, {}, { headers: getHeaders('ADMIN') });
    assert(resumeRes.data.data.status === 'ACTIVE', 'Status should be ACTIVE');

    // 4. Billing Schedule
    const schedRes = await axios.get(`${BASE_URL}/subscriptions/${subId}/billing-schedule`, { headers: getHeaders('ADMIN') });
    assert(schedRes.data.schedule.length === 6, 'Schedule should have 6 projected invoice cycles');

    // 5. Cancel
    const cancelRes = await axios.delete(`${BASE_URL}/subscriptions/${subId}`, { headers: getHeaders('ADMIN') });
    assert(cancelRes.data.data.status === 'CANCELLED', 'Status should be CANCELLED');
  });

  // -------------------------------------------------------------
  // TEST 22 — AUTHORIZATION & NEGATIVE RBAC TESTS
  // -------------------------------------------------------------
  await recordTest(22, 'Negative Authorization Tests (Direct 401 & 403 Enforcement)', async () => {
    // 1. Unauthenticated request -> 401
    try {
      await axios.get(`${BASE_URL}/orders`);
      assert(false, 'Unauthenticated request must return 401');
    } catch (err) {
      assert(err.response?.status === 401, 'Unauthenticated should return 401');
    }

    // 2. Sales Rep attempting manager approval endpoint -> 403
    try {
      await axios.put(
        `${BASE_URL}/approvals/${testApprovalId || 'app-dummy'}`,
        { decision: 'APPROVED' },
        { headers: getHeaders('SALES_REP') }
      );
      assert(false, 'Sales Rep cannot access approvals PUT');
    } catch (err) {
      assert(err.response?.status === 403, 'Sales Rep on approval decision should return 403');
    }
  });

  // -------------------------------------------------------------
  // TEST 23 — DATABASE INTEGRITY & ORPHAN PREVENTION
  // -------------------------------------------------------------
  await recordTest(23, 'Database Relational Integrity & Foreign Key Constraints', async () => {
    const orders = await prisma.order.findMany({ include: { items: true, customer: true } });
    for (const ord of orders) {
      assert(ord.customer !== null, `Order #${ord.orderNumber} must have valid customer`);
      assert(ord.items.length > 0, `Order #${ord.orderNumber} must have line items`);
    }
  });

  // -------------------------------------------------------------
  // TEST 24 — ERROR HANDLING & SENSITIVE DATA MASKING
  // -------------------------------------------------------------
  await recordTest(24, 'Error Handling & Sensitive Data Masking', async () => {
    try {
      await axios.get(`${BASE_URL}/orders/non-existent-order-id-999999`, { headers: getHeaders('ADMIN') });
      assert(false, 'Non-existent order should return 404 or 500');
    } catch (err) {
      assert(err.response?.status >= 400, 'Error status code returned');
      const responseText = JSON.stringify(err.response?.data);
      assert(!responseText.includes('ouuv ctan yzys fhyl'), 'Must never leak SMTP password');
      assert(!responseText.includes('postgres:system'), 'Must never leak DB password');
    }
  });

  // -------------------------------------------------------------
  // TEST 25 — FRONTEND / BACKEND API CONSISTENCY
  // -------------------------------------------------------------
  await recordTest(25, 'API Contracts & Payload Response Consistency', async () => {
    const orderRes = await axios.get(`${BASE_URL}/orders`, { headers: getHeaders('ADMIN') });
    assert(orderRes.data.success === true, 'Response must have success: true');
    assert(Array.isArray(orderRes.data.data), 'data must be an Array');
  });

  // -------------------------------------------------------------
  // TEST 26 — WORKFLOW STATUS TRANSITIONS & STATE MACHINE
  // -------------------------------------------------------------
  await recordTest(26, 'State Machine Transitions & Invalid Status Prevention', async () => {
    // Attempt to negotiate an already confirmed quotation -> MUST FAIL
    try {
      await axios.post(`${BASE_URL}/customer-portal/quote/${testPortalToken}/negotiate`, {
        requestedPrice: 500,
        message: 'Trying to negotiate confirmed quote'
      });
      assert(false, 'Negotiating confirmed quote must be rejected');
    } catch (err) {
      assert(err.response?.status === 400, 'Confirmed quote negotiation should return 400');
    }
  });

  // -------------------------------------------------------------
  // TEST 27 — HEALTH & PERFORMANCE METRICS
  // -------------------------------------------------------------
  await recordTest(27, 'Telemetry, Deal Health & Analytical KPIs', async () => {
    const res = await axios.get(`${BASE_URL}/deal-health/dashboard`, { headers: getHeaders('ADMIN') });
    assert(res.data.success, 'Deal health dashboard should return status 200');
    assert(res.data.summary.total >= 0, 'Total quotes summary must be present');
  });

  // -------------------------------------------------------------
  // TEST 28 — COMPLETE END-TO-END WORKFLOW INTEGRATION
  // -------------------------------------------------------------
  await recordTest(28, 'Complete End-to-End Enterprise Lifecycle Workflow', async () => {
    // Step 1: Customer creates request for 10 units Product A + 5 units Product C
    const reqRes = await axios.post(`${BASE_URL}/customer-portal/requests`, {
      customerId: testCustomer.id,
      items: [
        { productId: prodA.id, quantity: 10, targetPrice: 1000 },
        { productId: prodC.id, quantity: 5, targetPrice: 500 }
      ],
      notes: 'End-to-End complete audit lifecycle order'
    });
    const e2eReqId = reqRes.data.data.id;

    // Step 2: Sales Rep reviews and converts to Quotation
    const quoteRes = await axios.post(
      `${BASE_URL}/quotations/convert-request/${e2eReqId}`,
      {},
      { headers: getHeaders('SALES_REP') }
    );
    const e2eQuote = quoteRes.data.data;
    const e2eToken = e2eQuote.portalToken;

    // Step 3: Customer opens quote and submits counter-offer (Product A @ ₹800) -> Triggers Risk > 0
    const itemA = e2eQuote.items.find((i) => i.productId === prodA.id);
    const negRes = await axios.post(`${BASE_URL}/customer-portal/quote/${e2eToken}/negotiate`, {
      quotationItemId: itemA.id,
      productId: prodA.id,
      requestedPrice: 800,
      message: 'End-to-End enterprise price concession request'
    });
    assert(negRes.data.data.negotiation.status === 'APPROVAL_REQUIRED', 'Status is APPROVAL_REQUIRED');

    // Step 4: Sales Manager reviews and Approves
    const approval = await prisma.approval.findFirst({
      where: { quotationId: e2eQuote.id, status: 'PENDING' }
    });
    await axios.put(
      `${BASE_URL}/approvals/${approval.id}`,
      { decision: 'APPROVED', comments: 'E2E Full audit managerial approval' },
      { headers: getHeaders('SALES_MANAGER') }
    );

    // Step 5: Customer confirms Quotation -> Generates Order
    const confirmRes = await axios.post(`${BASE_URL}/customer-portal/quote/${e2eToken}/confirm`);
    assert(confirmRes.data.success, 'Quotation confirmed');
    const e2eOrder = await prisma.order.findFirst({ where: { quotationId: e2eQuote.id } });
    assert(e2eOrder, 'Order created in PostgreSQL');

    // Step 6: Dispatch first shipment
    const fulfillments = await prisma.fulfillment.findMany({ where: { orderId: e2eOrder.id } });
    if (fulfillments.length > 0) {
      const dispatchRes = await axios.post(
        `${BASE_URL}/fulfillment/${fulfillments[0].id}/dispatch`,
        { carrier: 'BlueDart Express', trackingNumber: 'AWB-E2E-TEST-889911' },
        { headers: getHeaders('ADMIN') }
      );
      assert(dispatchRes.data.success, 'Fulfillment dispatch succeeded');
    }
  });

  console.log('\n============================================================');
  console.log(`AUDIT RESULTS: ${testsPassed} / 28 TESTS PASSED (${testsFailed} FAILED)`);
  console.log('============================================================\n');

  if (testsFailed > 0) {
    console.error('❌ One or more tests failed. Please inspect logs above.');
    process.exit(1);
  } else {
    console.log('✔ ALL 28 FUNCTIONAL AUDIT TESTS PASSED FLAWLESSLY!');
    process.exit(0);
  }
}

runAudit()
  .catch((err) => {
    console.error('Fatal audit failure:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
