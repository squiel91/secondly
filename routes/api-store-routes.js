
const express = require('express')
const router = express.Router()

const storeApiValidator = require('../controllers/validators/api-store-validator')
const storeApiController = require('../controllers/api-store-controller')
 
// Get Products
router.get("/products", storeApiController.getProducts)
router.get("/products/:productId", storeApiController.getProductDetails)

// Get Categories
router.get("/categories", storeApiController.getCategories)
router.get("/categories/:categoryHandle", storeApiController.getCategoryDetails) //need to discuss

// Get Pages
router.get("/pages", storeApiController.getPages)
router.get("/pages/:pageId", storeApiController.getPageDetails)

// cart/checkout
router.post('/cart', storeApiValidator.postCart, storeApiController.postCart)
router.post('/cart/checkout', storeApiValidator.postCheckout, storeApiController.postCheckout)
router.post('/subscribe', storeApiValidator.postSubscribe, storeApiController.postSubscribe)

module.exports = router