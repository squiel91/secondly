
const express = require('express')
const router = express.Router()

const storeApiValidator = require('../controllers/validators/store-api-validator')
const storeApiController = require('../controllers/store-api-controller')
 
router.post('/', storeApiValidator.cart,storeApiController.postCart)
router.post('/checkout', storeApiValidator.checkout,storeApiController.postCheckout)

// Get Products
router.get("/products", storeApiController.getProducts)
router.get("/products/:productId", storeApiController.getProductDetails)

// Get Categories
router.get("/categories", storeApiController.getCategories)
router.get("/categories/:categoryHandle", storeApiController.getCategoryDetails) //need to discuss

// Get Pages
router.get("/pages", storeApiController.getPages)
router.get("/pages/:pageId", storeApiController.getPageDetails)
 
module.exports = router