/**
 * DealFlow360 — Bulk Demo Data Seeder
 * Creates 200+ realistic records across all major entities:
 *   - 15 Customers
 *   - 25 Products (with stock levels in all 4 warehouses)
 *   - 60 Quotations (with 2-4 line items each)
 *   - 40 Approvals
 *   - 30 Orders (with order items)
 *   - 20 Invoices
 *   - 15 Subscriptions
 *   - 10 ProductRequests
 *
 * Run: node prisma/seed_demo.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

// ─── Helpers ────────────────────────────────────────────────────────────────
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min, max, dp = 2) => parseFloat((Math.random() * (max - min) + min).toFixed(dp));
const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);
const daysFromNow = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

// ─── Reference Data ─────────────────────────────────────────────────────────

const WAREHOUSES = [
  { id: 'wh-bom-01', code: 'BOM-1', name: 'Central Fulfillment Hub Mumbai', location: 'Bhiwandi Logistics Park, Mumbai, MH', status: 'ACTIVE' },
  { id: 'wh-ccu-02', code: 'CCU-1', name: 'East Regional Depot Kolkata', location: 'Dankuni Industrial Hub, Kolkata, WB', status: 'ACTIVE' },
  { id: 'wh-blr-03', code: 'BLR-1', name: 'South Tech Distribution Hub', location: 'Electronic City Logistics Center, Bengaluru, KA', status: 'ACTIVE' },
  { id: 'wh-del-04', code: 'DEL-1', name: 'North Regional Depot Delhi NCR', location: 'Manesar Cargo Hub, Gurgaon, HR', status: 'ACTIVE' },
];

const USERS = [
  { id: 'usr-admin-01', email: 'adityaalibade1046@gmail.com', fullName: 'Aditya Alibade', role: 'ADMIN' },
  { id: 'usr-mgr-02', email: 'salesmanager@dealflow360.com', fullName: 'Priya Sharma', role: 'SALES_MANAGER' },
  { id: 'usr-rep-03', email: 'salesrep@dealflow360.com', fullName: 'Rajesh Kumar', role: 'SALES_REP' },
  { id: 'usr-fin-04', email: 'financemanager@dealflow360.com', fullName: 'Vikram Malhotra', role: 'FINANCE_OPS' },
  { id: 'usr-cust-05', email: 'customer@dealflow360.com', fullName: 'Ananya Deshmukh', role: 'CUSTOMER' },
];

const CUSTOMERS_DEF = [
  { id: 'cust-001', name: 'Ananya Deshmukh', companyName: 'Tata Consultancy Services (TCS)', email: 'tcs.procurement@tcs.com', phone: '+91 22 6778 9900', tier: 'GOLD', billingAddress: '11th Floor, Air India Building, Nariman Point, Mumbai - 400021', shippingAddress: 'TCS Campus, Hiranandani Business Park, Powai, Mumbai - 400076' },
  { id: 'cust-002', name: 'Rohit Mehta', companyName: 'Infosys Limited', email: 'procurement@infosys.com', phone: '+91 80 2852 0261', tier: 'GOLD', billingAddress: 'Plot No. 44, Electronics City, Hosur Road, Bengaluru - 560100', shippingAddress: 'Infosys SEZ, Konark IT Park, Pune - 411014' },
  { id: 'cust-003', name: 'Sneha Patel', companyName: 'Reliance Industries Ltd', email: 'snehap@ril.com', phone: '+91 22 3555 5000', tier: 'GOLD', billingAddress: 'Maker Chambers IV, 222 Nariman Point, Mumbai - 400021', shippingAddress: 'Reliance Corporate Park, Navi Mumbai - 400701' },
  { id: 'cust-004', name: 'Arjun Nair', companyName: 'Wipro Technologies', email: 'arjun.nair@wipro.com', phone: '+91 80 2844 0011', tier: 'SILVER', billingAddress: 'Doddakannelli, Sarjapur Road, Bengaluru - 560035', shippingAddress: 'Wipro Campus, SEZ Phase 2, Gurgaon - 122002' },
  { id: 'cust-005', name: 'Kavitha Reddy', companyName: 'HCL Technologies', email: 'kavitha.r@hcltech.com', phone: '+91 120 476 9400', tier: 'SILVER', billingAddress: 'Plot No. 3A, Sector 126, Noida - 201304', shippingAddress: 'HCL Technology Hub, Chennai - 600119' },
  { id: 'cust-006', name: 'Suresh Joshi', companyName: 'HDFC Bank Ltd', email: 'suresh.joshi@hdfcbank.com', phone: '+91 22 6160 6160', tier: 'GOLD', billingAddress: 'HDFC Bank House, Senapati Bapat Marg, Mumbai - 400013', shippingAddress: 'HDFC Bank, Chandivali, Powai, Mumbai - 400072' },
  { id: 'cust-007', name: 'Meera Kapoor', companyName: 'Bajaj Finance Ltd', email: 'meera.k@bajajfinance.com', phone: '+91 20 3956 7777', tier: 'SILVER', billingAddress: 'Bajaj Finserv Corporate Office, Viman Nagar, Pune - 411014', shippingAddress: 'Bajaj Finance, Akurdi, Pune - 411035' },
  { id: 'cust-008', name: 'Vivek Gupta', companyName: 'Tech Mahindra Ltd', email: 'vivek.g@techmahindra.com', phone: '+91 22 2490 8000', tier: 'SILVER', billingAddress: 'Gateway Building, Apollo Bunder, Mumbai - 400001', shippingAddress: 'Tech Mahindra, Shivaji Nagar, Pune - 411005' },
  { id: 'cust-009', name: 'Priti Bansal', companyName: 'Larsen & Toubro Ltd', email: 'priti.b@larsentoubro.com', phone: '+91 22 6752 5656', tier: 'GOLD', billingAddress: 'L&T House, Ballard Estate, Mumbai - 400001', shippingAddress: 'L&T Knowledge City, Vadodara - 390023' },
  { id: 'cust-010', name: 'Aakash Singh', companyName: 'Mahindra & Mahindra', email: 'aakash.s@mahindra.com', phone: '+91 22 2490 1441', tier: 'GOLD', billingAddress: 'Mahindra Towers, Worli, Mumbai - 400018', shippingAddress: 'Mahindra Research Valley, Chennai - 603204' },
  { id: 'cust-011', name: 'Deepa Krishnan', companyName: 'Biocon Limited', email: 'deepa.k@biocon.com', phone: '+91 80 2808 2808', tier: 'BRONZE', billingAddress: '20th KM Hosur Road, Electronic City, Bengaluru - 560100', shippingAddress: 'Biocon Park, Bommasandra, Bengaluru - 560099' },
  { id: 'cust-012', name: 'Ravi Teja', companyName: 'Adani Enterprises Ltd', email: 'ravi.t@adani.com', phone: '+91 79 2555 5555', tier: 'GOLD', billingAddress: 'Adani Corporate House, Shantigram, Ahmedabad - 382421', shippingAddress: 'Adani Port, Mundra, Gujarat - 370421' },
  { id: 'cust-013', name: 'Nalini Verma', companyName: 'ICICI Bank Ltd', email: 'nalini.v@icicibank.com', phone: '+91 22 2653 1414', tier: 'SILVER', billingAddress: 'ICICI Bank Tower, BKC, Mumbai - 400051', shippingAddress: 'ICICI Bank, Hitech City, Hyderabad - 500081' },
  { id: 'cust-014', name: 'Gopal Agarwal', companyName: 'Sun Pharmaceutical Industries', email: 'gopal.a@sunpharma.com', phone: '+91 22 4324 4324', tier: 'BRONZE', billingAddress: 'Sun House, CTS No. 201B, Western Express Highway, Mumbai - 400063', shippingAddress: 'Sun Pharma, APIIC Industrial Estate, Vizag - 530049' },
  { id: 'cust-015', name: 'Shweta Kulkarni', companyName: 'Tata Steel Ltd', email: 'shweta.k@tatasteel.com', phone: '+91 657 665 1000', tier: 'SILVER', billingAddress: 'Bombay House, 24 Homi Mody Street, Mumbai - 400001', shippingAddress: 'Tata Steel Works, Jamshedpur - 831001' },
];

const PRODUCTS_DEF = [
  // Enterprise Software
  { id: 'prod-sw-001', sku: 'SW-CPQ-ENT-001', name: 'DealFlow360 CPQ Enterprise License', description: 'Full-suite Configure-Price-Quote platform with AI deal governance', category: 'Enterprise Software', basePrice: 125000, standardCost: 45000, taxRate: 18.0, unit: 'License/Year', isSubscription: true },
  { id: 'prod-sw-002', sku: 'SW-CRM-PRO-001', name: 'CRM Professional Suite Annual', description: 'Advanced CRM with sales pipeline automation and deal analytics', category: 'Enterprise Software', basePrice: 89000, standardCost: 32000, taxRate: 18.0, unit: 'License/Year', isSubscription: true },
  { id: 'prod-sw-003', sku: 'SW-ERP-CLO-001', name: 'Cloud ERP Module — Finance & Ops', description: 'Modular cloud ERP covering AP/AR, procurement, and cost centers', category: 'Enterprise Software', basePrice: 210000, standardCost: 78000, taxRate: 18.0, unit: 'License/Year', isSubscription: true },
  { id: 'prod-sw-004', sku: 'SW-BI-ANL-001', name: 'Revenue Intelligence & Analytics Platform', description: 'Real-time revenue analytics, deal health monitoring, churn prediction', category: 'Enterprise Software', basePrice: 75000, standardCost: 28000, taxRate: 18.0, unit: 'License/Year', isSubscription: true },
  { id: 'prod-sw-005', sku: 'SW-WFM-001', name: 'Workforce Management System', description: 'HR automation, attendance, payroll, and compliance management', category: 'Enterprise Software', basePrice: 55000, standardCost: 20000, taxRate: 18.0, unit: 'License/Year', isSubscription: false },
  // Hardware
  { id: 'prod-hw-001', sku: 'HW-SRV-R740-001', name: 'Dell PowerEdge R740 2U Rack Server', description: 'Dual Intel Xeon, 128GB RAM, 10TB NVMe storage', category: 'Server Hardware', basePrice: 420000, standardCost: 310000, taxRate: 18.0, unit: 'Unit', isSubscription: false },
  { id: 'prod-hw-002', sku: 'HW-STO-SAN-001', name: 'NetApp SAN Storage Array 50TB', description: 'Enterprise SAN, dual controller, 50TB raw capacity, HA cluster', category: 'Storage Hardware', basePrice: 680000, standardCost: 510000, taxRate: 18.0, unit: 'Unit', isSubscription: false },
  { id: 'prod-hw-003', sku: 'HW-NET-SWT-001', name: 'Cisco Catalyst 9300 48-Port PoE+', description: '48-port PoE+ managed switch, 25Gbps uplinks, VLAN segmentation', category: 'Networking', basePrice: 185000, standardCost: 130000, taxRate: 18.0, unit: 'Unit', isSubscription: false },
  { id: 'prod-hw-004', sku: 'HW-LAP-ELT-001', name: 'Lenovo ThinkPad X1 Carbon Gen 11', description: 'Intel Core i7-1365U, 32GB RAM, 1TB SSD, 14" 2.8K OLED', category: 'Laptops & Workstations', basePrice: 178000, standardCost: 130000, taxRate: 18.0, unit: 'Unit', isSubscription: false },
  { id: 'prod-hw-005', sku: 'HW-WKS-PRO-001', name: 'HP Z4 G4 Workstation', description: 'Xeon W-2223, NVIDIA RTX 4000, 64GB ECC RAM, 2TB SSD', category: 'Laptops & Workstations', basePrice: 295000, standardCost: 215000, taxRate: 18.0, unit: 'Unit', isSubscription: false },
  // Professional Services
  { id: 'prod-svc-001', sku: 'SVC-IMP-001', name: 'Enterprise Implementation & Onboarding', description: '90-day structured deployment, data migration, user training', category: 'Professional Services', basePrice: 350000, standardCost: 180000, taxRate: 18.0, unit: 'Engagement', isSubscription: false },
  { id: 'prod-svc-002', sku: 'SVC-CST-001', name: 'Custom Integration Engineering', description: 'REST API integration, middleware development, ESB configuration', category: 'Professional Services', basePrice: 125000, standardCost: 70000, taxRate: 18.0, unit: 'Project', isSubscription: false },
  { id: 'prod-svc-003', sku: 'SVC-TRN-001', name: 'Corporate Training Program — 5 Days', description: 'Instructor-led on-site training for up to 20 users', category: 'Professional Services', basePrice: 85000, standardCost: 35000, taxRate: 18.0, unit: 'Session', isSubscription: false },
  { id: 'prod-svc-004', sku: 'SVC-SUP-PRE-001', name: 'Premium 24×7 Technical Support', description: 'Gold-tier SLA, 4-hour response, dedicated TAM, 99.9% uptime SLA', category: 'Support & Maintenance', basePrice: 180000, standardCost: 60000, taxRate: 18.0, unit: 'Contract/Year', isSubscription: true },
  { id: 'prod-svc-005', sku: 'SVC-AUD-001', name: 'Security & Compliance Audit', description: 'ISO 27001, SOC 2 Type II readiness assessment and gap analysis', category: 'Professional Services', basePrice: 275000, standardCost: 140000, taxRate: 18.0, unit: 'Engagement', isSubscription: false },
  // Cloud & Infrastructure
  { id: 'prod-cld-001', sku: 'CLD-AWS-RES-001', name: 'AWS Reserved Instance Package (1-Year)', description: 'c5.4xlarge on-demand compute, 1-year reserved pricing, multi-AZ', category: 'Cloud Infrastructure', basePrice: 240000, standardCost: 195000, taxRate: 18.0, unit: 'Instance/Year', isSubscription: true },
  { id: 'prod-cld-002', sku: 'CLD-AZR-001', name: 'Azure Enterprise Agreement Bundle', description: 'M365 E3 + Azure hybrid benefit, 100 seats, 24-month commitment', category: 'Cloud Infrastructure', basePrice: 480000, standardCost: 380000, taxRate: 18.0, unit: 'Bundle/Year', isSubscription: true },
  { id: 'prod-cld-003', sku: 'CLD-BCK-001', name: 'Automated Cloud Backup Service', description: 'Immutable backup, geo-redundant storage, 1-year, 10TB included', category: 'Cloud Infrastructure', basePrice: 96000, standardCost: 65000, taxRate: 18.0, unit: 'Contract/Year', isSubscription: true },
  // Security
  { id: 'prod-sec-001', sku: 'SEC-FWL-001', name: 'Palo Alto PA-3260 NGFW', description: 'Next-gen firewall, 20Gbps throughput, Panorama mgmt, 3-year license', category: 'Cybersecurity', basePrice: 540000, standardCost: 410000, taxRate: 18.0, unit: 'Unit', isSubscription: false },
  { id: 'prod-sec-002', sku: 'SEC-EDR-001', name: 'CrowdStrike Falcon Endpoint Protection', description: 'AI-driven EDR, 100 endpoints, 1-year subscription', category: 'Cybersecurity', basePrice: 145000, standardCost: 105000, taxRate: 18.0, unit: 'Contract/Year', isSubscription: true },
  // IoT & Edge
  { id: 'prod-iot-001', sku: 'IOT-GTE-001', name: 'Industrial IoT Gateway — 4G/5G', description: 'Ruggedized IIoT gateway, Modbus/MQTT/OPC-UA, -40°C to 85°C rated', category: 'IoT & Edge Computing', basePrice: 62000, standardCost: 42000, taxRate: 18.0, unit: 'Unit', isSubscription: false },
  { id: 'prod-iot-002', sku: 'IOT-SEN-001', name: 'Smart Sensor Array — 10 Node Pack', description: 'Temperature, humidity, vibration, and power monitoring, LoRaWAN', category: 'IoT & Edge Computing', basePrice: 38000, standardCost: 26000, taxRate: 18.0, unit: 'Pack', isSubscription: false },
  // Data & Analytics
  { id: 'prod-dat-001', sku: 'DAT-DWH-001', name: 'Snowflake Data Warehouse — Business Critical', description: 'Snowflake Business Critical tier, 100 credits/day, 1-year', category: 'Data & Analytics', basePrice: 380000, standardCost: 290000, taxRate: 18.0, unit: 'Contract/Year', isSubscription: true },
  { id: 'prod-dat-002', sku: 'DAT-ETL-001', name: 'Talend Cloud Data Integration', description: 'Cloud ETL/ELT platform, unlimited pipelines, 50 connections, 1-year', category: 'Data & Analytics', basePrice: 220000, standardCost: 165000, taxRate: 18.0, unit: 'Contract/Year', isSubscription: true },
  { id: 'prod-dat-003', sku: 'DAT-VIZ-001', name: 'Tableau Creator License Bundle — 10 Users', description: 'Tableau Creator for 10 users, 1-year cloud subscription', category: 'Data & Analytics', basePrice: 165000, standardCost: 120000, taxRate: 18.0, unit: 'Bundle/Year', isSubscription: true },
];

const QUOTE_STATUSES = ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'CONFIRMED', 'REJECTED', 'NEGOTIATION'];
const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'ALLOCATED', 'PARTIALLY_FULFILLED', 'FULFILLED', 'DISPATCHED', 'DELIVERED'];
const APPROVAL_STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'RETURNED'];
const APPROVAL_STAGES = ['Sales Manager', 'Finance Manager'];
const RISK_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const INVOICE_STATUSES = ['UNPAID', 'PARTIALLY_PAID', 'PAID', 'OVERDUE'];
const BILLING_CYCLES = ['MONTHLY', 'QUARTERLY', 'ANNUAL'];

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║  DealFlow360 — Bulk Demo Data Seeder (200+ Records)   ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  const hashedPassword = bcrypt.hashSync('password123', 10);

  // ── 1. Users ──────────────────────────────────────────────────────────────
  console.log('📦 [1/9] Seeding users...');
  for (const u of USERS) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { fullName: u.fullName, role: u.role },
      create: {
        id: u.id,
        email: u.email,
        fullName: u.fullName,
        role: u.role,
        password: hashedPassword,
        phone: '+91 98000 00000',
        department: 'Demo Department',
        title: u.fullName + ' — Demo',
        avatar: u.fullName.split(' ').map(w => w[0]).join('').toUpperCase()
      }
    });
  }
  console.log(`   ✔ ${USERS.length} users upserted`);

  // ── 2. Warehouses ─────────────────────────────────────────────────────────
  console.log('📦 [2/9] Seeding warehouses...');
  for (const wh of WAREHOUSES) {
    await prisma.warehouse.upsert({
      where: { code: wh.code },
      update: { name: wh.name, location: wh.location, status: wh.status },
      create: wh
    });
  }
  console.log(`   ✔ ${WAREHOUSES.length} warehouses upserted`);

  // ── 3. Customers ──────────────────────────────────────────────────────────
  console.log('📦 [3/9] Seeding 15 enterprise customers...');
  for (const c of CUSTOMERS_DEF) {
    await prisma.customer.upsert({
      where: { email: c.email },
      update: { companyName: c.companyName, tier: c.tier, phone: c.phone },
      create: c
    });
  }
  console.log(`   ✔ ${CUSTOMERS_DEF.length} customers upserted`);

  // ── 4. Products + Stock ───────────────────────────────────────────────────
  console.log('📦 [4/9] Seeding 25 products with stock levels...');
  for (const p of PRODUCTS_DEF) {
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: { name: p.name, basePrice: p.basePrice, standardCost: p.standardCost, category: p.category },
      create: p
    });

    // Create stock in all 4 warehouses
    for (const wh of WAREHOUSES) {
      const inStock = rand(50, 500);
      const reserved = rand(5, Math.min(50, inStock));
      const available = inStock - reserved;
      await prisma.stockLevel.upsert({
        where: { productId_warehouseId: { productId: p.id, warehouseId: wh.id } },
        update: { inStock, reserved, available, incoming: rand(0, 100) },
        create: {
          productId: p.id,
          warehouseId: wh.id,
          inStock,
          reserved,
          available,
          incoming: rand(0, 100),
          backordered: 0
        }
      });
    }
  }
  console.log(`   ✔ ${PRODUCTS_DEF.length} products + ${PRODUCTS_DEF.length * 4} stock level records`);

  // ── 5. Quotations ─────────────────────────────────────────────────────────
  console.log('📦 [5/9] Seeding 60 quotations with line items...');
  const quotationIds = [];
  const productIds = PRODUCTS_DEF.map(p => p.id);
  const salesRepIds = ['usr-rep-03', 'usr-mgr-02'];
  const customerIds = CUSTOMERS_DEF.map(c => c.id);

  for (let i = 1; i <= 60; i++) {
    const quoteNum = `QT-2026-${String(1000 + i).padStart(4, '0')}`;
    const customerId = pick(customerIds);
    const customer = CUSTOMERS_DEF.find(c => c.id === customerId);
    const salesRepId = pick(salesRepIds);
    const status = pick(QUOTE_STATUSES);
    const numItems = rand(2, 4);
    const expiresAt = rand(0, 1) === 1 ? daysFromNow(rand(15, 90)) : daysAgo(rand(1, 30));
    const blendedMargin = randFloat(12, 45);
    const discountPercent = randFloat(2, 25);
    const blendedRiskScore = discountPercent > 15 ? randFloat(60, 95) : randFloat(10, 55);

    // Compute totals from random items
    let subtotal = 0;
    let totalDiscount = 0;
    const itemsData = [];

    for (let j = 0; j < numItems; j++) {
      const productId = pick(productIds);
      const product = PRODUCTS_DEF.find(p => p.id === productId);
      const qty = rand(1, 10);
      const unitPrice = product.basePrice * randFloat(0.85, 1.05);
      const discPct = randFloat(0, 20);
      const netPrice = unitPrice * qty * (1 - discPct / 100);
      const margin = ((unitPrice - product.standardCost) / unitPrice) * 100;
      subtotal += unitPrice * qty;
      totalDiscount += (unitPrice * qty * discPct) / 100;
      itemsData.push({
        productId,
        quantity: qty,
        unitPrice: parseFloat(unitPrice.toFixed(2)),
        discountPercent: parseFloat(discPct.toFixed(2)),
        allowedLimit: 15.0,
        netPrice: parseFloat(netPrice.toFixed(2)),
        marginPercent: parseFloat(margin.toFixed(2)),
        isOverLimit: discPct > 15
      });
    }

    const taxAmount = (subtotal - totalDiscount) * 0.18;
    const totalAmount = subtotal - totalDiscount + taxAmount;

    let portalToken = null;
    if (status === 'APPROVED' || status === 'CONFIRMED') {
      portalToken = `portal-${customer.companyName.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 30)}-${1000 + i}`;
    }

    try {
      const quote = await prisma.quotation.create({
        data: {
          id: `quote-demo-${String(i).padStart(3, '0')}`,
          quoteNumber: quoteNum,
          customerId,
          salesRepId,
          status,
          subtotal: parseFloat(subtotal.toFixed(2)),
          totalDiscount: parseFloat(totalDiscount.toFixed(2)),
          taxAmount: parseFloat(taxAmount.toFixed(2)),
          totalAmount: parseFloat(totalAmount.toFixed(2)),
          blendedMargin: parseFloat(blendedMargin.toFixed(2)),
          blendedRiskScore: parseFloat(blendedRiskScore.toFixed(2)),
          portalToken,
          expiresAt,
          createdAt: daysAgo(rand(1, 180)),
          items: { create: itemsData }
        }
      });
      quotationIds.push(quote.id);
    } catch (e) {
      if (e.code === 'P2002') {
        console.log(`   ⚠ Skipping duplicate quote: ${quoteNum}`);
      } else {
        console.error(`   ✗ Quote ${quoteNum} failed:`, e.message);
      }
    }
  }
  console.log(`   ✔ ${quotationIds.length} quotations created`);

  // ── 6. Approvals ──────────────────────────────────────────────────────────
  console.log('📦 [6/9] Seeding 40 approvals...');
  let approvalCount = 0;
  const approvalQuoteIds = quotationIds.slice(0, 40);

  for (let i = 0; i < approvalQuoteIds.length; i++) {
    const quoteId = approvalQuoteIds[i];
    const status = pick(APPROVAL_STATUSES);
    const riskScore = randFloat(5, 95);
    const stage = riskScore < 50 ? 'Sales Manager' : 'Finance Manager';
    const riskLevel = riskScore < 25 ? 'LOW' : riskScore < 50 ? 'MEDIUM' : riskScore < 75 ? 'HIGH' : 'CRITICAL';

    try {
      await prisma.approval.create({
        data: {
          quotationId: quoteId,
          approverId: 'usr-mgr-02',
          stage,
          status,
          riskLevel,
          reason: status === 'REJECTED' ? 'Discount exceeds maximum allowable threshold for customer tier' : status === 'RETURNED' ? 'Additional documentation required for margin justification' : null,
          comments: status === 'APPROVED' ? `Approved after review. Risk score: ${riskScore.toFixed(1)}. Stage: ${stage}.` : null,
          approvedAt: status === 'APPROVED' ? daysAgo(rand(1, 30)) : null,
          createdAt: daysAgo(rand(1, 90))
        }
      });
      approvalCount++;
    } catch (e) {
      // skip duplicates
    }
  }
  console.log(`   ✔ ${approvalCount} approvals created`);

  // ── 7. Orders ─────────────────────────────────────────────────────────────
  console.log('📦 [7/9] Seeding 30 orders...');
  const orderIds = [];
  const confirmedQuoteIds = quotationIds.slice(0, 30);

  for (let i = 0; i < confirmedQuoteIds.length; i++) {
    const orderNum = `ORD-2026-${String(1000 + i + 1).padStart(4, '0')}`;
    const customerId = pick(customerIds);
    const status = pick(ORDER_STATUSES);
    const totalAmount = randFloat(50000, 2000000);
    const totalRequested = rand(5, 50);
    const totalFulfilled = status === 'FULFILLED' || status === 'DELIVERED' ? totalRequested : rand(0, totalRequested);

    try {
      const order = await prisma.order.create({
        data: {
          orderNumber: orderNum,
          customerId,
          quotationId: confirmedQuoteIds[i],
          status,
          totalAmount: parseFloat(totalAmount.toFixed(2)),
          totalRequested,
          totalFulfilled,
          totalBackordered: Math.max(0, totalRequested - totalFulfilled),
          shippingAddress: CUSTOMERS_DEF.find(c => c.id === customerId)?.shippingAddress || 'India',
          notes: `Order for ${orderNum} — auto-generated demo record`,
          createdAt: daysAgo(rand(1, 120)),
          items: {
            create: [{
              productId: pick(productIds),
              requestedQuantity: rand(1, 10),
              fulfilledQuantity: totalFulfilled,
              backorderedQuantity: 0,
              unitPrice: randFloat(10000, 500000),
              totalPrice: parseFloat(totalAmount.toFixed(2))
            }]
          }
        }
      });
      orderIds.push(order.id);
    } catch (e) {
      if (e.code === 'P2002') {
        console.log(`   ⚠ Skipping duplicate order: ${orderNum}`);
      }
    }
  }
  console.log(`   ✔ ${orderIds.length} orders created`);

  // ── 8. Invoices ───────────────────────────────────────────────────────────
  console.log('📦 [8/9] Seeding 20 invoices...');
  let invoiceCount = 0;
  for (let i = 1; i <= 20; i++) {
    const invoiceNum = `INV-2026-${String(5000 + i).padStart(4, '0')}`;
    const customerId = pick(customerIds);
    const amount = randFloat(25000, 500000);
    const taxAmount = amount * 0.18;
    const totalAmount = amount + taxAmount;
    const status = pick(INVOICE_STATUSES);
    const dueDate = status === 'OVERDUE' ? daysAgo(rand(5, 60)) : daysFromNow(rand(7, 45));

    try {
      await prisma.invoice.create({
        data: {
          invoiceNumber: invoiceNum,
          customerId,
          orderId: orderIds.length > 0 ? orderIds[i - 1] || null : null,
          amount: parseFloat(amount.toFixed(2)),
          taxAmount: parseFloat(taxAmount.toFixed(2)),
          totalAmount: parseFloat(totalAmount.toFixed(2)),
          status,
          dueDate,
          paidAt: (status === 'PAID' || status === 'PARTIALLY_PAID') ? daysAgo(rand(1, 30)) : null,
          paymentMethod: status === 'PAID' ? pick(['NEFT', 'RTGS', 'Cheque', 'UPI', 'Bank Transfer']) : null,
          createdAt: daysAgo(rand(1, 90))
        }
      });
      invoiceCount++;
    } catch (e) {
      if (e.code === 'P2002') {
        console.log(`   ⚠ Skipping duplicate invoice: ${invoiceNum}`);
      }
    }
  }
  console.log(`   ✔ ${invoiceCount} invoices created`);

  // ── 9. Subscriptions ─────────────────────────────────────────────────────
  console.log('📦 [9/9] Seeding 15 subscriptions...');
  const planNames = ['Starter Plan', 'Professional Plan', 'Enterprise Revenue Engine', 'Custom Enterprise Pack', 'SMB Cloud Suite'];
  let subCount = 0;

  for (let i = 1; i <= 15; i++) {
    const contractNum = `SUB-2026-${String(2000 + i).padStart(4, '0')}`;
    const customerId = pick(customerIds);
    const cycle = pick(BILLING_CYCLES);
    const amount = cycle === 'MONTHLY' ? randFloat(5000, 50000) : cycle === 'QUARTERLY' ? randFloat(15000, 150000) : randFloat(60000, 500000);
    const nextBilling = daysFromNow(cycle === 'MONTHLY' ? rand(1, 30) : cycle === 'QUARTERLY' ? rand(1, 90) : rand(1, 365));

    try {
      await prisma.subscription.create({
        data: {
          contractNumber: contractNum,
          customerId,
          quotationId: quotationIds.length > i ? quotationIds[i] : null,
          planName: pick(planNames),
          billingCycle: cycle,
          recurringAmount: parseFloat(amount.toFixed(2)),
          status: pick(['ACTIVE', 'ACTIVE', 'ACTIVE', 'PAUSED']), // weighted toward ACTIVE
          startDate: daysAgo(rand(30, 365)),
          nextBillingDate: nextBilling,
          autoRenew: rand(0, 3) !== 0, // 75% autoRenew
          createdAt: daysAgo(rand(30, 365))
        }
      });
      subCount++;
    } catch (e) {
      if (e.code === 'P2002') {
        console.log(`   ⚠ Skipping duplicate subscription: ${contractNum}`);
      }
    }
  }
  console.log(`   ✔ ${subCount} subscriptions created`);

  // ── Summary ────────────────────────────────────────────────────────────────
  const [
    userCount, custCount, prodCount, stockCount,
    quoteCount, approveCount, orderCount, invoiceCountFinal, subFinalCount
  ] = await Promise.all([
    prisma.user.count(),
    prisma.customer.count(),
    prisma.product.count(),
    prisma.stockLevel.count(),
    prisma.quotation.count(),
    prisma.approval.count(),
    prisma.order.count(),
    prisma.invoice.count(),
    prisma.subscription.count()
  ]);

  const total = userCount + custCount + prodCount + stockCount + quoteCount + approveCount + orderCount + invoiceCountFinal + subFinalCount;

  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║          SEEDER COMPLETE — DATABASE TOTALS             ║');
  console.log('╠════════════════════════════════════════════════════════╣');
  console.log(`║  Users              : ${String(userCount).padStart(4)}                            ║`);
  console.log(`║  Customers          : ${String(custCount).padStart(4)}                            ║`);
  console.log(`║  Products           : ${String(prodCount).padStart(4)}                            ║`);
  console.log(`║  Stock Level Records: ${String(stockCount).padStart(4)}                            ║`);
  console.log(`║  Quotations         : ${String(quoteCount).padStart(4)}                            ║`);
  console.log(`║  Approvals          : ${String(approveCount).padStart(4)}                            ║`);
  console.log(`║  Orders             : ${String(orderCount).padStart(4)}                            ║`);
  console.log(`║  Invoices           : ${String(invoiceCountFinal).padStart(4)}                            ║`);
  console.log(`║  Subscriptions      : ${String(subFinalCount).padStart(4)}                            ║`);
  console.log('╠════════════════════════════════════════════════════════╣');
  console.log(`║  TOTAL DB RECORDS   : ${String(total).padStart(4)}                            ║`);
  console.log('╚════════════════════════════════════════════════════════╝\n');
}

main()
  .catch((e) => {
    console.error('\n✗ Seeder failed:', e.message);
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
