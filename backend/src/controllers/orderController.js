const { PrismaClient } = require('@prisma/client');
const warehouseAllocationService = require('../services/warehouseAllocationService');
const prisma = new PrismaClient();

const orderController = {
  /**
   * GET /api/orders
   * List all customer orders with customer details, fulfillments count, and status
   */
  getAll: async (req, res, next) => {
    try {
      const orders = await prisma.order.findMany({
        include: {
          customer: true,
          items: { include: { product: true } },
          fulfillments: { include: { warehouse: true } },
          backorders: { include: { items: true } },
          invoices: true
        },
        orderBy: { createdAt: 'desc' }
      });
      res.status(200).json({ success: true, count: orders.length, data: orders });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/orders/:id
   */
  getById: async (req, res, next) => {
    try {
      const order = await warehouseAllocationService.getOrderSummary(req.params.id);
      res.status(200).json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/orders/:id/summary
   */
  getSummary: async (req, res, next) => {
    try {
      const order = await warehouseAllocationService.getOrderSummary(req.params.id);
      res.status(200).json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/orders
   * Place a new order and optionally auto-allocate across warehouses
   */
  create: async (req, res, next) => {
    try {
      const { customerId, quotationId, items, shippingAddress, notes, autoAllocate } = req.body;
      if (!customerId || !items || !items.length) {
        return res.status(400).json({ success: false, message: 'Customer ID and at least one order item are required.' });
      }

      const result = await warehouseAllocationService.createOrder({
        customerId,
        quotationId,
        items,
        shippingAddress,
        notes,
        autoAllocate: autoAllocate !== false
      });

      res.status(201).json({
        success: true,
        message: 'Order created and multi-warehouse allocation evaluated successfully.',
        data: result
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/orders/:id/allocate
   * Explicitly trigger or re-evaluate multi-warehouse allocation for an order
   */
  allocate: async (req, res, next) => {
    try {
      const result = await warehouseAllocationService.allocateOrder(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Order successfully allocated across warehouses.',
        data: result
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/orders/:id/fulfillments
   */
  getFulfillments: async (req, res, next) => {
    try {
      const fulfillments = await prisma.fulfillment.findMany({
        where: { orderId: req.params.id },
        include: {
          warehouse: true,
          items: { include: { product: true } },
          invoices: true
        }
      });
      res.status(200).json({ success: true, data: fulfillments });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/orders/:id/backorders
   */
  getBackorders: async (req, res, next) => {
    try {
      const backorders = await prisma.backorder.findMany({
        where: { orderId: req.params.id },
        include: {
          items: { include: { product: true, orderItem: true } }
        }
      });
      res.status(200).json({ success: true, data: backorders });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = orderController;
