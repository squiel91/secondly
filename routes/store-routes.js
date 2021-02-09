const express = require('express')

const router = express.Router()

const storeController = require('../controllers/store-controller')
// EZE: Use storeApiController for customer setup
const storeApiController = require('../controllers/api-store-controller')

router.get('/', storeController.getHomepage)
router.get('/products/:productHandle', storeController.getProduct)
router.get('/cart', storeController.getCart)
// router.get('/cart/checkout', storeController.getCheckout)
router.get('/cart/checkout', storeController.getCheckoutMercado)

router.get('/cart/checkout/success', storeController.getCheckoutSuccess)
router.get('/cart/checkout/fail', storeController.getCheckoutFail)
router.get('/orders', storeController.getOrders)
router.get('/pages/:pageHandle', storeController.getPage)
router.get('/categories', storeController.getCategories)
router.get('/categories/:categoryHandle', storeController.getCategory)

// router.post('/cart', storeController.postCart)
// router.post('/cart/shipping', storeController.postCartShipping)
// router.post('/cart/checkout', storeController.postCheckout)

// Search
router.get('/search', storeController.getSearch)

// EZE: I didn't add the validator. we have to discuss this.
router.post('/process_payment',
  // storeApiValidator.postCheckout,
  storeApiController.customerSetup,
  storeController.postCheckoutMercado
)

module.exports = router
