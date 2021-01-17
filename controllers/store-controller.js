const stripe = require('stripe')('sk_test_51HsvHmF1g3qjNQo3UKVTBTvzNgJEnECDCwjrj33NVknPH9JkhQil7XdATmhRIciU53LCfie21wig5DqgCJ5qF8m500nA4ViP5a')
var mongoose = require('mongoose')

const Product = require('../models/Product')
const Page = require('../models/Page')
const Order = require('../models/Order')
const Subscription = require('../models/Subscription')
const Category = require('../models/Category')
var validator = require('email-validator');

const mailer = require('../utils/mailer');

function filterOutUnpublishedProducts(category) {
  category.products = category.products.filter(product => product.publish)
}

// General
exports.getHomepage = async (req, res, next) => {
  // all these can be done more efficiently using only mongo groups
  featuredCategories = await Category.find({ featured: true })
  
  homepageCategoryRawList = PREFERENCES.homepage?.categories || []
  homepageCategoryIds = homepageCategoryRawList.map(homepageCategoryItem => mongoose.Types.ObjectId(homepageCategoryItem.id))

  homepageCategoryList = await Category.find({'_id': { '$in': homepageCategoryIds}}).populate('products')
  homepageCategoryList.forEach(category => filterOutUnpublishedProducts(category))

  homepageCategories = []
  homepageCategoryRawList.forEach(rawItem => {
    const homepageCategory = homepageCategoryList.find(category => category.id == rawItem.id)
    if (homepageCategory)
      homepageCategories.push({
        category: homepageCategory,
        altTitle: rawItem.altTitle
      })
  })

  res.render('store/homepage.ejs', { homepageCategories, featuredCategories })
}


// Categories

exports.getCategories = (req, res, next) => {
  let user = req.user
  Category.find().populate('products').exec((err, categories) => {
    categories.forEach(category => filterOutUnpublishedProducts(category))
    res.render('store/categories.ejs', { categories })
  })
}

exports.getCategory = (req, res, next) => {
  let user = req.user
  Category.findOne({ handle: req.params.categoryHandle }).populate('products').exec((err, categories) => {
    filterOutUnpublishedProducts(categories)
    res.render('store/category.ejs', { category: categories })
  })
}

// Products

exports.getProducts = (req, res, next) => {
  Product.find({publish: true})
    .then(products => {
      con
      let user = req.user
   
      res.render('store/products.ejs', { 
        products,
      })
    })
    .catch(err => console.log(err))
}

exports.getProductDetails = (req, res, next) => {
  Product.findOne({ _id: req.params.productId, publish: true })
    .then(product => {
      if (!product) next()
      console.log(product)
      this.product = product 
      Product.find({_id: { $ne: product._id }, publish: true}).limit(4)
        .then(products => {
          let user = req.user
          
          res.render('store/product.ejs', { 
            product: this.product,
            recommendedProducts: products
          })
        })
        .catch(err => console.log(err))
    })
    .catch(err => console.log(err))
}

exports.getCart = (req, res, next) => {
  let cart;
  if (req.user) {
    req.user.populate('cart.product').execPopulate()
      .then(user => {
        res.render('store/cart.ejs', {
          cart: user.cart,
          subtotal: user.cart.reduce((accum, item) => item.product.price * item.quantity + accum, 0),
          shipping: user.cart.reduce((accum, item) => item.product.shippingCost * item.quantity + accum, 0),
          totalPrice: user.cart.reduce((accum, item) => (item.product.price + item.product.shippingCost) * item.quantity + accum, 0)
        })
      })
      .catch(err => {
        console.log(err)
      });
  } else {
    let cart = req.sessionCart
    cart.getAll(cartItems => {
      res.render('store/cart.ejs', {
        cart: cartItems,
        subtotal: cartItems.reduce((accum, item) => item.product.price * item.quantity + accum, 0),
        shipping: cartItems.reduce((accum, item) => item.product.shippingCost * item.quantity + accum, 0),
        totalPrice: cartItems.reduce((accum, item) => (item.product.price + item.product.shippingCost) * item.quantity + accum, 0),
      })
    })
  }
}

exports.postCart = (req, res, next) => {
  let user = req.user
  
  const productId = req.body.productId
  if (req.body.add) {
    if (user) {
      user.addToCart(productId, parseInt(req.body.add))
      user.save(() => res.redirect('/cart'))
    } else {
      req.sessionCart.addToCart(productId, parseInt(req.body.add))
      req.sessionCart.save(() => res.redirect('/cart'))
      
    }
  }
  if (req.body.remove) {
    if (user) {
      user.addToCart(productId, - parseInt(req.body.remove))
      user.save(() => res.redirect('/cart'))
    } else {
      req.sessionCart.addToCart(productId, - parseInt(req.body.remove))
      req.sessionCart.save(() => res.redirect('/cart'))
    }
  }
}

exports.getCartShipping = (req, res, next) => {
  let user = req.user
  let prefill = {}
  if (user) {
    prefill['firstName'] = { value: user.firstName } 
    prefill['lastName'] = { value: user.lastName } 
    prefill['email'] = { value: user.email } 
  }
  if (req.session.remember) {
    prefill['shippment'] = req.session.shippment
  }
  res.render('store/shipping.ejs', { prefill })
}

exports.postCartShipping = (req, res, next) => {

  let user = req.user
  res.render('store/shipping.ejs')
}

exports.getOrders = (req, res, next) => {
  let user = req.user
  res.render('store/orders.ejs')
}

// Pages

exports.getPage = (req, res, next) => {
  Page.findOne({ handle: req.params.pageHandle })
  .then(page => {
    if (page) res.render('store/page.ejs', { page })
    else next()
  })
  .catch(err => {
    console.log(err)
  })
}


// Checkout

exports.postCheckout = async (req, res) => {
  if (validator.validate(req.body.email)) {
    (req.user? req.user.populate('cart.product').execPopulate() : req.sessionCart.getAll()) 
      .then(cartItems => {
        if (req.user) cartItems = cartItems.cart
        req.session.remember = req.body.remember
        delete req.body['remember']
        req.session.shippment = { ...req.body }
        req.session.save(async () => {
          // here I should do the last ckeck if I have the products 
          let lineItems = cartItems.map(item => {
            return {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: item.product.title,
                  images: ['https://secondly.store' + item.product.imagePaths[0]]
                },
                unit_amount: parseInt(item.product.price * 100)
              },
              quantity: item.quantity,
            }
          })
          const totalShippmentCost = cartItems.reduce((accum, item) => item.product.shippingCost * item.quantity + accum, 0)
          if (totalShippmentCost > 0) lineItems.push({
            price_data: {
              currency: 'usd',
              product_data: { 
                name: 'Standard USPS Shipping',
                images: ['https://secondly.store/assets/usps.jpeg']
              },
              unit_amount: parseInt(totalShippmentCost * 100)
            },
            quantity: 1,
          })
          const session = await stripe.checkout.sessions.create({
            customer_email: req.body.email,
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: (process.env.NODE_ENV == 'production'? 'https://secondly.store' : 'http://localhost:3000') + '/cart/checkout/success?session_id={CHECKOUT_SESSION_ID}',
            cancel_url: (process.env.NODE_ENV == 'production'? 'https://secondly.store' : 'http://localhost:3000') +'/cart/checkout/fail'
          })
          res.json({ id: session.id }) 
        })
    })
  } else {
    console.log('ERROR VALIDATING')
    res.status(400).json({ error: 'invalid email' }) 
  }
}

exports.getCheckoutSuccess = (req, res, next) => {
  let user = req.user;

  (req.user? req.user.populate('cart.product').execPopulate() : req.sessionCart.getAll())
    .then(fullCart => {
      if (req.user) fullCart = fullCart.cart
      
      if (!fullCart || fullCart.length == 0) throw Error('The cart is cannot be empty')
      let orderProducts = []
      let stockUpdatePromises = []

      for (let item of fullCart) {
        orderProducts.push({
          originalProduct: item.product._id,
          title: item.product.title,
          unitPrice: item.product.price,
          unitShippingCost: item.product.shippingCost,
          quantity: item.quantity
        })

        stockUpdatePromises.push(Product.findByIdAndUpdate(item.product.id, {$inc: { stock: -item.quantity }}))
      }

      const order = new Order({
        user: user,
        personal: {
          firstName:req.session.shippment.firstName, 
          lastName: req.session.shippment.lastName,
          email: req.session.shippment.email
        },
        shipping: {
          state: req.session.shippment.state,
          city: req.session.shippment.city,
          state: req.session.shippment.state,
          address: req.session.shippment.address,
          zip: req.session.shippment.zip
        },
        items: orderProducts
      })

      // reduce the number of stock (if there is a -1 then you inform to the staff)
      Promise.all(stockUpdatePromises)
        .then(result => {
          return order.save()
        })
        .then(order => {
          if (req.user) {
            req.user.cart = []
            req.user.save()
          } else req.session.sessionCart.reset()
        })
        .then(result => {
          if (process.env.NODE_ENV == 'production') {
            mailer(['enrique@secondly.store', 'ezequiel@secondly.store'], 'New Order Received', `Order Received from ${order.personal.firstName} ${order.personal.lastName}.\n\nYou can check it here: https://secondly.store/admin/orders/${order.id}`)
            .then(() => {
              return mailer(order.personal.email, 'Order Received', `Your order has been received!\n\nIt is now being processes and we will let you know as soon as it is shipped (24 hours max.).\n\nThe Secondly Team`)
            })
            .then(() => {
              res.render('store/success.ejs')
            })
            .catch(error => {
              console.log(error)
            })
          } else {
            res.render('store/success.ejs')
          }          
        })
    })
    .catch(error => {
      console.error(error)
      throw Error()
    })
}

exports.getCheckoutFail = (req, res, next) => {
  res.render('store/fail.ejs')
}

// API

// Subscribe

exports.postSubscribe = (req, res, next) => {
  let email = req.body.email.toLowerCase().trim()
  console.log(email)
  if (validator.validate(email)) {
    Subscription.findOne({ email })
      .then(subscriptor => {
        console.log(subscriptor)
        if (subscriptor) {
          res.json({
            error: 'You are already subscribed!'
          })
        } else {
          let subscriptor = new Subscription({ email })
          subscriptor.save()
            .then(() => {
              res.json({
                success: true
              })
            })
            .catch(error => {
              res.json({
                error: 'Our error! Try again.'
              })
            })
        }
      })
  } else res.json({
    error: 'Invalid email' 
  }) 
}

// Search

exports.getSearch = (req, res, next) => {
  const query = req.query.q
  const selectedOrder = req.query.order
  const selectedMinPrice = req.query.minPrice && parseInt(req.query.minPrice)
  const selectedMaxPrice = req.query.maxPrice && parseInt(req.query.maxPrice)
  const freeShipping = req.query.freeShipping == 'on'
  const selectedCategories = req.query.category? (typeof req.query.category == 'string'? [req.query.category] : req.query.category ) : [] 
  // console.log(selectedCategories) 
  
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
      this.productIds =  products.map(product => product._id)
      return Category.find({ products: { $in: this.productIds } })
    })
    .then(categories =>  {

      const categoryFilters = categories.map( category => {
        return {
          id: category.id,
          title: category.title,
          quantity: category.products.filter(productId => !this.productIds.includes(productId)).length
        } 
      })
      let minPrice; let maxPrice
      if (this.products && this.products.length > 0) {
        [ minPrice, maxPrice ] = [ this.products[0].price, this.products[0].price ]
        this.products.forEach(product => {
          minPrice = Math.min(product.price, minPrice)
          maxPrice = Math.max(product.price, maxPrice)
        })
      } else {
        [ minPrice, maxPrice ] = [ 0, 0 ]
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