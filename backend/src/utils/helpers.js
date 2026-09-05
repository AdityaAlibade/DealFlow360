// TODO: Helpers Utils
// generateQuoteNumber, generateInvoiceNumber
// formatDate, generateToken, hashPassword
// comparePassword, sanitizeData
// Common helper functions

const crypto = require('crypto');
const bcrypt = require('bcrypt');

const helpers = {
  generateQuoteNumber: (sequence) => {
    return `Q-${sequence || Math.floor(1000 + Math.random() * 9000)}`;
  },

  generateInvoiceNumber: (sequence) => {
    return `INV-${sequence || Math.floor(1000 + Math.random() * 9000)}`;
  },

  generateSecureToken: (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
  },

  hashPassword: async (plainPassword) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(plainPassword, salt);
  },

  comparePassword: async (plainPassword, hashedPassword) => {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
};

module.exports = helpers;
