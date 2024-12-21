const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

exports.validateRegistration = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters'),
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Must be a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/\d/)
    .withMessage('Password must contain a number'),
  handleValidationErrors
];

exports.validateProduct = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required'),
  body('purchasePrice')
    .isNumeric()
    .withMessage('Purchase price must be a number'),
  body('sellingPrice')
    .isNumeric()
    .withMessage('Selling price must be a number'),
  body('dimensions')
    .custom((value) => {
      try {
        const dims = JSON.parse(value);
        return Array.isArray(dims) && dims.length === 3;
      } catch {
        return false;
      }
    })
    .withMessage('Dimensions must be an array of three numbers'),
  handleValidationErrors
];
