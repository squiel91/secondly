const { body } = require('express-validator')
const User = require('../models/User')


exports.postLogin = [
  body('loginEmail')
    .isEmail()
    .withMessage('Looks like an invalid email'),
  body('loginPass')
    .isLength({ min: 8 })
    .withMessage('Needs to have at least 8 characters'),
]

exports.postRegister = [
  body('registerEmail')
    .isEmail()
    .withMessage('Looks like an invalid email')
    .custom((value, { req }) => {
      return User.findOne({ email: value }).then(user => {
        if (user) {
          return Promise.reject('Email already exists');
        }
      })
    }),
  body('registerFirstName')
    .notEmpty()
    .withMessage('Can not be empty'),
  body('registerLastName')
    .notEmpty()
    .withMessage('Can not be empty'),
  body('registerPass')
    .isLength({ min: 8 })
    .withMessage('Needs to have at least 8 characters')
  ]