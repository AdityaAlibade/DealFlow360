const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { calculateItemRisk } = require('../services/dealRiskEngine');
const warehouseAllocationService = require('../services/warehouseAllocationService');

const customerPortalController = {
  /**
   * GET /api/customer-portal/quote/:token
   * Fetch quotation details securely using portal token
   */
  getQuoteByToken: async (req, res, next) => {
    try {
      const { token } = req.params;
      const quote = await prisma.quotation.findFirst({
        where: {
          OR: [
            { portalToken: token },
            { id: token },
            { quoteNumber: token }
          ]
        },
        include: {
          customer: true,
          items: {
            include: { product: true }
          },
          negotiations: {
            include: { product: true },
            orderBy: { createdAt: 'desc' }
          },
          orders: true
        }
      });

      if (!quote) {
        return res.status(404).json({
          success: false,
          message: 'Quotation not found for the provided access token.'
        });
      }

      // Check if quotation is expired
      const isExpired = quote.expiresAt && new Date() > new Date(quote.expiresAt);

      res.status(200).json({
        success: true,
        data: {
          ...quote,
          isExpired,
          negotiationHistory: quote.negotiations || []
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/customer-portal/requests
   * Customer creates a product/order request (Test 2)
   */
  createRequest: async (req, res, next) => {
    try {
      const { customerId, items = [], notes } = req.body;

      // 1. Resolve customer
      let resolvedCustomerId = customerId;
      if (!resolvedCustomerId) {
        const defaultCustomer = await prisma.customer.findFirst();
        resolvedCustomerId = defaultCustomer?.id;
      }

      if (!resolvedCustomerId) {
        return res.status(400).json({ success: false, message: 'Customer ID is required.' });
      }

      // 2. Validate items
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, message: 'Order request must contain at least one item.' });
      }

      let totalAmount = 0;
      const validatedItems = [];

      for (const item of items) {
        const quantity = Number(item.quantity);
        if (isNaN(quantity) || quantity <= 0) {
          return res.status(400).json({
            success: false,
            message: `Invalid quantity '${item.quantity}'. Quantity must be a positive integer greater than zero.`
          });
        }

        if (quantity > 10000) {
          return res.status(400).json({
            success: false,
            message: `Quantity '${quantity}' exceeds maximum allowed order quantity of 10,000 units.`
          });
        }

        const product = await prisma.product.findFirst({
          where: {
            OR: [
              { id: item.productId },
              { sku: item.productId }
            ]
          }
        });

        if (!product) {
          return res.status(400).json({
            success: false,
            message: `Product '${item.productId}' not found in catalog.`
          });
        }

        const targetPrice = item.targetPrice !== undefined ? Number(item.targetPrice) : product.basePrice;
        if (targetPrice < 0) {
          return res.status(400).json({
            success: false,
            message: 'Target price cannot be negative.'
          });
        }

        totalAmount += quantity * targetPrice;
        validatedItems.push({
          productId: product.id,
          quantity,
          targetPrice,
          notes: item.notes || null
        });
      }

      // 3. Create ProductRequest in PostgreSQL
      const count = await prisma.productRequest.count();
      const requestNumber = `REQ-2026-${String(1001 + count).padStart(4, '0')}`;

      const newRequest = await prisma.productRequest.create({
        data: {
          requestNumber,
          customerId: resolvedCustomerId,
          status: 'PENDING',
          totalAmount,
          notes: notes || null,
          items: {
            create: validatedItems
          }
        },
        include: {
          customer: true,
          items: { include: { product: true } }
        }
      });

      // 4. Audit Log
      await prisma.auditLog.create({
        data: {
          userRole: 'CUSTOMER',
          action: 'CREATE_ORDER_REQUEST',
          resource: 'PRODUCT_REQUEST',
          resourceId: newRequest.id,
          newValue: { requestNumber, totalAmount, itemCount: validatedItems.length },
          reason: `Customer submitted request #${requestNumber}`
        }
      });

      res.status(201).json({
        success: true,
        message: 'Order request created successfully and routed to sales team.',
        data: newRequest
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/customer-portal/requests
   * List customer's requests and negotiations ("My Requests" - Test 6)
   */
  getRequests: async (req, res, next) => {
    try {
      const { customerId } = req.query;
      const filter = customerId ? { customerId } : {};

      const [productRequests, negotiations] = await Promise.all([
        prisma.productRequest.findMany({
          where: filter,
          include: {
            customer: true,
            items: { include: { product: true } }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.negotiation.findMany({
          where: filter,
          include: {
            customer: true,
            quotation: true,
            product: true
          },
          orderBy: { createdAt: 'desc' }
        })
      ]);

      res.status(200).json({
        success: true,
        data: {
          productRequests,
          negotiations,
          total: productRequests.length + negotiations.length
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/customer-portal/quote/:token/negotiate
   * Customer submits counter-offer / negotiation (Tests 5, 7, 8)
   */
  negotiateQuote: async (req, res, next) => {
    try {
      const { token } = req.params;
      const { quotationItemId, productId, requestedPrice, message } = req.body;

      if (!requestedPrice || Number(requestedPrice) <= 0) {
        return res.status(400).json({ success: false, message: 'A valid positive requested price is required.' });
      }

      if (!message || message.trim().length === 0) {
        return res.status(400).json({ success: false, message: 'A negotiation justification message is required.' });
      }

      // 1. Find Quotation
      const quote = await prisma.quotation.findFirst({
        where: {
          OR: [
            { portalToken: token },
            { id: token },
            { quoteNumber: token }
          ]
        },
        include: {
          customer: true,
          items: { include: { product: true } }
        }
      });

      if (!quote) {
        return res.status(404).json({ success: false, message: 'Quotation not found.' });
      }

      // Check if quotation is already confirmed or cancelled
      if (quote.status === 'CONFIRMED') {
        return res.status(400).json({ success: false, message: 'Quotation is already confirmed and cannot be negotiated.' });
      }

      if (quote.status === 'CANCELLED') {
        return res.status(400).json({ success: false, message: 'Quotation has been cancelled.' });
      }

      // 2. Identify target item or default to first item
      let targetItem = null;
      if (quotationItemId) {
        targetItem = quote.items.find((i) => i.id === quotationItemId);
      } else if (productId) {
        targetItem = quote.items.find((i) => i.productId === productId || i.product?.sku === productId);
      } else {
        targetItem = quote.items[0];
      }

      if (!targetItem) {
        return res.status(404).json({ success: false, message: 'Target quotation line item not found.' });
      }

      const originalPrice = targetItem.unitPrice;
      const reqPriceNum = Number(requestedPrice);

      // 3. Compute Risk on Backend (Test 7)
      const riskEvaluation = calculateItemRisk({
        basePrice: targetItem.product?.basePrice || originalPrice,
        requestedPrice: reqPriceNum,
        standardCost: targetItem.product?.standardCost,
        allowedLimit: targetItem.allowedLimit || 10,
        customerTier: quote.customer?.tier || 'BRONZE'
      });

      // 4. Determine status: If risk > 0 -> APPROVAL_REQUIRED; If risk = 0 -> PENDING
      const negotiationStatus = riskEvaluation.requiresApproval ? 'APPROVAL_REQUIRED' : 'PENDING';

      // 5. Create Negotiation record in PostgreSQL
      const negotiation = await prisma.negotiation.create({
        data: {
          quotationId: quote.id,
          customerId: quote.customerId,
          quotationItemId: targetItem.id,
          productId: targetItem.productId,
          originalPrice,
          requestedPrice: reqPriceNum,
          discountPercent: riskEvaluation.discountPercent,
          riskScore: riskEvaluation.riskScore,
          riskLevel: riskEvaluation.riskLevel,
          message: message.trim(),
          status: negotiationStatus
        },
        include: {
          customer: true,
          product: true,
          quotation: true
        }
      });

      // 6. Update Quotation Status
      await prisma.quotation.update({
        where: { id: quote.id },
        data: {
          status: 'NEGOTIATION',
          blendedRiskScore: riskEvaluation.riskScore
        }
      });

      // 7. If risk > 0, create an Approval record for Sales Manager (Test 9)
      if (riskEvaluation.requiresApproval) {
        await prisma.approval.create({
          data: {
            quotationId: quote.id,
            stage: 'Sales Manager',
            status: 'PENDING',
            riskLevel: riskEvaluation.riskLevel,
            reason: `Customer counter-offer: ₹${reqPriceNum} (Discount: ${riskEvaluation.discountPercent}%, Risk: ${riskEvaluation.riskScore}). ${riskEvaluation.reason}`,
            comments: message.trim()
          }
        });
      }

      // 8. Log Audit Record (Test 10)
      await prisma.auditLog.create({
        data: {
          userRole: 'CUSTOMER',
          action: 'SUBMIT_NEGOTIATION',
          resource: 'NEGOTIATION',
          resourceId: negotiation.id,
          oldValue: { originalPrice },
          newValue: { requestedPrice: reqPriceNum, riskScore: riskEvaluation.riskScore, riskLevel: riskEvaluation.riskLevel, status: negotiationStatus },
          reason: `Customer negotiated price for ${targetItem.product?.name}: ₹${reqPriceNum}`
        }
      });

      res.status(201).json({
        success: true,
        message: riskEvaluation.requiresApproval
          ? 'Counter-proposal received and routed to Sales Manager for governance approval.'
          : 'Counter-proposal received and routed to your Sales Representative.',
        data: {
          negotiation,
          risk: riskEvaluation
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/customer-portal/quote/:token/accept or /confirm
   * Customer accepts quotation and generates confirmed Order (Test 11)
   */
  acceptTerms: async (req, res, next) => {
    try {
      const { token } = req.params;

      const quote = await prisma.quotation.findFirst({
        where: {
          OR: [
            { portalToken: token },
            { id: token },
            { quoteNumber: token }
          ]
        },
        include: {
          customer: true,
          items: { include: { product: true } }
        }
      });

      if (!quote) {
        return res.status(404).json({ success: false, message: 'Quotation not found.' });
      }

      if (quote.status === 'CONFIRMED') {
        return res.status(400).json({ success: false, message: 'Quotation is already confirmed.' });
      }

      // 1. Update quotation status to CONFIRMED
      const updatedQuote = await prisma.quotation.update({
        where: { id: quote.id },
        data: { status: 'CONFIRMED' }
      });

      // 2. Automatically generate confirmed Customer Order in PostgreSQL without duplicates
      const existingOrder = await prisma.order.findFirst({
        where: { quotationId: quote.id }
      });

      let order = existingOrder;
      if (!existingOrder) {
        order = await warehouseAllocationService.createOrder({
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
      }

      // 3. Log Audit Record
      await prisma.auditLog.create({
        data: {
          userRole: 'CUSTOMER',
          action: 'CONFIRM_QUOTATION',
          resource: 'QUOTATION',
          resourceId: quote.id,
          oldValue: { status: quote.status },
          newValue: { status: 'CONFIRMED', orderNumber: order?.orderNumber || order?.order?.orderNumber },
          reason: `Customer accepted terms and confirmed quotation ${quote.quoteNumber}`
        }
      });

      res.status(200).json({
        success: true,
        message: 'Quotation confirmed successfully! Order has been created and sent to fulfillment.',
        data: {
          quotation: updatedQuote,
          order
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/customer-portal/quote/:token/history
   */
  getNegotiationHistory: async (req, res, next) => {
    try {
      const { token } = req.params;
      const quote = await prisma.quotation.findFirst({
        where: {
          OR: [{ portalToken: token }, { id: token }, { quoteNumber: token }]
        },
        include: {
          negotiations: {
            include: { product: true },
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      res.status(200).json({
        success: true,
        history: quote?.negotiations || []
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/customer-portal/quote/:token/message
   */
  sendMessage: async (req, res, next) => {
    try {
      const { token } = req.params;
      const { message, quotationItemId } = req.body;

      if (!message || !message.trim()) {
        return res.status(400).json({ success: false, message: 'Message content cannot be empty.' });
      }

      const quote = await prisma.quotation.findFirst({
        where: {
          OR: [{ portalToken: token }, { id: token }, { quoteNumber: token }]
        }
      });

      if (!quote) {
        return res.status(404).json({ success: false, message: 'Quotation not found.' });
      }

      const negotiation = await prisma.negotiation.create({
        data: {
          quotationId: quote.id,
          customerId: quote.customerId,
          quotationItemId: quotationItemId || null,
          originalPrice: quote.totalAmount,
          requestedPrice: quote.totalAmount,
          discountPercent: 0,
          riskScore: 0,
          riskLevel: 'LOW',
          message: message.trim(),
          status: 'PENDING'
        }
      });

      res.status(201).json({
        success: true,
        message: 'Message delivered to sales representative.',
        data: negotiation
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = customerPortalController;
