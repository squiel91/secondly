/* eslint-disable prefer-regex-literals */
const validator = require('validator')

const Product = require('../../models/Product')

const stdRes = require('../../utils/standard-response')

exports.postCart = async (req, res, next) => {
  try {
    if (!req.body.productId) return stdRes._400(res, 'productId', 'Product Id not valid')

    const productFound = await Product.findOne({ _id: req.body.productId, publish: true })
    if (!productFound) return stdRes._400(res, 'productId', 'Product not found.')

    if (!req.body.quantity) return stdRes._400(res, 'quantity', 'Please enter quantity')
    req.body.quantity = parseInt(req.body.quantity)

    next()
  } catch (error) { stdRes._500(res, error.message) }
}

exports.postCheckout = (req, res, next) => {
  try {
    if (!req.body.firstName) return stdRes._400(res, 'firstName', 'Please enter your first name')
    req.body.firstName = req.body.firstName.trim()

    if (!req.body.lastName) return stdRes._400(res, 'lastName', 'Please enter your last name')
    req.body.lastName = req.body.lastName.trim()

    if (!req.body.email) return stdRes._400(res, 'email', 'Please enter an email')
    req.body.email = req.body.email.trim().toLowerCase()
    if (!validator.isEmail(req.body.email)) return stdRes._400(res, 'email', 'Enter a valid email')

    // if (!req.body.phone) return stdRes._400(res, 'phone', 'Please enter your phone number')
    // req.body.phone = req.body.phone.trim()

    if (!req.body.address) return stdRes._400(res, 'address', 'Please enter your address')
    req.body.address = req.body.address.trim()

    // if (!req.body.line1) return stdRes._400(res, 'line1', 'Please enter your address')
    // req.body.line1 = req.body.line1.trim()

    if (!req.body.country) return stdRes._400(res, 'country', 'Please enter an country')
    req.body.country = req.body.country.trim()

    if (!req.body.state) return stdRes._400(res, 'state', 'Please enter a state')
    req.body.state = req.body.state.trim()

    if (!req.body.city) return stdRes._400(res, 'city', 'Please enter a city')
    req.body.city = req.body.city.trim()

    if (!req.body.zip) return stdRes._400(res, 'zip', 'Please enter a zip code')
    if (req.body.zip.length !== 5) return stdRes._400(res, 'zip', 'Enter a valid zip code')

    req.body.remember = req.body.remember === 'true'
    if (!req.body.cardNumber) return stdRes._400(res, 'cardNumber', 'Please enter a card Number')
    if (req.body.cardNumber.length < 14 || req.body.cardNumber.length > 16) return stdRes._400(res, 'cardNumber', 'Enter a valid Card Number')

    // eslint-disable-next-line prefer-regex-literals
    if (!req.body.cardExpiration) return stdRes._400(res, 'cardExpiration', 'Please enter the card expiration date')
    const valid = new RegExp(/^(0?[1-9]|1[012])\/\d\d$/).test(req.body.cardExpiration)
    // eslint-disable-next-line eqeqeq
    if (valid != true) return stdRes._400(res, 'cardExpiration', 'Enter a valid cardExpiration code')

    if (!req.body.cvc) return stdRes._400(res, 'cvc', 'Please enter a cvc code')
    if (req.body.cvc.length !== 3) return stdRes._400(res, 'cvc', 'Enter a valid cvc code')

    next()
  } catch (error) { stdRes._500(res, error.message) }
}

exports.postSubscribe = (req, res, next) => {
  try {
    if (!req.body.email) return stdRes._400(res, 'email', 'Please enter an email')
    req.body.email = req.body.email.trim().toLowerCase()
    if (!validator.isEmail(req.body.email)) return stdRes._400(res, 'email', 'Enter a valid email')

    next()
  } catch (error) { stdRes._500(res, error.message) }
}
