const express = require('express');
const router = express.Router();
const backorderController = require('../controllers/backorderController');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, backorderController.getAll);
router.get('/:id', verifyToken, backorderController.getById);
router.post('/:id/fulfill', verifyToken, backorderController.fulfill);
router.post('/:id/cancel', verifyToken, backorderController.cancel);

module.exports = router;
