// TODO: Approval Routes
// GET /, GET /pending, GET /:id, PUT /:id
// GET /:id/history, GET /:id/risk
// Define approval endpoints

const express = require('express');
const router = express.Router();
const approvalController = require('../controllers/approvalController');
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

router.get('/', verifyToken, approvalController.getAll);
router.get('/pending', verifyToken, approvalController.getPending);
router.get('/:id', verifyToken, approvalController.getById);
router.put('/:id', verifyToken, requireRole(['SALES_MANAGER', 'FINANCE_APPROVER', 'ADMIN']), approvalController.processApproval);
router.get('/:id/history', verifyToken, approvalController.getApprovalHistory);
router.get('/:id/risk', verifyToken, approvalController.getRiskBreakdown);

module.exports = router;
