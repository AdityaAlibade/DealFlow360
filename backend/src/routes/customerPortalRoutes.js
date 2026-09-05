const express = require('express');
const router = express.Router();
const customerPortalController = require('../controllers/customerPortalController');

// Customer Requests ("My Requests" - Tests 2 & 6)
router.post('/requests', customerPortalController.createRequest);
router.get('/requests', customerPortalController.getRequests);

// Customer Quotations & Negotiations (Tests 4, 5, 7, 8, 11)
router.get('/quote/:token', customerPortalController.getQuoteByToken);
router.post('/quote/:token/negotiate', customerPortalController.negotiateQuote);
router.put('/quote/:token/accept', customerPortalController.acceptTerms);
router.post('/quote/:token/confirm', customerPortalController.acceptTerms);
router.get('/quote/:token/history', customerPortalController.getNegotiationHistory);
router.post('/quote/:token/message', customerPortalController.sendMessage);

module.exports = router;
