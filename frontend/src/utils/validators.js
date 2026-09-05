// TODO: Implement validation utilities for forms and models

export const validateEmail = (email) => {
  // TODO: Email regex validation
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
};

export const validateRequired = (value) => {
  // TODO: Validate required field
  return value !== undefined && value !== null && value.toString().trim() !== '';
};

export const validatePositiveNumber = (value) => {
  // TODO: Validate positive number
  const num = Number(value);
  return !isNaN(num) && num >= 0;
};
