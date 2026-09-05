const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class WarehouseAllocationService {
  /**
   * 1. Allocate an Order across multiple warehouses with transactional integrity
   */
  async allocateOrder(orderId) {
    return await prisma.$transaction(async (tx) => {
      // 1. Fetch order with items and customer (support by id or orderNumber)
      const order = await tx.order.findFirst({
        where: {
          OR: [
            { id: orderId },
            { orderNumber: orderId }
          ]
        },
        include: {
          customer: true,
          items: {
            include: { product: true }
          },
          fulfillments: true,
          backorders: true
        }
      });

      if (!order) {
        throw new Error(`Order #${orderId} not found.`);
      }

      if (order.status === 'CANCELLED') {
        throw new Error(`Cannot allocate a cancelled order.`);
      }

      const warehouseAllocations = {}; // { [warehouseId]: { warehouse, items: [] } }
      const backorderItemsToCreate = [];

      // 2. Evaluate each order item for multi-warehouse allocation
      for (const item of order.items) {
        const neededQty = item.requestedQuantity - item.fulfilledQuantity;
        if (neededQty <= 0) continue;

        let remainingNeeded = neededQty;

        // Fetch stock across all active warehouses with available stock > 0
        const stockRecords = await tx.stockLevel.findMany({
          where: {
            productId: item.productId,
            available: { gt: 0 }
          },
          include: {
            warehouse: true
          },
          orderBy: {
            available: 'desc' // Greedy heuristic: prioritize warehouses with largest stock
          }
        });

        for (const stock of stockRecords) {
          if (remainingNeeded <= 0) break;

          const allocQty = Math.min(stock.available, remainingNeeded);
          if (allocQty <= 0) continue;

          // Reserve inventory atomically
          const updatedStock = await tx.stockLevel.update({
            where: { id: stock.id },
            data: {
              reserved: { increment: allocQty },
              available: { decrement: allocQty }
            }
          });

          if (updatedStock.available < 0 || updatedStock.reserved < 0) {
            throw new Error(`Race condition detected: Insufficient available inventory for product ${item.productId} at warehouse ${stock.warehouse.code}.`);
          }

          // Track allocation
          if (!warehouseAllocations[stock.warehouseId]) {
            warehouseAllocations[stock.warehouseId] = {
              warehouse: stock.warehouse,
              items: []
            };
          }

          warehouseAllocations[stock.warehouseId].items.push({
            orderItemId: item.id,
            productId: item.productId,
            quantity: allocQty,
            unitPrice: item.unitPrice,
            productName: item.product.name
          });

          remainingNeeded -= allocQty;
        }

        // If not completely fulfilled, queue remaining as backorder
        if (remainingNeeded > 0) {
          backorderItemsToCreate.push({
            orderItemId: item.id,
            productId: item.productId,
            quantity: remainingNeeded,
            remainingQuantity: remainingNeeded,
            fulfilledQuantity: 0
          });
        }
      }

      const createdFulfillments = [];
      const createdInvoices = [];

      // 3. Create independent warehouse fulfillment records
      for (const [whId, alloc] of Object.entries(warehouseAllocations)) {
        const totalUnits = alloc.items.reduce((sum, i) => sum + i.quantity, 0);
        const randSuffix = Math.floor(1000 + Math.random() * 9000);
        const fulfillmentNumber = `FUL-${order.orderNumber}-${alloc.warehouse.code}-${randSuffix}`;

        // Compute estimated freight cost
        const shippingCost = Math.round(totalUnits * 250); // ₹250 per unit standard freight

        const fulfillment = await tx.fulfillment.create({
          data: {
            orderId: order.id,
            warehouseId: whId,
            fulfillmentNumber: fulfillmentNumber,
            orderNumber: order.orderNumber,
            status: 'READY',
            totalUnits: totalUnits,
            totalQuantity: totalUnits,
            shippingCost: shippingCost,
            carrier: 'BlueDart Express / Delhivery Freight',
            items: {
              create: alloc.items.map((i) => ({
                orderItemId: i.orderItemId,
                productId: i.productId,
                quantity: i.quantity,
                unitPrice: i.unitPrice
              }))
            }
          },
          include: {
            warehouse: true,
            items: {
              include: { product: true }
            }
          }
        });

        // 4. Update order items fulfilled quantities
        for (const i of alloc.items) {
          await tx.orderItem.update({
            where: { id: i.orderItemId },
            data: {
              fulfilledQuantity: { increment: i.quantity }
            }
          });
        }

        // 5. Generate warehouse-specific commercial invoice associated with this parent order
        const invoiceSubtotal = alloc.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
        const invoiceTax = Math.round(invoiceSubtotal * 0.18);
        const invoiceTotal = invoiceSubtotal + invoiceTax;
        const invoiceNumber = `INV-${order.orderNumber}-${alloc.warehouse.code}-${randSuffix}`;

        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);

        const invoice = await tx.invoice.create({
          data: {
            invoiceNumber: invoiceNumber,
            customerId: order.customerId,
            orderId: order.id,
            fulfillmentId: fulfillment.id,
            warehouseId: whId,
            amount: invoiceSubtotal,
            taxAmount: invoiceTax,
            totalAmount: invoiceTotal,
            status: 'UNPAID',
            dueDate: dueDate,
            paymentMethod: 'Corporate Wire / RTGS'
          }
        });

        createdFulfillments.push(fulfillment);
        createdInvoices.push(invoice);
      }

      // 6. Create Backorder record if there are shortages
      let createdBackorder = null;
      if (backorderItemsToCreate.length > 0) {
        createdBackorder = await tx.backorder.create({
          data: {
            orderId: order.id,
            status: 'BACKORDERED',
            items: {
              create: backorderItemsToCreate.map((b) => ({
                orderItemId: b.orderItemId,
                productId: b.productId,
                quantity: b.quantity,
                fulfilledQuantity: 0,
                remainingQuantity: b.remainingQuantity
              }))
            }
          },
          include: {
            items: {
              include: { product: true }
            }
          }
        });

        // Update backordered count on order items
        for (const b of backorderItemsToCreate) {
          await tx.orderItem.update({
            where: { id: b.orderItemId },
            data: {
              backorderedQuantity: b.remainingQuantity
            }
          });

          // Mark backordered on product stock level for visibility
          const firstStock = await tx.stockLevel.findFirst({
            where: { productId: b.productId }
          });
          if (firstStock) {
            await tx.stockLevel.update({
              where: { id: firstStock.id },
              data: { backordered: { increment: b.remainingQuantity } }
            });
          }
        }
      }

      // 7. Recalculate parent order metrics & status
      const updatedOrderItems = await tx.orderItem.findMany({
        where: { orderId: order.id }
      });

      const totalRequested = updatedOrderItems.reduce((s, i) => s + i.requestedQuantity, 0);
      const totalFulfilled = updatedOrderItems.reduce((s, i) => s + i.fulfilledQuantity, 0);
      const totalBackordered = updatedOrderItems.reduce((s, i) => s + i.backorderedQuantity, 0);

      let newStatus = 'CONFIRMED';
      if (totalFulfilled === totalRequested && totalRequested > 0) {
        newStatus = 'FULFILLED';
      } else if (totalFulfilled > 0 && totalBackordered > 0) {
        newStatus = 'PARTIALLY_FULFILLED';
      } else if (totalFulfilled === 0 && totalBackordered > 0) {
        newStatus = 'BACKORDERED';
      }

      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: {
          totalRequested,
          totalFulfilled,
          totalBackordered,
          status: newStatus
        },
        include: {
          customer: true,
          items: { include: { product: true } },
          fulfillments: { include: { warehouse: true, items: { include: { product: true } } } },
          backorders: { include: { items: { include: { product: true } } } },
          invoices: true
        }
      });

      return {
        order: updatedOrder,
        fulfillmentsCreated: createdFulfillments,
        invoicesCreated: createdInvoices,
        backorderCreated: createdBackorder
      };
    });
  }

  /**
   * 2. Attempt to fulfill backorder when new warehouse inventory arrives
   */
  async fulfillBackorder(backorderId, targetWarehouseId = null) {
    return await prisma.$transaction(async (tx) => {
      const backorder = await tx.backorder.findUnique({
        where: { id: backorderId },
        include: {
          order: {
            include: { customer: true, items: true }
          },
          items: {
            include: { product: true, orderItem: true }
          }
        }
      });

      if (!backorder) {
        throw new Error(`Backorder #${backorderId} not found.`);
      }

      if (backorder.status === 'FULFILLED') {
        throw new Error(`Backorder #${backorderId} has already been completely fulfilled.`);
      }

      const warehouseAllocations = {};
      let anyItemAllocated = false;

      for (const bItem of backorder.items) {
        if (bItem.remainingQuantity <= 0) continue;

        let remaining = bItem.remainingQuantity;

        // Query available stock
        const whereClause = {
          productId: bItem.productId,
          available: { gt: 0 }
        };
        if (targetWarehouseId) {
          whereClause.warehouseId = targetWarehouseId;
        }

        const stocks = await tx.stockLevel.findMany({
          where: whereClause,
          include: { warehouse: true },
          orderBy: { available: 'desc' }
        });

        for (const stock of stocks) {
          if (remaining <= 0) break;
          const allocQty = Math.min(stock.available, remaining);
          if (allocQty <= 0) continue;

          // Reserve stock
          await tx.stockLevel.update({
            where: { id: stock.id },
            data: {
              reserved: { increment: allocQty },
              available: { decrement: allocQty },
              backordered: { decrement: allocQty }
            }
          });

          if (!warehouseAllocations[stock.warehouseId]) {
            warehouseAllocations[stock.warehouseId] = {
              warehouse: stock.warehouse,
              items: []
            };
          }

          warehouseAllocations[stock.warehouseId].items.push({
            backorderItemId: bItem.id,
            orderItemId: bItem.orderItemId,
            productId: bItem.productId,
            quantity: allocQty,
            unitPrice: bItem.orderItem?.unitPrice || bItem.product.basePrice
          });

          remaining -= allocQty;
          anyItemAllocated = true;
        }
      }

      if (!anyItemAllocated) {
        throw new Error(`No available inventory in warehouses to satisfy Backorder #${backorderId}.`);
      }

      const createdFulfillments = [];
      const createdInvoices = [];

      for (const [whId, alloc] of Object.entries(warehouseAllocations)) {
        const totalUnits = alloc.items.reduce((sum, i) => sum + i.quantity, 0);
        const randSuffix = Math.floor(1000 + Math.random() * 9000);
        const fulfillmentNumber = `FUL-${backorder.order.orderNumber}-${alloc.warehouse.code}-BO-${randSuffix}`;
        const shippingCost = Math.round(totalUnits * 250);

        const fulfillment = await tx.fulfillment.create({
          data: {
            orderId: backorder.orderId,
            warehouseId: whId,
            fulfillmentNumber: fulfillmentNumber,
            orderNumber: backorder.order.orderNumber,
            status: 'READY',
            totalUnits: totalUnits,
            totalQuantity: totalUnits,
            shippingCost: shippingCost,
            carrier: 'BlueDart Express / Priority Cargo',
            items: {
              create: alloc.items.map((i) => ({
                orderItemId: i.orderItemId,
                productId: i.productId,
                quantity: i.quantity,
                unitPrice: i.unitPrice
              }))
            }
          },
          include: {
            warehouse: true,
            items: { include: { product: true } }
          }
        });

        // Update backorder items & order items
        for (const i of alloc.items) {
          await tx.backorderItem.update({
            where: { id: i.backorderItemId },
            data: {
              fulfilledQuantity: { increment: i.quantity },
              remainingQuantity: { decrement: i.quantity }
            }
          });

          await tx.orderItem.update({
            where: { id: i.orderItemId },
            data: {
              fulfilledQuantity: { increment: i.quantity },
              backorderedQuantity: { decrement: i.quantity }
            }
          });
        }

        // Generate invoice for this fulfillment
        const invoiceSubtotal = alloc.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
        const invoiceTax = Math.round(invoiceSubtotal * 0.18);
        const invoiceTotal = invoiceSubtotal + invoiceTax;
        const invoiceNumber = `INV-${backorder.order.orderNumber}-${alloc.warehouse.code}-BO-${randSuffix}`;

        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);

        const invoice = await tx.invoice.create({
          data: {
            invoiceNumber: invoiceNumber,
            customerId: backorder.order.customerId,
            orderId: backorder.order.id,
            fulfillmentId: fulfillment.id,
            warehouseId: whId,
            amount: invoiceSubtotal,
            taxAmount: invoiceTax,
            totalAmount: invoiceTotal,
            status: 'UNPAID',
            dueDate: dueDate,
            paymentMethod: 'Corporate Wire / RTGS'
          }
        });

        createdFulfillments.push(fulfillment);
        createdInvoices.push(invoice);
      }

      // Check if all backorder items are fulfilled
      const updatedBackorderItems = await tx.backorderItem.findMany({
        where: { backorderId: backorder.id }
      });
      const totalRemainingBO = updatedBackorderItems.reduce((s, i) => s + i.remainingQuantity, 0);

      const updatedBackorder = await tx.backorder.update({
        where: { id: backorder.id },
        data: {
          status: totalRemainingBO === 0 ? 'FULFILLED' : 'PARTIALLY_FULFILLED'
        },
        include: { items: { include: { product: true } } }
      });

      // Recalculate parent order status
      const updatedOrderItems = await tx.orderItem.findMany({
        where: { orderId: backorder.orderId }
      });
      const totalReq = updatedOrderItems.reduce((s, i) => s + i.requestedQuantity, 0);
      const totalFul = updatedOrderItems.reduce((s, i) => s + i.fulfilledQuantity, 0);
      const totalBO = updatedOrderItems.reduce((s, i) => s + i.backorderedQuantity, 0);

      const updatedOrder = await tx.order.update({
        where: { id: backorder.orderId },
        data: {
          totalRequested: totalReq,
          totalFulfilled: totalFul,
          totalBackordered: totalBO,
          status: totalFul === totalReq ? 'FULFILLED' : 'PARTIALLY_FULFILLED'
        },
        include: {
          customer: true,
          items: { include: { product: true } },
          fulfillments: { include: { warehouse: true, items: { include: { product: true } } } },
          backorders: { include: { items: { include: { product: true } } } },
          invoices: true
        }
      });

      return {
        order: updatedOrder,
        backorder: updatedBackorder,
        fulfillmentsCreated: createdFulfillments,
        invoicesCreated: createdInvoices
      };
    });
  }

  /**
   * 3. Dispatch a Fulfillment (deduct reserved and in-stock inventory permanently)
   */
  async dispatchFulfillment(fulfillmentId, carrier = 'BlueDart Express', trackingNumber = null) {
    return await prisma.$transaction(async (tx) => {
      const fulfillment = await tx.fulfillment.findUnique({
        where: { id: fulfillmentId },
        include: {
          items: true,
          order: true
        }
      });

      if (!fulfillment) {
        throw new Error(`Fulfillment #${fulfillmentId} not found.`);
      }

      if (fulfillment.status === 'DISPATCHED' || fulfillment.status === 'DELIVERED') {
        throw new Error(`Fulfillment #${fulfillment.fulfillmentNumber} is already ${fulfillment.status}.`);
      }

      // Deduct from warehouse physical stock (reserved -> permanent reduction)
      for (const item of fulfillment.items) {
        if (fulfillment.warehouseId) {
          await tx.stockLevel.update({
            where: {
              productId_warehouseId: {
                productId: item.productId,
                warehouseId: fulfillment.warehouseId
              }
            },
            data: {
              inStock: { decrement: item.quantity },
              reserved: { decrement: item.quantity }
            }
          });
        }
      }

      const generatedTracking = trackingNumber || `AWB-IND-${Math.floor(10000000 + Math.random() * 90000000)}`;

      const updatedFulfillment = await tx.fulfillment.update({
        where: { id: fulfillmentId },
        data: {
          status: 'DISPATCHED',
          carrier: carrier,
          trackingNumber: generatedTracking,
          dispatchedAt: new Date()
        },
        include: {
          warehouse: true,
          items: { include: { product: true } },
          invoices: true
        }
      });

      // Update parent order status if applicable
      if (fulfillment.orderId) {
        const allFulfillments = await tx.fulfillment.findMany({
          where: { orderId: fulfillment.orderId }
        });
        const allDispatched = allFulfillments.every((f) => f.status === 'DISPATCHED' || f.status === 'DELIVERED');

        await tx.order.update({
          where: { id: fulfillment.orderId },
          data: {
            status: allDispatched ? 'DISPATCHED' : 'PARTIALLY_DISPATCHED'
          }
        });
      }

      return updatedFulfillment;
    });
  }

  /**
   * 4. Mark Fulfillment as Delivered
   */
  async deliverFulfillment(fulfillmentId) {
    return await prisma.$transaction(async (tx) => {
      const fulfillment = await tx.fulfillment.findUnique({
        where: { id: fulfillmentId }
      });

      if (!fulfillment) {
        throw new Error(`Fulfillment #${fulfillmentId} not found.`);
      }

      const updatedFulfillment = await tx.fulfillment.update({
        where: { id: fulfillmentId },
        data: {
          status: 'DELIVERED',
          deliveredAt: new Date()
        },
        include: {
          warehouse: true,
          items: { include: { product: true } }
        }
      });

      if (fulfillment.orderId) {
        const allFulfillments = await tx.fulfillment.findMany({
          where: { orderId: fulfillment.orderId }
        });
        const allDelivered = allFulfillments.every((f) => f.status === 'DELIVERED');
        if (allDelivered) {
          await tx.order.update({
            where: { id: fulfillment.orderId },
            data: { status: 'DELIVERED' }
          });
        }
      }

      return updatedFulfillment;
    });
  }

  /**
   * 5. Get Complete Consolidated Order Summary
   */
  async getOrderSummary(orderId) {
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: orderId },
          { orderNumber: orderId }
        ]
      },
      include: {
        customer: true,
        quotation: true,
        items: {
          include: { product: true }
        },
        fulfillments: {
          include: {
            warehouse: true,
            items: { include: { product: true } },
            invoices: true
          }
        },
        backorders: {
          include: {
            items: { include: { product: true } }
          }
        },
        invoices: {
          include: { warehouse: true }
        }
      }
    });

    if (!order) {
      throw new Error(`Order #${orderId} not found.`);
    }

    const orderedQty = (order.items || []).reduce((sum, i) => sum + (i.requestedQuantity || i.quantity || 0), 0);
    const allocatedQty = (order.fulfillments || []).reduce((sum, f) => {
      const itemUnits = (f.items || []).reduce((s, i) => s + i.quantity, 0);
      return sum + (itemUnits || f.totalUnits || f.totalQuantity || 0);
    }, 0);
    const dispatchedQty = (order.fulfillments || [])
      .filter((f) => f.status === 'DISPATCHED' || f.status === 'DELIVERED')
      .reduce((sum, f) => {
        const itemUnits = (f.items || []).reduce((s, i) => s + i.quantity, 0);
        return sum + (itemUnits || f.totalUnits || f.totalQuantity || 0);
      }, 0);
    const deliveredQty = (order.fulfillments || [])
      .filter((f) => f.status === 'DELIVERED')
      .reduce((sum, f) => {
        const itemUnits = (f.items || []).reduce((s, i) => s + i.quantity, 0);
        return sum + (itemUnits || f.totalUnits || f.totalQuantity || 0);
      }, 0);
    const backorderedQty = (order.backorders || []).reduce((sum, b) => {
      const itemUnits = (b.items || []).reduce((s, i) => s + (i.quantity || i.remainingQuantity || 0), 0);
      return sum + (itemUnits || b.totalBackordered || 0);
    }, 0);
    const fulfillmentPercentage = orderedQty > 0 ? Math.round((deliveredQty / orderedQty) * 100) : 0;

    return {
      order,
      progress: {
        orderedQty,
        allocatedQty,
        dispatchedQty,
        deliveredQty,
        backorderedQty,
        fulfillmentPercentage
      },
      fulfillments: order.fulfillments || [],
      backorders: order.backorders || [],
      invoices: order.invoices || []
    };
  }

  /**
   * 6. Create a New Customer Order directly (with automated allocation option)
   */
  async createOrder({ customerId, quotationId = null, items = [], shippingAddress = null, notes = '', autoAllocate = true }) {
    return await prisma.$transaction(async (tx) => {
      const count = await tx.order.count();
      const orderNumber = `ORD-2026-${String(1001 + count).padStart(4, '0')}`;

      // Calculate total amount
      let subtotal = 0;
      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) throw new Error(`Product ${item.productId} not found.`);
        const unitPrice = item.unitPrice !== undefined ? item.unitPrice : product.basePrice;
        subtotal += item.quantity * unitPrice;
      }
      const tax = Math.round(subtotal * 0.18);
      const totalAmount = subtotal + tax;

      const totalRequested = items.reduce((s, i) => s + i.quantity, 0);

      const order = await tx.order.create({
        data: {
          orderNumber,
          customerId,
          quotationId,
          status: 'PENDING',
          totalAmount,
          totalRequested,
          totalFulfilled: 0,
          totalBackordered: 0,
          shippingAddress,
          notes,
          items: {
            create: items.map((i) => ({
              productId: i.productId,
              requestedQuantity: i.quantity,
              fulfilledQuantity: 0,
              backorderedQuantity: 0,
              unitPrice: i.unitPrice,
              totalPrice: i.quantity * i.unitPrice
            }))
          }
        },
        include: {
          items: { include: { product: true } },
          customer: true
        }
      });

      return order;
    }).then(async (createdOrder) => {
      if (autoAllocate) {
        return await this.allocateOrder(createdOrder.id);
      }
      return { order: createdOrder };
    });
  }

  /**
   * 7. Restock Inventory at a Warehouse (for simulating backorder arrival)
   */
  async restockWarehouse(warehouseId, productId, quantity) {
    return await prisma.$transaction(async (tx) => {
      const stock = await tx.stockLevel.upsert({
        where: {
          productId_warehouseId: { productId, warehouseId }
        },
        update: {
          inStock: { increment: quantity },
          available: { increment: quantity }
        },
        create: {
          warehouseId,
          productId,
          inStock: quantity,
          reserved: 0,
          available: quantity,
          incoming: 0,
          backordered: 0
        },
        include: { warehouse: true, product: true }
      });

      return stock;
    });
  }
}

module.exports = new WarehouseAllocationService();
