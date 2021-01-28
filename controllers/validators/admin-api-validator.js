const validator = require('validator')

const stdRes = require('../../utils/standard-response')

exports.postPage = (req, res, next) => {
  
    if(!req.body.title) return stdRes._400(res, 'title', 'Please enter title')
    req.body.title = req.body.title.trim()
  
    if(!req.body.handle) return stdRes._400(res, 'handle', 'Please enter handle')
    req.body.handle = req.body.handle.trim().toLowerCase()
    if(!/^[a-z0-9]+[a-z0-9-]+[a-z0-9]+$/i.test(req.body.handle)) return stdRes._400(res, 'handle', 'Please enter valid handle')
  
    next()
}

exports.postCategory = (req, res, next) => {
  
  if(!req.body.title) return stdRes._400(res, 'title', 'Please enter title')
  req.body.title = req.body.title.trim()

  if(!req.body.handle) return stdRes._400(res, 'handle', 'Please enter handle')
  req.body.handle = req.body.handle.trim().toLowerCase()
  if(!/^[a-z0-9]+[a-z0-9-]+[a-z0-9]+$/i.test(req.body.handle)) return stdRes._400(res, 'handle', 'Please enter valid handle')

  next()
}

exports.postProduct = (req, res, next) => {
  
  if(!req.body.title) return stdRes._400(res, 'title', 'Please enter title')
  req.body.title = req.body.title.trim()

  if(!req.body.price) return stdRes._400(res, 'price', 'Please enter price')

  if(req.body.compareAt && req.body.compareAt < req.body.price) return stdRes._400(res, 'compareAt', 'The value must be higher than the price')

  if(!req.body.shippingCost) return stdRes._400(res, 'shippingCost', 'Please enter shippingCost')

  if(req.body.shippingCost < 0) return stdRes._400(res, 'shippingCost', 'The value of shippingCost must be greater than or equal to 0')
  
  if(req.body.stock < 0) return stdRes._400(res, 'stock', 'The value of stock must be greater than or equal to 0')

  if(!req.body.description) req.body.description = req.body.description.trim().toLowerCase()
  if(!/^[a-z0-9]+[a-z0-9-]+[a-z0-9]+$/i.test(req.body.description)) return stdRes._400(res, 'description', 'Please enter valid description')

  next()
}

exports.postUser = (req, res, next) => {

    if(!req.body.firstName) return stdRes._400(res, 'firstName', 'Please enter firstName')
    req.body.firstName = req.body.firstName.trim()

    if(!req.body.email) return stdRes._400(res, 'email', 'Please enter email')
    req.body.email = req.body.email.trim().toLowerCase()
    if(!validator.isEmail(req.body.email)) return stdRes._400('email', 'Enter a valid email')

    const password = req.body.password 
    if(!password) return stdRes._400(res, 'password', 'Please enter a password')
    if(password.length < 6) return stdRes._400(res, 'password', 'The password needs to have 6 or more characters')

    next()
}