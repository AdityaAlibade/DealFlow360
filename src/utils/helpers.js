// TODO: General helper functions
export const calculateTotal = (items = []) => {
  // TODO: Calculate line item totals
  return items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
};

export const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ');
};
