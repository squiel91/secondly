/* eslint-disable no-unused-vars */
// eslint-disable-next-line camelcase
const Publishable_Key = 'pk_test_51Hsv6KLzpNoJw5cRqsZQiQh1hqWafCluHiYVFIt68Y4RjWYsEFX4HGPaquJ3lcxNjOh393Ms39m0V4akBZ46727J00EzprcXql'
// eslint-disable-next-line camelcase
const Secret_Key = 'sk_test_51Hsv6KLzpNoJw5cRhFtvtSixJDOpLwLY0ZzDR6dM0nYcJUv4XV8zV4HUCpRVw0j0vjrhwotun4vAvmrESk4Chgzg00QakDHuoW'
const stripe = require('stripe')(Secret_Key)
const mercadopago = require('mercadopago')
mercadopago.configurations.setAccessToken('TEST-2528813857390327-011214-ec73171c325ec8e222037a81f54c5253-28897842')
// models
const Cart = require('../models/Cart')
const User = require('../models/User')
const Category = require('../models/Category')
const Product = require('../models/Product')
const Page = require('../models/Page')
const Subscription = require('../models/Subscription')

// templates
const cartTemplate = require('../models/templates/cart')
const productTemplate = require('../models/templates/product')
const categoryTemplate = require('../models/templates/category')
const pageTemplate = require('../models/templates/page')

const stdRes = require('../utils/standard-response')
const checkout = require('../utils/payment-checkout')

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

exports.postCheckoutStripe = async (req, res, next) => {
  try {
    const cart = await req.cart.get()
    const subtotal = cart.reduce((accum, item) => item.product.price * item.quantity + accum, 0)
    const shippingCost = cart.reduce((accum, item) => item.product.shippingCost * item.quantity + accum, 0)
    const total = ((subtotal + shippingCost) * 100)

    const firstName = req.body.firstName
    const lastName = req.body.lastName
    const email = req.body.email
    const monthYear = req.body.cardExpiration.split('/')
    const expMonth = parseInt(monthYear[0])
    const expYear = parseInt(monthYear[1]) + 2000
    const customer = await stripe.customers.create({
      address: {
        city: req.body.city,
        country: req.body.country,
        line1: req.body.address,
        postal_code: req.body.zip,
        state: req.body.state
      },
      email,
      name: firstName + lastName
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
        email,
        name: customer.name
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
      currency: 'usd', // TODO: should be custom
      customer: customer.id
    })

    // charges confirmation
    const paymentIntentConfirmation = await stripe.paymentIntents.confirm(
      paymentIntent.id,
      { payment_method: paymentMethod.id }
    )
    if (!paymentIntentConfirmation) {
      return stdRes._400({ message: 'Stripe could not process the order' })
    }

    const order = await checkout(req)

    res.json({
      success: true,
      orderData: order
    })
  } catch (error) {
    console.log('error', error)
    stdRes._500(res, error.message)
  }
}

exports.postCheckoutMercadoPago = async (req, res, next) => {
  try {
    let abitabPaymentCreate
    let paymentStatus
    if (req.body.paymentValue != 'cc') {
      if (req.body.paymentValue == 'abitab') {
        req.body.paymentMethodId = 'abitab'
      } else {
        req.body.paymentMethodId = 'redpagos'
      }
      const abitabPaymentData = {
        transaction_amount: Number(req.body.transactionAmount),
        description: req.body.description,
        payment_method_id: req.body.paymentMethodId,
        payer: {
          email: req.body.email
        }
      }
      abitabPaymentCreate = await mercadopago.payment.create(abitabPaymentData)
    } else {
      const paymentData = {
        transaction_amount: Number(req.body.transactionAmount),
        token: req.body.token,
        description: req.body.description,
        installments: Number(req.body.installments),
        payment_method_id: req.body.paymentMethodId,
        issuer_id: req.body.issuer,
        payer: {
          email: req.body.email,
          identification: {
            type: req.body.docType,
            number: req.body.docNumber
          }
        }
      }
      paymentStatus = await mercadopago.payment.save(paymentData)
    }
    if ((paymentStatus && paymentStatus.body.status === 'approved') || (abitabPaymentCreate && abitabPaymentCreate.body.status === 'pending')) {
      const order = await checkout(req)
      res.json({
        success: true,
        orderData: order
      })
    }
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
