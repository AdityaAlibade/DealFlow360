const express = require('express');
const router = express.Router();
const orderRequestController = require('../controllers/orderRequestController');
const quotationController = require('../controllers/quotationController');
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

// Allowed roles for Order Requests management
const STAFF_ROLES = ['ADMIN', 'SALES_MANAGER', 'SALES_REP', 'FINANCE_OPS'];

router.get('/stats', verifyToken, requireRole(STAFF_ROLES), orderRequestController.getStats);
router.get('/', verifyToken, orderRequestController.getAll);
router.get('/:id', verifyToken, orderRequestController.getById);
router.put('/:id', verifyToken, requireRole(STAFF_ROLES), orderRequestController.update);

// Direct quotation creation from Order Request (Test requirement)
router.post('/:requestId/convert', verifyToken, requireRole(['ADMIN', 'SALES_MANAGER', 'SALES_REP']), quotationController.convertFromRequest);
router.post('/from-order-request/:requestId', verifyToken, requireRole(['ADMIN', 'SALES_MANAGER', 'SALES_REP']), quotationController.convertFromRequest);

module.exports = router;
