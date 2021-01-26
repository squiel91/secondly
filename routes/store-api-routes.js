
const express = require('express')
const router = express.Router()

const storeApiValidator = require('../controllers/validators/store-api-validator')
const storeApiController = require('../controllers/store-api-controller')
 
router.post('/', storeApiValidator.cart,storeApiController.postCart)
router.post('/checkout', storeApiValidator.checkout,storeApiController.postCheckout)
 
module.exports = router