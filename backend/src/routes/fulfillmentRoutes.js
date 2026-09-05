const express = require('express');
const router = express.Router();
const fulfillmentController = require('../controllers/fulfillmentController');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, fulfillmentController.getAll);
router.get('/pending', verifyToken, fulfillmentController.getPending);
router.get('/warehouses', verifyToken, fulfillmentController.getWarehouses);
router.get('/warehouses/:id/stock', verifyToken, fulfillmentController.getWarehouseStock);
router.get('/warehouses/:warehouseId/inventory', verifyToken, fulfillmentController.getWarehouseStock);
router.post('/warehouses/:warehouseId/restock', verifyToken, fulfillmentController.restockWarehouse);

router.get('/:id', verifyToken, fulfillmentController.getById);
router.get('/:id/stock-check', verifyToken, fulfillmentController.checkStock);
router.post('/:id/dispatch', verifyToken, fulfillmentController.dispatch);
router.post('/:id/deliver', verifyToken, fulfillmentController.deliver);
router.post('/:id/split', verifyToken, fulfillmentController.createSplit);
router.put('/:id/accept', verifyToken, fulfillmentController.acceptSplit);
router.put('/:id/override', verifyToken, fulfillmentController.manualOverride);

module.exports = router;
