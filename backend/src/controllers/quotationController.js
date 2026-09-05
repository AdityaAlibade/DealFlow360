const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { calculateItemRisk } = require('../services/dealRiskEngine');
const warehouseAllocationService = require('../services/warehouseAllocationService');

const quotationController = {
  /**
   * GET /api/quotations
   */
  getAll: async (req, res, next) => {
    try {
      const { status, customerId, salesRepId } = req.query;
      const where = {};
      if (status) where.status = status;
      if (customerId) where.customerId = customerId;
      if (salesRepId) where.salesRepId = salesRepId;

      const quotes = await prisma.quotation.findMany({
        where,
        include: {
          customer: true,
          salesRep: { select: { id: true, fullName: true, email: true, role: true } },
          items: { include: { product: true } },
          approvals: true,
          negotiations: true,
          orders: true
        },
        orderBy: { createdAt: 'desc' }
      });

      res.status(200).json({ success: true, count: quotes.length, data: quotes });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/quotations/:id
   */
  getById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const quote = await prisma.quotation.findFirst({
        where: {
          OR: [{ id }, { quoteNumber: id }, { portalToken: id }]
        },
        include: {
          customer: true,
          salesRep: { select: { id: true, fullName: true, email: true, role: true } },
          items: { include: { product: true } },
          approvals: {
            include: { approver: { select: { id: true, fullName: true, role: true } } },
            orderBy: { createdAt: 'desc' }
          },
          negotiations: {
            include: { product: true },
            orderBy: { createdAt: 'desc' }
          },
          orders: true
        }
      });

      if (!quote) {
        return res.status(404).json({ success: false, message: `Quotation #${id} not found.` });
      }

      res.status(200).json({ success: true, data: quote });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/quotations
   * Create a new draft quotation with calculated margins & totals
   */
  create: async (req, res, next) => {
    try {
      const { customerId, salesRepId, items = [], expiresAt, portalToken } = req.body;

      if (!customerId) {
        return res.status(400).json({ success: false, message: 'Customer ID is required.' });
      }

      const customer = await prisma.customer.findUnique({ where: { id: customerId } });
      if (!customer) {
        return res.status(400).json({ success: false, message: 'Customer not found.' });
      }

      // Resolve sales rep from body or auth user
      let repId = salesRepId || req.user?.id;
      if (!repId || repId.startsWith('usr-admin')) {
        const defaultRep = await prisma.user.findFirst({ where: { role: 'SALES_REP' } });
        repId = defaultRep?.id || req.user?.id;
      }

      const count = await prisma.quotation.count();
      const quoteNumber = `Q-2026-${String(1001 + count).padStart(4, '0')}`;
      const token = portalToken || `portal-${customer.name.toLowerCase().replace(/[^a-z0-9]/g, '')}-${1001 + count}`;

      let subtotal = 0;
      let totalDiscount = 0;
      let totalCost = 0;
      const formattedItems = [];

      for (const item of items) {
        const product = await prisma.product.findFirst({
          where: { OR: [{ id: item.productId }, { sku: item.productId }] }
        });
        if (!product) {
          return res.status(400).json({ success: false, message: `Product ${item.productId} not found.` });
        }

        const quantity = Number(item.quantity || 1);
        const unitPrice = item.unitPrice !== undefined ? Number(item.unitPrice) : product.basePrice;
        const discountPercent = Number(item.discountPercent || 0);
        const netPrice = unitPrice * (1 - discountPercent / 100);
        const lineSubtotal = quantity * unitPrice;
        const lineDiscount = lineSubtotal * (discountPercent / 100);
        const lineNet = quantity * netPrice;
        const lineCost = quantity * product.standardCost;

        subtotal += lineSubtotal;
        totalDiscount += lineDiscount;
        totalCost += lineCost;

        const marginPercent = lineNet > 0 ? ((lineNet - lineCost) / lineNet) * 100 : 0;

        formattedItems.push({
          productId: product.id,
          quantity,
          unitPrice,
          discountPercent,
          allowedLimit: item.allowedLimit || 10,
          netPrice,
          marginPercent: Number(marginPercent.toFixed(2)),
          isOverLimit: discountPercent > (item.allowedLimit || 10)
        });
      }

      const taxAmount = (subtotal - totalDiscount) * 0.18; // 18% GST standard
      const totalAmount = subtotal - totalDiscount + taxAmount;
      const netRevenue = subtotal - totalDiscount;
      const blendedMargin = netRevenue > 0 ? ((netRevenue - totalCost) / netRevenue) * 100 : 0;

      const quotation = await prisma.quotation.create({
        data: {
          quoteNumber,
          customerId,
          salesRepId: repId,
          status: 'DRAFT',
          subtotal,
          totalDiscount,
          taxAmount,
          totalAmount,
          blendedMargin: Number(blendedMargin.toFixed(2)),
          portalToken: token,
          expiresAt: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          items: {
            create: formattedItems
          }
        },
        include: {
          customer: true,
          items: { include: { product: true } }
        }
      });

      // Audit Log
      await prisma.auditLog.create({
        data: {
          userId: req.user?.id,
          userRole: req.user?.role || 'SALES_REP',
          action: 'CREATE_QUOTATION',
          resource: 'QUOTATION',
          resourceId: quotation.id,
          newValue: { quoteNumber, totalAmount, blendedMargin },
          reason: `Created draft quotation ${quoteNumber}`
        }
      });

      res.status(201).json({ success: true, message: 'Quotation created successfully.', data: quotation });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/quotations/convert-request/:requestId
   * Convert customer ProductRequest to Quotation (Test 3)
   */
  convertFromRequest: async (req, res, next) => {
    try {
      const { requestId } = req.params;
      const request = await prisma.productRequest.findFirst({
        where: { OR: [{ id: requestId }, { requestNumber: requestId }] },
        include: { customer: true, items: { include: { product: true } } }
      });

      if (!request) {
        return res.status(404).json({ success: false, message: 'Product request not found.' });
      }

      // Convert items
      const items = request.items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: i.targetPrice || i.product.basePrice,
        discountPercent: 0
      }));

      const defaultRep = await prisma.user.findFirst({ where: { role: 'SALES_REP' } });
      const count = await prisma.quotation.count();
      const quoteNumber = `Q-2026-${String(1001 + count).padStart(4, '0')}`;
      const token = `portal-${request.customer.name.toLowerCase().replace(/[^a-z0-9]/g, '')}-${1001 + count}`;

      let subtotal = 0;
      let totalCost = 0;
      const formattedItems = [];

      for (const item of items) {
        const product = await prisma.product.findUnique({ where: { id: item.productId } });
        const quantity = item.quantity;
        const unitPrice = item.unitPrice;
        const netPrice = unitPrice;
        const lineNet = quantity * netPrice;
        const lineCost = quantity * (product?.standardCost || unitPrice * 0.7);

        subtotal += lineNet;
        totalCost += lineCost;

        const marginPercent = lineNet > 0 ? ((lineNet - lineCost) / lineNet) * 100 : 0;
        formattedItems.push({
          productId: product.id,
          quantity,
          unitPrice,
          discountPercent: 0,
          allowedLimit: 10,
          netPrice,
          marginPercent: Number(marginPercent.toFixed(2)),
          isOverLimit: false
        });
      }

      const taxAmount = subtotal * 0.18;
      const totalAmount = subtotal + taxAmount;
      const blendedMargin = subtotal > 0 ? ((subtotal - totalCost) / subtotal) * 100 : 0;

      const quotation = await prisma.quotation.create({
        data: {
          quoteNumber,
          customerId: request.customerId,
          salesRepId: defaultRep?.id || 'usr-rep-03',
          status: 'DRAFT',
          subtotal,
          totalDiscount: 0,
          taxAmount,
          totalAmount,
          blendedMargin: Number(blendedMargin.toFixed(2)),
          portalToken: token,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          items: {
            create: formattedItems
          }
        },
        include: {
          customer: true,
          items: { include: { product: true } }
        }
      });

      // Update ProductRequest status to QUOTED
      await prisma.productRequest.update({
        where: { id: request.id },
        data: { status: 'QUOTED' }
      });

      // Audit Log
      await prisma.auditLog.create({
        data: {
          userId: req.user?.id,
          userRole: req.user?.role || 'SALES_REP',
          action: 'CONVERT_REQUEST_TO_QUOTE',
          resource: 'QUOTATION',
          resourceId: quotation.id,
          oldValue: { requestId: request.id, requestNumber: request.requestNumber },
          newValue: { quoteNumber, totalAmount },
          reason: `Converted customer request #${request.requestNumber} into quotation ${quoteNumber}`
        }
      });

      res.status(201).json({
        success: true,
        message: `Customer request #${request.requestNumber} converted to Quotation ${quoteNumber}.`,
        data: quotation
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/quotations/:id/accept-negotiation
   * Sales Rep accepts a customer negotiation (Test 8)
   * RULE: Sales Rep can accept ONLY IF risk = 0.
   * If risk > 0, returns HTTP 403 Forbidden!
   */
  acceptNegotiation: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { negotiationId } = req.body;
      const callerRole = (req.user?.role || '').toUpperCase();

      const negotiation = await prisma.negotiation.findFirst({
        where: negotiationId ? { id: negotiationId } : { quotationId: id },
        include: { quotation: { include: { items: true, customer: true } } }
      });

      if (!negotiation) {
        return res.status(404).json({ success: false, message: 'Negotiation record not found.' });
      }

      // ENFORCE TEST 8: Check Risk
      if (negotiation.riskScore > 0 && callerRole === 'SALES_REP') {
        return res.status(403).json({
          success: false,
          message: `Forbidden. Sales Representative cannot accept negotiations with Risk > 0 (Current Risk Score: ${negotiation.riskScore}, Level: ${negotiation.riskLevel}). Approval from Sales Manager is strictly required.`
        });
      }

      // Update Quotation Item with negotiated price
      if (negotiation.quotationItemId) {
        await prisma.quotationItem.update({
          where: { id: negotiation.quotationItemId },
          data: {
            unitPrice: negotiation.requestedPrice,
            netPrice: negotiation.requestedPrice
          }
        });
      }

      // Update Quotation status to APPROVED
      await prisma.quotation.update({
        where: { id: negotiation.quotationId },
        data: { status: 'APPROVED' }
      });

      // Update Negotiation status to ACCEPTED
      const updatedNegotiation = await prisma.negotiation.update({
        where: { id: negotiation.id },
        data: {
          status: 'ACCEPTED',
          responseMessage: `Accepted by ${req.user?.fullName || 'Sales Representative'}`
        }
      });

      // Audit Log (Test 10)
      await prisma.auditLog.create({
        data: {
          userId: req.user?.id,
          userRole: callerRole,
          action: 'ACCEPT_NEGOTIATION',
          resource: 'NEGOTIATION',
          resourceId: negotiation.id,
          oldValue: { price: negotiation.originalPrice, status: negotiation.status },
          newValue: { price: negotiation.requestedPrice, status: 'ACCEPTED' },
          reason: `Negotiation accepted by ${callerRole}`
        }
      });

      res.status(200).json({
        success: true,
        message: 'Negotiation accepted successfully. Quotation updated.',
        data: updatedNegotiation
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/quotations/:id
   */
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const updated = await prisma.quotation.update({
        where: { id },
        data: req.body
      });
      res.status(200).json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/quotations/:id
   */
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      await prisma.quotation.delete({ where: { id } });
      res.status(200).json({ success: true, message: 'Quotation deleted successfully.' });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/quotations/:id/submit
   */
  submitForApproval: async (req, res, next) => {
    try {
      const { id } = req.params;
      const quote = await prisma.quotation.findFirst({
        where: { OR: [{ id }, { quoteNumber: id }] },
        include: { items: { include: { product: true } } }
      });

      if (!quote) return res.status(404).json({ success: false, message: 'Quotation not found.' });

      await prisma.quotation.update({
        where: { id: quote.id },
        data: { status: 'PENDING_APPROVAL' }
      });

      await prisma.approval.create({
        data: {
          quotationId: quote.id,
          stage: 'Sales Manager',
          status: 'PENDING',
          riskLevel: quote.blendedRiskScore > 40 ? 'HIGH' : 'MEDIUM',
          reason: 'Submitted for managerial approval review'
        }
      });

      res.status(200).json({ success: true, message: 'Quotation submitted for managerial approval.' });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/quotations/:id/confirm
   */
  confirmQuotation: async (req, res, next) => {
    try {
      const { id } = req.params;
      const quote = await prisma.quotation.findFirst({
        where: { OR: [{ id }, { quoteNumber: id }] },
        include: { items: { include: { product: true } }, customer: true }
      });

      if (!quote) return res.status(404).json({ success: false, message: 'Quotation not found.' });

      await prisma.quotation.update({
        where: { id: quote.id },
        data: { status: 'CONFIRMED' }
      });

      // Create Order
      const order = await warehouseAllocationService.createOrder({
        customerId: quote.customerId,
        quotationId: quote.id,
        items: quote.items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.netPrice || i.unitPrice
        })),
        shippingAddress: quote.customer?.shippingAddress || 'Customer Standard Delivery Location',
        notes: `Created from confirmed quotation ${quote.quoteNumber}`,
        autoAllocate: true
      });

      res.status(200).json({ success: true, message: 'Quotation confirmed and Order generated.', data: { quotation: quote, order } });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = quotationController;
