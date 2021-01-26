const mongoose = require('mongoose')
 
const Schema = mongoose.Schema
 
const cartSchema = new Schema({
  productId: { 
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: String,
    required: true
  }
})
 
module.exports = mongoose.model('Cart', cartSchema)