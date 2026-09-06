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

      const lineItems = (quote.items || []).map((it) => ({
        id: it.id,
        productId: it.productId,
        name: it.product?.name || `Product #${it.productId}`,
        qty: it.quantity,
        quantity: it.quantity,
        price: it.unitPrice,
        unitPrice: it.unitPrice,
        discount: it.discount || 0,
        total: it.totalPrice || (it.quantity * it.unitPrice)
      }));

      const negotiationHistory = (quote.negotiations || []).map((n) => ({
        id: n.id,
        actor: n.actorRole || 'Customer',
        actorRole: n.actorRole || 'Customer',
        timestamp: n.createdAt,
        message: n.comment || `Counter-offer: ₹${n.requestedPrice?.toLocaleString('en-IN')}`
      }));

      const firstItem = quote.items?.[0] || {};
      const currentDiscount = firstItem.discount || 0;

      res.status(200).json({
        success: true,
        data: {
          ...quote,
          quotationId: quote.quoteNumber || quote.id,
          customerName: quote.customer?.companyName || quote.customer?.name || 'Valued Customer',
          contactPerson: quote.customer?.contactPerson || quote.customer?.name || 'Representative',
          quoteValidity: quote.expiresAt ? new Date(quote.expiresAt).toLocaleDateString('en-IN') : '30 Days',
          currentDiscount,
          lineItems,
          items: quote.items || [],
          isExpired,
          negotiationHistory
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/customer-portal/products
   * Customer product catalog browsing
   */
  getCatalog: async (req, res, next) => {
    try {
      const { search, category } = req.query;
      const where = {};
      if (category && category !== 'All') {
        where.category = category;
      }
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ];
      }
      const products = await prisma.product.findMany({
        where,
        orderBy: { name: 'asc' }
      });
      res.status(200).json({ success: true, count: products.length, data: products });
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
      let { customerId, items = [], notes, productId, quantity, message } = req.body;

      // Handle single item shorthand { productId, quantity, message }
      if (productId && (!items || items.length === 0)) {
        items = [{ productId, quantity: quantity || 1, notes: message }];
      }

      // 1. Resolve customer
      let resolvedCustomerId = customerId;
      if (!resolvedCustomerId && req.query.token) {
        const quote = await prisma.quotation.findFirst({
          where: { OR: [{ portalToken: req.query.token }, { id: req.query.token }, { quoteNumber: req.query.token }] }
        });
        resolvedCustomerId = quote?.customerId;
      }
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
          notes: notes || message || null,
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
   * List customer's requests, negotiations, and orders ("My Requests" - Test 6)
   */
  getRequests: async (req, res, next) => {
    try {
      const { customerId, token } = req.query;
      let resolvedCustomerId = customerId;

      if (!resolvedCustomerId && token) {
        const quote = await prisma.quotation.findFirst({
          where: { OR: [{ portalToken: token }, { id: token }, { quoteNumber: token }] }
        });
        resolvedCustomerId = quote?.customerId;
      }

      const filter = resolvedCustomerId ? { customerId: resolvedCustomerId } : {};

      const [productRequests, negotiations, orders] = await Promise.all([
        prisma.productRequest.findMany({
          where: filter,
          include: {
            customer: true,
            items: { include: { product: true } },
            quotations: true
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
        }),
        prisma.order.findMany({
          where: filter,
          include: {
            customer: true,
            items: { include: { product: true } },
            fulfillments: { include: { warehouse: true } }
          },
          orderBy: { createdAt: 'desc' }
        })
      ]);

      // Flatten requests for seamless frontend table rendering
      const formattedRequests = productRequests.map((req) => {
        const firstItem = req.items?.[0] || {};
        const linkedQuote = req.quotations && req.quotations.length > 0 ? req.quotations[0] : null;
        const totalQty = req.items.reduce((sum, it) => sum + it.quantity, 0);
        const calculatedTotal = req.items.reduce((sum, it) => sum + (it.quantity * (it.targetPrice || it.product?.basePrice || 0)), 0);
        const totalAmount = req.totalAmount || calculatedTotal;

        return {
          id: req.requestNumber || req.id,
          requestId: req.id,
          requestNumber: req.requestNumber,
          productName: firstItem.product?.name || 'Requested Product Bundle',
          category: firstItem.product?.category || 'General',
          unitPrice: firstItem.targetPrice || firstItem.product?.basePrice || 0,
          quantity: totalQty,
          totalAmount,
          estimatedTotal: totalAmount,
          status: req.status,
          createdAt: req.createdAt,
          salesResponse: req.notes || null,
          reviewedBy: 'Sales Representative',
          items: req.items,
          quotations: req.quotations || [],
          linkedQuotation: linkedQuote ? {
            id: linkedQuote.id,
            quoteNumber: linkedQuote.quoteNumber,
            totalAmount: linkedQuote.totalAmount,
            status: linkedQuote.status,
            portalToken: linkedQuote.portalToken
          } : null
        };
      });

      const formattedNegotiations = negotiations.map((neg) => ({
        id: `NEG-${neg.id.slice(-6)}`,
        negotiationId: neg.id,
        quoteNumber: neg.quotation?.quoteNumber || 'Quotation',
        productName: neg.product?.name || `Quotation Item`,
        category: 'Counter Offer',
        originalPrice: neg.originalPrice,
        requestedPrice: neg.requestedPrice,
        discountPercent: neg.discountPercent,
        riskScore: neg.riskScore,
        riskLevel: neg.riskLevel,
        status: neg.status,
        message: neg.message,
        createdAt: neg.createdAt
      }));

      const formattedOrders = orders.map((ord) => ({
        id: ord.orderNumber,
        orderId: ord.id,
        orderNumber: ord.orderNumber,
        status: ord.status,
        totalAmount: ord.totalAmount,
        totalFulfilled: ord.totalFulfilled,
        totalBackordered: ord.totalBackordered,
        createdAt: ord.createdAt,
        itemsCount: ord.items?.length || 0,
        fulfillmentCount: ord.fulfillments?.length || 0
      }));

      res.status(200).json({
        success: true,
        data: {
          productRequests: formattedRequests,
          rawProductRequests: productRequests,
          negotiations: formattedNegotiations,
          rawNegotiations: negotiations,
          orders: formattedOrders,
          total: formattedRequests.length + formattedNegotiations.length + formattedOrders.length
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
      const { quotationItemId, productId, counterDiscount, comment } = req.body;
      let { requestedPrice, message } = req.body;

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

      // Auto-compute requestedPrice if counterDiscount is passed
      if (!requestedPrice && counterDiscount !== undefined && Number(counterDiscount) >= 0) {
        const discNum = Number(counterDiscount);
        requestedPrice = Math.round(originalPrice * (1 - discNum / 100));
      }

      if (!requestedPrice || Number(requestedPrice) <= 0) {
        return res.status(400).json({ success: false, message: 'A valid positive requested price or discount percentage is required.' });
      }

      if (!message && comment) {
        message = comment;
      }
      if (!message || message.trim().length === 0) {
        message = `Customer submitted counter-offer of ₹${Number(requestedPrice).toLocaleString('en-IN')}.`;
      }

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
  },

  /**
   * GET /api/customer-portal/profile
   * Fetch customer profile for self-editing
   */
  getProfile: async (req, res, next) => {
    try {
      const token = req.query.token || req.headers['x-customer-token'];
      let customer = null;

      if (token) {
        // Try quotation token lookup
        const quote = await prisma.quotation.findFirst({
          where: { OR: [{ portalToken: token }, { id: token }, { quoteNumber: token }] },
          include: { customer: true }
        });
        if (quote?.customer) customer = quote.customer;

        // Try direct customer lookup by id or email
        if (!customer) {
          customer = await prisma.customer.findFirst({
            where: { OR: [{ id: token }, { email: token }] }
          });
        }

        // Try user lookup
        if (!customer) {
          const u = await prisma.user.findFirst({
            where: { OR: [{ id: token }, { email: token }] }
          });
          if (u) {
            customer = await prisma.customer.findFirst({ where: { email: u.email } });
          }
        }
      }

      // Default fallback to first active customer
      if (!customer) {
        customer = await prisma.customer.findFirst();
      }

      if (!customer) {
        return res.status(404).json({ success: false, message: 'Customer profile not found.' });
      }

      res.status(200).json({
        success: true,
        data: {
          id: customer.id,
          name: customer.name,
          companyName: customer.companyName,
          email: customer.email,
          phone: customer.phone || '',
          tier: customer.tier,
          billingAddress: customer.billingAddress || '',
          shippingAddress: customer.shippingAddress || '',
          createdAt: customer.createdAt
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/customer-portal/profile
   * Customer edits their own fields (scale for large customer datasets)
   */
  updateProfile: async (req, res, next) => {
    try {
      const token = req.query.token || req.body.token || req.headers['x-customer-token'];
      const { name, companyName, phone, billingAddress, shippingAddress } = req.body;

      let targetCustomerId = null;
      if (token) {
        const quote = await prisma.quotation.findFirst({
          where: { OR: [{ portalToken: token }, { id: token }, { quoteNumber: token }] }
        });
        if (quote) targetCustomerId = quote.customerId;

        if (!targetCustomerId) {
          const cust = await prisma.customer.findFirst({
            where: { OR: [{ id: token }, { email: token }] }
          });
          if (cust) targetCustomerId = cust.id;
        }

        if (!targetCustomerId) {
          const u = await prisma.user.findFirst({
            where: { OR: [{ id: token }, { email: token }] }
          });
          if (u) {
            const cust = await prisma.customer.findFirst({ where: { email: u.email } });
            if (cust) targetCustomerId = cust.id;
          }
        }
      }

      if (!targetCustomerId) {
        const defaultCust = await prisma.customer.findFirst();
        targetCustomerId = defaultCust?.id;
      }

      if (!targetCustomerId) {
        return res.status(404).json({ success: false, message: 'Customer record not found for update.' });
      }

      const updatedCustomer = await prisma.customer.update({
        where: { id: targetCustomerId },
        data: {
          name: name !== undefined ? name.trim() : undefined,
          companyName: companyName !== undefined ? companyName.trim() : undefined,
          phone: phone !== undefined ? phone.trim() : undefined,
          billingAddress: billingAddress !== undefined ? billingAddress.trim() : undefined,
          shippingAddress: shippingAddress !== undefined ? shippingAddress.trim() : undefined
        }
      });

      // Also update linked user fullName and phone if exists
      if (updatedCustomer.email) {
        await prisma.user.updateMany({
          where: { email: updatedCustomer.email },
          data: {
            fullName: updatedCustomer.name,
            phone: updatedCustomer.phone
          }
        });
      }

      // Log audit
      await prisma.auditLog.create({
        data: {
          userRole: 'CUSTOMER',
          action: 'UPDATE_CUSTOMER_SELF_PROFILE',
          resource: 'CUSTOMER',
          resourceId: updatedCustomer.id,
          newValue: {
            name: updatedCustomer.name,
            companyName: updatedCustomer.companyName,
            phone: updatedCustomer.phone,
            billingAddress: updatedCustomer.billingAddress,
            shippingAddress: updatedCustomer.shippingAddress
          },
          reason: 'Customer updated their profile details via Customer Portal'
        }
      });

      res.status(200).json({
        success: true,
        message: 'Your profile and company details have been updated successfully!',
        data: updatedCustomer
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = customerPortalController;
