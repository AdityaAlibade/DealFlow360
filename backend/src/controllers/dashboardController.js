const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const dashboardController = {
  getMetrics: async (req, res, next) => {
    try {
      const [
        ordersAgg,
        invoicesAgg,
        activeQuotesCount,
        pendingApprovalsCount,
        totalQuotesCount,
        criticalAlertsCount
      ] = await Promise.all([
        prisma.order.aggregate({ _sum: { totalAmount: true } }),
        prisma.invoice.aggregate({ where: { status: 'PAID' }, _sum: { totalAmount: true } }),
        prisma.quotation.count({ where: { status: { in: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'NEGOTIATION'] } } }),
        prisma.approval.count({ where: { status: 'PENDING' } }),
        prisma.quotation.count(),
        prisma.dealHealthAlert.count({ where: { isResolved: false, severity: 'CRITICAL' } })
      ]);

      const totalRevenueNumeric = Number(ordersAgg._sum.totalAmount || invoicesAgg._sum.totalAmount || 0);
      const healthyQuotesCount = Math.max(0, totalQuotesCount - criticalAlertsCount);

      res.status(200).json({
        success: true,
        data: {
          totalRevenue: `₹${totalRevenueNumeric.toLocaleString('en-IN')}`,
          totalRevenueNumeric,
          activeQuotes: activeQuotesCount,
          pendingApprovals: pendingApprovalsCount,
          dealHealthScore: `${healthyQuotesCount}/${totalQuotesCount || 1}`,
          totalQuotes: totalQuotesCount
        }
      });
    } catch (error) {
      next(error);
    }
  },

  getPipelineSummary: async (req, res, next) => {
    try {
      const [draft, pendingApproval, approved, confirmed, cancelled] = await Promise.all([
        prisma.quotation.count({ where: { status: 'DRAFT' } }),
        prisma.quotation.count({ where: { status: 'PENDING_APPROVAL' } }),
        prisma.quotation.count({ where: { status: 'APPROVED' } }),
        prisma.quotation.count({ where: { status: 'CONFIRMED' } }),
        prisma.quotation.count({ where: { status: 'CANCELLED' } })
      ]);

      res.status(200).json({
        success: true,
        data: [
          { stage: 'DRAFT', count: draft },
          { stage: 'PENDING_APPROVAL', count: pendingApproval },
          { stage: 'APPROVED', count: approved },
          { stage: 'CONFIRMED', count: confirmed },
          { stage: 'CANCELLED', count: cancelled }
        ]
      });
    } catch (error) {
      next(error);
    }
  },

  getRecentActivity: async (req, res, next) => {
    try {
      const activities = await prisma.auditLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' }
      });

      res.status(200).json({
        success: true,
        count: activities.length,
        data: activities
      });
    } catch (error) {
      next(error);
    }
  },

  getDealHealthSummary: async (req, res, next) => {
    try {
      const [totalQuotes, unresolvedAlerts] = await Promise.all([
        prisma.quotation.count(),
        prisma.dealHealthAlert.findMany({ where: { isResolved: false } })
      ]);

      const critical = unresolvedAlerts.filter((a) => a.severity === 'CRITICAL').length;
      const atRisk = unresolvedAlerts.filter((a) => a.severity === 'WARNING').length;
      const healthy = Math.max(0, totalQuotes - (critical + atRisk));
      const percentage = totalQuotes > 0 ? Math.round((healthy / totalQuotes) * 100) : 100;

      res.status(200).json({
        success: true,
        data: {
          healthy,
          atRisk,
          critical,
          total: totalQuotes,
          percentage
        }
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = dashboardController;
