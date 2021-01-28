const bcrypt = require('bcryptjs')

const Page = require('../models/Page')
const Category = require('../models/Category')
const Product = require('../models/Product')
const User = require('../models/User')

const stdRes = require('../utils/standard-response')

const pageTemplate = require('../models/templates/page')
const categoryTemplate = require('../models/templates/category')
const productTemplate = require('../models/templates/product')
const userTemplate = require('../models/templates/user')

// Admin authentication
exports.adminAuth = async (req, res, next) => {
  
    if (req.session.userId) {
      req.user = await User.findById(req.session.userId)
      if(!req.user.admin) return  res.status(401).json({error:true, message:'Only admin access'})
    } else {
      req.sessionCart = SessionCart.load(req.session)
    }
    next()
  }
 
// Page
exports.postPage = async (req, res, next) => {
    try{
        const title = req.body.title
        const handle = req.body.handle
        const content = req.body.content
      
        let page = new Page({
            title,
            handle,
            content
        })
        page = await page.save()
        res.json({ 
            success: true,
            page: pageTemplate(page)
          })
    }catch(error){
        stdRes._500(res, error.message)
    }
}

exports.patchPage = async (req, res, next) => {
    try{
        const pageId = req.params.pageId
    
        const updatedData = req.body
        const page = await Page.findByIdAndUpdate(pageId, updatedData, {new:true, upsert:true})
        res.json({ 
            success: true,
            page: pageTemplate(page)
        })
    }catch(error){
        stdRes._500(res, error.message)
    }
}

exports.deletePage = async (req, res, next) => {
    try{
        const pageId = req.params.pageId
    
        await Page.findByIdAndDelete(pageId)
        res.json({ success: true })
    }catch(error){
        stdRes._500(res, error.message)
    }
}

// Categories 
exports.postCategory = async (req, res, next) => {
    try{
        const title = req.body.title
        const handle = req.body.handle
        const description = req.body.description
        const products = req.body.products
        const listed = req.body.listed
        const featured = req.body.featured
      
        let category = new Category({
            title,
            handle,
            description,
            products,
            listed,
            featured
        })
        category = await category.save()
        res.json({ 
            success: true,
            category: categoryTemplate(category)
          })
    }catch(error){
        stdRes._500(res, error.message)
    }
}

exports.patchCategory = async (req, res, next) => {
    try{
        const categoryId = req.params.categoryId
    
        const category = await Category.findByIdAndUpdate(categoryId, req.body, {new:true, upsert:true})
        res.json({ 
            success: true,
            category: categoryTemplate(category)
        })
    }catch(error){
        stdRes._500(res, error.message)
    }
}

exports.deleteCategory = async (req, res, next) => {
    try{
        const categoryId = req.params.categoryId
    
        await Category.findByIdAndDelete(categoryId)
        res.json({ success: true })
    }catch(error){
        stdRes._500(res, error.message)
    }
}

// Product 
exports.postProduct = async (req, res, next) => {
    try{
        const title = req.body.title
        const description = req.body.description
        const price = req.body.price
        const compareAt = req.body.compareAt
        const imagePaths = req.body.imagePaths
        const categories = req.body.categories
        const shippingCost = req.body.shippingCost
        const stock = req.body.stock
        const publish = req.body.publish
      
        let product = new Product({
            title,
            description,
            price,
            compareAt,
            imagePaths,
            categories,
            shippingCost,
            stock,
            publish
        })
        product = await product.save()
        product.categories(categories)
        res.json({ 
            success: true,
            product: productTemplate(product)
          })
    }catch(error){
        stdRes._500(res, error.message)
    }
}

exports.patchProduct = async (req, res, next) => {
    try{
        const productId = req.params.productId
    
        const product = await Product.findByIdAndUpdate(productId, req.body, {new:true, upsert:true})
        res.json({ 
            success: true,
            product: productTemplate(product)
        })
    }catch(error){
        stdRes._500(res, error.message)
    }
}

exports.deleteProduct = async (req, res, next) => {
    try{
        const productId = req.params.productId
    
        await Product.findByIdAndDelete(productId)
        res.json({ success: true })
    }catch(error){
        stdRes._500(res, error.message)
    }
}

// User 
exports.postUser = async (req, res, next) => {
    try{
        const firstName = req.body.firstName
        const lastName = req.body.lastName
        const email = req.body.email
        const admin = req.body.admin
        const password = req.body.password

        const duplicatedUser = await User.findOne({ email })
        if (duplicatedUser) return stdRes._400(res, 'email', 'There is already an user with that email')
    
        const passHash = await bcrypt.hash(password, 10)

        let user = new User({
            firstName,
            lastName,
            email,
            admin,
            passHash
        })
        user = await user.save()
        res.json({ 
            success: true,
            user: userTemplate(user)
          })
    }catch(error){
        stdRes._500(res, error.message)
    }
}

exports.patchUser = async (req, res, next) => {
    try{
        const userId = req.params.userId
    
        const user = await User.findByIdAndUpdate(userId, req.body, {new:true, upsert:true})
        res.json({ 
            success: true,
            user: userTemplate(user)
        })
    }catch(error){
        stdRes._500(res, error.message)
    }
}

exports.deleteUser = async (req, res, next) => {
    try{
        const userId = req.params.userId
    
        await User.findByIdAndDelete(userId)
        res.json({ success: true })
    }catch(error){
        stdRes._500(res, error.message)
    }
}
