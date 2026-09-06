const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const subscriptionController = {
  /**
   * GET /api/subscriptions
   */
  getAll: async (req, res, next) => {
    try {
      const { status, customerId } = req.query;
      const where = {};
      if (status) where.status = status;
      if (customerId) where.customerId = customerId;

      const subscriptions = await prisma.subscription.findMany({
        where,
        include: {
          customer: true,
          quotation: true
        },
        orderBy: { createdAt: 'desc' }
      });

      res.status(200).json({ success: true, count: subscriptions.length, data: subscriptions });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/subscriptions/:id
   */
  getById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const subscription = await prisma.subscription.findFirst({
        where: { OR: [{ id }, { contractNumber: id }] },
        include: { customer: true, quotation: true }
      });

      if (!subscription) {
        return res.status(404).json({ success: false, message: 'Subscription not found.' });
      }

      res.status(200).json({ success: true, data: subscription });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/subscriptions/plans
   */
  getPlans: async (req, res, next) => {
    try {
      const plans = await prisma.subscriptionPlan.findMany({
        orderBy: { price: 'asc' }
      });
      res.status(200).json({ success: true, count: plans.length, data: plans });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/subscriptions/plans
   * Create and publish a new subscription plan
   */
  createPlan: async (req, res, next) => {
    try {
      const {
        planName,
        name,
        planCode,
        slug,
        description,
        price,
        billingCycle = 'MONTHLY',
        trialDays = 14,
        maxQuotes = 50,
        userLimit,
        maxUsers = 5,
        features = [],
        status,
        isActive = true
      } = req.body;

      const finalName = (planName || name || '').trim();
      const parsedPrice = parseFloat(price);

      if (!finalName) {
        return res.status(400).json({
          success: false,
          message: 'Plan name is required.'
        });
      }

      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid price greater than 0.'
        });
      }

      // Generate a clean unique slug
      let baseSlug = (slug || planCode || finalName)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      if (!baseSlug) {
        baseSlug = `plan-${Date.now()}`;
      }

      let uniqueSlug = baseSlug;
      let counter = 1;
      while (await prisma.subscriptionPlan.findUnique({ where: { slug: uniqueSlug } })) {
        uniqueSlug = `${baseSlug}-${counter}`;
        counter++;
      }

      const validCycles = ['MONTHLY', 'QUARTERLY', 'ANNUAL'];
      const cycleUpper = (billingCycle || 'MONTHLY').toUpperCase();
      const finalCycle = validCycles.includes(cycleUpper) ? cycleUpper : 'MONTHLY';

      const plan = await prisma.subscriptionPlan.create({
        data: {
          slug: uniqueSlug,
          name: finalName,
          description: description || null,
          price: parsedPrice,
          billingCycle: finalCycle,
          trialDays: parseInt(trialDays, 10) || 0,
          maxQuotes: parseInt(maxQuotes, 10) || 50,
          maxUsers: parseInt(userLimit || maxUsers, 10) || 5,
          features: Array.isArray(features) ? JSON.stringify(features) : (typeof features === 'string' ? features : null),
          isActive: status ? status === 'ACTIVE' : Boolean(isActive)
        }
      });

      try {
        await prisma.auditLog.create({
          data: {
            userId: req.user?.id || null,
            userRole: req.user?.role || 'ADMIN',
            action: 'CREATE_SUBSCRIPTION_PLAN',
            resource: 'SUBSCRIPTION_PLAN',
            resourceId: plan.id,
            newValue: {
              slug: plan.slug,
              name: plan.name,
              price: plan.price,
              billingCycle: plan.billingCycle
            },
            reason: `Published subscription plan "${plan.name}"`
          }
        });
      } catch (auditErr) {
        console.warn('Could not record audit log for subscription plan:', auditErr.message);
      }

      res.status(201).json({
        success: true,
        message: `Subscription Plan "${plan.name}" published successfully!`,
        data: plan
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/subscriptions
   */
  create: async (req, res, next) => {
    try {
      const { customerId, quotationId, planName, billingCycle = 'MONTHLY', recurringAmount, trialDays = 0 } = req.body;

      if (!customerId || !planName || recurringAmount === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Customer ID, Plan Name, and Recurring Amount are required.'
        });
      }

      const count = await prisma.subscription.count();
      const contractNumber = `SUB-2026-${String(1001 + count).padStart(4, '0')}`;
      const startDate = new Date();
      const nextBillingDate = new Date();
      if (billingCycle === 'ANNUAL') {
        nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
      } else if (billingCycle === 'QUARTERLY') {
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 3);
      } else {
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
      }

      const subscription = await prisma.subscription.create({
        data: {
          contractNumber,
          customerId,
          quotationId: quotationId || null,
          planName,
          billingCycle,
          recurringAmount: Number(recurringAmount),
          status: trialDays > 0 ? 'ACTIVE' : 'ACTIVE',
          startDate,
          nextBillingDate,
          autoRenew: true
        },
        include: { customer: true }
      });

      await prisma.auditLog.create({
        data: {
          userId: req.user?.id,
          userRole: req.user?.role || 'SALES_REP',
          action: 'CREATE_SUBSCRIPTION',
          resource: 'SUBSCRIPTION',
          resourceId: subscription.id,
          newValue: { contractNumber, planName, recurringAmount },
          reason: `Created subscription contract ${contractNumber}`
        }
      });

      res.status(201).json({
        success: true,
        message: 'Subscription contract activated successfully.',
        data: subscription
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/subscriptions/:id
   * Upgrade / Downgrade Plan
   */
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { planName, recurringAmount, billingCycle } = req.body;

      const sub = await prisma.subscription.findUnique({ where: { id } });
      if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found.' });

      const updated = await prisma.subscription.update({
        where: { id },
        data: {
          planName: planName || sub.planName,
          recurringAmount: recurringAmount !== undefined ? Number(recurringAmount) : sub.recurringAmount,
          billingCycle: billingCycle || sub.billingCycle
        }
      });

      await prisma.auditLog.create({
        data: {
          userId: req.user?.id,
          userRole: req.user?.role || 'ADMIN',
          action: 'UPDATE_SUBSCRIPTION_PLAN',
          resource: 'SUBSCRIPTION',
          resourceId: id,
          oldValue: { planName: sub.planName, recurringAmount: sub.recurringAmount },
          newValue: { planName: updated.planName, recurringAmount: updated.recurringAmount },
          reason: 'Subscription terms updated'
        }
      });

      res.status(200).json({ success: true, message: 'Subscription plan updated successfully.', data: updated });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/subscriptions/:id/pause
   */
  pause: async (req, res, next) => {
    try {
      const { id } = req.params;
      const updated = await prisma.subscription.update({
        where: { id },
        data: { status: 'PAUSED' }
      });
      res.status(200).json({ success: true, message: 'Subscription contract paused.', data: updated });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/subscriptions/:id/resume
   */
  resume: async (req, res, next) => {
    try {
      const { id } = req.params;
      const updated = await prisma.subscription.update({
        where: { id },
        data: { status: 'ACTIVE' }
      });
      res.status(200).json({ success: true, message: 'Subscription contract resumed.', data: updated });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/subscriptions/:id
   */
  cancel: async (req, res, next) => {
    try {
      const { id } = req.params;
      const updated = await prisma.subscription.update({
        where: { id },
        data: { status: 'CANCELLED', autoRenew: false }
      });

      await prisma.auditLog.create({
        data: {
          userId: req.user?.id,
          userRole: req.user?.role || 'ADMIN',
          action: 'CANCEL_SUBSCRIPTION',
          resource: 'SUBSCRIPTION',
          resourceId: id,
          oldValue: { status: 'ACTIVE' },
          newValue: { status: 'CANCELLED' },
          reason: 'Subscription cancelled by user'
        }
      });

      res.status(200).json({ success: true, message: 'Subscription contract cancelled.', data: updated });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/subscriptions/:id/billing-schedule
   */
  getBillingSchedule: async (req, res, next) => {
    try {
      const { id } = req.params;
      const sub = await prisma.subscription.findUnique({ where: { id } });
      if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found.' });

      // Generate 12 upcoming invoice projection dates
      const schedule = [];
      let currentDate = new Date(sub.nextBillingDate);
      for (let i = 1; i <= 6; i++) {
        schedule.push({
          cycleNumber: i,
          invoiceDate: new Date(currentDate),
          amount: sub.recurringAmount,
          currency: 'INR',
          status: i === 1 ? 'UPCOMING' : 'PROJECTED'
        });
        currentDate.setMonth(currentDate.getMonth() + (sub.billingCycle === 'ANNUAL' ? 12 : sub.billingCycle === 'QUARTERLY' ? 3 : 1));
      }

      res.status(200).json({ success: true, schedule });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/subscriptions/plans/:id
   */
  deletePlan: async (req, res, next) => {
    try {
      const { id } = req.params;
      const plan = await prisma.subscriptionPlan.findFirst({
        where: { OR: [{ id }, { slug: id }] }
      });
      if (!plan) return res.status(404).json({ success: false, message: 'Plan not found.' });

      await prisma.subscriptionPlan.delete({ where: { id: plan.id } });
      res.status(200).json({ success: true, message: 'Plan removed successfully.' });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = subscriptionController;
