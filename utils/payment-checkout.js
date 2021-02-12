const Order = require('../models/Order')
const Product = require('../models/Product')
const mailer = require('./mailer')
const env = require('./env')

// email templates
const staffNewOrderEmail = require('../email-templates/new-order-to-staff-email')
const customerNewOrderEmail = require('../email-templates/new-order-to-customer-email')

module.exports = async (req) => {
  const cart = await req.cart.get()
  const subtotal = cart.reduce((accum, item) => item.product.price * item.quantity + accum, 0)
  const shippingCost = cart.reduce((accum, item) => item.product.shippingCost * item.quantity + accum, 0)
  const total = ((subtotal + shippingCost) * 100)
  if (!cart || cart.length === 0) throw Error('The cart cannot be empty')

  const orderProducts = []
  const stockUpdatePromises = []

  // I should add a cover image here
  cart.forEach((item) => {
    orderProducts.push({
      originalProduct: item.product._id,
      title: item.product.title,
      unitPrice: item.product.price,
      unitShippingCost: item.product.shippingCost,
      quantity: item.quantity
    })

    // EZE: see what happens here when the stock is not set
    // reduce the number of stock (if there is a -1 then you inform to the staff)
    stockUpdatePromises.push(Product.findByIdAndUpdate(item.product.id, { $inc: { stock: -item.quantity } }))
  })
  let orderStatus
  if (req.body.paymentValue != 'cc') {
    orderStatus = 'unpaid'
  }
  const order = new Order({
    user: req.user ? req.user : undefined,
    status: orderStatus,
    paymentMethod: req.body.paymentMethodId,
    personal: {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      idType: req.body.docType,
      idNumber: req.body.docNumber
    },
    shipping: {
      state: req.body.state,
      city: req.body.city,
      address: req.body.address, //  + ' ' + req.body.line2
      zip: req.body.zip
    },
    items: orderProducts
  })

  await stockUpdatePromises
  await order.save()
  await req.cart.reset()

  if (process.env.NODE_ENV === (env.isProd)) {
    await mailer(
      ['ezequiel@secondly.store'],
      staffNewOrderEmail.subject,
      staffNewOrderEmail.body(req.body.firstName, req.body.lastName, total, order.id)
    )
    await mailer(
      req.body.email,
      customerNewOrderEmail.subject,
      customerNewOrderEmail.body(total, req.user, order.id)
    )
  }

  return order
}
