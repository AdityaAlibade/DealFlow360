const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function auditAndFixDatabase() {
  console.log('=================================================================');
  console.log('STARTING COMPREHENSIVE DATABASE INTEGRITY AUDIT & SYNCHRONIZATION');
  console.log('=================================================================\n');

  const fixes = [];

  // 1. Audit and Fix ProductRequests
  console.log('--- 1. Auditing Product Requests ---');
  const requests = await prisma.productRequest.findMany({
    include: {
      items: {
        include: { product: true }
      },
      quotations: {
        include: {
          items: { include: { product: true } }
        }
      }
    }
  });

  for (const req of requests) {
    let calculatedTotal = 0;
    let totalQty = 0;

    for (const item of req.items) {
      const unitPrice = Number(item.targetPrice !== null && item.targetPrice !== undefined ? item.targetPrice : item.product?.basePrice || 0);
      const qty = Number(item.quantity || 1);
      calculatedTotal += qty * unitPrice;
      totalQty += qty;
    }

    if (Math.abs(req.totalAmount - calculatedTotal) > 0.01) {
      console.log(`[FIX] Updating ProductRequest ${req.requestNumber} totalAmount: ₹${req.totalAmount} -> ₹${calculatedTotal}`);
      await prisma.productRequest.update({
        where: { id: req.id },
        data: { totalAmount: calculatedTotal }
      });
      fixes.push(`ProductRequest ${req.requestNumber}: Updated totalAmount from ₹${req.totalAmount} to ₹${calculatedTotal}`);
    } else {
      console.log(`[OK] ProductRequest ${req.requestNumber} totalAmount verified: ₹${req.totalAmount} (${totalQty} units)`);
    }

    // Check linked quotations
    for (const quote of req.quotations) {
      let needsQuoteUpdate = false;
      let quoteSubtotal = 0;
      let quoteDiscount = 0;
      let quoteCost = 0;

      for (const qItem of quote.items) {
        // Find matching request item
        const matchingReqItem = req.items.find(ri => ri.productId === qItem.productId);
        let itemQty = qItem.quantity;

        if (matchingReqItem && matchingReqItem.quantity > qItem.quantity) {
          console.log(`[FIX] Synchronizing Quotation ${quote.quoteNumber} item ${qItem.product?.name}: quantity ${qItem.quantity} -> ${matchingReqItem.quantity}`);
          itemQty = matchingReqItem.quantity;
          needsQuoteUpdate = true;
        }

        const unitPrice = qItem.unitPrice;
        const discountPct = qItem.discountPercent || 0;
        const netPrice = unitPrice * (1 - discountPct / 100);
        const lineSubtotal = itemQty * unitPrice;
        const lineDiscount = lineSubtotal * (discountPct / 100);
        const lineNet = itemQty * netPrice;
        const lineCost = itemQty * (qItem.product?.standardCost || 0);

        quoteSubtotal += lineSubtotal;
        quoteDiscount += lineDiscount;
        quoteCost += lineCost;

        const marginPercent = lineNet > 0 ? ((lineNet - lineCost) / lineNet) * 100 : 0;

        await prisma.quotationItem.update({
          where: { id: qItem.id },
          data: {
            quantity: itemQty,
            netPrice: netPrice,
            marginPercent: Number(marginPercent.toFixed(2))
          }
        });
      }

      const taxAmount = (quoteSubtotal - quoteDiscount) * 0.18;
      const totalAmount = quoteSubtotal - quoteDiscount + taxAmount;
      const netRevenue = quoteSubtotal - quoteDiscount;
      const blendedMargin = netRevenue > 0 ? ((netRevenue - quoteCost) / netRevenue) * 100 : 0;

      if (needsQuoteUpdate || Math.abs(quote.totalAmount - totalAmount) > 0.01) {
        console.log(`[FIX] Updating Quotation ${quote.quoteNumber}: totalAmount ₹${quote.totalAmount} -> ₹${totalAmount}, subtotal: ₹${quoteSubtotal}`);
        await prisma.quotation.update({
          where: { id: quote.id },
          data: {
            subtotal: quoteSubtotal,
            totalDiscount: quoteDiscount,
            taxAmount: taxAmount,
            totalAmount: totalAmount,
            blendedMargin: Number(blendedMargin.toFixed(2))
          }
        });
        fixes.push(`Quotation ${quote.quoteNumber}: Updated totalAmount from ₹${quote.totalAmount} to ₹${totalAmount}`);
      } else {
        console.log(`[OK] Quotation ${quote.quoteNumber} verified: ₹${quote.totalAmount}`);
      }
    }
  }

  // 2. Audit All Other Quotations
  console.log('\n--- 2. Auditing Standalone Quotations ---');
  const standaloneQuotes = await prisma.quotation.findMany({
    where: { productRequestId: null },
    include: { items: { include: { product: true } } }
  });

  for (const quote of standaloneQuotes) {
    let subtotal = 0;
    let totalDiscount = 0;
    let totalCost = 0;

    for (const item of quote.items) {
      const lineSubtotal = item.quantity * item.unitPrice;
      const lineDiscount = lineSubtotal * ((item.discountPercent || 0) / 100);
      const lineNet = item.quantity * item.netPrice;
      const lineCost = item.quantity * (item.product?.standardCost || 0);

      subtotal += lineSubtotal;
      totalDiscount += lineDiscount;
      totalCost += lineCost;
    }

    const taxAmount = (subtotal - totalDiscount) * 0.18;
    const totalAmount = subtotal - totalDiscount + taxAmount;
    const netRevenue = subtotal - totalDiscount;
    const blendedMargin = netRevenue > 0 ? ((netRevenue - totalCost) / netRevenue) * 100 : 0;

    if (Math.abs(quote.totalAmount - totalAmount) > 0.01) {
      console.log(`[FIX] Updating Standalone Quotation ${quote.quoteNumber} totalAmount: ₹${quote.totalAmount} -> ₹${totalAmount}`);
      await prisma.quotation.update({
        where: { id: quote.id },
        data: {
          subtotal,
          totalDiscount,
          taxAmount,
          totalAmount,
          blendedMargin: Number(blendedMargin.toFixed(2))
        }
      });
      fixes.push(`Quotation ${quote.quoteNumber}: Updated totalAmount to ₹${totalAmount}`);
    } else {
      console.log(`[OK] Quotation ${quote.quoteNumber} verified: ₹${quote.totalAmount}`);
    }
  }

  // 3. Audit Orders and Invoices
  console.log('\n--- 3. Auditing Orders & Invoices ---');
  const orders = await prisma.order.findMany({
    include: {
      quotation: true,
      items: true,
      invoices: true
    }
  });

  for (const order of orders) {
    const totalRequested = order.items.reduce((s, it) => s + it.requestedQuantity, 0);
    const calculatedOrderTotal = order.items.reduce((s, it) => s + (it.requestedQuantity * it.unitPrice), 0);
    const expectedOrderTotal = order.quotation ? order.quotation.totalAmount : calculatedOrderTotal;

    if (order.totalRequested !== totalRequested || Math.abs(order.totalAmount - expectedOrderTotal) > 0.01) {
      console.log(`[FIX] Updating Order ${order.orderNumber}: totalRequested ${order.totalRequested} -> ${totalRequested}, totalAmount ₹${order.totalAmount} -> ₹${expectedOrderTotal}`);
      await prisma.order.update({
        where: { id: order.id },
        data: {
          totalRequested,
          totalAmount: expectedOrderTotal
        }
      });
      fixes.push(`Order ${order.orderNumber}: Updated totals`);
    } else {
      console.log(`[OK] Order ${order.orderNumber} verified: ${totalRequested} items, ₹${order.totalAmount}`);
    }

    for (const inv of order.invoices) {
      if (Math.abs(inv.totalAmount - expectedOrderTotal) > 0.01) {
        console.log(`[FIX] Updating Invoice ${inv.invoiceNumber} totalAmount: ₹${inv.totalAmount} -> ₹${expectedOrderTotal}`);
        await prisma.invoice.update({
          where: { id: inv.id },
          data: {
            amount: expectedOrderTotal / 1.18,
            taxAmount: expectedOrderTotal - (expectedOrderTotal / 1.18),
            totalAmount: expectedOrderTotal
          }
        });
        fixes.push(`Invoice ${inv.invoiceNumber}: Synchronized amount to ₹${expectedOrderTotal}`);
      } else {
        console.log(`[OK] Invoice ${inv.invoiceNumber} verified: ₹${inv.totalAmount}`);
      }
    }
  }

  console.log('\n=================================================================');
  console.log(`AUDIT & SYNCHRONIZATION FINISHED WITH ${fixes.length} FIXES APPLIED`);
  console.log('=================================================================');
  fixes.forEach((f, i) => console.log(`${i + 1}. ${f}`));
}

auditAndFixDatabase()
  .catch((err) => {
    console.error('Audit failed with error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
