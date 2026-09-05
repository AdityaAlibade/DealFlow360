// TODO: Authentication Controller
// register, login, logout, refreshToken, getProfile, updateProfile
// Handle user authentication and session management

const authController = {
  register: async (req, res, next) => {
    // TODO: Validate user registration data, hash password, create user in DB, return JWT
    try {
      res.status(201).json({ success: true, message: 'User registered successfully (Stub)' });
    } catch (error) {
      next(error);
    }
  },

  login: async (req, res, next) => {
    // TODO: Verify credentials, generate access and refresh tokens
    try {
      res.status(200).json({ success: true, message: 'Login successful (Stub)', token: 'sample-jwt-token' });
    } catch (error) {
      next(error);
    }
  },

  logout: async (req, res, next) => {
    // TODO: Invalidate session / refresh token
    try {
      res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  },

  refreshToken: async (req, res, next) => {
    // TODO: Validate refresh token and issue new access token
    try {
      res.status(200).json({ success: true, token: 'new-sample-jwt-token' });
    } catch (error) {
      next(error);
    }
  },

  getProfile: async (req, res, next) => {
    try {
      const userProfile = {
        id: req.user?.id || 'usr-cuid-9021',
        fullName: req.user?.fullName || 'John Doe',
        email: req.user?.email || 'demo@dealflow.com',
        role: req.user?.role || 'SALES_REP',
        phone: '+1 (555) 382-9104',
        department: 'Enterprise Revenue & CPQ',
        territory: 'North America - Tech & Financial',
        title: 'Senior Enterprise Sales Representative',
        bio: 'Strategic CPQ Deal Specialist driving enterprise deal governance, margin protection, and multi-tier subscription packaging.',
        status: 'ACTIVE',
        createdAt: '2024-01-15T08:30:00.000Z',
        updatedAt: new Date().toISOString(),
        stats: {
          totalQuotations: 42,
          pendingApprovals: 8,
          approvedDeals: 31,
          closedRevenue: '₹28,50,000',
          targetQuota: '₹40,00,000',
          winRate: 78.5,
          avgDealMargin: 24.2,
          governanceScore: '94/100'
        },
        governanceLimits: {
          maxSelfDiscount: '15%',
          requiresManagerDiscount: '> 15%',
          requiresFinanceDiscount: '> 25%',
          canApproveTier: 'BRONZE, SILVER',
          assignedWarehouses: ['Main Hub (BOM-1)', 'East Depot (CCU-1)']
        }
      };

      res.status(200).json({ success: true, user: userProfile });
    } catch (error) {
      next(error);
    }
  },

  updateProfile: async (req, res, next) => {
    try {
      const updatedUser = {
        id: req.user?.id || 'usr-cuid-9021',
        fullName: req.body.fullName || 'John Doe',
        email: req.user?.email || 'demo@dealflow.com',
        role: req.user?.role || 'SALES_REP',
        phone: req.body.phone || '+1 (555) 382-9104',
        department: req.body.department || 'Enterprise Revenue & CPQ',
        territory: req.body.territory || 'North America - Tech & Financial',
        title: req.body.title || 'Senior Enterprise Sales Representative',
        bio: req.body.bio || '',
        updatedAt: new Date().toISOString()
      };
      res.status(200).json({ success: true, message: 'Profile updated successfully', user: updatedUser });
    } catch (error) {
      next(error);
    }
  },

  switchRole: async (req, res, next) => {
    try {
      // Require caller to be ADMIN
      const callerRole = (req.user?.role || '').toUpperCase();
      if (callerRole !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Forbidden. Only administrators can perform role switching.'
        });
      }

      const { targetRole } = req.body;
      const normalizedTarget = (targetRole || '').toLowerCase();

      // Explicitly reject Customer Portal switching
      if (normalizedTarget === 'customer') {
        return res.status(403).json({
          success: false,
          message: 'Customer Portal access cannot be assumed via role switching. Customers must authenticate separately.'
        });
      }

      const allowedRoles = ['admin', 'sales_rep', 'sales_manager', 'finance_ops'];
      if (!allowedRoles.includes(normalizedTarget)) {
        return res.status(400).json({
          success: false,
          message: `Invalid role requested. Allowed roles: ${allowedRoles.join(', ')}`
        });
      }

      return res.status(200).json({
        success: true,
        message: `Active persona switched to ${normalizedTarget}`,
        role: normalizedTarget
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = authController;

