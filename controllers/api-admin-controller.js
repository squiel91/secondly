const bcrypt = require('bcryptjs')

const Page = require('../models/Page')
const Category = require('../models/Category')
const Product = require('../models/Product')
const User = require('../models/User')

const stdRes = require('../utils/standard-response')

// Templates
const pageTemplate = require('../models/templates/page')
const categoryTemplate = require('../models/templates/category')
const productTemplate = require('../models/templates/product')
const userTemplate = require('../models/templates/user')

// Admin authentication
exports.adminAuth = async (req, res, next) => {
  if (req.session.userId) {
    req.user = await User.findById(req.session.userId)
    if (req.user.admin) next()
    else {
      return res
        .status(401)
        .json({ error: true, message: 'Only admin access' })
    }
  } else {
    return res
      .status(401)
      .json({ error: true, message: 'You need to be authenticated as an admin' })
  }
}

// Page
exports.postPage = async (req, res, next) => {
  try {
    let page = new Page({
      title: req.body.title,
      handle: req.body.handle,
      content: req.body.content || undefined
    })
    page = await page.save()
    res.json({
      success: true,
      page: pageTemplate(page)
    })
  } catch (error) { stdRes._500(res, error.message) }
}

exports.patchPage = async (req, res, next) => {
  try {
    const pageId = req.params.pageId

    const updatedData = req.body
    const page = await Page.findByIdAndUpdate(pageId, updatedData, { new: true })
    res.json({
      success: true,
      page: pageTemplate(page)
    })
  } catch (error) { stdRes._500(res, error.message) }
}

exports.deletePage = async (req, res, next) => {
  try {
    await Page.findByIdAndDelete(req.params.pageId)
    res.json({ success: true })
  } catch (error) { stdRes._500(res, error.message) }
}

// Categories
exports.postCategory = async (req, res, next) => {
  try {
    let category = new Category({
      title: req.body.title,
      handle: req.body.handle,
      description: req.body.description,
      products: req.body.products,
      listed: req.body.listed,
      featured: req.body.featured
    })
    category = await category.save()
    res.json({
      success: true,
      category: categoryTemplate(category)
    })
  } catch (error) { stdRes._500(res, error.message) }
}

exports.patchCategory = async (req, res, next) => {
  try {
    const categoryId = req.params.categoryId

    const category = await Category.findByIdAndUpdate(
      categoryId,
      req.body,
      { new: true }
    )
    res.json({
      success: true,
      category: categoryTemplate(category)
    })
  } catch (error) { stdRes._500(res, error.message) }
}

exports.deleteCategory = async (req, res, next) => {
  try {
    const categoryId = req.params.categoryId

    await Category.findByIdAndDelete(categoryId)
    res.json({ success: true })
  } catch (error) { stdRes._500(res, error.message) }
}

// Product
exports.postProduct = async (req, res, next) => {
  try {
    let product = new Product({
      title: req.body.title,
      description: req.body.description,
      price: req.body.price,
      compareAt: req.body.compareAt,
      imagePaths: req.body.imagePaths,
      categories: req.body.categories,
      shippingCost: req.body.shippingCost,
      stock: req.body.stock,
      publish: req.body.publish
    })
    product = await product.save()
    await product.categories(req.body.categories)
    res.json({
      success: true,
      product: productTemplate(product)
    })
  } catch (error) { stdRes._500(res, error.message) }
}

exports.patchProduct = async (req, res, next) => {
  try {
    const productId = req.params.productId

    const product = await Product.findByIdAndUpdate(productId, req.body, { new: true })
    res.json({
      success: true,
      product: productTemplate(product)
    })
  } catch (error) { stdRes._500(res, error.message) }
}

exports.deleteProduct = async (req, res, next) => {
  try {
    await Product.findByIdAndDelete(req.params.productId)
    res.json({ success: true })
  } catch (error) { stdRes._500(res, error.message) }
}

// User
exports.postUser = async (req, res, next) => {
  try {
    const email = req.body.email
    const duplicatedUser = await User.findOne({ email })
    if (duplicatedUser) return stdRes._400(res, 'email', 'There is already an user with that email')

    const passHash = await bcrypt.hash(req.body.password, 10)

    // TODO: add the owner param and check if the logged in user is a owner also.
    let user = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email,
      admin: req.body.admin,
      passHash
    })
    user = await user.save()
    res.json({
      success: true,
      user: userTemplate(user)
    })
  } catch (error) { stdRes._500(res, error.message) }
}

exports.patchUser = async (req, res, next) => {
  try {
    // TODO: owner users cannot be change back to not admins
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      req.body,
      { upsert: true }
    )
    res.json({
      success: true,
      user: userTemplate(user)
    })
  } catch (error) { stdRes._500(res, error.message) }
}

exports.deleteUser = async (req, res, next) => {
  try {
    // TODO: owner users cannot be removed
    await User.findByIdAndDelete(req.params.userId)
    res.json({ success: true })
  } catch (error) { stdRes._500(res, error.message) }
}
