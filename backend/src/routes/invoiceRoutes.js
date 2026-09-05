// TODO: Invoice Routes
// GET /, GET /:id, POST /, PUT /:id
// POST /:id/pay, GET /:id/payments, POST /:id/send
// Define invoice endpoints

const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, invoiceController.getAll);
router.post('/', verifyToken, invoiceController.generate);
router.get('/:id', verifyToken, invoiceController.getById);
router.put('/:id', verifyToken, invoiceController.update);
router.post('/:id/pay', verifyToken, invoiceController.recordPayment);
router.get('/:id/payments', verifyToken, invoiceController.getPaymentHistory);
router.post('/:id/send', verifyToken, invoiceController.sendInvoice);

module.exports = router;
