const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

/**
 * Optional Development-Only Baseline Seed Script
 * - Safe & Non-Destructive: NEVER deletes existing tables or production data.
 * - Idempotent: Uses upsert to create baseline roles, users, and catalog data only if not present.
 * - Run manually via: npm run db:seed
 */
async function main() {
  console.log('[DealFlow360 Seed] Running optional idempotent database seed (non-destructive)...');

  const saltRounds = 10;
  const defaultPassword = 'password123';
  const hashedPassword = bcrypt.hashSync(defaultPassword, saltRounds);

  // ---------------------------------------------------------
  // 1. BASELINE USERS (Upsert)
  // ---------------------------------------------------------
  const baselineUsers = [
    {
      id: 'usr-admin-01',
      email: 'adityaalibade1046@gmail.com',
      fullName: 'Aditya Alibade',
      role: 'ADMIN',
      phone: '+91 98201 45678',
      department: 'Platform Administration',
      title: 'Chief Revenue Systems Architect',
      avatar: 'AA'
    },
    {
      id: 'usr-mgr-02',
      email: 'salesmanager@dealflow360.com',
      fullName: 'Priya Sharma',
      role: 'SALES_MANAGER',
      phone: '+91 98112 34567',
      department: 'Sales Leadership',
      title: 'Regional VP of Sales & Deal Governance',
      avatar: 'PS'
    },
    {
      id: 'usr-rep-03',
      email: 'salesrep@dealflow360.com',
      fullName: 'Rajesh Kumar',
      role: 'SALES_REP',
      phone: '+91 98450 12345',
      department: 'Enterprise Sales',
      title: 'Senior Enterprise Account Executive',
      avatar: 'RK'
    },
    {
      id: 'usr-fin-04',
      email: 'financemanager@dealflow360.com',
      fullName: 'Vikram Malhotra',
      role: 'FINANCE_OPS',
      phone: '+91 98765 43210',
      department: 'Finance & Operations',
      title: 'Director of Revenue Governance & Margin Control',
      avatar: 'VM'
    },
    {
      id: 'usr-cust-05',
      email: 'customer@dealflow360.com',
      fullName: 'Ananya Deshmukh',
      role: 'CUSTOMER',
      phone: '+91 98334 56789',
      department: 'Strategic Procurement',
      title: 'VP Global Strategic Sourcing (Tata Digital)',
      avatar: 'AD'
    }
  ];

  for (const u of baselineUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { fullName: u.fullName, role: u.role, phone: u.phone, department: u.department, title: u.title },
      create: { ...u, password: hashedPassword }
    });
  }
  console.log(`✔ [DealFlow360 Seed] Baseline users verified.`);

  // ---------------------------------------------------------
  // 2. BASELINE WAREHOUSES (Upsert)
  // ---------------------------------------------------------
  const baselineWarehouses = [
    { id: 'wh-bom-01', code: 'BOM-1', name: 'Central Fulfillment Hub Mumbai', location: 'Bhiwandi Logistics Park, Mumbai, MH', status: 'ACTIVE' },
    { id: 'wh-ccu-02', code: 'CCU-1', name: 'East Regional Depot Kolkata', location: 'Dankuni Industrial Hub, Kolkata, WB', status: 'ACTIVE' },
    { id: 'wh-blr-03', code: 'BLR-1', name: 'South Tech Distribution Hub', location: 'Electronic City Logistics Center, Bengaluru, KA', status: 'ACTIVE' },
    { id: 'wh-del-04', code: 'DEL-1', name: 'North Regional Depot Delhi NCR', location: 'Manesar Cargo Hub, Gurgaon, HR', status: 'ACTIVE' }
  ];

  for (const wh of baselineWarehouses) {
    await prisma.warehouse.upsert({
      where: { code: wh.code },
      update: { name: wh.name, location: wh.location, status: wh.status },
      create: wh
    });
  }
  console.log(`✔ [DealFlow360 Seed] Baseline warehouses verified.`);

  // ---------------------------------------------------------
  // 3. BASELINE DISCOUNT TIERS (Upsert / Create if not present)
  // ---------------------------------------------------------
  const discountTiersCount = await prisma.discountTier.count();
  if (discountTiersCount === 0) {
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
    console.log(`✔ [DealFlow360 Seed] Baseline discount tiers initialized.`);
  }

  // ---------------------------------------------------------
  // 4. BASELINE SUBSCRIPTION PLANS (Create if not present)
  // ---------------------------------------------------------
  const subPlansCount = await prisma.subscriptionPlan.count();
  if (subPlansCount === 0) {
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
    console.log(`✔ [DealFlow360 Seed] Baseline subscription plans initialized.`);
  }

  console.log('\n============================================================');
  console.log('✔ [DealFlow360 Seed] Idempotent seed finished safely.');
  console.log('   No existing customer, quotation, order, invoice, or stock records were deleted.');
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
