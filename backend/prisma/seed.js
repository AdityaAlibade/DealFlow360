const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('[DealFlow360 Seed] Starting database seeding...');

  // 1. Password hashing for all users
  const saltRounds = 10;
  const defaultPassword = 'password123';
  const hashedPassword = bcrypt.hashSync(defaultPassword, saltRounds);

  // Clear existing data in reverse dependency order
  console.log('[DealFlow360 Seed] Cleaning up existing tables...');
  await prisma.dealHealthAlert.deleteMany({});
  await prisma.fulfillmentSplit.deleteMany({});
  await prisma.fulfillment.deleteMany({});
  await prisma.approval.deleteMany({});
  await prisma.quotationItem.deleteMany({});
  await prisma.invoice.deleteMany({});
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
  // 1. SEED 5 PRIMARY USERS (1 user per role)
  // ---------------------------------------------------------
  console.log('[DealFlow360 Seed] Seeding 5 primary user credentials (1 per role)...');

  const users = await Promise.all([
    // Role 1: System Admin (Only 1)
    prisma.user.create({
      data: {
        id: 'usr-admin-01',
        email: 'adityaalibade1046@gmail.com',
        password: hashedPassword,
        fullName: 'Alex Rivera',
        role: 'ADMIN',
        phone: '+1 (555) 901-2847',
        department: 'Platform Administration',
        title: 'Chief Revenue Systems Architect',
        avatar: 'AD'
      }
    }),

    // Role 2: Sales Manager (Only 1)
    prisma.user.create({
      data: {
        id: 'usr-mgr-02',
        email: 'salesmanager@dealflow360.com',
        password: hashedPassword,
        fullName: 'Sarah Jenkins',
        role: 'SALES_MANAGER',
        phone: '+1 (555) 392-8172',
        department: 'Sales Leadership',
        title: 'Regional VP of Sales & Deal Governance',
        avatar: 'SM'
      }
    }),

    // Role 3: Sales Rep (Only 1)
    prisma.user.create({
      data: {
        id: 'usr-rep-03',
        email: 'salesrep@dealflow360.com',
        password: hashedPassword,
        fullName: 'John Doe',
        role: 'SALES_REP',
        phone: '+1 (555) 382-9104',
        department: 'Enterprise Sales',
        title: 'Senior Enterprise Account Executive',
        avatar: 'SR'
      }
    }),

    // Role 4: Finance / Operations Manager (Only 1)
    prisma.user.create({
      data: {
        id: 'usr-fin-04',
        email: 'financemanager@dealflow360.com',
        password: hashedPassword,
        fullName: 'Marcus Vance',
        role: 'FINANCE_OPS',
        phone: '+1 (555) 714-2901',
        department: 'Finance & Operations',
        title: 'Director of Revenue Governance & Margin Control',
        avatar: 'FM'
      }
    }),

    // Role 5: Customer Portal Account (Only 1)
    prisma.user.create({
      data: {
        id: 'usr-cust-05',
        email: 'customer@dealflow360.com',
        password: hashedPassword,
        fullName: 'Acme Corp Buyer',
        role: 'CUSTOMER',
        phone: '+1 (555) 629-1049',
        department: 'Client Procurement',
        title: 'VP Global Strategic Sourcing',
        avatar: 'CU'
      }
    })
  ]);

  console.log(`[DealFlow360 Seed] Created ${users.length} user accounts with password: "${defaultPassword}"`);

  // ---------------------------------------------------------
  // 2. SEED CUSTOMERS
  // ---------------------------------------------------------
  console.log('[DealFlow360 Seed] Seeding Enterprise Customers...');
  const customerAcme = await prisma.customer.create({
    data: {
      id: 'cust-acme-01',
      name: 'Acme Global Corporation',
      companyName: 'Acme Corp',
      email: 'buyer@acmecorp.com',
      phone: '+1 (555) 201-9000',
      tier: 'GOLD',
      billingAddress: '100 Silicon Ave, Suite 500, San Jose, CA 95110',
      shippingAddress: '450 Tech Distribution Center, Fremont, CA 94538'
    }
  });

  const customerBeta = await prisma.customer.create({
    data: {
      id: 'cust-beta-02',
      name: 'Beta Industries International',
      companyName: 'Beta Industries',
      email: 'procurement@betaindustries.com',
      phone: '+1 (555) 482-1923',
      tier: 'SILVER',
      billingAddress: '782 Industrial Pkwy, Chicago, IL 60607',
      shippingAddress: '782 Industrial Pkwy, Dock 4, Chicago, IL 60607'
    }
  });

  const customerNova = await prisma.customer.create({
    data: {
      id: 'cust-nova-03',
      name: 'Nova Retail Technologies',
      companyName: 'Nova Retail',
      email: 'purchasing@novaretail.io',
      phone: '+1 (555) 791-4455',
      tier: 'BRONZE',
      billingAddress: '310 Commerce Blvd, Austin, TX 78701',
      shippingAddress: '12 Logistics Way, Round Rock, TX 78664'
    }
  });

  const customerApex = await prisma.customer.create({
    data: {
      id: 'cust-apex-04',
      name: 'Apex Dynamics Corp',
      companyName: 'Apex Dynamics',
      email: 'supply@apexdynamics.com',
      phone: '+1 (555) 670-3321',
      tier: 'GOLD',
      billingAddress: '55 Wall St, Financial District, New York, NY 10005',
      shippingAddress: '88 Harbor Terminal, Jersey City, NJ 07305'
    }
  });

  const customerGlobal = await prisma.customer.create({
    data: {
      id: 'cust-global-05',
      name: 'Global Logistics Alliance',
      companyName: 'Global Logistics',
      email: 'finance@globallogistics.com',
      phone: '+1 (555) 912-8800',
      tier: 'SILVER',
      billingAddress: '400 Peachtree St, Atlanta, GA 30308',
      shippingAddress: '1000 Airport Freight Rd, Atlanta, GA 30320'
    }
  });

  // ---------------------------------------------------------
  // 3. SEED WAREHOUSES
  // ---------------------------------------------------------
  console.log('[DealFlow360 Seed] Seeding Warehouses & Fulfillment Hubs...');
  const whBom = await prisma.warehouse.create({
    data: {
      id: 'wh-bom-01',
      code: 'BOM-1',
      name: 'Central Fulfillment Hub Mumbai',
      location: 'Bhiwandi Logistics Park, Mumbai, MH'
    }
  });

  const whCcu = await prisma.warehouse.create({
    data: {
      id: 'wh-ccu-02',
      code: 'CCU-1',
      name: 'East Regional Depot Kolkata',
      location: 'Dankuni Industrial Hub, Kolkata, WB'
    }
  });

  const whBlr = await prisma.warehouse.create({
    data: {
      id: 'wh-blr-03',
      code: 'BLR-1',
      name: 'South Tech Distribution Hub',
      location: 'Electronic City Logistics Center, Bengaluru, KA'
    }
  });

  const whDel = await prisma.warehouse.create({
    data: {
      id: 'wh-del-04',
      code: 'DEL-1',
      name: 'North Regional Depot Delhi NCR',
      location: 'Manesar Cargo Hub, Gurgaon, HR'
    }
  });

  // ---------------------------------------------------------
  // 4. SEED PRODUCTS & VARIANTS
  // ---------------------------------------------------------
  console.log('[DealFlow360 Seed] Seeding Product Catalog & Variants...');

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
      basePrice: 12500.0,
      standardCost: 7200.0,
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
      basePrice: 95000.0,
      standardCost: 25000.0,
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
      basePrice: 24000.0,
      standardCost: 8000.0,
      taxRate: 18.0,
      unit: 'Month',
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
      basePrice: 36000.0,
      standardCost: 12000.0,
      taxRate: 18.0,
      unit: 'Month',
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
      basePrice: 65000.0,
      standardCost: 30000.0,
      taxRate: 18.0,
      unit: 'Engagements',
      isSubscription: false
    }
  });

  // ---------------------------------------------------------
  // 5. SEED STOCK LEVELS
  // ---------------------------------------------------------
  console.log('[DealFlow360 Seed] Seeding Real-Time Warehouse Stock Levels...');
  const stockData = [
    { productId: prodLaptop.id, warehouseId: whBom.id, inStock: 120, reserved: 25, available: 95 },
    { productId: prodLaptop.id, warehouseId: whCcu.id, inStock: 45, reserved: 10, available: 35 },
    { productId: prodLaptop.id, warehouseId: whBlr.id, inStock: 80, reserved: 15, available: 65 },
    { productId: prodLaptop.id, warehouseId: whDel.id, inStock: 60, reserved: 5, available: 55 },

    { productId: prodMonitor.id, warehouseId: whBom.id, inStock: 90, reserved: 20, available: 70 },
    { productId: prodMonitor.id, warehouseId: whCcu.id, inStock: 30, reserved: 5, available: 25 },
    { productId: prodMonitor.id, warehouseId: whBlr.id, inStock: 50, reserved: 10, available: 40 },
    { productId: prodMonitor.id, warehouseId: whDel.id, inStock: 40, reserved: 8, available: 32 },

    { productId: prodDock.id, warehouseId: whBom.id, inStock: 250, reserved: 40, available: 210 },
    { productId: prodDock.id, warehouseId: whCcu.id, inStock: 80, reserved: 15, available: 65 },
    { productId: prodDock.id, warehouseId: whBlr.id, inStock: 140, reserved: 20, available: 120 },
    { productId: prodDock.id, warehouseId: whDel.id, inStock: 110, reserved: 10, available: 100 }
  ];

  for (const s of stockData) {
    await prisma.stockLevel.create({ data: s });
  }

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
  // 8. SEED QUOTATIONS & LINE ITEMS
  // ---------------------------------------------------------
  console.log('[DealFlow360 Seed] Seeding Enterprise Quotations & Items...');

  // Quotation 1: Q-1042 (Pending Approval with Acme Corp)
  const q1042 = await prisma.quotation.create({
    data: {
      quoteNumber: 'Q-1042',
      customerId: customerAcme.id,
      salesRepId: 'usr-rep-03',
      status: 'PENDING_APPROVAL',
      subtotal: 620000.0,
      totalDiscount: 62000.0,
      taxAmount: 100440.0,
      totalAmount: 658440.0,
      blendedMargin: 26.8,
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
            unitPrice: 95000.0,
            discountPercent: 5.0,
            allowedLimit: 15.0,
            netPrice: 90250.0,
            marginPercent: 72.0,
            isOverLimit: false
          }
        ]
      }
    }
  });

  // Quotation 2: Q-1039 (Approved Cloud & Support Migration for Beta Industries)
  const q1039 = await prisma.quotation.create({
    data: {
      quoteNumber: 'Q-1039',
      customerId: customerBeta.id,
      salesRepId: 'usr-rep-03',
      status: 'APPROVED',
      subtotal: 410000.0,
      totalDiscount: 35000.0,
      taxAmount: 67500.0,
      totalAmount: 442500.0,
      blendedMargin: 31.5,
      blendedRiskScore: 14.0,
      portalToken: 'portal-beta-1039',
      expiresAt: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      items: {
        create: [
          {
            productId: prodCPQSub.id,
            quantity: 2,
            unitPrice: 95000.0,
            discountPercent: 10.0,
            allowedLimit: 15.0,
            netPrice: 171000.0,
            marginPercent: 71.0,
            isOverLimit: false
          },
          {
            productId: prodCloudCare.id,
            quantity: 6,
            unitPrice: 24000.0,
            discountPercent: 5.0,
            allowedLimit: 10.0,
            netPrice: 136800.0,
            marginPercent: 65.0,
            isOverLimit: false
          },
          {
            productId: prodOnsite.id,
            quantity: 1,
            unitPrice: 65000.0,
            discountPercent: 0.0,
            allowedLimit: 5.0,
            netPrice: 65000.0,
            marginPercent: 53.8,
            isOverLimit: false
          }
        ]
      }
    }
  });

  // Quotation 3: Q-1035 (Confirmed Deal with Nova Retail)
  const q1035 = await prisma.quotation.create({
    data: {
      quoteNumber: 'Q-1035',
      customerId: customerNova.id,
      salesRepId: 'usr-rep-03',
      status: 'CONFIRMED',
      subtotal: 285000.0,
      totalDiscount: 15000.0,
      taxAmount: 48600.0,
      totalAmount: 318600.0,
      blendedMargin: 29.2,
      blendedRiskScore: 8.5,
      portalToken: 'portal-nova-1035',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      items: {
        create: [
          {
            productId: prodLaptop.id,
            quantity: 1,
            unitPrice: 150000.0,
            discountPercent: 5.0,
            allowedLimit: 10.0,
            netPrice: 142500.0,
            marginPercent: 25.0,
            isOverLimit: false
          },
          {
            productId: prodCPQSub.id,
            quantity: 1,
            unitPrice: 95000.0,
            discountPercent: 5.0,
            allowedLimit: 10.0,
            netPrice: 90250.0,
            marginPercent: 72.0,
            isOverLimit: false
          },
          {
            productId: prodSecurity.id,
            quantity: 1,
            unitPrice: 36000.0,
            discountPercent: 0.0,
            allowedLimit: 5.0,
            netPrice: 36000.0,
            marginPercent: 66.7,
            isOverLimit: false
          }
        ]
      }
    }
  });

  // Quotation 4: Q-1045 (Negotiation with Apex Dynamics)
  const q1045 = await prisma.quotation.create({
    data: {
      quoteNumber: 'Q-1045',
      customerId: customerApex.id,
      salesRepId: 'usr-rep-03',
      status: 'NEGOTIATION',
      subtotal: 890000.0,
      totalDiscount: 110000.0,
      taxAmount: 140400.0,
      totalAmount: 920400.0,
      blendedMargin: 22.4,
      blendedRiskScore: 48.0,
      portalToken: 'portal-apex-1045',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      items: {
        create: [
          {
            productId: prodLaptop.id,
            quantity: 5,
            unitPrice: 150000.0,
            discountPercent: 16.0,
            allowedLimit: 12.0,
            netPrice: 630000.0,
            marginPercent: 21.0,
            isOverLimit: true
          },
          {
            productId: prodMonitor.id,
            quantity: 5,
            unitPrice: 45000.0,
            discountPercent: 12.0,
            allowedLimit: 10.0,
            netPrice: 198000.0,
            marginPercent: 25.5,
            isOverLimit: true
          }
        ]
      }
    }
  });

  // Quotation 5: Q-1048 (Draft with Global Logistics)
  const q1048 = await prisma.quotation.create({
    data: {
      quoteNumber: 'Q-1048',
      customerId: customerGlobal.id,
      salesRepId: 'usr-rep-03',
      status: 'DRAFT',
      subtotal: 195000.0,
      totalDiscount: 10000.0,
      taxAmount: 33300.0,
      totalAmount: 218300.0,
      blendedMargin: 34.0,
      blendedRiskScore: 5.0,
      portalToken: 'portal-global-1048',
      expiresAt: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      items: {
        create: [
          {
            productId: prodLaptop.id,
            quantity: 1,
            unitPrice: 150000.0,
            discountPercent: 4.0,
            allowedLimit: 10.0,
            netPrice: 144000.0,
            marginPercent: 26.0,
            isOverLimit: false
          },
          {
            productId: prodDock.id,
            quantity: 2,
            unitPrice: 12500.0,
            discountPercent: 0.0,
            allowedLimit: 10.0,
            netPrice: 25000.0,
            marginPercent: 42.4,
            isOverLimit: false
          }
        ]
      }
    }
  });

  // ---------------------------------------------------------
  // 9. SEED APPROVAL WORKFLOWS
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
        reason: 'Laptop Pro 14 discount (12%) exceeds rep cap of 10%',
        comments: 'Approved based on customer strategic Gold Tier relationship and 3-unit commitment.',
        approvedAt: new Date(Date.now() - 2 * 3600 * 1000)
      },
      {
        quotationId: q1042.id,
        approverId: 'usr-fin-04',
        stage: 'Finance / Margin Control (L2)',
        status: 'PENDING',
        riskLevel: 'HIGH',
        reason: 'Aggregate deal value exceeds ₹500,000 with hardware discounting',
        comments: 'Evaluating margin floor protection before final quote release.'
      },
      {
        quotationId: q1039.id,
        approverId: 'usr-mgr-02',
        stage: 'Sales Manager (L1)',
        status: 'APPROVED',
        riskLevel: 'LOW',
        reason: 'SaaS multi-month contract with 31.5% healthy blended margin',
        comments: 'Full governance compliance verified.',
        approvedAt: new Date(Date.now() - 24 * 3600 * 1000)
      },
      {
        quotationId: q1045.id,
        approverId: 'usr-fin-04',
        stage: 'Finance / Margin Control (L2)',
        status: 'PENDING',
        riskLevel: 'CRITICAL',
        reason: 'Hardware discount 16% severely erodes blended margin to 22.4%',
        comments: 'Negotiation counter-proposal pending customer signoff on support add-on.'
      }
    ]
  });

  // ---------------------------------------------------------
  // 10. SEED FULFILLMENTS & SPLIT SHIPMENTS
  // ---------------------------------------------------------
  console.log('[DealFlow360 Seed] Seeding Multi-Warehouse Fulfillment Allocations...');
  const ful1 = await prisma.fulfillment.create({
    data: {
      quotationId: q1035.id,
      orderNumber: 'ORD-2024-001',
      status: 'ALLOCATED',
      totalUnits: 3,
      backorderedUnits: 0,
      splits: {
        create: [
          {
            warehouseId: whBom.id,
            allocatedUnits: 2,
            shippingCost: 850.0,
            status: 'Picked & Packed'
          },
          {
            warehouseId: whBlr.id,
            allocatedUnits: 1,
            shippingCost: 450.0,
            status: 'Ready for Dispatch'
          }
        ]
      }
    }
  });

  const ful2 = await prisma.fulfillment.create({
    data: {
      quotationId: q1039.id,
      orderNumber: 'ORD-2024-002',
      status: 'PARTIALLY_FULFILLED',
      totalUnits: 8,
      backorderedUnits: 1,
      splits: {
        create: [
          {
            warehouseId: whBom.id,
            allocatedUnits: 5,
            shippingCost: 1450.0,
            status: 'Dispatched (AWB: TRK-99210)'
          },
          {
            warehouseId: whCcu.id,
            allocatedUnits: 2,
            shippingCost: 750.0,
            status: 'In Transit'
          },
          {
            warehouseId: whDel.id,
            allocatedUnits: 1,
            shippingCost: 600.0,
            status: 'Backordered (ETA: 48h)'
          }
        ]
      }
    }
  });

  // ---------------------------------------------------------
  // 11. SEED RECURRING SUBSCRIPTIONS
  // ---------------------------------------------------------
  console.log('[DealFlow360 Seed] Seeding SaaS Subscriptions & Recurring Contracts...');
  await prisma.subscription.createMany({
    data: [
      {
        contractNumber: 'SUB-2024-881',
        customerId: customerAcme.id,
        quotationId: q1042.id,
        planName: 'DealFlow360 Enterprise CPQ Platform',
        billingCycle: 'ANNUAL',
        recurringAmount: 95000.0,
        status: 'ACTIVE',
        startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        nextBillingDate: new Date(Date.now() + 305 * 24 * 60 * 60 * 1000),
        autoRenew: true
      },
      {
        contractNumber: 'SUB-2024-882',
        customerId: customerBeta.id,
        quotationId: q1039.id,
        planName: 'Cloud Infrastructure Care & 24/7 SLA',
        billingCycle: 'MONTHLY',
        recurringAmount: 24000.0,
        status: 'ACTIVE',
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        nextBillingDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        autoRenew: true
      },
      {
        contractNumber: 'SUB-2024-883',
        customerId: customerNova.id,
        quotationId: q1035.id,
        planName: 'Zero-Trust Security & Compliance Suite',
        billingCycle: 'MONTHLY',
        recurringAmount: 36000.0,
        status: 'ACTIVE',
        startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        nextBillingDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        autoRenew: true
      }
    ]
  });

  // ---------------------------------------------------------
  // 12. SEED INVOICES & RECONCILIATIONS
  // ---------------------------------------------------------
  console.log('[DealFlow360 Seed] Seeding Invoices & Commercial Accounts...');
  await prisma.invoice.createMany({
    data: [
      {
        invoiceNumber: 'INV-2024-101',
        customerId: customerAcme.id,
        quotationId: q1042.id,
        amount: 658440.0,
        taxAmount: 100440.0,
        totalAmount: 658440.0,
        status: 'PAID',
        dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        paidAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        paymentMethod: 'NEFT / RTGS Wire',
        transactionRef: 'TXN-HDFC-9912048'
      },
      {
        invoiceNumber: 'INV-2024-102',
        customerId: customerBeta.id,
        quotationId: q1039.id,
        amount: 442500.0,
        taxAmount: 67500.0,
        totalAmount: 442500.0,
        status: 'PARTIALLY_PAID',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        paidAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        paymentMethod: 'Corporate Card',
        transactionRef: 'TXN-ICICI-4418290'
      },
      {
        invoiceNumber: 'INV-2024-103',
        customerId: customerNova.id,
        quotationId: q1035.id,
        amount: 318600.0,
        taxAmount: 48600.0,
        totalAmount: 318600.0,
        status: 'PAID',
        dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        paidAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        paymentMethod: 'ACH Transfer',
        transactionRef: 'TXN-AXIS-7718902'
      },
      {
        invoiceNumber: 'INV-2024-104',
        customerId: customerApex.id,
        quotationId: q1045.id,
        amount: 180000.0,
        taxAmount: 27450.0,
        totalAmount: 207450.0,
        status: 'UNPAID',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      },
      {
        invoiceNumber: 'INV-2024-105',
        customerId: customerGlobal.id,
        quotationId: q1048.id,
        amount: 95000.0,
        taxAmount: 14490.0,
        totalAmount: 109490.0,
        status: 'OVERDUE',
        dueDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
      }
    ]
  });

  // ---------------------------------------------------------
  // 13. SEED DEAL HEALTH ANOMALY ALERTS
  // ---------------------------------------------------------
  console.log('[DealFlow360 Seed] Seeding Deal Health & Margin Risk Intelligence...');
  await prisma.dealHealthAlert.createMany({
    data: [
      {
        quotationId: q1042.id,
        severity: 'WARNING',
        title: 'Line Discount Threshold Exceeded',
        description: 'Laptop Pro 14" discounted at 12% against self-approval limit of 10%. Routed to L1 Sales Manager review.',
        anomalyType: 'DISCOUNT_LIMIT_EXCEEDED',
        isResolved: false
      },
      {
        quotationId: q1045.id,
        severity: 'CRITICAL',
        title: 'Severe Margin Erosion Anomaly',
        description: 'Blended margin dropped to 22.4% (Threshold: 25.0%). Recommending mandatory Upsell rule bundle or discount curtailment.',
        anomalyType: 'MARGIN_EROSION',
        isResolved: false
      },
      {
        quotationId: q1039.id,
        severity: 'INFO',
        title: 'Multi-Warehouse Split Optimization Recommended',
        description: 'Splitting shipment between BOM-1 and CCU-1 cuts turnaround latency by 48 hours.',
        anomalyType: 'FULFILLMENT_OPTIMIZATION',
        isResolved: true,
        resolvedAt: new Date(Date.now() - 18 * 3600 * 1000)
      }
    ]
  });

  console.log('\n============================================================');
  console.log('✔ [DealFlow360 Seed] Database successfully seeded with:');
  console.log('   - 5 RBAC Users (+ 5 exact login aliases)');
  console.log('   - 5 Enterprise Customers with Gold/Silver/Bronze Tiers');
  console.log('   - 4 Multi-Region Warehouses with Live Stock Allocations');
  console.log('   - 7 Core Hardware/Software/Services Products & Variants');
  console.log('   - 6 Discount Tiers & Volume Thresholds');
  console.log('   - 3 High-Margin Upsell Rules');
  console.log('   - 5 Enterprise Quotations & Detailed Line Items');
  console.log('   - 4 Multi-Stage Governance Approvals (L1 / L2)');
  console.log('   - 2 Multi-Depot Order Fulfillments & Backorders');
  console.log('   - 3 SaaS MRR Subscriptions');
  console.log('   - 5 Financial Invoices (Paid, Unpaid, Overdue)');
  console.log('   - 3 Deal Health & Anomaly Alerts');
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
