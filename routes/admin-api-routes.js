
const express = require('express')
const router = express.Router()

const adminApiValidator = require('../controllers/validators/admin-api-validator')
const adminApiController = require('../controllers/admin-api-controller')
 
// Page
router.post('/page', adminApiController.adminAuth, adminApiValidator.postPage, adminApiController.postPage)
router.patch('/page/:pageId', adminApiController.adminAuth, adminApiController.patchPage)
router.delete('/page/:pageId', adminApiController.adminAuth, adminApiController.deletePage)

// Categories
router.post('/category', adminApiController.adminAuth, adminApiValidator.postCategory, adminApiController.postCategory)
router.patch('/category/:categoryId', adminApiController.adminAuth, adminApiController.patchCategory)
router.delete('/category/:categoryId', adminApiController.adminAuth, adminApiController.deleteCategory)

// Product
router.post('/product', adminApiController.adminAuth, adminApiValidator.postProduct, adminApiController.postProduct)
router.patch('/product/:productId', adminApiController.adminAuth, adminApiController.patchProduct)
router.delete('/product/:productId', adminApiController.adminAuth, adminApiController.deleteProduct)

// User
router.post('/user', adminApiController.adminAuth, adminApiValidator.postUser, adminApiController.postUser)
router.patch('/user/:userId', adminApiController.adminAuth, adminApiController.patchUser)
router.delete('/user/:userId', adminApiController.adminAuth, adminApiController.deleteUser)
 
module.exports = router