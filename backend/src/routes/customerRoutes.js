const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

// Routes for /api/customers
router.get('/', customerController.getAll);
router.get('/:id', customerController.getById);
router.post('/', customerController.create);
router.put('/:id', customerController.update);

module.exports = router;
