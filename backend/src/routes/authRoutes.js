const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');
const { passwordResetRateLimiter } = require('../middleware/rateLimiter');

// Standard Auth Endpoints
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', verifyToken, authController.logout);
router.post('/refresh-token', authController.refreshToken);
router.get('/profile', verifyToken, authController.getProfile);
router.put('/profile', verifyToken, authController.updateProfile);
router.post('/switch-role', verifyToken, requireRole(['ADMIN']), authController.switchRole);

// Password Reset Endpoints
router.post('/forgot-password', passwordResetRateLimiter({ max: 5, windowMs: 15 * 60 * 1000 }), authController.forgotPassword);
router.get('/verify-reset-token/:token', authController.verifyResetToken);
router.post('/verify-reset-token', authController.verifyResetToken);
router.post('/reset-password', passwordResetRateLimiter({ max: 10, windowMs: 15 * 60 * 1000 }), authController.resetPassword);

module.exports = router;
