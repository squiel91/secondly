const mongoose = require('mongoose')
const Category = require('./Category')

const Schema = mongoose.Schema

const productSchema = new Schema({
  title: {
    type: String,
    require: true,
    index: true
  },
  description: {
    type: String,
    index: true
  },
  imagePaths: [String],
  price: {
    type: Number,
    require: true
  },
  compareAt: Number,
  shippingCost: {
    type: Number,
    require: true
  },
  stock: {
    type: Number,
    require: true
  },
  publish: {
    type: Boolean,
    default: false
  }
})

productSchema.methods.categories = function(categoriesIds) {
  if (categoriesIds) {
    return Promise.all(
      categoriesIds.map(categoryId => Category.findByIdAndUpdate(categoryId, {'$addToSet': { products: this._id } }))
    )
  } else {
    // this should be optimized having the categories in the mirrored in the products
    return Category.find({ products: this._id })
  }
}

module.exports = mongoose.model('Product', productSchema)