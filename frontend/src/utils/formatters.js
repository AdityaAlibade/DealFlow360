// TODO: Implement currency, date, and percentage formatting helpers

export const formatCurrency = (amount, currency = 'USD') => {
  // TODO: Format numeric value as localized currency string
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount || 0);
};

export const formatDate = (dateString) => {
  // TODO: Format ISO string to readable date
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const formatPercent = (value) => {
  // TODO: Format value as percentage
  return (value || 0).toFixed(1) + '%';
};
