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

    if (!req.body.lastName) return stdRes._400(res, 'lastName', 'Please enter last name')
    req.body.lastName = req.body.lastName.trim()

    if (!req.body.email) return stdRes._400(res, 'email', 'Please enter an email')
    req.body.email = req.body.email.trim().toLowerCase()
    if (!validator.isEmail(req.body.email)) return stdRes._400(res, 'email', 'Enter a valid email')

    if (!req.body.address) return stdRes._400(res, 'address', 'Please enter an address')
    req.body.address = req.body.address.trim()

    if (!req.body.state) return stdRes._400(res, 'state', 'Please enter a state')
    req.body.state = req.body.state.trim()

    if (!req.body.city) return stdRes._400(res, 'city', 'Please enter a city')
    req.body.city = req.body.city.trim()

    if (!req.body.zip) return stdRes._400(res, 'zip', 'Please enter a zip code')
    req.body.zip = req.body.zip
    if (!validator.isLength(req.body.zip,{min:5, max: 5})) return stdRes._400(res, 'zip', 'Enter a valid zip code')

    req.body.remember = req.body.remember === 'true'

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
