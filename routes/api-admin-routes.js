const express = require('express')
const router = express.Router()

const adminApiValidator = require('../controllers/validators/api-admin-validator')
const adminApiController = require('../controllers/api-admin-controller')
const authenticate = adminApiController.adminAuth

// Page
router.post('/page', authenticate, adminApiValidator.postPage, adminApiController.postPage)
router.patch('/page/:pageId', authenticate, adminApiController.patchPage)
router.delete('/page/:pageId', authenticate, adminApiController.deletePage)

// Categories
router.post('/category', authenticate, adminApiValidator.postCategory, adminApiController.postCategory)
router.patch('/category/:categoryId', authenticate, adminApiController.patchCategory)
router.delete('/category/:categoryId', authenticate, adminApiController.deleteCategory)

// Product
router.post('/product', authenticate, adminApiValidator.postProduct, adminApiController.postProduct)
router.patch('/product/:productId', authenticate, adminApiController.patchProduct)
router.delete('/product/:productId', authenticate, adminApiController.deleteProduct)

// User
router.post('/user', authenticate, adminApiValidator.postUser, adminApiController.postUser)
router.patch('/user/:userId', authenticate, adminApiController.patchUser)
router.delete('/user/:userId', authenticate, adminApiController.deleteUser)

module.exports = router
