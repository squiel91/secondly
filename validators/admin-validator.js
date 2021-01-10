const { body } = require('express-validator')

exports.postProduct = [
  body('title')
    .notEmpty()
    .withMessage('The product must have a title')
]