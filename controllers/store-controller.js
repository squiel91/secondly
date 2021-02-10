/* eslint-disable func-call-spacing */
// const stripe = require('stripe')('sk_test_51HsvHmF1g3qjNQo3UKVTBTvzNgJEnECDCwjrj33NVknPH9JkhQil7XdATmhRIciU53LCfie21wig5DqgCJ5qF8m500nA4ViP5a')
const mongoose = require('mongoose')
const Product = require('../models/Product')
const Page = require('../models/Page')
const Category = require('../models/Category')
const Order = require('../models/Order')
const countryCodes = require('../utils/country-codes')
// const validator = require('email-validator')

function filterOutUnpublishedProducts (category) {
  category.products = category.products.filter(product => product.publish)
}

// get hompage
exports.getHomepage = async (req, res, next) => {
  // all these can be done more efficiently using only mongo groups
  const featuredCategories = await Category.find({ featured: true })

  // eslint-disable-next-line no-undef
  const homepageCategoryRawList = PREFERENCES.homepage?.categories || []
  const homepageCategoryIds = homepageCategoryRawList.map(homepageCategoryItem => mongoose.Types.ObjectId(homepageCategoryItem.id))

  const homepageCategoryList = await Category.find(
    { _id: { $in: homepageCategoryIds } }
  ).populate('products')
  homepageCategoryList.forEach(category => filterOutUnpublishedProducts(category))

  const homepageCategories = []
  homepageCategoryRawList.forEach(rawItem => {
    const homepageCategory = homepageCategoryList.find(category => category.id === rawItem.id)
    if (homepageCategory) {
      homepageCategories.push({
        category: homepageCategory,
        altTitle: rawItem.altTitle
      })
    }
  })

  res.render('store/homepage.ejs', { homepageCategories, featuredCategories })
}

// get categories listing
exports.getCategories = async (req, res, next) => {
  const categories = await Category.find().populate('products')
  categories.forEach(category => filterOutUnpublishedProducts(category))
  res.render('store/categories.ejs', { categories })
}

// get category details
exports.getCategory = async (req, res, next) => {
  const categories = await Category.findOne(
    { handle: req.params.categoryHandle }
  ).populate('products')
  filterOutUnpublishedProducts(categories)
  res.render('store/category.ejs', { category: categories })
}

// get product details
exports.getProduct = async (req, res, next) => {
  const product = await Product.findOne({ handle: req.params.productHandle, publish: true })
  if (!product) return next()

  const recommendedProducts = await Product.find({ _id: { $ne: product._id }, publish: true }).limit(4)
  res.render('store/product.ejs', { product, recommendedProducts })
}

// get cart details
exports.getCart = async (req, res, next) => {
  const cart = await req.cart.get()
  // in case the cart changed
  res.locals.cartItemQty = req.cart.getItemsQuantity()

  res.render('store/cart.ejs', {
    cart,
    subtotal: cart.reduce((accum, item) => item.product.price * item.quantity + accum, 0),
    shipping: cart.reduce((accum, item) => item.product.shippingCost * item.quantity + accum, 0),
    totalPrice: cart.reduce((accum, item) => (item.product.price + item.product.shippingCost) * item.quantity + accum, 0)
  })
}

// get shipping form
exports.getCheckoutStripe = async (req, res, next) => {
  // TODO: check if the user has at least one product
  // res.render('store/shipping.ejs')
  const cart = await req.cart.get()

  const totalPrice = cart.reduce((accum, item) => (item.product.price + item.product.shippingCost) * item.quantity + accum, 0)
  res.render('store/checkout-stripe.ejs', { countryCodes, totalPrice })
}

// get mercado shipping form
exports.getCheckoutMercadoPago = async (req, res, next) => {
  const cart = await req.cart.get()
  const totalPrice = cart.reduce((accum, item) => (item.product.price + item.product.shippingCost) * item.quantity + accum, 0)
  res.render('store/checkout-mercadopago.ejs', { countryCodes, totalPrice })
}

// get shipping form
exports.getOrders = (req, res, next) => {
  // TODO: this should be specific order
  res.render('store/orders.ejs')
}

// get page details
exports.getPage = async (req, res, next) => {
  const page = await Page.findOne({ handle: req.params.pageHandle })
  if (page) res.render('store/page.ejs', { page })
  else next()
}

// get search listing
exports.getSearch = (req, res, next) => {
  const query = req.query.q
  const selectedOrder = req.query.order
  const selectedMinPrice = req.query.minPrice && parseInt(req.query.minPrice)
  const selectedMaxPrice = req.query.maxPrice && parseInt(req.query.maxPrice)
  const freeShipping = req.query.freeShipping === 'on'
  const selectedCategories = req.query.category ? (typeof req.query.category === 'string' ? [req.query.category] : req.query.category) : []

  const search = {
    $or: [
      { title: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } }
    ]
  }

  if (freeShipping) {
    search.shippingCost = 0
  }
  console.log(search)

  Product.find(search)
    .then((products) => {
      this.products = products
      this.productIds = products.map(product => product._id)
      return Category.find({ products: { $in: this.productIds } })
    })
    .then(categories => {
      const categoryFilters = categories.map(category => {
        return {
          id: category.id,
          title: category.title,
          quantity: category.products.filter(productId => !this.productIds.includes(productId)).length
        }
      })
      let minPrice; let maxPrice
      if (this.products && this.products.length > 0) {
        [minPrice, maxPrice] = [this.products[0].price, this.products[0].price]
        this.products.forEach(product => {
          minPrice = Math.min(product.price, minPrice)
          maxPrice = Math.max(product.price, maxPrice)
        })
      } else {
        [minPrice, maxPrice] = [0, 0]
      }
      res.render('store/search.ejs', {
        query,
        products: this.products,
        freeShipping,
        categoryFilters,
        selectedCategories,
        selectedOrder,
        minPrice,
        selectedMinPrice,
        maxPrice,
        selectedMaxPrice
      })
    })
    .catch(error => console.log(error))
}

// exports.postCartShipping = (req, res, next) => {
//   let user = req.user
//   res.render('store/shipping.ejs')
// }

// exports.postCart = (req, res, next) => {
//   let user = req.user

//   const productId = req.body.productId
//   if (req.body.add) {
//     if (user) {
//       user.addToCart(productId, parseInt(req.body.add))
//       user.save(() => res.redirect('/cart'))
//     } else {
//       req.sessionCart.addToCart(productId, parseInt(req.body.add))
//       req.sessionCart.save(() => res.redirect('/cart'))
//     }
//   }
//   if (req.body.remove) {
//     if (user) {
//       user.addToCart(productId, - parseInt(req.body.remove))
//       user.save(() => res.redirect('/cart'))
//     } else {
//       req.sessionCart.addToCart(productId, - parseInt(req.body.remove))
//       req.sessionCart.save(() => res.redirect('/cart'))
//     }
//   }
// }

// Checkout
// exports.postCheckout = async (req, res) => {
//   if (validator.validate(req.body.email)) {
//     (req.user? req.user.populate('cart.product').execPopulate() : req.sessionCart.getAll())
//       .then(cartItems => {
//         if (req.user) cartItems = cartItems.cart
//         req.session.remember = req.body.remember
//         delete req.body['remember']
//         req.session.shippment = { ...req.body }
//         req.session.save(async () => {
//           // here I should do the last ckeck if I have the products
//           let lineItems = cartItems.map(item => {
//             return {
//               price_data: {
//                 currency: 'usd',
//                 product_data: {
//                   name: item.product.title,
//                   images: ['https://secondly.store' + item.product.imagePaths[0]]
//                 },
//                 unit_amount: parseInt(item.product.price * 100)
//               },
//               quantity: item.quantity,
//             }
//           })
//           const totalShippmentCost = cartItems.reduce((accum, item) => item.product.shippingCost * item.quantity + accum, 0)
//           if (totalShippmentCost > 0) lineItems.push({
//             price_data: {
//               currency: 'usd',
//               product_data: {
//                 name: 'Standard USPS Shipping',
//                 images: ['https://secondly.store/assets/usps.jpeg']
//               },
//               unit_amount: parseInt(totalShippmentCost * 100)
//             },
//             quantity: 1,
//           })
//           const session = await stripe.checkout.sessions.create({
//             customer_email: req.body.email,
//             payment_method_types: ['card'],
//             line_items: lineItems,
//             mode: 'payment',
//             success_url: (process.env.NODE_ENV == 'production'? 'https://secondly.store' : 'http://localhost:3000') + '/cart/checkout/success?session_id={CHECKOUT_SESSION_ID}',
//             cancel_url: (process.env.NODE_ENV == 'production'? 'https://secondly.store' : 'http://localhost:3000') +'/cart/checkout/fail'
//           })
//           res.json({ id: session.id })
//         })
//     })
//   } else {
//     console.log('ERROR VALIDATING')
//     res.status(400).json({ error: 'invalid email' })
//   }
// }

exports.getCheckoutSuccess = async (req, res, next) => {
  const order = await Order.findOne({ _id: req.query.orderId })
  res.render('store/success.ejs', { order })
}

exports.getCheckoutFail = (req, res, next) => {
  res.render('store/fail.ejs')
}
