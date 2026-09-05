// TODO: Implement validation helpers for forms and inputs
export const isValidEmail = (email) => {
  // TODO: Email regex validator
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isRequired = (value) => {
  // TODO: Required field validator
  return value !== undefined && value !== null && String(value).trim().length > 0;
};
