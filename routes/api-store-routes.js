
const express = require('express')
const router = express.Router()

const storeApiValidator = require('../controllers/validators/api-store-validator')
const storeApiController = require('../controllers/api-store-controller')

// get Products
router.get('/products', storeApiController.getProduct)
router.get('/products/:productId', storeApiController.getProduct)

// get Categories
router.get('/categories', storeApiController.getCategories)
router.get('/categories/:categoryHandle', storeApiController.getCategory) // need to discuss

// get Pages
router.get('/pages', storeApiController.getPages)
router.get('/pages/:pageId', storeApiController.getPage)

// cart & checkout
router.post('/cart',
  storeApiValidator.postCart,
  storeApiController.customerSetup,
  storeApiController.postCart
)

router.post('/cart/checkout',
  storeApiValidator.postCheckout,
  storeApiController.customerSetup,
  storeApiController.postCheckout
)

router.post('/subscribe', storeApiValidator.postSubscribe, storeApiController.postSubscribe)

module.exports = router
