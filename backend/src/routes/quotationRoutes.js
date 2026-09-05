// TODO: Quotation Routes
// POST /, GET /, GET /:id, PUT /:id, DELETE /:id
// POST /:id/items, PUT /:id/items/:itemId, DELETE /:id/items/:itemId
// POST /:id/submit, POST /:id/confirm, GET /:id/items
// Define quotation endpoints

const express = require('express');
const router = express.Router();
const quotationController = require('../controllers/quotationController');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, quotationController.getAll);
router.post('/', verifyToken, quotationController.create);
router.get('/:id', verifyToken, quotationController.getById);
router.put('/:id', verifyToken, quotationController.update);
router.delete('/:id', verifyToken, quotationController.delete);

router.post('/:id/items', verifyToken, quotationController.addItem);
router.put('/:id/items/:itemId', verifyToken, quotationController.updateItem);
router.delete('/:id/items/:itemId', verifyToken, quotationController.removeItem);

router.post('/:id/submit', verifyToken, quotationController.submitForApproval);
router.post('/:id/confirm', verifyToken, quotationController.confirmQuotation);

module.exports = router;
