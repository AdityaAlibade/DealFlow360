// TODO: Customer Portal Routes
// GET /quote/:token, POST /quote/:token/negotiate
// PUT /quote/:token/accept, GET /quote/:token/history
// POST /quote/:token/message
// Define customer portal endpoints

const express = require('express');
const router = express.Router();
const customerPortalController = require('../controllers/customerPortalController');

// Note: Customer Portal endpoints use secure token authentication rather than standard JWT
router.get('/quote/:token', customerPortalController.getQuoteByToken);
router.post('/quote/:token/negotiate', customerPortalController.negotiateQuote);
router.put('/quote/:token/accept', customerPortalController.acceptTerms);
router.get('/quote/:token/history', customerPortalController.getNegotiationHistory);
router.post('/quote/:token/message', customerPortalController.sendMessage);

module.exports = router;
