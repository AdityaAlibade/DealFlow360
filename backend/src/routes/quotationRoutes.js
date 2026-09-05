const express = require('express');
const router = express.Router();
const quotationController = require('../controllers/quotationController');
const { verifyToken } = require('../middleware/auth');

router.get('/customers', verifyToken, quotationController.getCustomers);
router.get('/', verifyToken, quotationController.getAll);
router.post('/', verifyToken, quotationController.create);
router.post('/convert-request/:requestId', verifyToken, quotationController.convertFromRequest);
router.get('/:id', verifyToken, quotationController.getById);
router.put('/:id', verifyToken, quotationController.update);
router.delete('/:id', verifyToken, quotationController.delete);

router.post('/:id/accept-negotiation', verifyToken, quotationController.acceptNegotiation);
router.post('/:id/submit', verifyToken, quotationController.submitForApproval);
router.post('/:id/confirm', verifyToken, quotationController.confirmQuotation);

module.exports = router;
