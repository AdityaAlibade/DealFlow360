const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tables = [
    'user', 'customer', 'product', 'warehouse', 'productRequest', 
    'quotation', 'quotationItem', 'order', 'orderItem', 'invoice', 
    'fulfillment', 'backorder', 'subscriptionPlan', 'dealApproval', 'dealHealth'
  ];

  console.log('--- Inspecting all tables for non-ASCII / WIN1252 incompatible characters ---');
  for (const table of tables) {
    if (!prisma[table]) continue;
    const records = await prisma[table].findMany();
    for (const record of records) {
      for (const [k, v] of Object.entries(record)) {
        if (typeof v === 'string') {
          for (let i = 0; i < v.length; i++) {
            if (v.charCodeAt(i) > 127) {
              console.log(`[${table}] ID: ${record.id || record.code} | Field: ${k} | Char: "${v[i]}" (U+${v.charCodeAt(i).toString(16).toUpperCase().padStart(4, '0')}) | Value snippet: ${v.substring(Math.max(0, i - 15), i + 25)}`);
            }
          }
        }
      }
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
