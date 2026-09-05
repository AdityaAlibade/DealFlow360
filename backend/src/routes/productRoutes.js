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

router.get('/', verifyToken, productController.getAll);
router.post('/', verifyToken, productController.create);
router.get('/categories', verifyToken, productController.getCategories);
router.get('/:id', verifyToken, productController.getById);
router.put('/:id', verifyToken, productController.update);
router.delete('/:id', verifyToken, productController.delete);

router.get('/:id/stock', verifyToken, productController.getProductStock);
router.post('/:id/variants', verifyToken, productController.addVariant);
router.put('/:id/variants/:variantId', verifyToken, productController.updateVariant);
router.delete('/:id/variants/:variantId', verifyToken, productController.deleteVariant);

module.exports = router;
