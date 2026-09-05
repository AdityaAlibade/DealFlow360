// TODO: Deal Health Routes
// GET /, GET /alerts, GET /alerts/:id
// PUT /alerts/:id/resolve, GET /metrics
// GET /quotations/:id/health
// Define deal health endpoints

const express = require('express');
const router = express.Router();
const dealHealthController = require('../controllers/dealHealthController');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, dealHealthController.getDashboard);
router.get('/alerts', verifyToken, dealHealthController.getAllAlerts);
router.get('/alerts/:id', verifyToken, dealHealthController.getAlertById);
router.put('/alerts/:id/resolve', verifyToken, dealHealthController.resolveAlert);
router.get('/metrics', verifyToken, dealHealthController.getHealthMetrics);
router.get('/quotations/:id/health', verifyToken, dealHealthController.getQuoteHealthScore);

module.exports = router;
