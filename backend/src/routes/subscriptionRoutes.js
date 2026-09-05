// TODO: Subscription Routes
// GET /, GET /:id, POST /, PUT /:id, DELETE /:id
// GET /:id/billing-schedule, POST /:id/pause, POST /:id/resume
// GET /plans
// Define subscription endpoints

const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, subscriptionController.getAll);
router.post('/', verifyToken, subscriptionController.create);
router.get('/plans', verifyToken, subscriptionController.getPlans);
router.get('/:id', verifyToken, subscriptionController.getById);
router.put('/:id', verifyToken, subscriptionController.update);
router.delete('/:id', verifyToken, subscriptionController.cancel);
router.post('/:id/pause', verifyToken, subscriptionController.pause);
router.post('/:id/resume', verifyToken, subscriptionController.resume);
router.get('/:id/billing-schedule', verifyToken, subscriptionController.getBillingSchedule);

module.exports = router;
