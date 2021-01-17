const fs = require('fs')
const multer = require('multer')

const Product = require('../models/Product')
const Page = require('../models/Page')
const Order = require('../models/Order')
const Category = require('../models/Category')
const rootPath = require('../utils/root-path')
const prefills = require('../utils/prefills')
const User = require('../models/User')
const { isNull } = require('util')

// General

exports.getDashboard = (req, res, next) => {
  Order.find({ status: 'new' })
  .then(newOrders => {
    res.render('admin/dashboard.ejs', { newOrders })
  })  
}

// Customize

exports.getCustomize = async (req, res, next) => {
  const categories = await Category.find()
  res.render('admin/customize.ejs', { categories })
}

exports.postCustomize = (req, res, next) => {
  // global variable

  console.log(req.body.homepageCategory)
  console.log(req.body.homepageCategoryAltTitle)
  PREFERENCES = {
    storeName: req.body.storeName,
    headerMenu: req.body.headerMenuText?.map((text, index) => {
      return {
        text: text,
        link: req.body.headerMenuLink[index],
        classes: req.body.headerMenuClasses[index]
      }
    }),
    homepage: {
      title: req.body.homepageTitle
    },
    footerMenu: req.body.footerMenuText?.map((text, index) => {
      return {
        text: text,
        link: req.body.footerMenuLink[index],
        classes: req.body.footerMenuClasses[index]
      }
    }),
    footerMessage: req.body.footerMessage
  }

  const homepageCategoryIds = req.body.homepageCategory
  const homepageCategoryAltTitle = req.body.homepageCategoryAltTitle
  
  if (homepageCategoryIds) {
    PREFERENCES.homepage.categories = []
    homepageCategoryIds.forEach((categoryId, index) => { 
      PREFERENCES.homepage.categories.push({
        id: categoryId,
        altTitle: homepageCategoryAltTitle[index] || undefined 
      })
    })
  }

  fs.writeFileSync(rootPath('data', 'preferences.json'), JSON.stringify(PREFERENCES))
  res.redirect('/admin/customize')
}

// Categories

exports.getCategories = (req, res, next) => {
  Category.find()
  .then(categories => {
    res.render('admin/categories.ejs', { categories })
  })
  .catch(err => {
    console.log(err)
  })
}

exports.getNewCategory = (req, res, next) => {
  Product.find()
    .then(products => {
      res.render('admin/category.ejs', { category: null, products: products })
    })
    .catch(err => {
      console.log(err)
    })
}

exports.getEditCategory = (req, res, next) => {
  Category.findOne({ handle: req.params.categoryHandle})
  .then(category => {
    this.category = category
    return Product.find()
  })
  .then(products => {
    // TODO: add convenient way to add category to product
    res.render('admin/category.ejs', { category: this.category, products })
  })
  .catch(err => {
    console.log(err)
  })
}

exports.postNewCategory = (req, res, next) => {
  let category = new Category({
    title: req.body.title,
    handle: req.body.handle,
    description: req.body.description,
    products: req.body.products,
    listed: req.body.listed == 'on',
    featured: req.body.featured == 'on'
  })

  category.save()
    .then(result => {
      // console.log(result)
      res.redirect('/admin/categories')
    })
    .catch(err => console.log(err))
}

exports.postEditCategory = (req, res, next) => {
  Category.findOne({ handle: req.params.categoryHandle})
    .then(category => {
      category.title = req.body.title
      category.handle = req.body.handle
      category.description = req.body.description
      category.products = req.body.products
      category.listed = req.body.listed == 'on'
      category.featured = req.body.featured == 'on'
      return category.save()
    })
    .then(result => {
      res.redirect('/admin/categories')
    })
    .catch(err => {
      console.log(err)
    })
}

exports.postDeleteCategory = (req, res, next) => {
  Category.findOneAndRemove(req.params.categoryHandle)
  .then(result => {
    res.redirect('/admin/categories')
  })
  .catch(err => console.log(err))
}


// Products

const ITEMS_PER_PAGE = 10

// TODO: make it scalable with a mongoose plugin or just use mongoose paginate
// paginate = model => {
//   promise = new Promise((resolve, reject) => {
//     model.find().countDocuments()
//       .then(numProducts => {
//         this.paginate = {
//           perPage: ITEMS_PER_PAGE,
//           pageCount: Math.ceil(numProducts / ITEMS_PER_PAGE),
//           itemsCount: numProducts,
//           currentPage: page
//         }
//         resolve(model.find()
//           .skip((page - 1) * ITEMS_PER_PAGE)
//           .limit(ITEMS_PER_PAGE))
//       })
//       .catch(error => {
//         reject(error)
//       })
//   })
// }

exports.getProducts = (req, res, next) => {
  const page = parseInt(req.query.page || 1) 
  let paginate;

  Product.find().countDocuments()
    .then(numProducts => {
      paginate = {
        perPage: ITEMS_PER_PAGE,
        pageCount: Math.ceil(numProducts / ITEMS_PER_PAGE),
        itemsCount: numProducts,
        currentPage: page
      }
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
    })
    .then(products => {
      res.render('admin/products.ejs', { 
        products, 
        paginate 
      })
    })
    .catch(err => console.log(err))
}

exports.getCreateProduct = (req, res, next) => {
  Category.find()
    .then(allCategories => {
      const prefill = prefills.retrive(req);
      (prefill._returnStatus? res.status(prefill._returnStatus) : res).render('admin/product.ejs',  {
        prefill,
        product: undefined, 
        allCategories 
      })
    })
}

exports.getEditProduct = (req, res, next) => {
  Product.findById(req.params.productId)
    .then(product => {
      this.product = product
      return Category.find()
    })
    .then(allCategories => {
      const prefill = prefills.retrive(req);
      (prefill._returnStatus? res.status(prefill._returnStatus) : res).render('admin/product.ejs', { 
        prefill,
        product: this.product, 
        allCategories: allCategories,
      })
    })
    .catch(err => console.log(err))
}

const fileStorage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, 'images')
  },
  filename(req, file, callback) {
    callback(null, Date.now().toString() + '-' + file.originalname)
  }
})

const fileFilter = (req, file, callback) => {
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg')
    callback(null, true)
  else callback(null, false)
}

const upload = multer({ storage: fileStorage, fileFilter })

exports.productFileUpload = upload.fields([
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },
  { name: 'image4', maxCount: 1 },
  { name: 'image5', maxCount: 1 }
])

exports.postProduct = (req, res, next) => {
  const files = req.files

  allValid = true
  const prefill = {}
  Object.entries(req.body).forEach(entry => prefill[entry[0]] = { value: entry[1] })
  
  let title;
  let price;
  let compareAt;
  let shippingCost;
  let stock;
  let publish = req.body.publish == 'on'
  let description = req.body.description

  const productId = req.params.productId

  if (req.body.title) {
    title = req.body.title.trim()
  } else {
    allValid = false
    prefill.title.error = 'Must provide a title for the product'
  }
  if (req.body.price) {
    price = parseFloat(req.body.price)
    if (price <= 0) {
      allValid = false
      prefill.price.error = 'The price must be higher than 0'
    }
  } else {
    allValid = false
    prefill.price.error = 'Must provide a title for the product'
  }
  if (price && req.body.compareAt) {
    compareAt = parseFloat(req.body.compareAt)
    if (price >= compareAt) {
      allValid = false
      prefill.compareAt.error = 'It has be higher than the price'
    }
  }
  if (req.body.shippingCost) {
    shippingCost = parseFloat(req.body.shippingCost)
    if (shippingCost < 0) {
      allValid = false
      prefill.shippingCost.error = 'Shipping cost can not be negative'
    }
  } else {
    allValid = false
    prefill.shippingCost.error = 'A shipping cost (0 or higher) must be provided'
  }
  if (req.body.stock) {
    stock = parseInt(req.body.stock)
    if (stock < 0) {
      allValid = false
      prefill.stock.error = 'Shipping cost can not be negative'
    }
  } else {
    allValid = false
    prefill.stock.error = 'Stock must be 0 or more'
  }

  if (!allValid) {
    prefill._returnStatus = 422
    req.flash('prefill', prefill)
    res.redirect(productId? `/admin/products/${req.params.productId}` : '/admin/products/new') // here there is a folk
  } else {

    let productPromise

    if (!productId) {
      productPromise = new Product({
        title: title,
        description: description,
        imagePaths: files? Object.values(files).map(fileArray => '/' + fileArray[0].destination + '/' + fileArray[0].filename) : [],
        price: price,
        compareAt: compareAt,
        shippingCost: shippingCost,
        stock: stock,
        publish: publish
      }).save()
        .then(product => product.categories(req.body.categories))
    } else {
      productPromise = Product.findById(req.params.productId)
        .then(product => {
          product.title = title
          product.price = price
          product.compareAt = compareAt
          product.shippingCost = shippingCost
          product.stock = stock
          product.description = description
          product.publish = publish
          this.product = product 
          return product.save()
      })
        .then(() => this.product.categories())
        .then(oldCategories => {
          const oldCategoryIds = oldCategories.map(category => category.id)
          const newCategoryIds = req.body.categories || []
          
          let toAddCategoryIds = newCategoryIds.filter(x => oldCategoryIds.indexOf(x) < 0 )
          this.toRemoveCategoryIds = oldCategoryIds.filter(x => newCategoryIds.indexOf(x) < 0 )

          return Category.updateMany({
            '_id': { $in: toAddCategoryIds }},
            {'$push': { products: this.product._id } }
          )
        })
        .then(() => Category.updateMany({
          '_id': { $in: this.toRemoveCategoryIds }},
          {'$pull': { products: this.product._id } })
        )
    }
    productPromise
      .then(() => {
        res.redirect('/admin/products')
      })
      .catch(err => {
        console.log(err)
      })
  }
}

exports.deleteProduct = (req, res, next) => {
  Category.updateMany({ products: req.params.productId }, {'$pull': { products: req.params.productId } })
    .then(() => Product.findByIdAndRemove(req.params.productId))
    .then(() => {
      res.redirect('/admin/products')
    })
    .catch(err => console.log(err))
}

// Orders

exports.getOrders = (req, res, next) => {
  Order.find()
    .then(orders => {
      res.render('admin/orders.ejs', { orders })
    })  
}

exports.getOrder = (req, res, next) => {
  Order.findById(req.params.orderId)
    .then(order => {
      res.render('admin/order.ejs', { order })
    })
    .catch(error => {
      console.log(error)
      next()
    })
}

exports.postOrder = (req, res, next) => {
  Order.findById(req.params.orderId)
    .then(order => {
      order.status = req.body.status
      if (req.body.tracking) order.shipping.tracking = req.body.tracking
      return order.save()
    })
    .then(result => {
      res.redirect(`/admin/orders/${req.params.orderId}`)
    })
    .catch(error => {
      console.log(error)
      next()
    })
}

// Users

exports.getUsers = (req, res, next) => {
  User.find({ admin: null })
    .then(customers => {
      this.customers = customers
      return User.find({ admin: { $ne: null } })
    })
    .then(admins => {
      res.render('admin/users.ejs', { admins, customers: this.customers })
    })
    .catch(error => {
      console.log(error)
    })
}


// Pages

exports.getPages = (req, res, next) => {
  Page.find()
  .then(pages => {
    res.render('admin/pages.ejs', { pages })
  })
  .catch(err => console.log(err))
  
}

exports.getPageCreation = (req, res, next) => {
  res.render('admin/page.ejs', { page: null })
}

exports.getPageEdition = (req, res, next) => {
  Page.findOne({handle: req.params.pageHandle})
    .then(page => {
      res.render('admin/page.ejs', { page })
    })
    .catch(err => console.log(err))
}

exports.postCreatePage = (req, res, next) => {
  
  console.log(req.body)
  let page = new Page({
    title: req.body.title,
    handle: req.body.handle,
    content: req.body.content
  })

  page.save()
    .then(result => {
      res.redirect('/admin/pages')
    })
    .catch(err => console.log(err))
}


exports.postEditPage = (req, res, next) => {
  Page.findOne({handle: req.params.pageHandle})
    .then(page => {
      page.title = req.body.title
      page.handle = req.body.handle
      page.content = req.body.content
      return page.save()
    })
    .then(result => {
      res.redirect('/admin/pages')
    })
    .catch(err => {
      console.log(err)
    })
}

exports.postDeletePage = (req, res, next) => {
  Page.deleteOne({handle: req.params.pageHandle})
    .then(result => {
      res.redirect('/admin/pages')
    })
    .catch(err => console.log(err))
}