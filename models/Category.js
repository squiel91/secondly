const mongoose = require('mongoose')

const Schema = mongoose.Schema

const userSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  handle: {
    type: String,
    required: true
  },
  description: String,
  products: [
    { 
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    }
  ]
})

module.exports = mongoose.model('Category', userSchema)
