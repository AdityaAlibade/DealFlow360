const { PrismaClient } = require('@prisma/client');
const warehouseAllocationService = require('../services/warehouseAllocationService');
const prisma = new PrismaClient();

const backorderController = {
  /**
   * GET /api/backorders
   * List all pending or active backorders
   */
  getAll: async (req, res, next) => {
    try {
      const backorders = await prisma.backorder.findMany({
        include: {
          order: {
            include: { customer: true }
          },
          items: {
            include: { product: true, orderItem: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      res.status(200).json({ success: true, count: backorders.length, data: backorders });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/backorders/:id
   */
  getById: async (req, res, next) => {
    try {
      const backorder = await prisma.backorder.findUnique({
        where: { id: req.params.id },
        include: {
          order: {
            include: { customer: true, items: true, fulfillments: true }
          },
          items: {
            include: { product: true, orderItem: true }
          }
        }
      });
      if (!backorder) {
        return res.status(404).json({ success: false, message: 'Backorder not found' });
      }
      res.status(200).json({ success: true, data: backorder });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/backorders/:id/fulfill
   * Attempt to satisfy backorder using newly arrived warehouse inventory
   */
  fulfill: async (req, res, next) => {
    try {
      const { warehouseId } = req.body;
      const result = await warehouseAllocationService.fulfillBackorder(req.params.id, warehouseId);
      res.status(200).json({
        success: true,
        message: 'Backorder successfully allocated and converted into fulfillment shipment.',
        data: result
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/backorders/:id/cancel
   */
  cancel: async (req, res, next) => {
    try {
      const { reason } = req.body;
      const backorder = await prisma.backorder.update({
        where: { id: req.params.id },
        data: { status: 'CANCELLED' }
      });
      res.status(200).json({ success: true, message: 'Backorder cancelled', data: backorder });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = backorderController;
