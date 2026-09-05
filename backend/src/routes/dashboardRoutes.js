// TODO: Dashboard Routes
// GET /metrics, GET /pipeline, GET /activity, GET /health-summary
// Define dashboard analytics endpoints

const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { verifyToken } = require('../middleware/auth');

router.get('/metrics', verifyToken, dashboardController.getMetrics);
router.get('/pipeline', verifyToken, dashboardController.getPipelineSummary);
router.get('/activity', verifyToken, dashboardController.getRecentActivity);
router.get('/health-summary', verifyToken, dashboardController.getDealHealthSummary);

module.exports = router;
