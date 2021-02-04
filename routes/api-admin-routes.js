const express = require('express')
const router = express.Router()

const adminApiValidator = require('../controllers/validators/api-admin-validator')
const adminApiController = require('../controllers/api-admin-controller')
const authenticate = adminApiController.adminAuth

// Page
router.post('/pages', authenticate, adminApiValidator.postPage, adminApiController.postPage)
router.patch('/pages/:pageId', authenticate, adminApiController.patchPage)
router.delete('/pages/:pageId', authenticate, adminApiController.deletePage)

// Categories
router.post('/categories', authenticate, adminApiValidator.postCategory, adminApiController.postCategory)
router.patch('/categories/:categoryId', authenticate, adminApiController.patchCategory)
router.delete('/categories/:categoryId', authenticate, adminApiController.deleteCategory)

// Product
router.post('/products', authenticate, adminApiValidator.postProduct, adminApiController.postProduct)
router.patch('/products/:productId', authenticate, adminApiController.patchProduct)
router.delete('/products/:productId', authenticate, adminApiController.deleteProduct)

// User
router.post('/users', authenticate, adminApiValidator.postUser, adminApiController.postUser)
router.patch('/users/:userId', authenticate, adminApiController.patchUser)
router.delete('/users/:userId', authenticate, adminApiController.deleteUser)

module.exports = router
