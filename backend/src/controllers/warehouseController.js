const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const warehouseController = {
  /**
   * GET /api/warehouses
   * Fetch all warehouses with stock levels from PostgreSQL
   */
  getAll: async (req, res, next) => {
    try {
      const warehouses = await prisma.warehouse.findMany({
        include: {
          stockLevels: {
            include: { product: true }
          },
          fulfillments: {
            take: 5,
            orderBy: { createdAt: 'desc' }
          }
        },
        orderBy: { code: 'asc' }
      });

      const formattedWarehouses = warehouses.map((w) => ({
        ...w,
        isMain: w.code === 'BOM-1' || (w.name || '').toLowerCase().includes('central') || (w.name || '').toLowerCase().includes('main')
      }));

      res.status(200).json({ success: true, count: formattedWarehouses.length, data: formattedWarehouses });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/warehouses/:id
   * Fetch single warehouse by ID or code with full stock breakdown
   */
  getById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const warehouse = await prisma.warehouse.findFirst({
        where: { OR: [{ id }, { code: id }] },
        include: {
          stockLevels: {
            include: { product: true }
          },
          fulfillments: {
            include: { order: true, items: { include: { product: true } } },
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      if (!warehouse) {
        return res.status(404).json({ success: false, message: 'Warehouse not found.' });
      }

      res.status(200).json({ success: true, data: warehouse });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/warehouses
   * Create new warehouse directly in PostgreSQL
   */
  create: async (req, res, next) => {
    try {
      const { code, name, location, status = 'ACTIVE' } = req.body;

      if (!code || !name) {
        return res.status(400).json({ success: false, message: 'Warehouse code and name are required.' });
      }

      const cleanCode = code.trim().toUpperCase();
      const existing = await prisma.warehouse.findUnique({ where: { code: cleanCode } });
      if (existing) {
        return res.status(409).json({ success: false, message: 'A warehouse with this code already exists.' });
      }

      const warehouse = await prisma.warehouse.create({
        data: {
          code: cleanCode,
          name: name.trim(),
          location: location ? location.trim() : null,
          status: status || 'ACTIVE'
        }
      });

      res.status(201).json({
        success: true,
        message: 'Warehouse created successfully in PostgreSQL.',
        data: warehouse
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/warehouses/:id
   * Update warehouse details
   */
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, location, status } = req.body;

      const warehouse = await prisma.warehouse.update({
        where: { id },
        data: {
          ...(name && { name: name.trim() }),
          ...(location !== undefined && { location }),
          ...(status && { status })
        }
      });

      res.status(200).json({
        success: true,
        message: 'Warehouse updated successfully in PostgreSQL.',
        data: warehouse
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/warehouses/:id/stock
   * Add or update stock levels for a product at a specific warehouse in PostgreSQL
   */
  updateStock: async (req, res, next) => {
    try {
      const { id: warehouseId } = req.params;
      const { productId, inStock = 0, reserved = 0, backordered = 0, incoming = 0 } = req.body;

      if (!productId) {
        return res.status(400).json({ success: false, message: 'Product ID is required to update stock.' });
      }

      const available = Math.max(0, Number(inStock) - Number(reserved));

      const existingStock = await prisma.stockLevel.findFirst({
        where: { warehouseId, productId }
      });

      let stockRecord;
      if (existingStock) {
        stockRecord = await prisma.stockLevel.update({
          where: { id: existingStock.id },
          data: {
            inStock: Number(inStock),
            reserved: Number(reserved),
            available,
            backordered: Number(backordered),
            incoming: Number(incoming)
          }
        });
      } else {
        stockRecord = await prisma.stockLevel.create({
          data: {
            warehouseId,
            productId,
            inStock: Number(inStock),
            reserved: Number(reserved),
            available,
            backordered: Number(backordered),
            incoming: Number(incoming)
          }
        });
      }

      res.status(200).json({
        success: true,
        message: 'Warehouse stock level updated in PostgreSQL.',
        data: stockRecord
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = warehouseController;
