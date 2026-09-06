const express = require('express');
const router = express.Router();
const warehouseController = require('../controllers/warehouseController');

// Routes for /api/warehouses
router.get('/', warehouseController.getAll);
router.get('/:id', warehouseController.getById);
router.post('/', warehouseController.create);
router.put('/:id', warehouseController.update);
router.post('/:id/stock', warehouseController.updateStock);

module.exports = router;
