// TODO: Validators Utils
// validateEmail, validatePhone, validatePassword
// validateDateRange, validateDiscountPercent
// validateProductQuantity, validatePrice
// Input validation functions

const validators = {
  validateEmail: (email) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  },

  validatePhone: (phone) => {
    const re = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    return re.test(phone);
  },

  validateDiscountPercent: (percent) => {
    return typeof percent === 'number' && percent >= 0 && percent <= 100;
  },

  validatePositiveNumber: (num) => {
    return typeof num === 'number' && !isNaN(num) && num >= 0;
  }
};

module.exports = validators;
