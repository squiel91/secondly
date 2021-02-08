const validator = require('validator')

const Category = require('../../models/Category')
const Page = require('../../models/Page')

const stdRes = require('../../utils/standard-response')

exports.postPage = async (req, res, next) => {
  try {
    if (!req.body.title) return stdRes._400(res, 'title', 'Please enter title')
    req.body.title = req.body.title.trim()

    if (!req.body.handle) return stdRes._400(res, 'handle', 'Please enter handle')
    req.body.handle = req.body.handle.trim().toLowerCase()
    if (!/^[a-z0-9]+[a-z0-9-]+[a-z0-9]+$/i.test(req.body.handle)) return stdRes._400(res, 'handle', 'Please enter valid handle')

    const possibleHandleDuplicate = await Page.findOne({ handle: req.body.handle })
    if (possibleHandleDuplicate) return stdRes._400(res, 'handle', 'There is a page with the same handle. Choose another one')

    next()
  } catch (error) { stdRes._500(res, error.message) }
}

exports.postCategory = async (req, res, next) => {
  try {
    if (!req.body.title) return stdRes._400(res, 'title', 'Please enter title')
    req.body.title = req.body.title.trim()

    if (!req.body.handle) return stdRes._400(res, 'handle', 'Please enter handle')
    req.body.handle = req.body.handle.trim().toLowerCase()

    if (!/^[a-z0-9-]+$/i.test(req.body.handle)) return stdRes._400(res, 'handle', 'Please enter valid handle')

    const possibleHandleDuplicate = await Category.findOne({ handle: req.body.handle })
    if (possibleHandleDuplicate) return stdRes._400(res, 'handle', 'It is duplicated. Choose another one')


    next()
  } catch (error) { stdRes._500(res, error.message) }
}

exports.postProduct = async (req, res, next) => {
  try {
    if (!req.body.title) return stdRes._400(res, 'title', 'Please enter a title')
    req.body.title = req.body.title.trim()

    if (!req.body.handle) return stdRes._400(res, 'handle', 'Please enter handle')
    req.body.handle = req.body.handle.trim().toLowerCase()

    if (!/^[a-z0-9-]+$/i.test(req.body.handle)) return stdRes._400(res, 'handle', 'Please enter valid handle')

    const possibleHandleDuplicate = await Page.findOne({ handle: req.body.handle })
    if (possibleHandleDuplicate) return stdRes._400(res, 'handle', 'There is a page with the same handle. Choose another one')

    if (!req.body.price) return stdRes._400(res, 'price', 'Please enter a price')

    if (req.body.compareAt && req.body.compareAt < req.body.price) return stdRes._400(res, 'compareAt', 'It must be higher than the price')

    if (!req.body.shippingCost) return stdRes._400(res, 'shippingCost', 'Enter a shippingCost or 0 if free')

    if (req.body.shippingCost < 0) return stdRes._400(res, 'shippingCost', 'The cost of shipping has to be equal or greater than 0')

    if (req.body.stock) {
      req.body.stock = parseInt(req.body.stock)
      if (req.body.stock < 0) return stdRes._400(res, 'stock', 'If not empty, the stock must be equal greater than than 0')
    }

    if (!req.body.description) req.body.description = req.body.description.trim().toLowerCase()

    next()
  } catch (error) { stdRes._500(res, error.message) }
}

exports.postUser = (req, res, next) => {
  try {
    if (!req.body.firstName) return stdRes._400(res, 'firstName', 'Enter your first name')
    req.body.firstName = req.body.firstName.trim()

    if (!req.body.email) return stdRes._400(res, 'email', 'Enter your email')
    req.body.email = req.body.email.trim().toLowerCase()
    if (!validator.isEmail(req.body.email)) return stdRes._400('email', 'Enter a valid email')

    const password = req.body.password
    if (!password) return stdRes._400(res, 'password', 'Please enter a password')
    if (password.length < 6) return stdRes._400(res, 'password', 'The password needs to have 6 or more characters')

    next()
  } catch (error) { stdRes._500(res, error.message) }
}
