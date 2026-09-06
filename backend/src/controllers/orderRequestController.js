const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const orderRequestController = {
  /**
   * GET /api/order-requests
   * List customer order requests with rich filtering, search, and stock metrics
   */
  getAll: async (req, res, next) => {
    try {
      const { search, status, assignedTo, customerId, page = 1, limit = 50 } = req.query;
      const where = {};

      if (status && status !== 'ALL') {
        where.status = status;
      }

      if (customerId) {
        where.customerId = customerId;
      }

      if (assignedTo) {
        where.assignedSalesRepId = assignedTo;
      }

      if (search) {
        where.OR = [
          { requestNumber: { contains: search, mode: 'insensitive' } },
          { customer: { name: { contains: search, mode: 'insensitive' } } },
          { customer: { companyName: { contains: search, mode: 'insensitive' } } },
          { customer: { email: { contains: search, mode: 'insensitive' } } },
          { notes: { contains: search, mode: 'insensitive' } }
        ];
      }

      const [requests, totalCount, pendingCount, underReviewCount, quotedCount, negotiationCount, confirmedCount] = await Promise.all([
        prisma.productRequest.findMany({
          where,
          include: {
            customer: true,
            assignedSalesRep: { select: { id: true, fullName: true, email: true, role: true } },
            items: {
              include: {
                product: {
                  include: {
                    stockLevels: {
                      include: { warehouse: true }
                    }
                  }
                }
              }
            },
            quotations: {
              include: {
                items: true,
                approvals: true,
                negotiations: true,
                orders: true
              },
              orderBy: { createdAt: 'desc' }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip: (Number(page) - 1) * Number(limit),
          take: Number(limit)
        }),
        prisma.productRequest.count({ where }),
        prisma.productRequest.count({ where: { status: 'PENDING' } }),
        prisma.productRequest.count({ where: { status: 'UNDER_REVIEW' } }),
        prisma.productRequest.count({ where: { status: 'QUOTATION_CREATED' } }),
        prisma.productRequest.count({ where: { status: 'NEGOTIATION' } }),
        prisma.productRequest.count({ where: { status: 'CONFIRMED' } })
      ]);

      // Enrich requests with aggregated stock availability and quotation status
      const enrichedRequests = requests.map((req) => {
        const totalItemsCount = req.items.reduce((sum, it) => sum + it.quantity, 0);
        let totalAvailableStock = 0;

        req.items.forEach((it) => {
          const availableForProduct = (it.product?.stockLevels || []).reduce((s, sl) => s + sl.available, 0);
          totalAvailableStock += availableForProduct;
        });

        const activeQuotation = req.quotations?.[0] || null;

        return {
          ...req,
          totalItemsCount,
          totalAvailableStock,
          activeQuotation: activeQuotation
            ? {
                id: activeQuotation.id,
                quoteNumber: activeQuotation.quoteNumber,
                status: activeQuotation.status,
                totalAmount: activeQuotation.totalAmount,
                portalToken: activeQuotation.portalToken,
                createdAt: activeQuotation.createdAt,
                negotiationsCount: activeQuotation.negotiations?.length || 0,
                ordersCount: activeQuotation.orders?.length || 0
              }
            : null
        };
      });

      res.status(200).json({
        success: true,
        count: enrichedRequests.length,
        total: totalCount,
        summary: {
          pending: pendingCount,
          underReview: underReviewCount,
          quoted: quotedCount,
          negotiation: negotiationCount,
          confirmed: confirmedCount,
          total: totalCount
        },
        data: enrichedRequests
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/order-requests/stats
   * Aggregated KPI counters for Sales Rep Dashboard
   */
  getStats: async (req, res, next) => {
    try {
      const [pending, underReview, quoted, negotiation, approved, confirmed, total] = await Promise.all([
        prisma.productRequest.count({ where: { status: 'PENDING' } }),
        prisma.productRequest.count({ where: { status: 'UNDER_REVIEW' } }),
        prisma.productRequest.count({ where: { status: 'QUOTATION_CREATED' } }),
        prisma.productRequest.count({ where: { status: 'NEGOTIATION' } }),
        prisma.productRequest.count({ where: { status: 'ACCEPTED' } }),
        prisma.productRequest.count({ where: { status: 'CONFIRMED' } }),
        prisma.productRequest.count()
      ]);

      res.status(200).json({
        success: true,
        data: {
          pending,
          underReview,
          quoted,
          negotiation,
          approved,
          confirmed,
          total
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/order-requests/:id
   * Complete Order Request Details with live stock levels & auto-transition to UNDER_REVIEW
   */
  getById: async (req, res, next) => {
    try {
      const { id } = req.params;

      let request = await prisma.productRequest.findFirst({
        where: {
          OR: [
            { id },
            { requestNumber: id }
          ]
        },
        include: {
          customer: true,
          assignedSalesRep: { select: { id: true, fullName: true, email: true, role: true } },
          items: {
            include: {
              product: {
                include: {
                  stockLevels: {
                    include: { warehouse: true }
                  }
                }
              }
            }
          },
          quotations: {
            include: {
              items: { include: { product: true } },
              approvals: { include: { approver: true } },
              negotiations: { include: { product: true } },
              orders: {
                include: {
                  fulfillments: { include: { warehouse: true } }
                }
              }
            },
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      if (!request) {
        return res.status(404).json({ success: false, message: `Order Request #${id} not found.` });
      }

      // Auto-transition from PENDING to UNDER_REVIEW when opened by a staff member
      if (request.status === 'PENDING' && req.user?.role !== 'CUSTOMER') {
        const repId = req.user?.id;
        const updateData = { status: 'UNDER_REVIEW' };
        if (!request.assignedSalesRepId && repId && !repId.startsWith('usr-admin')) {
          updateData.assignedSalesRepId = repId;
        }

        request = await prisma.productRequest.update({
          where: { id: request.id },
          data: updateData,
          include: {
            customer: true,
            assignedSalesRep: { select: { id: true, fullName: true, email: true, role: true } },
            items: {
              include: {
                product: {
                  include: {
                    stockLevels: {
                      include: { warehouse: true }
                    }
                  }
                }
              }
            },
            quotations: {
              include: {
                items: { include: { product: true } },
                approvals: { include: { approver: true } },
                negotiations: { include: { product: true } },
                orders: {
                  include: {
                    fulfillments: { include: { warehouse: true } }
                  }
                }
              },
              orderBy: { createdAt: 'desc' }
            }
          }
        });

        // Audit Log
        await prisma.auditLog.create({
          data: {
            userId: req.user?.id,
            userRole: req.user?.role || 'SALES_REP',
            action: 'REVIEW_ORDER_REQUEST',
            resource: 'PRODUCT_REQUEST',
            resourceId: request.id,
            newValue: { status: 'UNDER_REVIEW' },
            reason: `Sales Rep started review on Order Request #${request.requestNumber}`
          }
        });
      }

      // Fetch all warehouses for inventory context
      const warehouses = await prisma.warehouse.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { code: 'asc' }
      });

      const formattedWarehouses = warehouses.map((w) => ({
        ...w,
        isMain: w.code === 'BOM-1' || (w.name || '').toLowerCase().includes('central') || (w.name || '').toLowerCase().includes('main')
      }));

      // Compute item-by-item stock feasibility
      const feasibility = request.items.map((item) => {
        const stockByWarehouse = (item.product?.stockLevels || []).map((sl) => {
          const isMain = sl.warehouse?.code === 'BOM-1' || (sl.warehouse?.name || '').toLowerCase().includes('central') || (sl.warehouse?.name || '').toLowerCase().includes('main');
          return {
            id: sl.warehouseId,
            warehouseId: sl.warehouseId,
            code: sl.warehouse?.code || 'WH',
            name: sl.warehouse?.name || sl.warehouse?.code || 'Regional Warehouse',
            warehouseCode: sl.warehouse?.code || 'WH',
            warehouseName: sl.warehouse?.name || sl.warehouse?.code || 'Regional Warehouse',
            location: sl.warehouse?.location || '',
            inStock: sl.inStock || 0,
            reserved: sl.reserved || 0,
            available: sl.available || 0,
            isMain
          };
        });

        const totalAvailable = stockByWarehouse.reduce((s, w) => s + w.available, 0);
        const isFullyAvailable = totalAvailable >= item.quantity;
        const shortfall = Math.max(0, item.quantity - totalAvailable);

        return {
          itemId: item.id,
          productId: item.productId,
          productName: item.product?.name,
          sku: item.product?.sku,
          category: item.product?.category,
          basePrice: item.product?.basePrice,
          targetPrice: item.targetPrice,
          requestedQuantity: item.quantity,
          totalAvailable,
          isFullyAvailable,
          shortfall,
          stockByWarehouse
        };
      });

      const enrichedItems = request.items.map((item) => {
        const feas = feasibility.find((f) => f.itemId === item.id) || {};
        return {
          ...item,
          inventory: {
            totalAvailable: feas.totalAvailable || 0,
            hasShortfall: !feas.isFullyAvailable,
            shortfall: feas.shortfall || 0,
            warehouses: feas.stockByWarehouse || []
          }
        };
      });

      res.status(200).json({
        success: true,
        data: {
          ...request,
          items: enrichedItems,
          feasibility,
          warehouses: formattedWarehouses,
          activeQuotation: request.quotations?.[0] || null
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/order-requests/:id
   * Update request status, assign sales rep, or add review notes
   */
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status, assignedSalesRepId, notes } = req.body;

      const existing = await prisma.productRequest.findFirst({
        where: { OR: [{ id }, { requestNumber: id }] }
      });

      if (!existing) {
        return res.status(404).json({ success: false, message: `Order Request #${id} not found.` });
      }

      const updated = await prisma.productRequest.update({
        where: { id: existing.id },
        data: {
          status: status || existing.status,
          assignedSalesRepId: assignedSalesRepId !== undefined ? assignedSalesRepId : existing.assignedSalesRepId,
          notes: notes !== undefined ? notes : existing.notes
        },
        include: {
          customer: true,
          assignedSalesRep: true,
          items: { include: { product: true } },
          quotations: true
        }
      });

      // Audit Log
      await prisma.auditLog.create({
        data: {
          userId: req.user?.id,
          userRole: req.user?.role || 'SALES_REP',
          action: 'UPDATE_ORDER_REQUEST',
          resource: 'PRODUCT_REQUEST',
          resourceId: updated.id,
          oldValue: { status: existing.status, assignedSalesRepId: existing.assignedSalesRepId },
          newValue: { status: updated.status, assignedSalesRepId: updated.assignedSalesRepId },
          reason: `Updated Order Request #${updated.requestNumber}`
        }
      });

      res.status(200).json({
        success: true,
        message: 'Order Request updated successfully.',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = orderRequestController;
