const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const reportsController = {
  getReports: async (req, res, next) => {
    try {
      const [quotesCount, ordersCount, invoices, subscriptions] = await Promise.all([
        prisma.quotation.count(),
        prisma.order.count(),
        prisma.invoice.findMany({ select: { totalAmount: true, status: true } }),
        prisma.subscription.findMany({ select: { recurringAmount: true, status: true } })
      ]);

      const totalRevenue = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
      const mrr = subscriptions.filter((s) => s.status === 'ACTIVE').reduce((sum, s) => sum + s.recurringAmount, 0);

      res.status(200).json({
        success: true,
        data: {
          quotesCount,
          ordersCount,
          totalRevenue,
          mrr,
          invoicesCount: invoices.length,
          subscriptionsCount: subscriptions.length
        }
      });
    } catch (error) {
      next(error);
    }
  },

  getRevenueReport: async (req, res, next) => {
    try {
      const orders = await prisma.order.findMany({
        include: { customer: true },
        orderBy: { createdAt: 'desc' }
      });
      res.status(200).json({ success: true, count: orders.length, revenue: orders, data: orders });
    } catch (error) {
      next(error);
    }
  },

  getDiscountAnalysis: async (req, res, next) => {
    try {
      const quotations = await prisma.quotation.findMany({
        include: { items: { include: { product: true } }, customer: true }
      });
      res.status(200).json({ success: true, analysis: quotations, data: quotations });
    } catch (error) {
      next(error);
    }
  },

  getApprovalReport: async (req, res, next) => {
    try {
      const approvals = await prisma.approval.findMany({
        include: { quotation: true, approver: true }
      });
      res.status(200).json({ success: true, count: approvals.length, approvals, data: approvals });
    } catch (error) {
      next(error);
    }
  },

  getPerformanceReport: async (req, res, next) => {
    try {
      const reps = await prisma.user.findMany({
        where: { role: 'SALES_REP' },
        include: { quotations: true }
      });
      res.status(200).json({ success: true, performance: reps, data: reps });
    } catch (error) {
      next(error);
    }
  },

  exportReport: async (req, res, next) => {
    try {
      res.status(200).json({ success: true, message: `Report export ready for download.` });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = reportsController;
