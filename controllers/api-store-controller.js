const Cart = require('../models/cart')
const Category = require('../models/Category')
const Product = require('../models/Product')
const Page = require('../models/Page')
const stdRes = require('../utils/standard-response')

const cartTemplate = require('../models/templates/cart')
const productTemplate = require('../models/templates/product')
const categoryTemplate = require('../models/templates/category')
const pageTemplate = require('../models/templates/page')

// Get products
exports.getProducts = async (req, res, next) => {
  try{
      const productFound = await Product.find({ publish:'true' })

      res.json({ 
          success: true,
          product: productFound
        })
  }catch(error){
      stdRes._500(res, error.message)
  }
}

exports.getProductDetails = async (req, res, next) => {
  try{
      let productId = req.params.productId
      const productFound = await Product.findOne({ _id: productId, publish:'true' })

      res.json({ 
          success: true,
          product: productTemplate(productFound)
        })
  }catch(error){
      stdRes._500(res, error.message)
  }
}


// Get categories
exports.getCategories = async (req, res, next) => {
  try{
      const categoryFound = await Category.find().populate('products')

      res.json({ 
          success: true,
          category: categoryFound
        })
  }catch(error){
      stdRes._500(res, error.message)
  }
}

exports.getCategoryDetails = async (req, res, next) => {
  try{
      let categoryHandle = req.params.categoryHandle

      const categoryFound = await Category.findOne({ handle: categoryHandle }).populate('products')

      res.json({ 
          success: true,
          category: categoryTemplate(categoryFound)
        })
  }catch(error){
      stdRes._500(res, error.message)
  }
}

// Get pages
exports.getPages = async (req, res, next) => {
  try{
      const pageFound = await Page.find()

      res.json({ 
          success: true,
          page: pageFound
        })
  }catch(error){
      stdRes._500(res, error.message)
  }
}

exports.getPageDetails = async (req, res, next) => {
  try{

      let pageId = req.params.pageId

      const pageFound = await Page.findOne({ _id: pageId })

      res.json({ 
          success: true,
          page: pageTemplate(pageFound)
        })
  }catch(error){
      stdRes._500(res, error.message)
  }
} 

// Post Cart
exports.postCart = async (req, res, next) => {
  try{
    let productId = req.body.productId
    let quantity = req.body.quantity
    
    const productFound = await Product.findOne({_id:productId,publish:'true'})
    if(!productFound) return stdRes._400(res, 'productId', 'Either Product Id is not valid or product is not published.')

    const matchProduct = await Cart.findOne({productId:productFound._id})
    if(matchProduct) newQuantity = parseInt(quantity) + parseInt(matchProduct.quantity)

    await Cart.updateOne({_id:matchProduct._id},{quantity:newQuantity})
    const product = await Product.findById(productId).select('title price stock shippingCost imagePaths')
    
    let response = {
      product,
      newQuantity
    }
    stdRes._200(res, { cart: cartTemplate(response) })
  
  } catch (error) { stdRes._500(res, error.message) }
}

exports.postCheckout = async (req, res, next) => {
  try{
    req.session.shipping = {
      firstName: req.body.firstName,
      lastname: req.body.lastname,
      email: req.body.email,
      address: req.body.address,
      state: req.body.state,
      city: req.body.city,
      zip: req.body.zip
    }
    stdRes._200(res)
      
  } catch (error) { stdRes._500(res, error.message) }
}

exports.postSubscribe = async (req, res, next) => {
  try {
    let email = req.body.email
    const duplicateEmail = await Subscription.findOne({ email })
    if (duplicateEmail) return stdRes._400(res, 'email', 'You are already subscribed!')
    let subscriptor = new Subscription({ email })
    await subscriptor.save()
    stdRes._200(res)

  } catch (error) { stdRes._500(res, error.message) }
}