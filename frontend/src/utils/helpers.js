// TODO: Implement calculation, discount, and margin helper functions

export const calculateDiscount = (price, discountPercent) => {
  // TODO: Calculate discounted amount
  return price - (price * (discountPercent || 0)) / 100;
};

export const calculateMargin = (price, cost) => {
  // TODO: Calculate profit margin percentage
  if (!price || price === 0) return 0;
  return ((price - cost) / price) * 100;
};

export const truncateText = (text, maxLength = 50) => {
  // TODO: Truncate long strings with ellipsis
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};
