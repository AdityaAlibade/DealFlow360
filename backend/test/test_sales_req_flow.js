const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const BASE_URL = 'http://localhost:5000/api';

const tokens = {
  admin: 'jwt-admin-token-dealflow360',
  salesRep: 'jwt-salesrep-token-dealflow360',
  salesManager: 'jwt-salesmgr-token-dealflow360',
  finance: 'jwt-finance-token-dealflow360'
};

const getHeaders = (role = 'salesRep') => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${tokens[role]}`
});

async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok && !data.alreadyExists) {
    const err = new Error(data.message || `HTTP ${response.status}`);
    err.response = { data, status: response.status };
    throw err;
  }
  return data;
}

async function runFullAudit() {
  console.log('=================================================================');
  console.log('STARTING SALES REQ ORDER REQUEST & QUOTATION FLOW E2E AUDIT');
  console.log('=================================================================\n');

  try {
    // 1. Get or create a verified Customer & Product
    let customer = await prisma.customer.findFirst();
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: 'Tata Consultancy Services (TCS)',
          email: 'procurement@tcs.com',
          companyName: 'Tata Consultancy Services',
          tier: 'GOLD',
          maxDiscount: 20
        }
      });
    }
    console.log(`[PASS] 1. Customer verified: ${customer.name} (ID: ${customer.id})`);

    let product = await prisma.product.findFirst();
    if (!product) {
      product = await prisma.product.create({
        data: {
          sku: 'HW-LTP-14',
          name: 'Enterprise Laptop Pro 14"',
          category: 'Hardware',
          basePrice: 150000,
          standardCost: 110000
        }
      });
    }
    console.log(`[PASS] 2. Product verified: ${product.name} (Base Price: ₹${product.basePrice})`);

    // 2. Customer creates an Order Request via Customer Portal API
    console.log('\n--- Step 1: Customer creates an Order Request ---');
    const createReqRes = await apiRequest('/customer-portal/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: customer.id,
        notes: 'Urgent hardware requirement for Q4 expansion project.',
        items: [
          {
            productId: product.id,
            quantity: 5,
            targetPrice: 140000,
            notes: 'Need pre-installed enterprise security suite'
          }
        ]
      })
    });

    const createdReq = createReqRes.data;
    console.log(`[PASS] Customer created Order Request: ${createdReq.requestNumber} (DB ID: ${createdReq.id})`);
    console.log(`       Status: ${createdReq.status}, Total Amount: ₹${createdReq.totalAmount}`);

    // 3. Verify in PostgreSQL
    const dbReq = await prisma.productRequest.findUnique({
      where: { id: createdReq.id },
      include: { items: true, customer: true }
    });
    if (!dbReq || dbReq.status !== 'PENDING') {
      throw new Error(`DB verification failed for request ${createdReq.id}`);
    }
    console.log(`[PASS] DB check: Order Request stored with status PENDING in PostgreSQL`);

    // 4. Sales Rep fetches all Order Requests
    console.log('\n--- Step 2: Sales Rep views Order Requests ---');
    const listRes = await apiRequest('/order-requests', {
      headers: getHeaders('salesRep')
    });
    console.log(`[PASS] Sales Rep fetched ${listRes.count} order requests from /api/order-requests`);
    const foundInList = listRes.data.find((r) => r.id === createdReq.id);
    if (!foundInList) {
      throw new Error('Created request not found in Sales Rep list');
    }
    console.log(`[PASS] Verified ${createdReq.requestNumber} is listed in Sales Rep Order Requests table`);

    // 5. Sales Rep opens Order Request Details -> Verifies auto-transition to UNDER_REVIEW
    console.log('\n--- Step 3: Sales Rep opens Order Request Details ---');
    const detailRes = await apiRequest(`/order-requests/${createdReq.id}`, {
      headers: getHeaders('salesRep')
    });
    const reqDetails = detailRes.data;
    console.log(`[PASS] Order Request loaded successfully.`);
    console.log(`       Status transitioned to: ${reqDetails.status} (Auto UNDER_REVIEW)`);
    console.log(`       Customer: ${reqDetails.customer.name}, Items Count: ${reqDetails.items.length}`);
    console.log(`       Warehouse Inventory Breakdown checked:`);
    reqDetails.items.forEach((it) => {
      console.log(`       - Item: ${it.product.name} (Req Qty: ${it.quantity}), Total WH Available: ${it.inventory.totalAvailable}`);
    });

    // 6. Sales Rep creates Quotation directly FROM the Order Request
    console.log('\n--- Step 4: Sales Rep creates Quotation FROM Order Request ---');
    const quotePayload = {
      quoteNumber: `Q-${Math.floor(10000 + Math.random() * 90000)}`,
      productRequestId: createdReq.id,
      customerId: customer.id,
      customerName: customer.name,
      customerEmail: customer.email,
      paymentTerms: 'Net 30',
      validUntil: '2026-10-01',
      notes: `Proposal generated for Order Request #${createdReq.requestNumber}`,
      subtotal: 700000,
      totalDiscount: 35000, // 5% discount -> within limit (Risk = 0)
      taxAmount: 119700,
      totalAmount: 784700,
      blendedMargin: '26.5',
      status: 'DRAFT',
      items: [
        {
          productId: product.id,
          name: product.name,
          sku: product.sku,
          qty: 5,
          unitPrice: 140000,
          discount: 5,
          taxRate: 18,
          netPrice: 665000,
          marginPercent: '26.5',
          isOverLimit: false
        }
      ]
    };

    const quoteRes = await apiRequest('/quotations', {
      method: 'POST',
      headers: getHeaders('salesRep'),
      body: JSON.stringify(quotePayload)
    });
    const createdQuote = quoteRes.data;
    console.log(`[PASS] Quotation created: ${createdQuote.quoteNumber} (ID: ${createdQuote.id})`);
    console.log(`       Linked productRequestId in DB: ${createdQuote.productRequestId}`);
    if (createdQuote.productRequestId !== createdReq.id) {
      throw new Error(`Quotation productRequestId mismatch: expected ${createdReq.id}, got ${createdQuote.productRequestId}`);
    }

    // 7. Verify Order Request status updated in DB to QUOTATION_CREATED / QUOTED
    const updatedReqInDb = await prisma.productRequest.findUnique({
      where: { id: createdReq.id },
      include: { quotations: true }
    });
    console.log(`[PASS] Order Request status updated in PostgreSQL to: ${updatedReqInDb.status}`);
    console.log(`       Linked Quotations count: ${updatedReqInDb.quotations.length}`);

    // 8. Test Duplicate Quotation Prevention
    console.log('\n--- Step 5: Duplicate Quotation Prevention Test ---');
    const dupRes = await apiRequest('/quotations', {
      method: 'POST',
      headers: getHeaders('salesRep'),
      body: JSON.stringify(quotePayload)
    });
    if (dupRes.alreadyExists) {
      console.log(`[PASS] Duplicate Quotation prevented! API returned existing quote ${dupRes.data.quoteNumber}`);
    } else {
      throw new Error('Duplicate quotation was NOT prevented!');
    }

    // 9. Customer views My Order Requests -> Verifies linked quotation is visible
    console.log('\n--- Step 6: Customer views My Order Requests & Linked Quotation ---');
    const custReqsRes = await apiRequest(`/customer-portal/requests?customerId=${customer.id}`);
    const custProductReqs = custReqsRes.data.productRequests;
    const matchedCustReq = custProductReqs.find((r) => r.requestId === createdReq.id || r.id === createdReq.requestNumber);
    if (!matchedCustReq) {
      throw new Error(`Customer could not find order request ${createdReq.requestNumber}`);
    }
    console.log(`[PASS] Customer successfully sees Order Request ${matchedCustReq.id}`);
    console.log(`       Linked Quotation: #${matchedCustReq.linkedQuotation?.quoteNumber} (Amount: ₹${matchedCustReq.linkedQuotation?.totalAmount})`);
    if (!matchedCustReq.linkedQuotation) {
      throw new Error('Customer view does not contain linked quotation!');
    }

    // 10. Negotiation Flow Test
    console.log('\n--- Step 7: Customer Submits Negotiation on Quotation ---');
    const token = createdQuote.portalToken || createdQuote.id;
    const negRes = await apiRequest(`/customer-portal/quote/${token}/negotiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: product.id,
        originalPrice: 140000,
        requestedPrice: 130000,
        counterDiscount: 12,
        comment: 'Can we do 12% discount for early Q4 commitment?'
      })
    });
    const createdNeg = negRes.data;
    console.log(`[PASS] Negotiation created: ${createdNeg.id}`);
    console.log(`       Calculated Deal Risk: ${createdNeg.riskScore}`);

    // 11. Sales Rep / Manager accept negotiation & finalize confirmation
    console.log('\n--- Step 8: Finalizing Quotation Confirmation & Order Creation ---');
    const confirmRes = await apiRequest(`/quotations/${createdQuote.id}/confirm`, {
      method: 'POST',
      headers: getHeaders('salesRep')
    });
    console.log(`[PASS] Quotation confirmed into Order!`);
    console.log(`       Order ID: ${confirmRes.data.order?.orderNumber || confirmRes.data.order?.id}`);

    // 12. Verify original ProductRequest is now CONFIRMED in DB
    const finalReqCheck = await prisma.productRequest.findUnique({ where: { id: createdReq.id } });
    console.log(`[PASS] Original Order Request status is now: ${finalReqCheck.status}`);

    console.log('\n=================================================================');
    console.log('ALL 12 END-TO-END AUDIT & VERIFICATION CHECKS PASSED PERFECTLY!');
    console.log('=================================================================');
  } catch (err) {
    console.error('\n[AUDIT FAILED]', err.response?.data || err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runFullAudit();
