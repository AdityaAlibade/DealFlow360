const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, orderController.getAll);
router.post('/', verifyToken, orderController.create);
router.get('/:id', verifyToken, orderController.getById);
router.get('/:id/summary', verifyToken, orderController.getSummary);
router.post('/:id/allocate', verifyToken, orderController.allocate);
router.get('/:id/fulfillments', verifyToken, orderController.getFulfillments);
router.get('/:id/backorders', verifyToken, orderController.getBackorders);

module.exports = router;
