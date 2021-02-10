
const express = require('express')
const router = express.Router()

const apiStoreValidator = require('../controllers/validators/api-store-validator')
const apiStoreController = require('../controllers/api-store-controller')

// get Products
router.get('/products', apiStoreController.getProduct)
router.get('/products/:productId', apiStoreController.getProduct)

// get Categories
router.get('/categories', apiStoreController.getCategories)
router.get('/categories/:categoryHandle', apiStoreController.getCategory) // need to discuss

// get Pages
router.get('/pages', apiStoreController.getPages)
router.get('/pages/:pageId', apiStoreController.getPage)

// cart & checkout
router.post('/cart',
  apiStoreValidator.postCart,
  apiStoreController.customerSetup,
  apiStoreController.postCart
)

router.post('/cart/checkout-stripe',
  apiStoreValidator.postCheckoutStripe,
  apiStoreController.customerSetup,
  apiStoreController.postCheckoutStripe
)

router.post('/cart/checkout-mercadopago',
  apiStoreValidator.postCheckoutMercadoPago,
  apiStoreController.customerSetup,
  apiStoreController.postCheckoutMercadoPago
)

router.post('/subscribe', apiStoreValidator.postSubscribe, apiStoreController.postSubscribe)

module.exports = router
