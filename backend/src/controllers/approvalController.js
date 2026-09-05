const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const approvalController = {
  /**
   * GET /api/approvals
   */
  getAll: async (req, res, next) => {
    try {
      const approvals = await prisma.approval.findMany({
        include: {
          quotation: {
            include: {
              customer: true,
              salesRep: { select: { id: true, fullName: true, email: true, role: true } },
              items: { include: { product: true } },
              negotiations: { include: { product: true } }
            }
          },
          approver: { select: { id: true, fullName: true, role: true } }
        },
        orderBy: { createdAt: 'desc' }
      });

      res.status(200).json({ success: true, count: approvals.length, data: approvals });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/approvals/pending
   */
  getPending: async (req, res, next) => {
    try {
      const pending = await prisma.approval.findMany({
        where: { status: 'PENDING' },
        include: {
          quotation: {
            include: {
              customer: true,
              salesRep: { select: { id: true, fullName: true, email: true, role: true } },
              items: { include: { product: true } },
              negotiations: { include: { product: true } }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      res.status(200).json({ success: true, count: pending.length, data: pending });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/approvals/:id
   */
  getById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const approval = await prisma.approval.findUnique({
        where: { id },
        include: {
          quotation: {
            include: {
              customer: true,
              salesRep: true,
              items: { include: { product: true } },
              negotiations: { include: { product: true } }
            }
          },
          approver: true
        }
      });

      if (!approval) {
        return res.status(404).json({ success: false, message: 'Approval request not found.' });
      }

      res.status(200).json({ success: true, data: approval });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/approvals/:id
   * Sales Manager Decision (Test 9)
   */
  processApproval: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { decision, comments } = req.body; // 'APPROVED' or 'REJECTED'

      const normalizedDecision = (decision || '').toUpperCase();
      if (!['APPROVED', 'REJECTED', 'RETURNED'].includes(normalizedDecision)) {
        return res.status(400).json({
          success: false,
          message: "Invalid decision. Allowed values are 'APPROVED' or 'REJECTED'."
        });
      }

      const approval = await prisma.approval.findUnique({
        where: { id },
        include: {
          quotation: {
            include: {
              items: { include: { product: true } },
              negotiations: { orderBy: { createdAt: 'desc' } }
            }
          }
        }
      });

      if (!approval) {
        return res.status(404).json({ success: false, message: 'Approval record not found.' });
      }

      const approverId = req.user?.id || 'usr-mgr-02';

      if (normalizedDecision === 'APPROVED') {
        // 1. Update Approval record
        const updatedApproval = await prisma.approval.update({
          where: { id },
          data: {
            status: 'APPROVED',
            approverId,
            comments: comments || 'Approved by Sales Manager',
            approvedAt: new Date()
          }
        });

        // 2. Find any pending negotiations for this quotation and update item prices
        const pendingNegotiation = approval.quotation?.negotiations?.find(
          (n) => n.status === 'APPROVAL_REQUIRED' || n.status === 'PENDING'
        );

        if (pendingNegotiation) {
          await prisma.negotiation.update({
            where: { id: pendingNegotiation.id },
            data: {
              status: 'APPROVED',
              responseMessage: comments || 'Approved by Sales Manager'
            }
          });

          // Update quotation item price
          if (pendingNegotiation.quotationItemId) {
            await prisma.quotationItem.update({
              where: { id: pendingNegotiation.quotationItemId },
              data: {
                unitPrice: pendingNegotiation.requestedPrice,
                netPrice: pendingNegotiation.requestedPrice
              }
            });
          }
        }

        // 3. Recompute quotation totals
        const updatedItems = await prisma.quotationItem.findMany({
          where: { quotationId: approval.quotationId },
          include: { product: true }
        });

        let subtotal = 0;
        let totalCost = 0;
        for (const item of updatedItems) {
          subtotal += item.quantity * item.netPrice;
          totalCost += item.quantity * (item.product?.standardCost || item.netPrice * 0.7);
        }
        const taxAmount = subtotal * 0.18;
        const totalAmount = subtotal + taxAmount;
        const blendedMargin = subtotal > 0 ? ((subtotal - totalCost) / subtotal) * 100 : 0;

        await prisma.quotation.update({
          where: { id: approval.quotationId },
          data: {
            status: 'APPROVED',
            subtotal,
            taxAmount,
            totalAmount,
            blendedMargin: Number(blendedMargin.toFixed(2))
          }
        });

        // 4. Audit Log (Test 10)
        await prisma.auditLog.create({
          data: {
            userId: approverId,
            userRole: req.user?.role || 'SALES_MANAGER',
            action: 'APPROVE_QUOTATION_DISCOUNT',
            resource: 'APPROVAL',
            resourceId: id,
            oldValue: { status: 'PENDING' },
            newValue: { status: 'APPROVED', quotationTotal: totalAmount },
            reason: comments || 'Managerial approval granted for pricing concession'
          }
        });

        return res.status(200).json({
          success: true,
          message: 'Approval granted successfully. Quotation pricing updated.',
          data: updatedApproval
        });
      } else {
        // REJECTED Flow
        const updatedApproval = await prisma.approval.update({
          where: { id },
          data: {
            status: 'REJECTED',
            approverId,
            comments: comments || 'Concession rejected by Sales Manager'
          }
        });

        // Update pending negotiation to REJECTED
        const pendingNegotiation = approval.quotation?.negotiations?.find(
          (n) => n.status === 'APPROVAL_REQUIRED' || n.status === 'PENDING'
        );

        if (pendingNegotiation) {
          await prisma.negotiation.update({
            where: { id: pendingNegotiation.id },
            data: {
              status: 'REJECTED',
              responseMessage: comments || 'Counter-proposal rejected by Sales Management'
            }
          });
        }

        // Keep quotation status as DRAFT or REJECTED
        await prisma.quotation.update({
          where: { id: approval.quotationId },
          data: { status: 'DRAFT' }
        });

        // Audit Log (Test 10)
        await prisma.auditLog.create({
          data: {
            userId: approverId,
            userRole: req.user?.role || 'SALES_MANAGER',
            action: 'REJECT_QUOTATION_DISCOUNT',
            resource: 'APPROVAL',
            resourceId: id,
            oldValue: { status: 'PENDING' },
            newValue: { status: 'REJECTED' },
            reason: comments || 'Managerial concession rejected'
          }
        });

        return res.status(200).json({
          success: true,
          message: 'Discount concession rejected. Quotation price remains at original value.',
          data: updatedApproval
        });
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/approvals/:id/history
   */
  getApprovalHistory: async (req, res, next) => {
    try {
      const logs = await prisma.auditLog.findMany({
        where: { resource: 'APPROVAL' },
        orderBy: { timestamp: 'desc' }
      });
      res.status(200).json({ success: true, count: logs.length, data: logs });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/approvals/:id/risk
   */
  getRiskBreakdown: async (req, res, next) => {
    try {
      const { id } = req.params;
      const approval = await prisma.approval.findUnique({
        where: { id },
        include: { quotation: { include: { items: { include: { product: true } } } } }
      });

      res.status(200).json({
        success: true,
        data: {
          riskLevel: approval?.riskLevel || 'LOW',
          quotationRisk: approval?.quotation?.blendedRiskScore || 0,
          reason: approval?.reason
        }
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = approvalController;
