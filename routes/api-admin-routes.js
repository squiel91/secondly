const express = require('express')
const router = express.Router()

const apiAdminValidator = require('../controllers/validators/api-admin-validator')
const apiAdminController = require('../controllers/api-admin-controller')
const authenticate = apiAdminController.adminAuth

// Page
router.post('/pages', authenticate, apiAdminValidator.postPage, apiAdminController.postPage)
router.patch('/pages/:pageId', authenticate, apiAdminController.patchPage)
router.delete('/pages/:pageId', authenticate, apiAdminController.deletePage)

// Categories
router.post('/categories', authenticate, apiAdminValidator.postCategory, apiAdminController.postCategory)
router.patch('/categories/:categoryId', authenticate, apiAdminController.patchCategory)
router.delete('/categories/:categoryId', authenticate, apiAdminController.deleteCategory)

// Product
router.post('/products', authenticate, apiAdminValidator.postProduct, apiAdminController.postProduct)
router.patch('/products/:productId', authenticate, apiAdminController.patchProduct)
router.delete('/products/:productId', authenticate, apiAdminController.deleteProduct)

// User
router.post('/users', authenticate, apiAdminValidator.postUser, apiAdminController.postUser)
router.patch('/users/:userId', authenticate, apiAdminController.patchUser)
router.delete('/users/:userId', authenticate, apiAdminController.deleteUser)

module.exports = router
