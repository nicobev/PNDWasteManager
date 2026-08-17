// Helper function to validate quantities
function validateQuantity(quantity) {
  if (typeof quantity !== 'number' || isNaN(quantity) || quantity <= 0) {
    return { valid: false, error: 'Quantity must be a positive number' };
  }
  return { valid: true };
}

module.exports = {
  validateQuantity
};