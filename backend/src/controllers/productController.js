const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const productController = {
  /**
   * GET /api/products
   */
  getAll: async (req, res, next) => {
    try {
      const { category, search } = req.query;
      const where = {};
      if (category) where.category = category;
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } }
        ];
      }

      const products = await prisma.product.findMany({
        where,
        include: {
          variants: true,
          stockLevels: { include: { warehouse: true } },
          discountTiers: true
        },
        orderBy: { name: 'asc' }
      });

      res.status(200).json({ success: true, count: products.length, data: products });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/products/:id
   */
  getById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const product = await prisma.product.findFirst({
        where: { OR: [{ id }, { sku: id }] },
        include: {
          variants: true,
          stockLevels: { include: { warehouse: true } },
          discountTiers: true
        }
      });

      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found.' });
      }

      res.status(200).json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/products
   */
  create: async (req, res, next) => {
    try {
      const { sku, name, description, category, basePrice, standardCost, taxRate = 18.0, unit = 'Units', isSubscription = false, initialStock = 20 } = req.body;

      if (!sku || !name || !category || basePrice === undefined) {
        return res.status(400).json({ success: false, message: 'SKU, name, category, and basePrice are required.' });
      }

      const existing = await prisma.product.findUnique({ where: { sku } });
      if (existing) {
        return res.status(400).json({ success: false, message: `Product with SKU ${sku} already exists.` });
      }

      const product = await prisma.product.create({
        data: {
          sku,
          name,
          description,
          category,
          basePrice: Number(basePrice),
          standardCost: standardCost !== undefined ? Number(standardCost) : Number(basePrice) * 0.7,
          taxRate: Number(taxRate),
          unit,
          isSubscription: Boolean(isSubscription)
        }
      });

      // Initialize stock levels across all active warehouses
      const activeWarehouses = await prisma.warehouse.findMany({ where: { status: 'ACTIVE' } });
      for (const wh of activeWarehouses) {
        const perWhStock = Math.max(5, Math.floor(Number(initialStock) / (activeWarehouses.length || 1)));
        await prisma.stockLevel.create({
          data: {
            productId: product.id,
            warehouseId: wh.id,
            inStock: perWhStock,
            available: perWhStock,
            reserved: 0
          }
        });
      }

      const createdProduct = await prisma.product.findUnique({
        where: { id: product.id },
        include: { stockLevels: { include: { warehouse: true } } }
      });

      res.status(201).json({ success: true, message: 'Product created successfully in PostgreSQL with initial multi-warehouse inventory.', data: createdProduct });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/products/:id
   */
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const updated = await prisma.product.update({
        where: { id },
        data: req.body
      });
      res.status(200).json({ success: true, message: 'Product updated.', data: updated });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/products/:id
   */
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      await prisma.product.delete({ where: { id } });
      res.status(200).json({ success: true, message: 'Product deleted.' });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/products/categories
   */
  getCategories: async (req, res, next) => {
    try {
      const categories = await prisma.product.findMany({
        distinct: ['category'],
        select: { category: true }
      });
      res.status(200).json({
        success: true,
        categories: categories.map((c) => c.category)
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/products/:id/stock
   */
  getProductStock: async (req, res, next) => {
    try {
      const { id } = req.params;
      const stock = await prisma.stockLevel.findMany({
        where: { productId: id },
        include: { warehouse: true }
      });
      res.status(200).json({ success: true, data: stock });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/products/:id/variants
   */
  addVariant: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, sku, priceDelta = 0.0, attributes } = req.body;
      const variant = await prisma.productVariant.create({
        data: {
          productId: id,
          name,
          sku,
          priceDelta: Number(priceDelta),
          attributes: attributes ? JSON.stringify(attributes) : null
        }
      });
      res.status(201).json({ success: true, message: 'Variant created.', data: variant });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/products/:id/variants/:variantId
   */
  updateVariant: async (req, res, next) => {
    try {
      const { variantId } = req.params;
      const updated = await prisma.productVariant.update({
        where: { id: variantId },
        data: req.body
      });
      res.status(200).json({ success: true, message: 'Variant updated.', data: updated });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/products/:id/variants/:variantId
   */
  deleteVariant: async (req, res, next) => {
    try {
      const { variantId } = req.params;
      await prisma.productVariant.delete({ where: { id: variantId } });
      res.status(200).json({ success: true, message: 'Variant deleted.' });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = productController;
