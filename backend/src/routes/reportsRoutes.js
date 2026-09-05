// TODO: Reports Routes
// GET /, GET /revenue, GET /discounts
// GET /approvals, GET /performance, GET /export/:type
// Define reports endpoints

const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, reportsController.getReports);
router.get('/revenue', verifyToken, reportsController.getRevenueReport);
router.get('/discounts', verifyToken, reportsController.getDiscountAnalysis);
router.get('/approvals', verifyToken, reportsController.getApprovalReport);
router.get('/performance', verifyToken, reportsController.getPerformanceReport);
router.get('/export/:type', verifyToken, reportsController.exportReport);

module.exports = router;
