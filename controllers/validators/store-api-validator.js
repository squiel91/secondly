const validator = require('validator')

const stdRes = require('../../utils/standard-response')

exports.cart = (req, res, next) => {
  if(!req.body.productId) return stdRes._400(res, 'productId', 'Please enter productId')

  if(!req.body.quantity) return stdRes._400(res, 'quantity', 'Please enter quantity')

  next()
}

exports.checkout = (req, res, next) => {
    if(!req.body.firstName) return stdRes._400(res, 'firstName', 'Please enter firstName')
    req.body.firstName = req.body.firstName.trim()

    if(!req.body.lastName) return stdRes._400(res, 'lastName', 'Please enter lastName')
    req.body.lastName = req.body.lastName.trim()

    if(!req.body.email) return stdRes._400(res, 'email', 'Please enter email')
    req.body.email = req.body.email.trim().toLowerCase()
    if(!validator.isEmail(req.body.email)) return stdRes._400(res, 'email', 'Enter a valid email')

    if(!req.body.address) return stdRes._400(res, 'address', 'Please enter address')
    req.body.address = req.body.address.trim()

    if(!req.body.state) return stdRes._400(res, 'state', 'Please enter state')
    req.body.state = req.body.state.trim()

    if(!req.body.city) return stdRes._400(res, 'city', 'Please enter city')
    req.body.city = req.body.city.trim()

    if(!req.body.zip) return stdRes._400(res, 'zip', 'Please enter zip')
    req.body.zip = req.body.zip
    if(!validator.isLength(req.body.zip,{min:5, max: 5})) return stdRes._400(res, 'zip', 'Enter a valid zip code')

    req.body.remember = req.body.remember === 'true'
  
    next()
  }

