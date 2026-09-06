const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const customerController = {
  /**
   * GET /api/customers
   * Fetch all customers from PostgreSQL
   */
  getAll: async (req, res, next) => {
    try {
      const { search, tier } = req.query;
      const where = {};

      if (tier && tier !== 'ALL') {
        where.tier = tier;
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { companyName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ];
      }

      const customers = await prisma.customer.findMany({
        where,
        include: {
          quotations: { select: { id: true, quoteNumber: true, totalAmount: true, status: true } },
          orders: { select: { id: true, orderNumber: true, totalAmount: true, status: true } },
          productRequests: { select: { id: true, requestNumber: true, status: true, totalAmount: true } }
        },
        orderBy: { name: 'asc' }
      });

      res.status(200).json({ success: true, count: customers.length, data: customers });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/customers/:id
   * Fetch single customer with relations from PostgreSQL
   */
  getById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const customer = await prisma.customer.findUnique({
        where: { id },
        include: {
          quotations: {
            include: { items: { include: { product: true } } },
            orderBy: { createdAt: 'desc' }
          },
          orders: {
            include: { items: { include: { product: true } }, fulfillments: true },
            orderBy: { createdAt: 'desc' }
          },
          invoices: { orderBy: { createdAt: 'desc' } },
          productRequests: {
            include: { items: { include: { product: true } } },
            orderBy: { createdAt: 'desc' }
          },
          subscriptions: { orderBy: { createdAt: 'desc' } }
        }
      });

      if (!customer) {
        return res.status(404).json({ success: false, message: 'Customer not found.' });
      }

      res.status(200).json({ success: true, data: customer });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/customers
   * Create new customer directly in PostgreSQL
   */
  create: async (req, res, next) => {
    try {
      const { name, companyName, email, phone, tier = 'BRONZE', billingAddress, shippingAddress } = req.body;

      if (!name || !email) {
        return res.status(400).json({ success: false, message: 'Customer name and email are required.' });
      }

      const cleanEmail = email.trim().toLowerCase();
      const existing = await prisma.customer.findUnique({ where: { email: cleanEmail } });
      if (existing) {
        return res.status(409).json({ success: false, message: 'A customer with this email already exists.' });
      }

      const customer = await prisma.customer.create({
        data: {
          name: name.trim(),
          companyName: (companyName || name).trim(),
          email: cleanEmail,
          phone: phone || null,
          tier: tier || 'BRONZE',
          billingAddress: billingAddress || null,
          shippingAddress: shippingAddress || billingAddress || null
        }
      });

      res.status(201).json({
        success: true,
        message: 'Customer created successfully in PostgreSQL.',
        data: customer
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/customers/:id
   * Update existing customer in PostgreSQL
   */
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, companyName, email, phone, tier, billingAddress, shippingAddress } = req.body;

      const customer = await prisma.customer.update({
        where: { id },
        data: {
          ...(name && { name: name.trim() }),
          ...(companyName && { companyName: companyName.trim() }),
          ...(email && { email: email.trim().toLowerCase() }),
          ...(phone !== undefined && { phone }),
          ...(tier && { tier }),
          ...(billingAddress !== undefined && { billingAddress }),
          ...(shippingAddress !== undefined && { shippingAddress })
        }
      });

      res.status(200).json({
        success: true,
        message: 'Customer updated successfully in PostgreSQL.',
        data: customer
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = customerController;
