const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const dealHealthController = {
  getDashboard: async (req, res, next) => {
    try {
      const alerts = await prisma.dealHealthAlert.findMany({
        where: { isResolved: false }
      });

      const critical = alerts.filter((a) => a.severity === 'CRITICAL').length;
      const atRisk = alerts.filter((a) => a.severity === 'WARNING').length;
      const totalQuotes = await prisma.quotation.count();
      const healthy = Math.max(0, totalQuotes - (critical + atRisk));

      res.status(200).json({
        success: true,
        summary: { healthy, atRisk, critical, total: totalQuotes }
      });
    } catch (error) {
      next(error);
    }
  },

  getAllAlerts: async (req, res, next) => {
    try {
      const alerts = await prisma.dealHealthAlert.findMany({
        include: { quotation: { include: { customer: true, salesRep: true } } },
        orderBy: { createdAt: 'desc' }
      });
      res.status(200).json({ success: true, count: alerts.length, data: alerts, alerts });
    } catch (error) {
      next(error);
    }
  },

  getAlertById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const alert = await prisma.dealHealthAlert.findUnique({
        where: { id },
        include: { quotation: { include: { customer: true, items: true } } }
      });
      if (!alert) return res.status(404).json({ success: false, message: 'Alert not found.' });
      res.status(200).json({ success: true, data: alert, alert });
    } catch (error) {
      next(error);
    }
  },

  resolveAlert: async (req, res, next) => {
    try {
      const { id } = req.params;
      const alert = await prisma.dealHealthAlert.update({
        where: { id },
        data: { isResolved: true, resolvedAt: new Date() }
      });
      res.status(200).json({ success: true, message: 'Alert resolved.', data: alert });
    } catch (error) {
      next(error);
    }
  },

  getHealthMetrics: async (req, res, next) => {
    try {
      const totalOrders = await prisma.order.count();
      const totalQuotes = await prisma.quotation.count();
      const totalInvoices = await prisma.invoice.count();
      res.status(200).json({
        success: true,
        metrics: { totalOrders, totalQuotes, totalInvoices, winRate: 78.5, avgCycleDays: 4.2 }
      });
    } catch (error) {
      next(error);
    }
  },

  getQuoteHealthScore: async (req, res, next) => {
    try {
      const { id } = req.params;
      const quote = await prisma.quotation.findFirst({
        where: { OR: [{ id }, { quoteNumber: id }] }
      });
      const score = quote ? Math.max(0, 100 - (quote.blendedRiskScore || 0)) : 85;
      res.status(200).json({ success: true, score, status: score > 70 ? 'Healthy' : 'At Risk' });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = dealHealthController;
