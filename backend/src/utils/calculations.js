// TODO: Calculations Utils
// calculateSubtotal, calculateTotal, calculateTax
// calculateDiscount, calculateMargin, calculateProration
// Format currency, calculateShippingCost
// Reusable calculation functions

const calculations = {
  calculateSubtotal: (items = []) => {
    return items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  },

  calculateDiscount: (subtotal, discountPercent = 0) => {
    return (subtotal * discountPercent) / 100;
  },

  calculateTax: (netAmount, taxPercent = 18.0) => {
    return (netAmount * taxPercent) / 100;
  },

  calculateTotal: (subtotal, discountAmount, taxAmount) => {
    return subtotal - discountAmount + taxAmount;
  },

  calculateMargin: (sellingPrice, cost) => {
    if (!sellingPrice || sellingPrice <= 0) return 0;
    return ((sellingPrice - cost) / sellingPrice) * 100;
  },

  calculateProration: (monthlyRate, daysRemaining, totalDays = 30) => {
    return (monthlyRate / totalDays) * daysRemaining;
  },

  formatCurrency: (amount, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(amount || 0);
  }
};

module.exports = calculations;
