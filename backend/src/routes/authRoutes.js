// TODO: Auth Routes
// POST /register, POST /login, POST /logout
// POST /refresh-token, GET /profile, PUT /profile
// Define authentication endpoints

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', verifyToken, authController.logout);
router.post('/refresh-token', authController.refreshToken);
router.get('/profile', verifyToken, authController.getProfile);
router.put('/profile', verifyToken, authController.updateProfile);
router.post('/switch-role', verifyToken, requireRole(['ADMIN']), authController.switchRole);

module.exports = router;

