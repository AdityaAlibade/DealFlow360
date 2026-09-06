// TODO: Product Routes
// GET /, GET /:id, POST /, PUT /:id, DELETE /:id
// GET /categories, POST /:id/variants
// PUT /:id/variants/:variantId, DELETE /:id/variants/:variantId
// GET /:id/stock
// Define product endpoints

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

router.get('/', verifyToken, productController.getAll);
router.get('/categories', verifyToken, productController.getCategories);
router.get('/:id', verifyToken, productController.getById);
router.get('/:id/stock', verifyToken, productController.getProductStock);

// Admin-Only Product Management
router.post('/', verifyToken, requireRole(['ADMIN']), productController.create);
router.put('/:id', verifyToken, requireRole(['ADMIN']), productController.update);
router.delete('/:id', verifyToken, requireRole(['ADMIN']), productController.delete);

router.post('/:id/variants', verifyToken, requireRole(['ADMIN']), productController.addVariant);
router.put('/:id/variants/:variantId', verifyToken, requireRole(['ADMIN']), productController.updateVariant);
router.delete('/:id/variants/:variantId', verifyToken, requireRole(['ADMIN']), productController.deleteVariant);

module.exports = router;
