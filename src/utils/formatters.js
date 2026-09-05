// TODO: Implement formatting utilities for currency, date, numbers
export const formatCurrency = (amount, currency = 'USD') => {
  // TODO: Format currency values
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount || 0);
};

export const formatDate = (date) => {
  // TODO: Format date strings
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatPercentage = (val) => {
  // TODO: Format percentages
  return `${(val || 0).toFixed(1)}%`;
};
