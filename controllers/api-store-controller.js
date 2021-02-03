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
const Subscription = require('../models/subscription')
const Order = require('../models/Order')

// templates
const cartTemplate = require('../models/templates/cart')
const productTemplate = require('../models/templates/product')
const categoryTemplate = require('../models/templates/category')
const pageTemplate = require('../models/templates/page')

const mailer = require('../utils/mailer')
const stdRes = require('../utils/standard-response')

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
    const customer = await stripe.customers.create({
      address: {
        city: req.body.city,
        country: req.body.country,
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
        number: req.body.number,
        exp_month: req.body.exp_month,
        exp_year: req.body.exp_year,
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
      amount: total, // $20
      currency: 'usd',
      customer: customer.id
    })

    // charges confirmation
    const paymentIntentConfirmation = await stripe.paymentIntents.confirm(
      paymentIntent.id,
      { payment_method: paymentMethod.id }
    )


    if (paymentIntentConfirmation) {
      const cart = await req.cart.get()
      // (req.user ? req.user.populate('cart.product').execPopulate() : req.sessionCart.getAll())
      const data = req.user ? req.user.populate('cart.product').execPopulate() : req.cart.get()
      data
        .then(fullCart => {
          if (req.user) fullCart = fullCart.cart
          // eslint-disable-next-line eqeqeq
          if (!fullCart || fullCart.length == 0) throw Error('The cart is cannot be empty')
          const orderProducts = []
          const stockUpdatePromises = []

          for (const item of cart) {
            orderProducts.push({
              originalProduct: item.product._id,
              title: item.product.title,
              unitPrice: item.product.price,
              unitShippingCost: item.product.shippingCost,
              quantity: item.quantity
            })

            stockUpdatePromises.push(Product.findByIdAndUpdate(item.product.id, { $inc: { stock: -item.quantity } }))
          }
          const order = new Order({
          // user: user,
            personal: {
              firstName: req.session.shipping.firstName,
              lastName: req.session.shipping.lastName,
              email: req.session.shipping.email
            },
            shipping: {
              state: req.session.shipping.state,
              city: req.session.shipping.city,
              address: req.session.shipping.address,
              zip: req.session.shipping.zip
            },
            items: orderProducts
          })

          // reduce the number of stock (if there is a -1 then you inform to the staff)
          Promise.all(stockUpdatePromises)
            .then(result => {
              return order.save()
            })
            .then(async order => {
              await req.cart.reset()
            })
            .then(result => {
            // eslint-disable-next-line eqeqeq
              if (process.env.NODE_ENV == 'production') {
                mailer(['enrique@secondly.store', 'ezequiel@secondly.store'], 'New Order Received', `Order Received from ${order.personal.firstName} ${order.personal.lastName}.\n\nYou can check it here: https://secondly.store/admin/orders/${order.id}`)
                  .then(() => {
                    return mailer(order.personal.email, 'Order Received', 'Your order has been received!\n\nIt is now being processes and we will let you know as soon as it is shipped (24 hours max.).\n\nThe Secondly Team')
                  })
                  .catch(error => {
                    console.log(error)
                  })
              }
            })
        })
        .catch(error => {
          console.error(error)
          throw Error()
        })
    }

    res.json({
      success: true
    })

    //   } else {
    //     stdRes(res, message: getError(paymentIntentConfirmation))
    //   }

    // console.log('paymentIntentConfirmation', paymentIntentConfirmation)
    // console.log('cart', cart)
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
