// TODO: Fulfillment Routes
// GET /, GET /pending, GET /:id
// GET /warehouses, GET /warehouses/:id/stock
// POST /:id/split, PUT /:id/accept, PUT /:id/override
// GET /:id/stock-check
// Define fulfillment endpoints

const express = require('express');
const router = express.Router();
const fulfillmentController = require('../controllers/fulfillmentController');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, fulfillmentController.getAll);
router.get('/pending', verifyToken, fulfillmentController.getPending);
router.get('/warehouses', verifyToken, fulfillmentController.getWarehouses);
router.get('/warehouses/:id/stock', verifyToken, fulfillmentController.getWarehouseStock);
router.get('/:id', verifyToken, fulfillmentController.getById);
router.get('/:id/stock-check', verifyToken, fulfillmentController.checkStock);
router.post('/:id/split', verifyToken, fulfillmentController.createSplit);
router.put('/:id/accept', verifyToken, fulfillmentController.acceptSplit);
router.put('/:id/override', verifyToken, fulfillmentController.manualOverride);

module.exports = router;
