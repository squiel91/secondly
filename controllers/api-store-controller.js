/* eslint-disable no-unused-vars */
// eslint-disable-next-line camelcase
const Publishable_Key = 'pk_test_51Hsv6KLzpNoJw5cRqsZQiQh1hqWafCluHiYVFIt68Y4RjWYsEFX4HGPaquJ3lcxNjOh393Ms39m0V4akBZ46727J00EzprcXql'
// eslint-disable-next-line camelcase
const Secret_Key = 'sk_test_51Hsv6KLzpNoJw5cRhFtvtSixJDOpLwLY0ZzDR6dM0nYcJUv4XV8zV4HUCpRVw0j0vjrhwotun4vAvmrESk4Chgzg00QakDHuoW'
const stripe = require('stripe')(Secret_Key)
// models
const Cart = require('../models/Cart')
const User = require('../models/User')
const Category = require('../models/Category')
const Product = require('../models/Product')
const Page = require('../models/Page')
const Subscription = require('../models/Subscription')
const Order = require('../models/Order')

// templates
const cartTemplate = require('../models/templates/cart')
const productTemplate = require('../models/templates/product')
const categoryTemplate = require('../models/templates/category')
const pageTemplate = require('../models/templates/page')

const mailer = require('../utils/mailer')
const stdRes = require('../utils/standard-response')
const env = require('../utils/env')

exports.customerSetup = async (req, res, next) => {
  // is required to load the user into the request before initalizing the cart
  if (req.session.userId) req.user = await User.findById(req.session.userId)

  req.cart = new Cart(req)
  next()
}

// get products
exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ publish: true })

    res.json({
      success: true,
      product: products?.map(product => productTemplate(product))
    })
  } catch (error) { stdRes._500(res, error.message) }
}

// get product
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      _id: req.params.productId,
      publish: 'true'
    })

    if (product) return stdRes._400(res, 'Product not found')

    res.json({
      success: true,
      product: productTemplate(product)
    })
  } catch (error) { stdRes._500(res, error.message) }
}

// get categories (not populated with it's products)
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find()

    res.json({
      success: true,
      category: categories?.map(category => categoryTemplate(category))
    })
  } catch (error) { stdRes._500(res, error.message) }
}

// get category (populated with it's products)
exports.getCategory = async (req, res, next) => {
  try {
    const category = await Category.findOne({
      handle: req.params.categoryHandle
    }).populate('products')

    if (category) return stdRes._400(res, 'Category not found')

    res.json({
      success: true,
      category: categoryTemplate(category)
    })
  } catch (error) { stdRes._500(res, error.message) }
}

// get pages
exports.getPages = async (req, res, next) => {
  try {
    const pages = await Page.find()

    res.json({
      success: true,
      page: pages?.map(page => pageTemplate(page))
    })
  } catch (error) { stdRes._500(res, error.message) }
}

// get page
exports.getPage = async (req, res, next) => {
  try {
    const page = await Page.findOne({ _id: req.params.pageId })

    if (page) return stdRes._400(res, 'Page not found')

    res.json({
      success: true,
      page: pageTemplate(page)
    })
  } catch (error) { stdRes._500(res, error.message) }
}

// Post Cart
exports.postCart = async (req, res, next) => {
  try {
    req.cart.modifyItems(req.body.productId, req.body.quantity)
    await req.cart.save()
    const cart = await req.cart.get()
    res.json({
      success: true,
      cart: cartTemplate(cart)
    })
  } catch (error) { stdRes._500(res, error.message) }
}

exports.postCheckout = async (req, res, next) => {
  try {
    const cart = await req.cart.get()
    const subtotal = cart.reduce((accum, item) => item.product.price * item.quantity + accum, 0)
    const shippingCost = cart.reduce((accum, item) => item.product.shippingCost * item.quantity + accum, 0)
    const total = ((subtotal + shippingCost) * 100)

    const name = req.body.firstName + ' ' + req.body.lastName
    const expMonth = req.body.cardExpiration.substring(0, 2)
    const expYear = req.body.cardExpiration.substring(3, 5)
    const customer = await stripe.customers.create({
      address: {
        city: req.body.city,
        country: req.body.country,
        line1: req.body.line1,
        line2: req.body.line2,
        postal_code: req.body.zip,
        state: req.body.state
      },
      email: req.body.email,
      name: name,
      phone: req.body.phone
    })

    // Creating payment method
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        number: req.body.cardNumber,
        exp_month: expMonth,
        exp_year: expYear,
        cvc: req.body.cvc
      },
      billing_details: {
        address: customer.address,
        email: customer.email,
        name: customer.name,
        phone: customer.phone
      }
    })

    // Attaching payment method to customer
    const attachPaymentToCustomer = await stripe.paymentMethods.attach(
      paymentMethod.id,
      { customer: customer.id }
    )

    // creating charges
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total,
      currency: 'usd',
      customer: customer.id
    })

    // charges confirmation
    const paymentIntentConfirmation = await stripe.paymentIntents.confirm(
      paymentIntent.id,
      { payment_method: paymentMethod.id }
    )
    let order = ''
    if (paymentIntentConfirmation) {
      const cart = await req.cart.get()

      if (!cart || cart.length === 0) throw Error('The cart cannot be empty')

      const orderProducts = []
      const stockUpdatePromises = []

      cart.forEach((item) => {
        orderProducts.push({
          originalProduct: item.product._id,
          title: item.product.title,
          unitPrice: item.product.price,
          unitShippingCost: item.product.shippingCost,
          quantity: item.quantity
        })

        // MANO: Update only if stock is set. If the stock is not set then there is no need to update it
        // stockUpdatePromises.push(Product.findByIdAndUpdate(item.product.id, { $inc: { stock: -item.quantity } }))
      })
      order = new Order({
        user: (req.user) ? req.user : undefined,
        personal: {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email
        },
        shipping: {
          state: req.body.state,
          city: req.body.city,
          address: req.body.line1 + ' ' + req.body.line2,
          zip: req.body.zip
        },
        items: orderProducts
      })

      // reduce the number of stock (if there is a -1 then you inform to the staff)

      await stockUpdatePromises
      await order.save()
      await req.cart.reset()

      if (process.env.NODE_ENV === (env.isProd)) {
        mailer(['enrique@secondly.store', 'ezequiel@secondly.store'], 'New Order Received', `Order Received from ${order.personal.firstName} ${order.personal.lastName}.\n\nYou can check it here: https://secondly.store/admin/orders/${order.id}`)
          .then(() => {
            return mailer(order.personal.email, 'Order Received', 'Your order has been received!\n\nIt is now being processes and we will let you know as soon as it is shipped (24 hours max.).\n\nThe Secondly Team')
          })
          .catch(error => {
            console.log(error)
          })
      }
    }

    res.json({
      success: true,
      orderData: order
    })
  } catch (error) {
    console.log('error', error)
    stdRes._500(res, error.message)
  }
}

exports.postSubscribe = async (req, res, next) => {
  try {
    const email = req.body.email
    const duplicateEmail = await Subscription.findOne({ email })
    if (duplicateEmail) return stdRes._400(res, 'email', 'You are already subscribed!')
    const subscriptor = new Subscription({ email })
    await subscriptor.save()
    res.json({ success: true })
  } catch (error) { stdRes._500(res, error.message) }
}
