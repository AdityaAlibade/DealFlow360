const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('[DealFlow360 Seed] Starting database seeding with multi-warehouse orders & INR...');

  // 1. Password hashing for all users
  const saltRounds = 10;
  const defaultPassword = 'password123';
  const hashedPassword = bcrypt.hashSync(defaultPassword, saltRounds);

  // Clear existing data in reverse dependency order
  console.log('[DealFlow360 Seed] Cleaning up existing tables...');
  await prisma.dealHealthAlert.deleteMany({});
  await prisma.fulfillmentSplit.deleteMany({});
  await prisma.fulfillmentItem.deleteMany({});
  await prisma.fulfillment.deleteMany({});
  await prisma.backorderItem.deleteMany({});
  await prisma.backorder.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.approval.deleteMany({});
  await prisma.quotationItem.deleteMany({});
  await prisma.subscription.deleteMany({});
  await prisma.quotation.deleteMany({});
  await prisma.discountTier.deleteMany({});
  await prisma.stockLevel.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.warehouse.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.upsellRule.deleteMany({});

  // ---------------------------------------------------------
  // 1. SEED 5 PRIMARY USERS (1 user per role with Indian identity)
  // ---------------------------------------------------------
  console.log('[DealFlow360 Seed] Seeding 5 primary user credentials (1 per role)...');

  const users = await Promise.all([
    // Role 1: System Admin (Aditya Alibade)
    prisma.user.create({
      data: {
        id: 'usr-admin-01',
        email: 'adityaalibade1046@gmail.com',
        password: hashedPassword,
        fullName: 'Aditya Alibade',
        role: 'ADMIN',
        phone: '+91 98201 45678',
        department: 'Platform Administration',
        title: 'Chief Revenue Systems Architect',
        avatar: 'AA'
      }
    }),

    // Role 2: Sales Manager (Priya Sharma)
    prisma.user.create({
      data: {
        id: 'usr-mgr-02',
        email: 'salesmanager@dealflow360.com',
        password: hashedPassword,
        fullName: 'Priya Sharma',
        role: 'SALES_MANAGER',
        phone: '+91 98112 34567',
        department: 'Sales Leadership',
        title: 'Regional VP of Sales & Deal Governance',
        avatar: 'PS'
      }
    }),

    // Role 3: Sales Rep (Rajesh Kumar)
    prisma.user.create({
      data: {
        id: 'usr-rep-03',
        email: 'salesrep@dealflow360.com',
        password: hashedPassword,
        fullName: 'Rajesh Kumar',
        role: 'SALES_REP',
        phone: '+91 98450 12345',
        department: 'Enterprise Sales',
        title: 'Senior Enterprise Account Executive',
        avatar: 'RK'
      }
    }),

    // Role 4: Finance / Operations Manager (Vikram Malhotra)
    prisma.user.create({
      data: {
        id: 'usr-fin-04',
        email: 'financemanager@dealflow360.com',
        password: hashedPassword,
        fullName: 'Vikram Malhotra',
        role: 'FINANCE_OPS',
        phone: '+91 98765 43210',
        department: 'Finance & Operations',
        title: 'Director of Revenue Governance & Margin Control',
        avatar: 'VM'
      }
    }),

    // Role 5: Customer Portal Account (Ananya Deshmukh - Tata Digital)
    prisma.user.create({
      data: {
        id: 'usr-cust-05',
        email: 'customer@dealflow360.com',
        password: hashedPassword,
        fullName: 'Ananya Deshmukh',
        role: 'CUSTOMER',
        phone: '+91 98334 56789',
        department: 'Strategic Procurement',
        title: 'VP Global Strategic Sourcing (Tata Digital)',
        avatar: 'AD'
      }
    }),

    // Controlled Audit Test Users
    prisma.user.create({
      data: {
        id: 'usr-test-admin',
        email: 'admin.test@dealflow360.com',
        password: hashedPassword,
        fullName: 'Test Admin',
        role: 'ADMIN',
        avatar: 'TA'
      }
    }),
    prisma.user.create({
      data: {
        id: 'usr-test-mgr',
        email: 'salesmanager.test@dealflow360.com',
        password: hashedPassword,
        fullName: 'Test Sales Manager',
        role: 'SALES_MANAGER',
        avatar: 'SM'
      }
    }),
    prisma.user.create({
      data: {
        id: 'usr-test-rep',
        email: 'salesrep.test@dealflow360.com',
        password: hashedPassword,
        fullName: 'Test Sales Rep',
        role: 'SALES_REP',
        avatar: 'SR'
      }
    }),
    prisma.user.create({
      data: {
        id: 'usr-test-fin',
        email: 'financemanager.test@dealflow360.com',
        password: hashedPassword,
        fullName: 'Test Finance Manager',
        role: 'FINANCE_OPS',
        avatar: 'FM'
      }
    }),
    prisma.user.create({
      data: {
        id: 'usr-test-cust',
        email: 'customer.test@example.com',
        password: hashedPassword,
        fullName: 'Test Customer',
        role: 'CUSTOMER',
        avatar: 'TC'
      }
    })
  ]);

  console.log(`[DealFlow360 Seed] Created ${users.length} user accounts with password: "${defaultPassword}"`);

  // ---------------------------------------------------------
  // 2. SEED INDIAN ENTERPRISE CUSTOMERS
  // ---------------------------------------------------------
  console.log('[DealFlow360 Seed] Seeding Indian Enterprise Customers...');
  const customerTCS = await prisma.customer.create({
    data: {
      id: 'cust-tcs-01',
      name: 'Tata Consultancy Services (TCS)',
      companyName: 'TCS Enterprise Solutions Ltd',
      email: 'procurement@tcs.com',
      phone: '+91 (22) 6778-9999',
      tier: 'GOLD',
      billingAddress: 'TCS House, Raveline Street, Fort, Mumbai, MH 400001',
      shippingAddress: 'TCS Olympus, Hiranandani Estate, Thane, MH 400607'
    }
  });

  const customerInfosys = await prisma.customer.create({
    data: {
      id: 'cust-infy-02',
      name: 'Infosys Limited',
      companyName: 'Infosys Technologies',
      email: 'procurement@infosys.com',
      phone: '+91 (80) 2852-0261',
      tier: 'SILVER',
      billingAddress: '44 Infosys Drive, Electronics City, Bengaluru, KA 560100',
      shippingAddress: 'Infosys Campus, Gate 4, Electronics City, Bengaluru, KA 560100'
    }
  });

  const customerReliance = await prisma.customer.create({
    data: {
      id: 'cust-rel-03',
      name: 'Reliance Digital Enterprises',
      companyName: 'Reliance Industries Ltd',
      email: 'purchasing@reliancedigital.in',
      phone: '+91 (22) 4477-0000',
      tier: 'BRONZE',
      billingAddress: 'Reliance Corporate Park, Thane-Belapur Rd, Navi Mumbai, MH 400701',
      shippingAddress: 'RCP Logistics Hub, Gate 2, Ghansoli, Navi Mumbai, MH 400701'
    }
  });

  const customerWipro = await prisma.customer.create({
    data: {
      id: 'cust-wip-04',
      name: 'Wipro Infotech Solutions',
      companyName: 'Wipro Enterprises Ltd',
      email: 'supply@wipro.com',
      phone: '+91 (80) 2844-0011',
      tier: 'GOLD',
      billingAddress: 'Doddakannelli, Sarjapur Road, Bengaluru, KA 560035',
      shippingAddress: 'Wipro SEZ Logistics Depot, Sarjapur Rd, Bengaluru, KA 560035'
    }
  });

  const customerHDFC = await prisma.customer.create({
    data: {
      id: 'cust-hdfc-05',
      name: 'HDFC Bank Commercial Ops',
      companyName: 'HDFC Bank Ltd',
      email: 'finance.procure@hdfcbank.com',
      phone: '+91 (22) 6652-1000',
      tier: 'SILVER',
      billingAddress: 'HDFC Bank House, Senapati Bapat Marg, Lower Parel, Mumbai, MH 400013',
      shippingAddress: 'HDFC Operations Center, Kanjurmarg East, Mumbai, MH 400042'
    }
  });

  const customerTest = await prisma.customer.create({
    data: {
      id: 'cust-test-01',
      name: 'Test Customer',
      companyName: 'Test Enterprises Ltd',
      email: 'customer.test@example.com',
      phone: '+91 (22) 5555-0101',
      tier: 'SILVER',
      billingAddress: '100 Test Blvd, Cyber City, Mumbai, MH 400001',
      shippingAddress: '100 Test Blvd, Delivery Gate 1, Mumbai, MH 400001'
    }
  });

  // ---------------------------------------------------------
  // 3. SEED WAREHOUSES & LOGISTICS HUBS
  // ---------------------------------------------------------
  console.log('[DealFlow360 Seed] Seeding Warehouses & Fulfillment Hubs...');
  const whBom = await prisma.warehouse.create({
    data: {
      id: 'wh-bom-01',
      code: 'BOM-1',
      name: 'Central Fulfillment Hub Mumbai',
      location: 'Bhiwandi Logistics Park, Mumbai, MH',
      status: 'ACTIVE'
    }
  });

  const whCcu = await prisma.warehouse.create({
    data: {
      id: 'wh-ccu-02',
      code: 'CCU-1',
      name: 'East Regional Depot Kolkata',
      location: 'Dankuni Industrial Hub, Kolkata, WB',
      status: 'ACTIVE'
    }
  });

  const whBlr = await prisma.warehouse.create({
    data: {
      id: 'wh-blr-03',
      code: 'BLR-1',
      name: 'South Tech Distribution Hub',
      location: 'Electronic City Logistics Center, Bengaluru, KA',
      status: 'ACTIVE'
    }
  });

  const whDel = await prisma.warehouse.create({
    data: {
      id: 'wh-del-04',
      code: 'DEL-1',
      name: 'North Regional Depot Delhi NCR',
      location: 'Manesar Cargo Hub, Gurgaon, HR',
      status: 'ACTIVE'
    }
  });

  // Test Warehouses (WH-A, WH-B, WH-C)
  const whA = await prisma.warehouse.create({
    data: {
      id: 'wh-test-a',
      code: 'WH-A',
      name: 'Warehouse A',
      location: 'Logistics Depot A, Industrial Sector 1',
      status: 'ACTIVE'
    }
  });

  const whB = await prisma.warehouse.create({
    data: {
      id: 'wh-test-b',
      code: 'WH-B',
      name: 'Warehouse B',
      location: 'Logistics Depot B, Industrial Sector 2',
      status: 'ACTIVE'
    }
  });

  const whC = await prisma.warehouse.create({
    data: {
      id: 'wh-test-c',
      code: 'WH-C',
      name: 'Warehouse C',
      location: 'Logistics Depot C, Industrial Sector 3',
      status: 'ACTIVE'
    }
  });

  // ---------------------------------------------------------
  // 4. SEED PRODUCTS & VARIANTS (Priced in INR ₹)
  // ---------------------------------------------------------
  console.log('[DealFlow360 Seed] Seeding Product Catalog & Variants in INR...');

  const prodLaptop = await prisma.product.create({
    data: {
      id: 'prod-lpt-14',
      sku: 'SKU-HW-LPT-14',
      name: 'Enterprise Laptop Pro 14"',
      description: 'High-performance workstation laptop with Apple M3 Pro / Intel Core Ultra 9, 32GB RAM, 1TB NVMe, TPM 2.0 deal encryption.',
      category: 'Hardware',
      basePrice: 150000.0,
      standardCost: 110000.0,
      taxRate: 18.0,
      unit: 'Units',
      isSubscription: false,
      variants: {
        create: [
          {
            name: '16GB RAM / 512GB SSD',
            sku: 'SKU-HW-LPT-14-16G',
            priceDelta: -15000.0,
            attributes: JSON.stringify({ ram: '16GB', storage: '512GB SSD', screen: '14-inch OLED' })
          },
          {
            name: '32GB RAM / 1TB SSD',
            sku: 'SKU-HW-LPT-14-32G',
            priceDelta: 0.0,
            attributes: JSON.stringify({ ram: '32GB', storage: '1TB SSD', screen: '14-inch OLED Pro' })
          },
          {
            name: '64GB RAM / 2TB SSD Performance Edition',
            sku: 'SKU-HW-LPT-14-64G',
            priceDelta: 35000.0,
            attributes: JSON.stringify({ ram: '64GB', storage: '2TB SSD', screen: '14-inch 120Hz ProMotion' })
          }
        ]
      }
    }
  });

  const prodMonitor = await prisma.product.create({
    data: {
      id: 'prod-mon-4k',
      sku: 'SKU-HW-MON-4K',
      name: 'UltraHD 4K Executive Monitor 32"',
      description: 'Professional color-accurate IPS Black monitor with 90W USB-C Power Delivery and daisy-chaining support.',
      category: 'Hardware',
      basePrice: 45000.0,
      standardCost: 32000.0,
      taxRate: 18.0,
      unit: 'Units',
      isSubscription: false,
      variants: {
        create: [
          {
            name: 'Standard Stand Edition',
            sku: 'SKU-HW-MON-4K-STD',
            priceDelta: 0.0,
            attributes: JSON.stringify({ size: '32-inch', stand: 'Standard Height Adjustable' })
          },
          {
            name: 'Ergonomic Gas-Spring Dual-Arm Bundle',
            sku: 'SKU-HW-MON-4K-ARM',
            priceDelta: 8500.0,
            attributes: JSON.stringify({ size: '32-inch', stand: 'Heavy Duty Gas-Spring Arm' })
          }
        ]
      }
    }
  });

  const prodDock = await prisma.product.create({
    data: {
      id: 'prod-dck-01',
      sku: 'SKU-ACC-DCK-01',
      name: 'Ergonomic Thunderbolt 4 Docking Station Pro',
      description: 'Quad-display 40Gbps enterprise dock with 100W PD, Gigabit Ethernet, and 6 USB-A/C ports.',
      category: 'Accessories',
      basePrice: 18500.0,
      standardCost: 12000.0,
      taxRate: 18.0,
      unit: 'Units',
      isSubscription: false
    }
  });

  const prodCPQSub = await prisma.product.create({
    data: {
      id: 'prod-sft-cpq',
      sku: 'SKU-SFT-CPQ-YR',
      name: 'DealFlow360 Enterprise CPQ Platform License',
      description: 'Annual enterprise multi-seat subscription for guided quoting, governance approvals, split fulfillments, and revenue recognition.',
      category: 'Subscription',
      basePrice: 350000.0,
      standardCost: 85000.0,
      taxRate: 18.0,
      unit: 'Seats/Year',
      isSubscription: true
    }
  });

  const prodCloudCare = await prisma.product.create({
    data: {
      id: 'prod-srv-cld',
      sku: 'SKU-SRV-CLD-CARE',
      name: 'Cloud Infrastructure Care & 24/7 SLA',
      description: 'Dedicated TAM (Technical Account Manager), 99.99% uptime guarantee, 15-minute emergency response SLA.',
      category: 'Subscription',
      basePrice: 120000.0,
      standardCost: 40000.0,
      taxRate: 18.0,
      unit: 'Year',
      isSubscription: true
    }
  });

  const prodSecurity = await prisma.product.create({
    data: {
      id: 'prod-srv-sec',
      sku: 'SKU-SRV-SEC-PRO',
      name: 'Zero-Trust Security & Compliance Suite',
      description: 'Automated SOC2 compliance monitoring, SIEM log forwarding, biometric MFA enforcement.',
      category: 'Subscription',
      basePrice: 95000.0,
      standardCost: 25000.0,
      taxRate: 18.0,
      unit: 'Year',
      isSubscription: true
    }
  });

  const prodOnsite = await prisma.product.create({
    data: {
      id: 'prod-srv-ons',
      sku: 'SKU-SRV-ONS-SETUP',
      name: 'White-Glove Onsite Migration & Deployment',
      description: 'Onsite certified engineers for network architecture, ERP synchronization, employee onboarding, and turnkey rollout.',
      category: 'Services',
      basePrice: 250000.0,
      standardCost: 120000.0,
      taxRate: 18.0,
      unit: 'Engagements',
      isSubscription: false
    }
  });

  // Controlled Audit Products (Product A, Product B, Product C)
  const prodA = await prisma.product.create({
    data: {
      id: 'prod-test-a',
      sku: 'SKU-PROD-A',
      name: 'Product A',
      description: 'Controlled Test Product A (₹1,000)',
      category: 'Hardware',
      basePrice: 1000.0,
      standardCost: 700.0,
      taxRate: 18.0,
      unit: 'Units',
      isSubscription: false
    }
  });

  const prodB = await prisma.product.create({
    data: {
      id: 'prod-test-b',
      sku: 'SKU-PROD-B',
      name: 'Product B',
      description: 'Controlled Test Product B (₹2,000)',
      category: 'Hardware',
      basePrice: 2000.0,
      standardCost: 1400.0,
      taxRate: 18.0,
      unit: 'Units',
      isSubscription: false
    }
  });

  const prodC = await prisma.product.create({
    data: {
      id: 'prod-test-c',
      sku: 'SKU-PROD-C',
      name: 'Product C',
      description: 'Controlled Test Product C (₹500)',
      category: 'Accessories',
      basePrice: 500.0,
      standardCost: 350.0,
      taxRate: 18.0,
      unit: 'Units',
      isSubscription: false
    }
  });

  // ---------------------------------------------------------
  // 5. SEED STOCK LEVELS (Deterministic levels for test scenarios)
  // ---------------------------------------------------------
  console.log('[DealFlow360 Seed] Seeding Real-Time Warehouse Stock Levels...');
  const stockData = [
    // Laptop: BOM-1 has 6, BLR-1 has 4 available (Perfect for 10-unit split)
    { productId: prodLaptop.id, warehouseId: whBom.id, inStock: 30, reserved: 6, available: 24, incoming: 10, backordered: 0 },
    { productId: prodLaptop.id, warehouseId: whCcu.id, inStock: 5, reserved: 0, available: 5, incoming: 0, backordered: 0 },
    { productId: prodLaptop.id, warehouseId: whBlr.id, inStock: 20, reserved: 4, available: 16, incoming: 15, backordered: 0 },
    { productId: prodLaptop.id, warehouseId: whDel.id, inStock: 10, reserved: 0, available: 10, incoming: 5, backordered: 0 },

    // Monitor: BOM-1 has 6, others have 0 available (For 6 fulfilled + 4 backorder scenario)
    { productId: prodMonitor.id, warehouseId: whBom.id, inStock: 25, reserved: 6, available: 19, incoming: 20, backordered: 4 },
    { productId: prodMonitor.id, warehouseId: whCcu.id, inStock: 0, reserved: 0, available: 0, incoming: 0, backordered: 0 },
    { productId: prodMonitor.id, warehouseId: whBlr.id, inStock: 0, reserved: 0, available: 0, incoming: 10, backordered: 0 },
    { productId: prodMonitor.id, warehouseId: whDel.id, inStock: 0, reserved: 0, available: 0, incoming: 0, backordered: 0 },

    // Dock: BOM-1 (3), BLR-1 (4), DEL-1 (2) -> 9 available, 1 backordered
    { productId: prodDock.id, warehouseId: whBom.id, inStock: 50, reserved: 3, available: 47, incoming: 20, backordered: 1 },
    { productId: prodDock.id, warehouseId: whCcu.id, inStock: 0, reserved: 0, available: 0, incoming: 0, backordered: 0 },
    { productId: prodDock.id, warehouseId: whBlr.id, inStock: 35, reserved: 4, available: 31, incoming: 15, backordered: 0 },
    { productId: prodDock.id, warehouseId: whDel.id, inStock: 20, reserved: 2, available: 18, incoming: 10, backordered: 0 },

    // Controlled Audit Test Stock Levels:
    // Warehouse A: Product A = 6, Product B = 10, Product C = 20
    { productId: prodA.id, warehouseId: whA.id, inStock: 6, reserved: 0, available: 6, incoming: 0, backordered: 0 },
    { productId: prodB.id, warehouseId: whA.id, inStock: 10, reserved: 0, available: 10, incoming: 0, backordered: 0 },
    { productId: prodC.id, warehouseId: whA.id, inStock: 20, reserved: 0, available: 20, incoming: 0, backordered: 0 },

    // Warehouse B: Product A = 4, Product B = 0, Product C = 10
    { productId: prodA.id, warehouseId: whB.id, inStock: 4, reserved: 0, available: 4, incoming: 0, backordered: 0 },
    { productId: prodB.id, warehouseId: whB.id, inStock: 0, reserved: 0, available: 0, incoming: 0, backordered: 0 },
    { productId: prodC.id, warehouseId: whB.id, inStock: 10, reserved: 0, available: 10, incoming: 0, backordered: 0 },

    // Warehouse C: Product A = 0, Product B = 5, Product C = 0
    { productId: prodA.id, warehouseId: whC.id, inStock: 0, reserved: 0, available: 0, incoming: 0, backordered: 0 },
    { productId: prodB.id, warehouseId: whC.id, inStock: 5, reserved: 0, available: 5, incoming: 0, backordered: 0 },
    { productId: prodC.id, warehouseId: whC.id, inStock: 0, reserved: 0, available: 0, incoming: 0, backordered: 0 }
  ];

  for (const s of stockData) {
    await prisma.stockLevel.create({ data: s });
  }

  // ---------------------------------------------------------
  // 5.5 SEED SUBSCRIPTION PLANS
  // ---------------------------------------------------------
  console.log('[DealFlow360 Seed] Seeding Subscription Plans...');
  await prisma.subscriptionPlan.createMany({
    data: [
      {
        slug: 'starter',
        name: 'Starter Plan',
        description: 'Standard CPQ quoting, single-depot dispatch, 5 users',
        price: 4999.0,
        billingCycle: 'MONTHLY',
        trialDays: 14,
        maxQuotes: 25,
        maxUsers: 5,
        features: JSON.stringify(['basic_cpq', 'standard_invoices', 'single_warehouse']),
        isActive: true
      },
      {
        slug: 'pro',
        name: 'Professional Plan',
        description: 'Multi-warehouse auto-split, backorders queue, deal health analytics',
        price: 19999.0,
        billingCycle: 'MONTHLY',
        trialDays: 14,
        maxQuotes: 200,
        maxUsers: 25,
        features: JSON.stringify(['basic_cpq', 'standard_invoices', 'multi_warehouse', 'deal_health', 'backorders']),
        isActive: true
      },
      {
        slug: 'enterprise',
        name: 'Enterprise Revenue Engine',
        description: 'Unlimited CPQ, automated risk governance, AI upsell intelligence',
        price: 49999.0,
        billingCycle: 'MONTHLY',
        trialDays: 30,
        maxQuotes: 999999,
        maxUsers: 999,
        features: JSON.stringify(['basic_cpq', 'standard_invoices', 'multi_warehouse', 'deal_health', 'backorders', 'ai_intelligence', 'unlimited_rbac']),
        isActive: true
      }
    ]
  });

  // ---------------------------------------------------------
  // 6. SEED DISCOUNT TIERS
  // ---------------------------------------------------------
  console.log('[DealFlow360 Seed] Seeding Tiered Discount Rules...');
  const discountTiers = [
    { tierName: 'Gold Enterprise Volume', minQuantity: 1, maxQuantity: 10, maxDiscount: 15.0, customerTier: 'GOLD' },
    { tierName: 'Gold Strategic Bulk', minQuantity: 11, maxQuantity: 50, maxDiscount: 22.5, customerTier: 'GOLD' },
    { tierName: 'Gold Megadeal Override', minQuantity: 51, maxQuantity: 999, maxDiscount: 30.0, customerTier: 'GOLD' },
    { tierName: 'Silver Tier Standard', minQuantity: 1, maxQuantity: 10, maxDiscount: 10.0, customerTier: 'SILVER' },
    { tierName: 'Silver Bulk Tier', minQuantity: 11, maxQuantity: 50, maxDiscount: 18.0, customerTier: 'SILVER' },
    { tierName: 'Bronze Retail Standard', minQuantity: 1, maxQuantity: 20, maxDiscount: 7.5, customerTier: 'BRONZE' }
  ];

  for (const dt of discountTiers) {
    await prisma.discountTier.create({ data: dt });
  }

  // ---------------------------------------------------------
  // 7. SEED UPSELL RULES
  // ---------------------------------------------------------
  console.log('[DealFlow360 Seed] Seeding Margin Uplift Upsell Rules...');
  await prisma.upsellRule.createMany({
    data: [
      {
        name: 'Hardware -> 24/7 Cloud Care SLA Bundle',
        triggerCategory: 'Hardware',
        recommendedSku: 'SKU-SRV-CLD-CARE',
        marginUplift: 15.5,
        badge: 'HIGH MARGIN BUNDLE',
        isActive: true
      },
      {
        name: 'Laptop Workstation -> Thunderbolt 4 Dock Pro',
        triggerCategory: 'Hardware',
        recommendedSku: 'SKU-ACC-DCK-01',
        marginUplift: 9.8,
        badge: 'ESSENTIAL WORKSPACE',
        isActive: true
      },
      {
        name: 'Platform License -> Zero-Trust Security Suite',
        triggerCategory: 'Subscription',
        recommendedSku: 'SKU-SRV-SEC-PRO',
        marginUplift: 18.2,
        badge: 'SECURITY COMPLIANCE',
        isActive: true
      }
    ]
  });

  // ---------------------------------------------------------
  // 8. SEED QUOTATIONS
  // ---------------------------------------------------------
  console.log('[DealFlow360 Seed] Seeding Enterprise Quotations & Items in INR...');

  const q1042 = await prisma.quotation.create({
    data: {
      quoteNumber: 'Q-1042',
      customerId: customerTCS.id,
      salesRepId: 'usr-rep-03',
      status: 'APPROVED',
      subtotal: 935000.0,
      totalDiscount: 85000.0,
      taxAmount: 153000.0,
      totalAmount: 1003000.0,
      blendedMargin: 28.5,
      blendedRiskScore: 32.5,
      portalToken: 'demo-token-123',
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      items: {
        create: [
          {
            productId: prodLaptop.id,
            quantity: 3,
            unitPrice: 150000.0,
            discountPercent: 12.0,
            allowedLimit: 10.0,
            netPrice: 396000.0,
            marginPercent: 24.5,
            isOverLimit: true
          },
          {
            productId: prodMonitor.id,
            quantity: 3,
            unitPrice: 45000.0,
            discountPercent: 8.0,
            allowedLimit: 10.0,
            netPrice: 124200.0,
            marginPercent: 28.2,
            isOverLimit: false
          },
          {
            productId: prodCPQSub.id,
            quantity: 1,
            unitPrice: 350000.0,
            discountPercent: 5.0,
            allowedLimit: 15.0,
            netPrice: 332500.0,
            marginPercent: 74.0,
            isOverLimit: false
          }
        ]
      }
    }
  });

  const q1039 = await prisma.quotation.create({
    data: {
      quoteNumber: 'Q-1039',
      customerId: customerInfosys.id,
      salesRepId: 'usr-rep-03',
      status: 'APPROVED',
      subtotal: 1070000.0,
      totalDiscount: 95000.0,
      taxAmount: 175500.0,
      totalAmount: 1150500.0,
      blendedMargin: 33.2,
      blendedRiskScore: 14.0,
      portalToken: 'portal-infosys-1039',
      expiresAt: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000)
    }
  });

  // ---------------------------------------------------------
  // 9. SEED BUSINESS SCENARIOS FOR ORDERS, MULTI-WAREHOUSE FULFILLMENTS & BACKORDERS
  // ---------------------------------------------------------
  console.log('[DealFlow360 Seed] Seeding Multi-Warehouse Customer Orders (Cases 1, 2, 3)...');

  // =========================================================
  // SCENARIO 1: ORDER #1001 — MULTI-WAREHOUSE SPLIT (10 Laptops: WH A -> 6, WH B -> 4)
  // =========================================================
  const order1001 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-1001',
      customerId: customerTCS.id,
      quotationId: q1042.id,
      status: 'PARTIALLY_DISPATCHED',
      totalAmount: 1770000.0, // 10 * 150000 + 18% tax
      totalRequested: 10,
      totalFulfilled: 10,
      totalBackordered: 0,
      shippingAddress: 'TCS Olympus, Hiranandani Estate, Thane, MH 400607',
      notes: 'Customer requires split delivery from Mumbai & Bengaluru depots.',
      items: {
        create: [
          {
            productId: prodLaptop.id,
            requestedQuantity: 10,
            fulfilledQuantity: 10,
            backorderedQuantity: 0,
            unitPrice: 150000.0,
            totalPrice: 1500000.0
          }
        ]
      }
    },
    include: { items: true }
  });

  const order1001Item = order1001.items[0];

  // Fulfillment 1001-1: Warehouse Mumbai (BOM-1) -> 6 Units (Dispatched)
  const ful1001A = await prisma.fulfillment.create({
    data: {
      orderId: order1001.id,
      warehouseId: whBom.id,
      fulfillmentNumber: 'FUL-ORD-1001-BOM-1',
      orderNumber: 'ORD-1001',
      status: 'DISPATCHED',
      totalUnits: 6,
      totalQuantity: 6,
      backorderedUnits: 0,
      shippingCost: 1500.0,
      carrier: 'BlueDart Express',
      trackingNumber: 'AWB-BLU-88219041',
      dispatchedAt: new Date(Date.now() - 6 * 3600 * 1000),
      items: {
        create: [
          {
            orderItemId: order1001Item.id,
            productId: prodLaptop.id,
            quantity: 6,
            unitPrice: 150000.0
          }
        ]
      }
    }
  });

  // Invoice for Fulfillment 1001-1 (Mumbai)
  await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-ORD-1001-BOM-1',
      customerId: customerTCS.id,
      orderId: order1001.id,
      fulfillmentId: ful1001A.id,
      warehouseId: whBom.id,
      amount: 900000.0,
      taxAmount: 162000.0,
      totalAmount: 1062000.0,
      status: 'PAID',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      paidAt: new Date(Date.now() - 2 * 3600 * 1000),
      paymentMethod: 'RTGS / HDFC Corporate'
    }
  });

  // Fulfillment 1001-2: Warehouse Bengaluru (BLR-1) -> 4 Units (Ready for dispatch)
  const ful1001B = await prisma.fulfillment.create({
    data: {
      orderId: order1001.id,
      warehouseId: whBlr.id,
      fulfillmentNumber: 'FUL-ORD-1001-BLR-1',
      orderNumber: 'ORD-1001',
      status: 'READY',
      totalUnits: 4,
      totalQuantity: 4,
      backorderedUnits: 0,
      shippingCost: 1000.0,
      carrier: 'Delhivery Surface Cargo',
      trackingNumber: 'AWB-DEL-44190822',
      items: {
        create: [
          {
            orderItemId: order1001Item.id,
            productId: prodLaptop.id,
            quantity: 4,
            unitPrice: 150000.0
          }
        ]
      }
    }
  });

  // Invoice for Fulfillment 1001-2 (Bengaluru)
  await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-ORD-1001-BLR-1',
      customerId: customerTCS.id,
      orderId: order1001.id,
      fulfillmentId: ful1001B.id,
      warehouseId: whBlr.id,
      amount: 600000.0,
      taxAmount: 108000.0,
      totalAmount: 708000.0,
      status: 'UNPAID',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      paymentMethod: 'Corporate Wire / RTGS'
    }
  });

  // =========================================================
  // SCENARIO 2: ORDER #1002 — PARTIAL FULFILLMENT + BACKORDER (10 Monitors: 6 from WH A, 4 Backordered)
  // =========================================================
  const order1002 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-1002',
      customerId: customerInfosys.id,
      quotationId: q1039.id,
      status: 'PARTIALLY_FULFILLED',
      totalAmount: 531000.0, // 10 * 45000 + 18% tax
      totalRequested: 10,
      totalFulfilled: 6,
      totalBackordered: 4,
      shippingAddress: 'Infosys Campus, Gate 4, Electronics City, Bengaluru, KA 560100',
      notes: 'Initial 6 units dispatched immediately. Remaining 4 units placed on factory backorder.',
      items: {
        create: [
          {
            productId: prodMonitor.id,
            requestedQuantity: 10,
            fulfilledQuantity: 6,
            backorderedQuantity: 4,
            unitPrice: 45000.0,
            totalPrice: 450000.0
          }
        ]
      }
    },
    include: { items: true }
  });

  const order1002Item = order1002.items[0];

  // Fulfillment 1002-1: Warehouse Mumbai (BOM-1) -> 6 Units
  const ful1002A = await prisma.fulfillment.create({
    data: {
      orderId: order1002.id,
      warehouseId: whBom.id,
      fulfillmentNumber: 'FUL-ORD-1002-BOM-1',
      orderNumber: 'ORD-1002',
      status: 'READY',
      totalUnits: 6,
      totalQuantity: 6,
      backorderedUnits: 0,
      shippingCost: 1500.0,
      carrier: 'BlueDart Express',
      trackingNumber: 'AWB-BLU-99210088',
      items: {
        create: [
          {
            orderItemId: order1002Item.id,
            productId: prodMonitor.id,
            quantity: 6,
            unitPrice: 45000.0
          }
        ]
      }
    }
  });

  // Invoice for Fulfillment 1002-1
  await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-ORD-1002-BOM-1',
      customerId: customerInfosys.id,
      orderId: order1002.id,
      fulfillmentId: ful1002A.id,
      warehouseId: whBom.id,
      amount: 270000.0,
      taxAmount: 48600.0,
      totalAmount: 318600.0,
      status: 'UNPAID',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  });

  // Backorder for Order 1002 -> 4 Units
  await prisma.backorder.create({
    data: {
      orderId: order1002.id,
      status: 'BACKORDERED',
      items: {
        create: [
          {
            orderItemId: order1002Item.id,
            productId: prodMonitor.id,
            quantity: 4,
            fulfilledQuantity: 0,
            remainingQuantity: 4
          }
        ]
      }
    }
  });

  // =========================================================
  // SCENARIO 3: ORDER #1003 — 3-WAREHOUSE SPLIT + 1 BACKORDER (10 Docks: BOM:3, BLR:4, DEL:2, BO:1)
  // =========================================================
  const order1003 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-1003',
      customerId: customerReliance.id,
      status: 'PARTIALLY_FULFILLED',
      totalAmount: 218300.0, // 10 * 18500 + 18% tax
      totalRequested: 10,
      totalFulfilled: 9,
      totalBackordered: 1,
      shippingAddress: 'Reliance Corporate Park, Ghansoli, Navi Mumbai, MH 400701',
      notes: 'Tri-depot multi-split fulfillment.',
      items: {
        create: [
          {
            productId: prodDock.id,
            requestedQuantity: 10,
            fulfilledQuantity: 9,
            backorderedQuantity: 1,
            unitPrice: 18500.0,
            totalPrice: 185000.0
          }
        ]
      }
    },
    include: { items: true }
  });

  const order1003Item = order1003.items[0];

  // Fulfillments across 3 warehouses
  await prisma.fulfillment.create({
    data: {
      orderId: order1003.id,
      warehouseId: whBom.id,
      fulfillmentNumber: 'FUL-ORD-1003-BOM-1',
      orderNumber: 'ORD-1003',
      status: 'READY',
      totalUnits: 3,
      totalQuantity: 3,
      shippingCost: 750.0,
      items: {
        create: [{ orderItemId: order1003Item.id, productId: prodDock.id, quantity: 3, unitPrice: 18500.0 }]
      }
    }
  });

  await prisma.fulfillment.create({
    data: {
      orderId: order1003.id,
      warehouseId: whBlr.id,
      fulfillmentNumber: 'FUL-ORD-1003-BLR-1',
      orderNumber: 'ORD-1003',
      status: 'READY',
      totalUnits: 4,
      totalQuantity: 4,
      shippingCost: 1000.0,
      items: {
        create: [{ orderItemId: order1003Item.id, productId: prodDock.id, quantity: 4, unitPrice: 18500.0 }]
      }
    }
  });

  await prisma.fulfillment.create({
    data: {
      orderId: order1003.id,
      warehouseId: whDel.id,
      fulfillmentNumber: 'FUL-ORD-1003-DEL-1',
      orderNumber: 'ORD-1003',
      status: 'READY',
      totalUnits: 2,
      totalQuantity: 2,
      shippingCost: 500.0,
      items: {
        create: [{ orderItemId: order1003Item.id, productId: prodDock.id, quantity: 2, unitPrice: 18500.0 }]
      }
    }
  });

  // Backorder of 1 unit
  await prisma.backorder.create({
    data: {
      orderId: order1003.id,
      status: 'BACKORDERED',
      items: {
        create: [
          {
            orderItemId: order1003Item.id,
            productId: prodDock.id,
            quantity: 1,
            fulfilledQuantity: 0,
            remainingQuantity: 1
          }
        ]
      }
    }
  });

  // ---------------------------------------------------------
  // 10. SEED GOVERNANCE APPROVALS & DEAL HEALTH
  // ---------------------------------------------------------
  console.log('[DealFlow360 Seed] Seeding Governance Approval Chains...');
  await prisma.approval.createMany({
    data: [
      {
        quotationId: q1042.id,
        approverId: 'usr-mgr-02',
        stage: 'Sales Manager (L1)',
        status: 'APPROVED',
        riskLevel: 'MEDIUM',
        reason: 'Enterprise Laptop Pro 14" discount (12%) exceeds rep cap of 10%',
        comments: 'Approved by Priya Sharma based on Tata strategic Gold Tier relationship and 3-unit commitment.',
        approvedAt: new Date(Date.now() - 2 * 3600 * 1000)
      }
    ]
  });

  console.log('[DealFlow360 Seed] Seeding Deal Health Alerts...');
  await prisma.dealHealthAlert.createMany({
    data: [
      {
        quotationId: q1042.id,
        severity: 'INFO',
        title: 'Multi-Warehouse Split Optimization Verified',
        description: 'Order ORD-1001 successfully split between Mumbai (BOM-1) and Bengaluru (BLR-1) hubs.',
        anomalyType: 'FULFILLMENT_OPTIMIZATION',
        isResolved: true,
        resolvedAt: new Date()
      }
    ]
  });

  console.log('\n============================================================');
  console.log('✔ [DealFlow360 Seed] Database successfully seeded with:');
  console.log('   - 5 Indian RBAC Users (Aditya, Priya, Rajesh, Vikram, Ananya)');
  console.log('   - 5 Indian Enterprise Customers (TCS, Infosys, Reliance, Wipro, HDFC)');
  console.log('   - 4 Multi-Region Indian Hubs (Mumbai, Kolkata, Bengaluru, Delhi NCR)');
  console.log('   - 7 Core Hardware/Software/Services Products in INR (₹)');
  console.log('   - Real-Time Multi-Warehouse Stock Levels (Total, Reserved, Available)');
  console.log('   - 3 Realistic Customer Orders:');
  console.log('       1. ORD-1001: 10 units -> Split WH A (6) + WH B (4)');
  console.log('       2. ORD-1002: 10 units -> WH A (6) + Backorder (4)');
  console.log('       3. ORD-1003: 10 units -> 3-Warehouse Split (3+4+2) + Backorder (1)');
  console.log('   - Warehouse-specific Invoices associated with Parent Orders');
  console.log('   - Active Backorders with 1-click fulfillment workflows');
  console.log('============================================================\n');
}

main()
  .catch((e) => {
    console.error('[DealFlow360 Seed Error]:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
