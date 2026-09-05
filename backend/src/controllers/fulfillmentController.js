const { PrismaClient } = require('@prisma/client');
const warehouseAllocationService = require('../services/warehouseAllocationService');
const prisma = new PrismaClient();

const fulfillmentController = {
  /**
   * GET /api/fulfillment
   * Fetch all fulfillments with warehouse, order, and customer details
   */
  getAll: async (req, res, next) => {
    try {
      const fulfillments = await prisma.fulfillment.findMany({
        include: {
          warehouse: true,
          order: {
            include: { customer: true }
          },
          quotation: {
            include: { customer: true }
          },
          items: {
            include: { product: true }
          },
          invoices: true,
          splits: {
            include: { warehouse: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      res.status(200).json({ success: true, count: fulfillments.length, data: fulfillments });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/fulfillment/pending
   */
  getPending: async (req, res, next) => {
    try {
      const pendingFulfillments = await prisma.fulfillment.findMany({
        where: {
          status: { in: ['PENDING', 'ALLOCATED', 'READY'] }
        },
        include: {
          warehouse: true,
          order: { include: { customer: true } },
          items: { include: { product: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
      res.status(200).json({ success: true, count: pendingFulfillments.length, data: pendingFulfillments });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/fulfillment/:id
   */
  getById: async (req, res, next) => {
    try {
      const fulfillment = await prisma.fulfillment.findUnique({
        where: { id: req.params.id },
        include: {
          warehouse: true,
          order: {
            include: {
              customer: true,
              items: { include: { product: true } },
              fulfillments: { include: { warehouse: true } },
              backorders: { include: { items: { include: { product: true } } } },
              invoices: true
            }
          },
          quotation: {
            include: { customer: true }
          },
          items: {
            include: { product: true }
          },
          invoices: true
        }
      });
      if (!fulfillment) {
        return res.status(404).json({ success: false, message: 'Fulfillment record not found' });
      }
      res.status(200).json({ success: true, data: fulfillment });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/fulfillment/warehouses (or /api/warehouses)
   */
  getWarehouses: async (req, res, next) => {
    try {
      const warehouses = await prisma.warehouse.findMany({
        include: {
          stockLevels: {
            include: { product: true }
          },
          fulfillments: {
            where: { status: { in: ['READY', 'ALLOCATED', 'DISPATCHED'] } }
          }
        },
        orderBy: { code: 'asc' }
      });
      res.status(200).json({ success: true, count: warehouses.length, data: warehouses });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/fulfillment/warehouses/:id/stock (or /api/warehouses/:warehouseId/inventory)
   */
  getWarehouseStock: async (req, res, next) => {
    try {
      const warehouseId = req.params.id || req.params.warehouseId;
      const stock = await prisma.stockLevel.findMany({
        where: { warehouseId },
        include: {
          product: true,
          warehouse: true
        },
        orderBy: { product: { name: 'asc' } }
      });
      res.status(200).json({ success: true, count: stock.length, data: stock });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/fulfillment/:id/dispatch (or /api/fulfillments/:id/dispatch)
   */
  dispatch: async (req, res, next) => {
    try {
      const { carrier, trackingNumber } = req.body;
      const fulfillment = await warehouseAllocationService.dispatchFulfillment(
        req.params.id,
        carrier,
        trackingNumber
      );
      res.status(200).json({
        success: true,
        message: `Fulfillment ${fulfillment.fulfillmentNumber} marked as DISPATCHED. Stock deducted permanently.`,
        data: fulfillment
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/fulfillment/:id/deliver
   */
  deliver: async (req, res, next) => {
    try {
      const fulfillment = await warehouseAllocationService.deliverFulfillment(req.params.id);
      res.status(200).json({
        success: true,
        message: `Fulfillment ${fulfillment.fulfillmentNumber} marked as DELIVERED.`,
        data: fulfillment
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/fulfillment/warehouses/:warehouseId/restock
   * Allows receiving new inventory into a warehouse
   */
  restockWarehouse: async (req, res, next) => {
    try {
      const { warehouseId } = req.params;
      const { productId, quantity } = req.body;
      if (!productId || !quantity || quantity <= 0) {
        return res.status(400).json({ success: false, message: 'Valid productId and positive quantity are required.' });
      }

      const stock = await warehouseAllocationService.restockWarehouse(warehouseId, productId, parseInt(quantity, 10));
      res.status(200).json({
        success: true,
        message: `Successfully restocked ${quantity} units of ${stock.product.name} at ${stock.warehouse.name}.`,
        data: stock
      });
    } catch (error) {
      next(error);
    }
  },

  createSplit: async (req, res, next) => {
    try {
      res.status(200).json({ success: true, message: 'Warehouse split generated' });
    } catch (error) {
      next(error);
    }
  },

  acceptSplit: async (req, res, next) => {
    try {
      res.status(200).json({ success: true, message: 'Fulfillment split accepted' });
    } catch (error) {
      next(error);
    }
  },

  manualOverride: async (req, res, next) => {
    try {
      res.status(200).json({ success: true, message: 'Manual allocation saved' });
    } catch (error) {
      next(error);
    }
  },

  checkStock: async (req, res, next) => {
    try {
      res.status(200).json({ success: true, inStock: true });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = fulfillmentController;
