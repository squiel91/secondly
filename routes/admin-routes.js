const express = require('express')

const router = express.Router()

const adminValidator = require('../validators/admin-validator')
const adminController = require('../controllers/admin-controller')

// General
const auth = require('../middleware/auth')

router.use(auth.isAdmin)

// interesting, I can chain handles after the route. I can use that if I want the access to be more granular
router.get('/', adminController.getDashboard)

// Customize
router.get('/customize', adminController.getCustomize)
router.post('/customize', adminController.postCustomize)

//Categories
router.get('/categories', adminController.getCategories)
router.get('/categories/new', adminController.getNewCategory)
router.get('/categories/:categoryHandle', adminController.getEditCategory)
router.post('/categories', adminController.postNewCategory)
router.post('/categories/:categoryHandle', adminController.postEditCategory)
router.post('/categories/:categoryHandle/delete', adminController.postDeleteCategory)

// Products
router.get('/products', adminController.getProducts)
router.get('/products/new', adminController.getCreateProduct)
router.get('/products/:productId', adminController.getEditProduct)
router.post('/products', adminController.postProduct)
router.post('/products/:productId/edit', adminController.postProduct)
router.post('/products/:productId/delete', adminController.deleteProduct)


// Orders
router.get('/orders', adminController.getOrders)
router.get('/orders/:orderId', adminController.getOrder)
router.post('/orders/:orderId', adminController.postOrder)


// Users
router.get('/users', adminController.getUsers)

// Pages
router.get('/pages', adminController.getPages)
router.get('/pages/new', adminController.getPageCreation)
router.get('/pages/:pageHandle/edit', adminController.getPageEdition)
router.post('/pages',  adminController.postCreatePage)
router.post('/pages/:pageHandle',  adminController.postEditPage)
router.post('/pages/:pageHandle/delete',  adminController.postDeletePage)

module.exports = router