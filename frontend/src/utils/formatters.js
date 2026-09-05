// TODO: Implement currency, date, and percentage formatting helpers

export const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0
  }).format(amount || 0);
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
